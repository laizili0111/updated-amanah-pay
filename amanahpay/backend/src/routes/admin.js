const express = require('express');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Get admin dashboard stats
 * @access Private (Admin)
 */
router.get(
  '/dashboard',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.getDashboardStats
);

/**
 * @route GET /api/admin/donations
 * @desc Get all donations
 * @access Private (Admin)
 */
router.get(
  '/donations',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  adminController.getAllDonations
);

/**
 * @route POST /api/admin/charities/verify/:id
 * @desc Verify a charity
 * @access Private (Admin)
 */
router.post(
  '/charities/verify/:id',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validationMiddleware.validate(validationMiddleware.rules.idParam),
  adminController.verifyCharity
);

/**
 * @route POST /api/admin/campaigns/approve/:id
 * @desc Approve a campaign
 * @access Private (Admin)
 */
router.post(
  '/campaigns/approve/:id',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validationMiddleware.validate(validationMiddleware.rules.idParam),
  adminController.approveCampaign
);

/**
 * @route POST /api/admin/release-funds
 * @desc Release funds to charities
 * @access Private (admin only)
 */
router.post('/release-funds', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.releaseFunds);

/**
 * @route GET /api/admin/transactions
 * @desc Get all fund transactions
 * @access Private (admin only)
 */
router.get('/transactions', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getTransactions);

/**
 * @route GET /api/admin/blockchain
 * @desc Get blockchain synchronization status
 * @access Private (admin only)
 */
router.get('/blockchain', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getBlockchainStatus);

/**
 * @route POST /api/admin/blockchain/sync
 * @desc Sync blockchain events
 * @access Private (admin only)
 */
router.post('/blockchain/sync', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.syncBlockchain);

/**
 * @route GET /api/admin/kyc
 * @desc Get pending KYC applications
 * @access Private (admin only)
 */
router.get('/kyc', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getPendingKyc);

/**
 * @route POST /api/admin/kyc/:id/approve
 * @desc Approve KYC application
 * @access Private (admin only)
 */
router.post('/kyc/:id/approve', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.approveKyc);

/**
 * @route POST /api/admin/kyc/:id/reject
 * @desc Reject KYC application
 * @access Private (admin only)
 */
router.post('/kyc/:id/reject', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.rejectKyc);

module.exports = router; 