import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getCategoryConfig, isOpenNow } from '../utils/helpers';
import ListingCard, { ListingCardSkeleton } from '../components/listings/ListingCard';
import SearchBar from '../components/common/SearchBar';
import Icon from '../components/common/Icon';
import './ListingsPage.css';

const SORT_OPTIONS = [
  { id: 'smart',  label: 'Best match',  icon: 'sparkles' },
  { id: 'rated',  label: 'Top rated',   icon: 'star' },
  { id: 'viewed', label: 'Most viewed', icon: 'zap' },
  { id: 'newest', label: 'Newest',      icon: 'calendar' },
];

export default function ListingsPage() {
  const { t } = useT();
  const { setActiveCategory } = useTheme();
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [openNow,  setOpenNow]  = useState(false);

  const category = params.get('category') || '';
  const search   = params.get('search')   || '';
  const sort     = params.get('sort')     || 'smart';
  const cat      = category ? getCategoryConfig(category) : null;

  useEffect(() => { setActiveCategory(category || null); }, [category, setActiveCategory]);
  useEffect(() => () => setActiveCategory(null), [setActiveCategory]);

  useEffect(() => {
    setLoading(true);
    listingService.getAll({ category, search, sort, limit: 24 })
      .then(({ data }) => {
        setListings(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  // Client-side open-now filter
  const filtered = openNow
    ? listings.filter(l => isOpenNow(l.opening_hours) === true)
    : listings;

  return (
    <div className="listings-page page-enter" style={cat ? { '--cat-color': cat.color } : {}}>
      <div className="listings-page__header">
        <div className="container">
          <span className="listings-page__eyebrow">
            {cat
              ? <><Icon name={cat.iconName} size={14} /> {t(`cat.${category}`)}</>
              : t('nav.explore')}
          </span>
          <h1 className="display-heading listings-page__title">
            {cat ? t(`cat.${category}`) : t('nav.explore')}
          </h1>
          <div className="listings-page__count">
            {loading ? '…' : `${filtered.length} of ${total} ${total === 1 ? 'result' : 'results'}`}
            {search && <span> for "{search}"</span>}
          </div>
          <div className="listings-page__search">
            <SearchBar placeholder={t('hero.searchPlaceholder')} />
          </div>
        </div>
      </div>

      {/* Mobile category chip scroller */}
      <div className="listings-page__mobile-cats">
        <div className="container">
          <div className="mobile-cat-scroll">
            <button
              className={`mobile-cat-chip ${!category ? 'active' : ''}`}
              onClick={() => setParam('category', '')}
              type="button"
            >
              <Icon name="grid" size={14} />
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`mobile-cat-chip ${category === c.id ? 'active' : ''}`}
                style={{ '--cat-color': c.color }}
                onClick={() => setParam('category', c.id)}
                type="button"
              >
                <Icon name={c.iconName} size={14} />
                {t(`cat.${c.id}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SORT + FILTERS TOOLBAR */}
      <div className="listings-page__toolbar">
        <div className="container">
          <div className="listings-toolbar">
            <div className="sort-pills">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`sort-pill ${sort === opt.id ? 'active' : ''}`}
                  onClick={() => setParam('sort', opt.id === 'smart' ? '' : opt.id)}
                  type="button"
                >
                  <Icon name={opt.icon} size={13} />
                  {opt.label}
                </button>
              ))}
            </div>
            <label className={`open-now-toggle ${openNow ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
              />
              <Icon name="clock" size={14} />
              <span>Open now</span>
            </label>
          </div>
        </div>
      </div>

      <div className="container listings-page__body">
        <main className="listings-main">
          {loading ? (
            <div className="listings-grid">
              {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="listings-empty">
              <Icon name="search" size={40} strokeWidth={1.5} />
              <p>No results found</p>
              {openNow
                ? <button className="btn btn-ghost btn-sm" onClick={() => setOpenNow(false)} type="button">
                    Show closed ones too
                  </button>
                : <Link to="/listings" className="btn btn-primary">Clear filters</Link>}
            </div>
          ) : (
            <div className="listings-grid">
              {filtered.map((l, i) => (
                <div key={l.id} style={{ animationDelay: `${i * 30}ms` }}>
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
          )}
        </main>

        <aside className="listings-sidebar">
          <div className="listings-sidebar__card">
            <h3>Categories</h3>
            <nav className="listings-sidebar__cats">
              <button
                className={`sidebar-cat ${!category ? 'active' : ''}`}
                onClick={() => setParam('category', '')}
                type="button"
              >
                <Icon name="grid" size={16} />
                <span>All</span>
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`sidebar-cat ${category === c.id ? 'active' : ''}`}
                  style={{ '--cat-color': c.color }}
                  onClick={() => setParam('category', c.id)}
                  type="button"
                >
                  <Icon name={c.iconName} size={16} />
                  <span>{t(`cat.${c.id}`)}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="listings-sidebar__ad">
            <div className="ad-slot ad-slot--promo">
              <span className="ad-slot__badge">Your ad here</span>
              <h4>Advertise with us</h4>
              <p>Reach thousands of visitors exploring Peja.</p>
              <Link to="/contact" className="btn btn-outline btn-sm">Get in touch</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
