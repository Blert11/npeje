// ============================================================
// ADD these routes to your existing backend/routes/reviews.js
// (or wherever review routes live — typically routes/index.js
// exports reviewRouter)
//
// These let users edit/delete their OWN reviews.
// ============================================================

const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

// PUT /api/reviews/:id — edit own review
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Verify ownership
    const [rows] = await db.query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );
    if (!rows.length) return error(res, 'Review not found', 404);
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'You can only edit your own reviews', 403);
    }

    const updates = {};
    if (rating !== undefined) {
      const r = parseInt(rating);
      if (r < 1 || r > 5) return error(res, 'Rating must be 1-5', 400);
      updates.rating = r;
    }
    if (comment !== undefined) updates.comment = comment?.trim() || null;

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE reviews SET ${sets} WHERE id = ?`, [...Object.values(updates), id]);

    const [updated] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return success(res, updated[0], 'Review updated');
  } catch (err) { next(err); }
});

// DELETE /api/reviews/:id — delete own review
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );
    if (!rows.length) return error(res, 'Review not found', 404);
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'You can only delete your own reviews', 403);
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    return success(res, null, 'Review deleted');
  } catch (err) { next(err); }
});
