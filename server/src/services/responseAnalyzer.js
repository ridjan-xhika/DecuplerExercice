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
  'shopify': 'ecommerce', 'amazon': 'retail', 'ebay': 'ecommerce', 'etsy': 'ecommerce',
  
  // Cloud
  'aws': 'cloud', 'azure': 'cloud', 'google cloud': 'cloud', 'heroku': 'cloud',
  'vercel': 'cloud', 'netlify': 'cloud',
  
  // Search
  'google': 'search', 'bing': 'search', 'duckduckgo': 'search',
  
  // Streaming
  'netflix': 'video streaming', 'disney+': 'video streaming', 'hulu': 'video streaming',
  'spotify': 'music streaming', 'apple music': 'music streaming', 'tidal': 'music streaming',
  
  // Gaming Communication
  'discord': 'gaming communication',
  
  // ============ NON-TECH BRANDS ============
  
  // Sportswear
  'nike': 'sportswear', 'adidas': 'sportswear', 'puma': 'sportswear',
  'under armour': 'sportswear', 'reebok': 'sportswear', 'new balance': 'sportswear',
  'asics': 'sportswear', 'lululemon': 'sportswear', 'fila': 'sportswear',
  
  // Fashion
  'zara': 'fashion', 'h&m': 'fashion', 'uniqlo': 'fashion', 'gap': 'fashion',
  'gucci': 'fashion', 'louis vuitton': 'fashion', 'prada': 'fashion',
  
  // Fast Food
  'mcdonalds': 'fast food', 'mcdonald\'s': 'fast food', 'burger king': 'fast food',
  'wendys': 'fast food', 'wendy\'s': 'fast food', 'taco bell': 'fast food',
  'kfc': 'fast food', 'chick-fil-a': 'fast food', 'subway': 'fast food',
  'chipotle': 'fast food', 'five guys': 'fast food',
  
  // Coffee
  'starbucks': 'coffee', 'dunkin': 'coffee', 'peets': 'coffee',
  'tim hortons': 'coffee', 'costa coffee': 'coffee',
  
  // Automotive
  'tesla': 'automotive', 'toyota': 'automotive', 'honda': 'automotive',
  'ford': 'automotive', 'bmw': 'automotive', 'mercedes': 'automotive',
  'audi': 'automotive', 'chevrolet': 'automotive', 'nissan': 'automotive',
  
  // Travel
  'airbnb': 'travel', 'booking': 'travel', 'expedia': 'travel',
  'marriott': 'travel', 'hilton': 'travel',
  
  // Banking
  'chase': 'banking', 'bank of america': 'banking', 'wells fargo': 'banking',
  'capital one': 'banking', 'citi': 'banking'
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
 * Get all known competitors for a brand's industry
 * @param {string} brandName - The target brand name
 * @returns {string[]} List of competitors
 */
