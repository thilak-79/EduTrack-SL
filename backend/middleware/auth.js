const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens from Request Headers
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please login.' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'smartschool_lk_srilankan_digital_school_jwt_secret_2026_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
    }
    req.user = user;
    next();
  });
}

// Middleware to restrict endpoint to specific user roles (admin, teacher, parent, student)
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    
    const allowed = Array.isArray(roles) ? roles.includes(req.user.role) : req.user.role === roles;
    if (!allowed) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions.' });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
