/**
 * In-memory budget store (use a database in production).
 * budgets: { userId, category, amount, month } per user per category per month.
 */
const { getExpenseTotalsByCategory } = require('../expenses/expenseController');

const budgets = [];

function getCurrentMonth() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

function setBudget(req, res) {
  try {
    const { category, amount, month } = req.body;
    const userId = req.user.userId;

    if (!category || typeof category !== 'string' || !(category.trim())) {
      return res.status(400).json({ error: 'Category is required.' });
    }
    const cat = category.trim();
    if (amount == null || amount === '' || isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ error: 'Valid budget amount is required.' });
    }
    const monthStr = (month || '').trim() || getCurrentMonth();
    if (!/^\d{4}-\d{2}$/.test(monthStr)) {
      return res.status(400).json({ error: 'Month must be YYYY-MM.' });
    }

    const existing = budgets.find(
      (b) => b.userId === userId && b.category === cat && b.month === monthStr
    );
    const value = Number(amount);
    if (existing) {
      existing.amount = value;
      return res.json({ message: 'Budget updated.', budget: existing });
    }
    const budget = { userId, category: cat, amount: value, month: monthStr };
    budgets.push(budget);
    res.status(201).json({ message: 'Budget set.', budget });
  } catch (err) {
    console.error('Set budget error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getStatus(req, res) {
  try {
    const userId = req.user.userId;
    const month = (req.query.month || '').trim() || getCurrentMonth();
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be YYYY-MM.' });
    }

    const spentByCategory = getExpenseTotalsByCategory(userId, month);
    const userBudgets = budgets.filter((b) => b.userId === userId && b.month === month);

    const status = userBudgets.map((b) => {
      const spent = spentByCategory[b.category] || 0;
      const limit = b.amount;
      const remaining = Math.max(0, limit - spent);
      const percent = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
      return {
        category: b.category,
        limit,
        spent,
        remaining,
        percent: Math.round(percent * 10) / 10,
        exceeded: spent > limit,
      };
    });

    const categoriesWithSpendingOnly = Object.keys(spentByCategory).filter(
      (c) => !userBudgets.some((b) => b.category === c)
    );
    categoriesWithSpendingOnly.forEach((category) => {
      status.push({
        category,
        limit: 0,
        spent: spentByCategory[category],
        remaining: 0,
        percent: 0,
        exceeded: false,
      });
    });

    status.sort((a, b) => a.category.localeCompare(b.category));
    res.json({ month, status });
  } catch (err) {
    console.error('Budget status error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getAlerts(req, res) {
  try {
    const userId = req.user.userId;
    const month = (req.query.month || '').trim() || getCurrentMonth();
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month must be YYYY-MM.' });
    }

    const spentByCategory = getExpenseTotalsByCategory(userId, month);
    const userBudgets = budgets.filter((b) => b.userId === userId && b.month === month);

    const alerts = [];
    const WARNING_THRESHOLD = 80;

    userBudgets.forEach((b) => {
      const spent = spentByCategory[b.category] || 0;
      const limit = b.amount;
      if (limit <= 0) return;
      const percent = (spent / limit) * 100;
      if (spent > limit) {
        alerts.push({
          category: b.category,
          limit,
          spent,
          type: 'exceeded',
          message: `Budget exceeded by $${(spent - limit).toFixed(2)}`,
        });
      } else if (percent >= WARNING_THRESHOLD) {
        alerts.push({
          category: b.category,
          limit,
          spent,
          type: 'warning',
          message: `${Math.round(percent)}% of budget used`,
        });
      }
    });

    res.json({ month, alerts });
  } catch (err) {
    console.error('Budget alerts error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

/** Delete all budgets for a user (for admin). */
function deleteBudgetsByUserId(userId) {
  let removed = 0;
  for (let i = budgets.length - 1; i >= 0; i--) {
    if (budgets[i].userId === userId) {
      budgets.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

module.exports = {
  setBudget,
  getStatus,
  getAlerts,
  deleteBudgetsByUserId,
};
