import React, { useState } from 'react';
import './App.css';
import AnalysisForm from './components/AnalysisForm';
import ScoreDisplay from './components/ScoreDisplay';
import StatsGrid from './components/StatsGrid';
import CompetitorList from './components/CompetitorList';
import RecommendationList from './components/RecommendationList';
import ScoreChart from './components/ScoreChart';
import { analysisAPI } from './services/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (domain, industry) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await analysisAPI.analyze(domain, industry);
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AI <span>Visibility</span> Tracker</h1>
      </header>

      <main className="container">
        <AnalysisForm onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing brand visibility...</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              This may take a minute while we query AI providers.
            </p>
          </div>
        )}

        {!loading && report && (
          <div className="dashboard-grid">
            <div className="card">
              <ScoreDisplay 
                score={report.score?.score} 
                interpretation={report.interpretation}
                trend={report.trend}
              />
            </div>

            <div className="card">
              <h2 className="card-title">Analysis Stats</h2>
              <StatsGrid stats={report.score?.stats} />
            </div>

            <div className="card">
              <h2 className="card-title">Top Competitors</h2>
              <CompetitorList competitors={report.topCompetitors} />
            </div>

            <div className="card">
              <h2 className="card-title">Score History</h2>
              <ScoreChart domainId={report.domain?.id} />
            </div>

            <div className="card full-width">
              <h2 className="card-title">Recommendations</h2>
              <RecommendationList recommendations={report.recommendations} />
            </div>
          </div>
        )}

        {!loading && !report && !error && (
          <div className="empty-state">
            <h3>Ready to analyze</h3>
            <p>Enter a brand or domain name above to measure its AI visibility.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
