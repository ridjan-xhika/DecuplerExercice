
import React, { useState } from 'react';

function AnalysisForm({ onAnalyze, loading }) {
  const [domain, setDomain] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    industry: '',
    targetAudience: '',
    mainUseCases: '',
    knownCompetitors: '',
    productDescription: '',
    region: 'global'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      // Pass strings to backend - it will parse them
      const options = {
        industry: advancedOptions.industry.trim() || null,
        targetAudience: advancedOptions.targetAudience.trim() || null,
        mainUseCases: advancedOptions.mainUseCases.trim() || null,
        knownCompetitors: advancedOptions.knownCompetitors.trim() || null,
        productDescription: advancedOptions.productDescription.trim() || null,
        region: advancedOptions.region
      };
      onAnalyze(domain.trim(), options);
    }
  };

  const handleOptionChange = (field, value) => {
    setAdvancedOptions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form className="analysis-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>🔍 Analyze AI Visibility</h2>
        <p className="form-subtitle">See how your brand appears in AI search results</p>
      </div>

      <div className="input-group main-input">
        <label htmlFor="domain">Brand or Domain *</label>
        <input
          id="domain"
          type="text"
          placeholder="e.g., Salesforce, Shopify, Nike"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={loading}
        />
        <span className="input-hint">Enter your company name, brand, or website domain</span>
      </div>

      <button 
        type="button" 
        className="btn btn-secondary toggle-advanced"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▲ Hide' : '▼ Show'} Advanced Options
        <span className="advanced-hint">(Better results with more context)</span>
      </button>

      {showAdvanced && (
        <div className="advanced-options">
          <div className="options-grid">
            <div className="input-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                value={advancedOptions.industry}
                onChange={(e) => handleOptionChange('industry', e.target.value)}
                disabled={loading}
              >
                <option value="">Auto-detect</option>
                <option value="social media">Social Media</option>
                <option value="crm">CRM</option>
                <option value="project management">Project Management</option>
                <option value="ecommerce">E-commerce</option>
                <option value="email marketing">Email Marketing</option>
                <option value="cloud">Cloud & Infrastructure</option>
                <option value="analytics">Analytics & BI</option>
                <option value="design">Design Tools</option>
                <option value="development">Development & DevOps</option>
                <option value="payments">Payments & FinTech</option>
                <option value="hr">HR & Recruiting</option>
                <option value="customer support">Customer Support</option>
                <option value="ai">AI & Machine Learning</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="travel">Travel & Hospitality</option>
                <option value="food">Food & Delivery</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                value={advancedOptions.targetAudience}
                onChange={(e) => handleOptionChange('targetAudience', e.target.value)}
                disabled={loading}
              >
                <option value="">Auto-detect</option>
                <option value="startups">Startups</option>
                <option value="small business">Small Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="developers">Developers</option>
                <option value="marketers">Marketers</option>
                <option value="designers">Designers</option>
                <option value="consumers">Consumers (B2C)</option>
                <option value="agencies">Agencies</option>
                <option value="freelancers">Freelancers</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="region">Target Region</label>
              <select
                id="region"
                value={advancedOptions.region}
                onChange={(e) => handleOptionChange('region', e.target.value)}
                disabled={loading}
              >
                <option value="global">Global</option>
                <option value="us">United States</option>
                <option value="europe">Europe</option>
                <option value="uk">United Kingdom</option>
                <option value="asia">Asia-Pacific</option>
                <option value="latam">Latin America</option>
              </select>
            </div>
          </div>

          <div className="input-group full-width">
            <label htmlFor="productDescription">Product/Service Description</label>
            <textarea
              id="productDescription"
              placeholder="Brief description of what your product/service does (helps AI generate better queries)"
              value={advancedOptions.productDescription}
              onChange={(e) => handleOptionChange('productDescription', e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="input-group full-width">
            <label htmlFor="mainUseCases">Main Use Cases</label>
            <input
              id="mainUseCases"
              type="text"
              placeholder="e.g., lead tracking, team collaboration, invoicing (comma-separated)"
              value={advancedOptions.mainUseCases}
              onChange={(e) => handleOptionChange('mainUseCases', e.target.value)}
              disabled={loading}
            />
            <span className="input-hint">What problems does your product solve?</span>
          </div>

          <div className="input-group full-width">
            <label htmlFor="knownCompetitors">Known Competitors</label>
            <input
              id="knownCompetitors"
              type="text"
              placeholder="e.g., HubSpot, Salesforce, Pipedrive (comma-separated)"
              value={advancedOptions.knownCompetitors}
              onChange={(e) => handleOptionChange('knownCompetitors', e.target.value)}
              disabled={loading}
            />
            <span className="input-hint">Who do you compete with? We'll check how you rank against them.</span>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={loading || !domain.trim()}
      >
        {loading ? (
          <>
            <span className="spinner-small"></span>
            Analyzing...
          </>
        ) : (
          <>🚀 Analyze Visibility</>
        )}
      </button>

      {!loading && (
        <p className="analysis-note">
          Analysis takes ~30-60 seconds. We'll query AI engines and analyze responses.
        </p>
      )}
    </form>
  );
}

export default AnalysisForm;
