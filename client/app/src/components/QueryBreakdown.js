import React, { useState } from 'react';

function QueryBreakdown({ queries, analysis }) {
  const [expanded, setExpanded] = useState(false);

  if (!queries || queries.length === 0) {
    return null;
  }

  // Group queries by type
  const queryGroups = queries.reduce((acc, query) => {
    const type = query.queryType || query.query_type || 'unknown';
    if (!acc[type]) {
      acc[type] = { queries: [], mentioned: 0, total: 0 };
    }
    acc[type].queries.push(query);
    acc[type].total++;
    return acc;
  }, {});

  // Query type display names and icons
  const typeInfo = {
    directBrand: { name: 'Direct Brand Queries', icon: '🎯', description: 'Queries that mention your brand directly' },
    brandOpinion: { name: 'Brand Opinion', icon: '💭', description: 'Asking AI what it thinks about your brand' },
    comparison: { name: 'Comparisons', icon: '⚖️', description: 'Comparing your brand with competitors' },
    productDiscovery: { name: 'Product Discovery', icon: '🔍', description: 'Users looking for solutions (organic)' },
    bestQueries: { name: 'Best/Top Queries', icon: '🏆', description: 'Users asking for top recommendations' },
    useCase: { name: 'Use Case Queries', icon: '💼', description: 'Specific scenario-based searches' },
    audienceSpecific: { name: 'Audience Specific', icon: '👥', description: 'Queries targeting specific user groups' },
    ranking: { name: 'Ranking Queries', icon: '📊', description: 'Asking AI to rank companies' },
    competitorDiscovery: { name: 'Competitor Discovery', icon: '🎭', description: 'Finding who competes with you' },
    pricing: { name: 'Pricing Queries', icon: '💰', description: 'Free/affordable alternatives' },
    regional: { name: 'Regional Queries', icon: '🌍', description: 'Location-specific searches' },
    // Website-specific query types
    websiteDiscovery: { name: 'Website Discovery', icon: '🌐', description: 'Looking for best websites/platforms' },
    websiteBest: { name: 'Best Websites', icon: '⭐', description: 'Asking for top website recommendations' },
    websiteRanking: { name: 'Website Rankings', icon: '📈', description: 'Ranking websites/platforms' },
    websiteUseCase: { name: 'Website Use Cases', icon: '🛠️', description: 'Finding websites for specific tasks' },
    websiteAlternatives: { name: 'Website Alternatives', icon: '🔄', description: 'Looking for similar websites' },
    unknown: { name: 'Other Queries', icon: '❓', description: 'Miscellaneous queries' }
  };

  // Categorize as brand queries vs discovery queries vs website queries
  const brandQueryTypes = ['directBrand', 'brandOpinion', 'comparison', 'competitorDiscovery'];
  const discoveryQueryTypes = ['productDiscovery', 'bestQueries', 'useCase', 'audienceSpecific', 'ranking', 'pricing', 'regional'];
  const websiteQueryTypes = ['websiteDiscovery', 'websiteBest', 'websiteRanking', 'websiteUseCase', 'websiteAlternatives'];

  const brandStats = Object.entries(queryGroups)
    .filter(([type]) => brandQueryTypes.includes(type))
    .reduce((acc, [, data]) => ({ queries: acc.queries + data.total }), { queries: 0 });

  const discoveryStats = Object.entries(queryGroups)
    .filter(([type]) => discoveryQueryTypes.includes(type))
    .reduce((acc, [, data]) => ({ queries: acc.queries + data.total }), { queries: 0 });

  const websiteStats = Object.entries(queryGroups)
    .filter(([type]) => websiteQueryTypes.includes(type))
    .reduce((acc, [, data]) => ({ queries: acc.queries + data.total }), { queries: 0 });

  // Determine if this is a website-focused analysis
  const isWebsiteFocused = websiteStats.queries > 0;

  return (
    <div className="query-breakdown">
      <div className="breakdown-header" onClick={() => setExpanded(!expanded)}>
        <h3>📋 Query Breakdown {isWebsiteFocused && <span className="website-badge">🌐 Website Analysis</span>}</h3>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      <div className="breakdown-summary">
        <div className="summary-item brand-queries">
          <span className="summary-value">{brandStats.queries}</span>
          <span className="summary-label">Brand Queries</span>
          <span className="summary-hint">Tests brand recognition</span>
        </div>
        {isWebsiteFocused ? (
          <div className="summary-item website-queries">
            <span className="summary-value">{websiteStats.queries}</span>
            <span className="summary-label">Website Queries</span>
            <span className="summary-hint">Tests online visibility</span>
          </div>
        ) : (
          <div className="summary-item discovery-queries">
            <span className="summary-value">{discoveryStats.queries}</span>
            <span className="summary-label">Discovery Queries</span>
            <span className="summary-hint">Tests organic visibility</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="breakdown-details">
          {Object.entries(queryGroups)
            .sort(([a], [b]) => {
              // Sort by website first (if present), then discovery, then brand
              const aIsWebsite = websiteQueryTypes.includes(a);
              const bIsWebsite = websiteQueryTypes.includes(b);
              const aIsDiscovery = discoveryQueryTypes.includes(a);
              const bIsDiscovery = discoveryQueryTypes.includes(b);
              if (aIsWebsite && !bIsWebsite) return -1;
              if (!aIsWebsite && bIsWebsite) return 1;
              if (aIsDiscovery && !bIsDiscovery) return -1;
              if (!aIsDiscovery && bIsDiscovery) return 1;
              return 0;
            })
            .map(([type, data]) => {
              const info = typeInfo[type] || typeInfo.unknown;
              const isDiscovery = discoveryQueryTypes.includes(type);
              
              return (
                <div 
                  key={type} 
                  className={`breakdown-category ${isDiscovery ? 'discovery' : 'brand'}`}
                >
                  <div className="category-header">
                    <span className="category-icon">{info.icon}</span>
                    <span className="category-name">{info.name}</span>
                    <span className="category-count">{data.total} queries</span>
                  </div>
                  <div className="category-description">{info.description}</div>
                  <div className="category-samples">
                    {data.queries.slice(0, 2).map((q, idx) => (
                      <div key={idx} className="sample-query">
                        "{q.queryText || q.query_text}"
                      </div>
                    ))}
                    {data.queries.length > 2 && (
                      <div className="more-queries">+{data.queries.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default QueryBreakdown;
