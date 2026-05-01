import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerService } from '../services/api';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import HeroVideo from '../components/layout/HeroVideo';
import OfferCarousel from '../components/listings/OfferCarousel';
import CategorySection from '../components/listings/CategorySection';
import { AdventuresBanner, TaxiBanner, AboutPejaSection } from '../components/listings/PromoBanner';
import Icon from '../components/common/Icon';
import './HomePage.css';

export default function HomePage() {
  const { t } = useT();
  const { setActiveCategory } = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setActiveCategory(null); }, [setActiveCategory]);
  useEffect(() => {
    offerService.getAll()
      .then(({ data }) => setOffers(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage page-enter">
      <HeroVideo />

      {/* Carousel right under hero */}
      {(loading || offers.length > 0) && (
        <section className="home-carousel-section">
          <div className="container">
            <div className="home-section-head">
              <span className="home-section-eyebrow">
                <Icon name="zap" size={12} /> {t('section.offersEyebrow')}
              </span>
              <h2 className="home-section-title display-heading">{t('section.offers')}</h2>
            </div>
            {loading
              ? <div className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
              : <OfferCarousel offers={offers} />}
          </div>
        </section>
      )}

      <CategorySection categoryId="restaurants" limit={8} />
      <CategorySection categoryId="hotels"      limit={8} />

      <AdventuresBanner />

      <CategorySection categoryId="fast_food"   limit={8} />
      <CategorySection categoryId="cafes"       limit={8} />

      <TaxiBanner phone="+383 44 123 456" />

      <CategorySection categoryId="activities"  limit={8} />
      <CategorySection categoryId="villas"      limit={8} />

      <AboutPejaSection />

      {/* ─── Extra SEO sections ─────────────────────────────── */}
      <CategorySection categoryId="nightlife"   limit={8} />
      <CategorySection categoryId="shops"       limit={8} />
      <CategorySection categoryId="transport"   limit={8} />

      {/* FAQ / SEO text block */}
      <section className="home-seo-section">
        <div className="container">
          <h2 className="display-heading home-seo-section__title">Explore Peja &amp; Rugova Valley</h2>
          <div className="home-seo-grid">
            <div className="home-seo-card">
              <h3>Where to eat in Peja?</h3>
              <p>Peja offers a diverse culinary scene, from traditional Albanian restaurants serving flija and tavë kosi to modern fast-food joints and specialty cafes. The riverside restaurants near Rugova Canyon are a must-visit for fresh trout dishes.</p>
              <Link to="/listings?category=restaurants">Browse restaurants</Link>
            </div>
            <div className="home-seo-card">
              <h3>Where to stay in Peja?</h3>
              <p>From luxury hotels in the city center to cozy mountain villas and guesthouses in Rugova Valley, Peja has accommodation for every budget. Many offer stunning views of the Accursed Mountains.</p>
              <Link to="/listings?category=hotels">Browse hotels</Link>
            </div>
            <div className="home-seo-card">
              <h3>What to do in Rugova?</h3>
              <p>Rugova Canyon stretches 25 km and offers hiking trails, via ferrata routes, zip-lining, kayaking, and rock climbing. The canyon is one of the longest in Europe and a must-see for outdoor enthusiasts.</p>
              <Link to="/listings?category=activities">Browse activities</Link>
            </div>
            <div className="home-seo-card">
              <h3>Nightlife in Peja</h3>
              <p>The city center comes alive at night with bars, clubs, and live music venues. Peja's nightlife scene has grown rapidly, offering everything from craft beer bars to open-air summer clubs.</p>
              <Link to="/listings?category=nightlife">Browse nightlife</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta">
            <div className="home-cta__content">
              <h2 className="display-heading">List your business on npeje.com</h2>
              <p>Reach thousands of visitors exploring Peja and Rugova Valley. Free listing for all local businesses.</p>
              <Link to="/contact" className="btn btn-primary">Get started free</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
