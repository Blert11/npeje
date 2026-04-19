import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import { getCategoryConfig, isOpenNow, starsFromRating } from '../../utils/helpers';
import { useT } from '../../i18n';
import './CategorySection.css';

export default function CategorySection({ categoryId, limit = 8 }) {
  const { t } = useT();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  const cat = getCategoryConfig(categoryId);

  useEffect(() => {
    listingService.getAll({ category: categoryId, limit })
      .then(({ data }) => setItems(data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [categoryId, limit]);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="cat-section" style={{ '--cat-color': cat.color }}>
      <div className="container">
        <div className="cat-section__header">
          <div className="cat-section__title-block">
            <span className="cat-section__icon">{cat.icon}</span>
            <div>
              <h2 className="cat-section__title display-heading">
                {t(`cat.${categoryId}`)}
              </h2>
            </div>
          </div>
          <Link to={`/listings?category=${categoryId}`} className="cat-section__see-all">
            {t('listing.seeAll')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="cat-section__scroll-wrap">
          <button className="cat-section__nav cat-section__nav--left"
            onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="cat-section__track" ref={trackRef}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : items.map((item, i) => <MiniCard key={item.id} item={item} index={i} t={t} />)}
          </div>
          <button className="cat-section__nav cat-section__nav--right"
            onClick={() => scroll(1)} aria-label="Scroll right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ item, index, t }) {
  const { full, half, empty } = starsFromRating(Number(item.avg_rating));
  const openStat = isOpenNow(item.opening_hours);

  return (
    <Link to={`/listings/${item.slug}`} className="mini-card"
      style={{ animationDelay: `${index * 40}ms` }}>
      <div className="mini-card__img-wrap">
        <img
          src={resolveUrl(item.cover_image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600'}
          alt={item.title}
          loading="lazy"
        />
        {openStat !== null && (
          <span className={`status mini-card__status ${openStat ? 'open' : 'closed'}`}>
            {openStat ? t('listing.open') : t('listing.closed')}
          </span>
        )}
        {item.is_featured === 1 && (
          <span className="mini-card__featured">★ {t('listing.featured')}</span>
        )}
      </div>
      <div className="mini-card__body">
        <h3 className="mini-card__title">{item.title}</h3>
        <div className="mini-card__meta">
          <div className="stars">
            {full.map((_, i) => <span key={`f${i}`} className="star">★</span>)}
            {half.map((_, i) => <span key={`h${i}`} className="star">★</span>)}
            {empty.map((_, i) => <span key={`e${i}`} className="star star-empty">★</span>)}
          </div>
          <span className="mini-card__rating-num">
            {Number(item.avg_rating).toFixed(1)}
          </span>
        </div>
        <p className="mini-card__location">📍 {item.location}</p>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="mini-card mini-card--skeleton">
      <div className="skeleton" style={{ height: 170 }} />
      <div className="mini-card__body">
        <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
      </div>
    </div>
  );
}
