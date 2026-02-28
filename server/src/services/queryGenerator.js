/**
 * Query Generator Service
 * Generates realistic user prompts to test brand visibility in AI responses
 */

// Query templates by type
const QUERY_TEMPLATES = {
  comparison: [
    "What's the difference between {brand} and its competitors?",
    "How does {brand} compare to other {industry} tools?",
    "{brand} vs competitors: which one should I choose?",
    "Is {brand} better than alternatives in {industry}?",
    "Compare {brand} with similar {industry} solutions"
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
  'default': ['workflow automation', 'team productivity', 'business operations', 'data management']
};

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
  inferIndustry,
  QUERY_TEMPLATES,
  INDUSTRY_USE_CASES
};
