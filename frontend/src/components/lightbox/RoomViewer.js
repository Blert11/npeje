import { useEffect, useState } from 'react';
import { roomsService } from '../../services/api';
import { resolveUrl } from '../common/ImageUpload';
import Icon from '../common/Icon';
import './RoomViewer.css';

export default function RoomViewer({ listingId, listingName, onClose }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    roomsService.getAll(listingId)
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => setRooms([]))
      .finally(() => {
        setLoading(false);
        requestAnimationFrame(() => setReady(true));
      });
  }, [listingId]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className={`rv-overlay ${ready ? 'rv-overlay--visible' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`rv ${ready ? 'rv--visible' : ''}`}>
        <header className="rv__header">
          <div>
            <small>Rooms &amp; Prices</small>
            <h2>{listingName}</h2>
          </div>
          <button className="rv__close" onClick={onClose} type="button" aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="rv__body">
          {loading && <div className="rv__loading">Loading rooms…</div>}

          {!loading && rooms.length === 0 && (
            <div className="rv__empty">
              <Icon name="hotels" size={40} strokeWidth={1.5} />
              <p>Room information coming soon.</p>
            </div>
          )}

          {rooms.map(room => {
            const amenities = Array.isArray(room.amenities) ? room.amenities : [];
            return (
              <div key={room.id} className="rv__room">
                {room.image && (
                  <div className="rv__room-img">
                    <img src={resolveUrl(room.image)} alt={room.name} loading="lazy" />
                  </div>
                )}
                <div className="rv__room-body">
                  <div className="rv__room-top">
                    <h3>{room.name}</h3>
                    <div className="rv__room-price">
                      <strong>{Number(room.price_per_night).toFixed(0)}{room.currency === 'EUR' ? '€' : room.currency}</strong>
                      <small>/night</small>
                    </div>
                  </div>

                  {room.description && <p className="rv__room-desc">{room.description}</p>}

                  <div className="rv__room-details">
                    {room.beds && (
                      <span className="rv__detail">
                        <Icon name="hotels" size={14} /> {room.beds}
                      </span>
                    )}
                    {room.max_guests && (
                      <span className="rv__detail">
                        <Icon name="user" size={14} /> {room.max_guests} guests
                      </span>
                    )}
                    {room.size_sqm && (
                      <span className="rv__detail">
                        <Icon name="grid" size={14} /> {room.size_sqm}m²
                      </span>
                    )}
                  </div>

                  {amenities.length > 0 && (
                    <div className="rv__amenities">
                      {amenities.map(a => (
                        <span key={a} className="rv__amenity">
                          <Icon name="check" size={12} /> {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
