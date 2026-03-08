const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./authMiddleware');

// In-memory store (use a database in production)
const users = new Map();
const tokenBlacklist = new Set();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (users.has(trimmedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = {
      id: generateId(),
      name: name.trim(),
      email: trimmedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    users.set(trimmedEmail, user);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = users.get(trimmedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      tokenBlacklist.add(token);
    }

    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

function getProfile(req, res) {
  const { userId, email } = req.user;
  const user = Array.from(users.values()).find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

// Middleware to reject blacklisted tokens (used for protected routes)
function rejectBlacklisted(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token && tokenBlacklist.has(token)) {
    return res.status(403).json({ error: 'Token has been revoked. Please sign in again.' });
  }
  next();
}

/** Get all users (for admin). Returns { id, name, email, createdAt } without password. */
function getAllUsers() {
  return Array.from(users.values()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
  }));
}

/** Delete user by id. Returns true if deleted. */
function deleteUser(userId) {
  const user = Array.from(users.values()).find((u) => u.id === userId);
  if (!user) return false;
  users.delete(user.email);
  return true;
}

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  rejectBlacklist: rejectBlacklisted,
  getAllUsers,
  deleteUser,
};
