const express = require('express');
const { createUrl, redirectUrl, getUrl, updateUrlRecord, deleteUrlRecord } = require('../controllers/urlController');

const router = express.Router();

router.post('/', createUrl);
router.get('/:id', getUrl);
router.put('/:id', updateUrlRecord);
router.delete('/:id', deleteUrlRecord);
router.get('/:shortCode', redirectUrl);

module.exports = router;
