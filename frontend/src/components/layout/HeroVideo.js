import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../i18n';
import { CATEGORIES } from '../../utils/helpers';
import SearchBar from '../common/SearchBar';

const DEFAULT_VIDEO_URL = 'https://cdn.pixabay.com/video/2023/09/19/181296-865574998_large.mp4';

export default function HeroVideo({ videoUrl = DEFAULT_VIDEO_URL }) {
  const { t } = useT();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => setVideoLoaded(true);
    const onError = () => setVideoError(true);
    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('error', onError);
    return () => {
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('error', onError);
    };
  }, []);

  return (
    <section className="hero-video">
      <div className="hero-video__media">
        <div className="hero-video__fallback" />
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay muted loop playsInline preload="auto"
            className={`hero-video__bg ${videoLoaded ? 'loaded' : ''}`}
            poster="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80">
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        <div className="hero-video__overlay" />
      </div>

      <div className="container hero-video__content">
        <span className="hero-video__eyebrow animate-fade-up">
          {t('hero.eyebrow')}
        </span>
        <h1 className="hero-video__title display-heading animate-fade-up"
          style={{ animationDelay: '0.1s' }}>
          {t('hero.title').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>
        <p className="hero-video__subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {t('hero.subtitle')}
        </p>
        <div className="hero-video__search animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <SearchBar placeholder={t('hero.searchPlaceholder')} />
        </div>

        <div className="hero-video__chips animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {CATEGORIES.slice(0, 6).map(cat => (
            <Link key={cat.id} to={`/listings?category=${cat.id}`}
              className="hero-chip" style={{ '--chip-color': cat.color }}>
              <span className="hero-chip__icon">{cat.icon}</span>
              <span>{t(`cat.${cat.id}`)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
