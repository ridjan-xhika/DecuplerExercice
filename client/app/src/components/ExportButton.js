import React, { useState } from 'react';

function ExportButton({ report }) {
  const [exporting, setExporting] = useState(false);

  if (!report) return null;

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-visibility-${report.domain?.name || 'report'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const rows = [];
    
    // Header info
    rows.push(['AI Visibility Report']);
    rows.push(['Brand/Domain', report.domain?.name || 'Unknown']);
    rows.push(['Industry', report.domain?.industry || 'Unknown']);
    rows.push(['Analysis Date', report.timestamp]);
    rows.push(['']);
    
    // Score summary
    rows.push(['VISIBILITY SCORE']);
    rows.push(['Overall Score', report.score?.score || 0]);
    rows.push(['Category', report.interpretation?.label || 'N/A']);
    rows.push(['Description', report.interpretation?.description || 'N/A']);
    rows.push(['']);
    
    // Stats
    rows.push(['ANALYSIS STATS']);
    rows.push(['Total Queries', report.score?.stats?.totalQueries || 0]);
    rows.push(['Mention Rate', `${report.score?.stats?.mentionRate || 0}%`]);
    rows.push(['Organic Discovery Rate', `${report.score?.stats?.discoveryQueries?.mentionRate || 0}%`]);
    rows.push(['Top 1 Count', report.score?.stats?.top1Count || 0]);
    rows.push(['Top 3 Count', report.score?.stats?.top3Count || 0]);
    rows.push(['Average Position', report.score?.stats?.avgPosition?.toFixed(1) || 'N/A']);
    rows.push(['']);
    
    // Competitors
    if (report.topCompetitors?.length > 0) {
      rows.push(['TOP COMPETITORS']);
      rows.push(['Rank', 'Name', 'Mentions']);
      report.topCompetitors.forEach((comp, idx) => {
        rows.push([idx + 1, comp.name || comp.competitor_name, comp.count || comp.mention_count]);
      });
      rows.push(['']);
    }
    
    // Recommendations
    if (report.recommendations?.length > 0) {
      rows.push(['RECOMMENDATIONS']);
      rows.push(['Priority', 'Title', 'Description']);
      report.recommendations.forEach(rec => {
        rows.push([rec.priority, rec.title, rec.description?.replace(/,/g, ';')]);
      });
    }

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-visibility-${report.domain?.name || 'report'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateHTMLReport = () => {
    setExporting(true);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Visibility Report - ${report.domain?.name || 'Unknown'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; color: #1e293b; }
    h1 { color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
    h2 { color: #334155; margin-top: 2rem; }
    .score-box { background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 2rem; border-radius: 12px; text-align: center; margin: 1.5rem 0; }
    .score-value { font-size: 4rem; font-weight: 700; color: ${getScoreColor(report.score?.score || 0)}; }
    .score-label { font-size: 1.25rem; color: #64748b; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .stat-card { background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
    .stat-value { font-size: 1.5rem; font-weight: 600; color: #334155; }
    .stat-label { font-size: 0.875rem; color: #64748b; }
    .competitor-list { list-style: none; padding: 0; }
    .competitor-item { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: #f8fafc; margin: 0.5rem 0; border-radius: 8px; }
    .recommendation { background: #f8fafc; padding: 1rem; margin: 0.75rem 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
    .priority-high { border-left-color: #ef4444; }
    .priority-medium { border-left-color: #f97316; }
    .priority-low { border-left-color: #22c55e; }
    .rec-title { font-weight: 600; margin-bottom: 0.5rem; }
    .rec-description { color: #64748b; font-size: 0.9rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.875rem; text-align: center; }
  </style>
</head>
<body>
  <h1>🔍 AI Visibility Report</h1>
  <p><strong>Brand:</strong> ${report.domain?.name || 'Unknown'} | <strong>Industry:</strong> ${report.domain?.industry || 'Unknown'} | <strong>Date:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
  
  <div class="score-box">
    <div class="score-value">${report.score?.score?.toFixed(0) || 0}</div>
    <div class="score-label">${report.interpretation?.label || 'Unknown'} - ${report.interpretation?.description || ''}</div>
  </div>
  
  <h2>📊 Analysis Statistics</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.discoveryQueries?.mentionRate || 0}%</div>
      <div class="stat-label">Organic Discovery Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.totalQueries || 0}</div>
      <div class="stat-label">Total Queries</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.mentionRate || 0}%</div>
      <div class="stat-label">Overall Mention Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.top1Count || 0}</div>
      <div class="stat-label">Top 1 Mentions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.top3Count || 0}</div>
      <div class="stat-label">Top 3 Mentions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.score?.stats?.avgPosition?.toFixed(1) || 'N/A'}</div>
      <div class="stat-label">Avg Position</div>
    </div>
  </div>
  
  ${report.topCompetitors?.length > 0 ? `
  <h2>🏆 Top Competitors</h2>
  <ul class="competitor-list">
    ${report.topCompetitors.map((comp, idx) => `
    <li class="competitor-item">
      <span>${idx + 1}. ${comp.name || comp.competitor_name}</span>
      <span>${comp.count || comp.mention_count} mentions</span>
    </li>
    `).join('')}
  </ul>
  ` : ''}
  
  ${report.recommendations?.length > 0 ? `
  <h2>💡 Recommendations</h2>
  ${report.recommendations.map(rec => `
  <div class="recommendation priority-${rec.priority}">
    <div class="rec-title">${rec.title}</div>
    <div class="rec-description">${rec.description}</div>
  </div>
  `).join('')}
  ` : ''}
  
  <div class="footer">
    Generated by AI Visibility Tracker | ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
    `;
    
    const dataBlob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-visibility-${report.domain?.name || 'report'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setExporting(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="export-buttons">
      <button 
        className="btn btn-export" 
        onClick={generateHTMLReport}
        disabled={exporting}
      >
        📄 Export HTML
      </button>
      <button 
        className="btn btn-export" 
        onClick={exportAsCSV}
      >
        📊 Export CSV
      </button>
      <button 
        className="btn btn-export" 
        onClick={exportAsJSON}
      >
        🔧 Export JSON
      </button>
    </div>
  );
}

export default ExportButton;
