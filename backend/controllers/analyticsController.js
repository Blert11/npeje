const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/analytics/listing/:id  (admin or owner)
exports.getListingAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query; // days

    // Ownership check for business users
    if (req.user.role === 'business') {
      const [[listing]] = await db.query('SELECT owner_id FROM listings WHERE id = ?', [id]);
      if (!listing || listing.owner_id !== req.user.id) {
        return error(res, 'Access denied', 403);
      }
    }

    const days = parseInt(period);
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace('T', ' ');

    // Total & unique views
    const [[viewStats]] = await db.query(`
      SELECT COUNT(*) AS total_views, COUNT(DISTINCT ip_hash) AS unique_visitors
      FROM listing_views
      WHERE listing_id = ? AND viewed_at >= ?
    `, [id, since]);

    // Clicks by type
    const [clickStats] = await db.query(`
      SELECT button_type, COUNT(*) AS count
      FROM listing_clicks
      WHERE listing_id = ? AND clicked_at >= ?
      GROUP BY button_type
    `, [id, since]);

    // Contacts/leads
    const [[{ contacts }]] = await db.query(`
      SELECT COUNT(*) AS contacts FROM contacts
      WHERE listing_id = ? AND created_at >= ?
    `, [id, since]);

    // Review stats
    const [[reviewStats]] = await db.query(`
      SELECT COUNT(*) AS review_count, COALESCE(AVG(rating), 0) AS avg_rating
      FROM reviews WHERE listing_id = ? AND is_visible = 1
    `, [id]);

    // Views over time (daily)
    const [dailyViews] = await db.query(`
      SELECT DATE(viewed_at) AS date, COUNT(*) AS views, COUNT(DISTINCT ip_hash) AS unique_views
      FROM listing_views
      WHERE listing_id = ? AND viewed_at >= ?
      GROUP BY DATE(viewed_at)
      ORDER BY date
    `, [id, since]);

    // Clicks over time (daily)
    const [dailyClicks] = await db.query(`
      SELECT DATE(clicked_at) AS date, COUNT(*) AS clicks
      FROM listing_clicks
      WHERE listing_id = ? AND clicked_at >= ?
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `, [id, since]);

    return success(res, {
      period: days,
      views: viewStats,
      clicks: clickStats,
      contacts,
      reviews: reviewStats,
      charts: { dailyViews, dailyClicks },
    });
  } catch (err) { next(err); }
};

// GET /api/analytics/overview  (admin only)
exports.getOverview = async (req, res, next) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM listings WHERE is_active=1)  AS total_listings,
        (SELECT COUNT(*) FROM users)                       AS total_users,
        (SELECT COUNT(*) FROM reviews WHERE is_visible=1)  AS total_reviews,
        (SELECT COUNT(*) FROM listing_views WHERE viewed_at >= DATE_SUB(NOW(),INTERVAL 30 DAY)) AS views_30d
    `);

    // Top listings by views (30d)
    const [topListings] = await db.query(`
      SELECT l.id, l.title, l.category, COUNT(v.id) AS view_count
      FROM listings l
      LEFT JOIN listing_views v ON v.listing_id = l.id AND v.viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      WHERE l.is_active = 1
      GROUP BY l.id
      ORDER BY view_count DESC
      LIMIT 5
    `);

    // Category distribution
    const [categoryStats] = await db.query(`
      SELECT category, COUNT(*) AS count FROM listings WHERE is_active=1 GROUP BY category
    `);

    // Recent signups
    const [recentUsers] = await db.query(`
      SELECT id, name, email, role, created_at FROM users
      ORDER BY created_at DESC LIMIT 5
    `);

    return success(res, { totals, topListings, categoryStats, recentUsers });
  } catch (err) { next(err); }
};
