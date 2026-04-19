const { validationResult } = require('express-validator');
const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/listings/:listingId/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const [reviews] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.listing_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
    `, [listingId]);
    return success(res, reviews);
  } catch (err) { next(err); }
};

// POST /api/listings/:listingId/reviews
exports.createReview = async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return error(res, 'Validation failed', 400, errs.array());

    const { listingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const [listingRows] = await db.query('SELECT id FROM listings WHERE id = ? AND is_active = 1', [listingId]);
    if (!listingRows.length) return error(res, 'Listing not found', 404);

    const [existing] = await db.query(
      'SELECT id FROM reviews WHERE user_id = ? AND listing_id = ?', [userId, listingId]
    );
    if (existing.length) return error(res, 'You have already reviewed this listing', 409);

    const [result] = await db.query(
      'INSERT INTO reviews (user_id, listing_id, rating, comment) VALUES (?,?,?,?)',
      [userId, listingId, parseInt(rating), comment?.trim() || null]
    );

    const [rows] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r JOIN users u ON u.id = r.user_id
      WHERE r.id = ?
    `, [result.insertId]);

    return success(res, rows[0], 'Review submitted', 201);
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (!rows.length) return error(res, 'Review not found', 404);
    if (req.user.role !== 'admin' && rows[0].user_id !== req.user.id) return error(res, 'Access denied', 403);
    await db.query('UPDATE reviews SET is_visible = 0 WHERE id = ?', [req.params.id]);
    return success(res, null, 'Review removed');
  } catch (err) { next(err); }
};
