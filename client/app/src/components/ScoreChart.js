import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { analysisAPI } from '../services/api';

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #475569',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>
          {data.fullDate}
        </p>
        <p style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
          Score: {data.score}
        </p>
        {data.mentionRate !== undefined && (
          <p style={{ color: '#10b981', fontSize: '12px', margin: '4px 0 0 0' }}>
            Mention Rate: {data.mentionRate}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

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
      const response = await analysisAPI.getHistory(domainId, 30);
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

  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          📊 No historical data yet
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Run analyses over time to see score trends.
        </p>
      </div>
    );
  }

  // If only one data point, show a simple display instead
  if (history.length === 1) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          📈 First analysis recorded
        </p>
        <p style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Score: {history[0].score}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {new Date(history[0].date).toLocaleDateString()}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '1rem' }}>
          Run more analyses to see trends over time.
        </p>
      </div>
    );
  }

  const chartData = history.map((item, index) => ({
    name: `#${history.length - index}`,
    score: parseFloat(item.score) || 0,
    fullDate: new Date(item.date).toLocaleString(),
    shortDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mentionRate: item.mentionRate
  })).reverse();

  // Calculate average for reference line
  const avgScore = chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length;

  return (
    <div className="chart-container" style={{ height: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.5} />
          <XAxis 
            dataKey="shortDate" 
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine 
            y={avgScore} 
            stroke="#f59e0b" 
            strokeDasharray="5 5" 
            strokeOpacity={0.7}
            label={{ 
              value: `Avg: ${avgScore.toFixed(1)}`, 
              fill: '#f59e0b', 
              fontSize: 10,
              position: 'right'
            }}
          />
          <ReferenceLine 
            y={50} 
            stroke="#475569" 
            strokeDasharray="3 3" 
            strokeOpacity={0.5}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#scoreGradient)"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#60a5fa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p style={{ 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)',
        marginTop: '0.5rem'
      }}>
        Showing {chartData.length} analysis{chartData.length > 1 ? 'es' : ''} • 
        <span style={{ color: '#f59e0b' }}> ── </span> Average score
      </p>
    </div>
  );
}

export default ScoreChart;
