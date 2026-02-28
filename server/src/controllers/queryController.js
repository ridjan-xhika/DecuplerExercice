const { Domain, Prompt } = require('../models');
const { generateQueries, inferIndustry } = require('../services/queryGenerator');

// Generate queries for a domain
const generateDomainQueries = async (req, res) => {
  try {
    const { domain, industry, options } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Infer industry if not provided
    const resolvedIndustry = industry || inferIndustry(domain);

    // Find or create the domain
    const domainRecord = await Domain.findOrCreate(domain, resolvedIndustry);

    // Generate queries
    const queries = generateQueries(domain, resolvedIndustry, options || {});

    // Save queries to database
    const savedQueries = [];
    for (const query of queries) {
      const saved = await Prompt.create(domainRecord.id, query.queryText, query.queryType);
      savedQueries.push(saved);
    }

    res.status(201).json({
      domain: domainRecord,
      queries: savedQueries,
      count: savedQueries.length
    });
  } catch (error) {
    console.error('Error generating queries:', error);
    res.status(500).json({ error: 'Failed to generate queries' });
  }
};

// Get queries for a domain
const getQueriesByDomain = async (req, res) => {
  try {
    const { domainId } = req.params;

    const queries = await Prompt.findByDomainId(domainId);

    if (!queries.length) {
      return res.status(404).json({ error: 'No queries found for this domain' });
    }

    res.json({ queries, count: queries.length });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
};

// Preview queries (without saving)
const previewQueries = async (req, res) => {
  try {
    const { domain, industry, options } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const resolvedIndustry = industry || inferIndustry(domain);
    const queries = generateQueries(domain, resolvedIndustry, options || {});

    res.json({
      domain,
      industry: resolvedIndustry,
      queries,
      count: queries.length
    });
  } catch (error) {
    console.error('Error previewing queries:', error);
    res.status(500).json({ error: 'Failed to preview queries' });
  }
};

module.exports = {
  generateDomainQueries,
  getQueriesByDomain,
  previewQueries
};
