/**
 * AI Response Service
 * Handles sending queries to ALL AI providers and storing responses
 */

const { askAllProviders } = require('./aiClient');
const { AIResponse, Prompt } = require('../models');

/**
 * Send a single query to ALL providers and store each response
 * @param {number} promptId - The prompt ID from database
 * @param {string} queryText - The query text to send
 * @returns {Array} Array of stored response records (one per provider)
 */
async function queryAndStore(promptId, queryText) {
  // Query ALL providers
  const results = await askAllProviders(queryText);
  const storedResponses = [];

  // Store each successful response
  for (const result of results) {
    if (result.success) {
      const storedResponse = await AIResponse.create(
        promptId,
        result.provider,
        result.responseText,
        result.responseTimeMs
      );
      storedResponses.push({
        ...storedResponse,
        usage: result.usage
      });
    } else {
      console.log(`Skipping failed response from ${result.provider}: ${result.error}`);
    }
  }

  if (storedResponses.length === 0) {
    throw new Error(`All AI providers failed for this query`);
  }

  return storedResponses;
}

/**
 * Process all prompts for a domain and store responses from ALL providers
 * @param {number} domainId - The domain ID
 * @param {object} options - Processing options
 * @returns {object} Summary of processed responses
 */
async function processDomainsPrompts(domainId, options = {}) {
  // Get all prompts for this domain
  const prompts = await Prompt.findByDomainId(domainId);

  if (!prompts.length) {
    throw new Error('No prompts found for this domain');
  }

  const results = {
    total: prompts.length,
    totalResponses: 0,
    successful: 0,
    failed: 0,
    responses: []
  };

  // Process prompts one at a time (each prompt queries ALL providers)
  for (const prompt of prompts) {
    try {
      const responses = await queryAndStore(prompt.id, prompt.query_text);
      results.successful++;
      results.totalResponses += responses.length;
      results.responses.push({ 
        promptId: prompt.id, 
        success: true, 
        responseCount: responses.length,
        providers: responses.map(r => r.ai_provider)
      });
    } catch (error) {
      results.failed++;
      results.responses.push({ 
        promptId: prompt.id, 
        success: false, 
        error: error.message 
      });
    }

    // Delay between prompts to respect rate limits (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

/**
 * Get all SUCCESSFUL responses for a domain with prompt info
 * Failed queries are excluded - only responses with actual content are returned
 * @param {number} domainId - The domain ID
 * @returns {Array} Successful responses with prompt details
 */
async function getResponsesForDomain(domainId) {
  const responses = await AIResponse.findByDomainId(domainId);
  // Extra safety: filter out any responses without actual content
  return responses.filter(r => r.response_text && r.response_text.trim().length > 0);
}

/**
 * Normalize response text for analysis
 * - Lowercase
 * - Remove extra whitespace
 * - Extract clean text
 * @param {string} responseText - Raw response text
 * @returns {string} Normalized text
 */
function normalizeResponse(responseText) {
  return responseText
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  queryAndStore,
  processDomainsPrompts,
  getResponsesForDomain,
  normalizeResponse
};
