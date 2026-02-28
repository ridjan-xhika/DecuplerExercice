/**
 * AI Response Service
 * Handles sending queries to Ollama and storing responses
 */

const { askOllama, askOllamaBatch } = require('./ollamaClient');
const { AIResponse, Prompt } = require('../models');

/**
 * Send a single query and store the response
 * @param {number} promptId - The prompt ID from database
 * @param {string} queryText - The query text to send
 * @returns {object} Stored response record
 */
async function queryAndStore(promptId, queryText) {
  const result = await askOllama(queryText);

  if (!result.success) {
    throw new Error(`Ollama query failed: ${result.error}`);
  }

  // Store in database
  const storedResponse = await AIResponse.create(
    promptId,
    result.provider,
    result.responseText,
    result.responseTimeMs
  );

  return {
    ...storedResponse,
    usage: result.usage
  };
}

/**
 * Process all prompts for a domain and store responses
 * @param {number} domainId - The domain ID
 * @param {object} options - Processing options
 * @returns {object} Summary of processed responses
 */
async function processDomainsPrompts(domainId, options = {}) {
  // Reduced concurrency to 1 to avoid rate limits
  const { concurrency = 1 } = options;

  // Get all prompts for this domain
  const prompts = await Prompt.findByDomainId(domainId);

  if (!prompts.length) {
    throw new Error('No prompts found for this domain');
  }

  const results = {
    total: prompts.length,
    successful: 0,
    failed: 0,
    responses: []
  };

  // Process prompts in batches
  for (let i = 0; i < prompts.length; i += concurrency) {
    const batch = prompts.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (prompt) => {
      try {
        const response = await queryAndStore(prompt.id, prompt.query_text);
        results.successful++;
        return { promptId: prompt.id, success: true, response };
      } catch (error) {
        results.failed++;
        return { promptId: prompt.id, success: false, error: error.message };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.responses.push(...batchResults);

    // Increased delay between batches to respect rate limits (2 seconds)
    if (i + concurrency < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Get all responses for a domain with prompt info
 * @param {number} domainId - The domain ID
 * @returns {Array} Responses with prompt details
 */
async function getResponsesForDomain(domainId) {
  return await AIResponse.findByDomainId(domainId);
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
