/**
 * Visibility Scoring Service
 * Computes visibility scores based on brand mentions in AI responses
 * 
 * NEW SCORING MODEL (less harsh):
 * Base score: 50 (neutral starting point)
 * - Brand mentioned → +10
 * - Top 1 mention → +15 bonus
 * - Top 3 mention → +8 bonus
 * - Each competitor before brand → −3 (capped at -15)
 * - Not mentioned at all → -5
 * 
 * This gives brands like Facebook a fair score since they're often mentioned
 */

const { VisibilityScore, BrandMention } = require('../models');

/**
 * Scoring weights (rebalanced for fairness)
 */
const SCORING_WEIGHTS = {
  BASE_SCORE: 50,           // Start at neutral
  MENTIONED: 10,            // Good: you were mentioned
  TOP_1: 15,                // Excellent: mentioned first
  TOP_3: 8,                 // Good: mentioned early
  COMPETITOR_BEFORE: -3,    // Slight penalty per competitor
  MAX_COMPETITOR_PENALTY: -15, // Cap the penalty
  NOT_MENTIONED: -5,        // Penalty for not being mentioned
  MAX_SCORE: 100,
  MIN_SCORE: 0
};

/**
 * Calculate visibility score for analysis results
 * @param {object} analysisResults - Results from responseAnalyzer.analyzeAllResponses
 * @returns {object} Computed score with breakdown
 */
function calculateScore(analysisResults) {
  // Handle null/undefined input
  if (!analysisResults) {
    return {
      score: 0,
      rawScore: 0,
      maxPossibleScore: 100,
      breakdown: { base: 0, mentions: 0, top1: 0, top3: 0, competitorPenalty: 0, notMentionedPenalty: 0 },
      stats: {
        totalQueries: 0,
        totalMentions: 0,
        top1Count: 0,
        top3Count: 0,
        avgPosition: null,
        mentionRate: 0
      }
    };
  }

  const {
    totalResponses = 0,
    responsesWithTarget = 0,
    top1Count = 0,
    top3Count = 0,
    analyses = []
  } = analysisResults;

  if (totalResponses === 0) {
    return {
      score: 0,
      rawScore: 0,
      maxPossibleScore: 100,
      breakdown: { base: 0, mentions: 0, top1: 0, top3: 0, competitorPenalty: 0, notMentionedPenalty: 0 },
      stats: {
        totalQueries: 0,
        totalMentions: 0,
        top1Count: 0,
        top3Count: 0,
        avgPosition: null,
        mentionRate: 0
      }
    };
  }

  // Start with base score
  let rawScore = SCORING_WEIGHTS.BASE_SCORE;
  let mentionPoints = 0;
  let top1Points = 0;
  let top3Points = 0;
  let competitorPenalty = 0;
  let notMentionedPenalty = 0;

  for (const analysis of analyses) {
    if (analysis.targetBrand.mentioned) {
      // Points for being mentioned
      const mentionBonus = SCORING_WEIGHTS.MENTIONED / totalResponses;
      mentionPoints += mentionBonus;
      rawScore += mentionBonus;

      // Bonus for top 1
      if (analysis.targetBrand.position === 1) {
        const top1Bonus = SCORING_WEIGHTS.TOP_1 / totalResponses;
        top1Points += top1Bonus;
        rawScore += top1Bonus;
      }
      // Bonus for top 3 (but not top 1, to avoid double counting)
      else if (analysis.targetBrand.position <= 3) {
        const top3Bonus = SCORING_WEIGHTS.TOP_3 / totalResponses;
        top3Points += top3Bonus;
        rawScore += top3Bonus;
      }

      // Penalty for competitors mentioned before target (capped)
      if (analysis.competitorsBeforeTarget > 0) {
        const penalty = Math.max(
          SCORING_WEIGHTS.MAX_COMPETITOR_PENALTY / totalResponses,
          (analysis.competitorsBeforeTarget * SCORING_WEIGHTS.COMPETITOR_BEFORE) / totalResponses
        );
        competitorPenalty += penalty;
        rawScore += penalty;
      }
    } else {
      // Penalty for not being mentioned at all
      const nmPenalty = SCORING_WEIGHTS.NOT_MENTIONED / totalResponses;
      notMentionedPenalty += nmPenalty;
      rawScore += nmPenalty;
    }
  }

  // Clamp to 0-100
  const finalScore = Math.max(SCORING_WEIGHTS.MIN_SCORE, Math.min(SCORING_WEIGHTS.MAX_SCORE, rawScore));

  // Calculate average position (only for responses where mentioned)
  let avgPosition = null;
  const mentionedPositions = analyses
    .filter(a => a.targetBrand.mentioned)
    .map(a => a.targetBrand.position);
  
  if (mentionedPositions.length > 0) {
    avgPosition = mentionedPositions.reduce((a, b) => a + b, 0) / mentionedPositions.length;
  }

  // Calculate mention rate
  const mentionRate = totalResponses > 0 ? Math.round((responsesWithTarget / totalResponses) * 100) : 0;

  // Extract ranking data if available
  const rankings = analysisResults.rankings || { found: false, positions: [], averageRank: null, bestRank: null };
  
  // Extract brand vs discovery query stats
  const brandQueries = analysisResults.brandQueries || { total: 0, mentioned: 0, mentionRate: 0 };
  const discoveryQueries = analysisResults.discoveryQueries || { total: 0, mentioned: 0, mentionRate: 0 };

  return {
    score: Math.round(finalScore * 100) / 100,
    rawScore: Math.round(rawScore * 100) / 100,
    maxPossibleScore: 100,
    breakdown: {
      base: SCORING_WEIGHTS.BASE_SCORE,
      mentions: Math.round(mentionPoints * 100) / 100,
      top1: Math.round(top1Points * 100) / 100,
      top3: Math.round(top3Points * 100) / 100,
      competitorPenalty: Math.round(competitorPenalty * 100) / 100,
      notMentionedPenalty: Math.round(notMentionedPenalty * 100) / 100
    },
    stats: {
      totalQueries: totalResponses,
      totalMentions: responsesWithTarget,
      top1Count,
      top3Count,
      avgPosition: avgPosition ? Math.round(avgPosition * 100) / 100 : null,
      mentionRate,
      // Brand vs Discovery query stats
      brandQueries: {
        total: brandQueries.total,
        mentioned: brandQueries.mentioned,
        mentionRate: brandQueries.mentionRate
      },
      discoveryQueries: {
        total: discoveryQueries.total,
        mentioned: discoveryQueries.mentioned,
        mentionRate: discoveryQueries.mentionRate,
        top1Count: discoveryQueries.top1Count || 0,
        top3Count: discoveryQueries.top3Count || 0
      },
      // Ranking data
      ranking: rankings.found ? {
        averageRank: rankings.averageRank,
        bestRank: rankings.bestRank,
        worstRank: rankings.worstRank,
        timesRanked: rankings.positions.length
      } : null,
      note: 'Score based on mention frequency, position, and competitor comparison'
    }
  };
}

