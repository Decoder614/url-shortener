const { isValidHttpUrl, isValidCustomAlias } = require('../validators/urlValidator');
const { saveUrl, findByShortCode, findById, updateById, deleteById } = require('../repositories/urlRepository');

function generateShortCode(length = 6) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }

  return code;
}

async function createShortUrl({ originalUrl, customAlias }) {
  if (!isValidHttpUrl(originalUrl)) {
    const error = new Error('Invalid URL');
    error.statusCode = 400;
    throw error;
  }

  if (customAlias !== undefined && !isValidCustomAlias(customAlias)) {
    const error = new Error('Invalid custom alias');
    error.statusCode = 400;
    throw error;
  }

  const shortCode = (customAlias && customAlias.trim()) || generateShortCode();

  const existing = await findByShortCode(shortCode);
  if (existing) {
    const collisionError = new Error('Short code already exists');
    collisionError.statusCode = 409;
    throw collisionError;
  }

  const urlRecord = {
    originalUrl,
    shortCode,
    shortUrl: `http://localhost:3000/${shortCode}`,
  };

  return saveUrl(urlRecord);
}

async function getOriginalUrlByShortCode(shortCode) {
  const record = await findByShortCode(shortCode);
  return record ? record.originalUrl : null;
}

async function getUrlById(id) {
  return findById(id);
}

async function updateUrl(id, payload) {
  if (payload.originalUrl !== undefined && !isValidHttpUrl(payload.originalUrl)) {
    const error = new Error('Invalid URL');
    error.statusCode = 400;
    throw error;
  }

  if (payload.customAlias !== undefined && !isValidCustomAlias(payload.customAlias)) {
    const error = new Error('Invalid custom alias');
    error.statusCode = 400;
    throw error;
  }

  const existing = await findById(id);
  if (!existing) {
    const error = new Error('URL not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {};
  if (payload.originalUrl !== undefined) {
    updates.originalUrl = payload.originalUrl;
  }

  if (payload.customAlias !== undefined) {
    updates.shortCode = payload.customAlias.trim();
  }

  const updated = await updateById(id, updates);
  return updated;
}

async function deleteUrl(id) {
  const existing = await findById(id);
  if (!existing) {
    const error = new Error('URL not found');
    error.statusCode = 404;
    throw error;
  }

  const deleted = await deleteById(id);
  return deleted;
}

module.exports = {
  createShortUrl,
  getOriginalUrlByShortCode,
  getUrlById,
  updateUrl,
  deleteUrl,
};
