const { createShortUrl, getOriginalUrlByShortCode } = require('../services/urlService');

async function createUrl(req, res, next) {
  try {
    const urlRecord = await createShortUrl(req.body);
    return res.status(201).json(urlRecord);
  } catch (error) {
    return next(error);
  }
}

async function redirectUrl(req, res, next) {
  try {
    const { shortCode } = req.params;
    const originalUrl = await getOriginalUrlByShortCode(shortCode);

    if (!originalUrl) {
      const error = new Error('URL not found');
      error.statusCode = 404;
      return next(error);
    }

    return res.redirect(302, originalUrl);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUrl,
  redirectUrl,
};
