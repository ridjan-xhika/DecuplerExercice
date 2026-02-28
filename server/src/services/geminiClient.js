/**
 * Gemini Client Service
 * Handles all interactions with Google Gemini API
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Send a query to Gemini and get a response
 * @param {string} query - The user query to send
 * @param {object} options - Optional configuration
 * @returns {object} Response with text and metadata
 */
async function askGemini(query, options = {}) {
  const {
    model = 'gemini-2.5-flash',
    temperature = 0.7,
    maxTokens = 1000,
    systemPrompt = 'You are a helpful assistant that provides honest, detailed recommendations about software tools and services. When asked about tools or products, provide balanced comparisons and mention multiple relevant options.'
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const startTime = Date.now();
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser: ${query}` }
            ]
          }
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    const responseTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      success: true,
      responseText,
      responseTimeMs,
      model,
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      },
      provider: 'gemini'
    };
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error('Gemini API error:', error.message);
    
    return {
      success: false,
      error: error.message,
      responseTimeMs,
      provider: 'gemini'
    };
  }
}

/**
 * Send multiple queries to Gemini
 * @param {Array<string>} queries - Array of queries
 * @param {object} options - Optional configuration
 * @returns {Array<object>} Array of responses
 */
async function askGeminiBatch(queries, options = {}) {
  const { concurrency = 3 } = options;
  const results = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency);
    const batchPromises = batch.map(query => askGemini(query, options));
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
 * Check if Gemini API is configured and working
 * @returns {object} Status check result
 */
async function checkGeminiStatus() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return { configured: false, working: false, error: 'API key not set' };
  }

  try {
    const result = await askGemini('Say "ok" if you can hear me.', { maxTokens: 10 });
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
  askGemini,
  askGeminiBatch,
  checkGeminiStatus
};
