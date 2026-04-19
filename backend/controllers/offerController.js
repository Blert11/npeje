const { validationResult } = require('express-validator');
const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/offers  – active offers for homepage carousel
exports.getOffers = async (req, res, next) => {
  try {
    const [offers] = await db.query(`
      SELECT o.*, l.title AS listing_title, l.slug AS listing_slug
      FROM offers o
      JOIN listings l ON l.id = o.listing_id
      WHERE o.is_active = 1 AND (o.valid_until IS NULL OR o.valid_until >= CURDATE())
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    return success(res, offers);
  } catch (err) { next(err); }
};

// POST /api/offers (admin)
exports.createOffer = async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return error(res, 'Validation failed', 400, errs.array());

    const {
      listing_id, title, description, image, discount, valid_until,
      action_type = 'listing', action_value,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO offers
        (listing_id, title, description, image, discount, valid_until, action_type, action_value)
       VALUES (?,?,?,?,?,?,?,?)`,
      [listing_id, title || '', description || null, image || null,
       discount || null, valid_until || null,
       action_type, action_value || null]
    );

    const [[offer]] = await db.query('SELECT * FROM offers WHERE id = ?', [result.insertId]);
    return success(res, offer, 'Offer created', 201);
  } catch (err) { next(err); }
};

// PUT /api/offers/:id
exports.updateOffer = async (req, res, next) => {
  try {
    const allowed = ['title','description','image','discount','valid_until',
                     'action_type','action_value','is_active'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (!Object.keys(updates).length) return error(res, 'Nothing to update', 400);

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE offers SET ${sets} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    const [[row]] = await db.query('SELECT * FROM offers WHERE id = ?', [req.params.id]);
    return success(res, row, 'Offer updated');
  } catch (err) { next(err); }
};

// DELETE /api/offers/:id
exports.deleteOffer = async (req, res, next) => {
  try {
    await db.query('DELETE FROM offers WHERE id = ?', [req.params.id]);
    return success(res, null, 'Offer deleted');
  } catch (err) { next(err); }
};
