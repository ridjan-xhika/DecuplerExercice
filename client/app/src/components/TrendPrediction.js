import React from 'react';

/**
 * Shows trend prediction based on historical data and current performance
 */
function TrendPrediction({ trend, currentScore }) {
  if (!trend || !trend.scores || trend.scores.length < 2) {
    return (
      <div className="trend-prediction minimal">
        <div className="prediction-icon">📈</div>
        <div className="prediction-text">
          Run more analyses to see trend predictions
        </div>
      </div>
    );
  }

  // Calculate momentum (rate of change)
  const recentScores = trend.scores.slice(-5);
  const avgChange = recentScores.length > 1 
    ? (recentScores[recentScores.length - 1].score - recentScores[0].score) / (recentScores.length - 1)
    : 0;

  // Predict next score
  const predictedScore = Math.max(0, Math.min(100, currentScore + avgChange * 2));
  const confidence = recentScores.length >= 5 ? 'high' : recentScores.length >= 3 ? 'medium' : 'low';

  // Determine trend direction
  const getTrendDirection = () => {
    if (avgChange > 2) return { direction: 'up', label: 'Improving', icon: '📈', class: 'positive' };
    if (avgChange < -2) return { direction: 'down', label: 'Declining', icon: '📉', class: 'negative' };
    return { direction: 'stable', label: 'Stable', icon: '➡️', class: 'neutral' };
  };

  const trendInfo = getTrendDirection();

  // Get actionable insight
  const getInsight = () => {
    if (trendInfo.direction === 'up' && currentScore >= 60) {
      return "Your visibility is improving! Keep up the content strategy that's working.";
    }
    if (trendInfo.direction === 'up' && currentScore < 60) {
      return "Good momentum! Focus on organic discovery to accelerate growth.";
    }
    if (trendInfo.direction === 'down' && currentScore >= 60) {
      return "Visibility declining. Check if competitors have improved their AI presence.";
    }
    if (trendInfo.direction === 'down' && currentScore < 60) {
      return "Urgent: Implement recommendations to reverse the negative trend.";
    }
    return "Visibility is stable. Implement recommendations to improve further.";
  };

  return (
    <div className={`trend-prediction ${trendInfo.class}`}>
      <div className="prediction-header">
        <span className="prediction-icon">{trendInfo.icon}</span>
        <span className="prediction-title">Trend Analysis</span>
      </div>

      <div className="prediction-main">
        <div className="trend-direction">
          <span className="direction-label">{trendInfo.label}</span>
          <span className="direction-change">
            {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)} pts/analysis
          </span>
        </div>

        <div className="predicted-score">
          <span className="predicted-label">Projected Next Score</span>
          <span className="predicted-value">{predictedScore.toFixed(0)}</span>
          <span className={`confidence-badge ${confidence}`}>
            {confidence} confidence
          </span>
        </div>
      </div>

      <div className="prediction-insight">
        <span className="insight-icon">💡</span>
        <span className="insight-text">{getInsight()}</span>
      </div>

      <div className="prediction-factors">
        <div className="factor-title">Key Factors</div>
        <div className="factor-list">
          <div className="factor-item">
            <span>Analyses completed:</span>
            <span>{trend.scores.length}</span>
          </div>
          <div className="factor-item">
            <span>Best score:</span>
            <span>{Math.max(...trend.scores.map(s => s.score)).toFixed(0)}</span>
          </div>
          <div className="factor-item">
            <span>Current score:</span>
            <span>{currentScore?.toFixed(0) || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendPrediction;
