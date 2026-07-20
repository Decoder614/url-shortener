const { createShortUrl, getOriginalUrlByShortCode } = require('../services/urlService');

async function createUrl(req, res) {
  try {
    const urlRecord = await createShortUrl(req.body);
    return res.status(201).json(urlRecord);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

async function redirectUrl(req, res) {
  try {
    const { shortCode } = req.params;
    const originalUrl = await getOriginalUrlByShortCode(shortCode);

    if (!originalUrl) {
      return res.status(404).json({ message: 'URL not found' });
    }

    return res.redirect(302, originalUrl);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createUrl,
  redirectUrl,
};
