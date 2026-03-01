/**
 * Query Generator Service - Enhanced Version
 * Generates comprehensive user prompts to test brand visibility in AI responses
 * 
 * THREE TYPES OF INPUTS:
 * 1. DOMAIN (e.g., "shopify.com") - Online/digital focused queries
 * 2. BRAND (e.g., "Nike") - Real-world/physical brand queries
 * 3. MIXED - Can be both (e.g., "Amazon")
 * 
 * TWO TYPES OF QUERIES:
 * 1. BRAND QUERIES - Mention the brand directly (test direct visibility)
 * 2. DISCOVERY QUERIES - Don't mention brand (test if AI naturally recommends it)
 */

const { askAllProviders } = require('./aiClient');

/**
 * Detect if input is a website domain
 * @param {string} input - User input (brand or domain)
 * @returns {object} { isDomain: boolean, cleanName: string, domain: string|null }
 */
function detectInputType(input) {
  const domainExtensions = [
    '.com', '.io', '.co', '.org', '.net', '.app', '.dev', '.ai', '.so', 
    '.xyz', '.me', '.tv', '.gg', '.ly', '.to', '.fm', '.sh', '.cc',
    '.tech', '.cloud', '.software', '.online', '.site', '.store'
  ];
  
  const inputLower = input.toLowerCase().trim();
  
  // Check if it looks like a domain
  const hasDomainExtension = domainExtensions.some(ext => inputLower.endsWith(ext));
  const hasProtocol = inputLower.startsWith('http://') || inputLower.startsWith('https://');
  const hasDot = inputLower.includes('.');
  
  if (hasDomainExtension || hasProtocol) {
    // Extract clean brand name from domain
    let cleanName = inputLower
      .replace(/^https?:\/\//, '')  // Remove protocol
      .replace(/^www\./, '')         // Remove www
      .split('/')[0];                // Remove path
    
    const domain = cleanName;
    
    // Extract brand name (remove extension)
    cleanName = cleanName.split('.')[0];
    // Capitalize first letter
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    
    return { isDomain: true, cleanName, domain, inputType: 'website' };
  }
  
  // Check if it's a known tech/online brand (even without domain extension)
  const onlineBrands = [
    'shopify', 'notion', 'figma', 'slack', 'discord', 'vercel', 'netlify',
    'github', 'gitlab', 'stripe', 'twilio', 'sendgrid', 'mailchimp',
    'hubspot', 'salesforce', 'zendesk', 'intercom', 'asana', 'trello',
    'monday', 'clickup', 'airtable', 'zapier', 'canva', 'miro'
  ];
  
  if (onlineBrands.includes(inputLower)) {
    return { isDomain: false, cleanName: input, domain: null, inputType: 'online_brand' };
  }
  
  // Physical/real-world brand
  return { isDomain: false, cleanName: input, domain: null, inputType: 'physical_brand' };
}

// Comprehensive query templates by category
// IMPORTANT: Discovery queries should NOT mention {brand} - we want to see if AI naturally recommends it
const QUERY_TEMPLATES = {
  // =============================================================================
  // BRAND QUERIES - These mention the brand directly
  // Used to test: Does the AI know about this brand? What does it say?
  // =============================================================================
  
  directBrand: [
    "What is {brand}?",
    "Tell me about {brand}",
    "What does {brand} do?",
    "Explain what {brand} is",
    "Give me an overview of {brand}"
  ],

  brandOpinion: [
    "How do you rate {brand}?",
    "What do you think of {brand}?",
    "Is {brand} any good?",
    "How good is {brand}?",
    "Rate {brand} out of 10"
  ],

  // Comparison still uses brand name - comparing brand to competitors
  comparison: [
    "How does {brand} compare to {competitor}?",
    "{brand} vs {competitor}?",
    "Is {brand} better than {competitor}?",
    "Compare {brand} and {competitor}",
    "Which is better: {brand} or {competitor}?"
  ],

  // =============================================================================
  // DOMAIN/WEBSITE QUERIES - For online platforms and websites
  // These check if the DOMAIN/URL is mentioned in recommendations
  // =============================================================================
  
  websiteDiscovery: [
    "What website should I use to {productAction}?",
    "Best website for {productAction}?",
    "What's a good site to {productAction}?",
    "Recommend a website to {productAction}",
    "Which online platform is best for {productAction}?",
    "What's the best online tool to {productAction}?",
    "Best web app for {productAction}?"
  ],
  
  websiteBest: [
    "What's the best {productType} website?",
    "Best {productType} platform online?",
    "Top {productType} websites?",
    "What {productType} site do you recommend?",
    "Most popular {productType} online tool?",
    "Best online {productType}?",
    "What's the go-to website for {productType}?",
    "Leading {productType} platform?"
  ],
  
  websiteRanking: [
    "Rank the top 10 {productType} websites",
    "List the best {productType} platforms in order",
    "What are the top 5 websites for {productAction}?",
    "Rank the best online {productType} tools",
    "Top {productType} sites from best to worst",
    "Best {productType} platforms ranked"
  ],
  
  websiteAlternatives: [
    "What are some {productType} websites?",
    "List of {productType} platforms",
    "Websites similar to {competitor}?",
    "Alternatives to {competitor} online?",
    "Other {productType} sites like {competitor}?"
  ],
  
  websiteUseCase: [
    "Best website for {useCase}?",
    "What online tool should I use for {useCase}?",
    "Best platform for {useCase}?",
    "Which site is best for {useCase}?",
    "Online solution for {useCase}?"
  ],

  // =============================================================================
  // DISCOVERY QUERIES - These do NOT mention the brand
  // Used to test: Does the AI naturally recommend this brand?
  // This is the TRUE test of AI visibility
  // =============================================================================

  // Product discovery - natural search queries
  productDiscovery: [
    "Where can I {productAction}?",
    "Best way to {productAction}?",
    "How do I {productAction}?",
    "What should I use to {productAction}?",
    "I want to {productAction}, what do you recommend?",
    "Help me {productAction}",
    "What's the easiest way to {productAction}?",
    "Recommend something to {productAction}"
  ],

  // Best/Top queries - no brand mentioned
  bestQueries: [
    "What's the best {productType}?",
    "Best {productType} right now?",
    "Top {productType} in 2024?",
    "What's the most popular {productType}?",
    "Which {productType} is number one?",
    "Leading {productType}?",
    "Top rated {productType}?",
    "What {productType} do you recommend?",
    "Most trusted {productType}?"
  ],

  // Use case queries - no brand mentioned
  useCase: [
    "Best {productType} for {useCase}?",
    "What should I use for {useCase}?",
    "I need to {useCase}, what's best?",
    "What's good for {useCase}?",
    "Recommend something for {useCase}",
    "How do I {useCase}?"
  ],

  // Audience specific - no brand mentioned
  audienceSpecific: [
    "Best {productType} for beginners?",
    "{productType} for professionals?",
    "Best {productType} for {targetAudience}?",
    "Easy {productType} to use?",
    "Premium {productType} options?",
    "Best {productType} for families?"
  ],

  // =============================================================================
  // RANKING QUERIES - Ask AI to rank companies (CRITICAL for visibility score)
  // =============================================================================
  
  ranking: [
    "Rank the top 10 {productType} companies",
    "List the best {productType} brands in order",
    "Give me a ranking of {productType} from best to worst",
    "What are the top 5 companies for {productAction}?",
    "Rank the leading {productType} providers",
    "Create a tier list of {productType}",
    "Which {productType} would you rank #1?",
    "Order these by quality: what are the best {productType}?"
  ],

  // =============================================================================
  // COMPETITOR DISCOVERY - Ask AI directly who the competitors are
  // This replaces hardcoded competitor lists!
  // =============================================================================
  
  competitorDiscovery: [
    "Who are the top 5 competitors of {brand} in the {industry} industry?",
    "What are the main competitors of {brand}?",
    "List {brand}'s biggest competitors",
    "Who competes with {brand}?",
    "What companies compete directly with {brand}?"
  ],

  // =============================================================================
  // PRICING QUERIES - Mix of brand and non-brand
  // =============================================================================
  
  pricing: [
    "Free {productType} options?",
    "Cheap {productType} alternatives?",
    "Best free {productType}?",
    "Affordable {productType}?",
    "What {productType} is free?"
  ],

  // Regional queries - no brand mentioned
  regional: [
    "Best {productType} in {region}?",
    "Top {productType} in {region}?",
    "What {productType} is popular in {region}?"
  ]
};

// Industry-specific product information
// Each industry has: productTypes (what the product IS), productActions (what users DO with it), useCases (specific scenarios)
const INDUSTRY_DATA = {
  // === TECH INDUSTRIES ===
  'music streaming': {
    productTypes: ['music streaming app', 'music app', 'music service', 'music platform', 'audio streaming service'],
    productActions: ['listen to music', 'stream music', 'discover new songs', 'create playlists', 'download music offline'],
    useCases: ['listening to music', 'discovering new artists', 'creating playlists', 'listening offline', 'sharing music']
  },
  'video streaming': {
    productTypes: ['streaming service', 'video streaming app', 'streaming platform', 'TV streaming service', 'movie streaming app'],
    productActions: ['watch movies', 'stream TV shows', 'watch videos', 'binge watch shows', 'stream content'],
    useCases: ['watching movies', 'binge watching TV shows', 'streaming live TV', 'family movie nights', 'watching documentaries']
  },
  'gaming communication': {
    productTypes: ['gaming chat app', 'voice chat app', 'gaming community platform', 'gamer chat', 'team voice chat'],
    productActions: ['chat while gaming', 'voice chat with friends', 'join gaming communities', 'talk to teammates', 'stream to friends'],
    useCases: ['gaming with friends', 'voice chat during games', 'running a gaming server', 'streaming gameplay', 'team coordination']
  },
  'social media': {
    productTypes: ['social media app', 'social network', 'social platform', 'community platform', 'photo sharing app'],
    productActions: ['share photos', 'connect with friends', 'post updates', 'follow people', 'share content'],
    useCases: ['sharing photos', 'staying connected', 'following influencers', 'posting stories', 'networking']
  },
  'crm': {
    productTypes: ['CRM software', 'sales CRM', 'customer management tool', 'sales platform', 'CRM system'],
    productActions: ['manage customer relationships', 'track sales', 'manage leads', 'close deals', 'track prospects'],
    useCases: ['sales tracking', 'lead management', 'customer management', 'pipeline management', 'deal tracking']
  },
  'project management': {
    productTypes: ['project management tool', 'task manager', 'team collaboration app', 'work management platform', 'productivity app'],
    productActions: ['manage projects', 'track tasks', 'collaborate with team', 'organize work', 'plan sprints'],
    useCases: ['team collaboration', 'task tracking', 'project planning', 'sprint management', 'deadline tracking']
  },
  'marketing': {
    productTypes: ['email marketing tool', 'marketing automation platform', 'marketing software', 'campaign manager', 'marketing app'],
    productActions: ['send email campaigns', 'automate marketing', 'track campaigns', 'grow audience', 'nurture leads'],
    useCases: ['email campaigns', 'marketing automation', 'lead nurturing', 'campaign tracking', 'audience growth']
  },
  'ecommerce': {
    productTypes: ['ecommerce platform', 'online store builder', 'shopping platform', 'store builder', 'online shop'],
    productActions: ['sell online', 'build an online store', 'accept payments', 'manage inventory', 'ship products'],
    useCases: ['selling products online', 'building a store', 'payment processing', 'inventory management', 'dropshipping']
  },
  'communication': {
    productTypes: ['team chat app', 'messaging app', 'video conferencing tool', 'collaboration platform', 'work chat'],
    productActions: ['chat with team', 'video call', 'send messages', 'share files', 'host meetings'],
    useCases: ['team communication', 'video meetings', 'remote collaboration', 'file sharing', 'async communication']
  },
  'development': {
    productTypes: ['code hosting platform', 'developer tool', 'version control', 'CI/CD platform', 'code repository'],
    productActions: ['host code', 'collaborate on code', 'deploy apps', 'manage repositories', 'review code'],
    useCases: ['code hosting', 'version control', 'CI/CD', 'code review', 'deployment']
  },
  'design': {
    productTypes: ['design tool', 'UI design app', 'prototyping tool', 'graphic design software', 'design platform'],
    productActions: ['design interfaces', 'create prototypes', 'collaborate on designs', 'make graphics', 'edit images'],
    useCases: ['UI design', 'prototyping', 'graphic design', 'design collaboration', 'wireframing']
  },
  'finance': {
    productTypes: ['accounting software', 'finance app', 'invoicing tool', 'payment platform', 'bookkeeping software'],
    productActions: ['send invoices', 'track expenses', 'manage finances', 'accept payments', 'do bookkeeping'],
    useCases: ['invoicing', 'expense tracking', 'accounting', 'payment processing', 'financial reporting']
  },
  'customer support': {
    productTypes: ['help desk software', 'customer support platform', 'ticketing system', 'live chat tool', 'support app'],
    productActions: ['handle support tickets', 'chat with customers', 'manage help desk', 'provide support', 'track issues'],
    useCases: ['customer support', 'ticket management', 'live chat support', 'help desk', 'customer service']
  },
  
  // === NON-TECH INDUSTRIES ===
  'sportswear': {
    productTypes: ['running shoes', 'athletic shoes', 'sports brand', 'athletic apparel', 'workout clothes', 'sneakers'],
    productActions: ['buy running shoes', 'shop for athletic wear', 'get workout clothes', 'buy sneakers', 'find sports gear'],
    useCases: ['running', 'working out', 'playing basketball', 'training', 'playing sports', 'going to the gym']
  },
  'fashion': {
    productTypes: ['clothing brand', 'fashion brand', 'apparel store', 'fashion retailer', 'clothing store'],
    productActions: ['buy clothes', 'shop for fashion', 'find outfits', 'shop online for clothes', 'buy designer clothes'],
    useCases: ['shopping for clothes', 'finding trendy outfits', 'dressing well', 'buying affordable fashion', 'sustainable fashion']
  },
  'fast food': {
    productTypes: ['fast food restaurant', 'burger place', 'fast food chain', 'quick service restaurant', 'food chain'],
    productActions: ['order food', 'get fast food', 'grab a burger', 'order delivery', 'eat out'],
    useCases: ['quick meals', 'food delivery', 'drive-through', 'late night food', 'cheap eats']
  },
  'coffee': {
    productTypes: ['coffee shop', 'coffee chain', 'cafe', 'coffee brand', 'coffee place'],
    productActions: ['get coffee', 'order coffee', 'grab a latte', 'buy coffee', 'find a cafe'],
    useCases: ['morning coffee', 'working from a cafe', 'meeting friends for coffee', 'grabbing coffee on the go']
  },
  'automotive': {
    productTypes: ['car brand', 'car company', 'vehicle manufacturer', 'auto brand', 'electric car company'],
    productActions: ['buy a car', 'shop for cars', 'lease a vehicle', 'find a car', 'compare cars'],
    useCases: ['buying a new car', 'finding an electric vehicle', 'car shopping', 'comparing car brands', 'test driving']
  },
  'retail': {
    productTypes: ['online store', 'retailer', 'shopping site', 'ecommerce store', 'marketplace'],
    productActions: ['shop online', 'buy products', 'order things', 'find deals', 'buy stuff'],
    useCases: ['online shopping', 'finding deals', 'buying electronics', 'home shopping', 'quick delivery']
  },
  'travel': {
    productTypes: ['travel booking site', 'hotel booking app', 'vacation rental', 'travel platform', 'booking service'],
    productActions: ['book a hotel', 'find accommodation', 'book travel', 'find vacation rentals', 'plan a trip'],
    useCases: ['booking hotels', 'planning vacations', 'finding accommodations', 'travel planning', 'booking flights']
  },
  'banking': {
    productTypes: ['bank', 'financial institution', 'banking app', 'online bank', 'credit card company'],
    productActions: ['open a bank account', 'manage money', 'apply for credit card', 'transfer money', 'check balance'],
    useCases: ['online banking', 'managing finances', 'getting a credit card', 'savings', 'loans']
  },
  
  // Default fallback
  'general': {
    productTypes: ['company', 'brand', 'service', 'product', 'platform'],
    productActions: ['use their service', 'buy their products', 'try them out', 'check them out', 'use them'],
    useCases: ['general use', 'everyday needs', 'getting things done', 'finding solutions']
  }
};

// Legacy use cases mapping (for backward compatibility)
const INDUSTRY_USE_CASES = Object.fromEntries(
  Object.entries(INDUSTRY_DATA).map(([key, data]) => [key, data.useCases])
);

// Target audiences for queries
const TARGET_AUDIENCES = [
  'startups', 'small businesses', 'enterprise companies', 'freelancers',
  'agencies', 'developers', 'marketers', 'designers', 'sales teams',
  'remote teams', 'non-technical users', 'beginners', 'professionals',
  'solopreneurs', 'consultants', 'teams', 'individuals'
];

// Common features to query about
const COMMON_FEATURES = [
  'API access', 'mobile app', 'integrations', 'automation',
  'reporting', 'analytics', 'collaboration', 'templates',
  'custom branding', 'white labeling', 'SSO', 'two-factor authentication',
  'export options', 'import tools', 'notifications', 'webhooks'
];

// Common integrations
const COMMON_INTEGRATIONS = [
  'Slack', 'Zapier', 'Google Workspace', 'Microsoft 365',
  'Salesforce', 'HubSpot', 'Notion', 'Jira', 'GitHub',
  'Stripe', 'Shopify', 'QuickBooks', 'Mailchimp'
];

/**
 * Use AI to analyze a brand/company and get detailed industry info
 * Enhanced prompt for better results - now includes productTypes and productActions
 * so we don't need hardcoded industry mappings
 */
async function analyzeCompanyWithAI(brand, userContext = {}) {
  const contextHints = [];
  if (userContext.industry) contextHints.push(`Industry hint: ${userContext.industry}`);
  if (userContext.targetAudience) contextHints.push(`Target audience: ${userContext.targetAudience}`);
  if (userContext.productDescription) contextHints.push(`Product: ${userContext.productDescription}`);
  if (userContext.knownCompetitors?.length) contextHints.push(`Known competitors: ${userContext.knownCompetitors.join(', ')}`);
  if (userContext.mainUseCases?.length) contextHints.push(`Use cases: ${userContext.mainUseCases.join(', ')}`);
  if (userContext.region) contextHints.push(`Target region: ${userContext.region}`);

  const contextString = contextHints.length > 0 
    ? `\n\nAdditional context provided by user:\n${contextHints.join('\n')}`
    : '';

  const prompt = `Analyze the company/brand "${brand}" and provide detailed information in JSON format.${contextString}

{
  "industry": "the primary industry/field (e.g., 'CRM', 'Sportswear', 'Coffee Shops')",
  "specificField": "more specific niche (e.g., 'Sales CRM', 'Running Shoes', 'Premium Coffee')",
  "description": "brief 2-sentence description of what they do and their value proposition",
  "targetAudience": "primary target customers (e.g., 'small businesses', 'athletes', 'developers', 'consumers')",
  "productTypes": ["5-6 terms people would use to search for this type of product/service (e.g., for Nike: 'running shoes', 'athletic shoes', 'sneakers', 'sports brand', 'athletic apparel', 'workout clothes')"],
  "productActions": ["5-6 actions/verbs describing what customers do with this product (e.g., for Nike: 'buy running shoes', 'shop for athletic wear', 'find sneakers', 'get workout clothes', 'buy sports gear')"],
  "mainUseCases": ["5-7 specific use cases or scenarios where someone would use this product (e.g., for Nike: 'running', 'going to the gym', 'playing basketball', 'working out', 'training')"],
  "topCompetitors": ["8-10 direct competitors in the same space, ordered by relevance"],
  "competitiveAdvantages": ["3-5 things they're known for or do better than competitors"],
  "pricingModel": "free/freemium/paid/enterprise/premium (if known)",
  "keyFeatures": ["5-7 main features, products, or capabilities"]
}

IMPORTANT: productTypes should be generic category terms (not the brand name), and productActions should be natural search phrases people would use when looking for this type of product/service.

Be specific and accurate. Only respond with valid JSON, no other text.`;

  try {
    const results = await askAllProviders(prompt);
    
    const successfulResult = results.find(r => r.success);
    if (!successfulResult) {
      console.log('AI analysis failed, using fallback');
      return null;
    }

    const responseText = successfulResult.responseText;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Merge with user-provided context (user input takes precedence)
      if (userContext.industry && !parsed.industry) parsed.industry = userContext.industry;
      if (userContext.targetAudience && !parsed.targetAudience) parsed.targetAudience = userContext.targetAudience;
      if (userContext.region) parsed.region = userContext.region;
      if (userContext.knownCompetitors?.length) {
        parsed.topCompetitors = [...new Set([...userContext.knownCompetitors, ...(parsed.topCompetitors || [])])];
      }
      if (userContext.mainUseCases?.length) {
        parsed.mainUseCases = [...new Set([...userContext.mainUseCases, ...(parsed.mainUseCases || [])])];
      }
      
      console.log(`AI Analysis for ${brand}:`, parsed);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Error in AI company analysis:', error);
    return null;
  }
}

/**
 * Generate queries for a brand with AI-powered industry detection
 * @param {string} brand - The brand/domain name
 * @param {string} industry - The industry (optional, will be detected if not provided)
 * @param {object} options - Generation options including user context
 * @returns {Array} Array of query objects
 */
async function generateQueriesWithAI(brand, industry = null, options = {}) {
  const {
    queriesPerType = 3,
    maxTotalQueries = 35,
    targetAudience,
    mainUseCases,
    knownCompetitors,
    productDescription,
    region
  } = options;

  // Build user context for AI analysis
  const userContext = {
    industry,
    targetAudience,
    mainUseCases: mainUseCases ? mainUseCases.split(',').map(s => s.trim()).filter(Boolean) : [],
    knownCompetitors: knownCompetitors ? knownCompetitors.split(',').map(s => s.trim()).filter(Boolean) : [],
    productDescription,
    region
  };

  // First, analyze the company with AI
  const aiAnalysis = await analyzeCompanyWithAI(brand, userContext);
  
  if (aiAnalysis) {
    // Use AI-detected information - normalize the industry
    aiAnalysis.industry = normalizeIndustry(aiAnalysis.industry);
    console.log(`AI analysis succeeded for ${brand}, normalized industry: ${aiAnalysis.industry}`);
    return generateEnhancedQueries(brand, aiAnalysis, { queriesPerType, maxTotalQueries });
  } else {
    // Fallback to basic generation - use inferred or passed industry
    const detectedIndustry = normalizeIndustry(industry || inferIndustry(brand) || 'general');
    console.log(`AI analysis failed for ${brand}, using inferred industry: ${detectedIndustry}`);
    return generateQueries(brand, detectedIndustry, options);
  }
}

/**
 * Generate enhanced queries using AI analysis
 * This is the main function that creates comprehensive query sets
 * @param {string} brand - The brand name or domain
 * @param {object} analysis - AI analysis results
 * @param {object} options - Generation options
 * @returns {Array} Array of query objects
 */
function generateEnhancedQueries(brand, analysis, options = {}) {
  const { queriesPerType = 3, maxTotalQueries = 40 } = options;
  const queries = [];
  
  // Detect if input is a domain/website or a physical brand
  const inputInfo = detectInputType(brand);
  const isWebsite = inputInfo.isDomain || inputInfo.inputType === 'online_brand';
  const displayName = inputInfo.cleanName; // Clean brand name for display
  const domainToCheck = inputInfo.domain; // The actual domain to look for in responses
  
  console.log(`Input type detection: "${brand}" → ${inputInfo.inputType} (isWebsite: ${isWebsite}, cleanName: ${displayName})`);
  
  const {
    industry = 'general',
    specificField = industry,
    targetAudience = 'consumers',
    mainUseCases = [],
    topCompetitors = [],
    keyFeatures = [],
    productTypes: aiProductTypes = [],
    productActions: aiProductActions = [],
    region = null
  } = analysis;

  // Normalize and map industry to our INDUSTRY_DATA keys (as fallback)
  const normalizedIndustry = normalizeIndustry(industry);
  
  // Get fallback industry-specific data
  const fallbackData = INDUSTRY_DATA[normalizedIndustry] || INDUSTRY_DATA['general'];
  
  // PREFER AI-generated product types/actions over hardcoded ones
  // This makes the system work for ANY industry, not just hardcoded ones
  const productTypes = (aiProductTypes && aiProductTypes.length >= 3) 
    ? aiProductTypes 
    : fallbackData.productTypes;
  const productActions = (aiProductActions && aiProductActions.length >= 3) 
    ? aiProductActions 
    : fallbackData.productActions;
  const useCases = (mainUseCases && mainUseCases.length >= 3) 
    ? mainUseCases 
    : fallbackData.useCases;
  
  console.log(`Query generation for "${analysis.industry || 'unknown'}":`);
  console.log(`  - Using ${aiProductTypes?.length >= 3 ? 'AI-generated' : 'fallback'} productTypes:`, productTypes?.slice(0, 3));
  console.log(`  - Using ${aiProductActions?.length >= 3 ? 'AI-generated' : 'fallback'} productActions:`, productActions?.slice(0, 3));
  console.log(`  - Query focus: ${isWebsite ? 'ONLINE/WEBSITE' : 'REAL-WORLD/BRAND'}`);
  
  // Pick random product type and action for variety
  const getRandomItem = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : 'product';

  // Get random competitor for comparison queries
  const getRandomCompetitor = () => {
    if (topCompetitors && topCompetitors.length > 0) {
      return topCompetitors[Math.floor(Math.random() * topCompetitors.length)];
    }
    return 'alternatives';
  };

  // Helper to add queries from templates with product-specific replacements
  const addQueries = (templates, type, count = queriesPerType, extraReplacements = {}) => {
    if (!templates) return;
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    for (const template of selected) {
      // Pick fresh random product type/action for each query for variety
      const thisProductType = getRandomItem(productTypes);
      const thisProductAction = getRandomItem(productActions);
      
      let queryText = template
        .replace(/{brand}/g, displayName) // Use clean name, not domain
        .replace(/{productType}/g, thisProductType)
        .replace(/{productAction}/g, thisProductAction)
        .replace(/{industry}/g, industry)
        .replace(/{specificField}/g, specificField)
        .replace(/{targetAudience}/g, targetAudience)
        .replace(/{competitor}/g, getRandomCompetitor());
      
      // Apply additional replacements
      for (const [key, value] of Object.entries(extraReplacements)) {
        queryText = queryText.replace(new RegExp(`{${key}}`, 'g'), value);
      }
      
      queries.push({
        queryText,
        queryType: type,
        metadata: { 
          productType: thisProductType, 
          productAction: thisProductAction, 
          isWebsiteQuery: isWebsite,
          domainToCheck: domainToCheck,
          ...extraReplacements 
        }
      });
    }
  };

  // ============ BRAND QUERIES (mention the brand) - MINIMAL ============
  // Only 5-6 queries with brand name - just to verify AI knows the brand exists
  // These are NOT the main visibility test!
  
  // 1. DIRECT BRAND QUERIES - Just 2 to verify AI knows the brand
  addQueries(QUERY_TEMPLATES.directBrand, 'directBrand', 2);
  
  // 2. COMPETITOR DISCOVERY - Ask AI who competitors are (2 queries)
  addQueries(QUERY_TEMPLATES.competitorDiscovery, 'competitorDiscovery', 2);

  // Skip brand opinion and comparison queries - they inflate mention rate artificially

  // ============ DISCOVERY QUERIES - THE REAL TEST ============
  // Different query types based on whether it's a website or physical brand
  
  if (isWebsite) {
    // =============================================================================
    // WEBSITE/ONLINE FOCUS - Check if the DOMAIN is mentioned in recommendations
    // Queries about best websites, online platforms, web tools, etc.
    // =============================================================================
    console.log(`  → Generating WEBSITE-FOCUSED queries for domain: ${domainToCheck || displayName}`);
    
    // 3. WEBSITE RANKING QUERIES - "Rank the top 10 websites for X" (6 queries)
    addQueries(QUERY_TEMPLATES.websiteRanking, 'websiteRanking', 6);
    
    // 4. WEBSITE DISCOVERY - "What website should I use to...?" (8 queries)
    addQueries(QUERY_TEMPLATES.websiteDiscovery, 'websiteDiscovery', 8);
    
    // 5. WEBSITE BEST - "What's the best X website?" (8 queries)
    addQueries(QUERY_TEMPLATES.websiteBest, 'websiteBest', 8);
    
    // 6. WEBSITE USE CASES - "Best website for [specific use case]?" (6 queries)
    if (useCases.length > 0) {
      const useCasesToQuery = useCases.slice(0, 6);
      for (const useCase of useCasesToQuery) {
        addQueries(QUERY_TEMPLATES.websiteUseCase, 'websiteUseCase', 1, { useCase });
      }
    }
    
    // 7. WEBSITE ALTERNATIVES - "Websites similar to X?" (4 queries)
    addQueries(QUERY_TEMPLATES.websiteAlternatives, 'websiteAlternatives', 4);
    
    // 8. Also add some general discovery queries (online context)
    addQueries(QUERY_TEMPLATES.productDiscovery, 'productDiscovery', 4);
    
  } else {
    // =============================================================================
    // PHYSICAL/REAL-WORLD BRAND FOCUS - Traditional brand visibility queries
    // Queries about products, stores, purchases, real-world activities
    // =============================================================================
    console.log(`  → Generating REAL-WORLD/BRAND queries for: ${displayName}`);

    // 3. RANKING QUERIES (CRITICAL) - "Rank the top 10 companies" (6 queries)
    addQueries(QUERY_TEMPLATES.ranking, 'ranking', 6);

    // 4. PRODUCT DISCOVERY - "Where can I buy running shoes?" (8 queries)
    addQueries(QUERY_TEMPLATES.productDiscovery, 'productDiscovery', 8);

    // 5. BEST QUERIES - "What's the best running shoe brand?" (8 queries)
    addQueries(QUERY_TEMPLATES.bestQueries, 'bestQueries', 8);

    // 6. USE CASE QUERIES (up to 6 queries)
    if (useCases.length > 0) {
      const useCasesToQuery = useCases.slice(0, 6);
      for (const useCase of useCasesToQuery) {
        addQueries(QUERY_TEMPLATES.useCase, 'useCase', 1, { useCase });
      }
    }

    // 7. AUDIENCE-SPECIFIC QUERIES (5 queries)
    addQueries(QUERY_TEMPLATES.audienceSpecific, 'audienceSpecific', 5);
  }

  // ============ COMMON QUERIES (Both website and brand) ============
  
  // 8. PRICING QUERIES - free/affordable options (3 queries)
  addQueries(QUERY_TEMPLATES.pricing, 'pricing', 3);

  // 10. REGIONAL QUERIES (if region provided)
  if (region && region !== 'global') {
    addQueries(QUERY_TEMPLATES.regional, 'regional', 2, { region });
  }

  // Remove duplicates and limit
  const uniqueQueries = [];
  const seenQueries = new Set();
  
  for (const query of queries) {
    const normalized = query.queryText.toLowerCase().trim();
    if (!seenQueries.has(normalized)) {
      seenQueries.add(normalized);
      uniqueQueries.push(query);
    }
  }

  // DON'T shuffle - keep high priority queries first
  const result = uniqueQueries.slice(0, maxTotalQueries);
  
  console.log(`Generated ${result.length} unique queries for ${displayName} (industry: ${industry}, type: ${isWebsite ? 'WEBSITE' : 'BRAND'})`);
  const queryBreakdown = {};
  for (const q of result) {
    queryBreakdown[q.queryType] = (queryBreakdown[q.queryType] || 0) + 1;
  }
  console.log(`Query breakdown:`, queryBreakdown);
  console.log(`Sample queries:`, result.slice(0, 3).map(q => ({ text: q.queryText, type: q.queryType })));
  return result;
}

/**
 * Generate basic queries for a brand (fallback when AI fails)
 * HEAVILY weighted toward DISCOVERY queries (no brand mentioned)
 * Only ~10% of queries should mention the brand
 */
function generateQueries(brand, industry = 'general', options = {}) {
  const queries = [];
  
  // Get industry-specific product data
  const industryData = INDUSTRY_DATA[industry.toLowerCase()] || INDUSTRY_DATA['general'];
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ============ BRAND QUERIES - MINIMAL (just 2-3) ============
  // Only to verify AI knows the brand exists
  
  // Just 2 direct brand queries
  const directBrandTemplates = QUERY_TEMPLATES.directBrand || [];
  for (let i = 0; i < Math.min(2, directBrandTemplates.length); i++) {
    queries.push({
      queryText: directBrandTemplates[i].replace(/{brand}/g, brand),
      queryType: 'directBrand'
    });
  }

  // 1 competitor discovery query
  const competitorDiscoveryTemplates = QUERY_TEMPLATES.competitorDiscovery || [];
  if (competitorDiscoveryTemplates.length > 0) {
    queries.push({
      queryText: competitorDiscoveryTemplates[0]
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry),
      queryType: 'competitorDiscovery'
    });
  }

  // ============ DISCOVERY QUERIES - THE REAL TEST (90%+) ============
  
  // RANKING QUERIES (6 queries)
  const rankingTemplates = QUERY_TEMPLATES.ranking || [];
  for (let i = 0; i < Math.min(6, rankingTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: rankingTemplates[i]
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction),
      queryType: 'ranking'
    });
  }

  // PRODUCT DISCOVERY queries (8 queries - NO brand)
  const discoveryTemplates = QUERY_TEMPLATES.productDiscovery || [];
  for (let i = 0; i < Math.min(8, discoveryTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: discoveryTemplates[i]
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction),
      queryType: 'productDiscovery'
    });
  }

  // BEST QUERIES (8 queries - NO brand)
  const bestTemplates = QUERY_TEMPLATES.bestQueries || [];
  for (let i = 0; i < Math.min(8, bestTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: bestTemplates[i]
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction)
        .replace(/{targetAudience}/g, 'everyone'),
      queryType: 'bestQueries'
    });
  }

  // PRIORITY 6: Use case queries (NO brand)
  const useCases = industryData.useCases || [];
  const useCaseTemplates = QUERY_TEMPLATES.useCase || [];
  for (let i = 0; i < Math.min(2, useCases.length); i++) {
    const template = useCaseTemplates[i % useCaseTemplates.length];
    const productType = getRandomItem(industryData.productTypes);
    if (template) {
      queries.push({
        queryText: template
          .replace(/{useCase}/g, useCases[i])
          .replace(/{productType}/g, productType),
        queryType: 'useCase'
      });
    }
  }

  console.log(`[Fallback] Generated ${queries.length} queries for ${brand} (industry: ${industry})`);
  return queries;
}

