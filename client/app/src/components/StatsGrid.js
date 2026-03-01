import React from 'react';

function StatsGrid({ stats }) {
  if (!stats) return <p>No stats available</p>;

  // Use websiteQueries if available (for domain inputs), otherwise use discoveryQueries
  const organicStats = (stats.websiteQueries && stats.websiteQueries.total > 0) 
    ? stats.websiteQueries 
    : stats.discoveryQueries;
  
  const isWebsiteAnalysis = stats.websiteQueries && stats.websiteQueries.total > 0;

  return (
    <div className="stats-grid">
      {/* PRIMARY METRIC: Organic Discovery Rate - THE REAL TEST */}
      {organicStats && (
        <div className="stat-item discovery-stat highlight-stat primary-metric">
          <div className="stat-value highlight">{organicStats.mentionRate || 0}%</div>
          <div className="stat-label">🎯 {isWebsiteAnalysis ? 'Website Visibility Rate' : 'Organic Discovery Rate'}</div>
          <div className="stat-sublabel">
            Mentioned in {organicStats.mentioned}/{organicStats.total} queries WITHOUT brand name
            {isWebsiteAnalysis && organicStats.domainMentions > 0 && (
              <span> ({organicStats.domainMentions} domain mentions)</span>
            )}
          </div>
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
      {organicStats && (
        <>
          <div className="stat-item">
            <div className="stat-value">{organicStats.top1Count || 0}</div>
            <div className="stat-label">Top 1 (Organic)</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{organicStats.top3Count || 0}</div>
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
