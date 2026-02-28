const { Domain } = require('../models');
const { processDomainsPrompts, getResponsesForDomain } = require('../services/aiResponseService');

// Trigger AI queries for all prompts of a domain
const runAIQueries = async (req, res) => {
  try {
    const { domainId } = req.params;

    // Verify domain exists
    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Process all prompts
    const results = await processDomainsPrompts(domainId);

    res.json({
      message: 'AI queries completed',
      domain: domain.domain_name,
      results
    });
  } catch (error) {
    console.error('Error running AI queries:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI queries' });
  }
};

// Get all AI responses for a domain
const getResponses = async (req, res) => {
  try {
    const { domainId } = req.params;

    const responses = await getResponsesForDomain(domainId);

    if (!responses.length) {
      return res.status(404).json({ error: 'No responses found for this domain' });
    }

    res.json({
      count: responses.length,
      responses
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

module.exports = {
  runAIQueries,
  getResponses
};
