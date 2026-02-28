/**
 * Unified AI Client Service
 * Routes queries to multiple AI providers (Ollama and Gemini)
 */

const { askOllama, checkOllamaStatus } = require('./ollamaClient');
const { askGemini, checkGeminiStatus } = require('./geminiClient');

// Provider configuration
const PROVIDERS = {
  ollama: { ask: askOllama, check: checkOllamaStatus },
  gemini: { ask: askGemini, check: checkGeminiStatus }
};

// Get preferred provider order from env, default to ollama first (free)
const getProviderOrder = () => {
  const order = process.env.AI_PROVIDER_ORDER || 'ollama,gemini';
  return order.split(',').map(p => p.trim().toLowerCase());
};

/**
 * Send a query to available AI providers
 * Tries providers in order, falls back if one fails
 * @param {string} query - The query to send
 * @param {object} options - Optional configuration
 * @returns {object} Response with text and metadata
 */
async function askAI(query, options = {}) {
  const { provider: specificProvider } = options;
  
  // If specific provider requested, use only that one
  if (specificProvider && PROVIDERS[specificProvider]) {
    return await PROVIDERS[specificProvider].ask(query, options);
  }

  // Try providers in order
  const providerOrder = getProviderOrder();
  let lastError = null;

  for (const providerName of providerOrder) {
    const provider = PROVIDERS[providerName];
    if (!provider) continue;

    try {
      const result = await provider.ask(query, options);
      if (result.success) {
        return result;
      }
      lastError = result.error;
      console.log(`Provider ${providerName} failed: ${result.error}, trying next...`);
    } catch (error) {
      lastError = error.message;
      console.log(`Provider ${providerName} error: ${error.message}, trying next...`);
    }
  }

  // All providers failed
  return {
    success: false,
    error: `All AI providers failed. Last error: ${lastError}`,
    provider: 'none'
  };
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
    anyWorking: ollamaStatus.working || geminiStatus.working
  };
}

/**
 * Get the first available provider
 * @returns {string|null} Provider name or null if none available
 */
async function getAvailableProvider() {
  const status = await checkAllProviders();
  
  for (const providerName of getProviderOrder()) {
    if (status[providerName]?.working) {
      return providerName;
    }
  }
  
  return null;
}

module.exports = {
  askAI,
  checkAllProviders,
  getAvailableProvider,
  PROVIDERS
};
