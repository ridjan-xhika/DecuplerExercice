/**
 * Recommendation Engine
 * Generates actionable recommendations to improve AI visibility
 */

const { Recommendation } = require('../models');
const { askAllProviders } = require('./aiClient');

/**
 * Detailed action steps for each recommendation type
 */
const ACTION_STEPS = {
  visibility_gap: [
    {
      step: 1,
      action: 'Audit your existing content',
      details: 'Review all your website pages, blog posts, and marketing materials. Identify pages where your brand name is missing or unclear.',
      timeframe: '1-2 days'
    },
    {
      step: 2,
      action: 'Create authoritative "What is [Brand]" content',
      details: 'Write a comprehensive page that clearly explains what your brand does, who it\'s for, and why it\'s unique. Use structured data markup.',
      timeframe: '3-5 days'
    },
    {
      step: 3,
      action: 'Get featured in comparison articles',
      details: 'Reach out to industry bloggers and reviewers. Offer product demos for "Top 10" or "Best of" articles in your niche.',
      timeframe: '2-4 weeks'
    },
    {
      step: 4,
      action: 'Build citations on authority sites',
      details: 'Submit your brand to industry directories, get mentioned in Wikipedia (if notable), and contribute guest posts to high-DA sites.',
      timeframe: 'Ongoing'
    },
    {
      step: 5,
      action: 'Create customer success stories',
      details: 'Publish 3-5 detailed case studies with customer names, metrics, and quotes that naturally mention your brand.',
      timeframe: '2-3 weeks'
    }
  ],

  positioning: [
    {
      step: 1,
      action: 'Identify your unique value proposition',
      details: 'Define 2-3 specific things your brand does better than competitors. These should be concrete and verifiable.',
      timeframe: '1-2 days'
    },
    {
      step: 2,
      action: 'Create definitive guide content',
      details: 'Write the most comprehensive guide in your niche (3000+ words). Include original data, expert quotes, and actionable advice.',
      timeframe: '1-2 weeks'
    },
    {
      step: 3,
      action: 'Build topic clusters around your expertise',
      details: 'Create 5-10 interlinked pages covering different aspects of your core topic, with your brand as the central authority.',
      timeframe: '3-4 weeks'
    },
    {
      step: 4,
      action: 'Get expert quotes and backlinks',
      details: 'Use HARO, Qwoted, or direct outreach to get quoted as an expert. Each mention should include your brand name.',
      timeframe: 'Ongoing'
    }
  ],

  competitor_gap: [
    {
      step: 1,
      action: 'Analyze competitor content strategy',
      details: 'Use tools like Ahrefs or SEMrush to see what content drives traffic to competitors. Note topics, formats, and keyword targets.',
      timeframe: '1-2 days'
    },
    {
      step: 2,
      action: 'Create "vs" comparison pages',
      details: 'Build honest comparison pages ([Your Brand] vs [Competitor]) that highlight your advantages with specific features and pricing.',
      timeframe: '1 week per competitor'
    },
    {
      step: 3,
      action: 'Target competitor alternatives keywords',
      details: 'Create content targeting "[Competitor] alternatives" and "[Competitor] vs" searches. Be the first result when people look for options.',
      timeframe: '2-3 weeks'
    },
    {
      step: 4,
      action: 'Highlight unique differentiators',
      details: 'Create dedicated pages for each feature or benefit that sets you apart. Use customer testimonials specific to these advantages.',
      timeframe: '2-4 weeks'
    }
  ],

  content: [
    {
      step: 1,
      action: 'Map your content gaps',
      details: 'List all questions customers ask (check support tickets, social media, forums). Identify topics you haven\'t covered.',
      timeframe: '1-2 days'
    },
    {
      step: 2,
      action: 'Create comprehensive FAQ content',
      details: 'Build an FAQ page with 20+ questions and detailed answers. Use FAQ schema markup for featured snippets.',
      timeframe: '1 week'
    },
    {
      step: 3,
      action: 'Develop use case pages',
      details: 'Create dedicated pages for each major use case: "[Brand] for [Industry]", "[Brand] for [Use Case]", etc.',
      timeframe: '2-3 weeks'
    },
    {
      step: 4,
      action: 'Ensure consistent brand mentions',
      details: 'Audit all content to ensure your brand name appears naturally 2-3 times per page. Update metadata and image alt tags.',
      timeframe: '1-2 weeks'
    }
  ],

  general: [
    {
      step: 1,
      action: 'Audit content for AI-friendliness',
      details: 'Review your top 20 pages. Ensure clear structure, factual statements, and explicit brand mentions in headings and intro paragraphs.',
      timeframe: '1-2 days'
    },
    {
      step: 2,
      action: 'Implement structured data',
      details: 'Add Organization, Product, FAQ, and HowTo schema to relevant pages. This helps AI systems understand your content.',
      timeframe: '3-5 days'
    },
    {
      step: 3,
      action: 'Create question-answer content',
      details: 'AI systems favor content that directly answers questions. Reformat key pages to follow Q&A patterns.',
      timeframe: '1-2 weeks'
    },
    {
      step: 4,
      action: 'Build topical authority',
      details: 'Create a content hub with 10+ interlinked articles establishing expertise in your core topic.',
      timeframe: '1-2 months'
    }
  ],

  maintenance: [
    {
      step: 1,
      action: 'Set up regular monitoring',
      details: 'Run AI visibility analysis monthly to track changes. Document scores and top competitors each time.',
      timeframe: 'Monthly'
    },
    {
      step: 2,
      action: 'Update existing content',
      details: 'Refresh your top-performing content quarterly. Add new information, update statistics, and strengthen brand mentions.',
      timeframe: 'Quarterly'
    },
    {
      step: 3,
      action: 'Monitor competitor moves',
      details: 'Track when competitors release new content or features. Respond with your own content within 2-4 weeks.',
      timeframe: 'Ongoing'
    }
  ],

  alert: [
    {
      step: 1,
      action: 'Investigate the cause',
      details: 'Compare recent analysis to previous one. Note which queries lost mentions and which competitors gained visibility.',
      timeframe: 'Immediate'
    },
    {
      step: 2,
      action: 'Check for new competitors',
      details: 'Search for new players in your space. Review their content strategy and identify what they\'re doing differently.',
      timeframe: '1-2 days'
    },
    {
      step: 3,
      action: 'Refresh affected content',
      details: 'Update pages related to queries where you lost visibility. Add more value, fresher data, and clearer brand positioning.',
      timeframe: '1-2 weeks'
    },
    {
      step: 4,
      action: 'Double down on strengths',
      details: 'Identify queries where you still rank well. Create more content around these topics to maintain dominance.',
      timeframe: '2-4 weeks'
    }
  ]
};

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
 * @returns {Array} Array of recommendations with detailed action steps
 */
