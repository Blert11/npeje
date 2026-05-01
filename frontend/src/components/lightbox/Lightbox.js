import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
import './Lightbox.css';

export default function Lightbox({ images = [], startIndex = 0, onClose }) {
  const [active, setActive] = useState(startIndex);
  const [dragX,  setDragX]  = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const total = images.length;

  const next = useCallback(() => setActive(a => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive(a => (a - 1 + total) % total), [total]);

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

  // Unified pointer events (mouse + touch)
  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onPointerMove = (e) => {
    if (dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onPointerUp = (e) => {
    if (dragStart.current === null) return;
    if (Math.abs(dragX) > 60) {
      if (dragX > 0) prev(); else next();
    }
    setDragX(0);
    setDragging(false);
    dragStart.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  if (!total) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close" type="button">
        <Icon name="close" size={24} />
      </button>

      <div className="lightbox__counter">{active + 1} / {total}</div>

      {total > 1 && (
        <>
          <button className="lightbox__arrow lightbox__arrow--left"
            onClick={(e) => { e.stopPropagation(); prev(); }} type="button">
            <Icon name="chevron_left" size={28} strokeWidth={2.5} />
          </button>
          <button className="lightbox__arrow lightbox__arrow--right"
            onClick={(e) => { e.stopPropagation(); next(); }} type="button">
            <Icon name="chevron_right" size={28} strokeWidth={2.5} />
          </button>
        </>
      )}

      <div className="lightbox__stage"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab' }}>
        <img
          src={resolveUrl(images[active].url)}
          alt={images[active].alt_text || `Image ${active + 1}`}
          className="lightbox__img"
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragging ? 'none' : 'transform 0.3s ease',
          }}
          draggable={false}
        />
      </div>

      {total > 1 && (
        <div className="lightbox__dots">
          {images.map((_, i) => (
            <button key={i}
              className={`lightbox__dot ${i === active ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setActive(i); }}
              type="button" />
          ))}
        </div>
      )}
    </div>
  );
}
