const { Domain } = require('../models');
const { runFullAnalysis, getExistingReport } = require('../services/analysisPipeline');
const { getScoreHistory } = require('../services/visibilityScorer');

// Run full analysis for a domain
const analyze = async (req, res) => {
  try {
    const { domain, industry, options } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const result = await runFullAnalysis(domain, { industry, queryOptions: options });

    if (!result.success) {
      return res.status(500).json({ 
        error: result.error,
        partialReport: result.report
      });
    }

    res.json(result.report);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to run analysis' });
  }
};

// Get existing report for a domain
const getReport = async (req, res) => {
  try {
    const { domainId } = req.params;

    const report = await getExistingReport(parseInt(domainId));
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch report' });
  }
};

// Get all domains
const getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll();
    res.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
};

// Get domain by ID
const getDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const domain = await Domain.findById(parseInt(domainId));

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json(domain);
  } catch (error) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
};

// Get score history for charts
const getHistory = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { limit = 30 } = req.query;

    const history = await getScoreHistory(parseInt(domainId), parseInt(limit));
    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch score history' });
  }
};

module.exports = {
  analyze,
  getReport,
  getAllDomains,
  getDomain,
  getHistory
};
