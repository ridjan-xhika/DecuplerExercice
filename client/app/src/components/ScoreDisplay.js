import React from 'react';

function ScoreDisplay({ score, interpretation, trend }) {
  const getScoreClass = () => {
    if (!interpretation) return '';
    return `score-${interpretation.label.toLowerCase()}`;
  };

  const formatTrend = () => {
    if (!trend || trend.change === null) return null;
    const change = trend.change;
    if (change > 0) return `↑ +${change.toFixed(1)}`;
    if (change < 0) return `↓ ${change.toFixed(1)}`;
    return '→ 0';
  };

  return (
    <div className="score-display">
      <div className={`score-value ${getScoreClass()}`}>
        {score !== undefined ? score.toFixed(0) : '--'}
      </div>
      {interpretation && (
        <>
          <div className={`score-label ${getScoreClass()}`}>
            {interpretation.label}
            {formatTrend() && (
              <span style={{ fontSize: '0.9rem', marginLeft: '0.5rem', opacity: 0.8 }}>
                {formatTrend()}
              </span>
            )}
          </div>
          <div className="score-description">
            {interpretation.description}
          </div>
        </>
      )}
    </div>
  );
}

export default ScoreDisplay;
