// ============================================================
// ADD these two routes to your reviewRouter in routes/index.js
// BEFORE the module.exports line.
// ============================================================

// PUT /api/reviews/:id — edit own review
reviewRouter.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const [rows] = await db.query('SELECT user_id FROM reviews WHERE id = ?', [id]);
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
reviewRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT user_id FROM reviews WHERE id = ?', [id]);
    if (!rows.length) return error(res, 'Review not found', 404);
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'You can only delete your own reviews', 403);
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    return success(res, null, 'Review deleted');
  } catch (err) { next(err); }
});
