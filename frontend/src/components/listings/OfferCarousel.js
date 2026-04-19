import { useState, useEffect, useRef, useCallback } from 'react';
import { listingService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import './OfferCarousel.css';

const AUTOPLAY_MS = 5000;

export default function OfferCarousel({ offers = [] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragX,  setDragX]  = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef(null);
  const autoRef = useRef(null);

  const total = offers.length;

  const goTo = useCallback((idx) => {
    setActive(((idx % total) + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total < 2 || dragging) return;
    autoRef.current = setTimeout(() => {
      setActive(prev => (prev + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearTimeout(autoRef.current);
  }, [active, paused, total, dragging]);

  if (!total) return null;

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    setDragging(true);
  };
  const onTouchMove  = (e) => {
    if (touchStart.current === null) return;
    setDragX(e.touches[0].clientX - touchStart.current);
  };
  const onTouchEnd = () => {
    if (touchStart.current === null) return;
    if (Math.abs(dragX) > 60) goTo(active + (dragX < 0 ? 1 : -1));
    setDragX(0);
    setDragging(false);
    touchStart.current = null;
  };

  const handleClick = (e, offer) => {
    if (offer.action_type === 'listing' || !offer.action_type) {
      listingService.trackClick(offer.listing_id, 'share').catch(() => {});
    }
  };

  const getHref = (offer) => {
    if (offer.action_type === 'call' && offer.action_value) {
      return `tel:${offer.action_value.replace(/\s+/g,'')}`;
    }
    if (offer.action_type === 'whatsapp' && offer.action_value) {
      const num = offer.action_value.replace(/[^\d]/g, '');
      return `https://wa.me/${num}`;
    }
    if (offer.action_type === 'custom_url' && offer.action_value) {
      return offer.action_value;
    }
    return `/listings/${offer.listing_slug}`;
  };

  return (
    <div className="offer-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>

      <div className="offer-carousel__viewport"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>

        <div className="offer-carousel__track"
          style={{
            transform: `translateX(calc(-${active * 100}% + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
          {offers.map((offer, i) => {
            const href = getHref(offer);
            const isExternal = offer.action_type === 'whatsapp' || offer.action_type === 'custom_url';
            return (
              <a key={offer.id}
                 href={href}
                 target={isExternal ? '_blank' : undefined}
                 rel={isExternal ? 'noreferrer' : undefined}
                 className="offer-slide"
                 onClick={(e) => handleClick(e, offer)}
                 draggable={false}>
                <img
                  src={resolveUrl(offer.image) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600'}
                  alt={offer.title || 'Offer'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </a>
            );
          })}
        </div>
      </div>

      {total > 1 && (
        <>
          <button className="offer-carousel__arrow offer-carousel__arrow--left"
            onClick={() => goTo(active - 1)} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="offer-carousel__arrow offer-carousel__arrow--right"
            onClick={() => goTo(active + 1)} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Progress bar + dots */}
          <div className="offer-carousel__progress">
            {offers.map((_, i) => (
              <button key={i}
                className={`offer-carousel__dot ${i === active ? 'active' : i < active ? 'passed' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Offer ${i + 1}`}>
                <span className="offer-carousel__dot-fill"
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: (i === active && !paused && !dragging) ? 'running' : 'paused',
                  }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