/**
 * Calculate and persist visibility score for a domain
 * @param {number} domainId - The domain ID
 * @param {object} analysisResults - Results from analyzeAllResponses
 * @returns {object} Stored score record
 */
async function calculateAndSaveScore(domainId, analysisResults) {
  const scoreData = calculateScore(analysisResults);

  // Ensure stats exists
  const stats = scoreData.stats || {
    totalQueries: 0,
    totalMentions: 0,
    top1Count: 0,
    top3Count: 0,
    avgPosition: null
  };

  // Save to database
  const storedScore = await VisibilityScore.create(domainId, {
    score: scoreData.score,
    totalQueries: stats.totalQueries,
    totalMentions: stats.totalMentions,
    top1Count: stats.top1Count,
    top3Count: stats.top3Count,
    avgPosition: stats.avgPosition
  });

  return {
    ...storedScore,
    breakdown: scoreData.breakdown,
    stats: scoreData.stats
  };
}

/**
 * Get score trend for a domain
 * @param {number} domainId - The domain ID
 * @returns {object} Current score, previous score, and change
 */
async function getScoreTrend(domainId) {
  return await VisibilityScore.getTrend(domainId);
}

/**
 * Get score history for charts
 * @param {number} domainId - The domain ID
 * @param {number} limit - Number of records to return
 * @returns {Array} Historical scores
 */
async function getScoreHistory(domainId, limit = 30) {
  const history = await VisibilityScore.findHistory(domainId, limit);
  
  // Return in chronological order for charts
  return history.reverse().map(record => ({
    date: record.created_at,
    score: parseFloat(record.score),
    totalQueries: record.total_queries,
    totalMentions: record.total_mentions,
    top1Count: record.top1_count,
    top3Count: record.top3_count
  }));
}

/**
 * Get score interpretation
 * @param {number} score - The visibility score (0-100)
 * @returns {object} Interpretation with label and description
 */
function interpretScore(score) {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'green',
      description: 'Your brand has strong visibility in AI responses. You are frequently mentioned and often appear in top positions.'
    };
  } else if (score >= 60) {
    return {
      label: 'Good',
      color: 'blue',
      description: 'Your brand has solid visibility. You appear in most AI responses but there is room to improve positioning.'
    };
  } else if (score >= 40) {
    return {
      label: 'Moderate',
      color: 'yellow',
      description: 'Your brand has moderate visibility. You are mentioned sometimes but competitors often rank higher.'
    };
  } else if (score >= 20) {
    return {
      label: 'Low',
      color: 'orange',
      description: 'Your brand has limited visibility in AI responses. Significant improvements are needed.'
    };
  } else {
    return {
      label: 'Poor',
      color: 'red',
      description: 'Your brand is rarely mentioned in AI responses. Immediate action is recommended.'
    };
  }
}

module.exports = {
  calculateScore,
  calculateAndSaveScore,
  getScoreTrend,
  getScoreHistory,
  interpretScore,
  SCORING_WEIGHTS
};
