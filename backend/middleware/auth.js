const jwt = require('jsonwebtoken');
const db  = require('../config/db');
const { error } = require('../utils/response');

/**
 * Verify JWT and attach req.user
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    if (!rows.length) return error(res, 'User not found', 401);
    req.user = rows[0];
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
};

/**
 * Optional auth – attaches user if token present, continues either way
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    if (rows.length) req.user = rows[0];
  } catch { /* ignore */ }
  next();
};

/**
 * Role guard factory
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Authentication required', 401);
  if (!roles.includes(req.user.role)) {
    return error(res, 'Access denied', 403);
  }
  next();
};

module.exports = { authenticate, optionalAuth, authorize };
