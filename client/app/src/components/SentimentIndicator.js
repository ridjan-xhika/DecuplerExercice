import React from 'react';

/**
 * Displays sentiment analysis of how the brand is mentioned
 * Positive: AI recommends/praises the brand
 * Neutral: AI mentions without strong opinion
 * Negative: AI criticizes or warns against
 */
function SentimentIndicator({ sentiment }) {
  // Default sentiment if not provided
  const sentimentData = sentiment || {
    positive: 0,
    neutral: 0,
    negative: 0,
    overall: 'neutral'
  };

  const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;
  
  // Calculate percentages
  const positivePercent = total > 0 ? Math.round((sentimentData.positive / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((sentimentData.neutral / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((sentimentData.negative / total) * 100) : 0;

  const getOverallIcon = () => {
    if (positivePercent >= 60) return '😊';
    if (negativePercent >= 40) return '😟';
    return '😐';
  };

  const getOverallLabel = () => {
    if (positivePercent >= 60) return 'Mostly Positive';
    if (positivePercent >= 40) return 'Mixed Positive';
    if (negativePercent >= 40) return 'Needs Attention';
    return 'Neutral';
  };

  if (total === 0) {
    return (
      <div className="sentiment-indicator empty">
        <div className="sentiment-header">
          <span className="sentiment-icon">📊</span>
          <span className="sentiment-title">Mention Sentiment</span>
        </div>
        <div className="sentiment-empty">Not enough mentions to analyze sentiment</div>
      </div>
    );
  }

  return (
    <div className="sentiment-indicator">
      <div className="sentiment-header">
        <span className="sentiment-icon">{getOverallIcon()}</span>
        <span className="sentiment-title">Mention Sentiment</span>
        <span className="sentiment-overall">{getOverallLabel()}</span>
      </div>
      
      <div className="sentiment-bar">
        <div 
          className="sentiment-segment positive" 
          style={{ width: `${positivePercent}%` }}
          title={`Positive: ${positivePercent}%`}
        />
        <div 
          className="sentiment-segment neutral" 
          style={{ width: `${neutralPercent}%` }}
          title={`Neutral: ${neutralPercent}%`}
        />
        <div 
          className="sentiment-segment negative" 
          style={{ width: `${negativePercent}%` }}
          title={`Negative: ${negativePercent}%`}
        />
      </div>

      <div className="sentiment-legend">
        <div className="legend-item positive">
          <span className="legend-dot"></span>
          <span className="legend-label">Positive</span>
          <span className="legend-value">{positivePercent}%</span>
        </div>
        <div className="legend-item neutral">
          <span className="legend-dot"></span>
          <span className="legend-label">Neutral</span>
          <span className="legend-value">{neutralPercent}%</span>
        </div>
        <div className="legend-item negative">
          <span className="legend-dot"></span>
          <span className="legend-label">Negative</span>
          <span className="legend-value">{negativePercent}%</span>
        </div>
      </div>

      <div className="sentiment-tips">
        {negativePercent >= 30 && (
          <div className="sentiment-tip warning">
            ⚠️ High negative sentiment detected. Check AI responses for criticism or warnings.
          </div>
        )}
        {positivePercent >= 70 && (
          <div className="sentiment-tip success">
            ✅ AI systems view your brand favorably! Maintain this positive presence.
          </div>
        )}
      </div>
    </div>
  );
}

export default SentimentIndicator;
