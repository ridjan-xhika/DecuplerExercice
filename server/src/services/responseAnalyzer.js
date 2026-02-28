/**
 * Response Analyzer Service
 * Detects brand mentions, positions, and competitors in AI responses
 * Now uses industry-aware competitor detection
 */

const { BrandMention, Competitor } = require('../models');

// Industry-specific competitor mappings
// Only brands in the SAME industry should be considered competitors
const INDUSTRY_COMPETITORS = {
  // Social Media & Networking
  'social media': [
    'facebook', 'instagram', 'twitter', 'x', 'tiktok', 'snapchat', 'linkedin', 
    'pinterest', 'reddit', 'youtube', 'whatsapp', 'telegram', 'discord', 
    'threads', 'mastodon', 'bluesky', 'wechat', 'line', 'viber'
  ],
  
  // CRM
  'crm': [
    'salesforce', 'hubspot', 'zoho crm', 'pipedrive', 'freshsales', 
    'microsoft dynamics', 'monday crm', 'close', 'copper', 'insightly',
    'sugar crm', 'nimble', 'agile crm', 'capsule', 'streak'
  ],
  
  // Project Management
  'project management': [
    'asana', 'trello', 'monday', 'jira', 'notion', 'clickup', 'basecamp',
    'wrike', 'smartsheet', 'teamwork', 'airtable', 'linear', 'height',
    'todoist', 'things', 'omnifocus'
  ],
  
  // Communication & Collaboration
  'communication': [
    'slack', 'microsoft teams', 'zoom', 'google meet', 'discord', 
    'webex', 'gotomeeting', 'ringcentral', 'whereby', 'gather'
  ],
  
  // E-commerce Platforms
  'ecommerce': [
    'shopify', 'woocommerce', 'bigcommerce', 'magento', 'squarespace', 
    'wix', 'weebly', 'prestashop', 'opencart', 'volusion', 'ecwid',
    'amazon', 'ebay', 'etsy', 'alibaba'
  ],
  
  // Email Marketing
  'email marketing': [
    'mailchimp', 'sendgrid', 'klaviyo', 'constant contact', 'activecampaign',
    'convertkit', 'drip', 'sendinblue', 'campaign monitor', 'aweber',
    'getresponse', 'mailerlite', 'beehiiv', 'substack'
  ],
  
  // Cloud & Infrastructure
  'cloud': [
    'aws', 'amazon web services', 'azure', 'google cloud', 'gcp',
    'digitalocean', 'linode', 'vultr', 'heroku', 'vercel', 'netlify',
    'cloudflare', 'fastly', 'akamai', 'oracle cloud', 'ibm cloud'
  ],
  
  // Design Tools
  'design': [
    'figma', 'sketch', 'adobe xd', 'canva', 'invision', 'framer',
    'webflow', 'zeplin', 'marvel', 'principle', 'adobe illustrator',
    'adobe photoshop', 'affinity designer', 'procreate'
  ],
  
  // Analytics & BI
  'analytics': [
    'google analytics', 'mixpanel', 'amplitude', 'heap', 'segment',
    'tableau', 'power bi', 'looker', 'metabase', 'mode', 'sisense',
    'hotjar', 'fullstory', 'crazy egg', 'posthog', 'plausible'
  ],
  
  // SEO Tools
  'seo': [
    'ahrefs', 'semrush', 'moz', 'screaming frog', 'surfer seo',
    'ubersuggest', 'serpstat', 'majestic', 'spyfu', 'brightedge'
  ],
  
  // Development & DevOps
  'development': [
    'github', 'gitlab', 'bitbucket', 'jenkins', 'circleci', 'travis ci',
    'docker', 'kubernetes', 'terraform', 'ansible', 'datadog',
    'new relic', 'splunk', 'grafana', 'prometheus', 'sentry'
  ],
  
  // Payments & Finance
  'payments': [
    'stripe', 'paypal', 'square', 'adyen', 'braintree', 'worldpay',
    'authorize.net', 'wise', 'revolut', 'venmo', 'cashapp'
  ],
  
  // Accounting
  'accounting': [
    'quickbooks', 'xero', 'freshbooks', 'wave', 'sage', 'netsuite',
    'zoho books', 'kashoo', 'freeagent'
  ],
  
  // HR & Recruiting
  'hr': [
    'workday', 'bamboohr', 'gusto', 'rippling', 'lever', 'greenhouse',
    'adp', 'paychex', 'zenefits', 'hibob', 'lattice', 'deel'
  ],
  
  // Customer Support
  'customer support': [
    'zendesk', 'freshdesk', 'intercom', 'drift', 'crisp', 'helpscout',
    'front', 'kustomer', 'gorgias', 'tidio', 'livechat', 'tawk.to'
  ],
  
  // Search Engines
  'search': [
    'google', 'bing', 'duckduckgo', 'yahoo', 'baidu', 'yandex',
    'ecosia', 'brave search', 'you.com', 'perplexity'
  ],
  
  // AI & LLMs
  'ai': [
    'openai', 'chatgpt', 'claude', 'anthropic', 'google bard', 'gemini',
    'meta ai', 'llama', 'mistral', 'cohere', 'hugging face', 'midjourney',
    'dall-e', 'stable diffusion', 'jasper ai', 'copy.ai'
  ],
  
  // Streaming & Entertainment
  'streaming': [
    'netflix', 'disney+', 'hulu', 'amazon prime video', 'hbo max', 
    'apple tv+', 'paramount+', 'peacock', 'spotify', 'apple music',
    'youtube music', 'tidal', 'deezer', 'twitch'
  ],

  // ============ NON-TECH INDUSTRIES ============
  
  // Music Streaming
  'music streaming': [
    'spotify', 'apple music', 'amazon music', 'youtube music', 'tidal',
    'deezer', 'pandora', 'soundcloud', 'audiomack', 'qobuz'
  ],
  
  // Video Streaming
  'video streaming': [
    'netflix', 'disney+', 'hulu', 'hbo max', 'amazon prime video',
    'apple tv+', 'paramount+', 'peacock', 'crunchyroll', 'youtube'
  ],
  
  // Gaming Communication
  'gaming communication': [
    'discord', 'teamspeak', 'mumble', 'guilded', 'steam chat'
  ],
  
  // Sportswear & Athletic
  'sportswear': [
    'nike', 'adidas', 'puma', 'under armour', 'reebok', 'new balance',
    'asics', 'lululemon', 'fila', 'converse', 'vans', 'skechers',
    'brooks', 'saucony', 'hoka', 'on running', 'allbirds'
  ],
  
  // Fashion & Apparel
  'fashion': [
    'zara', 'h&m', 'uniqlo', 'gap', 'forever 21', 'shein', 'asos',
    'gucci', 'louis vuitton', 'prada', 'chanel', 'dior', 'versace',
    'ralph lauren', 'tommy hilfiger', 'calvin klein', 'levis', 'nike'
  ],
  
  // Fast Food
  'fast food': [
    'mcdonald\'s', 'mcdonalds', 'burger king', 'wendy\'s', 'wendys', 
    'taco bell', 'kfc', 'chick-fil-a', 'subway', 'chipotle', 
    'five guys', 'popeyes', 'arby\'s', 'sonic', 'jack in the box',
    'in-n-out', 'shake shack', 'whataburger', 'carl\'s jr', 'hardees'
  ],
  
  // Coffee
  'coffee': [
    'starbucks', 'dunkin', 'peet\'s', 'tim hortons', 'costa coffee',
    'blue bottle', 'philz', 'caribou coffee', 'dutch bros', 'la colombe'
  ],
  
  // Automotive
  'automotive': [
    'toyota', 'honda', 'ford', 'chevrolet', 'bmw', 'mercedes', 'audi',
    'volkswagen', 'nissan', 'hyundai', 'kia', 'tesla', 'rivian', 'lucid',
    'porsche', 'ferrari', 'lamborghini', 'mazda', 'subaru', 'lexus'
  ],
  
  // Retail
  'retail': [
    'amazon', 'walmart', 'target', 'costco', 'best buy', 'home depot',
    'lowes', 'ikea', 'wayfair', 'bed bath & beyond', 'kohls', 'macys',
    'nordstrom', 'tjmaxx', 'ross', 'dollar general', 'walgreens', 'cvs'
  ],
  
  // Travel & Hospitality
  'travel': [
    'airbnb', 'booking.com', 'expedia', 'vrbo', 'hotels.com', 'kayak',
    'tripadvisor', 'marriott', 'hilton', 'hyatt', 'ihg', 'wyndham',
    'southwest', 'delta', 'united', 'american airlines', 'jetblue'
  ],
  
  // Banking & Finance
  'banking': [
    'chase', 'bank of america', 'wells fargo', 'citi', 'capital one',
    'us bank', 'pnc', 'td bank', 'ally', 'discover', 'american express',
    'goldman sachs', 'morgan stanley', 'fidelity', 'charles schwab', 'vanguard'
  ]
};

