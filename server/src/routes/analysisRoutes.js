const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// POST /api/analysis - Run full analysis for a domain
router.post('/', analysisController.analyze);

// GET /api/analysis/domains - Get all analyzed domains
router.get('/domains', analysisController.getAllDomains);

// GET /api/analysis/domain/:domainId - Get domain details
router.get('/domain/:domainId', analysisController.getDomain);

// GET /api/analysis/report/:domainId - Get existing report for a domain
router.get('/report/:domainId', analysisController.getReport);

// GET /api/analysis/history/:domainId - Get score history for charts
router.get('/history/:domainId', analysisController.getHistory);

module.exports = router;
