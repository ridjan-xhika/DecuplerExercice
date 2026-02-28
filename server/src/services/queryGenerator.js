/**
 * Query Generator Service
 * Generates realistic user prompts to test brand visibility in AI responses
 * Now includes AI-powered industry detection and competitor-aware queries
 */

const { askAllProviders } = require('./aiClient');

// Query templates by type
const QUERY_TEMPLATES = {
  comparison: [
    "What's the difference between {brand} and its competitors?",
    "How does {brand} compare to other {industry} tools?",
    "{brand} vs competitors: which one should I choose?",
    "Is {brand} better than alternatives in {industry}?",
    "Compare {brand} with similar {industry} solutions"
  ],
  
  // Direct competitor comparisons - filled dynamically
  directComparison: [
    "{brand} vs {competitor}: which is better?",
    "Should I choose {brand} or {competitor}?",
    "{brand} compared to {competitor} for {useCase}",
    "Differences between {brand} and {competitor}",
    "Is {brand} better than {competitor} for {industry}?"
  ],
  
  alternatives: [
    "What are the best alternatives to {brand}?",
    "Tools similar to {brand} for {industry}",
    "What can I use instead of {brand}?",
    "{brand} alternatives in 2026",
    "Better options than {brand} for {industry}"
  ],
  
  recommendation: [
    "What's the best {industry} tool in 2026?",
    "Which {industry} platform do you recommend?",
    "Top {industry} solutions for businesses",
    "Best {industry} software for startups",
    "What {industry} tool should I use?"
  ],
  
  // Industry-specific recommendation queries
  industrySpecific: [
    "Best tool for {specificUseCase}",
    "What {industry} software is best for {specificUseCase}?",
    "Recommended {industry} platform for {targetAudience}",
    "Which {industry} solution handles {specificUseCase} best?",
    "Top rated {industry} tools for {targetAudience}"
  ],
  
  review: [
    "Is {brand} worth it?",
    "What do people think about {brand}?",
    "{brand} honest review",
    "Pros and cons of {brand}",
    "Should I use {brand} for my business?"
  ],
  
  useCase: [
    "Best tool for {useCase} in {industry}",
    "What should I use for {useCase}?",
    "Recommended solution for {useCase}",
    "{industry} tool for {useCase}",
    "How to solve {useCase} problem?"
  ],
  
  bestOf: [
    "Best {industry} tools in 2026",
    "Top 10 {industry} platforms",
    "Most popular {industry} solutions",
    "Leading {industry} companies",
    "Best {industry} for small business"
  ],
  
  // Market-specific queries
  marketQueries: [
    "Who are the leaders in {industry}?",
    "Market leaders in {specificField}",
    "Top companies in {specificField} space",
    "Best {specificField} providers in 2026",
    "Who dominates the {industry} market?"
  ]
};

// Common use cases by industry
const INDUSTRY_USE_CASES = {
  'crm': ['sales tracking', 'customer management', 'lead generation', 'pipeline management'],
  'marketing': ['email campaigns', 'social media management', 'content creation', 'analytics'],
  'ecommerce': ['online store', 'payment processing', 'inventory management', 'dropshipping'],
  'project management': ['team collaboration', 'task tracking', 'agile workflows', 'resource planning'],
  'analytics': ['data visualization', 'reporting', 'business intelligence', 'metrics tracking'],
  'communication': ['team chat', 'video conferencing', 'async communication', 'file sharing'],
  'development': ['code hosting', 'CI/CD', 'code review', 'deployment'],
  'design': ['UI design', 'prototyping', 'collaboration', 'asset management'],
  'hr': ['recruiting', 'onboarding', 'performance reviews', 'payroll'],
  'finance': ['invoicing', 'expense tracking', 'accounting', 'budgeting'],
  'social media': ['social networking', 'content sharing', 'community building', 'advertising'],
  'cloud computing': ['cloud hosting', 'serverless', 'container orchestration', 'cloud storage'],
  'cybersecurity': ['threat detection', 'vulnerability scanning', 'identity management', 'encryption'],
  'ai/ml': ['machine learning', 'natural language processing', 'computer vision', 'model training'],
  'default': ['workflow automation', 'team productivity', 'business operations', 'data management']
};

