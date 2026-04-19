const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db       = require('../config/db');
const { success, error } = require('../utils/response');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, password } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return error(res, 'Email already in use', 409);

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")',
      [name.trim(), email.toLowerCase(), hash]
    );

    const user = { id: result.insertId, name: name.trim(), email: email.toLowerCase(), role: 'user' };
    const token = signToken(user);

    return success(res, { token, user }, 'Registration successful', 201);
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { email, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, name, email, password, role, avatar FROM users WHERE email = ? AND is_active = 1',
      [email.toLowerCase()]
    );
    if (!rows.length) return error(res, 'Invalid credentials', 401);

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return error(res, 'Invalid credentials', 401);

    const { password: _, ...safeUser } = user;
    const token = signToken(safeUser);

    return success(res, { token, user: safeUser }, 'Login successful');
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return success(res, rows[0]);
  } catch (err) { next(err); }
};
