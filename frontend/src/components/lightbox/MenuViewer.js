import { useState, useEffect } from 'react';
import api from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import { useT } from '../../i18n';
import './MenuViewer.css';

export default function MenuViewer({ listingId, listingName, onClose }) {
  const { t } = useT();
  const [menu,    setMenu]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get(`/listings/${listingId}/menu`)
      .then(({ data }) => setMenu(data.data))
      .catch(() => setMenu({ sections: {}, items: [] }))
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [listingId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sections = menu?.sections || {};
  const sectionKeys = Object.keys(sections);
  const isEmpty = !loading && (!menu?.items || menu.items.length === 0);

  return (
    <div className="menu-viewer" onClick={onClose}>
      <div className="menu-viewer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="menu-viewer__header">
          <div>
            <span className="menu-viewer__eyebrow">{listingName}</span>
            <h2>{t('menu.title')}</h2>
          </div>
          <button className="menu-viewer__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="menu-viewer__body">
          {loading && (
            <div className="menu-viewer__loading">
              <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
            </div>
          )}

          {isEmpty && (
            <div className="menu-viewer__empty">
              <span>🍽️</span>
              <p>{t('menu.empty')}</p>
            </div>
          )}

          {!loading && sectionKeys.map(section => (
            <div key={section} className="menu-section">
              <h3 className="menu-section__title">{section}</h3>
              <div className="menu-section__items">
                {sections[section].map((item, i) => (
                  <div key={item.id}
                    className="menu-item animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}>
                    {item.image && (
                      <div className="menu-item__img">
                        <img src={resolveUrl(item.image)} alt={item.name} loading="lazy" />
                      </div>
                    )}
                    <div className="menu-item__body">
                      <div className="menu-item__top">
                        <h4 className="menu-item__name">{item.name}</h4>
                        <span className="menu-item__price">
                          {item.currency || '€'}{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="menu-item__desc">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
