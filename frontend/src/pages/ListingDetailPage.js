import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { favoritesService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import {
  getCategoryConfig, starsFromRating, formatDate, getOpenStatus,
} from '../utils/helpers';
import { resolveUrl } from '../components/common/ImageUpload';
import Icon from '../components/common/Icon';
import DetailCarousel from '../components/listings/DetailCarousel';
import Lightbox from '../components/lightbox/Lightbox';
import MenuViewer from '../components/lightbox/MenuViewer';
import RoomViewer from '../components/lightbox/RoomViewer';
import ReviewForm from '../components/reviews/ReviewForm';
import './ListingDetailPage.css';

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t } = useT();
  const { setActiveCategory } = useTheme();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [toast, setToast] = useState('');
  const [hoursOpen, setHoursOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    listingService.getBySlug(slug)
      .then(({ data }) => {
        setListing(data.data);
        if (data.data?.category) setActiveCategory(data.data.category);
        if (user && data.data?.id) {
          favoritesService.check([data.data.id])
            .then(r => setIsFavorited((r.data.data || []).includes(data.data.id)))
            .catch(() => {});
        }
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [slug, setActiveCategory, user]);

  useEffect(() => () => setActiveCategory(null), [setActiveCategory]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const trackClick = (type) => { if (listing) listingService.trackClick(listing.id, type); };

  const toggleFavorite = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const { data } = await favoritesService.toggle(listing.id);
      setIsFavorited(data.data.favorited);
      showToast(data.data.favorited ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      showToast('Could not save — check backend routes');
    } finally { setFavLoading(false); }
  };

  const handleReviewSubmit = (review) => {
    setListing(prev => ({
      ...prev,
      reviews: [review, ...(prev.reviews || [])],
      review_count: (prev.review_count || 0) + 1,
    }));
    setShowReviewForm(false);
    showToast('Review submitted!');
  };

  const handleReviewUpdate = async (id, rating, comment) => {
    try {
      const api = (await import('../services/api')).default;
      await api.put(`/reviews/${id}`, { rating, comment });
      const { data } = await listingService.getBySlug(slug);
      setListing(data.data);
      setEditingReview(null);
      showToast('Review updated');
    } catch { showToast('Update failed'); }
  };

  const handleReviewDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const api = (await import('../services/api')).default;
      await api.delete(`/reviews/${id}`);
      setListing(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r.id !== id),
        review_count: Math.max(0, (prev.review_count || 1) - 1),
      }));
      showToast('Review deleted');
    } catch { showToast('Delete failed'); }
  };

  if (loading) return <DetailSkeleton />;
  if (!listing) return (
    <div className="detail-not-found">
      <h2>Listing not found</h2>
      <Link to="/listings" className="btn btn-primary">Back</Link>
    </div>
  );

  const { full, half, empty } = starsFromRating(Number(listing.avg_rating));
  const cat = getCategoryConfig(listing.category);
  const contact = listing.contact_info || {};
  const images = listing.images?.length ? listing.images : [{
    url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600',
    alt_text: listing.title,
  }];
  const features = listing.features || [];
  const openStat = getOpenStatus(listing.opening_hours);
  const hasMenu = ['restaurants', 'fast_food', 'cafes'].includes(listing.category);
  const hasRooms = ['hotels', 'villas'].includes(listing.category);

  const DAYS = [
    { key: 'mon', label: t('day.mon') }, { key: 'tue', label: t('day.tue') },
    { key: 'wed', label: t('day.wed') }, { key: 'thu', label: t('day.thu') },
    { key: 'fri', label: t('day.fri') }, { key: 'sat', label: t('day.sat') },
    { key: 'sun', label: t('day.sun') },
  ];
  const todayIdx = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];

  return (
    <div className="detail-page page-enter" style={{ '--cat-color': cat.color }}>
      {toast && <div className="detail-toast">{toast}</div>}

      {lightboxOpen && (
        <Lightbox images={images} startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)} />
      )}
      {menuOpen && (
        <MenuViewer listingId={listing.id} listingName={listing.title}
          onClose={() => setMenuOpen(false)} />
      )}
      {roomsOpen && (
        <RoomViewer listingId={listing.id} listingName={listing.title}
          onClose={() => setRoomsOpen(false)} />
      )}

      <div className="container detail-page__inner">
        <div className="detail-main">
          <nav className="detail-breadcrumb">
            <Link to="/">Home</Link>
            <Icon name="chevron_right" size={14} />
            <Link to="/listings">{t('nav.explore')}</Link>
            <Icon name="chevron_right" size={14} />
            <Link to={`/listings?category=${listing.category}`}>{t(`cat.${listing.category}`)}</Link>
            <Icon name="chevron_right" size={14} />
            <span>{listing.title}</span>
          </nav>

          {/* ─── NEW CAROUSEL ─────────────────────────────── */}
          <DetailCarousel
            images={images}
            onOpenLightbox={(i) => { setLightboxStart(i); setLightboxOpen(true); }}
          />

          <div className="detail-title-bar">
            <div className="detail-title-row">
              <h1 className="display-heading detail-title">{listing.title}</h1>
              {user && (
                <button className={`detail-fav-btn ${isFavorited ? 'active' : ''}`}
                  onClick={toggleFavorite} disabled={favLoading} type="button">
                  <Icon name={isFavorited ? 'heart_filled' : 'heart'} size={18} />
                  <span className="detail-fav-btn__text">{isFavorited ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>
            <div className="detail-meta">
              <div className="stars">
                {full.map((_, i) => <Icon key={`f${i}`} name="star" size={14} />)}
                {half.map((_, i) => <Icon key={`h${i}`} name="star" size={14} />)}
                {empty.map((_, i) => <Icon key={`e${i}`} name="star" size={14} className="icon-empty" />)}
              </div>
              <span className="detail-rating-num">
                {Number(listing.avg_rating).toFixed(1)} ({listing.review_count})
              </span>
              {openStat && (
                <span className={`status ${openStat.className}`}>
                  {openStat.className === 'open' ? t('listing.open') : t('listing.closed')}
                </span>
              )}
              <span className="detail-location">
                <Icon name="map_pin" size={14} /> {listing.location}
              </span>
            </div>
          </div>

          <div className="detail-cta-row">
            {hasMenu && (
              <button className="detail-cta-primary"
                onClick={() => { setMenuOpen(true); trackClick('menu'); }} type="button">
                <Icon name="menu_book" size={22} />
                <span>View Menu</span>
              </button>
            )}
            {hasRooms && (
              <button className="detail-cta-primary"
                onClick={() => setRoomsOpen(true)} type="button">
                <Icon name="hotels" size={22} />
                <span>See Rooms &amp; Prices</span>
              </button>
            )}
            {hasRooms && hasMenu && (
              <button className="detail-cta-secondary"
                onClick={() => { setMenuOpen(true); trackClick('menu'); }} type="button">
                <Icon name="menu_book" size={16} />
                <span>Restaurant Menu</span>
              </button>
            )}
          </div>

          <div className="detail-actions">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="detail-action-btn"
                onClick={() => trackClick('call')}>
                <Icon name="phone" size={16} /> {t('listing.call')}
              </a>
            )}
            {listing.location && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
                target="_blank" rel="noreferrer" className="detail-action-btn"
                onClick={() => trackClick('directions')}>
                <Icon name="map" size={16} /> {t('listing.directions')}
              </a>
            )}
            {contact.website && (
              <a href={contact.website} target="_blank" rel="noreferrer"
                className="detail-action-btn" onClick={() => trackClick('website')}>
                <Icon name="globe" size={16} /> {t('listing.website')}
              </a>
            )}
            {contact.instagram && (
              <a href={`https://instagram.com/${contact.instagram.replace('@', '')}`}
                target="_blank" rel="noreferrer" className="detail-action-btn"
                onClick={() => trackClick('instagram')}>
                <Icon name="instagram" size={16} /> Instagram
              </a>
            )}
          </div>

          {features.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">{t('listing.features')}</h2>
              <div className="detail-features">
                {features.map(f => (
                  <span key={f} className="feature-chip">
                    <Icon name="check" size={14} /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h2 className="detail-section-title">{t('listing.about')}</h2>
            <p className="detail-description">{listing.description}</p>
          </div>

          {images.length > 1 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Gallery</h2>
              <div className="detail-gallery">
                {images.map((img, i) => (
                  <button key={img.id || i} className="detail-gallery__item"
                    onClick={() => { setLightboxStart(i); setLightboxOpen(true); }}
                    type="button">
                    <img src={resolveUrl(img.url)} alt={img.alt_text || ''} loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {listing.opening_hours && (
            <div className="detail-section">
              <button className="detail-hours-toggle" onClick={() => setHoursOpen(!hoursOpen)} type="button">
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
                <Icon name="chevron_down" size={20}
                  style={{ transform: hoursOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                <button className="btn btn-outline btn-sm" onClick={() => setShowReviewForm(true)} type="button">
                  {t('listing.writeReview')}
                </button>
              )}
              {!user && (
                <Link to="/login" className="btn btn-ghost btn-sm">{t('listing.signinToReview')}</Link>
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
                <ReviewCard key={r.id} review={r}
                  isOwn={user?.id === r.user_id}
                  isEditing={editingReview === r.id}
                  onEdit={() => setEditingReview(r.id)}
                  onCancelEdit={() => setEditingReview(null)}
                  onSave={(rating, comment) => handleReviewUpdate(r.id, rating, comment)}
                  onDelete={() => handleReviewDelete(r.id)} />
              ))}
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="detail-sidebar__card">
            <h3>{t('listing.location')}</h3>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
              target="_blank" rel="noreferrer" className="detail-map-fallback"
              onClick={() => trackClick('directions')}>
              <Icon name="map_pin" size={28} />
              <p>{listing.location}</p>
              <span className="btn btn-primary btn-sm">{t('listing.openInMaps')}</span>
            </a>
          </div>
          <div className="detail-sidebar__card">
            <h3>{t('listing.contact')}</h3>
            <div className="detail-contact-list">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="contact-row" onClick={() => trackClick('call')}>
                  <Icon name="phone" size={16} /> <span>{contact.phone}</span>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="contact-row">
                  <Icon name="mail" size={16} /> <span>{contact.email}</span>
                </a>
              )}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noreferrer"
                  className="contact-row" onClick={() => trackClick('website')}>
                  <Icon name="globe" size={16} /> <span>{t('listing.website')}</span>
                </a>
              )}
            </div>
          </div>
          <Link to="/contact" className="detail-sidebar__ad-slot">
            <Icon name="sparkles" size={24} />
            <strong>Advertise here</strong>
            <small>Reach thousands of visitors</small>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function ReviewCard({ review: r, isOwn, isEditing, onEdit, onCancelEdit, onSave, onDelete }) {
  const [rating, setRating] = useState(r.rating);
  const [comment, setComment] = useState(r.comment || '');
  const [saving, setSaving] = useState(false);

  const wasEdited = r.updated_at && r.updated_at !== r.created_at &&
    new Date(r.updated_at).getTime() > new Date(r.created_at).getTime() + 5000;

  const handleSave = async () => { setSaving(true); await onSave(rating, comment); setSaving(false); };

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">
          {r.user_avatar
            ? <img src={resolveUrl(r.user_avatar)} alt="" />
            : r.user_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <strong>{r.user_name}</strong>
          <div className="stars review-stars">
            {isEditing
              ? [1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)}
                    className={`review-star-edit ${n <= rating ? 'active' : ''}`}>
                    <Icon name="star" size={14} />
                  </button>
                ))
              : Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={12} className={i < r.rating ? '' : 'icon-empty'} />
                ))}
          </div>
        </div>
        <div className="review-card__right">
          <span className="review-date">{formatDate(r.created_at)}</span>
          {wasEdited && <span className="review-edited">edited</span>}
        </div>
      </div>
      {isEditing ? (
        <div className="review-card__edit">
          <textarea className="form-input" rows={3} value={comment}
            onChange={(e) => setComment(e.target.value)} maxLength={1000} />
          <div className="review-card__edit-actions">
            <button className="btn btn-ghost btn-sm" onClick={onCancelEdit} type="button">Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} type="button">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {r.comment && <p className="review-comment">{r.comment}</p>}
          {isOwn && (
            <div className="review-card__own-actions">
              <button className="review-action-btn" onClick={onEdit} type="button">
                <Icon name="upload" size={12} /> Edit
              </button>
              <button className="review-action-btn review-action-btn--danger" onClick={onDelete} type="button">
                <Icon name="close" size={12} /> Delete
              </button>
            </div>
          )}
        </>
      )}
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
          <div className="skeleton" style={{ height: 18, width: '40%' }} />
        </div>
        <aside className="detail-sidebar">
          <div className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-lg)' }} />
        </aside>
      </div>
    </div>
  );
}
