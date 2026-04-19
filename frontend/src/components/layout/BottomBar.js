import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useT, LANGUAGES } from '../../i18n';
import { CATEGORIES } from '../../utils/helpers';
import './BottomBar.css';

const ICONS = {
  explore: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  categories: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  contact: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function BottomBar() {
  const { user, isAdmin, isBusiness } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [catsOpen, setCatsOpen] = useState(false);

  const userPath = user
    ? (isAdmin ? '/admin' : isBusiness ? '/business' : '/contact')
    : '/login';

  const handleCategoryClick = (catId) => {
    setCatsOpen(false);
    navigate(`/listings?category=${catId}`);
  };

  return (
    <>
      <nav className="bottom-bar" role="navigation">
        <NavLink to="/listings" className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}>
          <span className="bottom-bar__icon">{ICONS.explore}</span>
          <span className="bottom-bar__label">{t('nav.explore')}</span>
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}>
          <span className="bottom-bar__icon">{ICONS.map}</span>
          <span className="bottom-bar__label">{t('nav.map')}</span>
        </NavLink>
        <button className={`bottom-bar__item ${catsOpen ? 'active' : ''}`}
          onClick={() => setCatsOpen(!catsOpen)}>
          <span className="bottom-bar__icon">{ICONS.categories}</span>
          <span className="bottom-bar__label">{t('nav.categories')}</span>
        </button>
        <NavLink to="/contact" className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}>
          <span className="bottom-bar__icon">{ICONS.contact}</span>
          <span className="bottom-bar__label">{t('nav.contact')}</span>
        </NavLink>
        <NavLink to={userPath} className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}>
          <span className="bottom-bar__icon">{ICONS.user}</span>
          <span className="bottom-bar__label">{user ? t('nav.account') : t('nav.signin')}</span>
        </NavLink>
      </nav>

      {catsOpen && (
        <>
          <div className="bottom-sheet__backdrop" onClick={() => setCatsOpen(false)} />
          <div className="bottom-sheet">
            <div className="bottom-sheet__handle" />
            <div className="bottom-sheet__header">
              <h3>{t('nav.categories')}</h3>
              <button onClick={() => setCatsOpen(false)} className="bottom-sheet__close">×</button>
            </div>
            <div className="bottom-sheet__grid">
              {CATEGORIES.map((cat, i) => (
                <button key={cat.id} className="cat-tile"
                  style={{ '--cat-color': cat.color, animationDelay: `${i * 30}ms` }}
                  onClick={() => handleCategoryClick(cat.id)}>
                  <span className="cat-tile__icon">{cat.icon}</span>
                  <span className="cat-tile__label">{t(`cat.${cat.id}`)}</span>
                </button>
              ))}
            </div>
            <div className="bottom-sheet__langs">
              <span className="bottom-sheet__label">Language</span>
              <div className="bottom-sheet__lang-row">
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    className={`sheet-lang ${l.code === lang ? 'active' : ''}`}
                    onClick={() => setLang(l.code)}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
