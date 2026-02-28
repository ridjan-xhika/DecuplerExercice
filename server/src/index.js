const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { checkAllProviders } = require('./services/aiClient');

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
  const aiStatus = await checkAllProviders();
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    ai: {
      ollama: aiStatus.ollama.working ? 'connected' : 'disconnected',
      gemini: aiStatus.gemini.working ? 'connected' : 'disconnected',
      anyWorking: aiStatus.anyWorking
    },
    ollamaModels: aiStatus.ollama.models || []
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
