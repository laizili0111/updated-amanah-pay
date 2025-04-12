const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const donationsController = require('../controllers/donations');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

/**
 * @route POST /api/donations
 * @desc Create a new donation
 * @access Private
 */
router.post(
  '/',
  authMiddleware.authenticate,
  [
    body('campaign_id').isInt().withMessage('Campaign ID must be an integer'),
    body('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be a positive number'),
    body('fiat_amount').isFloat({ min: 0.01 }).withMessage('Fiat amount must be a positive number'),
    body('fiat_currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
  ],
  validationMiddleware.validate,
  donationsController.createDonation
);

/**
 * @route GET /api/donations
 * @desc Get all donations
 * @access Public
 */
router.get(
  '/',
  [
    query('campaign_id').optional().isInt().withMessage('Campaign ID must be an integer'),
    query('user_id').optional().isInt().withMessage('User ID must be an integer'),
    query('round_id').optional().isInt().withMessage('Round ID must be an integer')
  ],
  validationMiddleware.validate,
  donationsController.getAllDonations
);

/**
 * @route GET /api/donations/me
 * @desc Get current user's donations
 * @access Private
 */
router.get(
  '/me',
  authMiddleware.authenticate,
  donationsController.getUserDonations
);

/**
 * @route GET /api/donations/my-donations
 * @desc Get user's donations (alternate route)
 * @access Private
 */
router.get(
  '/my-donations',
  authMiddleware.authenticate,
  donationsController.getUserDonations
);

/**
 * @route GET /api/donations/estimate-impact
 * @desc Estimate donation impact with quadratic funding
 * @access Public
 */
router.get(
  '/estimate-impact',
  [
    query('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be a positive number'),
    query('campaign_id').isInt().withMessage('Campaign ID must be an integer'),
    query('donor_address').optional().isString().withMessage('Donor address must be a string')
  ],
  validationMiddleware.validate,
  donationsController.estimateImpact
);

/**
 * @route GET /api/donations/stats
 * @desc Get donation statistics
 * @access Private
 */
router.get(
  '/stats',
  donationsController.getDonationStats
);

/**
 * @route GET /api/donations/user/:userId
 * @desc Get donations by user ID
 * @access Private (admin only or self)
 */
router.get(
  '/user/:userId',
  authMiddleware.authenticate,
  [
    param('userId').isInt().withMessage('User ID must be an integer')
  ],
  validationMiddleware.validate,
  donationsController.getUserDonationsById
);

/**
 * @route GET /api/donations/campaign/:campaignId
 * @desc Get campaign donations
 * @access Private
 */
router.get(
  '/campaign/:campaignId',
  [
    param('campaignId').isInt().withMessage('Campaign ID must be an integer')
  ],
  validationMiddleware.validate,
  donationsController.getCampaignDonations
);

/**
 * @route GET /api/donations/:id
 * @desc Get donation by ID
 * @access Public
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Donation ID must be an integer')
  ],
  validationMiddleware.validate,
  donationsController.getDonation
);

/**
 * @route PATCH /api/donations/:id/confirm
 * @desc Confirm a donation (after payment processing)
 * @access Private
 */
router.patch(
  '/:id/confirm',
  authMiddleware.authenticate,
  [
    param('id').isInt().withMessage('Donation ID must be an integer'),
    body('payment_id').isString().withMessage('Payment ID is required'),
    body('payment_status').isString().withMessage('Payment status is required')
  ],
  validationMiddleware.validate,
  donationsController.confirmDonation
);

/**
 * @route POST /api/donations/estimate-quadratic-impact
 * @desc Estimate donation impact with quadratic funding
 * @access Public
 */
router.post(
  '/estimate-quadratic-impact',
  validationMiddleware.validate([
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('campaignId').isInt().withMessage('Campaign ID must be an integer')
  ]),
  donationsController.estimateQuadraticImpact
);

module.exports = router;