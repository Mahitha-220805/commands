const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth/authMiddleware');
const expenseController = require('./expenseController');

// All expense routes require authentication
router.use(authenticateToken);

router.post('/add', expenseController.addExpense);
router.get('/list', expenseController.listExpenses);
router.put('/update', expenseController.updateExpense);
router.delete('/delete', expenseController.deleteExpense);

module.exports = router;
