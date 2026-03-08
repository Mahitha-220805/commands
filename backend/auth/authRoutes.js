const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { authenticateToken } = require('./authMiddleware');

// POST /api/signup – register (password hashed with bcrypt)
router.post('/signup', authController.signup);

// POST /api/login – login, returns JWT
router.post('/login', authController.login);

// POST /api/logout – invalidate session (optional: send token to blacklist)
router.post('/logout', authController.logout);

// GET /api/profile – protected, requires JWT
router.get(
  '/profile',
  authenticateToken,
  authController.rejectBlacklist,
  authController.getProfile
);

module.exports = router;
