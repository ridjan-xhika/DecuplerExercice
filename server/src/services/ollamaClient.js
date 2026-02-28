/**
 * Ollama Client Service
 * Handles all interactions with local Ollama API
 */

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Send a query to Ollama and get a response
 * @param {string} query - The user query to send
 * @param {object} options - Optional configuration
 * @returns {object} Response with text and metadata
 */
async function askOllama(query, options = {}) {
  const {
    model = process.env.OLLAMA_MODEL || 'llama3.2',
    temperature = 0.7,
    systemPrompt = 'You are a helpful assistant that provides honest, detailed recommendations about software tools and services. When asked about tools or products, provide balanced comparisons and mention multiple relevant options.'
  } = options;

  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        stream: false,
        options: {
          temperature
        }
      })
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.message?.content || '';

    return {
      success: true,
      responseText,
      responseTimeMs,
      model,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      },
      provider: 'ollama'
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('Ollama API error:', error.message);
    
    return {
      success: false,
      error: error.message,
      responseTimeMs,
      provider: 'ollama'
    };
  }
}

/**
 * Send multiple queries to Ollama
 * @param {Array<string>} queries - Array of queries
 * @param {object} options - Optional configuration
 * @returns {Array<object>} Array of responses
 */
async function askOllamaBatch(queries, options = {}) {
  const results = [];

  // Process sequentially since Ollama runs locally
  for (const query of queries) {
    const result = await askOllama(query, options);
    results.push(result);
  }

  return results;
}

/**
 * Check if Ollama is running and available
 * @returns {object} Status check result
 */
async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    
    if (!response.ok) {
      return { configured: false, working: false, error: 'Ollama not responding' };
    }

    const data = await response.json();
    const models = data.models || [];
    
    return { 
      configured: true, 
      working: true, 
      models: models.map(m => m.name),
      error: null
    };
  } catch (error) {
    return { configured: false, working: false, error: error.message };
  }
}

/**
 * List available models in Ollama
 * @returns {Array} List of model names
 */
async function listModels() {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Failed to list Ollama models:', error.message);
    return [];
  }
}

module.exports = {
  askOllama,
  askOllamaBatch,
  checkOllamaStatus,
  listModels
};
