// ============================================================
// ADD these routes to your existing backend/routes/auth.js
// (or paste above module.exports at the bottom)
// ============================================================

const bcryptjs = require('bcryptjs');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

// PUT /api/auth/me — update profile (name, email, avatar)
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = req.user.id;

    const updates = {};
    if (name?.trim())  updates.name  = name.trim();
    if (email?.trim()) updates.email = email.trim().toLowerCase();
    if (avatar !== undefined) updates.avatar = avatar || null;

    if (!Object.keys(updates).length) {
      return error(res, 'No fields to update', 400);
    }

    // Check email uniqueness if changed
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
    if (!current_password || !new_password) {
      return error(res, 'Both current and new password required', 400);
    }
    if (new_password.length < 6) {
      return error(res, 'New password must be at least 6 characters', 400);
    }

    const [rows] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return error(res, 'User not found', 404);

    const ok = await bcryptjs.compare(current_password, rows[0].password);
    if (!ok) return error(res, 'Current password is incorrect', 401);

    const hash = await bcryptjs.hash(new_password, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

    return success(res, null, 'Password changed');
  } catch (err) { next(err); }
});

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

// PUT /api/reviews/:id — update own review
// Add this to your reviews router instead
// router.put('/:id', authenticate, async (req, res, next) => { ... });
