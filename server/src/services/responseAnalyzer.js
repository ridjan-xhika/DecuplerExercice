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
 * @param {object} options - Additional options like domainToCheck
 * @returns {Array} Array of mentions with positions
 */
function findBrandMentions(text, targetBrand, options = {}) {
  const normalizedText = text.toLowerCase();
  const mentions = [];
  let position = 1;

  // Get industry-specific competitors only
  const industryCompetitors = getIndustryCompetitors(targetBrand);
  
  // Combine target brand with its ACTUAL industry competitors
  const brandsToFind = [...new Set([targetBrand.toLowerCase(), ...industryCompetitors])];
  
  // If this is a website/domain input, also check for the domain itself
  // e.g., "shopify.com" should match both "shopify" and "shopify.com"
  const { domainToCheck } = options;
  if (domainToCheck && !brandsToFind.includes(domainToCheck.toLowerCase())) {
    brandsToFind.unshift(domainToCheck.toLowerCase()); // Add domain first (priority)
  }

  // Find all brand occurrences with their character positions
  const brandPositions = [];

  for (const brand of brandsToFind) {
    let searchPos = 0;
    while (true) {
      const index = normalizedText.indexOf(brand, searchPos);
      if (index === -1) break;
      
      // Check if it's a word boundary (not part of another word)
      // Must handle: markdown (**brand**), lists (- brand), newlines, etc.
      const before = index > 0 ? normalizedText[index - 1] : ' ';
      const after = normalizedText[index + brand.length] || ' ';
      
      const isDomain = brand.includes('.');
      // Include: whitespace, punctuation, markdown chars (*, #, [, ], >, |), newlines
      const wordBoundaryRegex = /[\s,.\-:;!?()"'*#\[\]>|\\\/\n\r\t]/;
      const beforeOk = wordBoundaryRegex.test(before);
      const afterOk = isDomain 
        ? /[\s,\-:;!?()"'*#\[\]>|\n\r\t]/.test(after) // Domain: no period after
        : wordBoundaryRegex.test(after); // Brand: period OK after
      
      if (beforeOk && afterOk) {
        // Check if this is the target brand or its domain
        const isTarget = brand === targetBrand.toLowerCase() || 
                        (domainToCheck && brand === domainToCheck.toLowerCase());
        
        brandPositions.push({
          brand,
          charIndex: index,
          isTargetBrand: isTarget,
          isDomainMention: isDomain
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
    // For domains, treat "shopify" and "shopify.com" as the same
    const brandKey = bp.brand.split('.')[0]; // Base name without extension
    
    if (!seenBrands.has(brandKey)) {
      seenBrands.add(brandKey);
      
      // Extract context snippet (50 chars before and after)
      const snippetStart = Math.max(0, bp.charIndex - 50);
      const snippetEnd = Math.min(text.length, bp.charIndex + bp.brand.length + 50);
      const contextSnippet = text.substring(snippetStart, snippetEnd).trim();

      mentions.push({
        brandName: bp.brand,
        position,
        isTargetBrand: bp.isTargetBrand,
        isDomainMention: bp.isDomainMention || false,
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
 * @param {object} options - Additional options like domainToCheck
 * @returns {object} Analysis results
 */
async function analyzeResponse(responseId, responseText, targetBrand, options = {}) {
  const mentions = findBrandMentions(responseText, targetBrand, options);
  
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
 * @param {object} options - Additional options like domainToCheck for website inputs
 */
async function analyzeAllResponses(responses, targetBrand, options = {}) {
  // Brand query types - these mention the brand directly
  const brandQueryTypes = ['directBrand', 'brandOpinion', 'comparison', 'competitorDiscovery'];
  // Discovery query types - these DON'T mention the brand
  const discoveryQueryTypes = ['productDiscovery', 'bestQueries', 'ranking', 'useCase', 'audienceSpecific', 'pricing', 'regional'];
  // Website-specific query types
  const websiteQueryTypes = ['websiteDiscovery', 'websiteBest', 'websiteRanking', 'websiteUseCase', 'websiteAlternatives'];

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
    
    // Website-specific queries (for domain inputs)
    websiteQueries: {
      total: 0,
      mentioned: 0,
      mentionRate: 0,
      domainMentions: 0 // Times the actual domain (e.g., shopify.com) was mentioned
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
    // Pass domain info to analysis if available
    const analysisOptions = { ...options };
    if (response.metadata?.domainToCheck) {
      analysisOptions.domainToCheck = response.metadata.domainToCheck;
    }
    
    const analysis = await analyzeResponse(response.id, response.response_text, targetBrand, analysisOptions);
    results.analyses.push(analysis);

    const queryType = response.query_type || 'unknown';
    const isBrandQuery = brandQueryTypes.includes(queryType);
    const isDiscoveryQuery = discoveryQueryTypes.includes(queryType);
    const isWebsiteQuery = websiteQueryTypes.includes(queryType);

    // Track brand vs discovery vs website queries separately
    if (isBrandQuery) {
      results.brandQueries.total++;
      if (analysis.targetBrand.mentioned) {
        results.brandQueries.mentioned++;
      }
    } else if (isWebsiteQuery) {
      results.websiteQueries.total++;
      if (analysis.targetBrand.mentioned) {
        results.websiteQueries.mentioned++;
        // Track position for website queries too
        if (analysis.targetBrand.position === 1) {
          results.websiteQueries.top1Count = (results.websiteQueries.top1Count || 0) + 1;
        }
        if (analysis.targetBrand.position <= 3) {
          results.websiteQueries.top3Count = (results.websiteQueries.top3Count || 0) + 1;
        }
        // Check if domain specifically was mentioned
        const domainMention = analysis.mentions?.find(m => m.isDomainMention && m.isTargetBrand);
        if (domainMention) {
          results.websiteQueries.domainMentions++;
        }
      }
    } else if (isDiscoveryQuery) {
      results.discoveryQueries.total++;
      if (analysis.targetBrand.mentioned) {
        results.discoveryQueries.mentioned++;
        if (analysis.targetBrand.position === 1) results.discoveryQueries.top1Count++;
        if (analysis.targetBrand.position <= 3) results.discoveryQueries.top3Count++;
      }
    } else {
      // Unknown query type - count as discovery for organic visibility
      // This catches website queries that might not match exactly
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
  if (results.websiteQueries.total > 0) {
    results.websiteQueries.mentionRate = Math.round((results.websiteQueries.mentioned / results.websiteQueries.total) * 100);
  }

  // Calculate ranking stats
  if (results.rankings.positions.length > 0) {
    const positions = results.rankings.positions.map(p => p.position);
    results.rankings.averageRank = Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10;
    results.rankings.bestRank = Math.min(...positions);
    results.rankings.worstRank = Math.max(...positions);
  }

  // Sort competitors by frequency - merge AI-identified with dynamic extraction
  // First, normalize competitor counts (merge different casings)
  const normalizedCounts = new Map();
  for (const [name, count] of Object.entries(results.competitorCounts)) {
    const lowerName = name.toLowerCase();
    if (normalizedCounts.has(lowerName)) {
      const existing = normalizedCounts.get(lowerName);
      existing.count += count;
      // Keep the properly capitalized version (most likely the longer one or first seen)
      if (name.length > existing.name.length || (name[0] === name[0].toUpperCase() && existing.name[0] !== existing.name[0].toUpperCase())) {
        existing.name = name;
      }
    } else {
      normalizedCounts.set(lowerName, { name, count });
    }
  }
  
  // Convert back to sorted list
  const competitorList = Array.from(normalizedCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  
  results.topCompetitors = competitorList.map(({ name, count }) => {
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
  
  // Words to exclude (common words that aren't brands) - COMPREHENSIVE LIST
  const excludeWords = new Set([
    // Common English words
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
    // Business/marketing terms (NOT brands)
    'key', 'main', 'major', 'primary', 'secondary', 'core', 'central', 'essential',
    'important', 'significant', 'notable', 'leading', 'popular', 'famous', 'known',
    'overall', 'general', 'specific', 'particular', 'certain', 'various', 'different',
    'similar', 'same', 'like', 'such', 'these', 'those', 'another', 'others',
    'user', 'users', 'customer', 'customers', 'people', 'team', 'teams', 'company', 'companies',
    'product', 'products', 'service', 'services', 'platform', 'platforms', 'app', 'apps',
    'market', 'markets', 'industry', 'industries', 'sector', 'sectors', 'space', 'area', 'field', 'domain', 'niche',
    'price', 'pricing', 'cost', 'costs', 'value', 'quality', 'features', 'feature', 'option', 'options',
    'conclusion', 'summary', 'introduction', 'overview', 'comparison', 'review', 'reviews',
    'pros', 'cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks', 'strengths', 'weaknesses',
    // Common false positives from AI responses
    'your', 'you', 'they', 'their', 'them', 'its', 'our', 'we', 'us', 'my', 'me', 'i',
    'market share', 'product offerings', 'offerings', 'offering', 'share',
    'brand', 'brands', 'branding', 'branded',
    'competitor', 'competitors', 'competitive', 'competition',
    'alternative', 'alternatives',
    'analysis', 'report', 'data', 'information', 'details', 'insight', 'insights',
    'ranking', 'rankings', 'rank', 'ranked', 'position', 'positions',
    'category', 'categories', 'segment', 'segments', 'type', 'types',
    'performance', 'growth', 'revenue', 'sales', 'profit', 'profits',
    'strategy', 'strategies', 'approach', 'approaches', 'method', 'methods',
    'customer experience', 'user experience', 'experience', 'experiences',
    'innovation', 'innovations', 'technology', 'technologies', 'tech',
    'design', 'designs', 'style', 'styles', 'fashion',
    'retail', 'retailer', 'retailers', 'store', 'stores', 'shop', 'shops',
    'online', 'offline', 'digital', 'physical', 'virtual',
    'global', 'local', 'regional', 'national', 'international', 'worldwide',
    'premium', 'luxury', 'budget', 'affordable', 'expensive', 'cheap',
    'high', 'low', 'medium', 'average', 'standard', 'basic', 'advanced',
    'large', 'small', 'big', 'little', 'huge', 'tiny', 'massive',
    'strong', 'weak', 'powerful', 'limited', 'extensive', 'comprehensive',
    'modern', 'traditional', 'classic', 'contemporary', 'current', 'recent',
    'direct', 'indirect', 'primary', 'secondary', 'main', 'minor',
    'fast', 'slow', 'quick', 'rapid', 'gradual', 'steady',
    'free', 'paid', 'subscription', 'freemium', 'enterprise',
    'note', 'notes', 'tip', 'tips', 'hint', 'hints', 'warning', 'caution',
    'example', 'examples', 'instance', 'instances', 'case', 'cases',
    'step', 'steps', 'process', 'processes', 'procedure', 'procedures',
    'result', 'results', 'outcome', 'outcomes', 'effect', 'effects',
    'reason', 'reasons', 'cause', 'causes', 'factor', 'factors',
    'way', 'ways', 'manner', 'means', 'method', 'technique', 'techniques',
    'point', 'points', 'aspect', 'aspects', 'element', 'elements',
    'part', 'parts', 'section', 'sections', 'portion', 'portions',
    'time', 'times', 'period', 'periods', 'year', 'years', 'month', 'months', 'day', 'days',
    'number', 'numbers', 'amount', 'amounts', 'quantity', 'quantities',
    'level', 'levels', 'degree', 'degrees', 'extent', 'range', 'ranges',
    'source', 'sources', 'origin', 'origins', 'base', 'bases', 'foundation',
    'focus', 'focuses', 'emphasis', 'priority', 'priorities',
    'goal', 'goals', 'objective', 'objectives', 'target', 'targets', 'aim', 'aims',
    'issue', 'issues', 'problem', 'problems', 'challenge', 'challenges', 'concern', 'concerns',
    'solution', 'solutions', 'answer', 'answers', 'response', 'responses',
    'question', 'questions', 'query', 'queries', 'request', 'requests',
    'choice', 'choices', 'selection', 'selections', 'pick', 'picks',
    'list', 'lists', 'item', 'items', 'entry', 'entries',
    'name', 'names', 'title', 'titles', 'label', 'labels',
    'description', 'descriptions', 'definition', 'definitions', 'explanation', 'explanations',
    'image', 'images', 'picture', 'pictures', 'photo', 'photos', 'video', 'videos',
    'link', 'links', 'url', 'urls', 'website', 'websites', 'site', 'sites', 'page', 'pages',
    'content', 'contents', 'material', 'materials', 'resource', 'resources',
    'tool', 'tools', 'software', 'application', 'applications',
    // Common sentence starters that get picked up
    'here', 'below', 'following', 'above', 'next', 'finally', 'lastly', 'additionally',
    'however', 'moreover', 'furthermore', 'therefore', 'thus', 'hence', 'consequently',
    'overall', 'generally', 'typically', 'usually', 'often', 'sometimes', 'rarely', 'never',
    // Possessives and pronouns
    "it's", "that's", "what's", "here's", "there's", "who's", "how's", "why's",
    "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't", "shouldn't",
    // Numbers written as words
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
  ]);
  
  // Additional patterns to skip (regex-based)
  const skipPatterns = [
    /^[A-Z]$/,                           // Single capital letters
    /^\d+$/,                              // Pure numbers
    /^[A-Z][a-z]$/,                       // Two-letter words
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,  // Months
    /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i,   // Days
    /^(Product|Market|Brand|Customer|Service|Quality|Price)/i, // Business terms
    /Share$/i,                            // "Market Share", etc.
    /Offerings?$/i,                       // "Product Offerings"
    /Experience$/i,                       // "Customer Experience"
    /Analysis$/i,                         // "Market Analysis"
  ];
  
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
        candidate.length < 3 ||  // Increased minimum length
        candidate.length > 40 ||
        skipPatterns.some(p => p.test(candidate))) {
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
          candidate.length >= 3 &&
          !skipPatterns.some(p => p.test(candidate))) {
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

/**
 * SENTIMENT ANALYSIS
 * Analyzes the sentiment of how a brand is mentioned in AI responses
 * @param {string} text - Response text
 * @param {string} targetBrand - The brand to analyze sentiment for
 * @returns {object} { sentiment: 'positive'|'neutral'|'negative', score: number, indicators: string[] }
 */
function analyzeMentionSentiment(text, targetBrand) {
  const textLower = text.toLowerCase();
  const brandLower = targetBrand.toLowerCase();
  
  // Check if brand is mentioned
  if (!textLower.includes(brandLower)) {
    return { sentiment: 'neutral', score: 0, indicators: [], context: null };
  }
  
  // Find the context around the brand mention (200 chars before and after)
  const brandIndex = textLower.indexOf(brandLower);
  const contextStart = Math.max(0, brandIndex - 200);
  const contextEnd = Math.min(text.length, brandIndex + brandLower.length + 200);
  const context = text.substring(contextStart, contextEnd).toLowerCase();
  
  // Positive indicators
  const positiveWords = [
    'best', 'excellent', 'great', 'amazing', 'outstanding', 'top', 'leading', 'recommended',
    'popular', 'trusted', 'reliable', 'powerful', 'innovative', 'user-friendly', 'intuitive',
    'efficient', 'effective', 'superior', 'premium', 'award', 'winner', 'first choice',
    'highly rated', 'well-known', 'industry leader', 'market leader', 'preferred', 'favorite',
    'comprehensive', 'robust', 'solid', 'impressive', 'exceptional', 'fantastic', 'perfect',
    'love', 'loved', 'loves', 'recommend', 'recommends', 'praised', 'standout', 'dominates',
    'excels', 'shines', 'top-rated', 'highly recommended', 'go-to', 'gold standard'
  ];
  
  // Negative indicators
  const negativeWords = [
    'worst', 'bad', 'poor', 'terrible', 'awful', 'avoid', 'overpriced', 'expensive',
    'complicated', 'difficult', 'confusing', 'limited', 'lacking', 'disappointing',
    'frustrating', 'outdated', 'slow', 'buggy', 'unreliable', 'issues', 'problems',
    'criticism', 'criticized', 'concerns', 'drawbacks', 'downsides', 'weaknesses',
    'not recommended', 'better alternatives', 'falls short', 'behind', 'lag', 'lags',
    'controversy', 'controversial', 'scandal', 'privacy concerns', 'security issues',
    'complaints', 'negative reviews', 'hate', 'hated', 'dislike', 'inferior', 'mediocre'
  ];
  
  // Neutral/comparison indicators
  const neutralWords = [
    'alternative', 'option', 'choice', 'competitor', 'similar', 'comparable', 'versus',
    'compared to', 'unlike', 'however', 'but', 'although', 'while', 'whereas'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  const foundIndicators = [];
  
  // Check for positive words in context
  for (const word of positiveWords) {
    if (context.includes(word)) {
      positiveScore += 1;
      foundIndicators.push(`+${word}`);
    }
  }
  
  // Check for negative words in context
  for (const word of negativeWords) {
    if (context.includes(word)) {
      negativeScore += 1;
      foundIndicators.push(`-${word}`);
    }
  }
  
  // Check for neutral words
  for (const word of neutralWords) {
    if (context.includes(word)) {
      neutralScore += 0.5;
    }
  }
  
  // Special patterns that indicate sentiment
  // Brand + "is/are" + positive adjective
  const positivePattern = new RegExp(`${brandLower}\\s+(?:is|are)\\s+(?:a\\s+)?(?:very\\s+)?(?:${positiveWords.slice(0, 20).join('|')})`, 'i');
  if (positivePattern.test(context)) {
    positiveScore += 2;
    foundIndicators.push('+direct_praise');
  }
  
  // Brand + "is/are" + negative adjective
  const negativePattern = new RegExp(`${brandLower}\\s+(?:is|are)\\s+(?:a\\s+)?(?:very\\s+)?(?:${negativeWords.slice(0, 15).join('|')})`, 'i');
  if (negativePattern.test(context)) {
    negativeScore += 2;
    foundIndicators.push('-direct_criticism');
  }
  
  // Top position indicators
  if (/^1[.\)\-:]|#1|number one|top pick|best overall|first choice/i.test(context)) {
    positiveScore += 3;
    foundIndicators.push('+top_ranked');
  }
  
  // Calculate final sentiment
  const totalScore = positiveScore - negativeScore;
  let sentiment = 'neutral';
  
  if (positiveScore > negativeScore + 1) {
    sentiment = 'positive';
  } else if (negativeScore > positiveScore + 1) {
    sentiment = 'negative';
  }
  
  return {
    sentiment,
    score: totalScore,
    positiveScore,
    negativeScore,
    indicators: foundIndicators.slice(0, 5),
    context: text.substring(contextStart, contextEnd)
  };
}

/**
 * Aggregate sentiment analysis across all responses
 * @param {Array} sentimentResults - Array of individual sentiment analyses
 * @returns {object} Aggregated sentiment data for UI display
 */
function aggregateSentiment(sentimentResults) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  let totalScore = 0;
  const allIndicators = [];
  
  for (const result of sentimentResults) {
    if (result.sentiment) {
      counts[result.sentiment]++;
      totalScore += result.score || 0;
      if (result.indicators) {
        allIndicators.push(...result.indicators);
      }
    }
  }
  
  const total = counts.positive + counts.neutral + counts.negative;
  
  // Determine overall sentiment
  let overall = 'neutral';
  if (total > 0) {
    if (counts.positive > counts.negative * 1.5) overall = 'positive';
    else if (counts.negative > counts.positive * 1.5) overall = 'negative';
  }
  
  // Get most common indicators
  const indicatorCounts = {};
  for (const ind of allIndicators) {
    indicatorCounts[ind] = (indicatorCounts[ind] || 0) + 1;
  }
  const topIndicators = Object.entries(indicatorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ind]) => ind);
  
  return {
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
    overall,
    averageScore: total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0,
    topIndicators
  };
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
  analyzeMentionSentiment,
  aggregateSentiment,
  INDUSTRY_COMPETITORS
};