/**
 * Normalize AI-returned industry names to match our INDUSTRY_DATA keys
 * This ensures we get proper product types even when AI returns different industry names
 * @param {string} industry - The industry name from AI or user
 * @returns {string} Normalized industry key that matches INDUSTRY_DATA
 */
function normalizeIndustry(industry) {
  if (!industry) return 'general';
  
  const industryLower = industry.toLowerCase().trim();
  
  // Direct match
  if (INDUSTRY_DATA[industryLower]) {
    return industryLower;
  }
  
  // Mapping of various AI-returned industry names to our INDUSTRY_DATA keys
  const industryMappings = {
    // Sportswear mappings
    'sportswear': 'sportswear',
    'athletic apparel': 'sportswear',
    'athletic wear': 'sportswear',
    'activewear': 'sportswear',
    'sports apparel': 'sportswear',
    'footwear': 'sportswear',
    'athletic footwear': 'sportswear',
    'sports footwear': 'sportswear',
    'sneakers': 'sportswear',
    'running shoes': 'sportswear',
    'athletic shoes': 'sportswear',
    'sports equipment': 'sportswear',
    'sporting goods': 'sportswear',
    'athletics': 'sportswear',
    'sports': 'sportswear',
    'fitness': 'sportswear',
    'fitness apparel': 'sportswear',
    'workout gear': 'sportswear',
    'gym wear': 'sportswear',
    
    // Fashion mappings
    'fashion': 'fashion',
    'apparel': 'fashion',
    'clothing': 'fashion',
    'fashion retail': 'fashion',
    'luxury fashion': 'fashion',
    'fast fashion': 'fashion',
    'retail fashion': 'fashion',
    'designer fashion': 'fashion',
    'luxury goods': 'fashion',
    
    // Fast food mappings
    'fast food': 'fast food',
    'quick service restaurant': 'fast food',
    'qsr': 'fast food',
    'restaurants': 'fast food',
    'food service': 'fast food',
    'fast casual': 'fast food',
    'food & beverage': 'fast food',
    
    // Coffee mappings
    'coffee': 'coffee',
    'coffee shop': 'coffee',
    'cafe': 'coffee',
    'coffeehouse': 'coffee',
    'coffee chain': 'coffee',
    'beverage': 'coffee',
    
    // Automotive mappings
    'automotive': 'automotive',
    'automobile': 'automotive',
    'auto': 'automotive',
    'cars': 'automotive',
    'vehicles': 'automotive',
    'electric vehicles': 'automotive',
    'ev': 'automotive',
    'automobile manufacturing': 'automotive',
    'car manufacturing': 'automotive',
    
    // Tech industry mappings
    'social media': 'social media',
    'social networking': 'social media',
    'social network': 'social media',
    'social platform': 'social media',
    
    'crm': 'crm',
    'customer relationship management': 'crm',
    'sales software': 'crm',
    'sales crm': 'crm',
    
    'project management': 'project management',
    'task management': 'project management',
    'work management': 'project management',
    'productivity': 'project management',
    'productivity software': 'project management',
    
    'ecommerce': 'ecommerce',
    'e-commerce': 'ecommerce',
    'online retail': 'ecommerce',
    'online shopping': 'ecommerce',
    'digital commerce': 'ecommerce',
    
    'music streaming': 'music streaming',
    'audio streaming': 'music streaming',
    'music': 'music streaming',
    'music service': 'music streaming',
    
    'video streaming': 'video streaming',
    'streaming': 'video streaming',
    'streaming service': 'video streaming',
    'ott': 'video streaming',
    'entertainment': 'video streaming',
    
    'gaming communication': 'gaming communication',
    'gaming': 'gaming communication',
    'gaming platform': 'gaming communication',
    
    'communication': 'communication',
    'team communication': 'communication',
    'collaboration': 'communication',
    'video conferencing': 'communication',
    'messaging': 'communication',
    
    'development': 'development',
    'software development': 'development',
    'devops': 'development',
    'developer tools': 'development',
    
    'design': 'design',
    'design tools': 'design',
    'graphic design': 'design',
    'ui design': 'design',
    'ux design': 'design',
    
    'customer support': 'customer support',
    'help desk': 'customer support',
    'customer service': 'customer support',
    'support software': 'customer support',
    
    'finance': 'finance',
    'fintech': 'finance',
    'payments': 'finance',
    'accounting': 'finance',
    'financial services': 'finance',
    
    'marketing': 'marketing',
    'email marketing': 'marketing',
    'digital marketing': 'marketing',
    'marketing automation': 'marketing',
    
    'retail': 'retail',
    'online marketplace': 'retail',
    'marketplace': 'retail',
    'general retail': 'retail',
    
    'travel': 'travel',
    'hospitality': 'travel',
    'travel & hospitality': 'travel',
    'hotels': 'travel',
    'booking': 'travel',
    
    'banking': 'banking',
    'financial': 'banking',
    'bank': 'banking',
    'financial institution': 'banking'
  };
  
  // Check direct mapping
  if (industryMappings[industryLower]) {
    return industryMappings[industryLower];
  }
  
  // Check if any mapping key is contained in the industry string
  for (const [key, value] of Object.entries(industryMappings)) {
    if (industryLower.includes(key) || key.includes(industryLower)) {
      return value;
    }
  }
  
  // Fallback: check if any INDUSTRY_DATA key is in the string
  for (const key of Object.keys(INDUSTRY_DATA)) {
    if (industryLower.includes(key)) {
      return key;
    }
  }
  
  console.log(`Could not normalize industry: "${industry}", falling back to general`);
  return 'general';
}

