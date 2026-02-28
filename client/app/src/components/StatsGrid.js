import React from 'react';

function StatsGrid({ stats }) {
  if (!stats) return <p>No stats available</p>;

  return (
    <div className="stats-grid">
      {/* Overall Stats */}
      <div className="stat-item">
        <div className="stat-value">{stats.totalQueries || 0}</div>
        <div className="stat-label">Total Queries</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalMentions || 0}</div>
        <div className="stat-label">Times Mentioned</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.mentionRate || 0}%</div>
        <div className="stat-label">Overall Mention Rate</div>
      </div>
      
      {/* Brand Query Stats - when brand is mentioned in the question */}
      {stats.brandQueries && (
        <div className="stat-item brand-query-stat">
          <div className="stat-value">{stats.brandQueries.mentionRate || 0}%</div>
          <div className="stat-label">Brand Query Rate ({stats.brandQueries.mentioned}/{stats.brandQueries.total})</div>
        </div>
      )}
      
      {/* Discovery Query Stats - TRUE organic visibility */}
      {stats.discoveryQueries && (
        <div className="stat-item discovery-stat highlight-stat">
          <div className="stat-value highlight">{stats.discoveryQueries.mentionRate || 0}%</div>
          <div className="stat-label">🔍 Organic Discovery ({stats.discoveryQueries.mentioned}/{stats.discoveryQueries.total})</div>
        </div>
      )}
      
      <div className="stat-item">
        <div className="stat-value">{stats.top1Count || 0}</div>
        <div className="stat-label">Top 1 Positions</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.top3Count || 0}</div>
        <div className="stat-label">Top 3 Positions</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.avgPosition?.toFixed(1) || 'N/A'}</div>
        <div className="stat-label">Avg Position</div>
      </div>
      
      {/* Ranking Stats */}
      {stats.ranking && stats.ranking.bestRank && (
        <>
          <div className="stat-item ranking-stat">
            <div className="stat-value highlight">#{stats.ranking.bestRank}</div>
            <div className="stat-label">Best Industry Rank</div>
          </div>
          <div className="stat-item ranking-stat">
            <div className="stat-value">{stats.ranking.averageRank?.toFixed(1) || 'N/A'}</div>
            <div className="stat-label">Avg Industry Rank</div>
          </div>
        </>
      )}
    </div>
  );
}

export default StatsGrid;
