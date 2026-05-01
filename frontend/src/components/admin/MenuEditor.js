import { useState, useEffect } from 'react';
import { menuService } from '../../services/api';
import ImageUpload from '../common/ImageUpload';
import Icon from '../common/Icon';
import './MenuEditor.css';

/**
 * New v6 menu editor — category-based workflow.
 *
 * Left pane: list of categories (editable, addable, deletable)
 * Right pane: items belonging to the selected category
 *
 * Steps to add a menu item:
 *   1. Click "+ Category" if needed (Drinks, Mains, Soups, …)
 *   2. Select the category in the left list
 *   3. Click "+ Add item" → fill in name, price → Save. Done.
 */
export default function MenuEditor({ listingId, listingName, onClose }) {
  const [categories,    setCategories]    = useState([]);
  const [items,         setItems]         = useState({}); // { categoryId: [items] }
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  // Modals
  const [showCatModal,  setShowCatModal]  = useState(false);
  const [editingCat,    setEditingCat]    = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem,   setEditingItem]   = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: menuData } = await menuService.getItems(listingId);
      const groups = menuData.data?.categories || [];
      const cats = groups.filter(g => g.id !== null).map(g => ({
        id: g.id, name: g.name, icon: g.icon, sort_order: g.sort_order,
        item_count: g.items?.length || 0,
      }));
      const itemsByCat = {};
      groups.forEach(g => { itemsByCat[g.id || 'uncategorized'] = g.items || []; });
      setCategories(cats);
      setItems(itemsByCat);
      // Auto-select first category
      if (cats.length && !selectedCatId) setSelectedCatId(cats[0].id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [listingId]);

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Its items will become uncategorized.`)) return;
    try {
      await menuService.deleteCategory(cat.id);
      if (selectedCatId === cat.id) setSelectedCatId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await menuService.deleteItem(item.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const currentItems = selectedCatId ? (items[selectedCatId] || []) : (items.uncategorized || []);

  return (
    <div className="menu-editor-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="menu-editor">
        <header className="menu-editor__header">
          <div>
            <small>Menu editor</small>
            <h2>{listingName}</h2>
          </div>
          <button className="menu-editor__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        {error && <div className="menu-editor__error">{error}</div>}

        <div className="menu-editor__body">
          {/* LEFT — Categories */}
          <aside className="menu-editor__sidebar">
            <div className="menu-editor__sidebar-head">
              <h3>Categories</h3>
              <button className="menu-editor__add-cat"
                onClick={() => { setEditingCat(null); setShowCatModal(true); }}
                title="Add category">
                <Icon name="upload" size={14} strokeWidth={2.5} />
                <span>Category</span>
              </button>
            </div>

            {loading && <div className="menu-editor__loading">Loading…</div>}

            {!loading && categories.length === 0 && (
              <div className="menu-editor__empty-cats">
                <Icon name="menu_book" size={32} strokeWidth={1.5} />
                <p>No categories yet.</p>
                <small>Add "Drinks", "Mains", "Desserts", etc. to organize your menu.</small>
                <button className="btn btn-primary btn-sm"
                  onClick={() => { setEditingCat(null); setShowCatModal(true); }}>
                  Create first category
                </button>
              </div>
            )}

            <ul className="menu-editor__cat-list">
              {categories.map(cat => (
                <li key={cat.id}
                  className={`cat-row ${selectedCatId === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCatId(cat.id)}>
                  <div className="cat-row__info">
                    <strong>{cat.name}</strong>
                    <span>{cat.item_count} {cat.item_count === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="cat-row__actions">
                    <button className="cat-row__btn"
                      onClick={(e) => { e.stopPropagation(); setEditingCat(cat); setShowCatModal(true); }}
                      title="Edit name">
                      <Icon name="upload" size={12} />
                    </button>
                    <button className="cat-row__btn danger"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                      title="Delete">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                </li>
              ))}

              {(items.uncategorized || []).length > 0 && (
                <li className={`cat-row cat-row--uncat ${selectedCatId === null ? 'active' : ''}`}
                  onClick={() => setSelectedCatId(null)}>
                  <div className="cat-row__info">
                    <strong>Uncategorized</strong>
                    <span>{items.uncategorized.length} items</span>
                  </div>
                </li>
              )}
            </ul>
          </aside>

          {/* RIGHT — Items */}
          <main className="menu-editor__main">
            {categories.length === 0 && !loading ? (
              <div className="menu-editor__start">
                <Icon name="chevron_left" size={40} strokeWidth={1.5} />
                <h3>Start by creating a category</h3>
                <p>Categories help organize your menu (e.g. Drinks, Mains, Desserts).</p>
              </div>
            ) : (
              <>
                <div className="menu-editor__main-head">
                  <div>
                    {selectedCatId !== null
                      ? <h3>{categories.find(c => c.id === selectedCatId)?.name || ''}</h3>
                      : <h3>Uncategorized items</h3>}
                    <small>{currentItems.length} {currentItems.length === 1 ? 'item' : 'items'}</small>
                  </div>
                  {selectedCatId !== null && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { setEditingItem(null); setShowItemModal(true); }}>
                      <Icon name="upload" size={14} strokeWidth={2.5} />
                      Add item
                    </button>
                  )}
                </div>

                {currentItems.length === 0 ? (
                  <div className="menu-editor__empty">
                    <Icon name="menu_book" size={40} strokeWidth={1.5} />
                    <p>No items in this category yet.</p>
                    {selectedCatId !== null && (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setEditingItem(null); setShowItemModal(true); }}>
                        Add your first item
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="menu-items-grid">
                    {currentItems.map(item => (
                      <div key={item.id} className="menu-item-card">
                        {item.image && (
                          <div className="menu-item-card__img">
                            <img src={item.image} alt={item.name} loading="lazy" />
                          </div>
                        )}
                        <div className="menu-item-card__body">
                          <div className="menu-item-card__top">
                            <strong>{item.name}</strong>
                            <span className="menu-item-card__price">
                              {Number(item.price).toFixed(2)} {item.currency || 'EUR'}
                            </span>
                          </div>
                          {item.description && (
                            <p className="menu-item-card__desc">{item.description}</p>
                          )}
                          <div className="menu-item-card__actions">
                            <button className="mini-btn"
                              onClick={() => { setEditingItem(item); setShowItemModal(true); }}>
                              Edit
                            </button>
                            <button className="mini-btn danger"
                              onClick={() => handleDeleteItem(item)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {showCatModal && (
          <CategoryModal
            listingId={listingId}
            category={editingCat}
            onClose={() => setShowCatModal(false)}
            onSaved={() => { setShowCatModal(false); load(); }}
          />
        )}

        {showItemModal && selectedCatId !== null && (
          <ItemModal
            listingId={listingId}
            categoryId={selectedCatId}
            categoryName={categories.find(c => c.id === selectedCatId)?.name}
            item={editingItem}
            onClose={() => setShowItemModal(false)}
            onSaved={() => { setShowItemModal(false); load(); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────
function CategoryModal({ listingId, category, onClose, onSaved }) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Name is required');
    setSaving(true); setErr('');
    try {
      if (isEdit) await menuService.updateCategory(category.id, { name: name.trim() });
      else        await menuService.createCategory(listingId, { name: name.trim() });
      onSaved();
    } catch (e) { setErr(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="me-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="me-modal">
        <header>
          <h3>{isEdit ? 'Edit category' : 'New category'}</h3>
          <button className="me-modal__close" onClick={onClose}><Icon name="close" size={18} /></button>
        </header>
        <form onSubmit={submit}>
          <label className="form-label">Name</label>
          <input className="form-input" value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Drinks, Mains, Desserts"
            autoFocus />
          <div className="me-modal__hints">
            Common examples: <span onClick={() => setName('Drinks')}>Drinks</span>
            <span onClick={() => setName('Starters')}>Starters</span>
            <span onClick={() => setName('Main Dishes')}>Main Dishes</span>
            <span onClick={() => setName('Soups')}>Soups</span>
            <span onClick={() => setName('Desserts')}>Desserts</span>
            <span onClick={() => setName('Pizza')}>Pizza</span>
          </div>
          {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
          <footer>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : (isEdit ? 'Save' : 'Create')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

// ─── Item Modal ───────────────────────────────────────────
function ItemModal({ listingId, categoryId, categoryName, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name:        item?.name || '',
    description: item?.description || '',
    price:       item?.price ?? '',
    currency:    item?.currency || 'EUR',
  });
  const [image, setImage] = useState(item?.image || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr('Name is required');
    if (form.price === '') return setErr('Price is required');

    setSaving(true); setErr('');
    try {
      const payload = {
        category_id: categoryId,
        name:        form.name.trim(),
        description: form.description?.trim() || null,
        price:       parseFloat(form.price),
        currency:    form.currency,
        image:       image || null,
      };
      if (isEdit) await menuService.updateItem(item.id, payload);
      else        await menuService.createItem(listingId, payload);
      onSaved();
    } catch (e) { setErr(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="me-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="me-modal me-modal--item">
        <header>
          <div>
            <small>In {categoryName}</small>
            <h3>{isEdit ? 'Edit item' : 'New item'}</h3>
          </div>
          <button className="me-modal__close" onClick={onClose}><Icon name="close" size={18} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} required autoFocus
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Espresso, Margherita Pizza" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional — ingredients, size, etc." />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Price *</label>
              <input className="form-input" type="number" step="0.01" min="0" required
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-input" value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image (optional)</label>
            <ImageUpload value={image} onChange={setImage} aspectRatio="4/3" />
          </div>

          {err && <div className="auth-error">{err}</div>}

          <footer>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.name.trim() || form.price === ''}>
              {saving ? 'Saving…' : (isEdit ? 'Save' : 'Add item')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
