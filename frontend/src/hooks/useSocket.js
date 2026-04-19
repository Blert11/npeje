import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

const getSocket = () => {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      // polling first, then upgrade to websocket — works behind most proxies
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    socket.on('connect_error', (err) => {
      // Silent — real-time is a non-critical enhancement
      console.debug('[Socket] connect error:', err.message);
    });
  }
  return socket;
};

/**
 * Hook: joins a listing room and returns live viewer count.
 * Used on ListingDetailPage and BusinessDashboard.
 */
export const useListingSocket = (listingId, userId = null) => {
  const [viewerCount, setViewerCount] = useState(0);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!listingId) return;

    const sock = getSocket();

    const handleViewers = ({ listingId: id, count }) => {
      if (String(id) === String(listingId)) setViewerCount(count);
    };

    // Join when connected (or immediately if already connected)
    const joinRoom = () => {
      sock.emit('join:listing', { listingId, userId });
    };

    if (sock.connected) {
      joinRoom();
    } else {
      sock.once('connect', joinRoom);
    }

    sock.on('viewers:update', handleViewers);

    // Heartbeat every 30s to keep session alive
    heartbeatRef.current = setInterval(() => {
      if (sock.connected) sock.emit('heartbeat');
    }, 30_000);

    return () => {
      sock.emit('leave:listing', { listingId });
      sock.off('viewers:update', handleViewers);
      sock.off('connect', joinRoom);
      clearInterval(heartbeatRef.current);
    };
  }, [listingId, userId]);

  return viewerCount;
};
