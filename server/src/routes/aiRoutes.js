const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/run/:domainId - Run AI queries for all prompts of a domain
router.post('/run/:domainId', aiController.runAIQueries);

// GET /api/ai/responses/:domainId - Get all AI responses for a domain
router.get('/responses/:domainId', aiController.getResponses);

module.exports = router;
