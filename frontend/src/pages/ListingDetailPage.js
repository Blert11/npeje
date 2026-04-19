import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import {
  getCategoryConfig, starsFromRating, formatDate,
  directionsUrl, getOpenStatus,
} from '../utils/helpers';
import { resolveUrl } from '../components/common/ImageUpload';
import Lightbox from '../components/lightbox/Lightbox';
import MenuViewer from '../components/lightbox/MenuViewer';
import ReviewForm from '../components/reviews/ReviewForm';
import './ListingDetailPage.css';

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t } = useT();
  const { setActiveCategory } = useTheme();

  const [listing,        setListing]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [activeImg,      setActiveImg]      = useState(0);
  const [dragX,          setDragX]          = useState(0);
  const [dragging,       setDragging]       = useState(false);
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [toast,          setToast]          = useState('');
  const [hoursOpen,      setHoursOpen]      = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    setLoading(true);
    listingService.getBySlug(slug)
      .then(({ data }) => {
        setListing(data.data);
        if (data.data?.category) setActiveCategory(data.data.category);
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [slug, setActiveCategory]);

  useEffect(() => () => setActiveCategory(null), [setActiveCategory]);

  const trackClick = (type) => {
    if (listing) listingService.trackClick(listing.id, type);
  };

  const handleReviewSubmit = (review) => {
    setListing(prev => ({
      ...prev,
      reviews: [review, ...(prev.reviews || [])],
      review_count: (prev.review_count || 0) + 1,
    }));
    setShowReviewForm(false);
    setToast('Review submitted!');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) return <DetailSkeleton />;
  if (!listing) return (
    <div className="detail-not-found">
      <h2>Listing not found</h2>
      <Link to="/listings" className="btn btn-primary">Back</Link>
    </div>
  );

  const { full, half, empty } = starsFromRating(Number(listing.avg_rating));
  const cat      = getCategoryConfig(listing.category);
  const contact  = listing.contact_info || {};
  const images   = listing.images?.length ? listing.images : [{
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600',
    alt_text: listing.title,
  }];
  const features = listing.features || [];
  const openStat = getOpenStatus(listing.opening_hours);

  // Swipeable carousel handlers
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; setDragging(true); };
  const onTouchMove  = (e) => {
    if (touchStart.current === null) return;
    setDragX(e.touches[0].clientX - touchStart.current);
  };
  const onTouchEnd = () => {
    if (touchStart.current === null) return;
    if (Math.abs(dragX) > 60) {
      if (dragX > 0) setActiveImg((activeImg - 1 + images.length) % images.length);
      else           setActiveImg((activeImg + 1) % images.length);
    }
    setDragX(0);
    setDragging(false);
    touchStart.current = null;
  };

  const DAYS = [
    { key: 'mon', label: t('day.mon') }, { key: 'tue', label: t('day.tue') },
    { key: 'wed', label: t('day.wed') }, { key: 'thu', label: t('day.thu') },
    { key: 'fri', label: t('day.fri') }, { key: 'sat', label: t('day.sat') },
    { key: 'sun', label: t('day.sun') },
  ];
  const todayIdx = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
  const hasMenuSupport = ['restaurants', 'fast_food', 'cafes'].includes(listing.category);

  return (
    <div className="detail-page page-enter" style={{ '--cat-color': cat.color }}>
      {toast && <div className="detail-toast">{toast}</div>}

      {lightboxOpen && (
        <Lightbox images={images} startIndex={activeImg}
          onClose={() => setLightboxOpen(false)} />
      )}

      {menuOpen && (
        <MenuViewer listingId={listing.id} listingName={listing.title}
          onClose={() => setMenuOpen(false)} />
      )}

      <div className="container detail-page__inner">
        <div className="detail-main">
          <nav className="detail-breadcrumb">
            <Link to="/">Home</Link><span>›</span>
            <Link to="/listings">{t('nav.explore')}</Link><span>›</span>
            <Link to={`/listings?category=${listing.category}`}>{t(`cat.${listing.category}`)}</Link>
            <span>›</span><span>{listing.title}</span>
          </nav>

          {/* Swipeable image carousel */}
          <div className="detail-carousel">
            <div className="detail-carousel__viewport"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}>
              <div className="detail-carousel__track"
                style={{
                  transform: `translateX(calc(-${activeImg * 100}% + ${dragX}px))`,
                  transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                {images.map((img, i) => (
                  <div key={img.id || i} className="detail-carousel__slide">
                    <img src={resolveUrl(img.url)} alt={img.alt_text || listing.title}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      onClick={() => setLightboxOpen(true)} draggable={false} />
                  </div>
                ))}
              </div>

              {images.length > 1 && (
                <>
                  <button className="carousel-arrow carousel-arrow--left"
                    onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg - 1 + images.length) % images.length); }}>‹</button>
                  <button className="carousel-arrow carousel-arrow--right"
                    onClick={(e) => { e.stopPropagation(); setActiveImg((activeImg + 1) % images.length); }}>›</button>
                </>
              )}

              <div className="detail-carousel__badge">
                {cat.icon} {t(`cat.${listing.category}`)}
              </div>

              <button className="detail-carousel__expand"
                onClick={() => setLightboxOpen(true)} aria-label="Expand">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 3 21 3 21 9"/>
                  <polyline points="9 21 3 21 3 15"/>
                  <line x1="21" y1="3" x2="14" y2="10"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </svg>
              </button>

              {images.length > 1 && (
                <div className="detail-carousel__dots">
                  {images.map((_, i) => (
                    <button key={i}
                      className={`detail-carousel__dot ${i === activeImg ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                      aria-label={`Image ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="detail-carousel__thumbs">
                {images.map((img, i) => (
                  <button key={img.id || i}
                    className={`carousel-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}>
                    <img src={resolveUrl(img.url)} alt={img.alt_text || ''} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-title-bar">
            <h1 className="display-heading detail-title">{listing.title}</h1>
            <div className="detail-meta">
              <div className="stars">
                {full.map((_, i)  => <span key={`f${i}`} className="star">★</span>)}
                {half.map((_, i)  => <span key={`h${i}`} className="star">★</span>)}
                {empty.map((_, i) => <span key={`e${i}`} className="star star-empty">★</span>)}
              </div>
              <span className="detail-rating-num">
                {Number(listing.avg_rating).toFixed(1)} ({listing.review_count})
              </span>
              {openStat && (
                <span className={`status ${openStat.className}`}>
                  {openStat.className === 'open' ? t('listing.open') : t('listing.closed')}
                </span>
              )}
              <span className="detail-location">📍 {listing.location}</span>
            </div>
          </div>

          {hasMenuSupport && (
            <button className="detail-menu-cta"
              onClick={() => { setMenuOpen(true); trackClick('menu'); }}>
              <span className="detail-menu-cta__icon">📋</span>
              <div className="detail-menu-cta__text">
                <strong>{t('listing.viewMenu')}</strong>
                <small>Click to see all dishes &amp; prices</small>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="detail-actions">
            {contact.phone && (
              <a href={`tel:${contact.phone}`}
                className="btn btn-primary detail-action-btn"
                onClick={() => trackClick('call')}>
                📞 {t('listing.call')}
              </a>
            )}
            {listing.location && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
                target="_blank" rel="noreferrer"
                className="btn btn-outline detail-action-btn"
                onClick={() => trackClick('directions')}>
                🗺 {t('listing.directions')}
              </a>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noreferrer"
                className="btn btn-ghost detail-action-btn"
                onClick={() => trackClick('website')}>
                🌐 {t('listing.website')}
              </a>
            )}
            {contact.instagram && (
              <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                target="_blank" rel="noreferrer"
                className="btn btn-ghost detail-action-btn"
                onClick={() => trackClick('instagram')}>
                📸 Instagram
              </a>
            )}
          </div>

          {features.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">{t('listing.features')}</h2>
              <div className="detail-features">
                {features.map(f => <span key={f} className="feature-chip">✓ {f}</span>)}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h2 className="detail-section-title">{t('listing.about')}</h2>
            <p className="detail-description">{listing.description}</p>
          </div>

          {listing.opening_hours && (
            <div className="detail-section">
              <button className="detail-hours-toggle" onClick={() => setHoursOpen(!hoursOpen)}>
                <div>
                  <h2 className="detail-section-title" style={{ marginBottom: 2 }}>
                    {t('listing.openingHours')}
                  </h2>
                  {openStat && (
                    <span className={`status ${openStat.className}`} style={{ marginTop: 4 }}>
                      {openStat.className === 'open' ? t('listing.open') : t('listing.closed')}
                    </span>
                  )}
                </div>
                <span className={`detail-hours-arrow ${hoursOpen ? 'open' : ''}`}>›</span>
              </button>
              {hoursOpen && (
                <div className="detail-hours-list animate-fade-up">
                  {DAYS.map(({ key, label }) => {
                    const hrs = listing.opening_hours[key];
                    return (
                      <div key={key} className={`detail-hour-row ${todayIdx === key ? 'today' : ''}`}>
                        <span>{label}</span>
                        <span>{Array.isArray(hrs) && hrs.length === 2 ? `${hrs[0]} – ${hrs[1]}` : t('listing.closed')}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="detail-section" id="reviews">
            <div className="detail-reviews-header">
              <h2 className="detail-section-title">
                {t('listing.reviews')} ({listing.review_count || 0})
              </h2>
              {user && !showReviewForm && (
                <button className="btn btn-outline btn-sm" onClick={() => setShowReviewForm(true)}>
                  {t('listing.writeReview')}
                </button>
              )}
              {!user && (
                <Link to="/login" className="btn btn-ghost btn-sm">
                  {t('listing.signinToReview')}
                </Link>
              )}
            </div>
            {showReviewForm && (
              <ReviewForm listingId={listing.id}
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)} />
            )}
            <div className="reviews-list">
              {(!listing.reviews || listing.reviews.length === 0) && (
                <p className="reviews-empty">{t('listing.noReviews')}</p>
              )}
              {listing.reviews?.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-card__header">
                    <div className="review-card__avatar">
                      {r.user_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <strong>{r.user_name}</strong>
                      <div className="stars review-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`star ${i < r.rating ? '' : 'star-empty'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="review-date">{formatDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="detail-sidebar__card">
            <h3>{t('listing.location')}</h3>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
              target="_blank" rel="noreferrer"
              className="detail-map-fallback"
              onClick={() => trackClick('directions')}>
              <span>📍</span>
              <p>{listing.location}</p>
              <span className="btn btn-primary btn-sm">{t('listing.openInMaps')}</span>
            </a>
          </div>

          <div className="detail-sidebar__card">
            <h3>{t('listing.contact')}</h3>
            <div className="detail-contact-list">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="contact-row" onClick={() => trackClick('call')}>
                  <span className="contact-row__icon">📞</span>
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="contact-row">
                  <span className="contact-row__icon">✉️</span>
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noreferrer"
                  className="contact-row" onClick={() => trackClick('website')}>
                  <span className="contact-row__icon">🌐</span>
                  <span>{t('listing.website')}</span>
                </a>
              )}
              {contact.instagram && (
                <a href={`https://instagram.com/${contact.instagram.replace('@','')}`}
                  target="_blank" rel="noreferrer" className="contact-row"
                  onClick={() => trackClick('instagram')}>
                  <span className="contact-row__icon">📸</span>
                  <span>@{contact.instagram.replace('@', '')}</span>
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-page">
      <div className="container detail-page__inner">
        <div className="detail-main">
          <div className="skeleton" style={{ height: 440, borderRadius: 'var(--radius-lg)', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
        <aside className="detail-sidebar">
          <div className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-lg)' }} />
        </aside>
      </div>
    </div>
  );
}
