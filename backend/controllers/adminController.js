const bcrypt  = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const { success, error, paginate } = require('../utils/response');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const conditions = [];
    if (role)   { conditions.push('role = ?');                          params.push(role); }
    if (search) { conditions.push('(name LIKE ? OR email LIKE ?)');     params.push(`%${search}%`, `%${search}%`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const [users] = await db.query(
      `SELECT id, name, email, role, is_active, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return paginate(res, users, total, page, limit);
  } catch (err) { next(err); }
};

// POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return error(res, 'Validation failed', 400, errs.array());
    const { name, email, password, role = 'user' } = req.body;
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length) return error(res, 'Email already in use', 409);
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name.trim(), email.toLowerCase(), hash, role]
    );
    return success(res, { id: result.insertId, name, email: email.toLowerCase(), role }, 'User created', 201);
  } catch (err) { next(err); }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, is_active } = req.body;
    const updates = {};
    if (role      !== undefined) updates.role      = role;
    if (is_active !== undefined) updates.is_active = is_active ? 1 : 0;
    if (!Object.keys(updates).length) return error(res, 'Nothing to update', 400);
    const setClauses = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE users SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    return success(res, null, 'User updated');
  } catch (err) { next(err); }
};

// GET /api/admin/contacts
exports.getContacts = async (req, res, next) => {
  try {
    const [contacts] = await db.query(`
      SELECT c.*, l.title AS listing_title
      FROM contacts c
      LEFT JOIN listings l ON l.id = c.listing_id
      ORDER BY c.created_at DESC LIMIT 100
    `);
    return success(res, contacts);
  } catch (err) { next(err); }
};

// PATCH /api/admin/contacts/:id/read
exports.markContactRead = async (req, res, next) => {
  try {
    await db.query('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
    return success(res, null, 'Marked as read');
  } catch (err) { next(err); }
};
