import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { listingService } from '../services/api';
import { getCategoryConfig } from '../utils/helpers';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createMarkerIcon = (emoji) => L.divIcon({
  html: `<div class="map-marker">${emoji}</div>`,
  className: '',
  iconSize:   [38, 38],
  iconAnchor: [19, 38],
  popupAnchor:[0, -38],
});

const PEJA_CENTER = [42.6601, 20.2889];

export default function MapPage() {
  const [listings,  setListings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [category,  setCategory]  = useState('');

  useEffect(() => {
    listingService.getAll({ limit: 100, ...(category ? { category } : {}) })
      .then(({ data }) => setListings(data.data || []))
      .finally(() => setLoading(false));
  }, [category]);

  const geoListings = listings.filter(l => l.lat && l.lng);

  return (
    <div className="map-page page-enter">
      <div className="map-page__header">
        <div className="container map-page__header-inner">
          <h1 className="display-heading">Map View</h1>
          <select className="form-input map-page__filter"
            value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="hotels">Hotels</option>
            <option value="restaurants">Restaurants</option>
            <option value="cafes">Cafes</option>
            <option value="villas">Villas</option>
            <option value="activities">Activities</option>
            <option value="nightlife">Nightlife</option>
            <option value="transport">Transport</option>
            <option value="shops">Shops</option>
          </select>
        </div>
      </div>

      <div className="map-page__body">
        {/* Sidebar list */}
        <div className="map-sidebar">
          <p className="map-sidebar__count">{geoListings.length} places on map</p>
          <div className="map-sidebar__list">
            {geoListings.map(l => {
              const cat = getCategoryConfig(l.category);
              return (
                <button key={l.id}
                  className={`map-list-item ${selected?.id === l.id ? 'active' : ''}`}
                  onClick={() => setSelected(l)}>
                  <span className="map-list-item__icon">{cat.icon}</span>
                  <div>
                    <strong>{l.title}</strong>
                    <span>{cat.label} · {l.location}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="map-container-wrap">
          {!loading && (
            <MapContainer
              center={PEJA_CENTER}
              zoom={13}
              className="leaflet-map"
              scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
              />
              {geoListings.map(l => {
                const cat = getCategoryConfig(l.category);
                return (
                  <Marker
                    key={l.id}
                    position={[l.lat, l.lng]}
                    icon={createMarkerIcon(cat.icon)}
                    eventHandlers={{ click: () => setSelected(l) }}>
                    <Popup className="map-popup">
                      <div className="map-popup__inner">
                        {l.cover_image && (
                          <img src={l.cover_image} alt={l.title}
                            className="map-popup__img" />
                        )}
                        <div className="map-popup__body">
                          <strong>{l.title}</strong>
                          <span>{cat.icon} {cat.label}</span>
                          <Link to={`/listings/${l.slug}`} className="btn btn-primary btn-sm map-popup__btn">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
