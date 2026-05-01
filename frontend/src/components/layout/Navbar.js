import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useT, LANGUAGES } from '../../i18n';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/logo.png';
import Icon from '../common/Icon';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isBusiness } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const langRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const langBtnRef = useRef(null);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) && !avatarBtnRef.current?.contains(e.target))
        setDropOpen(false);
      if (langRef.current && !langRef.current.contains(e.target) && !langBtnRef.current?.contains(e.target))
        setLangOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => { setDropOpen(false); setLangOpen(false); }, [location.pathname]);

  const NAV_LINKS = [
    { to: '/listings',                     label: t('nav.explore') },
    { to: '/listings?category=hotels',     label: t('nav.hotels') },
    { to: '/listings?category=restaurants',label: t('nav.restaurants') },
    { to: '/listings?category=fast_food',  label: t('nav.fast_food') },
    { to: '/listings?category=activities', label: t('nav.activities') },
  ];

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };
  const dashboardPath = isAdmin ? '/admin' : isBusiness ? '/business' : '/account';
  const currentLang = LANGUAGES.find(l => l.code === lang);
  const variant = isHome && !scrolled ? 'transparent' : 'solid';

  return (
    <nav className={`navbar navbar--${variant}`}>
      {variant === 'solid' && <div className="navbar__top-stripe" />}

      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="npeje.com" className="navbar__logo-img" />
          <span className="navbar__logo-text">npeje<span>.com</span></span>
        </Link>

        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to + label}>
              <NavLink to={to} className={({ isActive }) =>
                `navbar__link ${isActive && to === (location.pathname + location.search) ? 'active' : ''}`
              }>{label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__right">
          {/* Language — desktop + mobile */}
          <div className="navbar__lang" ref={langBtnRef}>
            <button className="navbar__lang-btn"
              onClick={() => setLangOpen(v => !v)} type="button">
              <span className="navbar__lang-flag">{currentLang?.flag}</span>
              <span className="navbar__lang-code">{lang.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div ref={langRef} className="navbar__lang-menu">
                {LANGUAGES.map(l => (
                  <button key={l.code}
                    className={`navbar__lang-item ${l.code === lang ? 'active' : ''}`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    type="button">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="navbar__user">
              <button ref={avatarBtnRef} className="navbar__avatar"
                onClick={() => setDropOpen(v => !v)} type="button">
                {user.avatar
                  ? <img src={user.avatar} alt="" className="navbar__avatar-img" />
                  : <span>{user.name?.[0]?.toUpperCase()}</span>}
              </button>
              {dropOpen && (
                <div ref={dropRef} className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                  <Link to={dashboardPath} className="navbar__dropdown-item">{t('nav.dashboard')}</Link>
                  <Link to="/contact" className="navbar__dropdown-item">{t('nav.support')}</Link>
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout} type="button">{t('nav.signout')}</button>
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
