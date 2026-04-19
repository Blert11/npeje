const crypto = require('crypto');
const db = require('../config/db');
const { success, error, paginate } = require('../utils/response');

const ipHash = (req) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
};

const safeJson = (val, fallback = null) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

exports.getListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, search, featured, location } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = ['l.is_active = 1'];

    if (category)            { conditions.push('l.category = ?');                           params.push(category); }
    if (featured === 'true') { conditions.push('l.is_featured = 1'); }
    if (location)            { conditions.push('l.location LIKE ?');                        params.push(`%${location}%`); }
    if (search)              { conditions.push('(l.title LIKE ? OR l.description LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM listings l ${where}`, params);

    const [listings] = await db.query(`
      SELECT
        l.id, l.title, l.slug, l.category, l.short_desc, l.location,
        l.features, l.opening_hours, l.is_featured, l.owner_id,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id)       AS review_count,
        (SELECT url FROM images WHERE listing_id = l.id AND is_cover = 1 LIMIT 1) AS cover_image
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id AND r.is_visible = 1
      ${where}
      GROUP BY l.id
      ORDER BY l.is_featured DESC, avg_rating DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    listings.forEach(l => {
      l.features      = safeJson(l.features, []);
      l.opening_hours = safeJson(l.opening_hours, null);
    });

    return paginate(res, listings, total, page, limit);
  } catch (err) { next(err); }
};

exports.getListing = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(`
      SELECT l.*,
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count
      FROM listings l
      LEFT JOIN reviews r ON r.listing_id = l.id AND r.is_visible = 1
      WHERE l.slug = ? AND l.is_active = 1
      GROUP BY l.id
    `, [slug]);

    if (!rows.length) return error(res, 'Listing not found', 404);

    const listing = rows[0];
    listing.features      = safeJson(listing.features, []);
    listing.contact_info  = safeJson(listing.contact_info, {});
    listing.opening_hours = safeJson(listing.opening_hours, null);

    const [images] = await db.query(
      'SELECT id, url, alt_text, sort_order, is_cover FROM images WHERE listing_id = ? ORDER BY sort_order',
      [listing.id]
    );
    listing.images = images;

    const [reviews] = await db.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.listing_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC LIMIT 10
    `, [listing.id]);
    listing.reviews = reviews;

    db.query(
      'INSERT INTO listing_views (listing_id, user_id, ip_hash, user_agent) VALUES (?,?,?,?)',
      [listing.id, req.user?.id || null, ipHash(req), req.headers['user-agent']?.slice(0, 500) || null]
    ).catch(() => {});

    return success(res, listing);
  } catch (err) { next(err); }
};

// CREATE — controller-level validation for clear errors
exports.createListing = async (req, res, next) => {
  try {
    const {
      title, category, description, short_desc, location,
      features, contact_info, opening_hours, menu_url,
      is_featured, owner_id, images,
    } = req.body;

    if (!title?.trim())       return error(res, 'Title is required', 400);
    if (!category)            return error(res, 'Category is required', 400);
    if (!description?.trim()) return error(res, 'Description is required', 400);
    if (!location?.trim())    return error(res, 'Location is required', 400);

    const slug = title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const [result] = await db.query(`
      INSERT INTO listings
        (title, slug, category, description, short_desc, location,
         features, contact_info, opening_hours, menu_url, is_featured, owner_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      title.trim(), slug, category, description.trim(),
      short_desc?.trim() || null, location.trim(),
      JSON.stringify(Array.isArray(features) ? features : []),
      JSON.stringify(contact_info && typeof contact_info === 'object' ? contact_info : {}),
      opening_hours && typeof opening_hours === 'object' ? JSON.stringify(opening_hours) : null,
      menu_url || null,
      is_featured ? 1 : 0,
      owner_id ? parseInt(owner_id) : null,
    ]);

    const listingId = result.insertId;

    if (Array.isArray(images) && images.length) {
      const imgValues = images
        .filter(img => img && img.url)
        .map((img, i) => [listingId, img.url, img.alt_text || null, i, i === 0 ? 1 : 0]);
      if (imgValues.length) {
        await db.query(
          'INSERT INTO images (listing_id, url, alt_text, sort_order, is_cover) VALUES ?',
          [imgValues]
        );
      }
    }

    const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [listingId]);
    const l = rows[0];
    l.features      = safeJson(l.features, []);
    l.contact_info  = safeJson(l.contact_info, {});
    l.opening_hours = safeJson(l.opening_hours, null);
    return success(res, l, 'Listing created', 201);
  } catch (err) { next(err); }
};

exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title','category','description','short_desc','location',
                     'features','contact_info','opening_hours','menu_url',
                     'is_featured','is_active','owner_id'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    if (updates.features)     updates.features     = JSON.stringify(Array.isArray(updates.features) ? updates.features : []);
    if (updates.contact_info) updates.contact_info = JSON.stringify(typeof updates.contact_info === 'object' ? updates.contact_info : {});
    if (updates.opening_hours !== undefined) {
      updates.opening_hours = updates.opening_hours && typeof updates.opening_hours === 'object'
        ? JSON.stringify(updates.opening_hours) : null;
    }

    if (Object.keys(updates).length) {
      const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
      await db.query(`UPDATE listings SET ${sets} WHERE id = ?`, [...Object.values(updates), id]);
    }

    // Replace image list when provided
    if (Array.isArray(req.body.images)) {
      await db.query('DELETE FROM images WHERE listing_id = ?', [id]);
      const imgValues = req.body.images
        .filter(img => img && img.url)
        .map((img, i) => [id, img.url, img.alt_text || null, i, i === 0 ? 1 : 0]);
      if (imgValues.length) {
        await db.query(
          'INSERT INTO images (listing_id, url, alt_text, sort_order, is_cover) VALUES ?',
          [imgValues]
        );
      }
    }

    const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [id]);
    if (!rows.length) return error(res, 'Listing not found', 404);
    const l = rows[0];
    l.features      = safeJson(l.features, []);
    l.contact_info  = safeJson(l.contact_info, {});
    l.opening_hours = safeJson(l.opening_hours, null);
    return success(res, l, 'Listing updated');
  } catch (err) { next(err); }
};

exports.deleteListing = async (req, res, next) => {
  try {
    await db.query('UPDATE listings SET is_active = 0 WHERE id = ?', [req.params.id]);
    return success(res, null, 'Listing deactivated');
  } catch (err) { next(err); }
};

exports.trackClick = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { button_type } = req.body;
    const validTypes = ['call','directions','menu','website','instagram','facebook','share'];
    if (!validTypes.includes(button_type)) return error(res, 'Invalid button type', 400);
    await db.query(
      'INSERT INTO listing_clicks (listing_id, user_id, button_type) VALUES (?,?,?)',
      [id, req.user?.id || null, button_type]
    );
    return success(res, null, 'Click tracked');
  } catch (err) { next(err); }
};

exports.autocomplete = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return success(res, []);
    const [rows] = await db.query(`
      SELECT l.id, l.title, l.slug, l.category, l.short_desc,
             (SELECT url FROM images WHERE listing_id = l.id AND is_cover = 1 LIMIT 1) AS cover_image
      FROM listings l
      WHERE l.is_active = 1 AND (l.title LIKE ? OR l.category LIKE ?)
      LIMIT 6
    `, [`%${q}%`, `%${q}%`]);
    return success(res, rows);
  } catch (err) { next(err); }
};
