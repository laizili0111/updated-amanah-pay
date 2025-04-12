const { validationResult, param, body, query } = require('express-validator');

// Common validation rules
exports.rules = {
  idParam: [
    param('id').isInt().withMessage('ID must be an integer')
  ],
  uuidParam: [
    param('uuid').isUUID().withMessage('UUID format is invalid')
  ],
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  donation: [
    body('campaign_id').isInt().withMessage('Campaign ID must be an integer'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('fiat_amount').optional().isNumeric().withMessage('Fiat amount must be a number'),
    body('fiat_currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Fiat currency must be a 3-letter code')
  ],
  fundRound: [
    body('amount').isNumeric().withMessage('Amount must be a number and is required')
  ]
};

/**
 * Validation middleware
 * Checks for validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }
    
    next();
  };
}; 