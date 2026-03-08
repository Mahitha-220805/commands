const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wallet-dev-secret-change-in-production';

/**
 * Verify JWT from Authorization: Bearer <token> and attach user to req.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = payload;
    next();
  });
}

module.exports = { authenticateToken, JWT_SECRET };
