/**
 * In-memory expense store (use a database in production).
 * All operations are scoped by req.user.userId from JWT.
 */
const expenses = [];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function addExpense(req, res) {
  try {
    const { amount, category, description, date } = req.body;
    const userId = req.user.userId;

    if (amount == null || amount === '' || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required.' });
    }

    const expense = {
      id: generateId(),
      userId,
      amount: Number(amount),
      category: (category || '').trim() || 'Other',
      description: (description || '').trim() || '',
      date: (date || '').trim() || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    expenses.push(expense);

    res.status(201).json({ message: 'Expense added.', expense });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function listExpenses(req, res) {
  try {
    const userId = req.user.userId;
    const userExpenses = expenses
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ expenses: userExpenses });
  } catch (err) {
    console.error('List expenses error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function updateExpense(req, res) {
  try {
    const { id, amount, category, description, date } = req.body;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: 'Expense id is required.' });
    }

    const index = expenses.findIndex((e) => e.id === id && e.userId === userId);
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    const e = expenses[index];
    if (amount != null && amount !== '') {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) return res.status(400).json({ error: 'Invalid amount.' });
      e.amount = num;
    }
    if (category !== undefined) e.category = (category || '').trim() || 'Other';
    if (description !== undefined) e.description = (description || '').trim();
    if (date !== undefined) e.date = (date || '').trim() || new Date().toISOString().slice(0, 10);

    res.json({ message: 'Expense updated.', expense: e });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function deleteExpense(req, res) {
  try {
    const { id } = req.body;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ error: 'Expense id is required.' });
    }

    const index = expenses.findIndex((e) => e.id === id && e.userId === userId);
    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    expenses.splice(index, 1);
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

/** Get spending totals by category for a user in a given month (YYYY-MM). Used by budget module. */
function getExpenseTotalsByCategory(userId, month) {
  return expenses
    .filter((e) => e.userId === userId && e.date && e.date.startsWith(month))
    .reduce((acc, e) => {
      const c = e.category || 'Other';
      acc[c] = (acc[c] || 0) + e.amount;
      return acc;
    }, {});
}

/** Get expenses for a user in date range (from/to YYYY-MM-DD). Used by reports module. */
function getExpensesInRange(userId, fromDate, toDate) {
  return expenses
    .filter(
      (e) =>
        e.userId === userId &&
        e.date &&
        e.date >= fromDate &&
        e.date <= toDate
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Get all expenses (for admin). */
function getAllExpensesForAdmin() {
  return [...expenses];
}

/** Delete all expenses for a user. */
function deleteExpensesByUserId(userId) {
  let removed = 0;
  for (let i = expenses.length - 1; i >= 0; i--) {
    if (expenses[i].userId === userId) {
      expenses.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

module.exports = {
  addExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
  getExpenseTotalsByCategory,
  getExpensesInRange,
  getAllExpensesForAdmin,
  deleteExpensesByUserId,
};