/**
 * Use AI to analyze a brand/company and get detailed industry info
 * @param {string} brand - The brand/domain name
 * @returns {object} Industry analysis with competitors and use cases
 */
async function analyzeCompanyWithAI(brand) {
  const prompt = `Analyze the company/brand "${brand}" and provide the following information in JSON format:

{
  "industry": "the primary industry/field (e.g., 'CRM', 'Project Management', 'E-commerce')",
  "specificField": "more specific niche (e.g., 'Sales CRM', 'Agile Project Management')",
  "description": "brief 1-sentence description of what they do",
  "targetAudience": "primary target customers (e.g., 'small businesses', 'enterprise', 'developers')",
  "mainUseCases": ["list of 3-5 main use cases their product addresses"],
  "topCompetitors": ["list of 5-8 direct competitors in the same space"],
  "competitiveAdvantages": ["what they're known for or do well"]
}

Only respond with the JSON, no other text.`;

  try {
    const results = await askAllProviders(prompt);
    
    // Find the first successful response
    const successfulResult = results.find(r => r.success);
    if (!successfulResult) {
      console.log('AI analysis failed, using fallback');
      return null;
    }

    // Parse the JSON response
    const responseText = successfulResult.responseText;
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
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
 * @param {object} options - Generation options
 * @returns {Array} Array of query objects
 */
async function generateQueriesWithAI(brand, industry = null, options = {}) {
  const {
    queriesPerType = 2,
    maxTotalQueries = 20
  } = options;

  // First, analyze the company with AI
  const aiAnalysis = await analyzeCompanyWithAI(brand);
  
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
 * @param {string} brand - The brand name
 * @param {object} analysis - AI analysis results
 * @param {object} options - Generation options
 * @returns {Array} Array of query objects
 */
function generateEnhancedQueries(brand, analysis, options = {}) {
  const { queriesPerType = 2, maxTotalQueries = 20 } = options;
  const queries = [];
  
  const {
    industry = 'software',
    specificField = industry,
    targetAudience = 'businesses',
    mainUseCases = [],
    topCompetitors = []
  } = analysis;

  // 1. Direct competitor comparison queries
  if (topCompetitors.length > 0) {
    const competitorQueries = topCompetitors.slice(0, 3).map(competitor => {
      const template = QUERY_TEMPLATES.directComparison[
        Math.floor(Math.random() * QUERY_TEMPLATES.directComparison.length)
      ];
      const useCase = mainUseCases[0] || 'business needs';
      
      return {
        queryText: template
          .replace(/{brand}/g, brand)
          .replace(/{competitor}/g, competitor)
          .replace(/{industry}/g, industry)
          .replace(/{useCase}/g, useCase),
        queryType: 'directComparison',
        metadata: { competitor }
      };
    });
    queries.push(...competitorQueries);
  }

  // 2. Industry-specific queries using the specific field
  const industrySpecificTemplates = QUERY_TEMPLATES.industrySpecific;
  for (let i = 0; i < Math.min(queriesPerType, industrySpecificTemplates.length); i++) {
    const template = industrySpecificTemplates[i];
    const useCase = mainUseCases[i % mainUseCases.length] || 'general use';
    
    queries.push({
      queryText: template
        .replace(/{industry}/g, industry)
        .replace(/{specificField}/g, specificField)
        .replace(/{specificUseCase}/g, useCase)
        .replace(/{targetAudience}/g, targetAudience),
      queryType: 'industrySpecific'
    });
  }

  // 3. Market leader queries
  const marketTemplates = QUERY_TEMPLATES.marketQueries;
  for (let i = 0; i < Math.min(queriesPerType, marketTemplates.length); i++) {
    queries.push({
      queryText: marketTemplates[i]
        .replace(/{industry}/g, industry)
        .replace(/{specificField}/g, specificField),
      queryType: 'marketQuery'
    });
  }

  // 4. Standard comparison queries
  const comparisonTemplates = QUERY_TEMPLATES.comparison;
  for (let i = 0; i < Math.min(queriesPerType, comparisonTemplates.length); i++) {
    queries.push({
      queryText: comparisonTemplates[i]
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry),
      queryType: 'comparison'
    });
  }

  // 5. Alternatives queries
  const altTemplates = QUERY_TEMPLATES.alternatives;
  for (let i = 0; i < Math.min(queriesPerType, altTemplates.length); i++) {
    queries.push({
      queryText: altTemplates[i]
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry),
      queryType: 'alternatives'
    });
  }

  // 6. Best-of queries for the specific field
  const bestOfTemplates = QUERY_TEMPLATES.bestOf;
  for (let i = 0; i < Math.min(queriesPerType, bestOfTemplates.length); i++) {
    queries.push({
      queryText: bestOfTemplates[i]
        .replace(/{industry}/g, specificField), // Use specific field for more targeted results
      queryType: 'bestOf'
    });
  }

  // 7. Use case queries with actual use cases from analysis
  if (mainUseCases.length > 0) {
    const useCaseTemplates = QUERY_TEMPLATES.useCase;
    mainUseCases.slice(0, 3).forEach(useCase => {
      const template = useCaseTemplates[Math.floor(Math.random() * useCaseTemplates.length)];
      queries.push({
        queryText: template
          .replace(/{brand}/g, brand)
          .replace(/{industry}/g, industry)
          .replace(/{useCase}/g, useCase),
        queryType: 'useCase'
      });
    });
  }

  // 8. Review queries
  const reviewTemplates = QUERY_TEMPLATES.review;
  for (let i = 0; i < Math.min(queriesPerType, reviewTemplates.length); i++) {
    queries.push({
      queryText: reviewTemplates[i].replace(/{brand}/g, brand),
      queryType: 'review'
    });
  }

  // Limit total queries and shuffle for variety
  const shuffled = queries.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxTotalQueries);
}

