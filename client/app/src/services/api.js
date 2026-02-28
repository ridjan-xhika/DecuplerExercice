import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Analysis API
export const analysisAPI = {
  // Run full analysis
  analyze: (domain, industry = null) => 
    api.post('/analysis', { domain, industry }),

  // Get all domains
  getDomains: () => 
    api.get('/analysis/domains'),

  // Get domain details
  getDomain: (domainId) => 
    api.get(`/analysis/domain/${domainId}`),

  // Get existing report
  getReport: (domainId) => 
    api.get(`/analysis/report/${domainId}`),

  // Get score history
  getHistory: (domainId, limit = 30) => 
    api.get(`/analysis/history/${domainId}?limit=${limit}`)
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
