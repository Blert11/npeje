import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, getCategoryConfig } from '../utils/helpers';
import ListingCard, { ListingCardSkeleton } from '../components/listings/ListingCard';
import SearchBar from '../components/common/SearchBar';
import './ListingsPage.css';

export default function ListingsPage() {
  const { t } = useT();
  const { setActiveCategory } = useTheme();
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);

  const category = params.get('category') || '';
  const search   = params.get('search')   || '';
  const cat      = category ? getCategoryConfig(category) : null;

  useEffect(() => {
    setActiveCategory(category || null);
  }, [category, setActiveCategory]);

  useEffect(() => () => setActiveCategory(null), [setActiveCategory]);

  useEffect(() => {
    setLoading(true);
    listingService.getAll({ category, search, limit: 24 })
      .then(({ data }) => {
        setListings(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [category, search]);

  const handleCategoryClick = (id) => {
    const next = new URLSearchParams(params);
    if (id) next.set('category', id);
    else    next.delete('category');
    setParams(next);
  };

  return (
    <div className="listings-page page-enter" style={cat ? { '--cat-color': cat.color } : {}}>
      <div className="listings-page__header">
        <div className="container">
          <span className="listings-page__eyebrow">
            {cat ? `${cat.icon} ${t(`cat.${category}`)}` : t('nav.explore')}
          </span>
          <h1 className="display-heading listings-page__title">
            {cat ? t(`cat.${category}`) : t('nav.explore')}
          </h1>
          <div className="listings-page__count">
            {loading ? '…' : `${total} ${total === 1 ? 'result' : 'results'}`}
            {search && <span> for "{search}"</span>}
          </div>
          <div className="listings-page__search">
            <SearchBar placeholder={t('hero.searchPlaceholder')} />
          </div>
        </div>
      </div>

      <div className="container listings-page__body">
        {/* Sidebar */}
        <aside className="listings-sidebar">
          <div className="listings-sidebar__card">
            <h3>Categories</h3>
            <nav className="listings-sidebar__cats">
              <button
                className={`sidebar-cat ${!category ? 'active' : ''}`}
                onClick={() => handleCategoryClick('')}>
                <span>🌍</span>
                <span>All</span>
              </button>
              {CATEGORIES.map(c => (
                <button key={c.id}
                  className={`sidebar-cat ${category === c.id ? 'active' : ''}`}
                  style={{ '--cat-color': c.color }}
                  onClick={() => handleCategoryClick(c.id)}>
                  <span>{c.icon}</span>
                  <span>{t(`cat.${c.id}`)}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* AD SLOT — fills up the empty sidebar */}
          <div className="listings-sidebar__ad">
            <div className="ad-slot ad-slot--featured">
              <span className="ad-slot__badge">Featured</span>
              <h4>🏔 Rugova Adventures</h4>
              <p>Zip-line, via ferrata, and guided hikes through Kosovo's most dramatic canyon.</p>
              <Link to="/listings?category=activities" className="btn btn-primary btn-sm">
                Explore →
              </Link>
            </div>
          </div>

          <div className="listings-sidebar__ad">
            <div className="ad-slot ad-slot--taxi">
              <span className="ad-slot__badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
                🚕 Taxi
              </span>
              <h4>Book a taxi</h4>
              <p>Fast &amp; safe transport across Peja, 24/7.</p>
              <a href="tel:+38344123456" className="btn btn-primary btn-sm"
                style={{ background: '#fff', color: '#dc2626' }}>
                Call now
              </a>
            </div>
          </div>

          <div className="listings-sidebar__ad">
            <div className="ad-slot ad-slot--promo">
              <span className="ad-slot__badge">Your ad here</span>
              <h4>Advertise with us</h4>
              <p>Reach thousands of visitors exploring Peja. Contact us for sponsored placements.</p>
              <Link to="/contact" className="btn btn-outline btn-sm">Get in touch</Link>
            </div>
          </div>
        </aside>

        {/* Main grid */}
        <main className="listings-main">
          {loading ? (
            <div className="listings-grid">
              {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="listings-empty">
              <span>🔍</span>
              <p>No results found</p>
              <Link to="/listings" className="btn btn-primary">Clear filters</Link>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((l, i) => (
                <div key={l.id} style={{ animationDelay: `${i * 30}ms` }}>
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
