const { createShortUrl } = require('../services/urlService');

async function createUrl(req, res) {
  try {
    const urlRecord = await createShortUrl(req.body);
    return res.status(201).json(urlRecord);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
}

module.exports = {
  createUrl,
};
