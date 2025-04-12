const { User, Donation, Certificate } = require('../models');
const authService = require('../services/auth');
const uploadService = require('../services/upload');

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const userData = {
      full_name: req.body.full_name,
      password: req.body.password
    };
    
    const user = await authService.updateProfile(req.user.id, userData);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Submit KYC documents
const submitKyc = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: 'No document uploaded'
      });
    }
    
    // Process uploaded file
    const fileData = {
      ...req.file,
      entityType: 'KYC',
      entityId: req.user.id
    };
    
    const file = await uploadService.saveFileRecord(fileData, req.user.id);
    
    // Update user KYC status
    const user = await User.findByPk(req.user.id);
    user.kyc_document_url = file.fileUrl;
    user.kyc_status = 'PENDING';
    await user.save();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          kyc_status: user.kyc_status
        },
        document: file
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user donations
const getUserDonations = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is requesting their own donations or is admin
    if (userId !== req.user.id) {
      const isAdmin = await authService.isAdmin(req.user.id);
      if (!isAdmin) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to view these donations'
        });
      }
    }
    
    const donations = await Donation.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Certificate,
          required: false
        }
      ]
    });
    
    res.json({
      success: true,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// Get user certificates
const getUserCertificates = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user is requesting their own certificates or is admin
    if (userId !== req.user.id) {
      const isAdmin = await authService.isAdmin(req.user.id);
      if (!isAdmin) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to view these certificates'
        });
      }
    }
    
    // Get user's wallet address
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Find certificates by owner address
    const certificates = await Certificate.findAll({
      where: { owner_address: user.wallet_address },
      include: [
        {
          model: Donation,
          required: true,
          where: { user_id: userId }
        }
      ]
    });
    
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  submitKyc,
  getUserDonations,
  getUserCertificates
}; 