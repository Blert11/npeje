const { validationResult } = require('express-validator');
const db = require('../config/db');
const { success, error } = require('../utils/response');

// POST /api/contacts
exports.submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return error(res, 'Validation failed', 400, errors.array());

    const { name, email, phone, message, listing_id, contact_type } = req.body;
    const userId = req.user?.id || null;

    await db.query(
      'INSERT INTO contacts (listing_id, user_id, name, email, phone, message, contact_type) VALUES (?,?,?,?,?,?,?)',
      [listing_id || null, userId, name, email, phone || null, message,
       contact_type || (listing_id ? 'listing_inquiry' : 'general')]
    );

    return success(res, null, 'Message sent successfully', 201);
  } catch (err) { next(err); }
};
