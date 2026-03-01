# AI Visibility Tracker - Full Documentation

**Measure how visible your brand is in AI-generated answers.**

This tool analyzes brand mentions across AI search engines (like ChatGPT, Gemini, etc.) and provides actionable recommendations to improve visibility.

---

## 📖 Documentation Index

| Document | Description |
|----------|-------------|
| [Quick Start](QUICKSTART.md) | Get running in 5 minutes |
| [API Reference](API.md) | Complete API documentation |
| [Database Schema](DATABASE.md) | Database structure and models |
| [Backend Services](SERVICES.md) | Service layer documentation |
| [Frontend Components](COMPONENTS.md) | React component reference |
| [Configuration](CONFIGURATION.md) | Environment and settings |
| [Scoring System](SCORING.md) | How scores are calculated |
| [Troubleshooting](TROUBLESHOOTING.md) | Common issues and solutions |

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Scoring System](#scoring-system)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

---

## Overview

Traditional SEO measures rankings in search engines. **AI Visibility Tracker** measures brand visibility inside AI-generated answers.

Given a brand/domain, the system:

1. **Identifies the industry** using AI analysis
2. **Discovers competitors** in that specific field
3. **Generates smart queries** like "Brand vs Competitor" comparisons
4. **Queries AI providers** (Ollama, Gemini, etc.)
5. **Analyzes responses** for brand mentions and positions
6. **Computes a visibility score** (0-100)
7. **Generates recommendations** (standard + AI-powered)
8. **Tracks score history** over time

---

## Features

### Core Features
- ✅ **AI-Powered Industry Detection** - Automatically identifies what field a company is in
- ✅ **Smart Competitor Detection** - Only detects actual industry competitors
- ✅ **Multi-Provider AI Queries** - Supports Ollama (local) and Gemini
- ✅ **Visibility Scoring** - Fair 0-100 scoring with base score of 50
- ✅ **Detailed Recommendations** - Standard + AI-generated with action steps
- ✅ **Historical Tracking** - Chart showing score trends over time
- ✅ **Markdown Rendering** - AI insights rendered with proper formatting

### Query Types Generated
- **Direct Comparisons**: "Brand vs Competitor: which is better?"
- **Alternatives**: "What are the best alternatives to Brand?"
- **Industry Questions**: "Best tool for [specific use case]?"
- **Market Leaders**: "Who dominates the [industry] market?"
- **Reviews**: "Pros and cons of Brand"

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│  Express API    │────▶│     MySQL       │
│   (Port 3000)   │     │   (Port 5000)   │     │   (Port 3306)   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   AI Providers  │
                        │  (Ollama/Gemini)│
                        └─────────────────┘
```

### Tech Stack
- **Frontend**: React, Recharts, react-markdown, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL 8.0
- **AI**: Ollama (llama3.2), Google Gemini (optional)
- **Infrastructure**: Docker, Docker Compose

### Project Structure
```
/client
  /app
    /src
      /components     # React components
      /services       # API client
      App.js          # Main app
      App.css         # Styles

/server
  /src
    /config           # Database connection
    /controllers      # Route handlers
    /models           # MySQL models
    /routes           # API routes
    /services         # Business logic
      - queryGenerator.js       # AI-powered query generation
      - responseAnalyzer.js     # Industry-aware competitor detection
      - visibilityScorer.js     # Balanced scoring algorithm
      - recommendationEngine.js # Standard + AI recommendations
      - analysisPipeline.js     # Orchestrates full analysis
      - aiClient.js             # Multi-provider AI client

/database
  schema.sql          # Database initialization

/docs
  README.md           # This documentation
```

---

## Installation

### Prerequisites
- Docker & Docker Compose
- Ollama (for local AI) - https://ollama.ai

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd DecuplerExercice
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Ollama** (on host machine)
   ```bash
   ollama serve
   ollama pull llama3.2
   ```

4. **Start the application**
   ```bash
   docker-compose up --build
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## Configuration

### Environment Variables (`.env`)

```env
# Database
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=ai_visibility

# AI Providers (comma-separated)
AI_PROVIDERS=ollama

# Ollama (local AI)
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2

# Gemini (optional - comment out if not using)
# GEMINI_API_KEY=your_api_key_here
```

### Adding Gemini Support

1. Get an API key from https://makersuite.google.com/
2. Add to `.env`:
   ```env
   AI_PROVIDERS=ollama,gemini
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the server

---

## Usage

### Web Interface

1. Open http://localhost:3000
2. Enter a brand name (e.g., "Salesforce", "Facebook", "Shopify")
3. Optionally specify an industry
4. Click "Analyze"
5. View results:
   - **Visibility Score** (0-100)
   - **Analysis Stats** (mention rate, positions)
   - **Top Competitors** (from same industry)
   - **Score History** (chart)
   - **Recommendations** (standard + AI-generated)

### API Usage

```bash
# Run full analysis
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"domain": "Salesforce", "industry": "CRM"}'

