const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { protect } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login a user and get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route POST /api/auth/connect-wallet
 * @desc Connect a wallet to user account
 * @access Private
 */
router.post('/connect-wallet', protect, authController.connectWallet);

/**
 * @route POST /api/auth/verify-signature
 * @desc Verify wallet signature for authentication
 * @access Public
 */
router.post('/verify-signature', authController.verifySignature);

module.exports = router; 