/**
 * Infer SPECIFIC industry from brand name
 * Maps brands to their actual product category, not generic "software" or "entertainment"
 */
function inferIndustry(domain) {
  const domainLower = domain.toLowerCase();
  
  // Map brands to SPECIFIC industries that match INDUSTRY_DATA keys
  const brandToIndustry = {
    // MUSIC STREAMING
    'music streaming': ['spotify', 'apple music', 'tidal', 'deezer', 'soundcloud', 'pandora', 'amazon music', 'youtube music'],
    
    // VIDEO STREAMING
    'video streaming': ['netflix', 'hulu', 'disney', 'hbo', 'paramount', 'peacock', 'prime video', 'amazon prime', 'apple tv', 'crunchyroll'],
    
    // GAMING COMMUNICATION
    'gaming communication': ['discord', 'teamspeak', 'mumble', 'curse'],
    
    // SOCIAL MEDIA
    'social media': ['facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'linkedin', 'reddit', 'pinterest', 'threads', 'mastodon'],
    
    // CRM
    'crm': ['salesforce', 'hubspot', 'pipedrive', 'zoho crm', 'freshsales', 'monday sales'],
    
    // PROJECT MANAGEMENT
    'project management': ['asana', 'trello', 'monday', 'jira', 'notion', 'clickup', 'basecamp', 'wrike', 'todoist'],
    
    // MARKETING
    'marketing': ['mailchimp', 'sendgrid', 'marketo', 'buffer', 'hootsuite', 'constant contact', 'klaviyo', 'convertkit'],
    
    // ECOMMERCE
    'ecommerce': ['shopify', 'woocommerce', 'bigcommerce', 'magento', 'squarespace commerce', 'wix stores'],
    
    // COMMUNICATION (Work/Team)
    'communication': ['slack', 'teams', 'zoom', 'google meet', 'webex', 'microsoft teams'],
    
    // DEVELOPMENT
    'development': ['github', 'gitlab', 'bitbucket', 'vercel', 'netlify', 'heroku', 'aws', 'azure'],
    
    // DESIGN
    'design': ['figma', 'sketch', 'adobe', 'canva', 'invision', 'framer', 'miro'],
    
    // FINANCE
    'finance': ['quickbooks', 'xero', 'stripe', 'square', 'paypal', 'venmo', 'freshbooks', 'wave'],
    
    // CUSTOMER SUPPORT
    'customer support': ['zendesk', 'intercom', 'freshdesk', 'helpscout', 'drift', 'crisp'],
    
    // === NON-TECH ===
    
    // SPORTSWEAR
    'sportswear': ['nike', 'adidas', 'puma', 'under armour', 'reebok', 'new balance', 'asics', 'lululemon', 'fila', 'converse', 'jordan', 'vans'],
    
    // FASHION
    'fashion': ['zara', 'h&m', 'gucci', 'louis vuitton', 'prada', 'chanel', 'uniqlo', 'gap', 'levis', 'ralph lauren', 'burberry', 'versace', 'dior'],
    
    // FAST FOOD
    'fast food': ['mcdonald', 'burger king', 'wendy', 'taco bell', 'kfc', 'chick-fil-a', 'subway', 'chipotle', 'five guys', 'popeyes', 'arbys', 'sonic'],
    
    // COFFEE
    'coffee': ['starbucks', 'dunkin', 'peet', 'tim hortons', 'costa coffee', 'blue bottle', 'philz'],
    
    // AUTOMOTIVE
    'automotive': ['tesla', 'toyota', 'ford', 'bmw', 'mercedes', 'honda', 'chevrolet', 'audi', 'volkswagen', 'porsche', 'ferrari', 'hyundai', 'nissan', 'mazda', 'kia', 'rivian', 'lucid'],
    
    // RETAIL
    'retail': ['amazon', 'walmart', 'target', 'costco', 'ikea', 'home depot', 'best buy', 'ebay', 'alibaba', 'etsy', 'wayfair'],
    
    // TRAVEL
    'travel': ['airbnb', 'booking', 'expedia', 'tripadvisor', 'marriott', 'hilton', 'vrbo', 'kayak', 'hotels.com'],
    
    // BANKING
    'banking': ['chase', 'bank of america', 'wells fargo', 'citi', 'capital one', 'goldman', 'morgan stanley', 'hsbc', 'barclays', 'santander']
  };

  for (const [industry, brands] of Object.entries(brandToIndustry)) {
    if (brands.some(brand => domainLower.includes(brand))) {
      return industry;
    }
  }

  // Return null so AI can detect the industry
  return null;
}

/**
 * Get query statistics for reporting
 */
function getQueryStats(queries) {
  const stats = {
    total: queries.length,
    byType: {},
    hasCompetitorComparisons: false,
    hasUseCaseQueries: false
  };

  for (const query of queries) {
    stats.byType[query.queryType] = (stats.byType[query.queryType] || 0) + 1;
    
    if (query.queryType === 'directComparison') {
      stats.hasCompetitorComparisons = true;
    }
    if (query.queryType === 'useCaseSpecific') {
      stats.hasUseCaseQueries = true;
    }
  }

  return stats;
}

module.exports = {
  generateQueries,
  generateQueriesWithAI,
  analyzeCompanyWithAI,
  generateEnhancedQueries,
  inferIndustry,
  normalizeIndustry,
  detectInputType,
  getQueryStats,
  QUERY_TEMPLATES,
  INDUSTRY_DATA,
  INDUSTRY_USE_CASES,
  TARGET_AUDIENCES,
  COMMON_FEATURES,
  COMMON_INTEGRATIONS
};
