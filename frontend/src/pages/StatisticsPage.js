import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { listingService, analyticsService } from '../services/api';
import { getCategoryConfig } from '../utils/helpers';
import { resolveUrl } from '../components/common/ImageUpload';
import './StatisticsPage.css';

export default function StatisticsPage() {
  const [listings,  setListings]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period,    setPeriod]    = useState('30');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Load all listings on mount
  useEffect(() => {
    listingService.getAll({ limit: 200 })
      .then(r => {
        const list = r.data.data || [];
        setListings(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load analytics when selection changes
  useEffect(() => {
    if (!selected) return;
    setAnalyticsLoading(true);
    analyticsService.getListing(selected.id, period)
      .then(r => setAnalytics(r.data.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, [selected, period]);

  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading listings…</div>;

  return (
    <div className="stats-page">
      <div className="stats-page__header">
        <h2>Statistics</h2>
        <div className="period-tabs">
          {[['7','7 Days'],['30','30 Days'],['90','90 Days']].map(([v, l]) => (
            <button key={v}
              className={`period-tab ${period === v ? 'active' : ''}`}
              onClick={() => setPeriod(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-layout">
        {/* Left: listing picker */}
        <aside className="stats-sidebar">
          <div className="stats-sidebar__search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="stats-sidebar__list">
            {filtered.length === 0 && (
              <p style={{ padding: 16, color: 'var(--gray-400)', fontSize: 13 }}>
                No matches
              </p>
            )}
            {filtered.map(l => {
              const cat = getCategoryConfig(l.category);
              return (
                <button
                  key={l.id}
                  className={`stats-listing-item ${selected?.id === l.id ? 'active' : ''}`}
                  onClick={() => setSelected(l)}>
                  <div className="stats-listing-item__img">
                    {l.cover_image
                      ? <img src={resolveUrl(l.cover_image)} alt={l.title} />
                      : <span>{cat.icon}</span>}
                  </div>
                  <div className="stats-listing-item__body">
                    <strong>{l.title}</strong>
                    <span>{cat.icon} {l.category.replace('_', ' ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: detailed analytics */}
        <main className="stats-content">
          {!selected && (
            <div className="stats-placeholder">
              <span>📊</span>
              <p>Select a listing to see statistics</p>
            </div>
          )}

          {selected && (
            <>
              <div className="stats-content__header">
                <div>
                  <span className="stats-content__eyebrow">
                    {getCategoryConfig(selected.category).icon} {selected.category.replace('_', ' ')}
                  </span>
                  <h3>{selected.title}</h3>
                  <small>{selected.location}</small>
                </div>
              </div>

              {analyticsLoading && <div className="admin-loading">Loading analytics…</div>}

              {!analyticsLoading && analytics && (
                <>
                  <div className="stats-kpi-grid">
                    <KpiCard
                      icon="👁"
                      label="Total Views"
                      value={analytics.views?.total_views || 0}
                      color="#336f70" />
                    <KpiCard
                      icon="🧑"
                      label="Unique Visitors"
                      value={analytics.views?.unique_visitors || 0}
                      color="#4a9192" />
                    <KpiCard
                      icon="🖱"
                      label="Total Clicks"
                      value={(analytics.clicks || []).reduce((s, c) => s + Number(c.count), 0)}
                      color="#c8a96a" />
                    <KpiCard
                      icon="📨"
                      label="Leads / Contacts"
                      value={analytics.contacts || 0}
                      color="#f97316" />
                    <KpiCard
                      icon="⭐"
                      label="Avg Rating"
                      value={Number(analytics.reviews?.avg_rating || 0).toFixed(1)}
                      suffix={` (${analytics.reviews?.review_count || 0})`}
                      color="#ef4444" />
                    <KpiCard
                      icon="📝"
                      label="Reviews"
                      value={analytics.reviews?.review_count || 0}
                      color="#a855f7" />
                  </div>

                  {/* Views over time */}
                  <div className="stats-chart-card">
                    <h4>Views over time</h4>
                    {analytics.charts?.dailyViews?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={analytics.charts.dailyViews}>
                          <defs>
                            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"  stopColor="#336f70" stopOpacity={0.3}/>
                              <stop offset="100%" stopColor="#336f70" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }}
                            tickFormatter={d => d?.slice(5)} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="views" stroke="#336f70"
                            strokeWidth={2} fill="url(#viewsGrad)" name="Views" />
                          <Line type="monotone" dataKey="unique_views" stroke="#c8a96a"
                            strokeWidth={2} dot={false} name="Unique" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart />
                    )}
                  </div>

                  {/* Clicks breakdown */}
                  <div className="stats-charts-row">
                    <div className="stats-chart-card">
                      <h4>Click types</h4>
                      {analytics.clicks?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={analytics.clicks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="button_type" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#336f70" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </div>

                    <div className="stats-chart-card">
                      <h4>Daily clicks</h4>
                      {analytics.charts?.dailyClicks?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={analytics.charts.dailyClicks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }}
                              tickFormatter={d => d?.slice(5)} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="clicks" stroke="#c8a96a"
                              strokeWidth={2.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : <EmptyChart />}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, suffix = '', color }) {
  return (
    <div className="kpi-card">
      <span className="kpi-card__icon" style={{ background: `${color}15`, color }}>
        {icon}
      </span>
      <div>
        <span className="kpi-card__value">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
        <span className="kpi-card__label">{label}</span>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="empty-chart">
      <span>📈</span>
      <p>No data for this period</p>
    </div>
  );
}
