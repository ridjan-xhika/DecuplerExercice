import React, { useState, useCallback } from 'react';
import './App.css';
import AnalysisForm from './components/AnalysisForm';
import ScoreDisplay from './components/ScoreDisplay';
import StatsGrid from './components/StatsGrid';
import CompetitorList from './components/CompetitorList';
import RecommendationList from './components/RecommendationList';
import ScoreChart from './components/ScoreChart';
import LiveFeed from './components/LiveFeed';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [progress, setProgress] = useState(null);

  const handleAnalyze = useCallback((domain, options = {}) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setLiveEvents([]);
    setCurrentQuery(null);
    setProgress(null);

    // Build query string from options
    const params = new URLSearchParams({
      domain,
      ...(options.industry && { industry: options.industry }),
      ...(options.targetAudience && { targetAudience: options.targetAudience }),
      ...(options.mainUseCases && { mainUseCases: options.mainUseCases }),
      ...(options.knownCompetitors && { knownCompetitors: options.knownCompetitors }),
      ...(options.productDescription && { productDescription: options.productDescription }),
      ...(options.region && { region: options.region })
    });

    // Use Server-Sent Events for streaming
    const eventSource = new EventSource(`http://localhost:5000/api/analysis/stream?${params}`);

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setLiveEvents(prev => [...prev, { type: 'status', message: data.message }]);
    });

    eventSource.addEventListener('analysis', (e) => {
      const data = JSON.parse(e.data);
      setLiveEvents(prev => [...prev, { type: 'analysis', ...data }]);
    });

    eventSource.addEventListener('queries', (e) => {
      const data = JSON.parse(e.data);
      setProgress({ current: 0, total: data.total });
    });

    eventSource.addEventListener('query', (e) => {
      const data = JSON.parse(e.data);
      setCurrentQuery(data.question);
      setProgress(prev => ({ ...prev, current: data.index }));
    });

    eventSource.addEventListener('response', (e) => {
      const data = JSON.parse(e.data);
      setLiveEvents(prev => [...prev, { 
        type: 'response', 
        question: data.question,
        provider: data.provider,
        preview: data.preview,
        mentioned: data.mentioned
      }]);
      setProgress(prev => ({ ...prev, current: data.index }));
    });

    eventSource.addEventListener('score', (e) => {
      const data = JSON.parse(e.data);
      setLiveEvents(prev => [...prev, { type: 'score', ...data }]);
    });

    eventSource.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setReport(data.report);
      setLoading(false);
      setCurrentQuery(null);
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      if (e.data) {
        const data = JSON.parse(e.data);
        setError(data.message || 'Analysis failed');
      } else {
        setError('Connection lost. Please try again.');
      }
      setLoading(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        // Normal close after complete
        return;
      }
      setError('Connection error. Please try again.');
      setLoading(false);
      eventSource.close();
    };

  }, []);

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
          <LiveFeed 
            events={liveEvents} 
            currentQuery={currentQuery}
            progress={progress}
          />
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
              <RecommendationList 
                recommendations={
                  report.recommendations?.filter(r => !r.is_ai_generated && r.recommendation_type !== 'ai_generated') || []
                } 
                aiRecommendations={
                  report.aiRecommendations || 
                  report.recommendations?.filter(r => r.is_ai_generated || r.recommendation_type === 'ai_generated') || []
                }
              />
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
