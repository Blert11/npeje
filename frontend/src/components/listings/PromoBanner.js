import { Link } from 'react-router-dom';
import { useT } from '../../i18n';
import './PromoBanner.css';

export function AdventuresBanner() {
  const { t } = useT();
  return (
    <section className="promo-banner">
      <div className="container">
        <div className="promo-banner__card promo-banner__card--adv">
          <div className="promo-banner__content">
            <span className="promo-banner__eyebrow">🏔 {t('section.latestAdventures')}</span>
            <h2 className="display-heading promo-banner__title">
              {t('section.latestAdventures')}
            </h2>
            <p className="promo-banner__desc">{t('section.adventuresDesc')}</p>
            <Link to="/listings?category=activities" className="btn btn-primary">
              {t('section.rugovaCta')} →
            </Link>
          </div>
          <div className="promo-banner__media">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200"
              alt="" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TaxiBanner({ phone = '+38344123456' }) {
  const { t } = useT();
  return (
    <section className="promo-banner">
      <div className="container">
        <a href={`tel:${phone.replace(/\s+/g, '')}`}
           className="promo-banner__card promo-banner__card--taxi">
          <div className="taxi-pattern" />
          <div className="promo-banner__content">
            <span className="promo-banner__eyebrow" style={{ color: '#ffd166' }}>
              🚕 {t('section.bookTaxi')}
            </span>
            <h2 className="display-heading promo-banner__title" style={{ color: '#fff' }}>
              {t('section.bookTaxi')}
            </h2>
            <p className="promo-banner__desc" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {t('section.taxiDesc')}
            </p>
            <span className="taxi-cta">
              <span className="taxi-cta__icon">📞</span>
              <span>
                <small>{t('section.taxiCta')}</small>
                <strong>{phone}</strong>
              </span>
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

/* ─── NEW: Feature highlights section to add more content ─── */
export function FeatureStrip() {
  const { t } = useT();
  const features = [
    { icon: '🏔',  title: t('features.mountainViews') || 'Mountain Views',     desc: t('features.mountainDesc') || 'Gateway to the Accursed Mountains' },
    { icon: '🍽️', title: t('features.authenticFood') || 'Authentic Food',     desc: t('features.foodDesc')     || 'Traditional Balkan cuisine' },
    { icon: '🧗', title: t('features.adventure')     || 'Adventure',           desc: t('features.adventureDesc') || 'Hikes, zip-lines, via ferrata' },
    { icon: '🏨', title: t('features.comfort')       || 'Comfortable Stays',   desc: t('features.comfortDesc')   || 'Hotels, villas, mountain lodges' },
  ];
  return (
    <section className="feature-strip">
      <div className="container">
        <div className="feature-strip__grid">
          {features.map((f, i) => (
            <div key={i} className="feature-strip__item"
              style={{ animationDelay: `${i * 80}ms` }}>
              <span className="feature-strip__icon">{f.icon}</span>
              <div>
                <strong>{f.title}</strong>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials / About Peja ─── */
export function AboutPejaSection() {
  const { t } = useT();
  return (
    <section className="about-peja">
      <div className="container">
        <div className="about-peja__grid">
          <div className="about-peja__content">
            <span className="about-peja__eyebrow">{t('about.eyebrow') || 'About Peja'}</span>
            <h2 className="display-heading">{t('about.title') || 'Kosovo\'s Hidden Gem'}</h2>
            <p>{t('about.p1') || 'Nestled at the foot of the Accursed Mountains, Peja is a city where Ottoman heritage meets Alpine wilderness. From the UNESCO-protected Patriarchate of Peć to the dramatic cliffs of Rugova Canyon, every corner tells a story.'}</p>
            <p>{t('about.p2') || 'Whether you\'re here for a weekend getaway, a hiking adventure, or to taste real flija and qebapa, we help you find the best the city has to offer — curated by locals, updated in real time.'}</p>
            <div className="about-peja__stats">
              <div>
                <strong>150+</strong>
                <span>{t('about.listings') || 'Listings'}</span>
              </div>
              <div>
                <strong>25km</strong>
                <span>{t('about.canyon') || 'Rugova Canyon'}</span>
              </div>
              <div>
                <strong>1253</strong>
                <span>{t('about.founded') || 'Founded'}</span>
              </div>
            </div>
          </div>
          <div className="about-peja__image">
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200"
              alt="" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
