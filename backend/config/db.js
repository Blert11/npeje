const mysql = require('mysql2/promise');

// Validate required env vars
const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missing  = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`[DB] Missing environment variables: ${missing.join(', ')}`);
  console.error('[DB] Copy .env.example to .env and fill in your MySQL credentials');
  process.exit(1);
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'peja_tourism',
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  timezone:           'Z',
  decimalNumbers:     true,
  // Reconnect on idle timeout
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

// Test on startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] ✅ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] ❌ Connection failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('[DB]    → Is MySQL running? Try: sudo service mysql start');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('[DB]    → Wrong DB_USER or DB_PASSWORD in .env');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('[DB]    → Database not found. Run: mysql -u root -p < database/schema.sql');
    }
    process.exit(1);
  });

module.exports = pool;
