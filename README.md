# 🎯 AI Visibility Tracker

**Measure how visible your brand is inside AI-generated answers.**

AI Visibility Tracker analyzes how frequently and prominently your brand is mentioned by AI search engines (ChatGPT, Gemini, Perplexity, etc.) and provides actionable recommendations to improve visibility.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Docker](https://img.shields.io/badge/docker-required-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

Traditional SEO measures rankings in search engines. **AI Visibility Tracker** measures brand visibility inside AI-generated answers.

### What It Does

Given a brand or domain, the system:

1. **🔍 Analyzes the Company** - Uses AI to detect industry, competitors, and use cases
2. **📝 Generates Smart Queries** - Creates realistic questions users might ask AI
3. **🤖 Queries AI Providers** - Sends queries to Ollama (local) and/or Gemini
4. **📊 Analyzes Responses** - Detects brand mentions, positions, and competitors
5. **📈 Computes Visibility Score** - Fair 0-100 scoring system
6. **💡 Generates Recommendations** - Standard + AI-powered actionable steps
7. **📉 Tracks History** - Charts showing score evolution over time

---

## ✨ Features

### Core Features
- ✅ **AI-Powered Industry Detection** - Automatically identifies what field a company operates in
- ✅ **Smart Competitor Detection** - Detects only actual industry competitors (not random brands)
- ✅ **Multi-Provider AI Queries** - Supports Ollama (local) and Google Gemini
- ✅ **Real-time Streaming** - Watch analysis progress live with Server-Sent Events
- ✅ **Visibility Scoring** - Fair 0-100 scoring starting from neutral base of 50
- ✅ **Detailed Recommendations** - Standard + AI-generated with action steps and timeframes
- ✅ **Historical Tracking** - Chart showing score trends over time
- ✅ **Sentiment Analysis** - Analyzes how positively/negatively your brand is mentioned
- ✅ **Query Breakdown** - See brand queries vs discovery queries performance
- ✅ **Export Functionality** - Export analysis reports

### Query Types Generated
| Type | Description | Example |
|------|-------------|---------|
| **Direct Brand** | Tests if AI knows the brand | "What is Salesforce?" |
| **Comparison** | Tests positioning vs competitors | "Salesforce vs HubSpot" |
| **Discovery** | Tests if AI naturally recommends | "Best CRM for small business?" |
| **Use Case** | Tests specific scenario mentions | "CRM for lead management" |
| **Website** | Tests domain visibility | "Best ecommerce platform website?" |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 
- [Ollama](https://ollama.ai/) (for local AI)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/DecuplerExercice.git
cd DecuplerExercice

# 2. Set up environment
cp .env.example .env
# Edit .env with your settings

# 3. Start Ollama (on host machine)
ollama serve
ollama pull llama3.2

# 4. Start the application
docker-compose up --build

# 5. Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### First Analysis

1. Open http://localhost:3000
2. Enter a brand name (e.g., "Salesforce")
3. Optionally add context (industry, competitors)
4. Click **Analyze**
5. Watch the live progress
6. View your visibility report!

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Express API    │────▶│     MySQL       │
│   (Port 3000)   │     │   (Port 5000)   │     │   (Port 3306)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────┴────────┐
                        ▼                 ▼
               ┌─────────────┐    ┌─────────────┐
               │   Ollama    │    │   Gemini    │
               │   (Local)   │    │   (Cloud)   │
               └─────────────┘    └─────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Recharts, react-markdown, Axios |
| **Backend** | Node.js 20, Express 4 |
| **Database** | MySQL 8.0 |
| **AI** | Ollama (llama3.2), Google Gemini |
| **Infrastructure** | Docker, Docker Compose |

### Project Structure

```
/
├── client/                 # React frontend
│   └── app/
│       └── src/
│           ├── components/ # UI components
│           ├── services/   # API client
│           └── App.js      # Main application
├── server/                 # Express backend
│   └── src/
│       ├── config/         # Database connection
│       ├── controllers/    # Route handlers
│       ├── models/         # MySQL models
│       ├── routes/         # API routes
│       └── services/       # Business logic
│           ├── aiClient.js             # Multi-provider AI client
│           ├── analysisPipeline.js     # Orchestrates analysis
│           ├── queryGenerator.js       # Generates test queries
│           ├── responseAnalyzer.js     # Analyzes AI responses
│           ├── visibilityScorer.js     # Calculates scores
│           └── recommendationEngine.js # Generates recommendations
├── database/               # SQL schemas
├── docs/                   # Documentation
└── docker-compose.yml      # Container orchestration
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_PASSWORD=rootpassword
DB_NAME=ai_visibility

# AI Providers (comma-separated: ollama,gemini)
AI_PROVIDERS=ollama

# Ollama (local AI)
OLLAMA_MODEL=llama3.2

# Gemini (optional)
# GEMINI_API_KEY=your_api_key_here
```

### Adding Gemini Support

1. Get an API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to `.env`:
   ```env
   AI_PROVIDERS=ollama,gemini
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart: `docker-compose restart server`

---

## 📡 API Reference

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analysis` | Run full analysis |
| `GET` | `/api/analysis/stream` | Streaming analysis (SSE) |
| `GET` | `/api/analysis/domains` | List all analyzed domains |
| `GET` | `/api/analysis/domain/:id` | Get domain details |
| `GET` | `/api/analysis/report/:id` | Get existing report |
| `GET` | `/api/analysis/history/:id` | Get score history |

### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/queries` | Generate queries for domain |
| `POST` | `/api/queries/preview` | Preview queries without saving |
| `GET` | `/api/queries/:domainId` | Get queries for domain |

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Example: Run Analysis

```bash
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "Shopify",
    "industry": "E-commerce",
    "targetAudience": "Small business owners",
    "knownCompetitors": "WooCommerce, BigCommerce"
  }'
```

---

## 📖 Documentation

For detailed documentation, see:

- [**Quick Start Guide**](docs/QUICKSTART.md) - Get running in 5 minutes
- [**Full Documentation**](docs/README.md) - Complete API and feature reference
- [**Database Schema**](docs/DATABASE.md) - Database structure and models
- [**Services Guide**](docs/SERVICES.md) - Backend services documentation
- [**Frontend Components**](docs/COMPONENTS.md) - React component reference

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support

For issues or questions, please [open a GitHub issue](https://github.com/yourusername/DecuplerExercice/issues).
