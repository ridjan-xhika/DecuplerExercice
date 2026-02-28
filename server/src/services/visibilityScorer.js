/**
 * Visibility Scoring Service
 * Computes visibility scores based on brand mentions in AI responses
 */

const { VisibilityScore, BrandMention } = require('../models');

/**
 * Scoring weights (based on ScopeAndTasks.md)
 * - Brand mentioned → +3
 * - Top 1 mention → +5
 * - Top 3 mention → +3
 * - Each competitor before brand → −2
 */
const SCORING_WEIGHTS = {
  MENTIONED: 3,
  TOP_1: 5,
  TOP_3: 3,
  COMPETITOR_BEFORE: -2,
  MAX_SCORE: 100,
  MIN_SCORE: 0
};

/**
 * Calculate visibility score for analysis results
 * @param {object} analysisResults - Results from responseAnalyzer.analyzeAllResponses
 * @returns {object} Computed score with breakdown
 */
function calculateScore(analysisResults) {
  const {
    totalResponses,
    responsesWithTarget,
    top1Count,
    top3Count,
    analyses
  } = analysisResults;

  if (totalResponses === 0) {
    return {
      score: 0,
      breakdown: { mentions: 0, top1: 0, top3: 0, competitorPenalty: 0 },
      normalized: 0
    };
  }

  // Calculate raw points
  let rawScore = 0;
  let mentionPoints = 0;
  let top1Points = 0;
  let top3Points = 0;
  let competitorPenalty = 0;

  for (const analysis of analyses) {
    if (analysis.targetBrand.mentioned) {
      // Points for being mentioned
      mentionPoints += SCORING_WEIGHTS.MENTIONED;
      rawScore += SCORING_WEIGHTS.MENTIONED;

      // Bonus for top 1
      if (analysis.targetBrand.position === 1) {
        top1Points += SCORING_WEIGHTS.TOP_1;
        rawScore += SCORING_WEIGHTS.TOP_1;
      }
      // Bonus for top 3 (but not top 1, to avoid double counting)
      else if (analysis.targetBrand.position <= 3) {
        top3Points += SCORING_WEIGHTS.TOP_3;
        rawScore += SCORING_WEIGHTS.TOP_3;
      }

      // Penalty for competitors mentioned before target
      const penalty = analysis.competitorsBeforeTarget * SCORING_WEIGHTS.COMPETITOR_BEFORE;
      competitorPenalty += penalty;
      rawScore += penalty;
    }
  }

  // Calculate maximum possible score
  // Best case: mentioned in all responses, always #1, no competitors before
  const maxPossibleScore = totalResponses * (SCORING_WEIGHTS.MENTIONED + SCORING_WEIGHTS.TOP_1);

  // Normalize to 0-100
  const normalizedScore = maxPossibleScore > 0 
    ? Math.max(0, Math.min(100, (rawScore / maxPossibleScore) * 100))
    : 0;

  // Calculate average position (only for responses where mentioned)
  let avgPosition = null;
  const mentionedPositions = analyses
    .filter(a => a.targetBrand.mentioned)
    .map(a => a.targetBrand.position);
  
  if (mentionedPositions.length > 0) {
    avgPosition = mentionedPositions.reduce((a, b) => a + b, 0) / mentionedPositions.length;
  }

  return {
    score: Math.round(normalizedScore * 100) / 100,
    rawScore,
    maxPossibleScore,
    breakdown: {
      mentions: mentionPoints,
      top1: top1Points,
      top3: top3Points,
      competitorPenalty
    },
    stats: {
      totalQueries: totalResponses,
      totalMentions: responsesWithTarget,
      top1Count,
      top3Count,
      avgPosition: avgPosition ? Math.round(avgPosition * 100) / 100 : null,
      mentionRate: Math.round((responsesWithTarget / totalResponses) * 100)
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

  // Save to database
  const storedScore = await VisibilityScore.create(domainId, {
    score: scoreData.score,
    totalQueries: scoreData.stats.totalQueries,
    totalMentions: scoreData.stats.totalMentions,
    top1Count: scoreData.stats.top1Count,
    top3Count: scoreData.stats.top3Count,
    avgPosition: scoreData.stats.avgPosition
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
