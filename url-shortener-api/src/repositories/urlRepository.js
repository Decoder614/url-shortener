const { pool } = require('../config/db');

async function saveUrl(urlRecord) {
  const result = await pool.query(
    'INSERT INTO urls (original_url, short_code, short_url, expires_at, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", expires_at AS "expiresAt", created_at AS "createdAt", user_id AS "userId";',
    [urlRecord.originalUrl, urlRecord.shortCode, urlRecord.shortUrl, urlRecord.expiresAt || null, urlRecord.userId || null]
  );

  return result.rows[0];
}

async function findByShortCode(shortCode) {
  const result = await pool.query(
    'SELECT id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", expires_at AS "expiresAt", user_id AS "userId" FROM urls WHERE short_code = $1 LIMIT 1;',
    [shortCode]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", expires_at AS "expiresAt", created_at AS "createdAt", user_id AS "userId" FROM urls WHERE id = $1 LIMIT 1;',
    [id]
  );

  return result.rows[0];
}

async function updateById(id, updates) {
  const fields = [];
  const values = [];

  if (updates.originalUrl !== undefined) {
    fields.push('original_url = $' + (values.length + 2));
    values.push(updates.originalUrl);
  }

  if (updates.shortCode !== undefined) {
    fields.push('short_code = $' + (values.length + 2));
    values.push(updates.shortCode);
  }

  if (updates.shortUrl !== undefined) {
    fields.push('short_url = $' + (values.length + 2));
    values.push(updates.shortUrl);
  }

  if (updates.expiresAt !== undefined) {
    fields.push('expires_at = $' + (values.length + 2));
    values.push(updates.expiresAt);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.unshift(id);

  const result = await pool.query(
    `UPDATE urls SET ${fields.join(', ')} WHERE id = $1 RETURNING id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", expires_at AS "expiresAt", created_at AS "createdAt", user_id AS "userId";`,
    values
  );

  return result.rows[0];
}

async function deleteById(id) {
  const result = await pool.query(
    'DELETE FROM urls WHERE id = $1 RETURNING id;',
    [id]
  );

  return result.rowCount > 0;
}

async function recordClick(urlId, payload) {
  const result = await pool.query(
    `INSERT INTO url_clicks (url_id, referrer, user_agent, ip_address, browser, os, country, device_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id;`,
    [urlId, payload.referrer || null, payload.userAgent || null, payload.ipAddress || null, payload.browser || null, payload.os || null, payload.country || null, payload.deviceType || null]
  );

  return result.rows[0];
}

async function getAnalyticsByShortCode(shortCode) {
  const result = await pool.query(
    `SELECT u.id, u.short_code AS "shortCode", (
      SELECT COUNT(*) FROM url_clicks uc WHERE uc.url_id = u.id
    ) AS "totalClicks",
    (
      SELECT COUNT(DISTINCT ip_address) FROM url_clicks uc WHERE uc.url_id = u.id
    ) AS "uniqueVisitors",
    (
      SELECT json_agg(row_to_json(x)) FROM (
        SELECT clicked_at AS "clickedAt", referrer, browser, os, country, device_type AS "deviceType"
        FROM url_clicks uc
        WHERE uc.url_id = u.id
        ORDER BY uc.clicked_at DESC
        LIMIT 10
      ) x
    ) AS "recentClicks"
    FROM urls u
    WHERE u.short_code = $1
    LIMIT 1;`,
    [shortCode]
  );

  return result.rows[0];
}

module.exports = {
  saveUrl,
  findByShortCode,
  findById,
  updateById,
  deleteById,
  recordClick,
  getAnalyticsByShortCode,
};
