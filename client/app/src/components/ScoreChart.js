import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analysisAPI } from '../services/api';

function ScoreChart({ domainId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (domainId) {
      fetchHistory();
    }
  }, [domainId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await analysisAPI.getHistory(domainId, 10);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>Loading chart...</p>;
  }

  if (!history || history.length < 2) {
    return (
      <p style={{ color: 'var(--text-secondary)' }}>
        Run more analyses to see score trends over time.
      </p>
    );
  }

  const chartData = history.map((item, index) => ({
    name: `#${index + 1}`,
    score: item.score,
    date: new Date(item.date).toLocaleDateString()
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={12}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#94a3b8"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreChart;
