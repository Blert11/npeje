require('dotenv').config();
const express     = require('express');
const http        = require('http');
const path        = require('path');
const { Server }  = require('socket.io');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const { favoritesRouter, roomsRouter } = require('./routes/v9-additions');

const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const {
  offerRouter, analyticsRouter, adminRouter, contactRouter, reviewRouter
} = require('./routes/index');

// v3/v4 routers
const { uploadRouter, menuRouter } = require('./routes/v3-additions');

// v6 - menu categories router
const menuCategoriesRouter = require('./routes/menuCategories');

const { initSocket } = require('./socket/index');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});
initSocket(io);

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// ─── RATE LIMITING — v6 fix for 429 errors ────────────────────
// The homepage fires 9+ listing requests concurrently (one per category).
// Old limit of 500/15min was fine in theory but express-rate-limit counts
// each request individually, so page refreshes burned through it fast.
//
// NEW: 3000 requests per 15 minutes, and READ requests (GET) have their
// own separate, even more generous bucket so browsing never hits the limit.
// Write operations (POST/PUT/DELETE) keep the stricter 500 limit.

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      3000,
  standardHeaders: true,
  legacyHeaders:   false,
  // Only count GET requests in this bucket
  skip: (req) => req.method !== 'GET',
  message: { success: false, message: 'Too many read requests. Please wait a moment.' },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => req.method === 'GET',
  message: { success: false, message: 'Too many write requests. Please wait a moment.' },
});

app.use('/api', readLimiter);
app.use('/api', writeLimiter);

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/listings',  listingRoutes);
app.use('/api/offers',    offerRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/contacts',  contactRouter);
app.use('/api/reviews',   reviewRouter);
app.use('/api/upload',    uploadRouter);
app.use('/api',           menuRouter);

// v6: menu categories
app.use('/api/menu-categories', menuCategoriesRouter);

// v9: favorites + rooms
app.use('/api/favorites', favoritesRouter);
app.use('/api', roomsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = parseInt(process.env.PORT) || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📤 Uploads served at http://localhost:${PORT}/uploads/`);
});

module.exports = { app, server };
