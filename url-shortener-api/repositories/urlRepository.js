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

async function findById(id) {
  const result = await pool.query(
    'SELECT id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", created_at AS "createdAt" FROM urls WHERE id = $1 LIMIT 1;',
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

  if (fields.length === 0) {
    return findById(id);
  }

  values.unshift(id);

  const result = await pool.query(
    `UPDATE urls SET ${fields.join(', ')} WHERE id = $1 RETURNING id, original_url AS "originalUrl", short_code AS "shortCode", short_url AS "shortUrl", created_at AS "createdAt";`,
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

module.exports = {
  saveUrl,
  findByShortCode,
  findById,
  updateById,
  deleteById,
};