// Map common brand names to their industries
const BRAND_TO_INDUSTRY = {
  // Social Media
  'facebook': 'social media', 'meta': 'social media', 'instagram': 'social media',
  'twitter': 'social media', 'x': 'social media', 'tiktok': 'social media',
  'snapchat': 'social media', 'linkedin': 'social media', 'pinterest': 'social media',
  'reddit': 'social media', 'youtube': 'social media',
  
  // CRM
  'salesforce': 'crm', 'hubspot': 'crm', 'zoho': 'crm', 'pipedrive': 'crm',
  
  // Project Management
  'asana': 'project management', 'trello': 'project management', 'monday': 'project management',
  'jira': 'project management', 'notion': 'project management', 'clickup': 'project management',
  
  // Communication
  'slack': 'communication', 'microsoft teams': 'communication', 'teams': 'communication',
  'zoom': 'communication', 'discord': 'communication',
  
  // E-commerce
  'shopify': 'ecommerce', 'amazon': 'ecommerce', 'ebay': 'ecommerce', 'etsy': 'ecommerce',
  
  // Cloud
  'aws': 'cloud', 'azure': 'cloud', 'google cloud': 'cloud', 'heroku': 'cloud',
  'vercel': 'cloud', 'netlify': 'cloud',
  
  // Search
  'google': 'search', 'bing': 'search', 'duckduckgo': 'search',
  
  // Streaming
  'netflix': 'streaming', 'spotify': 'streaming', 'disney+': 'streaming', 'hulu': 'streaming'
};

