const jwt = require('jsonwebtoken');
const env = require('../config/env');

function getJwtSecret() {
  return env.jwtSecret;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
}

function authorizeAdminOrSelf(req, res, next) {
  if (req.user?.role === 'admin') return next();
  const email = req.query.email || req.body.email;
  if (email && req.user?.email && email.toLowerCase() === req.user.email.toLowerCase()) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied' });
}

module.exports = {
  authenticateToken,
  authorizeAdmin,
  authorizeAdminOrSelf,
  getJwtSecret,
};
