import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { favoritesService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/common/Icon';
import { formatDate, getCategoryConfig } from '../utils/helpers';
import { resolveUrl } from '../components/common/ImageUpload';
import './UserAccount.css';

export default function UserAccount() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  if (!user) return null;

  const TABS = [
    { id: 'profile',   icon: 'user',  label: 'Profile' },
    { id: 'favorites', icon: 'heart', label: 'Favorites' },
    { id: 'reviews',   icon: 'star',  label: 'My Reviews' },
    { id: 'password',  icon: 'check', label: 'Password' },
  ];

  return (
    <div className="ua page-enter">
      <div className="container ua__inner">
        <header className="ua__header">
          <div className="ua__avatar">
            {user.avatar
              ? <img src={resolveUrl(user.avatar)} alt={user.name} />
              : <span>{user.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div>
            <h1 className="display-heading">{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </header>

        <nav className="ua__tabs">
          {TABS.map(t2 => (
            <button key={t2.id}
              className={`ua__tab ${tab === t2.id ? 'active' : ''}`}
              onClick={() => setTab(t2.id)} type="button">
              <Icon name={t2.icon} size={16} /> {t2.label}
            </button>
          ))}
        </nav>

        <div className="ua__content">
          {tab === 'profile'   && <ProfileTab user={user} setUser={setUser} />}
          {tab === 'favorites' && <FavoritesTab />}
          {tab === 'reviews'   && <ReviewsTab />}
          {tab === 'password'  && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Favorites ──────────────────────────────────────────────
function FavoritesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesService.list()
      .then(({ data }) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const removeFav = async (listingId) => {
    try {
      await favoritesService.toggle(listingId);
      setItems(prev => prev.filter(i => i.listing_id !== listingId));
    } catch {}
  };

  if (loading) return <div className="ua__loading">Loading favorites…</div>;

  return (
    <div style={{ maxWidth: '100%' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>
        My Favorites ({items.length})
      </h2>

      {items.length === 0 ? (
        <div className="ua__empty">
          <Icon name="heart" size={40} strokeWidth={1.5} />
          <p>No favorites yet. Browse listings and tap the heart to save.</p>
          <Link to="/listings" className="btn btn-primary btn-sm">Explore listings</Link>
        </div>
      ) : (
        <div className="ua__fav-grid">
          {items.map(item => {
            const cat = getCategoryConfig(item.category);
            return (
              <div key={item.id} className="ua__fav-card">
                <div className="ua__fav-card-img">
                  <img
                    src={resolveUrl(item.cover_image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600'}
                    alt={item.title} loading="lazy"
                  />
                </div>
                <div className="ua__fav-card-body">
                  <span className="ua__fav-cat">
                    <Icon name={cat.iconName} size={12} />
                    {item.category?.replace('_', ' ')}
                  </span>
                  <strong>{item.title}</strong>
                  <span className="ua__fav-loc">
                    <Icon name="map_pin" size={11} /> {item.location}
                  </span>
                </div>
                <div className="ua__fav-actions">
                  <Link to={`/listings/${item.slug}`} className="ua__fav-view">
                    View
                  </Link>
                  <button className="ua__fav-del"
                    onClick={() => removeFav(item.listing_id)}
                    type="button">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Profile ────────────────────────────────────────────────
function ProfileTab({ user, setUser }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5MB'); return; }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = data.data?.url || data.url;
      if (url) setAvatarUrl(url);
    } catch { setErr('Upload failed'); }
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('');
    try {
      const { data } = await api.put('/auth/me', { name, email, avatar: avatarUrl });
      const updated = data.data;
      setUser({ ...user, ...updated });
      localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
      setMsg('Profile updated');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { setErr(e.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="ua__form">
      <h2>Profile information</h2>
      <div className="form-group">
        <label className="form-label">Profile photo</label>
        <div className="ua__avatar-picker">
          <div className="ua__avatar-preview">
            {avatarUrl ? <img src={resolveUrl(avatarUrl)} alt="" /> : <span>{name?.[0]?.toUpperCase()}</span>}
          </div>
          <label className="btn btn-outline btn-sm ua__avatar-btn">
            <Icon name="upload" size={14} />
            {avatarUrl ? 'Change photo' : 'Upload photo'}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
          {avatarUrl && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAvatarUrl('')}>Remove</button>}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Name</label>
        <input type="text" className="form-input" value={name} required onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input type="email" className="form-input" value={email} required onChange={e => setEmail(e.target.value)} />
      </div>
      {err && <div className="auth-error">{err}</div>}
      {msg && <div className="ua__success">{msg}</div>}
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

// ─── Reviews ────────────────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/auth/me/reviews').then(({ data }) => setReviews(data.data || [])).catch(() => setReviews([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await api.delete(`/reviews/${id}`); load(); } catch {}
  };

  if (loading) return <div className="ua__loading">Loading reviews…</div>;

  return (
    <div style={{ maxWidth: '100%' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>
        My Reviews ({reviews.length})
      </h2>
      {reviews.length === 0 ? (
        <div className="ua__empty">
          <Icon name="star" size={40} strokeWidth={1.5} />
          <p>No reviews yet.</p>
          <Link to="/listings" className="btn btn-primary btn-sm">Explore listings</Link>
        </div>
      ) : (
        <div className="ua__reviews">
          {reviews.map(r => (
            <div key={r.id} className="ua__review-card">
              <div className="ua__review-head">
                <Link to={`/listings/${r.listing_slug}`} className="ua__review-title">{r.listing_title}</Link>
                <span className="ua__review-date">{formatDate(r.created_at)}</span>
              </div>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={14} className={i < r.rating ? '' : 'icon-empty'} />
                ))}
              </div>
              {r.comment && <p className="ua__review-body">{r.comment}</p>}
              <div className="ua__review-actions">
                <button className="btn btn-ghost btn-sm danger" onClick={() => handleDelete(r.id)} type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Password ───────────────────────────────────────────────
function PasswordTab() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) return setErr('Passwords do not match');
    if (form.next.length < 8) return setErr('Min 8 characters');
    setSaving(true); setErr(''); setMsg('');
    try {
      await api.put('/auth/password', { current_password: form.current, new_password: form.next });
      setMsg('Password changed'); setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setMsg(''), 5000);
    } catch (e) { setErr(e.response?.data?.message || 'Change failed'); }
    finally { setSaving(false); }
  };

  const handleForgot = async () => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email: user.email });
      const tp = data.data?.temp_password;
      if (tp) setMsg(`Temporary password: ${tp} — use it above.`);
    } catch { setErr('Reset failed'); }
  };

  return (
    <form onSubmit={submit} className="ua__form">
      <h2>Change password</h2>
      <div className="form-group">
        <label className="form-label">Current password</label>
        <input type="password" className="form-input" required value={form.current}
          onChange={e => setForm(p => ({ ...p, current: e.target.value }))} />
        <button type="button" className="ua__forgot-link" onClick={handleForgot}>Forgot password?</button>
      </div>
      <div className="form-group">
        <label className="form-label">New password (min 8 chars)</label>
        <input type="password" className="form-input" required minLength={8} value={form.next}
          onChange={e => setForm(p => ({ ...p, next: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Confirm</label>
        <input type="password" className="form-input" required value={form.confirm}
          onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} />
      </div>
      {err && <div className="auth-error">{err}</div>}
      {msg && <div className="ua__success">{msg}</div>}
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Changing…' : 'Change password'}</button>
    </form>
  );
}
