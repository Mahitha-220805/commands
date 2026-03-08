/**
 * Reports & Analytics – monthly trend, category breakdown, export data.
 */
const {
  getExpensesInRange,
  getExpenseTotalsByCategory,
} = require('../expenses/expenseController');

function getMonthly(req, res) {
  try {
    const userId = req.user.userId;
    const year = (req.query.year || '').trim() || new Date().getFullYear().toString();
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({ error: 'Year must be YYYY.' });
    }

    const data = [];
    for (let m = 1; m <= 12; m++) {
      const month = year + '-' + String(m).padStart(2, '0');
      const totals = getExpenseTotalsByCategory(userId, month);
      const total = Object.values(totals).reduce((s, n) => s + n, 0);
      data.push({ month, total: Math.round(total * 100) / 100 });
    }
    res.json({ year, data });
  } catch (err) {
    console.error('Reports monthly error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getCategory(req, res) {
  try {
    const userId = req.user.userId;
    const month = (req.query.month || '').trim();
    const year = (req.query.year || '').trim();

    let byCategory = {};
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      byCategory = getExpenseTotalsByCategory(userId, month);
    } else if (year && /^\d{4}$/.test(year)) {
      for (let m = 1; m <= 12; m++) {
        const mon = year + '-' + String(m).padStart(2, '0');
        const tot = getExpenseTotalsByCategory(userId, mon);
        Object.keys(tot).forEach((c) => {
          byCategory[c] = (byCategory[c] || 0) + tot[c];
        });
      }
    } else {
      const y = new Date().getFullYear();
      const m = new Date().getMonth() + 1;
      const currentMonth = y + '-' + String(m).padStart(2, '0');
      byCategory = getExpenseTotalsByCategory(userId, currentMonth);
    }

    const data = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
    res.json({ data });
  } catch (err) {
    console.error('Reports category error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getExport(req, res) {
  try {
    const userId = req.user.userId;
    let from = (req.query.from || '').trim();
    let to = (req.query.to || '').trim();
    const now = new Date();
    if (!from || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    }
    if (!to || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      to = now.toISOString().slice(0, 10);
    }
    if (from > to) {
      return res.status(400).json({ error: 'Invalid date range.' });
    }

    const expenses = getExpensesInRange(userId, from, to);
    const byCategory = expenses.reduce((acc, e) => {
      const c = e.category || 'Other';
      acc[c] = (acc[c] || 0) + e.amount;
      return acc;
    }, {});
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const summary = {
      total: Math.round(total * 100) / 100,
      from,
      to,
      byCategory: Object.entries(byCategory).map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
      })),
    };
    res.json({
      expenses: expenses.map((e) => ({
        date: e.date,
        category: e.category,
        amount: e.amount,
        description: e.description || '',
      })),
      summary,
    });
  } catch (err) {
    console.error('Reports export error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = {
  getMonthly,
  getCategory,
  getExport,
};
