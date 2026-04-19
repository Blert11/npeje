import { Link } from 'react-router-dom';
import { getCategoryConfig, starsFromRating, truncate, isOpenNow, PRICE_LABELS } from '../../utils/helpers';
import { resolveUrl } from '../common/ImageUpload';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const {
    slug, title, category, short_desc, location,
    cover_image, avg_rating, review_count,
    price_range, is_featured, opening_hours,
  } = listing;

  const cat = getCategoryConfig(category);
  const { full, half, empty } = starsFromRating(Number(avg_rating));
  const openStat = isOpenNow(opening_hours);

  return (
    <Link to={`/listings/${slug}`} className="listing-card"
      style={{ '--cat-color': cat.color }}>
      <div className="listing-card__img-wrap">
        <img
          src={resolveUrl(cover_image) || `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600`}
          alt={title}
          className="listing-card__img"
          loading="lazy"
        />
        <span className="listing-card__category">
          {cat.icon} {category.replace('_',' ')}
        </span>
        {is_featured === 1 && <span className="listing-card__featured">Featured</span>}
        {openStat !== null && (
          <span className={`status listing-card__status ${openStat ? 'open' : 'closed'}`}>
            {openStat ? 'Open' : 'Closed'}
          </span>
        )}
      </div>

      <div className="listing-card__body">
        <div className="listing-card__top">
          <h3 className="listing-card__title">{title}</h3>
          {price_range && (
            <span className="listing-card__price">{PRICE_LABELS[price_range]}</span>
          )}
        </div>
        <p className="listing-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {location}
        </p>
        <p className="listing-card__desc">{truncate(short_desc || '', 90)}</p>
        <div className="listing-card__footer">
          <div className="listing-card__rating">
            <div className="stars">
              {full.map((_, i)  => <span key={`f${i}`} className="star">★</span>)}
              {half.map((_, i)  => <span key={`h${i}`} className="star">★</span>)}
              {empty.map((_, i) => <span key={`e${i}`} className="star star-empty">★</span>)}
            </div>
            <span className="listing-card__rating-num">
              {Number(avg_rating).toFixed(1)} ({review_count})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="listing-card listing-card--skeleton">
      <div className="listing-card__img-wrap skeleton" style={{ height: 200 }} />
      <div className="listing-card__body">
        <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
      </div>
    </div>
  );
}
