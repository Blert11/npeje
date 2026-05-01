const db = require('../config/db');
const { success, error } = require('../utils/response');

// GET /api/menu-categories/listings/:listingId
exports.getCategories = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const [rows] = await db.query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM menu_items m WHERE m.category_id = c.id AND m.is_available = 1) AS item_count
      FROM menu_categories c
      WHERE c.listing_id = ? AND c.is_active = 1
      ORDER BY c.sort_order ASC, c.id ASC
    `, [listingId]);
    return success(res, rows);
  } catch (err) { next(err); }
};

// POST /api/menu-categories/listings/:listingId   (admin/owner only)
exports.createCategory = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { name, icon } = req.body;

    if (!name?.trim()) return error(res, 'Category name is required', 400);

    const [[maxRow]] = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM menu_categories WHERE listing_id = ?',
      [listingId]
    );

    const [result] = await db.query(
      'INSERT INTO menu_categories (listing_id, name, icon, sort_order) VALUES (?,?,?,?)',
      [listingId, name.trim(), icon || null, maxRow.next_order]
    );

    const [rows] = await db.query('SELECT * FROM menu_categories WHERE id = ?', [result.insertId]);
    return success(res, rows[0], 'Category created', 201);
  } catch (err) { next(err); }
};

// PUT /api/menu-categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    if (name !== undefined && !name?.trim()) {
      return error(res, 'Category name cannot be empty', 400);
    }

    const updates = {};
    if (name  !== undefined) updates.name = name.trim();
    if (icon !== undefined)  updates.icon = icon || null;

    if (Object.keys(updates).length) {
      const sets = Object.keys(updates).map(k => `\`${k}\` = ?`).join(', ');
      await db.query(`UPDATE menu_categories SET ${sets} WHERE id = ?`, [...Object.values(updates), id]);
    }

    const [rows] = await db.query('SELECT * FROM menu_categories WHERE id = ?', [id]);
    if (!rows.length) return error(res, 'Category not found', 404);
    return success(res, rows[0], 'Category updated');
  } catch (err) { next(err); }
};

// DELETE /api/menu-categories/:id   (sets items to uncategorized)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Items become uncategorized
    await db.query('UPDATE menu_items SET category_id = NULL WHERE category_id = ?', [id]);
    // Hard-delete the category row
    await db.query('DELETE FROM menu_categories WHERE id = ?', [id]);
    return success(res, null, 'Category deleted');
  } catch (err) { next(err); }
};

// PUT /api/menu-categories/listings/:listingId/reorder
exports.reorderCategories = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { ids } = req.body;
    if (!Array.isArray(ids)) return error(res, 'ids must be an array', 400);

    for (let i = 0; i < ids.length; i++) {
      await db.query(
        'UPDATE menu_categories SET sort_order = ? WHERE id = ? AND listing_id = ?',
        [i, ids[i], listingId]
      );
    }
    return success(res, null, 'Reordered');
  } catch (err) { next(err); }
};
