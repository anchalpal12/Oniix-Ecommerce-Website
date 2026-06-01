const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const env = require('../config/env');

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.id,
  });
}

function errorHandler(err, req, res, _next) {
  const status = err.statusCode || err.status || 500;
  const isOperational = err.isOperational === true;

  logger.error(
    {
      err,
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status,
    },
    isOperational ? err.message : 'Unhandled error'
  );

  const message =
    isOperational || !env.isProduction
      ? err.message || 'Internal server error'
      : 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    requestId: req.id,
    ...(err.errors && { errors: err.errors }),
    ...(!env.isProduction && err.stack && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler, AppError };