/**
 * Detect the industry of a brand
 * @param {string} brandName - The brand name
 * @returns {string|null} The detected industry
 */
function detectBrandIndustry(brandName) {
  const normalized = brandName.toLowerCase().trim();
  
  // Direct lookup
  if (BRAND_TO_INDUSTRY[normalized]) {
    return BRAND_TO_INDUSTRY[normalized];
  }
  
  // Check if it's in any industry competitor list
  for (const [industry, brands] of Object.entries(INDUSTRY_COMPETITORS)) {
    if (brands.some(b => normalized.includes(b) || b.includes(normalized))) {
      return industry;
    }
  }
  
  return null;
}

/**
 * Get competitors for a specific brand based on its industry
 * @param {string} brandName - The target brand
 * @returns {Array} List of competitor names to look for
 */
function getIndustryCompetitors(brandName) {
  const industry = detectBrandIndustry(brandName);
  
  if (!industry || !INDUSTRY_COMPETITORS[industry]) {
    return []; // Unknown industry - don't assume competitors
  }
  
  // Return competitors in the same industry, excluding the target brand
  const normalized = brandName.toLowerCase();
  return INDUSTRY_COMPETITORS[industry].filter(comp => 
    comp !== normalized && !normalized.includes(comp) && !comp.includes(normalized)
  );
}

/**
 * Find all brand mentions in text (industry-aware)
 * @param {string} text - The response text to analyze
 * @param {string} targetBrand - The brand we're tracking
 * @returns {Array} Array of mentions with positions
 */
