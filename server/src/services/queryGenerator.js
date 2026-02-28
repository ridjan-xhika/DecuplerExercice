/**
 * Query Generator Service - Enhanced Version
 * Generates comprehensive user prompts to test brand visibility in AI responses
 * Inspired by Searchable, Peec AI, and BabyLoveGrowth tools
 */

const { askAllProviders } = require('./aiClient');

// Comprehensive query templates by category
const QUERY_TEMPLATES = {
  // === COMPARISON QUERIES ===
  generalComparison: [
    "What's the difference between {brand} and its competitors?",
    "How does {brand} compare to other {industry} tools?",
    "{brand} vs competitors: which one should I choose?",
    "Is {brand} better than alternatives in {industry}?",
    "Compare {brand} with similar {industry} solutions",
    "How does {brand} stack up against the competition?",
    "{brand} comparison with top {industry} tools 2025"
  ],
  
  directComparison: [
    "{brand} vs {competitor}: which is better?",
    "Should I choose {brand} or {competitor}?",
    "{brand} compared to {competitor} for {useCase}",
    "Differences between {brand} and {competitor}",
    "Is {brand} better than {competitor} for {industry}?",
    "{brand} or {competitor}: pros and cons",
    "Which is more reliable: {brand} or {competitor}?",
    "{brand} vs {competitor} pricing comparison",
    "{brand} vs {competitor} features comparison 2025"
  ],
  
  // === ALTERNATIVES & SWITCHING ===
  alternatives: [
    "What are the best alternatives to {brand}?",
    "Tools similar to {brand} for {industry}",
    "What can I use instead of {brand}?",
    "{brand} alternatives in 2025",
    "Better options than {brand} for {industry}",
    "Top {brand} competitors to consider",
    "Cheaper alternatives to {brand}",
    "Free alternatives to {brand}",
    "Best {brand} replacement for {targetAudience}"
  ],
  
  switching: [
    "Should I switch from {competitor} to {brand}?",
    "Is it worth switching to {brand}?",
    "Switching from {competitor} to {brand}: what to know",
    "How to migrate from {competitor} to {brand}",
    "{brand} migration guide from {competitor}"
  ],
  
  // === RECOMMENDATION QUERIES ===
  recommendation: [
    "What's the best {industry} tool in 2025?",
    "Which {industry} platform do you recommend?",
    "Top {industry} solutions for businesses",
    "Best {industry} software for {targetAudience}",
    "What {industry} tool should I use?",
    "Recommend a good {industry} platform",
    "What's the most popular {industry} software?",
    "Best {industry} for my needs",
    "Which {industry} platform is easiest to use?"
  ],
  
  audienceSpecific: [
    "Best {industry} for startups",
    "Best {industry} for small business",
    "Best {industry} for enterprise companies",
    "Best {industry} for freelancers",
    "Best {industry} for agencies",
    "Best {industry} for developers",
    "Best {industry} for non-technical users",
    "Best {industry} for beginners in 2025"
  ],
  
  useCaseSpecific: [
    "Best tool for {useCase}",
    "What {industry} software is best for {useCase}?",
    "Recommended platform for {useCase}",
    "Which {industry} solution handles {useCase} best?",
    "How to {useCase} effectively",
    "Best way to {useCase} in 2025",
    "Tools for {useCase} - what do experts recommend?"
  ],
  
  // === REVIEW & OPINION QUERIES ===
  review: [
    "Is {brand} worth it?",
    "What do people think about {brand}?",
    "{brand} honest review 2025",
    "Pros and cons of {brand}",
    "Should I use {brand} for my business?",
    "{brand} review: is it any good?",
    "Is {brand} legit?",
    "What are the downsides of {brand}?",
    "{brand} user reviews and experiences"
  ],
  
  reputation: [
    "Is {brand} reliable?",
    "Is {brand} trustworthy?",
    "What's the reputation of {brand}?",
    "How good is {brand}'s customer support?",
    "Does {brand} have good reviews?",
    "Is {brand} worth the money?",
    "What do customers say about {brand}?"
  ],
  
  // === PRICING & VALUE QUERIES ===
  pricing: [
    "How much does {brand} cost?",
    "Is {brand} expensive?",
    "{brand} pricing plans 2025",
    "Is {brand} free to use?",
    "{brand} free trial available?",
    "Best value {industry} tool",
    "Affordable {industry} alternatives",
    "{brand} vs {competitor} pricing",
    "Is {brand} worth the price?"
  ],
  
  // === BEST-OF & LIST QUERIES ===
  bestOf: [
    "Best {industry} tools in 2025",
    "Top 10 {industry} platforms",
    "Most popular {industry} solutions",
    "Leading {industry} companies",
    "Best {industry} software for small business",
    "Top rated {industry} tools",
    "Best {industry} apps in 2025",
    "Most recommended {industry} platforms",
    "Industry leaders in {industry}"
  ],
  
  rankings: [
    "What's the #1 {industry} tool?",
    "Top {industry} tools ranked",
    "Best {industry} by user ratings",
    "Most used {industry} platforms",
    "What {industry} tool has the best reviews?",
    "Highest rated {industry} software 2025"
  ],
  
  // === MARKET & INDUSTRY QUERIES ===
  market: [
    "Who are the leaders in {industry}?",
    "Market leaders in {specificField}",
    "Top companies in {specificField} space",
    "Best {specificField} providers in 2025",
    "Who dominates the {industry} market?",
    "Biggest {industry} companies",
    "Most successful {industry} startups",
    "Emerging {industry} tools to watch"
  ],
  
  // === FEATURES & CAPABILITIES ===
  features: [
    "What features does {brand} offer?",
    "Does {brand} have {feature}?",
    "{brand} key features",
    "What makes {brand} unique?",
    "Best features of {brand}",
    "What can {brand} do?",
    "{brand} capabilities overview",
    "Is {brand} good for {useCase}?"
  ],
  
  integration: [
    "Does {brand} integrate with other tools?",
    "{brand} integrations list",
    "Can {brand} connect to {integration}?",
    "Best {industry} with good integrations",
    "Does {brand} have an API?"
  ],
  
  // === SPECIFIC PROBLEM-SOLVING ===
  problemSolving: [
    "How do I {useCase}?",
    "Best way to handle {useCase}",
    "Tools for solving {useCase}",
    "How to improve {useCase}",
    "What's the best approach for {useCase}?"
  ],
  
  // === DISCOVERY QUERIES (how users find new tools) ===
  discovery: [
    "What {industry} tools are trending?",
    "New {industry} platforms in 2025",
    "Underrated {industry} tools",
    "Hidden gems in {industry}",
    "What {industry} tool should I try?",
    "Best new {industry} startups",
    "{industry} tools you haven't heard of"
  ],

  // === REGIONAL QUERIES ===
  regional: [
    "Best {industry} in {region}",
    "Top {industry} tools for {region}",
    "{industry} platforms popular in {region}",
    "Is {brand} available in {region}?",
    "Best {industry} for {region} businesses"
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
  'default': [
    'workflow automation', 'team productivity', 'business operations', 
    'data management', 'collaboration', 'reporting', 'process optimization',
    'integration', 'automation', 'efficiency improvement'
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
    // Fallback to basic generation
    const detectedIndustry = industry || inferIndustry(brand);
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
  const { queriesPerType = 3, maxTotalQueries = 35 } = options;
  const queries = [];
  
  const {
    industry = 'software',
    specificField = industry,
    targetAudience = 'businesses',
    mainUseCases = [],
    topCompetitors = [],
    keyFeatures = [],
    region = null
  } = analysis;

  // Helper to add queries from templates
  const addQueries = (templates, type, count = queriesPerType, replacements = {}) => {
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

  // 1. DIRECT COMPETITOR COMPARISONS - Very important for visibility
  if (topCompetitors.length > 0) {
    const competitorsToCompare = topCompetitors.slice(0, 5);
    for (const competitor of competitorsToCompare) {
      const useCase = mainUseCases[Math.floor(Math.random() * mainUseCases.length)] || 'business needs';
      addQueries(QUERY_TEMPLATES.directComparison, 'directComparison', 2, { 
        competitor, 
        useCase 
      });
    }
  }

  // 2. SWITCHING QUERIES - Good for competitor positioning
  if (topCompetitors.length > 0) {
    const mainCompetitors = topCompetitors.slice(0, 2);
    for (const competitor of mainCompetitors) {
      addQueries(QUERY_TEMPLATES.switching, 'switching', 1, { competitor });
    }
  }

  // 3. GENERAL COMPARISONS
  addQueries(QUERY_TEMPLATES.generalComparison, 'comparison', queriesPerType);

  // 4. ALTERNATIVES QUERIES
  addQueries(QUERY_TEMPLATES.alternatives, 'alternatives', queriesPerType);

  // 5. RECOMMENDATION QUERIES
  addQueries(QUERY_TEMPLATES.recommendation, 'recommendation', queriesPerType);

  // 6. AUDIENCE-SPECIFIC QUERIES
  addQueries(QUERY_TEMPLATES.audienceSpecific, 'audienceSpecific', queriesPerType);

  // 7. USE CASE SPECIFIC QUERIES - Using actual use cases from analysis
  if (mainUseCases.length > 0) {
    const useCasesToQuery = mainUseCases.slice(0, 4);
    for (const useCase of useCasesToQuery) {
      addQueries(QUERY_TEMPLATES.useCaseSpecific, 'useCaseSpecific', 1, { useCase });
    }
  }

  // 8. REVIEW & REPUTATION QUERIES
  addQueries(QUERY_TEMPLATES.review, 'review', queriesPerType);
  addQueries(QUERY_TEMPLATES.reputation, 'reputation', 2);

  // 9. PRICING QUERIES
  if (topCompetitors.length > 0) {
    const competitor = topCompetitors[0];
    addQueries(QUERY_TEMPLATES.pricing, 'pricing', queriesPerType, { competitor });
  } else {
    addQueries(QUERY_TEMPLATES.pricing, 'pricing', queriesPerType);
  }

  // 10. BEST-OF & RANKINGS QUERIES
  addQueries(QUERY_TEMPLATES.bestOf, 'bestOf', queriesPerType);
  addQueries(QUERY_TEMPLATES.rankings, 'rankings', 2);

  // 11. MARKET & INDUSTRY QUERIES
  addQueries(QUERY_TEMPLATES.market, 'market', 2);

  // 12. FEATURES QUERIES
  if (keyFeatures && keyFeatures.length > 0) {
    const featuresToQuery = keyFeatures.slice(0, 2);
    for (const feature of featuresToQuery) {
      addQueries(QUERY_TEMPLATES.features, 'features', 1, { feature });
    }
  } else {
    addQueries(QUERY_TEMPLATES.features, 'features', 2);
  }

  // 13. INTEGRATION QUERIES
  const integration = COMMON_INTEGRATIONS[Math.floor(Math.random() * COMMON_INTEGRATIONS.length)];
  addQueries(QUERY_TEMPLATES.integration, 'integration', 2, { integration });

  // 14. PROBLEM-SOLVING QUERIES
  if (mainUseCases.length > 0) {
    const useCase = mainUseCases[0];
    addQueries(QUERY_TEMPLATES.problemSolving, 'problemSolving', 2, { useCase });
  }

  // 15. DISCOVERY QUERIES
  addQueries(QUERY_TEMPLATES.discovery, 'discovery', 2);

  // 16. REGIONAL QUERIES (if region provided)
  if (region) {
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

  // Shuffle for variety and limit total
  const shuffled = uniqueQueries.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, maxTotalQueries);
  
  console.log(`Generated ${result.length} unique queries for ${brand}`);
  return result;
}

/**
 * Generate basic queries for a brand (fallback when AI fails)
 */
function generateQueries(brand, industry = 'software', options = {}) {
  const {
    queriesPerType = 2,
    includeTypes = ['generalComparison', 'alternatives', 'recommendation', 'review', 'bestOf', 'pricing'],
    includeUseCases = true
  } = options;

  const queries = [];
  const useCases = INDUSTRY_USE_CASES[industry.toLowerCase()] || INDUSTRY_USE_CASES.default;

  // Generate queries for each type
  for (const type of includeTypes) {
    const templates = QUERY_TEMPLATES[type];
    if (!templates) continue;

    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, queriesPerType);

    for (const template of selected) {
      const queryText = template
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry)
        .replace(/{targetAudience}/g, 'businesses');

      queries.push({
        queryText,
        queryType: type
      });
    }
  }

  // Add use case queries
  if (includeUseCases) {
    const useCaseQueries = useCases.slice(0, 3).map(useCase => {
      const templates = QUERY_TEMPLATES.useCaseSpecific;
      const template = templates[Math.floor(Math.random() * templates.length)];
      return {
        queryText: template
          .replace(/{brand}/g, brand)
          .replace(/{industry}/g, industry)
          .replace(/{useCase}/g, useCase),
        queryType: 'useCaseSpecific'
      };
    });
    queries.push(...useCaseQueries);
  }

  return queries;
}

/**
 * Infer industry from domain name or brand
 */
function inferIndustry(domain) {
  const domainLower = domain.toLowerCase();
  
  const industryKeywords = {
    'crm': ['salesforce', 'hubspot', 'pipedrive', 'zoho', 'crm'],
    'marketing': ['mailchimp', 'sendgrid', 'marketo', 'buffer', 'hootsuite'],
    'ecommerce': ['shopify', 'woocommerce', 'bigcommerce', 'magento', 'store'],
    'project management': ['asana', 'trello', 'monday', 'jira', 'notion', 'clickup'],
    'analytics': ['google analytics', 'mixpanel', 'amplitude', 'tableau', 'looker'],
    'communication': ['slack', 'discord', 'teams', 'zoom', 'meet'],
    'development': ['github', 'gitlab', 'bitbucket', 'vercel', 'netlify'],
    'design': ['figma', 'sketch', 'adobe', 'canva', 'invision'],
    'hr': ['workday', 'bamboohr', 'gusto', 'rippling', 'lever'],
    'finance': ['quickbooks', 'xero', 'stripe', 'square', 'wave'],
    'social media': ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(kw => domainLower.includes(kw))) {
      return industry;
    }
  }

  return 'software';
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
