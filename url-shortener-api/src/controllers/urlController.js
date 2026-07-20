const { createShortUrl, getOriginalUrlByShortCode, getUrlById, updateUrl, deleteUrl, trackClick, getAnalytics } = require('../services/urlService');

async function createUrl(req, res, next) {
  try {
    const urlRecord = await createShortUrl({ ...req.body, userId: req.user?.id });
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

    const requestData = {
      referrer: req.get('Referer') || null,
      userAgent: req.get('User-Agent') || null,
      ipAddress: req.get('X-Forwarded-For') || req.ip || null,
    };

    await trackClick(shortCode, requestData);

    return res.redirect(302, originalUrl);
  } catch (error) {
    return next(error);
  }
}

async function getUrl(req, res, next) {
  try {
    const { id } = req.params;
    const record = await getUrlById(id, req.user?.id);

    if (!record) {
      const error = new Error('URL not found');
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json(record);
  } catch (error) {
    return next(error);
  }
}

async function updateUrlRecord(req, res, next) {
  try {
    const { id } = req.params;
    const record = await updateUrl(id, req.body, req.user?.id);
    return res.status(200).json(record);
  } catch (error) {
    return next(error);
  }
}

async function deleteUrlRecord(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await deleteUrl(id, req.user?.id);

    if (!deleted) {
      const error = new Error('URL not found');
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({ message: 'URL deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

async function getAnalyticsData(req, res, next) {
  try {
    const { shortCode } = req.params;
    const analytics = await getAnalytics(shortCode);
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createUrl,
  redirectUrl,
  getUrl,
  updateUrlRecord,
  deleteUrlRecord,
  getAnalyticsData,
};
