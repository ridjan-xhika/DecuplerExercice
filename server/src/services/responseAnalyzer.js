/**
 * Response Analyzer Service
 * Detects brand mentions, positions, and competitors in AI responses
 */

const { BrandMention, Competitor } = require('../models');

// Common software/tech brands to detect as potential competitors
const KNOWN_BRANDS = [
  'salesforce', 'hubspot', 'zoho', 'pipedrive', 'monday', 'asana', 'trello',
  'jira', 'notion', 'clickup', 'slack', 'microsoft teams', 'zoom', 'google meet',
  'shopify', 'woocommerce', 'bigcommerce', 'magento', 'squarespace', 'wix',
  'mailchimp', 'sendgrid', 'klaviyo', 'constant contact', 'activecampaign',
  'stripe', 'paypal', 'square', 'quickbooks', 'xero', 'freshbooks',
  'zendesk', 'freshdesk', 'intercom', 'drift', 'crisp',
  'ahrefs', 'semrush', 'moz', 'screaming frog', 'surfer seo',
  'figma', 'sketch', 'adobe xd', 'canva', 'invision',
  'github', 'gitlab', 'bitbucket', 'aws', 'azure', 'google cloud',
  'vercel', 'netlify', 'heroku', 'digitalocean', 'cloudflare',
  'datadog', 'new relic', 'splunk', 'grafana', 'prometheus',
  'tableau', 'power bi', 'looker', 'metabase', 'amplitude', 'mixpanel',
  'twilio', 'messagebird', 'vonage', 'plivo',
  'segment', 'heap', 'hotjar', 'fullstory', 'crazy egg'
];

/**
 * Find all brand mentions in text
 * @param {string} text - The response text to analyze
 * @param {string} targetBrand - The brand we're tracking
 * @returns {Array} Array of mentions with positions
 */
function findBrandMentions(text, targetBrand) {
  const normalizedText = text.toLowerCase();
  const mentions = [];
  let position = 1;

  // Combine known brands with target brand
  const brandsToFind = [...new Set([targetBrand.toLowerCase(), ...KNOWN_BRANDS])];

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
async function analyzeAllResponses(responses, targetBrand) {
  const results = {
    totalResponses: responses.length,
    responsesWithTarget: 0,
    totalMentions: 0,
    top1Count: 0,
    top3Count: 0,
    competitorCounts: {},
    analyses: []
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
  KNOWN_BRANDS
};
