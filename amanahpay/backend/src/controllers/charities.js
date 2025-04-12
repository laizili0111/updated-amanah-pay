const { Charity, Campaign, User } = require('../models');
const blockchainService = require('../services/blockchain');
const uploadService = require('../services/upload');
const authService = require('../services/auth');

// Create a new charity
const createCharity = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // Register charity on blockchain
    const tx = await blockchainService.registerCharity(name, description);
    
    // Create charity record in database
    const charity = await Charity.create({
      name,
      description,
      admin_address: req.user.wallet_address,
      admin_user_id: req.user.id,
      is_verified: false,
      is_active: true
    });
    
    res.status(201).json({
      success: true,
      data: {
        charity,
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

// Get all charities
const getAllCharities = async (req, res, next) => {
  try {
    const charities = await Charity.findAll({
      where: { is_active: true },
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'wallet_address']
        }
      ]
    });
    
    res.json({
      success: true,
      data: charities
    });
  } catch (error) {
    next(error);
  }
};

// Get charity by ID
const getCharity = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.id);
    
    const charity = await Charity.findByPk(charityId, {
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['id', 'username', 'wallet_address']
        }
      ]
    });
    
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    next(error);
  }
};

// Update charity
const updateCharity = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.id);
    const { name, description } = req.body;
    
    const charity = await Charity.findByPk(charityId);
    
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    // Only allow owner or admin to update
    const isCharityAdmin = await authService.isCharityAdmin(req.user.id, charityId);
    const isPlatformAdmin = await authService.isAdmin(req.user.id);
    
    if (!isCharityAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to update this charity'
      });
    }
    
    // Update charity
    charity.name = name;
    charity.description = description;
    await charity.save();
    
    res.json({
      success: true,
      data: charity
    });
  } catch (error) {
    next(error);
  }
};

// Verify charity (admin only)
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
    
    // Update charity verification status
    const verified = req.body.verified === true || req.body.verified === 'true';
    
    // Update on blockchain
    const tx = await blockchainService.verifyCharity(charityId, verified);
    
    // Update in database
    charity.is_verified = verified;
    await charity.save();
    
    res.json({
      success: true,
      data: {
        charity,
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

// Get campaigns for charity
const getCharityCampaigns = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.id);
    
    const charity = await Charity.findByPk(charityId);
    
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    const campaigns = await Campaign.findAll({
      where: { 
        charity_id: charityId,
        is_active: true
      }
    });
    
    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    next(error);
  }
};

// Upload charity logo
const uploadCharityLogo = async (req, res, next) => {
  try {
    const charityId = parseInt(req.params.id);
    
    const charity = await Charity.findByPk(charityId);
    
    if (!charity) {
      return res.status(404).json({
        error: true,
        message: 'Charity not found'
      });
    }
    
    // Process uploaded file
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No logo uploaded'
      });
    }
    
    const fileData = {
      ...req.file,
      entityType: 'CHARITY',
      entityId: charityId
    };
    
    const file = await uploadService.saveFileRecord(fileData, req.user.id);
    
    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCharity,
  getAllCharities,
  getCharity,
  updateCharity,
  verifyCharity,
  getCharityCampaigns,
  uploadCharityLogo
}; 