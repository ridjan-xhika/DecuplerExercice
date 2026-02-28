/**
 * Query Generator Service - Enhanced Version
 * Generates comprehensive user prompts to test brand visibility in AI responses
 * 
 * TWO TYPES OF QUERIES:
 * 1. BRAND QUERIES - Mention the brand directly (test direct visibility)
 * 2. DISCOVERY QUERIES - Don't mention brand (test if AI naturally recommends it)
 */

const { askAllProviders } = require('./aiClient');

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
 * Enhanced prompt for better results
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
  "industry": "the primary industry/field (e.g., 'CRM', 'Project Management', 'Social Media')",
  "specificField": "more specific niche (e.g., 'Sales CRM', 'Agile Project Management', 'Social Networking')",
  "description": "brief 2-sentence description of what they do and their value proposition",
  "targetAudience": "primary target customers (e.g., 'small businesses', 'enterprise', 'developers', 'consumers')",
  "mainUseCases": ["list of 5-7 specific use cases or problems their product solves"],
  "topCompetitors": ["list of 8-10 direct competitors in the same space, ordered by relevance"],
  "competitiveAdvantages": ["3-5 things they're known for or do better than competitors"],
  "pricingModel": "free/freemium/paid/enterprise (if known)",
  "keyFeatures": ["5-7 main features or capabilities"]
}

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
    // Use AI-detected information
    return generateEnhancedQueries(brand, aiAnalysis, { queriesPerType, maxTotalQueries });
  } else {
    // Fallback to basic generation - use inferred or passed industry
    const detectedIndustry = industry || inferIndustry(brand) || 'general';
    return generateQueries(brand, detectedIndustry, options);
  }
}

/**
 * Generate enhanced queries using AI analysis
 * This is the main function that creates comprehensive query sets
 * @param {string} brand - The brand name
 * @param {object} analysis - AI analysis results
 * @param {object} options - Generation options
 * @returns {Array} Array of query objects
 */
function generateEnhancedQueries(brand, analysis, options = {}) {
  const { queriesPerType = 3, maxTotalQueries = 40 } = options;
  const queries = [];
  
  const {
    industry = 'general',
    specificField = industry,
    targetAudience = 'consumers',
    mainUseCases = [],
    topCompetitors = [],
    keyFeatures = [],
    region = null
  } = analysis;

  // Get industry-specific data (productTypes, productActions, useCases)
  const industryData = INDUSTRY_DATA[industry.toLowerCase()] || INDUSTRY_DATA['general'];
  
  // Pick random product type and action for variety
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const productType = getRandomItem(industryData.productTypes);
  const productAction = getRandomItem(industryData.productActions);
  
  // Use AI-detected use cases or fall back to industry defaults
  const useCases = mainUseCases.length > 0 ? mainUseCases : industryData.useCases;

  // Helper to add queries from templates with product-specific replacements
  const addQueries = (templates, type, count = queriesPerType, extraReplacements = {}) => {
    if (!templates) return;
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    for (const template of selected) {
      // Pick fresh random product type/action for each query for variety
      const thisProductType = getRandomItem(industryData.productTypes);
      const thisProductAction = getRandomItem(industryData.productActions);
      
      let queryText = template
        .replace(/{brand}/g, brand)
        .replace(/{productType}/g, thisProductType)
        .replace(/{productAction}/g, thisProductAction)
        .replace(/{industry}/g, industry)
        .replace(/{specificField}/g, specificField)
        .replace(/{targetAudience}/g, targetAudience);
      
      // Apply additional replacements
      for (const [key, value] of Object.entries(extraReplacements)) {
        queryText = queryText.replace(new RegExp(`{${key}}`, 'g'), value);
      }
      
      queries.push({
        queryText,
        queryType: type,
        metadata: { productType: thisProductType, productAction: thisProductAction, ...extraReplacements }
      });
    }
  };

  // ============ BRAND QUERIES (mention the brand) ============
  // These test: Does the AI know about this brand?
  
  // 1. DIRECT BRAND QUERIES - "What is {brand}?" (4 queries)
  addQueries(QUERY_TEMPLATES.directBrand, 'directBrand', 4);
  
  // 2. BRAND OPINION QUERIES - "How do you rate {brand}?" (3 queries)
  addQueries(QUERY_TEMPLATES.brandOpinion, 'brandOpinion', 3);

  // 3. COMPETITOR COMPARISONS - "{brand} vs {competitor}?" (up to 4 queries)
  if (topCompetitors.length > 0) {
    const competitorsToCompare = topCompetitors.slice(0, 2);
    for (const competitor of competitorsToCompare) {
      addQueries(QUERY_TEMPLATES.comparison, 'comparison', 2, { competitor });
    }
  }

  // ============ DISCOVERY QUERIES (NO brand mentioned) ============
  // These test: Does the AI naturally recommend this brand?
  // This is the TRUE test of AI visibility

  // 4. RANKING QUERIES (CRITICAL) - "Rank the top 10 companies" (4 queries)
  addQueries(QUERY_TEMPLATES.ranking, 'ranking', 4);

  // 5. PRODUCT DISCOVERY - "Where can I stream music?" (6 queries)
  addQueries(QUERY_TEMPLATES.productDiscovery, 'productDiscovery', 6);

  // 6. BEST QUERIES - "What's the best music streaming app?" (6 queries)
  addQueries(QUERY_TEMPLATES.bestQueries, 'bestQueries', 6);

  // 7. USE CASE QUERIES (up to 4 queries)
  if (useCases.length > 0) {
    const useCasesToQuery = useCases.slice(0, 4);
    for (const useCase of useCasesToQuery) {
      addQueries(QUERY_TEMPLATES.useCase, 'useCase', 1, { useCase });
    }
  }

  // 8. AUDIENCE-SPECIFIC QUERIES (3 queries)
  addQueries(QUERY_TEMPLATES.audienceSpecific, 'audienceSpecific', 3);

  // 9. PRICING QUERIES - free/affordable options (2 queries)
  addQueries(QUERY_TEMPLATES.pricing, 'pricing', 2);

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
  
  console.log(`Generated ${result.length} unique queries for ${brand} (industry: ${industry})`);
  console.log(`Using product types: ${industryData.productTypes.slice(0, 3).join(', ')}`);
  console.log(`Using product actions: ${industryData.productActions.slice(0, 3).join(', ')}`);
  console.log(`Query breakdown: ${result.filter(q => q.queryType === 'directBrand').length} direct brand, ${result.filter(q => q.queryType === 'productDiscovery').length} product discovery, ${result.filter(q => q.queryType === 'bestQueries').length} best queries`);
  return result;
}

