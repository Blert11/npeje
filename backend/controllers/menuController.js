const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/listings/:listingId/menu
// Returns items grouped by user-defined category
exports.getMenu = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const [categories] = await db.query(`
      SELECT id, name, icon, sort_order
      FROM menu_categories
      WHERE listing_id = ? AND is_active = 1
      ORDER BY sort_order ASC, id ASC
    `, [listingId]);

    const [items] = await db.query(`
      SELECT id, category_id, name, description, price, currency, image,
             is_available, sort_order
      FROM menu_items
      WHERE listing_id = ? AND is_available = 1
      ORDER BY sort_order ASC, id ASC
    `, [listingId]);

    // Group items by category_id
    const grouped = categories.map(cat => ({
      ...cat,
      items: items.filter(i => i.category_id === cat.id),
    }));

    const uncategorized = items.filter(i => !i.category_id);
    if (uncategorized.length) {
      grouped.push({
        id: null,
        name: 'Other',
        icon: null,
        sort_order: 9999,
        items: uncategorized,
      });
    }

    return success(res, { categories: grouped });
  } catch (err) { next(err); }
};

// POST /api/listings/:listingId/menu
exports.createItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const {
      category_id, name, description, price,
      currency = 'EUR', image, sort_order = 0,
    } = req.body;

    if (!name?.trim())       return error(res, 'Name is required', 400);
    if (price === undefined || price === null || price === '') {
      return error(res, 'Price is required', 400);
    }

    const [result] = await db.query(`
      INSERT INTO menu_items
        (listing_id, category_id, name, description, price, currency, image, sort_order)
      VALUES (?,?,?,?,?,?,?,?)
    `, [
      listingId,
      category_id || null,
      name.trim(),
      description?.trim() || null,
      parseFloat(price),
      currency,
      image || null,
      parseInt(sort_order) || 0,
    ]);

    const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    return success(res, rows[0], 'Item created', 201);
  } catch (err) { next(err); }
};

// PUT /api/menu/:id
exports.updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['category_id','name','description','price',
                     'currency','image','is_available','sort_order'];
    const updates = {};
    allowed.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    if (updates.name !== undefined)  updates.name = String(updates.name).trim();
    if (updates.price !== undefined) updates.price = parseFloat(updates.price);

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE menu_items SET ${sets} WHERE id = ?`, [...Object.values(updates), id]);

    const [rows] = await db.query('SELECT * FROM menu_items WHERE id = ?', [id]);
    if (!rows.length) return error(res, 'Item not found', 404);
    return success(res, rows[0], 'Item updated');
  } catch (err) { next(err); }
};

// DELETE /api/menu/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
    return success(res, null, 'Item deleted');
  } catch (err) { next(err); }
};
