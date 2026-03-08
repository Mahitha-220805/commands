/**
 * Admin Dashboard – system monitoring.
 * Requires admin middleware (email in ADMIN_EMAILS).
 */
const { getAllUsers, deleteUser } = require('../auth/authController');
const {
  getAllExpensesForAdmin,
  deleteExpensesByUserId,
} = require('../expenses/expenseController');
const { deleteBudgetsByUserId } = require('../budget/budgetController');

function getUsers(req, res) {
  try {
    const users = getAllUsers();
    res.json({ users });
  } catch (err) {
    console.error('Admin getUsers error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getTransactions(req, res) {
  try {
    const expenses = getAllExpensesForAdmin();
    const users = getAllUsers();
    const userMap = users.reduce((acc, u) => {
      acc[u.id] = u;
      return acc;
    }, {});

    const transactions = expenses.map((e) => ({
      id: e.id,
      userId: e.userId,
      userEmail: (userMap[e.userId] && userMap[e.userId].email) || '—',
      userName: (userMap[e.userId] && userMap[e.userId].name) || '—',
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date,
      createdAt: e.createdAt,
    }));

    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses.reduce((acc, e) => {
      const c = e.category || 'Other';
      acc[c] = (acc[c] || 0) + e.amount;
      return acc;
    }, {});

    const suspicious = [];
    const byUser = {};
    expenses.forEach((e) => {
      if (!byUser[e.userId]) byUser[e.userId] = [];
      byUser[e.userId].push(e);
    });
    Object.entries(byUser).forEach(([uid, arr]) => {
      const userTotal = arr.reduce((s, x) => s + (x.amount || 0), 0);
      const user = userMap[uid];
      if (arr.length > 50) {
        suspicious.push({
          type: 'high_frequency',
          userId: uid,
          userEmail: user ? user.email : uid,
          count: arr.length,
          message: `${arr.length} transactions in period`,
        });
      }
      if (userTotal > 5000) {
        suspicious.push({
          type: 'high_spending',
          userId: uid,
          userEmail: user ? user.email : uid,
          total: userTotal,
          message: `$${userTotal.toFixed(2)} total spending`,
        });
      }
    });

    res.json({
      transactions,
      summary: {
        total: Math.round(totalAmount * 100) / 100,
        count: transactions.length,
        byCategory: Object.entries(byCategory).map(([category, total]) => ({
          category,
          total: Math.round(total * 100) / 100,
        })),
      },
      suspicious,
    });
  } catch (err) {
    console.error('Admin getTransactions error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function deleteUserById(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'User id is required.' });
    }

    const deleted = deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found.' });
    }

    deleteExpensesByUserId(id);
    deleteBudgetsByUserId(id);

    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error('Admin deleteUser error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = {
  getUsers,
  getTransactions,
  deleteUserById,
};
