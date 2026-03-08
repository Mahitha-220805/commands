const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth/authMiddleware');
const adminController = require('./adminController');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function requireAdmin(req, res, next) {
  const email = (req.user && req.user.email || '').toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', adminController.getUsers);
router.get('/transactions', adminController.getTransactions);
router.delete('/user/:id', adminController.deleteUserById);

module.exports = router;
