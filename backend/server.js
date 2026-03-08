const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth/authRoutes');
const expenseRoutes = require('./expenses/expenseRoutes');
const budgetRoutes = require('./budget/budgetRoutes');
const reportRoutes = require('./reports/reportRoutes');
const adminRoutes = require('./admin/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Wallet API' });
});

app.listen(PORT, () => {
  console.log(`Wallet API running at http://localhost:${PORT}`);
});
