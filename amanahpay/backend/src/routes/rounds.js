const express = require('express');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');
const roundsController = require('../controllers/rounds');

const router = express.Router();

/**
 * @route GET /api/rounds
 * @desc Get all funding rounds
 * @access Public
 */
router.get('/', roundsController.getAllRounds);

/**
 * @route GET /api/rounds/current
 * @desc Get current funding round
 * @access Public
 */
router.get('/current', roundsController.getCurrentRound);

/**
 * @route GET /api/rounds/:id
 * @desc Get round by ID
 * @access Public
 */
router.get('/:id', validationMiddleware.validate([...validationMiddleware.rules.idParam]), roundsController.getRound);

/**
 * @route POST /api/rounds/:id/finalize
 * @desc Finalize round (admin only)
 * @access Private
 */
router.post(
  '/:id/finalize',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validationMiddleware.validate([...validationMiddleware.rules.idParam]),
  roundsController.finalizeRound
);

/**
 * @route POST /api/rounds/:id/fund
 * @desc Fund matching pool (admin only)
 * @access Private
 */
router.post(
  '/:id/fund',
  authMiddleware.authenticate,
  authMiddleware.isAdmin,
  validationMiddleware.validate([
    ...validationMiddleware.rules.idParam,
    ...validationMiddleware.rules.fundRound
  ]),
  roundsController.fundMatchingPool
);

module.exports = router; 