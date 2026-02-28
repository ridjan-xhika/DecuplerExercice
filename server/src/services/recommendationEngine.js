/**
 * Recommendation Engine
 * Generates actionable recommendations to improve AI visibility
 */

const { Recommendation } = require('../models');

/**
 * Recommendation templates by category
 */
const RECOMMENDATION_TEMPLATES = {
  notMentioned: {
    type: 'visibility_gap',
    priority: 'high',
    title: 'Increase Brand Awareness in AI Training Data',
    description: 'Your brand was not mentioned in {percentage}% of AI responses. To improve visibility:\n' +
      '• Create more authoritative content that clearly positions your brand\n' +
      '• Ensure your brand appears in comparison articles and "best of" lists\n' +
      '• Build citations and mentions on high-authority industry sites\n' +
      '• Develop case studies and customer testimonials that mention your brand by name'
  },

  lowPosition: {
    type: 'positioning',
    priority: 'high',
    title: 'Improve Brand Positioning in AI Responses',
    description: 'Your average mention position is {position}. Competitors are often cited before you. To improve:\n' +
      '• Strengthen your brand\'s association with key use cases\n' +
      '• Create definitive guides that establish thought leadership\n' +
      '• Get featured in more industry comparisons and reviews\n' +
      '• Build stronger backlinks from authoritative sources'
  },

  competitorDominance: {
    type: 'competitor_gap',
    priority: 'high',
    title: 'Address Competitor Dominance: {competitor}',
    description: '{competitor} appears before your brand in {count} responses. To compete:\n' +
      '• Analyze what content makes {competitor} visible and create better alternatives\n' +
      '• Target the same keywords and topics with superior content\n' +
      '• Highlight your unique differentiators vs {competitor}\n' +
      '• Create direct comparison content showing your advantages'
  },

  lowMentionRate: {
    type: 'content',
    priority: 'medium',
    title: 'Increase Content Coverage',
    description: 'Your brand is only mentioned in {rate}% of relevant queries. To improve:\n' +
      '• Expand content to cover more use cases and topics\n' +
      '• Create FAQ content that answers common industry questions\n' +
      '• Develop comprehensive resource pages and guides\n' +
      '• Ensure consistent NAP (Name, Address, Phone) across all platforms'
  },

  noTop1: {
    type: 'positioning',
    priority: 'medium',
    title: 'Aim for Top Position in AI Responses',
    description: 'Your brand never appears as the first recommendation. To achieve top position:\n' +
      '• Become the definitive authority in your niche\n' +
      '• Create the most comprehensive and helpful content\n' +
      '• Build strong brand recognition through consistent messaging\n' +
      '• Focus on being the "default" answer for specific use cases'
  },

  moderateScore: {
    type: 'general',
    priority: 'medium',
    title: 'Strengthen Overall AI Visibility',
    description: 'Your visibility score of {score} indicates room for improvement:\n' +
      '• Audit your existing content for AI-friendliness\n' +
      '• Ensure your brand name appears naturally in key content\n' +
      '• Build more structured data and clear product descriptions\n' +
      '• Create content that directly answers user questions'
  },

  goodMaintenance: {
    type: 'maintenance',
    priority: 'low',
    title: 'Maintain Your Strong Visibility',
    description: 'Your brand has good visibility. To maintain and improve:\n' +
      '• Continue creating fresh, authoritative content\n' +
      '• Monitor competitors for new strategies\n' +
      '• Track visibility scores regularly\n' +
      '• Stay active in industry discussions and publications'
  },

  scoreDrop: {
    type: 'alert',
    priority: 'high',
    title: 'Visibility Score Declined',
    description: 'Your visibility score dropped by {change} points. Possible causes:\n' +
      '• New competitors entered the market\n' +
      '• AI models updated their training data\n' +
      '• Competitor content improvements\n' +
      'Action: Review recent competitor activities and update your content strategy.'
  }
};

