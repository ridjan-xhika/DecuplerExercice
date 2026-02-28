/**
 * Query Generator Service - Enhanced Version
 * Generates comprehensive user prompts to test brand visibility in AI responses
 * Inspired by Searchable, Peec AI, and BabyLoveGrowth tools
 */

const { askAllProviders } = require('./aiClient');

// Comprehensive query templates by category
const QUERY_TEMPLATES = {
  // === DIRECT BRAND QUERIES (HIGH PRIORITY - Should always mention the brand) ===
  directBrand: [
    "What is {brand}?",
    "Tell me about {brand}",
    "What does {brand} do?",
    "Explain what {brand} is",
    "Give me info on {brand}",
    "What is {brand} used for?",
    "Who uses {brand}?",
    "How would you describe {brand}?",
    "What kind of company is {brand}?",
    "Give me an overview of {brand}"
  ],

  // === BRAND OPINION/RATING QUERIES ===
  brandOpinion: [
    "How do you rate {brand}?",
    "What do you think of {brand}?",
    "Is {brand} any good?",
    "Would you recommend {brand}?",
    "How good is {brand}?",
    "What's your opinion on {brand}?",
    "Rate {brand} out of 10",
    "Is {brand} worth using?",
    "Should I try {brand}?",
    "Give me your honest take on {brand}"
  ],

  // === NATURAL DISCOVERY QUERIES ===
  naturalDiscovery: [
    "Give me some {industry} apps",
    "Name some {industry} tools",
    "List some {industry} companies",
    "What are some {industry} platforms?",
    "Show me some {industry} options",
    "What {industry} apps exist?",
    "Tell me about {industry} software",
    "Give me {industry} recommendations",
    "What {industry} services are out there?",
    "Name a few {industry} solutions"
  ],

  // === BEST/TOP QUERIES (Natural phrasing) ===
  bestQueries: [
    "What's the best {industry} app?",
    "Best {industry} company?",
    "Top {industry} tools?",
    "Who's the best in {industry}?",
    "What's the leading {industry} platform?",
    "Best {industry} software right now?",
    "What's number one in {industry}?",
    "Top rated {industry}?",
    "Best {industry} for {targetAudience}?",
    "Most popular {industry}?"
  ],

  // === COMPARISON QUERIES (Natural) ===
  comparison: [
    "How does {brand} compare?",
    "{brand} vs the competition?",
    "Is {brand} better than {competitor}?",
    "{brand} or {competitor}?",
    "Compare {brand} and {competitor}",
    "Which is better: {brand} or {competitor}?",
    "{brand} vs {competitor} - which to choose?",
    "How's {brand} compared to others?",
    "Is {brand} competitive?"
  ],

  // === ALTERNATIVES QUERIES ===
  alternatives: [
    "Alternatives to {brand}?",
    "What's like {brand}?",
    "Similar to {brand}?",
    "Apps like {brand}",
    "What competes with {brand}?",
    "{brand} competitors?",
    "Other options besides {brand}?",
    "What else is there besides {brand}?",
    "Anything better than {brand}?"
  ],

  // === USE CASE QUERIES (Natural) ===
  useCase: [
    "Best app for {useCase}?",
    "What should I use for {useCase}?",
    "Help me with {useCase}",
    "What's good for {useCase}?",
    "I need something for {useCase}",
    "Recommend something for {useCase}",
    "Tools for {useCase}?",
    "How do I handle {useCase}?",
    "Best way to do {useCase}?"
  ],

  // === PRICING QUERIES ===
  pricing: [
    "Is {brand} free?",
    "How much is {brand}?",
    "{brand} pricing?",
    "Is {brand} expensive?",
    "Does {brand} have a free plan?",
    "What does {brand} cost?",
    "{brand} free trial?",
    "Cheap {industry} options?",
    "Free {industry} tools?"
  ],

  // === REVIEW/RATING QUERIES ===
  review: [
    "{brand} reviews?",
    "Is {brand} legit?",
    "{brand} worth it?",
    "Any issues with {brand}?",
    "Problems with {brand}?",
    "{brand} pros and cons?",
    "Honest opinion on {brand}?",
    "What's wrong with {brand}?",
    "Is {brand} reliable?"
  ],

  // === AUDIENCE-SPECIFIC QUERIES ===
  audienceSpecific: [
    "Best {industry} for startups?",
    "{industry} for small business?",
    "Enterprise {industry} solutions?",
    "{industry} for developers?",
    "Easy {industry} for beginners?",
    "{industry} for freelancers?",
    "Simple {industry} tools?",
    "Best {industry} for teams?"
  ],

  // === REGIONAL QUERIES ===
  regional: [
    "Best {industry} in {region}?",
    "{industry} for {region}?",
    "Is {brand} available in {region}?",
    "Top {industry} companies in {region}?",
    "{region} {industry} options?"
  ]
};

