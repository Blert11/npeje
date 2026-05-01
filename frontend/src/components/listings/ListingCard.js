import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryConfig, starsFromRating, truncate, isOpenNow } from '../../utils/helpers';
import { resolveUrl } from '../common/ImageUpload';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../common/Icon';
import './ListingCard.css';

export default function ListingCard({ listing, isFavorited: initialFav = false, onToggleFav }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(initialFav);
  const [loading, setLoading] = useState(false);

  const {
    slug, title, category, short_desc, location,
    cover_image, avg_rating, review_count, opening_hours,
  } = listing;

  const cat = getCategoryConfig(category);
  const { full, half, empty } = starsFromRating(Number(avg_rating));
  const openStat = isOpenNow(opening_hours);

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      const { favoritesService } = await import('../../services/api');
      const { data } = await favoritesService.toggle(listing.id);
      setFav(data.data.favorited);
      onToggleFav?.(listing.id, data.data.favorited);
    } catch {} finally { setLoading(false); }
  };

  return (
    <Link to={`/listings/${slug}`} className="listing-card" style={{ '--cat-color': cat.color }}>
      <div className="listing-card__img-wrap">
        <img
          src={resolveUrl(cover_image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600'}
          alt={title} className="listing-card__img" loading="lazy"
        />
        <span className="listing-card__category">
          <Icon name={cat.iconName} size={12} />
          {category.replace('_', ' ')}
        </span>
        {openStat !== null && (
          <span className={`status listing-card__status ${openStat ? 'open' : 'closed'}`}>
            {openStat ? 'Open' : 'Closed'}
          </span>
        )}
        {/* Favorite button — always visible */}
        {user && (
          <button className={`listing-card__fav ${fav ? 'active' : ''}`}
            onClick={handleFav} type="button" aria-label="Favorite">
            <Icon name={fav ? 'heart_filled' : 'heart'} size={18} />
          </button>
        )}
      </div>

      <div className="listing-card__body">
        <h3 className="listing-card__title">{title}</h3>
        <p className="listing-card__location">
          <Icon name="map_pin" size={12} /> {location}
        </p>
        {short_desc && <p className="listing-card__desc">{truncate(short_desc, 80)}</p>}
        <div className="listing-card__footer">
          <div className="listing-card__rating">
            <div className="stars">
              {full.map((_, i) => <Icon key={`f${i}`} name="star" size={13} />)}
              {half.map((_, i) => <Icon key={`h${i}`} name="star" size={13} />)}
              {empty.map((_, i) => <Icon key={`e${i}`} name="star" size={13} className="icon-empty" />)}
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
        <div className="skeleton" style={{ height: 14, width: '60%' }} />
      </div>
    </div>
  );
}
