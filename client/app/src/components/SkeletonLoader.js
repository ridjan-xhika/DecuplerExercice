import React from 'react';

/**
 * Skeleton loading component for better UX during data fetching
 */
function SkeletonLoader({ type = 'card' }) {
  if (type === 'score') {
    return (
      <div className="skeleton-loader score-skeleton">
        <div className="skeleton-circle large pulse"></div>
        <div className="skeleton-line medium pulse"></div>
        <div className="skeleton-line small pulse"></div>
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className="skeleton-loader stats-skeleton">
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-stat">
              <div className="skeleton-line large pulse"></div>
              <div className="skeleton-line small pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton-loader list-skeleton">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-item">
            <div className="skeleton-line full pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="skeleton-loader chart-skeleton">
        <div className="skeleton-chart-bars">
          {[40, 60, 80, 55, 70, 45, 85].map((height, i) => (
            <div 
              key={i} 
              className="skeleton-bar pulse" 
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className="skeleton-loader card-skeleton">
      <div className="skeleton-line large pulse"></div>
      <div className="skeleton-line medium pulse"></div>
      <div className="skeleton-line small pulse"></div>
      <div className="skeleton-line medium pulse"></div>
    </div>
  );
}

/**
 * Dashboard skeleton for initial loading state
 */
export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <div className="skeleton-row">
        <div className="skeleton-card">
          <SkeletonLoader type="score" />
        </div>
        <div className="skeleton-card">
          <SkeletonLoader type="stats" />
        </div>
      </div>
      <div className="skeleton-row">
        <div className="skeleton-card">
          <SkeletonLoader type="list" />
        </div>
        <div className="skeleton-card">
          <SkeletonLoader type="chart" />
        </div>
      </div>
      <div className="skeleton-row full">
        <div className="skeleton-card">
          <SkeletonLoader type="list" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonLoader;
