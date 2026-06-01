const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(new AppError('Validation failed', 400, errors));
  }
  next();
}

module.exports = validate;
