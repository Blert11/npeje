import { Link } from 'react-router-dom';
import { useT } from '../../i18n';
import Icon from '../common/Icon';

export function AdventuresBanner() {
  const { t } = useT();
  return (
    <section className="promo-banner">
      <div className="container">
        <div className="promo-banner__card promo-banner__card--adv">
          <div className="promo-banner__content">
            <span className="promo-banner__eyebrow">
              <Icon name="mountain" size={12} /> {t('section.latestAdventures')}
            </span>
            <h2 className="display-heading promo-banner__title">
              {t('section.latestAdventures')}
            </h2>
            <p className="promo-banner__desc">{t('section.adventuresDesc')}</p>
            <Link to="/listings?category=activities" className="btn btn-primary">
              {t('section.rugovaCta')}
              <Icon name="arrow_right" size={14} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="promo-banner__media">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200"
              alt=""
              loading="lazy"
            />
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
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="promo-banner__card promo-banner__card--taxi"
        >
          <div className="promo-banner__content">
            <span className="promo-banner__eyebrow" style={{ color: '#ffd166', background: 'rgba(255, 209, 102, 0.2)' }}>
              <Icon name="transport" size={12} /> {t('section.bookTaxi')}
            </span>
            <h2 className="display-heading promo-banner__title" style={{ color: '#fff' }}>
              {t('section.bookTaxi')}
            </h2>
            <p className="promo-banner__desc" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {t('section.taxiDesc')}
            </p>
            <span className="taxi-cta">
              <span className="taxi-cta__icon">
                <Icon name="phone" size={18} />
              </span>
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

export function AboutPejaSection() {
  const { t } = useT();
  return (
    <section className="about-peja">
      <div className="container">
        <div className="about-peja__grid">
          <div className="about-peja__content">
            <span className="about-peja__eyebrow">{t('about.eyebrow')}</span>
            <h2 className="display-heading">{t('about.title')}</h2>
            <p>{t('about.p1')}</p>
            <p>{t('about.p2')}</p>
            <div className="about-peja__stats">
              <div><strong>150+</strong><span>{t('about.listings')}</span></div>
              <div><strong>25km</strong><span>{t('about.canyon')}</span></div>
              <div><strong>1253</strong><span>{t('about.founded')}</span></div>
            </div>
          </div>
          <div className="about-peja__image">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200"
              alt=""
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
