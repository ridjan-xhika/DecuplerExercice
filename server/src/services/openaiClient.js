/**
 * OpenAI Client Service
 * Handles all interactions with OpenAI API
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Send a query to OpenAI and get a response
 * @param {string} query - The user query to send
 * @param {object} options - Optional configuration
 * @returns {object} Response with text and metadata
 */
async function askOpenAI(query, options = {}) {
  const {
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = 'You are a helpful assistant that provides honest, detailed recommendations about software tools and services. When asked about tools or products, provide balanced comparisons and mention multiple relevant options.'
  } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const startTime = Date.now();

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || '';

    return {
      success: true,
      responseText,
      responseTimeMs,
      model,
      usage: data.usage,
      provider: 'openai'
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('OpenAI API error:', error.message);
    
    return {
      success: false,
      error: error.message,
      responseTimeMs,
      provider: 'openai'
    };
  }
}

/**
 * Send multiple queries to OpenAI
 * @param {Array<string>} queries - Array of queries
 * @param {object} options - Optional configuration
 * @returns {Array<object>} Array of responses
 */
async function askOpenAIBatch(queries, options = {}) {
  const { concurrency = 3 } = options;
  const results = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchPromises = batch.map(query => askOpenAI(query, options));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to respect rate limits
    if (i + concurrency < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Check if OpenAI API is configured and working
 * @returns {object} Status check result
 */
async function checkOpenAIStatus() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return { configured: false, working: false, error: 'API key not set' };
  }

  try {
    const result = await askOpenAI('Say "ok" if you can hear me.', { maxTokens: 10 });
    return { 
      configured: true, 
      working: result.success, 
      error: result.error || null,
      responseTimeMs: result.responseTimeMs
    };
  } catch (error) {
    return { configured: true, working: false, error: error.message };
  }
}

module.exports = {
  askOpenAI,
  askOpenAIBatch,
  checkOpenAIStatus
};
