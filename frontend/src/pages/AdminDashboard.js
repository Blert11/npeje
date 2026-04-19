import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { adminService, analyticsService, listingService, offerService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import { formatDate, getCategoryConfig, CATEGORIES } from '../utils/helpers';
import ImageUpload, { resolveUrl } from '../components/common/ImageUpload';
import MenuEditor from '../components/admin/MenuEditor';
import StatisticsPage from './StatisticsPage';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const NAV = [
    { to: '/admin',            label: '📊 ' + t('admin.overview'),  end: true },
    { to: '/admin/listings',   label: '🏨 ' + t('admin.listings') },
    { to: '/admin/users',      label: '👥 ' + t('admin.users') },
    { to: '/admin/offers',     label: '🎁 ' + t('admin.offers') },
    { to: '/admin/contacts',   label: '✉️ ' + t('admin.contacts') },
    { to: '/admin/statistics', label: '📈 ' + t('admin.analytics') },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link to="/">npeje.com <small>admin</small></Link>
        </div>
        <nav className="admin-sidebar__nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-sidebar__logout btn btn-ghost btn-sm"
          onClick={() => { logout(); navigate('/'); }}>
          {t('nav.signout')}
        </button>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <span className="admin-topbar__title">Admin Panel</span>
          <span className="admin-topbar__user">{user?.name}</span>
        </div>
        <div className="admin-page-content">
          <Routes>
            <Route index               element={<AdminOverview />} />
            <Route path="listings/*"   element={<AdminListings />} />
            <Route path="users"        element={<AdminUsers />} />
            <Route path="offers"       element={<AdminOffers />} />
            <Route path="contacts"     element={<AdminContacts />} />
            <Route path="statistics"   element={<StatisticsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [data, setData] = useState(null);
  useEffect(() => { analyticsService.overview().then(r => setData(r.data.data)); }, []);
  if (!data) return <div className="admin-loading">Loading…</div>;

  const COLORS = ['#336f70','#4a9192','#c8a96a','#3b82f6','#f97316','#a855f7','#ec4899','#6366f1','#ef4444'];

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: 'Listings',    value: data.totals.total_listings, icon: '🏨' },
          { label: 'Users',       value: data.totals.total_users,    icon: '👥' },
          { label: 'Reviews',     value: data.totals.total_reviews,  icon: '⭐' },
          { label: 'Views (30d)', value: data.totals.views_30d,      icon: '👁' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <span className="stat-card__icon">{s.icon}</span>
            <div>
              <span className="stat-card__value">{Number(s.value).toLocaleString()}</span>
              <span className="stat-card__label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h3>Listings by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data.categoryStats} dataKey="count" nameKey="category"
                cx="50%" cy="50%" outerRadius={80}
                label={({ category, count }) => `${category} (${count})`}
                labelLine={false}>
                {data.categoryStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-chart-card">
          <h3>Top Listings (30d)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topListings} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="title" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="view_count" fill="#336f70" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-table-card">
        <h3>Recent Users</h3>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            {data.recentUsers.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td>{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [menuFor,  setMenuFor]  = useState(null);

  const load = () => {
    setLoading(true);
    listingService.getAll({ limit: 100 })
      .then(r => setListings(r.data.data || []))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this listing?')) return;
    await listingService.delete(id);
    load();
  };

  const toggleActive = async (listing) => {
    const newValue = Number(listing.is_active) === 1 ? 0 : 1;
    await listingService.update(listing.id, { is_active: newValue });
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2>Listings</h2>
        <button className="btn btn-primary btn-sm"
          onClick={() => { setEditing(null); setShowForm(true); }}>
          + New Listing
        </button>
      </div>

      {showForm && (
        <ListingFormModal
          listing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }} />
      )}

      {menuFor && (
        <MenuEditor
          listingId={menuFor.id}
          listingName={menuFor.title}
          onClose={() => setMenuFor(null)} />
      )}

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={5} style={{ textAlign:'center', padding:'32px', color:'var(--gray-400)' }}>Loading…</td></tr>
              : listings.map(l => {
                const cat        = getCategoryConfig(l.category);
                const isActive   = Number(l.is_active) === 1;
                const hasMenu    = ['restaurants','fast_food','cafes'].includes(l.category);
                return (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong></td>
                    <td><span className="badge badge-primary">{cat.icon} {l.category.replace('_',' ')}</span></td>
                    <td>{l.is_featured ? '⭐' : '—'}</td>
                    <td>
                      <span className={`status-dot ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setEditing(l); setShowForm(true); }}>Edit</button>
                        {hasMenu && (
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => setMenuFor(l)}>Menu</button>
                        )}
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => toggleActive(l)}>
                          {isActive ? 'Disable' : 'Enable'}
                        </button>
                        <Link to={`/listings/${l.slug}`} target="_blank"
                          className="btn btn-ghost btn-sm">View</Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FIXED Listing Form ────────────────────────────────────
function ListingFormModal({ listing, onClose, onSaved }) {
  const isEdit = !!listing;

  const [form, setForm] = useState({
    title:        listing?.title        || '',
    category:     listing?.category     || 'hotels',
    description:  listing?.description  || '',
    short_desc:   listing?.short_desc   || '',
    location:     listing?.location     || '',
    is_featured:  listing?.is_featured  || 0,
    features:     Array.isArray(listing?.features) ? listing.features.join(', ') : '',
    contact_phone:     listing?.contact_info?.phone     || '',
    contact_email:     listing?.contact_info?.email     || '',
    contact_website:   listing?.contact_info?.website   || '',
    contact_instagram: listing?.contact_info?.instagram || '',
  });

  const initialImages = listing?.images?.map(i => i.url) || [];
  const [coverImage,  setCoverImage]  = useState(initialImages[0] || '');
  const [extraImages, setExtraImages] = useState(initialImages.slice(1));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const f = (name) => ({
    value: form[name],
    onChange: (e) => setForm(prev => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!form.title.trim())       throw new Error('Title is required');
      if (!form.description.trim()) throw new Error('Description is required');
      if (!form.location.trim())    throw new Error('Location is required');

      const images = [];
      if (coverImage) images.push({ url: coverImage });
      extraImages.forEach(url => { if (url) images.push({ url }); });

      const payload = {
        title:       form.title.trim(),
        category:    form.category,
        description: form.description.trim(),
        short_desc:  form.short_desc?.trim() || null,
        location:    form.location.trim(),
        features:    form.features.split(',').map(s => s.trim()).filter(Boolean),
        is_featured: form.is_featured ? 1 : 0,
        contact_info: {
          phone:     form.contact_phone?.trim()     || undefined,
          email:     form.contact_email?.trim()     || undefined,
          website:   form.contact_website?.trim()   || undefined,
          instagram: form.contact_instagram?.trim() || undefined,
        },
        images,
      };

      if (isEdit) await listingService.update(listing.id, payload);
      else        await listingService.create(payload);
      onSaved();
    } catch (err) {
      let msg = err.response?.data?.message || err.message || 'Save failed';
      if (err.response?.data?.errors?.length) {
        msg += ': ' + err.response.data.errors.map(e => e.msg || e.message).join(', ');
      }
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Listing' : 'New Listing'}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" required {...f('title')} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" {...f('category')}>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.id.replace('_',' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <input className="form-input" {...f('short_desc')}
              placeholder="One-line summary" />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input" required rows={4} {...f('description')} />
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-input" required {...f('location')}
              placeholder="e.g. Rr. UCK 45, Pejë" />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image *</label>
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              aspectRatio="16/9" />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Images (optional)</label>
            <div className="image-grid">
              {extraImages.map((url, idx) => (
                <ImageUpload
                  key={idx}
                  value={url}
                  onChange={(newUrl) => {
                    if (!newUrl) setExtraImages(prev => prev.filter((_, i) => i !== idx));
                    else         setExtraImages(prev => prev.map((u, i) => i === idx ? newUrl : u));
                  }}
                  aspectRatio="4/3" />
              ))}
              {extraImages.length < 8 && (
                <ImageUpload
                  value=""
                  onChange={(url) => { if (url) setExtraImages(prev => [...prev, url]); }}
                  aspectRatio="4/3" />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Features (comma-separated)</label>
            <input className="form-input" {...f('features')}
              placeholder="Free WiFi, Parking, Mountain View" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" {...f('contact_phone')} placeholder="+383 …" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" {...f('contact_email')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" {...f('contact_website')} placeholder="https://…" />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram handle</label>
              <input className="form-input" {...f('contact_instagram')} placeholder="@handle" />
            </div>
          </div>

          <label className="filter-checkbox">
            <input type="checkbox" checked={!!form.is_featured}
              onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked ? 1 : 0 }))} />
            Mark as Featured
          </label>

          {error && <div className="auth-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', email:'', password:'', role:'user' });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  const load = () => adminService.getUsers().then(r => setUsers(r.data.data || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try { await adminService.createUser(newUser); setShowForm(false); load(); setNewUser({name:'',email:'',password:'',role:'user'}); }
    catch (er) { setErr(er.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    await adminService.updateUser(u.id, { is_active: u.is_active ? 0 : 1 });
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <h2>Users</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ New User</button>
      </div>

      {showForm && (
        <div className="admin-inline-form">
          <form onSubmit={handleCreate} className="form-row" style={{ alignItems:'flex-end', gap:12 }}>
            {[['name','Name'],['email','Email'],['password','Password']].map(([n,l]) => (
              <div className="form-group" key={n} style={{ flex:1 }}>
                <label className="form-label">{l}</label>
                <input className="form-input" required value={newUser[n]}
                  type={n==='email'?'email':n==='password'?'password':'text'}
                  onChange={e => setNewUser(p => ({ ...p, [n]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group" style={{ flex:'0 0 120px' }}>
              <label className="form-label">Role</label>
              <select className="form-input" value={newUser.role}
                onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                <option value="user">user</option>
                <option value="business">business</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ marginBottom:0 }}>
              {saving ? '…' : 'Create'}
            </button>
          </form>
          {err && <p style={{ color:'var(--danger)', fontSize:13 }}>{err}</p>}
        </div>
      )}

      <div className="admin-table-card">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td><span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(u)}>
                    {u.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOffers() {
  const [offers,   setOffers]   = useState([]);
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);

  const load = () => {
    offerService.getAll().then(r => setOffers(r.data.data || []));
    listingService.getAll({ limit: 100 }).then(r => setListings(r.data.data || []));
  };
  useEffect(load, []);

  return (
    <div>
      <div className="admin-page-header">
        <h2>Offers</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          + New Offer
        </button>
      </div>

      {showForm && (
        <OfferFormModal
          offer={editing}
          listings={listings}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }} />
      )}

      <div className="offers-admin-grid">
        {offers.map(o => (
          <div key={o.id} className="offer-admin-card">
            <div className="offer-admin-card__img">
              {o.image && <img src={resolveUrl(o.image)} alt={o.title} />}
            </div>
            <div className="offer-admin-card__body">
              <strong>{o.listing_title}</strong>
              <span className="offer-admin-card__action">
                Action: <code>{o.action_type}</code>
                {o.action_value && ` → ${o.action_value}`}
              </span>
              <div className="offer-admin-card__actions">
                <button className="btn btn-ghost btn-sm"
                  onClick={() => { setEditing(o); setShowForm(true); }}>Edit</button>
                <button className="btn btn-ghost btn-sm danger"
                  onClick={async () => {
                    if (window.confirm('Delete offer?')) {
                      await offerService.delete(o.id); load();
                    }
                  }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <p style={{ color:'var(--gray-400)', padding:'32px', textAlign:'center', gridColumn:'1/-1' }}>
            No offers yet.
          </p>
        )}
      </div>
    </div>
  );
}

function OfferFormModal({ offer, listings, onClose, onSaved }) {
  const isEdit = !!offer;
  const [form, setForm] = useState({
    listing_id:   offer?.listing_id   || '',
    action_type:  offer?.action_type  || 'listing',
    action_value: offer?.action_value || '',
  });
  const [image,  setImage]  = useState(offer?.image || '');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = {
        listing_id:   parseInt(form.listing_id),
        image:        image || null,
        action_type:  form.action_type,
        action_value: form.action_value || null,
        title:        '', description: null,
      };
      if (isEdit) await offerService.update(offer.id, payload);
      else        await offerService.create(payload);
      onSaved();
    } catch (er) { setErr(er.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const actionHint = {
    listing:    'Click goes to the listing page',
    call:       'Phone number (e.g. +383 44 123 456)',
    whatsapp:   'WhatsApp number with country code',
    custom_url: 'Full URL (e.g. https://…)',
  }[form.action_type];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Offer' : 'New Offer'}</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Listing *</label>
            <select className="form-input" required value={form.listing_id}
              onChange={e => setForm(p => ({ ...p, listing_id: e.target.value }))}>
              <option value="">Select…</option>
              {listings.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Offer Image *</label>
            <ImageUpload value={image} onChange={setImage} aspectRatio="21/9" />
          </div>

          <div className="form-group">
            <label className="form-label">When image is clicked</label>
            <select className="form-input" value={form.action_type}
              onChange={e => setForm(p => ({ ...p, action_type: e.target.value }))}>
              <option value="listing">Open the listing</option>
              <option value="call">Call a number</option>
              <option value="whatsapp">Open WhatsApp chat</option>
              <option value="custom_url">Go to custom URL</option>
            </select>
          </div>

          {form.action_type !== 'listing' && (
            <div className="form-group">
              <label className="form-label">Action value</label>
              <input className="form-input" value={form.action_value}
                onChange={e => setForm(p => ({ ...p, action_value: e.target.value }))}
                placeholder={actionHint} />
              <small style={{ fontSize:12, color:'var(--gray-400)' }}>{actionHint}</small>
            </div>
          )}

          {err && <div className="auth-error">{err}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !image || !form.listing_id}>
              {saving ? 'Saving…' : 'Save Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  useEffect(() => { adminService.getContacts().then(r => setContacts(r.data.data || [])); }, []);

  const markRead = async (id) => {
    await adminService.markRead(id);
    setContacts(prev => prev.map(c => c.id === id ? { ...c, is_read: 1 } : c));
  };

  return (
    <div>
      <div className="admin-page-header"><h2>Contact Submissions</h2></div>
      <div className="admin-table-card">
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Message</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className={c.is_read ? '' : 'row-unread'}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td><span className="badge badge-primary">{c.contact_type}</span></td>
                <td style={{ maxWidth: 280 }}><span className="truncate-cell">{c.message}</span></td>
                <td>{formatDate(c.created_at)}</td>
                <td>
                  {!c.is_read
                    ? <button className="btn btn-primary btn-sm" onClick={() => markRead(c.id)}>Mark read</button>
                    : <span style={{ color:'var(--gray-400)', fontSize:13 }}>Read</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