/**
 * Generate queries for a brand
 * @param {string} brand - The brand/domain name
 * @param {string} industry - The industry (optional)
 * @param {object} options - Generation options
 * @returns {Array} Array of query objects
 */
function generateQueries(brand, industry = 'software', options = {}) {
  const {
    queriesPerType = 2,
    includeTypes = ['comparison', 'alternatives', 'recommendation', 'review', 'bestOf'],
    includeUseCases = true
  } = options;

  const queries = [];
  const useCases = INDUSTRY_USE_CASES[industry.toLowerCase()] || INDUSTRY_USE_CASES.default;

  // Generate queries for each type
  for (const type of includeTypes) {
    const templates = QUERY_TEMPLATES[type];
    if (!templates) continue;

    // Shuffle and pick templates
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, queriesPerType);

    for (const template of selected) {
      const queryText = template
        .replace(/{brand}/g, brand)
        .replace(/{industry}/g, industry);

      queries.push({
        queryText,
        queryType: type
      });
    }
  }

  // Add use case queries
  if (includeUseCases && QUERY_TEMPLATES.useCase) {
    const useCaseQueries = useCases.slice(0, 2).map(useCase => {
      const template = QUERY_TEMPLATES.useCase[Math.floor(Math.random() * QUERY_TEMPLATES.useCase.length)];
      return {
        queryText: template
          .replace(/{brand}/g, brand)
          .replace(/{industry}/g, industry)
          .replace(/{useCase}/g, useCase),
        queryType: 'useCase'
      };
    });
    queries.push(...useCaseQueries);
  }

  return queries;
}

/**
 * Infer industry from domain name or brand
 * @param {string} domain - Domain or brand name
 * @returns {string} Inferred industry
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
    'finance': ['quickbooks', 'xero', 'stripe', 'square', 'wave']
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(kw => domainLower.includes(kw))) {
      return industry;
    }
  }

  return 'software';
}

module.exports = {
  generateQueries,
  generateQueriesWithAI,
  analyzeCompanyWithAI,
  generateEnhancedQueries,
  inferIndustry,
  QUERY_TEMPLATES,
  INDUSTRY_USE_CASES
};
