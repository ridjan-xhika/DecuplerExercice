import React from 'react';

function StatsGrid({ stats }) {
  if (!stats) return <p>No stats available</p>;

  return (
    <div className="stats-grid">
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
        <div className="stat-label">Mention Rate</div>
      </div>
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
    </div>
  );
}

export default StatsGrid;