/**
 * Generate basic queries for a brand (fallback when AI fails)
 * Uses product-specific queries based on industry
 */
function generateQueries(brand, industry = 'general', options = {}) {
  const queries = [];
  
  // Get industry-specific product data
  const industryData = INDUSTRY_DATA[industry.toLowerCase()] || INDUSTRY_DATA['general'];
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // PRIORITY 1: Direct brand queries (always include these)
  const directBrandTemplates = QUERY_TEMPLATES.directBrand || [];
  for (let i = 0; i < Math.min(5, directBrandTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: directBrandTemplates[i]
        .replace(/{brand}/g, brand)
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction),
      queryType: 'directBrand'
    });
  }

  // PRIORITY 2: Brand opinion queries
  const brandOpinionTemplates = QUERY_TEMPLATES.brandOpinion || [];
  for (let i = 0; i < Math.min(4, brandOpinionTemplates.length); i++) {
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: brandOpinionTemplates[i]
        .replace(/{brand}/g, brand)
        .replace(/{productAction}/g, productAction),
      queryType: 'brandOpinion'
    });
  }

  // PRIORITY 3: RANKING QUERIES (CRITICAL - tests organic visibility)
  const rankingTemplates = QUERY_TEMPLATES.ranking || [];
  for (let i = 0; i < Math.min(3, rankingTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: rankingTemplates[i]
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction),
      queryType: 'ranking'
    });
  }

  // PRIORITY 4: Product discovery queries (NO brand - tests organic visibility)
  const discoveryTemplates = QUERY_TEMPLATES.productDiscovery || [];
  for (let i = 0; i < Math.min(5, discoveryTemplates.length); i++) {
    const productType = getRandomItem(industryData.productTypes);
    const productAction = getRandomItem(industryData.productActions);
    queries.push({
      queryText: discoveryTemplates[i]
        .replace(/{productType}/g, productType)
        .replace(/{productAction}/g, productAction),
      queryType: 'productDiscovery'
    });
  }

  // PRIORITY 5: Best queries (product-specific, NO brand)
  const bestTemplates = QUERY_TEMPLATES.bestQueries || [];
  for (let i = 0; i < Math.min(4, bestTemplates.length); i++) {
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
  getQueryStats,
  QUERY_TEMPLATES,
  INDUSTRY_DATA,
  INDUSTRY_USE_CASES,
  TARGET_AUDIENCES,
  COMMON_FEATURES,
  COMMON_INTEGRATIONS
};