function findBrandMentions(text, targetBrand) {
  const normalizedText = text.toLowerCase();
  const mentions = [];
  let position = 1;

  // Get industry-specific competitors only
  const industryCompetitors = getIndustryCompetitors(targetBrand);
  
  // Combine target brand with its ACTUAL industry competitors
  const brandsToFind = [...new Set([targetBrand.toLowerCase(), ...industryCompetitors])];

  // Find all brand occurrences with their character positions
  const brandPositions = [];

  for (const brand of brandsToFind) {
    let searchPos = 0;
    while (true) {
      const index = normalizedText.indexOf(brand, searchPos);
      if (index === -1) break;
      
      // Check if it's a word boundary (not part of another word)
      const before = index > 0 ? normalizedText[index - 1] : ' ';
      const after = normalizedText[index + brand.length] || ' ';
      
      if (/[\s,.\-:;!?()"']/.test(before) && /[\s,.\-:;!?()"']/.test(after)) {
        brandPositions.push({
          brand,
          charIndex: index,
          isTargetBrand: brand === targetBrand.toLowerCase()
        });
      }
      searchPos = index + 1;
    }
  }

  // Sort by character position (order of appearance)
  brandPositions.sort((a, b) => a.charIndex - b.charIndex);

  // Remove duplicates and assign positions
  const seenBrands = new Set();
  for (const bp of brandPositions) {
    if (!seenBrands.has(bp.brand)) {
      seenBrands.add(bp.brand);
      
      // Extract context snippet (50 chars before and after)
      const snippetStart = Math.max(0, bp.charIndex - 50);
      const snippetEnd = Math.min(text.length, bp.charIndex + bp.brand.length + 50);
      const contextSnippet = text.substring(snippetStart, snippetEnd).trim();

      mentions.push({
        brandName: bp.brand,
        position,
        isTargetBrand: bp.isTargetBrand,
        contextSnippet,
        charIndex: bp.charIndex
      });
      position++;
    }
  }

  return mentions;
}

/**
 * Analyze a single AI response
 * @param {number} responseId - The AI response ID
 * @param {string} responseText - The response text
 * @param {string} targetBrand - The brand we're tracking
 * @returns {object} Analysis results
 */
async function analyzeResponse(responseId, responseText, targetBrand) {
  const mentions = findBrandMentions(responseText, targetBrand);
  
  const targetMention = mentions.find(m => m.isTargetBrand);
  const competitors = mentions.filter(m => !m.isTargetBrand);

  // Store brand mentions
  const storedMentions = [];
  for (const mention of mentions) {
    const stored = await BrandMention.create(responseId, mention.brandName, mention.position, {
      contextSnippet: mention.contextSnippet,
      isTargetBrand: mention.isTargetBrand,
      sentiment: null // Could add sentiment analysis later
    });
    storedMentions.push(stored);
  }

  // Store competitors
  const storedCompetitors = [];
  for (const comp of competitors) {
    const mentionedBeforeTarget = targetMention ? comp.position < targetMention.position : true;
    const stored = await Competitor.create(responseId, comp.brandName, comp.position, mentionedBeforeTarget);
    storedCompetitors.push(stored);
  }

  return {
    responseId,
    targetBrand: {
      mentioned: !!targetMention,
      position: targetMention?.position || null
    },
    totalMentions: mentions.length,
    competitorCount: competitors.length,
    competitorsBeforeTarget: competitors.filter(c => 
      targetMention ? c.position < targetMention.position : true
    ).length,
    mentions: storedMentions,
    competitors: storedCompetitors
  };
}

/**
 * Analyze all responses for a domain
 * @param {Array} responses - Array of AI responses with response_text
 * @param {string} targetBrand - The brand we're tracking
 * @returns {object} Aggregated analysis
 */
/**
 * Extract ranking position from a ranking query response
 * Looks for numbered lists, "first", "second", etc.
 * @param {string} text - Response text
 * @param {string} targetBrand - Brand to find ranking for
 * @returns {object} { found: boolean, position: number|null, totalRanked: number }
 */
function extractRankingPosition(text, targetBrand) {
  const normalizedText = text.toLowerCase();
  const brandLower = targetBrand.toLowerCase();
  
  // Check if brand is mentioned at all
  if (!normalizedText.includes(brandLower)) {
    return { found: false, position: null, totalRanked: 0 };
  }

  // Pattern 1: Numbered lists (1. Nike, 2. Adidas, etc.)
  const numberedPattern = /(\d+)[\.\)\:\-]\s*[*#]*\s*([^\n\-:]+)/gi;
  const matches = [...text.matchAll(numberedPattern)];
  
  for (const match of matches) {
    const position = parseInt(match[1]);
    const content = match[2].toLowerCase();
    if (content.includes(brandLower) && position <= 20) {
      return { found: true, position, totalRanked: matches.length };
    }
  }

  // Pattern 2: Bullet points with implicit order (- Nike, - Adidas)
  const bulletPattern = /^[\*\-•]\s*[*#]*\s*([^\n]+)/gmi;
  const bulletMatches = [...text.matchAll(bulletPattern)];
  let bulletPosition = 1;
  
  for (const match of bulletMatches) {
    const content = match[1].toLowerCase();
    if (content.includes(brandLower)) {
      return { found: true, position: bulletPosition, totalRanked: bulletMatches.length };
    }
    bulletPosition++;
  }

  // Pattern 3: Ordinal words (first, second, third...)
  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  for (let i = 0; i < ordinals.length; i++) {
    const ordinal = ordinals[i];
    // Check if brand is mentioned near ordinal
    const ordinalPattern = new RegExp(`${ordinal}[^.]*${brandLower}|${brandLower}[^.]*${ordinal}`, 'i');
    if (ordinalPattern.test(normalizedText)) {
      return { found: true, position: i + 1, totalRanked: 10 };
    }
  }

  // Pattern 4: "#1" or "number one" style
  const numberOnePattern = new RegExp(`(#1|number one|top pick|best overall|winner)[^.]*${brandLower}|${brandLower}[^.]*(#1|number one|top pick|best overall|winner)`, 'i');
  if (numberOnePattern.test(normalizedText)) {
    return { found: true, position: 1, totalRanked: 1 };
  }

  // Brand mentioned but no clear ranking
  return { found: true, position: null, totalRanked: 0 };
}

/**
 * Analyze all AI responses for a domain
 * Now includes ranking extraction
 */
async function analyzeAllResponses(responses, targetBrand) {
  const results = {
    totalResponses: responses.length,
    responsesWithTarget: 0,
    totalMentions: 0,
    top1Count: 0,
    top3Count: 0,
    competitorCounts: {},
    analyses: [],
    // NEW: Ranking data
    rankings: {
      found: false,
      positions: [],
      averageRank: null,
      bestRank: null,
      worstRank: null
    }
  };

  for (const response of responses) {
    const analysis = await analyzeResponse(response.id, response.response_text, targetBrand);
    results.analyses.push(analysis);

    if (analysis.targetBrand.mentioned) {
      results.responsesWithTarget++;
      results.totalMentions++;
      
      if (analysis.targetBrand.position === 1) results.top1Count++;
      if (analysis.targetBrand.position <= 3) results.top3Count++;
    }

    // Track competitor frequencies
    for (const comp of analysis.competitors) {
      results.competitorCounts[comp.competitor_name] = 
        (results.competitorCounts[comp.competitor_name] || 0) + 1;
    }

    // Extract ranking if this is a ranking query
    if (response.query_type === 'ranking') {
      const rankingResult = extractRankingPosition(response.response_text, targetBrand);
      if (rankingResult.found && rankingResult.position !== null) {
        results.rankings.found = true;
        results.rankings.positions.push({
          position: rankingResult.position,
          totalRanked: rankingResult.totalRanked,
          query: response.query_text
        });
      }
    }
  }

  // Calculate ranking stats
  if (results.rankings.positions.length > 0) {
    const positions = results.rankings.positions.map(p => p.position);
    results.rankings.averageRank = Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
    results.rankings.bestRank = Math.min(...positions);
    results.rankings.worstRank = Math.max(...positions);
  }

  // Sort competitors by frequency
  results.topCompetitors = Object.entries(results.competitorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return results;
}

/**
 * Get simple detection of whether target is mentioned
 * @param {string} text - Response text
 * @param {string} targetBrand - Brand to find
 * @returns {boolean}
 */
function isTargetMentioned(text, targetBrand) {
  const regex = new RegExp(`\\b${targetBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return regex.test(text);
}

module.exports = {
  findBrandMentions,
  analyzeResponse,
  analyzeAllResponses,
  isTargetMentioned,
  detectBrandIndustry,
  getIndustryCompetitors,
  extractRankingPosition,
  INDUSTRY_COMPETITORS
};
