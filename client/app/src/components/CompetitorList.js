import React from 'react';

function CompetitorList({ competitors }) {
  if (!competitors || competitors.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>No competitors detected</p>;
  }

  return (
    <ul className="competitor-list">
      {competitors.map((comp, index) => (
        <li key={index} className="competitor-item">
          <span className="competitor-name">
            {index + 1}. {comp.name || comp.competitor_name}
          </span>
          <span className="competitor-count">
            {comp.count || comp.mention_count} mentions
          </span>
        </li>
      ))}
    </ul>
  );
}

export default CompetitorList;