function getIndustryCompetitors(brandName) {
  const industry = detectBrandIndustry(brandName);
  if (!industry) {
    return [];
  }
  
  const competitors = INDUSTRY_COMPETITORS[industry] || [];
  // Filter out the target brand itself
  const normalized = brandName.toLowerCase().trim();
  return competitors.filter(c => !c.toLowerCase().includes(normalized) && !normalized.includes(c.toLowerCase()));
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
 * Now includes ranking extraction, separate stats for brand vs discovery queries,
 * and DYNAMIC competitor detection from AI responses
 */
async function analyzeAllResponses(responses, targetBrand) {
  // Brand query types - these mention the brand directly
  const brandQueryTypes = ['directBrand', 'brandOpinion', 'comparison', 'competitorDiscovery'];
  // Discovery query types - these DON'T mention the brand
  const discoveryQueryTypes = ['productDiscovery', 'bestQueries', 'ranking', 'useCase', 'audienceSpecific', 'pricing', 'regional'];

  const results = {
    totalResponses: responses.length,
    responsesWithTarget: 0,
    totalMentions: 0,
    top1Count: 0,
    top3Count: 0,
    competitorCounts: {},    // Dynamic counts from ALL responses
    aiIdentifiedCompetitors: [], // Competitors directly from AI when asked
    analyses: [],
    
    // Separate stats for brand queries vs discovery queries
    brandQueries: {
      total: 0,
      mentioned: 0,
      mentionRate: 0
    },
    discoveryQueries: {
      total: 0,
      mentioned: 0,
      mentionRate: 0,  // This is the TRUE organic visibility
      top1Count: 0,
      top3Count: 0
    },
    
    // Ranking data
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

    const queryType = response.query_type || 'unknown';
    const isBrandQuery = brandQueryTypes.includes(queryType);
    const isDiscoveryQuery = discoveryQueryTypes.includes(queryType);

    // Track brand vs discovery queries separately
    if (isBrandQuery) {
      results.brandQueries.total++;
      if (analysis.targetBrand.mentioned) {
        results.brandQueries.mentioned++;
      }
    } else if (isDiscoveryQuery) {
      results.discoveryQueries.total++;
      if (analysis.targetBrand.mentioned) {
        results.discoveryQueries.mentioned++;
        if (analysis.targetBrand.position === 1) results.discoveryQueries.top1Count++;
        if (analysis.targetBrand.position <= 3) results.discoveryQueries.top3Count++;
      }
    }

    if (analysis.targetBrand.mentioned) {
      results.responsesWithTarget++;
      results.totalMentions++;
      
      if (analysis.targetBrand.position === 1) results.top1Count++;
      if (analysis.targetBrand.position <= 3) results.top3Count++;
    }

    // === COMPETITOR DISCOVERY FROM AI ===
    // If this is a competitorDiscovery query, parse the direct AI response
    if (queryType === 'competitorDiscovery') {
      const aiCompetitors = parseCompetitorDiscoveryResponse(response.response_text, targetBrand);
      for (const comp of aiCompetitors) {
        // Add to AI-identified list with rank
        const existing = results.aiIdentifiedCompetitors.find(c => c.name.toLowerCase() === comp.name.toLowerCase());
        if (!existing) {
          results.aiIdentifiedCompetitors.push(comp);
        }
        // Also count in general competitor counts
        results.competitorCounts[comp.name] = (results.competitorCounts[comp.name] || 0) + 2; // Extra weight for direct AI identification
      }
    }

    // === DYNAMIC BRAND EXTRACTION FROM ALL RESPONSES ===
    // Extract any brand-like names from ALL responses (not just from hardcoded lists)
    const extractedBrands = extractBrandsFromResponse(response.response_text, targetBrand);
    for (const brand of extractedBrands) {
      results.competitorCounts[brand.name] = (results.competitorCounts[brand.name] || 0) + brand.count;
    }

    // Also track competitors from traditional analysis
    for (const comp of analysis.competitors) {
      results.competitorCounts[comp.competitor_name] = 
        (results.competitorCounts[comp.competitor_name] || 0) + 1;
    }

    // Extract ranking if this is a ranking query
    if (queryType === 'ranking') {
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

  // Calculate mention rates
  if (results.brandQueries.total > 0) {
    results.brandQueries.mentionRate = Math.round((results.brandQueries.mentioned / results.brandQueries.total) * 100);
  }
  if (results.discoveryQueries.total > 0) {
    results.discoveryQueries.mentionRate = Math.round((results.discoveryQueries.mentioned / results.discoveryQueries.total) * 100);
  }

  // Calculate ranking stats
  if (results.rankings.positions.length > 0) {
    const positions = results.rankings.positions.map(p => p.position);
    results.rankings.averageRank = Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
    results.rankings.bestRank = Math.min(...positions);
    results.rankings.worstRank = Math.max(...positions);
  }

  // Sort competitors by frequency - merge AI-identified with dynamic extraction
  // AI-identified competitors get priority placement
  const competitorList = Object.entries(results.competitorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  results.topCompetitors = competitorList.map(([name, count]) => {
    // Check if this was directly identified by AI
    const aiIdentified = results.aiIdentifiedCompetitors.find(c => c.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      count,
      aiRank: aiIdentified?.rank || null,
      source: aiIdentified ? 'ai_identified' : 'extracted'
    };
  });
  
  // Sort: AI-identified first (by their rank), then others by count
  results.topCompetitors.sort((a, b) => {
    if (a.aiRank && b.aiRank) return a.aiRank - b.aiRank;
    if (a.aiRank) return -1;
    if (b.aiRank) return 1;
    return b.count - a.count;
  });
  
  results.topCompetitors = results.topCompetitors.slice(0, 10);

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

/**
 * DYNAMIC BRAND EXTRACTION
 * Extract potential brand/company names from AI responses without relying on hardcoded lists
 * Uses patterns like capitalized words, proper nouns, and common brand indicators
 * @param {string} text - Response text
 * @param {string} targetBrand - The brand we're tracking (to exclude)
 * @returns {Array} Array of {name, count, position} for each brand found
 */
function extractBrandsFromResponse(text, targetBrand) {
  const brandCandidates = new Map();
  const targetLower = targetBrand.toLowerCase();
  
  // Pattern 1: Capitalized words/phrases (common brand format)
  // Matches: Nike, Under Armour, Coca-Cola, McDonald's
  const capitalizedPattern = /\b([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)*)\b/g;
  
  // Pattern 2: Numbered/bulleted list items (often contain brand names)
  const listItemPattern = /(?:^|\n)\s*(?:\d+[.\)\-:]|[\*\-•])\s*\**([^\n:]+?)(?:\**\s*[:\-–]|\n|$)/gm;
  
  // Pattern 3: Common brand indicators
  const brandIndicatorPattern = /(?:brands?|companies?|competitors?|alternatives?|options?)(?:[^:]*?:)?\s*([A-Z][^.\n]{10,100})/gi;
  
  // Words to exclude (common words that aren't brands)
  const excludeWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were', 'been',
    'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'best', 'top', 'great', 'good', 'better', 'first', 'second', 'third', 'new', 'old',
    'here', 'there', 'where', 'when', 'what', 'which', 'who', 'how', 'why',
    'some', 'many', 'most', 'other', 'each', 'every', 'both', 'few', 'more', 'less',
    'also', 'just', 'only', 'even', 'still', 'already', 'always', 'never', 'often',
    'very', 'really', 'quite', 'rather', 'pretty', 'fairly', 'highly', 'extremely',
    'however', 'therefore', 'furthermore', 'moreover', 'although', 'because', 'since',
    'while', 'whereas', 'unless', 'until', 'after', 'before', 'during', 'through',
    'above', 'below', 'between', 'among', 'within', 'without', 'against', 'toward',
    'key', 'main', 'major', 'primary', 'secondary', 'core', 'central', 'essential',
    'important', 'significant', 'notable', 'leading', 'popular', 'famous', 'known',
    'overall', 'general', 'specific', 'particular', 'certain', 'various', 'different',
    'similar', 'same', 'like', 'such', 'these', 'those', 'another', 'others',
    'user', 'users', 'customer', 'customers', 'people', 'team', 'teams', 'company', 'companies',
    'product', 'products', 'service', 'services', 'platform', 'platforms', 'app', 'apps',
    'market', 'industry', 'sector', 'space', 'area', 'field', 'domain', 'niche',
    'price', 'pricing', 'cost', 'value', 'quality', 'features', 'feature', 'option', 'options',
    'conclusion', 'summary', 'introduction', 'overview', 'comparison', 'review', 'reviews',
    'pros', 'cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks', 'strengths', 'weaknesses'
  ]);
  
  // Extract from capitalized patterns
  let match;
  while ((match = capitalizedPattern.exec(text)) !== null) {
    const candidate = match[1].trim();
    const candidateLower = candidate.toLowerCase();
    
    // Skip if it's the target brand or a common word
    if (candidateLower === targetLower || 
        candidateLower.includes(targetLower) || 
        targetLower.includes(candidateLower) ||
        excludeWords.has(candidateLower) ||
        candidate.length < 2 ||
        candidate.length > 50) {
      continue;
    }
    
    // Track position and count
    if (!brandCandidates.has(candidateLower)) {
      brandCandidates.set(candidateLower, {
        name: candidate,
        count: 0,
        firstPosition: match.index
      });
    }
    brandCandidates.get(candidateLower).count++;
  }
  
  // Extract from list items (higher confidence)
  while ((match = listItemPattern.exec(text)) !== null) {
    const listItem = match[1].trim();
    // Extract first capitalized phrase from list item
    const brandMatch = listItem.match(/^([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+)?)/)
    if (brandMatch) {
      const candidate = brandMatch[1].trim();
      const candidateLower = candidate.toLowerCase();
      
      if (candidateLower !== targetLower && 
          !excludeWords.has(candidateLower) &&
          candidate.length >= 2) {
        if (!brandCandidates.has(candidateLower)) {
          brandCandidates.set(candidateLower, {
            name: candidate,
            count: 0,
            firstPosition: match.index
          });
        }
        // List items get extra weight
        brandCandidates.get(candidateLower).count += 2;
      }
    }
  }
  
  // Convert to array and sort by count (most mentioned first)
  const results = Array.from(brandCandidates.values())
    .filter(b => b.count >= 1) // Must appear at least once
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Top 15 candidates
  
  // Assign rank positions
  return results.map((b, index) => ({
    name: b.name,
    count: b.count,
    rank: index + 1
  }));
}

/**
 * Parse competitor discovery response to extract AI-identified competitors
 * @param {string} responseText - AI response to competitor query
 * @param {string} targetBrand - The target brand
 * @returns {Array} List of competitors with their rank
 */
function parseCompetitorDiscoveryResponse(responseText, targetBrand) {
  const competitors = [];
  const targetLower = targetBrand.toLowerCase();
  
  // Look for numbered list items first (most reliable)
  const numberedPattern = /(\d+)[.\)\-:]\s*\**([A-Za-z][A-Za-z\s'\-]+?)\**(?:\s*[:\-–]|\s|$)/gm;
  let match;
  
  while ((match = numberedPattern.exec(responseText)) !== null) {
    const rank = parseInt(match[1]);
    const name = match[2].trim().replace(/\*+/g, '');
    const nameLower = name.toLowerCase();
    
    if (nameLower !== targetLower && 
        !nameLower.includes(targetLower) && 
        !targetLower.includes(nameLower) &&
        name.length >= 2 && name.length <= 50 &&
        rank <= 10) {
      competitors.push({ name, rank, source: 'ai_direct' });
    }
  }
  
  // Fallback to bullet points if no numbered list
  if (competitors.length === 0) {
    const bulletPattern = /^[\*\-•]\s*\**([A-Z][A-Za-z\s'\-]+?)\**(?:\s*[:\-–]|\s|$)/gm;
    let rank = 1;
    
    while ((match = bulletPattern.exec(responseText)) !== null) {
      const name = match[1].trim().replace(/\*+/g, '');
      const nameLower = name.toLowerCase();
      
      if (nameLower !== targetLower && 
          !nameLower.includes(targetLower) && 
          !targetLower.includes(nameLower) &&
          name.length >= 2 && name.length <= 50) {
        competitors.push({ name, rank, source: 'ai_direct' });
        rank++;
      }
      if (rank > 10) break;
    }
  }
  
  return competitors.slice(0, 10);
}

module.exports = {
  findBrandMentions,
  analyzeResponse,
  analyzeAllResponses,
  isTargetMentioned,
  detectBrandIndustry,
  getIndustryCompetitors,
  extractRankingPosition,
  extractBrandsFromResponse,
  parseCompetitorDiscoveryResponse,
  INDUSTRY_COMPETITORS
};
