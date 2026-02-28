import React, { useState } from 'react';

function AnalysisForm({ onAnalyze, loading }) {
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      onAnalyze(domain.trim(), industry.trim() || null);
    }
  };

  return (
    <form className="analysis-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter brand or domain (e.g., hubspot, shopify)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="Industry (optional)"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={loading || !domain.trim()}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
}

export default AnalysisForm;
