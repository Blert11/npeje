import { useState, useEffect, useRef, useCallback } from 'react';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
import './DetailCarousel.css';

const AUTOPLAY_MS = 5000;

export default function DetailCarousel({ images = [], onOpenLightbox }) {
  const total = images.length;
  const [active, setActive]     = useState(0);
  const [paused, setPaused]     = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX]       = useState(0);
  const [progress, setProgress] = useState(0);
  const dragStart = useRef(null);
  const autoRef   = useRef(null);
  const progRef   = useRef(null);

  const goTo = useCallback((i) => {
    setActive(((i % total) + total) % total);
    setProgress(0);
  }, [total]);

  // Autoplay + progress
  useEffect(() => {
    if (paused || total < 2 || dragging) { setProgress(0); return; }
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / AUTOPLAY_MS, 1);
      setProgress(p);
      if (p < 1) progRef.current = requestAnimationFrame(tick);
    };
    progRef.current = requestAnimationFrame(tick);
    autoRef.current = setTimeout(() => goTo(active + 1), AUTOPLAY_MS);
    return () => { clearTimeout(autoRef.current); cancelAnimationFrame(progRef.current); };
  }, [active, paused, total, dragging, goTo]);

  if (!total) return null;

  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    setDragging(true);
  };
  const onPointerMove = (e) => {
    if (dragStart.current === null) return;
    setDragX(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (dragStart.current === null) return;
    const moved = Math.abs(dragX);
    if (moved > 50 && total > 1) goTo(active + (dragX < 0 ? 1 : -1));
    else if (moved < 5 && onOpenLightbox) onOpenLightbox(active);
    setDragX(0);
    setDragging(false);
    dragStart.current = null;
  };

  return (
    <div className="dc" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Progress bar — ON TOP of the image */}
      {total > 1 && (
        <div className="dc__progress">
          {images.map((_, i) => (
            <button key={i}
              className={`dc__seg ${i === active ? 'active' : i < active ? 'done' : ''}`}
              onClick={() => goTo(i)} type="button">
              {i === active && <span className="dc__seg-fill" style={{ transform: `scaleX(${progress})` }} />}
            </button>
          ))}
        </div>
      )}

      <div className="dc__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        <div className="dc__track" style={{
          transform: `translate3d(calc(${-active * 100}% + ${dragX}px), 0, 0)`,
          transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {images.map((img, i) => (
            <div key={img.id || i} className="dc__slide">
              <img src={resolveUrl(img.url)} alt={img.alt_text || ''} loading={i < 2 ? 'eager' : 'lazy'} draggable={false} />
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <>
          <button className="dc__arrow dc__arrow--l" onClick={() => goTo(active - 1)} type="button">
            <Icon name="chevron_left" size={22} strokeWidth={2.5} />
          </button>
          <button className="dc__arrow dc__arrow--r" onClick={() => goTo(active + 1)} type="button">
            <Icon name="chevron_right" size={22} strokeWidth={2.5} />
          </button>
        </>
      )}

      {total > 1 && (
        <div className="dc__thumbs">
          {images.map((img, i) => (
            <button key={img.id || i} className={`dc__thumb ${active === i ? 'active' : ''}`}
              onClick={() => goTo(i)} type="button">
              <img src={resolveUrl(img.url)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
