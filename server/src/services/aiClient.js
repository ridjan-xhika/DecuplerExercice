/**
 * Unified AI Client Service
 * Routes queries to ALL AI providers (Ollama and Gemini)
 */

const { askOllama, checkOllamaStatus } = require('./ollamaClient');
const { askGemini, checkGeminiStatus } = require('./geminiClient');

// Provider configuration
const PROVIDERS = {
  ollama: { ask: askOllama, check: checkOllamaStatus },
  gemini: { ask: askGemini, check: checkGeminiStatus }
};

// Get enabled providers from env
const getEnabledProviders = () => {
  const providers = process.env.AI_PROVIDERS || 'ollama,gemini';
  return providers.split(',').map(p => p.trim().toLowerCase());
};

/**
 * Send a query to ALL enabled AI providers
 * Returns array of responses from each provider
 * @param {string} query - The query to send
 * @param {object} options - Optional configuration
 * @returns {Array} Array of responses from all providers
 */
async function askAllProviders(query, options = {}) {
  const enabledProviders = getEnabledProviders();
  const results = [];

  for (const providerName of enabledProviders) {
    const provider = PROVIDERS[providerName];
    if (!provider) continue;

    try {
      console.log(`Querying ${providerName}...`);
      const result = await provider.ask(query, options);
      results.push({
        provider: providerName,
        ...result
      });
      
      if (!result.success) {
        console.log(`Provider ${providerName} failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`Provider ${providerName} error: ${error.message}`);
      results.push({
        provider: providerName,
        success: false,
        error: error.message
      });
    }

    // Small delay between providers to be nice to APIs
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Send a query to a specific provider only
 * @param {string} query - The query to send
 * @param {string} providerName - The provider to use
 * @param {object} options - Optional configuration
 * @returns {object} Response from provider
 */
async function askProvider(query, providerName, options = {}) {
  const provider = PROVIDERS[providerName];
  if (!provider) {
    return { success: false, error: `Unknown provider: ${providerName}` };
  }
  return await provider.ask(query, options);
}

/**
 * Check status of all AI providers
 * @returns {object} Status of each provider
 */
async function checkAllProviders() {
  const [ollamaStatus, geminiStatus] = await Promise.all([
    checkOllamaStatus(),
    checkGeminiStatus()
  ]);

  return {
    ollama: ollamaStatus,
    gemini: geminiStatus,
    anyWorking: ollamaStatus.working || geminiStatus.working,
    allWorking: ollamaStatus.working && geminiStatus.working
  };
}

/**
 * Get list of working providers
 * @returns {Array} List of working provider names
 */
async function getWorkingProviders() {
  const status = await checkAllProviders();
  const working = [];
  
  for (const providerName of getEnabledProviders()) {
    if (status[providerName]?.working) {
      working.push(providerName);
    }
  }
  
  return working;
}

module.exports = {
  askAllProviders,
  askProvider,
  checkAllProviders,
  getWorkingProviders,
  getEnabledProviders,
  PROVIDERS
};
