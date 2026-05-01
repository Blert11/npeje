import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useT, LANGUAGES } from '../../i18n';
import { CATEGORIES } from '../../utils/helpers';
import Icon from '../common/Icon';
import './BottomBar.css';

export default function BottomBar() {
  const { user, isAdmin, isBusiness } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [catsOpen, setCatsOpen] = useState(false);

  const userPath = user
    ? (isAdmin ? '/admin' : isBusiness ? '/business' : '/account')
    : '/login';

  const handleCategoryClick = (catId) => {
    setCatsOpen(false);
    navigate(`/listings?category=${catId}`);
  };

  return (
    <>
      <nav className="bottom-bar" role="navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-bar__icon"><Icon name="compass" size={22} /></span>
          <span className="bottom-bar__label">Home</span>
        </NavLink>

        <NavLink
          to="/listings"
          className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-bar__icon"><Icon name="search" size={22} /></span>
          <span className="bottom-bar__label">{t('nav.explore')}</span>
        </NavLink>

        <button
          className={`bottom-bar__item ${catsOpen ? 'active' : ''}`}
          onClick={() => setCatsOpen(!catsOpen)}
          type="button"
        >
          <span className="bottom-bar__icon"><Icon name="grid" size={22} /></span>
          <span className="bottom-bar__label">{t('nav.categories')}</span>
        </button>

        <NavLink
          to="/contact"
          className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-bar__icon"><Icon name="mail" size={22} /></span>
          <span className="bottom-bar__label">{t('nav.contact')}</span>
        </NavLink>

        <NavLink
          to={userPath}
          className={({ isActive }) => `bottom-bar__item ${isActive ? 'active' : ''}`}
        >
          <span className="bottom-bar__icon"><Icon name="user" size={22} /></span>
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
              <button
                onClick={() => setCatsOpen(false)}
                className="bottom-sheet__close"
                type="button"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="bottom-sheet__grid">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  className="cat-tile"
                  style={{ '--cat-color': cat.color, animationDelay: `${i * 30}ms` }}
                  onClick={() => handleCategoryClick(cat.id)}
                  type="button"
                >
                  <Icon name={cat.iconName} size={24} />
                  <span className="cat-tile__label">{t(`cat.${cat.id}`)}</span>
                </button>
              ))}
            </div>
            <div className="bottom-sheet__langs">
              <span className="bottom-sheet__label">Language</span>
              <div className="bottom-sheet__lang-row">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`sheet-lang ${l.code === lang ? 'active' : ''}`}
                    onClick={() => setLang(l.code)}
                    type="button"
                  >
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
