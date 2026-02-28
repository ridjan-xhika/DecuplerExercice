import React from 'react';

function LiveFeed({ events, currentQuery, progress }) {
  return (
    <div className="live-feed">
      <div className="feed-header">
        <h3>🔴 Live Analysis</h3>
        {progress && (
          <div className="progress-info">
            <span>{progress.current} / {progress.total} queries</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {currentQuery && (
        <div className="current-query">
          <div className="query-label">Asking AI:</div>
          <div className="query-text">"{currentQuery}"</div>
        </div>
      )}

      <div className="feed-list">
        {events.slice(-10).reverse().map((event, index) => (
          <div 
            key={index} 
            className={`feed-item ${event.type} ${event.mentioned ? 'mentioned' : ''}`}
          >
            {event.type === 'response' && (
              <>
                <div className="feed-item-header">
                  <span className="feed-question">Q: {event.question}</span>
                  {event.mentioned && <span className="mention-badge">✓ Mentioned</span>}
                </div>
                <div className="feed-answer">
                  <span className="provider-tag">{event.provider}</span>
                  <span className="answer-preview">{event.preview}</span>
                </div>
              </>
            )}
            {event.type === 'status' && (
              <div className="feed-status">
                <span className="status-icon">ℹ️</span>
                <span>{event.message}</span>
              </div>
            )}
            {event.type === 'analysis' && (
              <div className="feed-analysis">
                <span className="status-icon">🔍</span>
                <span>Detected industry: <strong>{event.industry}</strong></span>
                {event.competitors?.length > 0 && (
                  <span className="competitors-mini">
                    Competitors: {event.competitors.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            )}
            {event.type === 'score' && (
              <div className="feed-score">
                <span className="status-icon">📊</span>
                <span>Score calculated: <strong>{event.score}</strong> - {event.interpretation?.category}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveFeed;
