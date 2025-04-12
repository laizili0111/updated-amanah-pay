const { User, Donation, Campaign, Charity, Transaction, KycApplication } = require('../models');
const blockchainService = require('../services/blockchain');

// Get admin dashboard stats
const getDashboardStats = async (req, res, next) => {
  try {
    // Get total donations
    const totalDonations = await Donation.count();
    
    // Get total donation amount
    const donationStats = await Donation.findOne({
      attributes: [
        [Donation.sequelize.fn('SUM', Donation.sequelize.col('amount')), 'total']
      ]
    });
    
    // Get user count
    const userCount = await User.count();
    
    // Get campaign stats
    const campaigns = await Campaign.findAll({
      attributes: [
        [Campaign.sequelize.fn('COUNT', Campaign.sequelize.col('id')), 'count'],
        [Campaign.sequelize.literal(`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`), 'approved'],
        [Campaign.sequelize.literal(`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`), 'pending']
      ]
    });
    
    // Get charity stats
    const charities = await Charity.findAll({
      attributes: [
        [Charity.sequelize.fn('COUNT', Charity.sequelize.col('id')), 'count'],
        [Charity.sequelize.literal(`SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END)`), 'verified']
      ]
    });
    
    // Get pending KYC applications
    const pendingKyc = await KycApplication.count({
      where: { status: 'pending' }
    });
    
    res.json({
      success: true,
      data: {
        donations: {
          count: totalDonations,
          total: donationStats.dataValues.total || 0
        },
        users: userCount,
        campaigns: {
          count: campaigns[0].dataValues.count || 0,
          approved: campaigns[0].dataValues.approved || 0,
          pending: campaigns[0].dataValues.pending || 0
        },
        charities: {
          count: charities[0].dataValues.count || 0,
          verified: charities[0].dataValues.verified || 0
        },
        kyc: {
          pending: pendingKyc
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all donations
const getAllDonations = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Campaign, attributes: ['id', 'name'] }
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

// Verify a charity
const verifyCharity = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.id);
    
    const charity = await Charity.findByPk(charityId);
    
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    charity.is_verified = true;
    charity.verified_at = new Date();
    await charity.save();
    
    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    next(error);
  }
};

// Approve a campaign
const approveCampaign = async (req, res, next) => {
  try {
    const campaignId = parseInt(req.params.id);
    
    const campaign = await Campaign.findByPk(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        error: true,
        message: 'Campaign not found'
      });
    }
    
    campaign.status = 'approved';
    campaign.approved_at = new Date();
    await campaign.save();
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// Release funds to charities
const releaseFunds = async (req, res, next) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Valid transactions are required'
      });
    }
    
    const results = [];
    
    for (const tx of transactions) {
      // Process transaction on blockchain
      const blockchainTx = await blockchainService.transferFunds(tx.charity_id, tx.amount);
      
      // Record transaction in database
      const transaction = await Transaction.create({
        charity_id: tx.charity_id,
        amount: tx.amount,
        transaction_hash: blockchainTx.hash,
        status: 'completed'
      });
      
      results.push(transaction);
    }
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// Get all fund transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: Charity, attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// Get blockchain synchronization status
const getBlockchainStatus = async (req, res, next) => {
  try {
    // Mock blockchain status
    const status = {
      lastSyncedBlock: 12345678,
      currentBlock: 12345700,
      isFullySynced: false,
      pendingTransactions: 2
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

// Sync blockchain events
const syncBlockchain = async (req, res, next) => {
  try {
    // Mock blockchain sync
    const syncResult = {
      fromBlock: 12345678,
      toBlock: 12345700,
      processedEvents: 25,
      newDonations: 3,
      newCertificates: 2
    };
    
    res.json({
      success: true,
      data: syncResult
    });
  } catch (error) {
    next(error);
  }
};

// Get pending KYC applications
const getPendingKyc = async (req, res, next) => {
  try {
    const applications = await KycApplication.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['created_at', 'ASC']]
    });
    
    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Approve KYC application
const approveKyc = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    const application = await KycApplication.findByPk(applicationId);
    
    if (!application) {
      return res.status(404).json({
        error: true,
        message: 'KYC application not found'
      });
    }
    
    application.status = 'approved';
    application.processed_at = new Date();
    await application.save();
    
    // Update user's KYC status
    await User.update(
      { kyc_verified: true },
      { where: { id: application.user_id } }
    );
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Reject KYC application
const rejectKyc = async (req, res, next) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { reason } = req.body;
    
    const application = await KycApplication.findByPk(applicationId);
    
    if (!application) {
      return res.status(404).json({
        error: true,
        message: 'KYC application not found'
      });
    }
    
    application.status = 'rejected';
    application.rejection_reason = reason;
    application.processed_at = new Date();
    await application.save();
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllDonations,
  verifyCharity,
  approveCampaign,
  releaseFunds,
  getTransactions,
  getBlockchainStatus,
  syncBlockchain,
  getPendingKyc,
  approveKyc,
  rejectKyc
}; 