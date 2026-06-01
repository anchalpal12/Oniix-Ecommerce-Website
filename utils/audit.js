const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

async function writeAudit({ action, resourceType, resourceId, performedBy, metadata }) {
  try {
    await AuditLog.create({
      action,
      resourceType,
      resourceId: String(resourceId),
      performedBy,
      metadata,
    });
  } catch (err) {
    logger.warn({ err: err.message, action, resourceId }, 'Audit log write failed');
  }
}

module.exports = { writeAudit };
