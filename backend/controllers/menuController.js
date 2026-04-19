const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/listings/:listingId/menu — public
exports.getMenu = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const [items] = await db.query(
      'SELECT * FROM menu_items WHERE listing_id = ? AND is_available = 1 ORDER BY sort_order, id',
      [listingId]
    );
    // Group by section
    const grouped = {};
    items.forEach(it => {
      const sec = it.section || 'Menu';
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(it);
    });
    return success(res, { sections: grouped, items });
  } catch (err) { next(err); }
};

// POST /api/listings/:listingId/menu (admin)
exports.createMenuItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { section, name, description, price, currency, image, sort_order } = req.body;

    if (!name || price === undefined)
      return error(res, 'Name and price are required', 400);

    const [result] = await db.query(
      `INSERT INTO menu_items (listing_id, section, name, description, price, currency, image, sort_order)
       VALUES (?,?,?,?,?,?,?,?)`,
      [listingId, section || null, name, description || null,
       parseFloat(price), currency || '€', image || null, sort_order || 0]
    );
    const [[item]] = await db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    return success(res, item, 'Menu item created', 201);
  } catch (err) { next(err); }
};

// PUT /api/menu/:id (admin)
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['section','name','description','price','currency','image','is_available','sort_order'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (!Object.keys(updates).length) return error(res, 'Nothing to update', 400);

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE menu_items SET ${sets} WHERE id = ?`, [...Object.values(updates), id]);

    const [[item]] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!item) return error(res, 'Menu item not found', 404);
    return success(res, item, 'Updated');
  } catch (err) { next(err); }
};

// DELETE /api/menu/:id (admin)
exports.deleteMenuItem = async (req, res, next) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    return success(res, null, 'Deleted');
  } catch (err) { next(err); }
};