// Extended use cases by industry
const INDUSTRY_USE_CASES = {
  'social media': [
    'social media management', 'content scheduling', 'community engagement',
    'influencer tracking', 'social listening', 'analytics and reporting',
    'cross-platform posting', 'hashtag research', 'audience growth',
    'social commerce', 'user engagement', 'brand monitoring'
  ],
  'crm': [
    'sales tracking', 'customer management', 'lead generation', 'pipeline management',
    'contact management', 'deal tracking', 'sales forecasting', 'customer segmentation',
    'relationship management', 'sales automation', 'email tracking', 'meeting scheduling'
  ],
  'project management': [
    'team collaboration', 'task tracking', 'agile workflows', 'resource planning',
    'sprint planning', 'gantt charts', 'time tracking', 'milestone tracking',
    'project templates', 'workload management', 'deadline management', 'team coordination'
  ],
  'marketing': [
    'email campaigns', 'social media management', 'content creation', 'analytics',
    'marketing automation', 'lead nurturing', 'A/B testing', 'campaign tracking',
    'audience segmentation', 'ROI tracking', 'landing pages', 'conversion optimization'
  ],
  'ecommerce': [
    'online store', 'payment processing', 'inventory management', 'dropshipping',
    'order fulfillment', 'product catalog', 'shopping cart', 'checkout optimization',
    'customer reviews', 'multi-channel selling', 'shipping management', 'returns processing'
  ],
  'analytics': [
    'data visualization', 'reporting', 'business intelligence', 'metrics tracking',
    'dashboard creation', 'data analysis', 'KPI tracking', 'custom reports',
    'data integration', 'predictive analytics', 'user behavior analysis', 'conversion tracking'
  ],
  'communication': [
    'team chat', 'video conferencing', 'async communication', 'file sharing',
    'screen sharing', 'voice calls', 'team channels', 'direct messaging',
    'meeting scheduling', 'remote collaboration', 'webinars', 'live streaming'
  ],
  'development': [
    'code hosting', 'CI/CD', 'code review', 'deployment',
    'version control', 'issue tracking', 'pull requests', 'automated testing',
    'container orchestration', 'infrastructure as code', 'API development', 'debugging'
  ],
  'design': [
    'UI design', 'prototyping', 'design collaboration', 'asset management',
    'wireframing', 'design systems', 'handoff to developers', 'user testing',
    'brand guidelines', 'responsive design', 'icon design', 'illustration'
  ],
  'hr': [
    'recruiting', 'onboarding', 'performance reviews', 'payroll',
    'employee engagement', 'time off tracking', 'benefits administration',
    'talent management', 'employee directory', 'compliance tracking', 'training', 'surveys'
  ],
  'finance': [
    'invoicing', 'expense tracking', 'accounting', 'budgeting',
    'financial reporting', 'tax preparation', 'cash flow management',
    'accounts payable', 'accounts receivable', 'financial forecasting', 'payroll', 'billing'
  ],
  'customer support': [
    'help desk', 'ticket management', 'live chat', 'knowledge base',
    'customer feedback', 'support automation', 'SLA tracking', 'multi-channel support',
    'customer satisfaction', 'agent performance', 'chatbots', 'FAQ management'
  ],
  'ai/ml': [
    'machine learning', 'model training', 'data labeling', 'inference',
    'natural language processing', 'computer vision', 'prediction', 'classification',
    'generative AI', 'chatbot development', 'AI automation', 'model deployment'
  ],
  'cybersecurity': [
    'threat detection', 'vulnerability scanning', 'identity management', 'encryption',
    'penetration testing', 'security monitoring', 'compliance', 'incident response',
    'access control', 'firewall management', 'endpoint protection', 'security audits'
  ],
  'cloud computing': [
    'cloud hosting', 'serverless', 'container orchestration', 'cloud storage',
    'auto-scaling', 'load balancing', 'database management', 'backup and recovery',
    'cloud migration', 'cost optimization', 'multi-cloud', 'edge computing'
  ],
  // NON-TECH INDUSTRIES
  'sportswear': [
    'running shoes', 'athletic apparel', 'sports equipment', 'workout gear',
    'training shoes', 'athletic footwear', 'sports clothing', 'fitness apparel',
    'basketball shoes', 'soccer cleats', 'gym wear', 'activewear'
  ],
  'fashion': [
    'clothing', 'apparel', 'accessories', 'shoes', 'luxury fashion',
    'streetwear', 'designer clothes', 'affordable fashion', 'sustainable fashion'
  ],
  'food & beverage': [
    'fast food', 'restaurants', 'coffee shops', 'delivery', 'beverages',
    'snacks', 'organic food', 'meal kits', 'grocery', 'drinks'
  ],
  'automotive': [
    'cars', 'vehicles', 'electric vehicles', 'SUVs', 'trucks',
    'car buying', 'auto financing', 'car maintenance', 'driving'
  ],
  'retail': [
    'online shopping', 'stores', 'products', 'deals', 'discounts',
    'home goods', 'electronics', 'shopping experience', 'customer service'
  ],
  'entertainment': [
    'streaming', 'movies', 'TV shows', 'music', 'gaming',
    'live events', 'concerts', 'sports viewing', 'content'
  ],
  'travel': [
    'flights', 'hotels', 'vacation', 'booking', 'travel deals',
    'destinations', 'travel planning', 'airlines', 'accommodations'
  ],
  'healthcare': [
    'health services', 'medical care', 'wellness', 'fitness',
    'mental health', 'telemedicine', 'health insurance', 'pharmacy'
  ],
  'banking': [
    'checking accounts', 'savings', 'loans', 'credit cards',
    'mobile banking', 'investments', 'mortgages', 'financial services'
  ],
  'default': [
    'products', 'services', 'quality', 'customer experience',
    'value', 'reliability', 'innovation', 'brand'
  ]
};

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

  // Helper to add queries from templates
  const addQueries = (templates, type, count = queriesPerType, replacements = {}) => {
    if (!templates) return;
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    for (const template of selected) {
      let queryText = template
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry)
        .replace(/{specificField}/g, specificField)
        .replace(/{targetAudience}/g, targetAudience);
      
      // Apply additional replacements
      for (const [key, value] of Object.entries(replacements)) {
        queryText = queryText.replace(new RegExp(`{${key}}`, 'g'), value);
      }
      
      queries.push({
        queryText,
        queryType: type,
        metadata: replacements
      });
    }
  };

  // ============ HIGH PRIORITY: DIRECT BRAND QUERIES ============
  // These queries DIRECTLY ask about the brand - should guarantee mentions
  
  // 1. DIRECT BRAND QUERIES - "What is {brand}?" type queries (5-6 queries)
  addQueries(QUERY_TEMPLATES.directBrand, 'directBrand', 6);
  
  // 2. BRAND OPINION QUERIES - "Should I use {brand}?" type queries (4-5 queries)
  if (mainUseCases.length > 0) {
    const useCase = mainUseCases[0];
    addQueries(QUERY_TEMPLATES.brandOpinion, 'brandOpinion', 5, { useCase });
  } else {
    addQueries(QUERY_TEMPLATES.brandOpinion, 'brandOpinion', 5, { useCase: 'my needs' });
  }

  // ============ MEDIUM PRIORITY: COMPARATIVE & DISCOVERY QUERIES ============

  // 3. DIRECT COMPETITOR COMPARISONS (up to 6 queries)
  if (topCompetitors.length > 0) {
    const competitorsToCompare = topCompetitors.slice(0, 3);
    for (const competitor of competitorsToCompare) {
      addQueries(QUERY_TEMPLATES.comparison, 'comparison', 2, { competitor });
    }
  }

  // 4. ALTERNATIVES QUERIES (3 queries)
  addQueries(QUERY_TEMPLATES.alternatives, 'alternatives', 3);

  // 5. REVIEW QUERIES (3 queries)
  addQueries(QUERY_TEMPLATES.review, 'review', 3);

  // 6. PRICING QUERIES (2 queries)
  addQueries(QUERY_TEMPLATES.pricing, 'pricing', 2);

  // ============ DISCOVERY QUERIES ============
  // Natural discovery queries - "give me some apps", "best X company"

  // 7. NATURAL DISCOVERY (5 queries) - "Give me some X apps", "Name some X tools"
  addQueries(QUERY_TEMPLATES.naturalDiscovery, 'naturalDiscovery', 5);

  // 8. BEST QUERIES (4 queries) - "What's the best X?", "Top X tools?"
  addQueries(QUERY_TEMPLATES.bestQueries, 'bestQueries', 4);

  // 9. USE CASE QUERIES (up to 3 queries)
  if (mainUseCases.length > 0) {
    const useCasesToQuery = mainUseCases.slice(0, 3);
    for (const useCase of useCasesToQuery) {
      addQueries(QUERY_TEMPLATES.useCase, 'useCase', 1, { useCase });
    }
  }

  // 10. AUDIENCE-SPECIFIC QUERIES (2 queries)
  addQueries(QUERY_TEMPLATES.audienceSpecific, 'audienceSpecific', 2);

  // 11. REGIONAL QUERIES (if region provided)
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
  
  console.log(`Generated ${result.length} unique queries for ${brand}`);
  console.log(`Query breakdown: ${result.filter(q => q.queryType === 'directBrand').length} direct brand, ${result.filter(q => q.queryType === 'brandOpinion').length} brand opinion, ${result.filter(q => q.queryType === 'naturalDiscovery').length} natural discovery`);
  return result;
}

