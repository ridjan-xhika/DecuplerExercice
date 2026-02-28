const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { checkOpenAIStatus } = require('./services/openaiClient');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const queryRoutes = require('./routes/queryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
app.use('/api/queries', queryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  const openaiStatus = await checkOpenAIStatus();
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    openai: openaiStatus.working ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