/**
 * Generate recommendations based on analysis results and score
 * @param {object} analysisResults - Results from analyzeAllResponses
 * @param {object} scoreData - Results from calculateAndSaveScore
 * @param {object} trend - Score trend data
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(analysisResults, scoreData, trend = null) {
  const recommendations = [];
  const { stats, score } = scoreData;

  // Check for visibility gaps
  if (stats.mentionRate < 50) {
    recommendations.push({
      ...RECOMMENDATION_TEMPLATES.notMentioned,
      description: RECOMMENDATION_TEMPLATES.notMentioned.description
        .replace('{percentage}', 100 - stats.mentionRate)
    });
  }

  // Check for low positioning
  if (stats.avgPosition && stats.avgPosition > 2) {
    recommendations.push({
      ...RECOMMENDATION_TEMPLATES.lowPosition,
      description: RECOMMENDATION_TEMPLATES.lowPosition.description
        .replace('{position}', stats.avgPosition.toFixed(1))
    });
  }

  // Check for dominant competitors
  if (analysisResults.topCompetitors && analysisResults.topCompetitors.length > 0) {
    const topCompetitor = analysisResults.topCompetitors[0];
    if (topCompetitor.count >= analysisResults.totalResponses * 0.3) {
      recommendations.push({
        ...RECOMMENDATION_TEMPLATES.competitorDominance,
        title: RECOMMENDATION_TEMPLATES.competitorDominance.title
          .replace('{competitor}', topCompetitor.name),
        description: RECOMMENDATION_TEMPLATES.competitorDominance.description
          .replace(/{competitor}/g, topCompetitor.name)
          .replace('{count}', topCompetitor.count)
      });
    }
  }

  // Check for low mention rate
  if (stats.mentionRate > 0 && stats.mentionRate < 70) {
    recommendations.push({
      ...RECOMMENDATION_TEMPLATES.lowMentionRate,
      description: RECOMMENDATION_TEMPLATES.lowMentionRate.description
        .replace('{rate}', stats.mentionRate)
    });
  }

  // Check for no top 1 positions
  if (stats.top1Count === 0 && stats.totalMentions > 0) {
    recommendations.push(RECOMMENDATION_TEMPLATES.noTop1);
  }

  // Score-based recommendations
  if (score >= 60 && score < 80) {
    recommendations.push({
      ...RECOMMENDATION_TEMPLATES.moderateScore,
      description: RECOMMENDATION_TEMPLATES.moderateScore.description
        .replace('{score}', score)
    });
  } else if (score >= 80) {
    recommendations.push(RECOMMENDATION_TEMPLATES.goodMaintenance);
  }

  // Check for score drop
  if (trend && trend.change !== null && trend.change < -5) {
    recommendations.push({
      ...RECOMMENDATION_TEMPLATES.scoreDrop,
      description: RECOMMENDATION_TEMPLATES.scoreDrop.description
        .replace('{change}', Math.abs(trend.change).toFixed(1))
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate and save recommendations for a domain
 * @param {number} domainId - The domain ID
 * @param {number} scoreId - The visibility score ID
 * @param {object} analysisResults - Analysis results
 * @param {object} scoreData - Score data
 * @param {object} trend - Score trend
 * @returns {Array} Saved recommendations
 */
async function generateAndSaveRecommendations(domainId, scoreId, analysisResults, scoreData, trend = null) {
  const recommendations = generateRecommendations(analysisResults, scoreData, trend);

  // Save each recommendation
  const savedRecommendations = [];
  for (const rec of recommendations) {
    const saved = await Recommendation.create(domainId, {
      scoreId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      priority: rec.priority
    });
    savedRecommendations.push(saved);
  }

  return savedRecommendations;
}

/**
 * Get latest recommendations for a domain
 * @param {number} domainId - The domain ID
 * @returns {Array} Recommendations
 */
async function getRecommendations(domainId) {
  return await Recommendation.findByDomainId(domainId);
}

module.exports = {
  generateRecommendations,
  generateAndSaveRecommendations,
  getRecommendations,
  RECOMMENDATION_TEMPLATES
};
