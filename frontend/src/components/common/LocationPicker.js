import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import './LocationPicker.css';

/**
 * Easy location picker — no map library required.
 *
 * Three ways to set a location:
 *   1. Type the address
 *   2. Paste a Google Maps URL (lat/lng auto-extracted)
 *   3. Click "Use my current location" (browser geolocation)
 *
 * Returns an object: { address, lat, lng, mapsUrl }
 */
export default function LocationPicker({ value = {}, onChange, label = 'Location' }) {
  const [address, setAddress] = useState(value.address || '');
  const [lat,     setLat]     = useState(value.lat || '');
  const [lng,     setLng]     = useState(value.lng || '');
  const [gpsLoading, setGps]  = useState(false);
  const [gpsError, setGpsErr] = useState('');
  const [advanced, setAdv]    = useState(false);
  const inputRef = useRef(null);

  // Emit combined value upward
  useEffect(() => {
    onChange?.({
      address,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      mapsUrl: lat && lng
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
          : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  // Parse Google Maps URL pasted into the address field
  const handleAddressChange = (val) => {
    // Detect Google Maps link patterns
    const mapsMatch =
      val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||          // @lat,lng in URL path
      val.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||     // ?q=lat,lng
      val.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);          // legacy ll=

    if (mapsMatch) {
      setLat(mapsMatch[1]);
      setLng(mapsMatch[2]);
      // Try to extract the place name from a /place/NAME/... URL
      const nameMatch = val.match(/\/place\/([^/@]+)/);
      const prettyName = nameMatch
        ? decodeURIComponent(nameMatch[1]).replace(/\+/g, ' ')
        : `${mapsMatch[1]}, ${mapsMatch[2]}`;
      setAddress(prettyName);
      setAdv(true);
      return;
    }

    // Paste of plain "lat, lng" number string
    const latLngMatch = val.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
    if (latLngMatch) {
      setLat(latLngMatch[1]);
      setLng(latLngMatch[2]);
      setAdv(true);
    }

    setAddress(val);
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsErr('Geolocation not supported');
      return;
    }
    setGps(true);
    setGpsErr('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setAdv(true);
        setGps(false);
      },
      (err) => {
        setGps(false);
        setGpsErr(err.code === 1 ? 'Permission denied' : 'Could not get location');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasCoords = lat && lng;
  const previewUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.004},${lat - 0.003},${lng - -0.004},${lat - -0.003}&layer=mapnik&marker=${lat},${lng}`
    : null;

  return (
    <div className="loc-picker">
      {label && <label className="form-label">{label}</label>}

      <div className="loc-picker__main">
        <Icon name="map_pin" size={16} className="loc-picker__icon" />
        <input
          ref={inputRef}
          type="text"
          className="loc-picker__input"
          placeholder="e.g. Rr. UÇK 45, Pejë  (or paste a Google Maps link)"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
        />
        <button
          type="button"
          className="loc-picker__gps"
          onClick={handleGps}
          disabled={gpsLoading}
          title="Use my current location"
        >
          {gpsLoading
            ? <span className="loc-picker__spin" />
            : <Icon name="compass" size={16} />}
        </button>
      </div>

      {gpsError && <div className="loc-picker__error">{gpsError}</div>}

      {hasCoords && (
        <div className="loc-picker__preview">
          <iframe
            key={`${lat}-${lng}`}
            title="Map preview"
            src={previewUrl}
            frameBorder="0"
            loading="lazy"
          />
          <div className="loc-picker__coords">
            <span>📍 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}</span>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="loc-picker__view"
            >
              Open in Maps <Icon name="arrow_right" size={12} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        className="loc-picker__toggle"
        onClick={() => setAdv(v => !v)}
      >
        <Icon name="chevron_down" size={12} strokeWidth={2.5}
          style={{ transform: advanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        {advanced ? 'Hide' : 'Set'} coordinates manually
      </button>

      {advanced && (
        <div className="loc-picker__manual">
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              type="text"
              className="form-input"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="42.6591"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              type="text"
              className="form-input"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="20.2879"
            />
          </div>
        </div>
      )}

      <div className="loc-picker__hint">
        <strong>Tip:</strong> The easiest way is to paste a Google Maps link.
        Find the place in Google Maps → Share → Copy link → paste here.
        Coordinates auto-fill.
      </div>
    </div>
  );
}
