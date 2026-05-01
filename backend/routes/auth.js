const router = require('express').Router();
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return error(res, 'Validation failed', 400, errors.array());

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
  }
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return error(res, 'Validation failed', 400, errors.array());

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
  }
);

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    return success(res, rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/auth/me — update profile (name, email, avatar)
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name?.trim())  updates.name  = name.trim();
    if (email?.trim()) updates.email = email.trim().toLowerCase();
    if (avatar !== undefined) updates.avatar = avatar || null;

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    if (updates.email) {
      const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updates.email, userId]
      );
      if (existing.length) return error(res, 'Email already in use', 400);
    }

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE users SET ${sets} WHERE id = ?`, [...Object.values(updates), userId]);

    const [rows] = await db.query(
      'SELECT id, name, email, avatar, role FROM users WHERE id = ?',
      [userId]
    );
    return success(res, rows[0], 'Profile updated');
  } catch (err) { next(err); }
});

// PUT /api/auth/password — change password
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return error(res, 'Both current and new password required', 400);
    if (new_password.length < 8) return error(res, 'New password must be at least 8 characters', 400);

    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return error(res, 'User not found', 404);

    const ok = await bcrypt.compare(current_password, rows[0].password);
    if (!ok) return error(res, 'Current password is incorrect', 401);

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    return success(res, null, 'Password changed');
  } catch (err) { next(err); }
});

// POST /api/auth/forgot-password — reset password by email
// (Simple version: generates a temporary password and returns it.
//  In production, you'd send an email with a reset link instead.)
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return error(res, 'Valid email required', 400);

      const { email } = req.body;
      const [rows] = await db.query('SELECT id, name FROM users WHERE email = ? AND is_active = 1', [email]);
      if (!rows.length) {
        // Don't reveal whether the email exists
        return success(res, null, 'If an account with that email exists, a reset has been processed.');
      }

      // Generate a temporary password
      const tempPass = 'Reset' + Math.random().toString(36).slice(2, 8) + '!';
      const hash = await bcrypt.hash(tempPass, 12);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, rows[0].id]);

      // In production, send this via email. For local dev, return it directly.
      return success(res, { temp_password: tempPass },
        `Password reset for ${rows[0].name}. Please change it after logging in.`);
    } catch (err) { next(err); }
  }
);

// GET /api/auth/me/reviews — current user's reviews
router.get('/me/reviews', authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
             l.id AS listing_id, l.title AS listing_title, l.slug AS listing_slug
      FROM reviews r
      JOIN listings l ON l.id = r.listing_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    return success(res, rows);
  } catch (err) { next(err); }
});

module.exports = router;
