const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const logger = require('../utils/logger');

// In-memory map: listingId -> Set of socketIds
const activeViewers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    logger.debug(`[Socket] Connected: ${socket.id}`);

    // Client joins a listing room
    socket.on('join:listing', async ({ listingId, userId }) => {
      if (!listingId) return;

      const roomId = `listing:${listingId}`;
      socket.join(roomId);
      socket.data.listingId = listingId;
      socket.data.userId    = userId || null;

      // Track in memory
      if (!activeViewers.has(listingId)) activeViewers.set(listingId, new Set());
      activeViewers.get(listingId).add(socket.id);

      const count = activeViewers.get(listingId).size;

      // Broadcast updated count to everyone in the room
      io.to(roomId).emit('viewers:update', { listingId, count });

      // Persist session
      const sessionId = uuidv4();
      socket.data.sessionId = sessionId;
      try {
        await db.query(
          'INSERT INTO sessions (id, user_id, listing_id) VALUES (?,?,?)',
          [sessionId, userId || null, listingId]
        );
      } catch { /* non-critical */ }
    });

    // Client leaves a listing
    socket.on('leave:listing', ({ listingId }) => {
      handleLeave(socket, io, listingId);
    });

    // Heartbeat – keep session alive
    socket.on('heartbeat', async () => {
      if (socket.data.sessionId) {
        try {
          await db.query(
            'UPDATE sessions SET last_active_at = NOW() WHERE id = ?',
            [socket.data.sessionId]
          );
        } catch { /* non-critical */ }
      }
    });

    socket.on('disconnect', () => {
      handleLeave(socket, io, socket.data.listingId);
      logger.debug(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};

function handleLeave(socket, io, listingId) {
  if (!listingId) return;

  const roomId = `listing:${listingId}`;
  socket.leave(roomId);

  if (activeViewers.has(listingId)) {
    activeViewers.get(listingId).delete(socket.id);
    if (activeViewers.get(listingId).size === 0) activeViewers.delete(listingId);
  }

  const count = activeViewers.get(listingId)?.size || 0;
  io.to(roomId).emit('viewers:update', { listingId, count });
}

// Expose for analytics endpoint
const getActiveViewers = (listingId) => activeViewers.get(listingId)?.size || 0;

module.exports = { initSocket, getActiveViewers };
