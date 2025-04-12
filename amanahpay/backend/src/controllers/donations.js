const { Donation, Campaign, Round, User, Certificate } = require('../models');
const blockchainService = require('../services/blockchain');
const { ethers } = require('ethers');
const db = require('../config/db');
const quadraticFunding = require('../utils/quadraticFunding');

// Create a new donation
exports.createDonation = async (req, res, next) => {
  try {
    const { campaign_id, amount, fiat_amount, fiat_currency } = req.body;
    
    // Verify campaign exists and is active
    const campaign = await Campaign.findByPk(campaign_id);
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    if (!campaign.is_active) {
      return res.status(400).json({
        error: true,
        message: 'Campaign is not active'
      });
    }
    
    // Get current round
    const currentRound = await Round.findOne({
      where: {
        start_time: { [Round.sequelize.Op.lt]: new Date() },
        end_time: { [Round.sequelize.Op.gt]: new Date() },
        is_distributed: false
      }
    });
    
    if (!currentRound) {
      return res.status(400).json({
        error: true,
        message: 'No active funding round'
      });
    }
    
    // Convert amount to wei
    const donationAmount = ethers.parseEther(amount.toString());
    
    // Send donation to blockchain
    const tx = await blockchainService.donate(campaign_id, donationAmount);
    
    // Create donation record in database
    const donation = await Donation.create({
      user_id: req.user.id,
      donor_address: req.user.wallet_address,
      campaign_id,
      round_id: currentRound.id,
      amount: donationAmount.toString(),
      fiat_amount,
      fiat_currency: fiat_currency || 'MYR',
      transaction_hash: tx.hash
    });
    
    // Update campaign total donations
    campaign.total_donations = (BigInt(campaign.total_donations) + donationAmount).toString();
    await campaign.save();
    
    // Update round total donations
    currentRound.total_donations = (BigInt(currentRound.total_donations) + donationAmount).toString();
    await currentRound.save();
    
    res.status(201).json({
      success: true,
      data: {
        donation,
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

// Confirm donation after payment
exports.confirmDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_id, payment_status } = req.body;
    
    const donation = await Donation.findByPk(id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.is_confirmed) {
      return res.status(400).json({
        success: false,
        message: 'Donation already confirmed'
      });
    }
    
    if (payment_status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
    
    // Update donation status
    donation.is_confirmed = true;
    donation.payment_id = payment_id;
    donation.confirmed_at = new Date();
    await donation.save();
    
    // Generate certificate for large donations
    if (ethers.formatEther(donation.amount) >= 0.5) {
      const certificate = await Certificate.create({
        donation_id: donation.id,
        user_id: donation.user_id,
        campaign_id: donation.campaign_id,
        issued_at: new Date()
      });
      
      donation.certificate_id = certificate.id;
      await donation.save();
    }
    
    return res.status(200).json({
      success: true,
      data: {
        donation,
        message: 'Donation confirmed successfully'
      }
    });
  } catch (error) {
    console.error('Error confirming donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user donations
exports.getUserDonations = async (req, res, next) => {
  try {
    // Check if user exists and has id
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or invalid user data'
      });
    }
    
    const userId = req.user.id;
    
    const donations = await Donation.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Campaign,
          attributes: ['id', 'name', 'image_url', 'charity_id']
        },
        {
          model: Certificate,
          required: false
        }
      ],
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

// Get all donations
exports.getAllDonations = async (req, res, next) => {
  try {
    // Add query parameters for filtering
    const { campaign_id, user_id, round_id } = req.query;
    
    const whereClause = {};
    
    if (campaign_id) {
      whereClause.campaign_id = parseInt(campaign_id);
    }
    
    if (user_id) {
      whereClause.user_id = parseInt(user_id);
    }
    
    if (round_id) {
      whereClause.round_id = parseInt(round_id);
    }
    
    const donations = await Donation.findAll({
      where: whereClause,
      include: [
        {
          model: Campaign,
          attributes: ['id', 'name', 'charity_id']
        },
        {
          model: User,
          attributes: ['id', 'username', 'wallet_address']
        },
        {
          model: Certificate,
          required: false
        }
      ],
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

// Get donation by ID
exports.getDonation = async (req, res, next) => {
  try {
    const donationId = parseInt(req.params.id);
    
    const donation = await Donation.findByPk(donationId, {
      include: [
        {
          model: Campaign,
          attributes: ['id', 'name', 'charity_id']
        },
        {
          model: User,
          attributes: ['id', 'username', 'wallet_address']
        },
        {
          model: Certificate,
          required: false
        }
      ]
    });
    
    if (!donation) {
      return res.status(404).json({
        error: true,
        message: 'Donation not found'
      });
    }
    
    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// Estimate donation impact with quadratic funding
exports.estimateImpact = async (req, res, next) => {
  try {
    const { amount, campaign_id, donor_address } = req.query;
    
    if (!amount || !campaign_id) {
      return res.status(400).json({
        error: true,
        message: 'Amount and campaign_id are required'
      });
    }
    
    // Get current round
    const currentRound = await Round.findOne({
      where: {
        start_time: { [Round.sequelize.Op.lt]: new Date() },
        end_time: { [Round.sequelize.Op.gt]: new Date() },
        is_distributed: false
      }
    });
    
    if (!currentRound) {
      return res.status(400).json({
        error: true,
        message: 'No active funding round'
      });
    }
    
    // Convert amount to wei
    const donationAmount = ethers.parseEther(amount.toString());
    
    // Get current user's address or use provided one
    const address = donor_address || req.user?.wallet_address;
    
    if (!address) {
      return res.status(400).json({
        error: true,
        message: 'Donor address is required'
      });
    }
    
    // Calculate quadratic impact
    const currentMatching = await blockchainService.calculateQuadraticAllocation(address, currentRound.id);
    
    // Simulate donation and recalculate
    // This is a simplified estimation - in production you'd want a more accurate simulation
    const estimatedMatching = currentMatching * 1.5; // Simple estimation
    
    res.json({
      success: true,
      data: {
        round_id: currentRound.id,
        donation_amount: amount,
        matching_pool: ethers.formatEther(currentRound.matching_pool),
        estimated_matching: ethers.formatEther(estimatedMatching),
        impact_multiplier: 1.5 // Simplified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get donations for a specific campaign
exports.getCampaignDonations = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    // Validate campaign exists
    const campaignResult = await db.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [campaignId]
    );
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Get donations for this campaign
    const donationsResult = await db.query(
      `SELECT d.*, u.name as donor_name, u.email as donor_email
       FROM donations d
       JOIN users u ON d.user_id = u.id
       WHERE d.campaign_id = $1
       ORDER BY d.created_at DESC`,
      [campaignId]
    );
    
    return res.status(200).json({
      success: true,
      data: donationsResult.rows
    });
  } catch (error) {
    console.error('Error getting campaign donations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add the getDonationStats function that's referenced in routes
exports.getDonationStats = async (req, res) => {
  try {
    // Get overall donation stats
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        COUNT(DISTINCT user_id) as unique_donors,
        COUNT(DISTINCT campaign_id) as campaigns_supported
       FROM donations
       WHERE is_confirmed = true`
    );
    
    // Get stats by month for the last 6 months
    const monthlyStatsResult = await db.query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as donations_count,
        SUM(amount) as total_amount
       FROM donations
       WHERE is_confirmed = true 
       AND created_at > NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC`
    );
    
    return res.status(200).json({
      success: true,
      data: {
        overview: statsResult.rows[0],
        monthly: monthlyStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Error getting donation stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user donations by user ID
exports.getUserDonationsById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own donations or if admin
    if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view other users\' donations'
      });
    }
    
    const donations = await Donation.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Campaign,
          attributes: ['id', 'name', 'image_url', 'charity_id']
        },
        {
          model: Certificate,
          required: false
        }
      ],
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

/**
 * Estimate the impact of a donation with quadratic funding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.estimateQuadraticImpact = async (req, res, next) => {
  try {
    const { amount, campaignId } = req.body;
    
    if (!amount || !campaignId) {
      return res.status(400).json({
        error: true,
        message: 'Missing required parameters: amount and campaignId are required'
      });
    }
    
    // Find the current active round
    const currentRound = await Round.findOne({
      where: {
        start_time: { [Round.sequelize.Op.lt]: new Date() },
        end_time: { [Round.sequelize.Op.gt]: new Date() },
        is_distributed: false
      }
    });
    
    if (!currentRound) {
      return res.status(404).json({
        error: true,
        message: 'No active funding round found'
      });
    }
    
    // Get the campaign to make sure it exists
    const campaign = await Campaign.findByPk(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    // Get all existing donations for this campaign in this round
    const campaignDonations = await Donation.findAll({
      where: {
        campaign_id: campaignId,
        round_id: currentRound.id
      },
      attributes: ['amount']
    });
    
    // Get all donations for all campaigns in this round
    const allDonations = await Donation.findAll({
      where: {
        round_id: currentRound.id
      },
      attributes: ['amount']
    });
    
    // Extract donation amounts
    const existingDonations = campaignDonations.map(d => d.amount.toString());
    const allDonationAmounts = allDonations.map(d => d.amount.toString());
    
    // Calculate the impact
    const impact = quadraticFunding.estimateDonationImpact(
      amount,
      existingDonations,
      allDonationAmounts,
      currentRound.matching_pool
    );
    
    // Format the response
    const formattedResponse = {
      donation: {
        amount: amount.toString(),
        campaignId: campaignId,
        roundId: currentRound.id
      },
      matching: {
        beforeDonation: impact.beforeMatching,
        afterDonation: impact.afterMatching,
        impact: impact.impact
      },
      matchingPool: {
        total: currentRound.matching_pool,
        roundEndsAt: currentRound.end_time
      }
    };
    
    res.json({
      success: true,
      data: formattedResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports; 