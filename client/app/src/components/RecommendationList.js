import React from 'react';

function RecommendationList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>No recommendations yet</p>;
  }

  return (
    <div>
      {recommendations.map((rec, index) => (
        <div 
          key={index} 
          className={`recommendation-item priority-${rec.priority}`}
        >
          <div className="recommendation-title">
            {rec.title}
            <span className={`priority-badge priority-${rec.priority}`}>
              {rec.priority}
            </span>
          </div>
          <div className="recommendation-description">
            {rec.description}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecommendationList;
