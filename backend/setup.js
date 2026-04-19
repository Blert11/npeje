/**
 * Quick setup script – run once before starting the server.
 * node setup.js
 */
const fs   = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
  console.log('✅ Created .env from .env.example');
  console.log('   Edit .env and set DB_PASSWORD before running npm run dev\n');
} else {
  console.log('✓ .env already exists');
}

// Load env and test DB connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDb() {
  try {
    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'peja_tourism',
    });
    const [[row]] = await conn.query('SELECT COUNT(*) AS c FROM users');
    await conn.end();
    console.log(`✅ Database connected – ${row.c} user(s) in users table`);
    if (row.c === 0) console.log('   Run: mysql -u root -p < ../database/schema.sql');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    console.error('   Also ensure MySQL is running and the schema has been imported:');
    console.error('   mysql -u root -p < ../database/schema.sql');
  }
}

testDb();