/**
 * Generate basic queries for a brand (fallback when AI fails)
 */
function generateQueries(brand, industry = 'software', options = {}) {
  const queries = [];
  const useCases = INDUSTRY_USE_CASES[industry.toLowerCase()] || INDUSTRY_USE_CASES.default;

  // PRIORITY 1: Direct brand queries (always include these)
  const directBrandTemplates = QUERY_TEMPLATES.directBrand || [];
  for (let i = 0; i < Math.min(5, directBrandTemplates.length); i++) {
    queries.push({
      queryText: directBrandTemplates[i].replace(/{brand}/g, brand),
      queryType: 'directBrand'
    });
  }

  // PRIORITY 2: Brand opinion queries
  const brandOpinionTemplates = QUERY_TEMPLATES.brandOpinion || [];
  for (let i = 0; i < Math.min(4, brandOpinionTemplates.length); i++) {
    queries.push({
      queryText: brandOpinionTemplates[i].replace(/{brand}/g, brand),
      queryType: 'brandOpinion'
    });
  }

  // PRIORITY 3: Natural discovery queries
  const discoveryTemplates = QUERY_TEMPLATES.naturalDiscovery || [];
  for (let i = 0; i < Math.min(4, discoveryTemplates.length); i++) {
    queries.push({
      queryText: discoveryTemplates[i].replace(/{industry}/g, industry),
      queryType: 'naturalDiscovery'
    });
  }

  // PRIORITY 4: Best queries
  const bestTemplates = QUERY_TEMPLATES.bestQueries || [];
  for (let i = 0; i < Math.min(3, bestTemplates.length); i++) {
    queries.push({
      queryText: bestTemplates[i]
        .replace(/{industry}/g, industry)
        .replace(/{targetAudience}/g, 'businesses'),
      queryType: 'bestQueries'
    });
  }

  // PRIORITY 5: Alternatives and review queries
  const altTemplates = QUERY_TEMPLATES.alternatives || [];
  for (let i = 0; i < Math.min(2, altTemplates.length); i++) {
    queries.push({
      queryText: altTemplates[i].replace(/{brand}/g, brand),
      queryType: 'alternatives'
    });
  }

  const reviewTemplates = QUERY_TEMPLATES.review || [];
  for (let i = 0; i < Math.min(2, reviewTemplates.length); i++) {
    queries.push({
      queryText: reviewTemplates[i].replace(/{brand}/g, brand),
      queryType: 'review'
    });
  }

  // PRIORITY 6: Use case queries
  const useCaseTemplates = QUERY_TEMPLATES.useCase || [];
  for (let i = 0; i < Math.min(2, useCases.length); i++) {
    const template = useCaseTemplates[i % useCaseTemplates.length];
    if (template) {
      queries.push({
        queryText: template.replace(/{useCase}/g, useCases[i]),
        queryType: 'useCase'
      });
    }
  }

  return queries;
}

