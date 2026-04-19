import { useState, useEffect } from 'react';
import api from '../../services/api';
import ImageUpload, { resolveUrl } from '../common/ImageUpload';
import './MenuEditor.css';

export default function MenuEditor({ listingId, listingName, onClose }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/listings/${listingId}/menu`)
      .then(r => setItems(r.data.data.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    load();
    return () => { document.body.style.overflow = ''; };
  }, [listingId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    await api.delete(`/menu/${id}`);
    load();
  };

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  return (
    <div className="menu-editor" onClick={onClose}>
      <div className="menu-editor__panel" onClick={(e) => e.stopPropagation()}>
        <div className="menu-editor__header">
          <div>
            <span className="menu-editor__eyebrow">{listingName}</span>
            <h2>Menu Editor</h2>
          </div>
          <button className="menu-editor__close" onClick={onClose}>×</button>
        </div>

        <div className="menu-editor__body">
          {editing ? (
            <ItemForm
              listingId={listingId}
              item={editing === 'new' ? null : editing}
              onCancel={() => setEditing(null)}
              onSaved={handleSaved} />
          ) : (
            <>
              <button className="btn btn-primary menu-editor__add-btn"
                onClick={() => setEditing('new')}>
                + Add Menu Item
              </button>

              {loading && <p style={{ color:'var(--gray-400)', padding:'24px', textAlign:'center' }}>Loading…</p>}

              {!loading && items.length === 0 && (
                <div className="menu-editor__empty">
                  <span>🍽️</span>
                  <p>No menu items yet.</p>
                  <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                    Add your first dish by clicking the button above.
                  </p>
                </div>
              )}

              <div className="menu-editor__items">
                {items.map(item => (
                  <div key={item.id} className="menu-editor__item">
                    <div className="menu-editor__item-img">
                      {item.image
                        ? <img src={resolveUrl(item.image)} alt={item.name} />
                        : <span>🍴</span>}
                    </div>
                    <div className="menu-editor__item-body">
                      <div className="menu-editor__item-top">
                        {item.section && <span className="menu-editor__section">{item.section}</span>}
                        <strong>{item.name}</strong>
                        <span className="menu-editor__item-price">
                          {item.currency || '€'}{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="menu-editor__item-desc">{item.description}</p>
                      )}
                    </div>
                    <div className="menu-editor__item-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(item)}>Edit</button>
                      <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemForm({ listingId, item, onCancel, onSaved }) {
  const [form, setForm] = useState({
    section:     item?.section     || '',
    name:        item?.name        || '',
    description: item?.description || '',
    price:       item?.price       || '',
    currency:    item?.currency    || '€',
  });
  const [image, setImage]   = useState(item?.image || '');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const f = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        image: image || null,
      };
      if (item) await api.put(`/menu/${item.id}`, payload);
      else      await api.post(`/listings/${listingId}/menu`, payload);
      onSaved();
    } catch (er) { setErr(er.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <form className="menu-editor__form" onSubmit={handleSubmit}>
      <h3>{item ? 'Edit' : 'New'} Menu Item</h3>

      <div className="form-group">
        <label className="form-label">Image</label>
        <ImageUpload value={image} onChange={setImage} aspectRatio="1/1" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Section (optional)</label>
          <input className="form-input" {...f('section')}
            placeholder="e.g. Starters, Mains, Drinks" />
        </div>
        <div className="form-group">
          <label className="form-label">Dish name *</label>
          <input className="form-input" required {...f('name')} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-input" rows={2} {...f('description')}
          placeholder="Short description…" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Price *</label>
          <input className="form-input" type="number" step="0.01" min="0" required {...f('price')} />
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-input" {...f('currency')}>
            <option value="€">€</option>
            <option value="$">$</option>
            <option value="£">£</option>
          </select>
        </div>
      </div>

      {err && <div className="auth-error">{err}</div>}

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
