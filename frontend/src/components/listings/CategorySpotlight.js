import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import { getCategoryConfig } from '../../utils/helpers';
import { useT } from '../../i18n';

/**
 * Promotional spotlight between category lists.
 * Props:
 *   category: 'restaurants' | 'hotels' | 'activities' | ...
 *   stats:    [{ value: '25+', label: 'Options' }, ...]
 */
export default function CategorySpotlight({ category, stats = [], ctaKey = 'section.rugovaCta' }) {
  const { t } = useT();
  const cfg = getCategoryConfig(category);

  return (
    <section className="cat-spotlight" style={{ '--spot-color': cfg.color }}>
      <div className="container">
        <div className="cat-spotlight__inner">
          <div className="cat-spotlight__body">
            <span className="cat-spotlight__eyebrow">
              <Icon name={cfg.iconName} size={12} />
              {t(`cat.${category}`)}
            </span>
            <h2 className="cat-spotlight__title">
              {t(`spotlight.${category}.title`)}
            </h2>
            <p className="cat-spotlight__desc">
              {t(`spotlight.${category}.desc`)}
            </p>

            {stats.length > 0 && (
              <div className="cat-spotlight__stats">
                {stats.map((s, i) => (
                  <div key={i}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            <Link to={`/listings?category=${category}`} className="cat-spotlight__cta">
              {t(ctaKey)}
              <Icon name="arrow_right" size={14} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="cat-spotlight__graphic">
            <Icon name={cfg.iconName} size={56} strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </section>
  );
}
