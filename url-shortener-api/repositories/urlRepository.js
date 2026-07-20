const { pool } = require('../config/db');

async function saveUrl(urlRecord) {
  const result = await pool.query(
    'INSERT INTO urls (original_url, short_code, short_url) VALUES ($1, $2, $3) RETURNING id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", created_at AS "createdAt";',
    [urlRecord.originalUrl, urlRecord.shortCode, urlRecord.shortUrl]
  );

  return result.rows[0];
}

async function findByShortCode(shortCode) {
  const result = await pool.query(
    'SELECT id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl" FROM urls WHERE short_code = $1 LIMIT 1;',
    [shortCode]
  );

  return result.rows[0];
}

module.exports = {
  saveUrl,
  findByShortCode,
};