# Preview queries (without running)
curl -X POST http://localhost:5000/api/queries/preview \
  -H "Content-Type: application/json" \
  -d '{"domain": "Facebook", "useAI": true}'

# Get score history
curl http://localhost:5000/api/analysis/history/1
```

---

## API Reference

### Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis` | Run full analysis |
| GET | `/api/analysis/domains` | List all analyzed domains |
| GET | `/api/analysis/domain/:id` | Get domain details |
| GET | `/api/analysis/report/:id` | Get existing report |
| GET | `/api/analysis/history/:id` | Get score history |

### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/queries` | Generate queries for domain |
| POST | `/api/queries/preview` | Preview queries without saving |
| GET | `/api/queries/:domainId` | Get queries for domain |

### Request/Response Examples

**POST /api/analysis**
```json
// Request
{
  "domain": "Salesforce",
  "industry": "CRM"  // optional
}

// Response
{
  "success": true,
  "report": {
    "domain": { "id": 1, "domain_name": "Salesforce", "industry": "CRM" },
    "companyAnalysis": {
      "industry": "CRM",
      "topCompetitors": ["HubSpot", "Zoho CRM", "Pipedrive"],
      "mainUseCases": ["sales tracking", "lead management"]
    },
    "score": { "score": 72.5, "breakdown": {...} },
    "recommendations": [...],
    "aiRecommendations": [...]
  }
}
```

---

## Scoring System

### How Scores Work

The scoring system starts from a **neutral base of 50** and adjusts based on analysis:

| Factor | Points | Description |
|--------|--------|-------------|
| Base Score | 50 | Starting point |
| Mentioned | +10 | Brand was mentioned in response |
| #1 Position | +15 | Mentioned first |
| Top 3 Position | +8 | Mentioned in top 3 |
| Competitor Before | -3 | Per competitor mentioned before brand (capped at -15) |
| Not Mentioned | -5 | Brand not mentioned at all |

### Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 80-100 | Excellent | Strong AI visibility, often mentioned first |
| 60-79 | Good | Regularly mentioned, good positioning |
| 40-59 | Average | Mentioned sometimes, room for improvement |
| 20-39 | Poor | Rarely mentioned, competitors dominate |
| 0-19 | Critical | Almost never mentioned by AI |

---

## Limitations

### Current Limitations

1. **Rate Limits**: Gemini has strict rate limits; Ollama recommended for heavy use
2. **Local AI Required**: Ollama must run on host machine for Docker to access
3. **Industry Detection**: Works best for known tech/business brands
4. **Response Time**: Full analysis takes 30-60 seconds depending on AI speed
5. **Query Volume**: Limited to ~20 queries per analysis to manage response time

### Known Issues

- AI analysis may fail silently and fall back to basic query generation
- Some niche industries may not be in the competitor database
- Historical data only available after multiple analyses

---

## Future Improvements

### Planned Features
- [ ] Scheduled automatic re-analysis (cron jobs)
- [ ] Multi-domain comparison view
- [ ] PDF/CSV report export
- [ ] User authentication
- [ ] Email notifications
- [ ] More AI providers (Claude, OpenAI)
- [ ] Sentiment analysis of mentions
- [ ] Query clustering and deduplication

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

Prototype — internal evaluation use.

---

## Support

For issues or questions, please open a GitHub issue.
