const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth/authMiddleware');
const reportController = require('./reportController');

router.use(authenticateToken);

router.get('/monthly', reportController.getMonthly);
router.get('/category', reportController.getCategory);
router.get('/export', reportController.getExport);

module.exports = router;