function generateRecommendations(analysisResults, scoreData, trend = null) {
  const recommendations = [];
  const { stats, score } = scoreData;

  // Helper to add recommendation with action steps
  const addRecommendation = (template, replacements = {}) => {
    let rec = { ...template };
    
    // Apply replacements to title and description
    for (const [key, value] of Object.entries(replacements)) {
      rec.title = rec.title.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      rec.description = rec.description.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    
    // Add action steps based on type
    rec.actionSteps = ACTION_STEPS[rec.type] || [];
    
    recommendations.push(rec);
  };

  // Check for visibility gaps
  if (stats.mentionRate < 50) {
    addRecommendation(RECOMMENDATION_TEMPLATES.notMentioned, {
      percentage: 100 - stats.mentionRate
    });
  }

  // Check for low positioning
  if (stats.avgPosition && stats.avgPosition > 2) {
    addRecommendation(RECOMMENDATION_TEMPLATES.lowPosition, {
      position: stats.avgPosition.toFixed(1)
    });
  }

  // Check for dominant competitors
  if (analysisResults.topCompetitors && analysisResults.topCompetitors.length > 0) {
    const topCompetitor = analysisResults.topCompetitors[0];
    if (topCompetitor.count >= analysisResults.totalResponses * 0.3) {
      addRecommendation(RECOMMENDATION_TEMPLATES.competitorDominance, {
        competitor: topCompetitor.name,
        count: topCompetitor.count
      });
    }
  }

  // Check for low mention rate
  if (stats.mentionRate > 0 && stats.mentionRate < 70) {
    addRecommendation(RECOMMENDATION_TEMPLATES.lowMentionRate, {
      rate: stats.mentionRate
    });
  }

  // Check for no top 1 positions
  if (stats.top1Count === 0 && stats.totalMentions > 0) {
    const rec = { ...RECOMMENDATION_TEMPLATES.noTop1 };
    rec.actionSteps = ACTION_STEPS[rec.type] || [];
    recommendations.push(rec);
  }

  // Score-based recommendations
  if (score >= 60 && score < 80) {
    addRecommendation(RECOMMENDATION_TEMPLATES.moderateScore, {
      score: score
    });
  } else if (score >= 80) {
    const rec = { ...RECOMMENDATION_TEMPLATES.goodMaintenance };
    rec.actionSteps = ACTION_STEPS[rec.type] || [];
    recommendations.push(rec);
  }

  // Check for score drop
  if (trend && trend.change !== null && trend.change < -5) {
    addRecommendation(RECOMMENDATION_TEMPLATES.scoreDrop, {
      change: Math.abs(trend.change).toFixed(1)
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate AI-powered recommendations by asking the AI providers
 * @param {string} brandName - The brand being analyzed
 * @param {object} analysisResults - Results from analysis
 * @param {object} scoreData - Score data
 * @param {Array} topCompetitors - List of top competitors
 * @returns {Array} AI-generated recommendations from each provider
 */
async function generateAIRecommendations(brandName, analysisResults, scoreData, topCompetitors = []) {
  const { stats, score } = scoreData;
  
  // Build context for AI
  const competitorList = topCompetitors.slice(0, 5).map(c => c.name).join(', ') || 'none identified';
  
  const prompt = `You are an AI visibility and SEO expert. Analyze this brand's AI visibility data and provide specific, actionable recommendations.

Brand: ${brandName}
Current AI Visibility Score: ${score}/100
Mention Rate: ${stats.mentionRate}% (brand mentioned in ${stats.totalMentions} of ${stats.totalQueries} AI responses)
Top 1 Positions: ${stats.top1Count}
Top 3 Positions: ${stats.top3Count}
Average Position When Mentioned: ${stats.avgPosition || 'N/A'}
Top Competitors in AI Responses: ${competitorList}

Based on this data, provide 3-5 specific, actionable recommendations to improve this brand's visibility in AI responses. For each recommendation:
1. State the issue clearly
2. Explain WHY this matters for AI visibility
3. Provide 2-3 concrete action steps
4. Estimate the potential impact

Format your response as a numbered list. Be specific to this brand's situation - avoid generic advice.`;

  try {
    const results = await askAllProviders(prompt);
    
    // Format AI recommendations from each provider
    const aiRecommendations = [];
    
    for (const result of results) {
      if (result.success) {
        aiRecommendations.push({
          provider: result.provider,
          content: result.responseText,
          generatedAt: new Date().toISOString()
        });
      }
    }
    
    return aiRecommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return [];
  }
}

/**
 * Generate and save recommendations for a domain (including AI recommendations)
 * @param {number} domainId - The domain ID
 * @param {number} scoreId - The visibility score ID
 * @param {object} analysisResults - Analysis results
 * @param {object} scoreData - Score data
 * @param {object} trend - Score trend
 * @param {string} brandName - The brand name for AI recommendations
 * @returns {object} Object containing standard and AI recommendations
 */
async function generateAndSaveRecommendations(domainId, scoreId, analysisResults, scoreData, trend = null, brandName = '') {
  // Generate standard recommendations with action steps
  const recommendations = generateRecommendations(analysisResults, scoreData, trend);

  // Save each standard recommendation
  const savedRecommendations = [];
  for (const rec of recommendations) {
    const saved = await Recommendation.create(domainId, {
      scoreId,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      actionSteps: rec.actionSteps,
      isAiGenerated: false
    });
    savedRecommendations.push({
      ...saved,
      actionSteps: rec.actionSteps
    });
  }

  // Generate AI recommendations if we have a brand name
  let aiRecommendations = [];
  if (brandName) {
    try {
      aiRecommendations = await generateAIRecommendations(
        brandName, 
        analysisResults, 
        scoreData, 
        analysisResults.topCompetitors || []
      );
      
      // Save AI recommendations to database
      for (const aiRec of aiRecommendations) {
        await Recommendation.create(domainId, {
          scoreId,
          type: 'ai_generated',
          title: `AI Insights from ${aiRec.provider}`,
          description: aiRec.content,
          priority: 'medium',
          isAiGenerated: true,
          aiProvider: aiRec.provider
        });
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }
  }

  return {
    standard: savedRecommendations,
    aiGenerated: aiRecommendations
  };
}

/**
 * Get latest recommendations for a domain
 * @param {number} domainId - The domain ID
 * @returns {object} Object with standard and AI recommendations
 */
async function getRecommendations(domainId) {
  const allRecs = await Recommendation.findByDomainId(domainId);
  
  // Separate standard and AI-generated recommendations
  const standard = allRecs.filter(r => r.recommendation_type !== 'ai_generated');
  const aiGenerated = allRecs.filter(r => r.recommendation_type === 'ai_generated');
  
  return {
    standard,
    aiGenerated
  };
}

module.exports = {
  generateRecommendations,
  generateAndSaveRecommendations,
  generateAIRecommendations,
  getRecommendations,
  RECOMMENDATION_TEMPLATES,
  ACTION_STEPS
};
