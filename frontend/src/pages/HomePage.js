import { useState, useEffect } from 'react';
import { offerService } from '../services/api';
import { useT } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import HeroVideo from '../components/layout/HeroVideo';
import OfferCarousel from '../components/listings/OfferCarousel';
import CategorySection from '../components/listings/CategorySection';
import {
  AdventuresBanner, TaxiBanner, FeatureStrip, AboutPejaSection
} from '../components/listings/PromoBanner';
import './HomePage.css';

export default function HomePage() {
  const { t } = useT();
  const { setActiveCategory } = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reset theme to default on homepage
  useEffect(() => {
    setActiveCategory(null);
  }, [setActiveCategory]);

  useEffect(() => {
    offerService.getAll()
      .then(({ data }) => setOffers(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage page-enter">
      <HeroVideo />

      <FeatureStrip />

      {(loading || offers.length > 0) && (
        <section className="home-offers section">
          <div className="container">
            <div className="home-section-head">
              <span className="home-section-eyebrow">{t('section.offersEyebrow')}</span>
              <h2 className="home-section-title display-heading">{t('section.offers')}</h2>
            </div>
            {loading
              ? <div className="skeleton" style={{ height: 360, borderRadius: 'var(--radius-xl)' }} />
              : <OfferCarousel offers={offers} />}
          </div>
        </section>
      )}

      <CategorySection categoryId="fast_food"   limit={8} />
      <CategorySection categoryId="restaurants" limit={8} />

      <AdventuresBanner />

      <CategorySection categoryId="hotels" limit={8} />
      <CategorySection categoryId="cafes"  limit={8} />

      <TaxiBanner phone="+383 44 123 456" />

      <CategorySection categoryId="activities" limit={8} />
      <CategorySection categoryId="villas"     limit={8} />

      <AboutPejaSection />

      <CategorySection categoryId="nightlife" limit={8} />
      <CategorySection categoryId="shops"     limit={8} />
    </div>
  );
}
