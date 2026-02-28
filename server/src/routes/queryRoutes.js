const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// POST /api/queries/generate - Generate and save queries for a domain
router.post('/generate', queryController.generateDomainQueries);

// POST /api/queries/preview - Preview queries without saving
router.post('/preview', queryController.previewQueries);

// GET /api/queries/domain/:domainId - Get all queries for a domain
router.get('/domain/:domainId', queryController.getQueriesByDomain);

module.exports = router;
