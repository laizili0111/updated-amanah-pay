const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const db = require('../config/db');

/**
 * Generate JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * Create and send token response
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Remove password from output
  user.password_hash = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, wallet_address } = req.body;

    // Check if user already exists
    const userExistsQuery = 'SELECT * FROM users WHERE email = $1';
    const userExistsResult = await db.query(userExistsQuery, [email]);
    
    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const createUserQuery = `
      INSERT INTO users (username, email, password_hash, wallet_address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, username, email, wallet_address, created_at
    `;
    
    const values = [
      username,
      email.toLowerCase(),
      password_hash,
      wallet_address || null
    ];

    const { rows } = await db.query(createUserQuery, values);
    const newUser = rows[0];

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email.toLowerCase()]);
    const user = rows[0];

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // Send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // User is already available in req.user from the protect middleware
    const user = req.user;
    
    // Get user impact metrics
    const impactMetricsQuery = `
      SELECT 
        COUNT(d.id) as donations_count,
        SUM(d.amount) as total_amount,
        COUNT(DISTINCT c.id) as campaigns_supported
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.user_id = $1
    `;
    
    const { rows } = await db.query(impactMetricsQuery, [user.id]);
    const metrics = rows[0];
    
    // Format impact metrics
    const impactMetrics = [
      { 
        label: 'Donations Made', 
        value: parseInt(metrics.donations_count) || 0, 
        unit: 'donations', 
        category: 'Overall' 
      },
      { 
        label: 'Amount Contributed', 
        value: parseFloat(metrics.total_amount) || 0, 
        unit: 'USD', 
        category: 'Overall' 
      },
      { 
        label: 'Projects Supported', 
        value: parseInt(metrics.campaigns_supported) || 0, 
        unit: 'projects', 
        category: 'Overall' 
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        user,
        impactMetrics
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Connect wallet to user account
 * @route   POST /api/auth/connect-wallet
 * @access  Private
 */
exports.connectWallet = async (req, res) => {
  try {
    const { wallet_address, signature } = req.body;
    const userId = req.user.id;

    if (!wallet_address) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address is required'
      });
    }

    // Verify if the wallet is already connected to another account
    const walletExistsQuery = 'SELECT * FROM users WHERE wallet_address = $1 AND id != $2';
    const walletExistsResult = await db.query(walletExistsQuery, [wallet_address, userId]);
    
    if (walletExistsResult.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This wallet is already connected to another account'
      });
    }

    // If signature is provided, verify it
    if (signature) {
      // Create message that was signed
      const message = `Connect wallet ${wallet_address} to AmanahPay account: ${req.user.email}`;
      
      // Recover the address from the signature
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid signature'
        });
      }
    }

    // Update user with wallet address
    const updateQuery = `
      UPDATE users 
      SET wallet_address = $1, updated_at = NOW() 
      WHERE id = $2
      RETURNING id, username, email, wallet_address
    `;
    
    const { rows } = await db.query(updateQuery, [wallet_address, userId]);
    const updatedUser = rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect wallet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Verify wallet signature for authentication
 * @route   POST /api/auth/verify-signature
 * @access  Public
 */
exports.verifySignature = async (req, res) => {
  try {
    const { wallet_address, signature } = req.body;

    if (!wallet_address || !signature) {
      return res.status(400).json({
        status: 'error',
        message: 'Wallet address and signature are required'
      });
    }

    // Find user by wallet address
    const query = 'SELECT * FROM users WHERE wallet_address = $1';
    const { rows } = await db.query(query, [wallet_address]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with this wallet address'
      });
    }

    // Create message that was signed
    const message = `Sign in to AmanahPay with wallet: ${wallet_address}`;
    
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid signature'
      });
    }

    // Send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Verify signature error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 