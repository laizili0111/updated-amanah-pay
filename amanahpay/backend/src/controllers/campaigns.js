const { Campaign, Charity, Donation, User, sequelize } = require('../models');
const blockchainService = require('../services/blockchain');
const uploadService = require('../services/upload');
const authService = require('../services/auth');
const { Op } = require('sequelize');

// Create a new campaign
const createCampaign = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      target_amount, 
      start_date, 
      end_date, 
      charity_id,
      image_url,
      category
    } = req.body;
    
    // Validate charity exists
    const charity = await Charity.findByPk(charity_id);
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    // Register campaign on blockchain
    const tx = await blockchainService.createCampaign(
      name,
      target_amount,
      start_date,
      end_date,
      charity.wallet_address
    );
    
    // Create campaign in database
    const campaign = await Campaign.create({
      name,
      description,
      target_amount,
      start_date,
      end_date,
      charity_id,
      image_url,
      category,
      status: 'active',
      contract_address: tx.events.CampaignCreated.args.campaignAddress,
      transaction_hash: tx.hash
    });
    
    res.status(201).json({
      success: true,
      data: {
        campaign,
        transaction: {
          hash: tx.hash,
          blockNumber: tx.blockNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all campaigns with optional filters
const getAllCampaigns = async (req, res, next) => {
  try {
    const { 
      status, 
      category, 
      charity_id, 
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query conditions
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (charity_id) {
      whereClause.charity_id = charity_id;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Execute query
    const { count, rows: campaigns } = await Campaign.findAndCountAll({
      where: whereClause,
      include: [
        { model: Charity, attributes: ['id', 'name', 'logo_url'] }
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate progress for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const totalDonations = await Donation.sum('amount', {
          where: { campaign_id: campaign.id }
        }) || 0;
        
        const donorCount = await Donation.count({
          distinct: true,
          col: 'user_id',
          where: { campaign_id: campaign.id }
        });
        
        return {
          ...campaign.get({ plain: true }),
          stats: {
            total_raised: totalDonations,
            progress_percentage: Math.min(
              Math.round((totalDonations / campaign.target_amount) * 100),
              100
            ),
            donor_count: donorCount
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        campaigns: campaignsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific campaign by ID
const getCampaign = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    // Fetch campaign with charity
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { model: Charity, attributes: ['id', 'name', 'description', 'logo_url', 'wallet_address'] }
      ]
    });
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    // Get campaign statistics
    const stats = await getCampaignStats(campaignId);
    
    // Get recent donations
    const recentDonations = await Donation.findAll({
      where: { campaign_id: campaignId },
      include: [
        { model: User, attributes: ['id', 'name', 'avatar_url'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    // Get on-chain data
    const onChainData = await blockchainService.getCampaignData(campaign.contract_address);
    
    res.json({
      success: true,
      data: {
        campaign: {
          ...campaign.get({ plain: true }),
          stats,
          recent_donations: recentDonations,
          blockchain_data: onChainData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a campaign
const updateCampaign = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.id);
    const {
      name,
      description,
      image_url,
      category,
      status
    } = req.body;
    
    // Find campaign
    const campaign = await Campaign.findByPk(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    // Update campaign
    await campaign.update({
      name: name || campaign.name,
      description: description || campaign.description,
      image_url: image_url || campaign.image_url,
      category: category || campaign.category,
      status: status || campaign.status
    });
    
    // If status changed to 'paused' or 'cancelled', update on blockchain
    if (status && (status === 'paused' || status === 'cancelled') && campaign.status === 'active') {
      await blockchainService.updateCampaignStatus(
        campaign.contract_address,
        status
      );
    }
    
    res.json({
      success: true,
      data: {
        campaign
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get campaign statistics
const getCampaignStats = async (campaignId) => {
  // Total amount raised
  const totalRaised = await Donation.sum('amount', {
    where: { campaign_id: campaignId }
  }) || 0;
  
  // Number of unique donors
  const donorCount = await Donation.count({
    distinct: true,
    col: 'user_id',
    where: { campaign_id: campaignId }
  });
  
  // Total number of donations
  const donationCount = await Donation.count({
    where: { campaign_id: campaignId }
  });
  
  // Donation amount by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const donationsByDay = await Donation.findAll({
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('created_at')), 'day'],
      [sequelize.fn('sum', sequelize.col('amount')), 'total']
    ],
    where: {
      campaign_id: campaignId,
      created_at: { [Op.gte]: thirtyDaysAgo }
    },
    group: [sequelize.fn('date_trunc', 'day', sequelize.col('created_at'))],
    order: [sequelize.literal('day ASC')]
  });
  
  // Get campaign to calculate progress
  const campaign = await Campaign.findByPk(campaignId);
  
  return {
    total_raised: totalRaised,
    progress_percentage: campaign
      ? Math.min(Math.round((totalRaised / campaign.target_amount) * 100), 100)
      : 0,
    donor_count: donorCount,
    donation_count: donationCount,
    daily_donations: donationsByDay.map(d => ({
      date: d.getDataValue('day'),
      amount: parseFloat(d.getDataValue('total'))
    }))
  };
};

// Get top campaigns
const getTopCampaigns = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get active campaigns with their total donations
    const campaigns = await Campaign.findAll({
      where: { status: 'active' },
      include: [
        { model: Charity, attributes: ['id', 'name', 'logo_url'] }
      ],
      limit: parseInt(limit)
    });
    
    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await getCampaignStats(campaign.id);
        return {
          ...campaign.get({ plain: true }),
          stats
        };
      })
    );
    
    // Sort by total raised
    campaignsWithStats.sort((a, b) => b.stats.total_raised - a.stats.total_raised);
    
    res.json({
      success: true,
      data: campaignsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// Get campaigns by charity
const getCharityCampaigns = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.charityId);
    
    // Check if charity exists
    const charity = await Charity.findByPk(charityId);
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    // Get campaigns
    const campaigns = await Campaign.findAll({
      where: { charity_id: charityId },
      order: [['created_at', 'DESC']]
    });
    
    // Get stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await getCampaignStats(campaign.id);
        return {
          ...campaign.get({ plain: true }),
          stats
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        charity,
        campaigns: campaignsWithStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donations for campaign
const getCampaignDonations = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await Campaign.findByPk(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    const donations = await Donation.findAll({
      where: { campaign_id: campaignId },
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// Upload campaign image
const uploadCampaignImage = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        {
          model: Charity,
          attributes: ['id', 'admin_user_id']
        }
      ]
    });
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    // Verify user is charity admin
    const isCharityAdmin = await authService.isCharityAdmin(req.user.id, campaign.charity_id);
    const isPlatformAdmin = await authService.isAdmin(req.user.id);
    
    if (!isCharityAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to update this campaign'
      });
    }
    
    // Process uploaded file
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No image uploaded'
      });
    }
    
    const fileData = {
      ...req.file,
      entityType: 'CAMPAIGN',
      entityId: campaignId
    };
    
    const file = await uploadService.saveFileRecord(fileData, req.user.id);
    
    // Update campaign image URL
    campaign.image_url = file.fileUrl;
    await campaign.save();
    
    res.json({
      success: true,
      data: {
        campaign,
        file
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaign,
  updateCampaign,
  getCampaignDonations,
  uploadCampaignImage,
  getTopCampaigns,
  getCharityCampaigns
}; 