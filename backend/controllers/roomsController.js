const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/listings/:listingId/rooms
exports.getRooms = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM rooms
      WHERE listing_id = ? AND is_available = 1
      ORDER BY sort_order ASC, price_per_night ASC
    `, [req.params.listingId]);

    rows.forEach(r => {
      try { r.amenities = JSON.parse(r.amenities); } catch { r.amenities = []; }
    });

    return success(res, rows);
  } catch (err) { next(err); }
};

// POST /api/listings/:listingId/rooms (admin/business)
exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, price_per_night, currency, beds, max_guests, size_sqm, amenities, image } = req.body;
    if (!name?.trim()) return error(res, 'Room name required', 400);
    if (!price_per_night) return error(res, 'Price required', 400);

    const [result] = await db.query(`
      INSERT INTO rooms (listing_id, name, description, price_per_night, currency, beds, max_guests, size_sqm, amenities, image)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `, [
      req.params.listingId, name.trim(), description?.trim() || null,
      parseFloat(price_per_night), currency || 'EUR',
      beds || null, max_guests || 2, size_sqm || null,
      JSON.stringify(Array.isArray(amenities) ? amenities : []),
      image || null,
    ]);

    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
    return success(res, rows[0], 'Room created', 201);
  } catch (err) { next(err); }
};

// PUT /api/rooms/:id (admin/business)
exports.updateRoom = async (req, res, next) => {
  try {
    const allowed = ['name','description','price_per_night','currency','beds','max_guests','size_sqm','amenities','image','is_available','sort_order'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (updates.amenities) updates.amenities = JSON.stringify(updates.amenities);
    if (!Object.keys(updates).length) return error(res, 'No fields', 400);

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE rooms SET ${sets} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    return success(res, rows[0], 'Room updated');
  } catch (err) { next(err); }
};

// DELETE /api/rooms/:id
exports.deleteRoom = async (req, res, next) => {
  try {
    await db.query('DELETE FROM rooms WHERE id = ?', [req.params.id]);
    return success(res, null, 'Room deleted');
  } catch (err) { next(err); }
};
