const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth/authMiddleware');
const budgetController = require('./budgetController');

router.use(authenticateToken);

router.post('/set', budgetController.setBudget);
router.get('/status', budgetController.getStatus);
router.get('/alerts', budgetController.getAlerts);

module.exports = router;
