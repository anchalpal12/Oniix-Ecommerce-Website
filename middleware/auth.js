const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Authorization header missing or malformed');
    return res.status(401).json({ message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'yoursecretkey', (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }

    console.log('✅ Token verified. User:', user);
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  console.log('🔍 Checking role:', req.user?.role);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('❌ Access denied. Not admin.');
    return res.status(403).json({ message: 'Access denied' });
  }
}

module.exports = {
  authenticateToken,
  authorizeAdmin
};
