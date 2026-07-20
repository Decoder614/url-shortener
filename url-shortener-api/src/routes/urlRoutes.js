const express = require('express');
const { createUrl, redirectUrl, getUrl, updateUrlRecord, deleteUrlRecord } = require('../controllers/urlController');

const router = express.Router();

/**
 * @openapi
 * /api/v1/urls:
 *   post:
 *     summary: Create a short URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originalUrl]
 *             properties:
 *               originalUrl:
 *                 type: string
 *               customAlias:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: URL created successfully
 */
router.post('/', createUrl);

/**
 * @openapi
 * /api/v1/urls/{id}:
 *   get:
 *     summary: Get a URL record by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: URL found
 */
router.get('/:id', getUrl);

/**
 * @openapi
 * /api/v1/urls/{id}:
 *   put:
 *     summary: Update a URL record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: URL updated successfully
 */
router.put('/:id', updateUrlRecord);

/**
 * @openapi
 * /api/v1/urls/{id}:
 *   delete:
 *     summary: Delete a URL record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: URL deleted successfully
 */
router.delete('/:id', deleteUrlRecord);

/**
 * @openapi
 * /{shortCode}:
 *   get:
 *     summary: Redirect to the original URL for a short code
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to original URL
 */
router.get('/:shortCode', redirectUrl);

module.exports = router;
