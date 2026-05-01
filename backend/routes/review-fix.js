// ============================================================
// REVIEW RE-POST FIX
//
// The problem: reviews table has UNIQUE KEY on (user_id, listing_id).
// When a user deletes their review and tries to post again, the
// unique constraint blocks it because... wait, if the row was
// DELETED, the constraint shouldn't block. The actual issue is
// likely that the DELETE is soft (setting is_visible = 0) not hard.
//
// FIX: Change delete to hard-delete in your review routes:
//
//   await db.query('DELETE FROM reviews WHERE id = ?', [id]);
//   // NOT: UPDATE reviews SET is_visible = 0
//
// If you want the 7-day cooldown, add this check in the CREATE handler:
// ============================================================

// In your review creation handler (where POST /api/listings/:id/reviews is handled),
// BEFORE the INSERT, add this check:

/*
  // Check cooldown: user can't re-review within 7 days of deleting
  const [recent] = await db.query(`
    SELECT id FROM review_deletions
    WHERE user_id = ? AND listing_id = ? AND deleted_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
  `, [req.user.id, listingId]);
  if (recent.length) {
    return error(res, 'You can review again after 7 days', 429);
  }
*/

// But simpler approach: just use hard DELETE (which removes the row entirely)
// and the UNIQUE constraint won't block re-posting. No cooldown table needed.
//
// Run this SQL to verify your delete is working:
//
//   SELECT * FROM reviews WHERE user_id = X AND listing_id = Y;
//
// If a row exists with is_visible = 0, that's your problem. Delete it:
//
//   DELETE FROM reviews WHERE user_id = X AND listing_id = Y AND is_visible = 0;
//
// Then the user can post again.

// The simplest permanent fix — run this in phpMyAdmin:
// ALTER TABLE reviews DROP INDEX uq_user_listing;
// This removes the unique constraint entirely, allowing multiple reviews
// (though your frontend should still check for duplicates logically).
