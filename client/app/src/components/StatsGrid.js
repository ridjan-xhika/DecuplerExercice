import React from 'react';

function StatsGrid({ stats }) {
  if (!stats) return <p>No stats available</p>;

  return (
    <div className="stats-grid">
      {/* PRIMARY METRIC: Organic Discovery Rate - THE REAL TEST */}
      {stats.discoveryQueries && (
        <div className="stat-item discovery-stat highlight-stat primary-metric">
          <div className="stat-value highlight">{stats.discoveryQueries.mentionRate || 0}%</div>
          <div className="stat-label">🎯 Organic Discovery Rate</div>
          <div className="stat-sublabel">Mentioned in {stats.discoveryQueries.mentioned}/{stats.discoveryQueries.total} queries WITHOUT brand name</div>
        </div>
      )}

      {/* Ranking Stats - Second most important */}
      {stats.ranking && stats.ranking.bestRank && (
        <div className="stat-item ranking-stat">
          <div className="stat-value highlight">#{stats.ranking.bestRank}</div>
          <div className="stat-label">Best AI Ranking</div>
          <div className="stat-sublabel">Avg #{stats.ranking.averageRank?.toFixed(1) || 'N/A'}</div>
        </div>
      )}

      {/* Discovery positions */}
      {stats.discoveryQueries && (
        <>
          <div className="stat-item">
            <div className="stat-value">{stats.discoveryQueries.top1Count || 0}</div>
            <div className="stat-label">Top 1 (Organic)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.discoveryQueries.top3Count || 0}</div>
            <div className="stat-label">Top 3 (Organic)</div>
          </div>
        </>
      )}

      {/* Secondary: Brand Recognition (just verification AI knows the brand) */}
      {stats.brandQueries && stats.brandQueries.total > 0 && (
        <div className="stat-item brand-query-stat secondary-metric">
          <div className="stat-value">{stats.brandQueries.mentionRate || 0}%</div>
          <div className="stat-label">Brand Recognition</div>
          <div className="stat-sublabel">{stats.brandQueries.mentioned}/{stats.brandQueries.total} direct queries</div>
        </div>
      )}

      {/* Overall stats - less prominent */}
      <div className="stat-item secondary-metric">
        <div className="stat-value">{stats.totalQueries || 0}</div>
        <div className="stat-label">Total Queries</div>
      </div>
      <div className="stat-item secondary-metric">
        <div className="stat-value">{stats.avgPosition?.toFixed(1) || 'N/A'}</div>
        <div className="stat-label">Avg Position</div>
      </div>
    </div>
  );
}

export default StatsGrid;
