import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { analyticsService, listingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useListingSocket } from '../hooks/useSocket';
import './BusinessDashboard.css';

export default function BusinessDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listing,   setListing]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period,    setPeriod]    = useState('30');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const liveViewers = useListingSocket(listing?.id, user?.id);

  // Find the listing owned by this business user
  useEffect(() => {
    listingService.getAll({ limit: 100 })
      .then(res => {
        const all = res.data.data || [];
        // owner_id is now returned in the listing list
        const owned = all.find(l => String(l.owner_id) === String(user.id));
        if (owned) {
          setListing(owned);
        } else if (all.length > 0) {
          // fallback: show first listing (admin might not have set owner yet)
          setListing(all[0]);
          setError('No listing linked to your account yet. Showing first available. Contact admin to link your listing.');
        } else {
          setError('No listings found. Please contact admin.');
        }
      })
      .catch(() => setError('Could not load listing data. Check your connection.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (!listing) return;
    analyticsService.getListing(listing.id, period)
      .then(r => setAnalytics(r.data.data))
      .catch(() => setError('Could not load analytics data.'));
  }, [listing, period]);

  return (
    <div className="business-layout">
      <aside className="business-sidebar">
        <div className="business-sidebar__brand">
          <Link to="/">Peja Tourism</Link>
          <span>Business Portal</span>
        </div>
        <nav className="business-sidebar__nav">
          <div className="admin-nav-item active">📊 Analytics</div>
          <Link to="/contact" className="admin-nav-item">💬 Support</Link>
          {listing && (
            <Link to={`/listings/${listing.slug}`} target="_blank" className="admin-nav-item">
              🔗 View My Listing
            </Link>
          )}
        </nav>
        <button className="admin-sidebar__logout btn btn-ghost btn-sm"
          onClick={() => { logout(); navigate('/'); }}>
          Sign out
        </button>
      </aside>

      <div className="business-content">
        <div className="admin-topbar">
          <span className="admin-topbar__title">
            {listing ? listing.title : 'Business Dashboard'}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {liveViewers > 0 && (
              <div className="live-indicator">
                <span className="live-dot" />
                {liveViewers} live {liveViewers === 1 ? 'visitor' : 'visitors'}
              </div>
            )}
            <span className="admin-topbar__user">{user?.name}</span>
          </div>
        </div>

        <div className="admin-page-content">
          {error && <div className="auth-error" style={{ marginBottom:20 }}>{error}</div>}

          {loading && <div className="admin-loading">Loading your listing…</div>}

          {!loading && listing && (
            <>
              <div className="business-period-bar">
                <h2>Performance Analytics</h2>
                <div className="period-tabs">
                  {[['7','7 Days'],['30','30 Days'],['90','90 Days']].map(([v,l]) => (
                    <button key={v}
                      className={`period-tab ${period === v ? 'active' : ''}`}
                      onClick={() => setPeriod(v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live viewers card */}
              {liveViewers > 0 && (
                <div className="business-live-card">
                  <span className="live-dot" style={{ width:10, height:10 }} />
                  <strong>{liveViewers} {liveViewers === 1 ? 'person' : 'people'}</strong>
                  &nbsp;currently viewing your listing right now
                </div>
              )}

              {/* KPI Cards */}
              {analytics && (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-card__icon">👁</span>
                      <div>
                        <span className="stat-card__value">
                          {Number(analytics.views?.total_views || 0).toLocaleString()}
                        </span>
                        <span className="stat-card__label">Total Views</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon">🧑</span>
                      <div>
                        <span className="stat-card__value">
                          {Number(analytics.views?.unique_visitors || 0).toLocaleString()}
                        </span>
                        <span className="stat-card__label">Unique Visitors</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon">📨</span>
                      <div>
                        <span className="stat-card__value">{analytics.contacts || 0}</span>
                        <span className="stat-card__label">Leads / Contacts</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card__icon">⭐</span>
                      <div>
                        <span className="stat-card__value">
                          {Number(analytics.reviews?.avg_rating || 0).toFixed(1)}
                        </span>
                        <span className="stat-card__label">
                          Avg Rating ({analytics.reviews?.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="admin-charts-row">
                    <div className="admin-chart-card">
                      <h3>Daily Views ({period}d)</h3>
                      {analytics.charts?.dailyViews?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={analytics.charts.dailyViews}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize:11 }}
                              tickFormatter={d => d?.slice(5) ?? d} />
                            <YAxis tick={{ fontSize:11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="views" stroke="#336f70"
                              strokeWidth={2} dot={false} name="Views" />
                            <Line type="monotone" dataKey="unique_views" stroke="#c8a96a"
                              strokeWidth={2} dot={false} name="Unique" />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <p style={{ color:'var(--gray-400)', fontSize:14, padding:'32px 0', textAlign:'center' }}>
                          No view data yet for this period.
                        </p>
                      )}
                    </div>

                    <div className="admin-chart-card">
                      <h3>Clicks by Button Type</h3>
                      {analytics.clicks?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={analytics.clicks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="button_type" tick={{ fontSize:12 }} />
                            <YAxis tick={{ fontSize:11 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#336f70" radius={[4,4,0,0]} name="Clicks" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p style={{ color:'var(--gray-400)', fontSize:14, padding:'32px 0', textAlign:'center' }}>
                          No click data yet.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Read-only listing info */}
              <div className="admin-table-card">
                <h3 style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--gray-100)', fontSize:15, fontWeight:600, color:'var(--gray-700)' }}>
                  Your Listing (read-only)
                </h3>
                <div style={{ padding:20 }}>
                  <p style={{ marginBottom:8 }}><strong>Title:</strong> {listing.title}</p>
                  <p style={{ marginBottom:8 }}><strong>Category:</strong> {listing.category}</p>
                  <p style={{ marginBottom:8 }}><strong>Location:</strong> {listing.location}</p>
                  <p style={{ marginBottom:16, color:'var(--gray-500)', fontSize:13 }}>
                    To update your listing details, please contact us via the support form.
                  </p>
                  <div style={{ display:'flex', gap:10 }}>
                    <Link to={`/listings/${listing.slug}`} className="btn btn-outline btn-sm">
                      View Public Page →
                    </Link>
                    <Link to="/contact" className="btn btn-ghost btn-sm">
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
