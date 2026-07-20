const express = require('express');
const { createUrl, redirectUrl } = require('../controllers/urlController');

const router = express.Router();

router.post('/', createUrl);
router.get('/:shortCode', redirectUrl);

module.exports = router;
