const { isValidHttpUrl } = require('../validators/urlValidator');
const { saveUrl, findByShortCode } = require('../repositories/urlRepository');

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

module.exports = {
  createShortUrl,
  getOriginalUrlByShortCode,
};
