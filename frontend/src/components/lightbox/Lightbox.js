import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveUrl } from '../common/ImageUpload';
import './Lightbox.css';

/**
 * Lightbox: full-screen swipeable image viewer.
 * Props:
 *  - images:   [{ url, alt_text }]
 *  - startIndex
 *  - onClose
 */
export default function Lightbox({ images = [], startIndex = 0, onClose }) {
  const [active, setActive] = useState(startIndex);
  const [dragX,  setDragX]  = useState(0);
  const dragStart = useRef(null);
  const total = images.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  const onTouchStart = (e) => { dragStart.current = e.touches[0].clientX; };
  const onTouchMove  = (e) => {
    if (dragStart.current === null) return;
    setDragX(e.touches[0].clientX - dragStart.current);
  };
  const onTouchEnd = () => {
    if (dragStart.current === null) return;
    if (Math.abs(dragX) > 80) {
      if (dragX > 0) prev(); else next();
    }
    setDragX(0);
    dragStart.current = null;
  };

  if (!total) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="lightbox__counter">{active + 1} / {total}</div>

      {total > 1 && (
        <>
          <button className="lightbox__arrow lightbox__arrow--left"
            onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <button className="lightbox__arrow lightbox__arrow--right"
            onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
        </>
      )}

      <div className="lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}>
        <img
          src={resolveUrl(images[active].url)}
          alt={images[active].alt_text || `Image ${active + 1}`}
          className="lightbox__img"
          style={{ transform: `translateX(${dragX}px)`, transition: dragX === 0 ? 'transform 0.3s ease' : 'none' }}
          draggable={false}
        />
      </div>

      {total > 1 && (
        <div className="lightbox__dots">
          {images.map((_, i) => (
            <button key={i}
              className={`lightbox__dot ${i === active ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActive(i); }}
              aria-label={`Go to image ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}
