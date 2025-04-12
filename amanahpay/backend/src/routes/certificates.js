const express = require('express');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { param } = require('express-validator');
const certificateController = require('../controllers/certificates');

const router = express.Router();

/**
 * @route GET /api/certificates
 * @desc Get all certificates
 * @access Public
 */
router.get('/', certificateController.getAllCertificates);

/**
 * @route GET /api/certificates/:id
 * @desc Get certificate by ID
 * @access Public
 */
router.get('/:id', 
  [param('id').isInt().withMessage('Certificate ID must be an integer')],
  validationMiddleware.validate,
  certificateController.getCertificateById
);

/**
 * @route GET /api/certificates/:id/metadata
 * @desc Get certificate metadata (for NFT)
 * @access Public
 */
router.get('/:id/metadata', 
  [param('id').isInt().withMessage('Certificate ID must be an integer')],
  validationMiddleware.validate,
  certificateController.getCertificateMetadata
);

/**
 * @route PUT /api/certificates/:id/metadata
 * @desc Update certificate metadata
 * @access Private
 */
router.put('/:id/metadata', 
  authMiddleware.authenticate,
  [param('id').isInt().withMessage('Certificate ID must be an integer')],
  validationMiddleware.validate,
  certificateController.updateCertificateMetadata
);

/**
 * @route GET /api/certificates/:id/ipfs
 * @desc Fetch certificate metadata from IPFS
 * @access Public
 */
router.get('/:id/ipfs', 
  [param('id').isInt().withMessage('Certificate ID must be an integer')],
  validationMiddleware.validate,
  certificateController.fetchCertificateFromIPFS
);

module.exports = router; 