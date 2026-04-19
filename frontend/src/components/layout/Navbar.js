import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useT, LANGUAGES } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isBusiness } = useAuth();
  const { t, lang, setLang } = useT();
  const { activeCategory } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const langRef = useRef(null);

  // Navbar becomes solid when scrolled OR when not on the homepage
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setDropOpen(false); setLangOpen(false); }, [location]);

  const NAV_LINKS = [
    { to: '/listings',                      label: t('nav.explore') },
    { to: '/listings?category=hotels',      label: t('nav.hotels') },
    { to: '/listings?category=restaurants', label: t('nav.restaurants') },
    { to: '/listings?category=fast_food',   label: t('nav.fast_food') },
    { to: '/listings?category=activities',  label: t('nav.activities') },
    { to: '/map',                           label: t('nav.map') },
  ];

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };
  const dashboardPath = isAdmin ? '/admin' : isBusiness ? '/business' : null;
  const currentLang = LANGUAGES.find(l => l.code === lang);

  // Variants: 'transparent' (home top), 'solid' (scrolled or other pages)
  const variant = isHome && !scrolled ? 'transparent' : 'solid';

  return (
    <nav className={`navbar navbar--${variant}`}>
      {/* Category color stripe at the top when on a categorized page */}
      {activeCategory && variant === 'solid' && (
        <div className="navbar__accent-stripe" />
      )}

      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="npeje.com home">
          <img src={logo} alt="npeje.com" className="navbar__logo-img" />
          <span className="navbar__logo-text">npeje<span>.com</span></span>
        </Link>

        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to + label}>
              <NavLink to={to}
                className={({ isActive }) =>
                  `navbar__link ${isActive && to === (location.pathname + location.search) ? 'active' : ''}`
                }>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__right">
          <div className="navbar__lang" ref={langRef}>
            <button className="navbar__lang-btn" onClick={() => setLangOpen(!langOpen)}
              aria-label="Language">
              <span>{currentLang?.flag}</span>
              <span className="navbar__lang-code">{lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="navbar__lang-menu animate-scale-in">
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    className={`navbar__lang-item ${l.code === lang ? 'active' : ''}`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}>
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="navbar__user" ref={dropRef}>
              <button className="navbar__avatar" onClick={() => setDropOpen(!dropOpen)}>
                <span>{user.name?.[0]?.toUpperCase()}</span>
              </button>
              {dropOpen && (
                <div className="navbar__dropdown animate-scale-in">
                  <div className="navbar__dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                  {dashboardPath && (
                    <Link to={dashboardPath} className="navbar__dropdown-item">
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  <Link to="/contact" className="navbar__dropdown-item">{t('nav.support')}</Link>
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}>
                    {t('nav.signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__link">{t('nav.signin')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('nav.join')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
