import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
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
    trackRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  // Mouse drag to scroll — does NOT use pointer capture so Link clicks still work
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const hasMoved = useRef(false);

  const onMouseDown = (e) => {
    // Only left mouse button
    if (e.button !== 0 || !trackRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX;
    startScroll.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
    trackRef.current.style.scrollSnapType = 'none';
  };

  const onMouseMove = (e) => {
    if (!isDragging.current || !trackRef.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 3) hasMoved.current = true;
    trackRef.current.scrollLeft = startScroll.current - dx;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = '';
      trackRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  // Prevent click navigation if user was dragging
  const onClickCapture = (e) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false;
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="cat-section" style={{ '--cat-color': cat.color }}>
      <div className="container">
        <div className="cat-section__header">
          <div className="cat-section__title-block">
            <span className="cat-section__icon">
              <Icon name={cat.iconName} size={22} />
            </span>
            <h2 className="cat-section__title display-heading">{t(`cat.${categoryId}`)}</h2>
          </div>
          <Link to={`/listings?category=${categoryId}`} className="cat-section__see-all">
            {t('listing.seeAll')} <Icon name="arrow_right" size={14} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="cat-section__scroll-wrap">
          <button className="cat-section__nav cat-section__nav--left"
            onClick={() => scroll(-1)} type="button">
            <Icon name="chevron_left" size={20} strokeWidth={2.5} />
          </button>

          <div className="cat-section__track" ref={trackRef}
            onMouseDown={onMouseDown}
            onClickCapture={onClickCapture}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : items.map((item, i) => <MiniCard key={item.id} item={item} index={i} t={t} />)}
          </div>

          <button className="cat-section__nav cat-section__nav--right"
            onClick={() => scroll(1)} type="button">
            <Icon name="chevron_right" size={20} strokeWidth={2.5} />
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
      style={{ animationDelay: `${index * 40}ms` }}
      draggable={false}>
      <div className="mini-card__img-wrap">
        <img
          src={resolveUrl(item.cover_image) || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600'}
          alt={item.title} loading="lazy" draggable={false}
        />
        {openStat !== null && (
          <span className={`status mini-card__status ${openStat ? 'open' : 'closed'}`}>
            {openStat ? t('listing.open') : t('listing.closed')}
          </span>
        )}
      </div>
      <div className="mini-card__body">
        <h3 className="mini-card__title">{item.title}</h3>
        <div className="mini-card__meta">
          <div className="stars">
            {full.map((_, i) => <Icon key={`f${i}`} name="star" size={13} />)}
            {half.map((_, i) => <Icon key={`h${i}`} name="star" size={13} />)}
            {empty.map((_, i) => <Icon key={`e${i}`} name="star" size={13} className="icon-empty" />)}
          </div>
          <span className="mini-card__rating-num">{Number(item.avg_rating).toFixed(1)}</span>
        </div>
        <p className="mini-card__location">
          <Icon name="map_pin" size={12} /> {item.location}
        </p>
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
