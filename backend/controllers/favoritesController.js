const db = require('../config/db');
const { success, error } = require('../utils/response');

// POST /api/favorites/:listingId — toggle favorite
exports.toggle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    const [existing] = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND listing_id = ?',
      [userId, listingId]
    );

    if (existing.length) {
      await db.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
      return success(res, { favorited: false }, 'Removed from favorites');
    } else {
      await db.query(
        'INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)',
        [userId, listingId]
      );
      return success(res, { favorited: true }, 'Added to favorites');
    }
  } catch (err) { next(err); }
};

// GET /api/favorites — current user's favorites
exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT f.id, f.created_at AS favorited_at,
             l.id AS listing_id, l.title, l.slug, l.category, l.short_desc, l.location,
             l.avg_rating, l.review_count,
             (SELECT url FROM images WHERE listing_id = l.id AND is_cover = 1 LIMIT 1) AS cover_image
      FROM favorites f
      JOIN (
        SELECT l2.*, COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(DISTINCT r.id) AS review_count
        FROM listings l2
        LEFT JOIN reviews r ON r.listing_id = l2.id AND r.is_visible = 1
        WHERE l2.is_active = 1
        GROUP BY l2.id
      ) l ON l.id = f.listing_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    return success(res, rows);
  } catch (err) { next(err); }
};

// GET /api/favorites/check?ids=1,2,3 — check which listings are favorited
exports.check = async (req, res, next) => {
  try {
    const ids = (req.query.ids || '').split(',').map(Number).filter(Boolean);
    if (!ids.length) return success(res, []);

    const [rows] = await db.query(
      `SELECT listing_id FROM favorites WHERE user_id = ? AND listing_id IN (?)`,
      [req.user.id, ids]
    );
    return success(res, rows.map(r => r.listing_id));
  } catch (err) { next(err); }
};