/**
 * Infer industry from domain name or brand
 */
function inferIndustry(domain) {
  const domainLower = domain.toLowerCase();
  
  const industryKeywords = {
    // TECH INDUSTRIES
    'crm': ['salesforce', 'hubspot', 'pipedrive', 'zoho', 'crm'],
    'marketing': ['mailchimp', 'sendgrid', 'marketo', 'buffer', 'hootsuite'],
    'ecommerce': ['shopify', 'woocommerce', 'bigcommerce', 'magento'],
    'project management': ['asana', 'trello', 'monday', 'jira', 'notion', 'clickup'],
    'analytics': ['mixpanel', 'amplitude', 'tableau', 'looker'],
    'communication': ['slack', 'discord', 'teams', 'zoom', 'meet'],
    'development': ['github', 'gitlab', 'bitbucket', 'vercel', 'netlify'],
    'design': ['figma', 'sketch', 'adobe', 'canva', 'invision'],
    'hr': ['workday', 'bamboohr', 'gusto', 'rippling', 'lever'],
    'finance': ['quickbooks', 'xero', 'stripe', 'square', 'wave', 'paypal', 'venmo'],
    'social media': ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'snapchat', 'reddit'],
    // NON-TECH INDUSTRIES
    'sportswear': ['nike', 'adidas', 'puma', 'under armour', 'reebok', 'new balance', 'asics', 'lululemon', 'fila', 'converse'],
    'fashion': ['zara', 'h&m', 'gucci', 'louis vuitton', 'prada', 'chanel', 'uniqlo', 'gap', 'levis', 'ralph lauren', 'burberry'],
    'food & beverage': ['mcdonald', 'starbucks', 'coca-cola', 'pepsi', 'burger king', 'subway', 'chipotle', 'domino', 'kfc', 'dunkin', 'wendy'],
    'automotive': ['tesla', 'toyota', 'ford', 'bmw', 'mercedes', 'honda', 'chevrolet', 'audi', 'volkswagen', 'porsche', 'ferrari', 'hyundai'],
    'retail': ['amazon', 'walmart', 'target', 'costco', 'ikea', 'home depot', 'best buy', 'ebay', 'alibaba', 'etsy'],
    'entertainment': ['netflix', 'disney', 'spotify', 'hbo', 'hulu', 'paramount', 'warner', 'sony', 'universal'],
    'travel': ['airbnb', 'booking', 'expedia', 'tripadvisor', 'marriott', 'hilton', 'united', 'delta', 'southwest', 'american airlines'],
    'healthcare': ['cvs', 'walgreens', 'unitedhealth', 'pfizer', 'johnson', 'moderna', 'aetna', 'cigna'],
    'banking': ['chase', 'bank of america', 'wells fargo', 'citi', 'capital one', 'goldman', 'morgan stanley', 'hsbc']
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(kw => domainLower.includes(kw))) {
      return industry;
    }
  }

  // Don't default to software - return null so AI can detect
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
  INDUSTRY_USE_CASES,
  TARGET_AUDIENCES,
  COMMON_FEATURES,
  COMMON_INTEGRATIONS
};
