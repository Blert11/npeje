import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
import './OfferCarousel.css';

const AUTOPLAY_MS = 6000;

/**
 * v8 — Infinite-loop carousel. Clones first and last slides so the
 * transition from last→first (and first→last) is seamless. No jump.
 */
export default function OfferCarousel({ offers = [] }) {
  const navigate = useNavigate();
  const total = offers.length;
  // We prepend a clone of the last slide and append a clone of the first slide.
  // Real slides are at indices 1..total. Index 0 is clone-of-last, index total+1 is clone-of-first.
  const [idx, setIdx]         = useState(1);
  const [paused, setPaused]   = useState(false);
  const [dragging, setDrag]   = useState(false);
  const [dragX, setDragX]     = useState(0);
  const [animate, setAnimate] = useState(true);
  const viewportRef = useRef(null);
  const dragStart   = useRef(null);
  const autoRef     = useRef(null);

  const realIndex = ((idx - 1) % total + total) % total; // 0-based for dots

  const goTo = useCallback((newIdx) => {
    setAnimate(true);
    setIdx(newIdx);
  }, []);

  // After transition ends on a clone slide, silently jump to the real one
  const handleTransitionEnd = useCallback(() => {
    if (idx === 0) {
      setAnimate(false);
      setIdx(total);
    } else if (idx === total + 1) {
      setAnimate(false);
      setIdx(1);
    }
  }, [idx, total]);

  // Autoplay
  useEffect(() => {
    if (paused || total < 2 || dragging) return;
    autoRef.current = setTimeout(() => goTo(idx + 1), AUTOPLAY_MS);
    return () => clearTimeout(autoRef.current);
  }, [idx, paused, total, dragging, goTo]);

  if (!total) return null;

  // Build slides array: [clone-last, ...real, clone-first]
  const slides = [
    offers[total - 1], // clone of last
    ...offers,
    offers[0],         // clone of first
  ];

  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    setDrag(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onPointerMove = (e) => {
    if (dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onPointerUp = (e) => {
    if (dragStart.current === null) return;
    const vw = viewportRef.current?.offsetWidth || 1;
    const threshold = Math.max(40, vw * 0.1);
    if (Math.abs(dragX) > threshold) goTo(idx + (dragX < 0 ? 1 : -1));
    setDragX(0);
    setDrag(false);
    dragStart.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  const handleSlideClick = (e, offer) => {
    if (Math.abs(dragX) > 5) { e.preventDefault(); return; }
    // Navigate to listing
    if (offer.action_type === 'call' && offer.action_value) {
      window.open(`tel:${offer.action_value.replace(/\s+/g, '')}`, '_self');
    } else if (offer.action_type === 'whatsapp' && offer.action_value) {
      window.open(`https://wa.me/${offer.action_value.replace(/[^\d]/g, '')}`, '_blank');
    } else if (offer.action_type === 'custom_url' && offer.action_value) {
      window.open(offer.action_value, '_blank');
    } else if (offer.listing_slug) {
      navigate(`/listings/${offer.listing_slug}`);
      listingService.trackClick(offer.listing_id, 'share').catch(() => {});
    }
  };

  const translateX = `calc(${-idx * 100}% + ${dragX}px)`;

  return (
    <div
      className="offer-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="offer-carousel__viewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="offer-carousel__track"
          style={{
            transform: `translate3d(${translateX}, 0, 0)`,
            transition: (!animate || dragging) ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((offer, i) => (
            <div
              key={`${offer.id}-${i}`}
              className="offer-slide"
              onClick={(e) => handleSlideClick(e, offer)}
            >
              <img
                src={resolveUrl(offer.image) || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600'}
                alt={offer.title || 'Offer'}
                loading={i <= 2 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button className="offer-carousel__arrow offer-carousel__arrow--left"
            onClick={() => goTo(idx - 1)} aria-label="Previous" type="button">
            <Icon name="chevron_left" size={20} strokeWidth={2.5} />
          </button>
          <button className="offer-carousel__arrow offer-carousel__arrow--right"
            onClick={() => goTo(idx + 1)} aria-label="Next" type="button">
            <Icon name="chevron_right" size={20} strokeWidth={2.5} />
          </button>

          <div className="offer-carousel__dots">
            {offers.map((_, i) => (
              <button key={i}
                className={`offer-carousel__dot ${i === realIndex ? 'active' : ''}`}
                onClick={() => goTo(i + 1)}
                aria-label={`Slide ${i + 1}`}
                type="button" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
