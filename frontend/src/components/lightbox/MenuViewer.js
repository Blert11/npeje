import { useEffect, useState, useRef } from 'react';
import { menuService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
import { useT } from '../../i18n';
import './MenuViewer.css';

export default function MenuViewer({ listingId, listingName, onClose }) {
  const { t } = useT();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [ready,      setReady]      = useState(false); // prevents flicker
  const [activeTab,  setActiveTab]  = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    menuService.getItems(listingId)
      .then(({ data }) => {
        const cats = (data.data?.categories || []).filter(c => c.items?.length > 0);
        setCategories(cats);
        if (cats.length) setActiveTab(cats[0].id ?? 'uncategorized');
      })
      .catch(() => setCategories([]))
      .finally(() => {
        setLoading(false);
        // Delay ready by 1 frame so the DOM settles before we animate
        requestAnimationFrame(() => setReady(true));
      });
  }, [listingId]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Block body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const scrollToCategory = (catId) => {
    setActiveTab(catId ?? 'uncategorized');
    const id = `menu-cat-${catId ?? 'uncategorized'}`;
    const el = document.getElementById(id);
    if (el && panelRef.current) {
      panelRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`menu-viewer-overlay ${ready ? 'menu-viewer-overlay--visible' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`menu-viewer ${ready ? 'menu-viewer--visible' : ''}`}>
        <header className="menu-viewer__header">
          <div>
            <small>{t('menu.title')}</small>
            <h2>{listingName}</h2>
          </div>
          <button className="menu-viewer__close" onClick={onClose} aria-label="Close" type="button">
            <Icon name="close" size={20} />
          </button>
        </header>

        {!loading && categories.length > 1 && (
          <div className="menu-viewer__tabs">
            {categories.map(cat => {
              const key = cat.id ?? 'uncategorized';
              return (
                <button key={key}
                  className={`menu-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => scrollToCategory(cat.id)}
                  type="button">
                  {cat.name}
                  <span className="menu-tab__count">{cat.items?.length || 0}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="menu-viewer__body" ref={panelRef}>
          {loading && (
            <div className="menu-viewer__loading">{t('common.loading')}</div>
          )}

          {!loading && categories.length === 0 && (
            <div className="menu-viewer__empty">
              <Icon name="menu_book" size={40} strokeWidth={1.5} />
              <p>{t('menu.empty')}</p>
            </div>
          )}

          {categories.map(cat => {
            const key = cat.id ?? 'uncategorized';
            return (
              <section key={key} id={`menu-cat-${key}`} className="menu-viewer__cat-section">
                <h3 className="menu-viewer__cat-title">{cat.name}</h3>
                <div className="menu-viewer__items">
                  {cat.items?.map(item => (
                    <div key={item.id} className="mv-item">
                      {item.image && (
                        <div className="mv-item__img">
                          <img src={resolveUrl(item.image)} alt={item.name} loading="lazy" />
                        </div>
                      )}
                      <div className="mv-item__body">
                        <div className="mv-item__header">
                          <strong>{item.name}</strong>
                          <span className="mv-item__price">
                            {Number(item.price).toFixed(2)} {item.currency || 'EUR'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="mv-item__desc">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
