const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'url_shortener',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code VARCHAR(50) UNIQUE NOT NULL,
      short_url TEXT NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS url_clicks (
      id SERIAL PRIMARY KEY,
      url_id INT NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
      clicked_at TIMESTAMP DEFAULT NOW(),
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      browser VARCHAR(50),
      os VARCHAR(50),
      country VARCHAR(50),
      device_type VARCHAR(50)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE urls ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE urls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
  `);
}

module.exports = {
  pool,
  initDb,
};
