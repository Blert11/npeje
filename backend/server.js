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

const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const {
  offerRouter, analyticsRouter, adminRouter, contactRouter, reviewRouter
} = require('./routes/index');

// Upload + menu routers
const { uploadRouter, menuRouter } = require('./routes/v3-additions');

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

// Static uploads BEFORE rate-limit
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// Rate-limit
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 500,
  standardHeaders: true,
  legacyHeaders:   false,
});
app.use('/api', limiter);

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/listings',  listingRoutes);
app.use('/api/offers',    offerRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/contacts',  contactRouter);
app.use('/api/reviews',   reviewRouter);

// NEW: upload + menu
app.use('/api/upload',    uploadRouter);
app.use('/api',           menuRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

const PORT = parseInt(process.env.PORT) || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📤 Uploads served at http://localhost:${PORT}/uploads/`);
});

module.exports = { app, server };
