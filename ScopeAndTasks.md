# AI Visibility Tracker

Measure how visible a brand or domain is inside AI search engines (LLMs) such as ChatGPT, Gemini, and Perplexity — and generate actionable recommendations to improve that visibility.

This project is a prototype built to simulate “SEO for AI answers”.

---

## 🎯 Project Goal

Traditional SEO measures rankings in search engines.

This project measures **brand visibility inside AI-generated answers**.

Given a domain, the system:

1. Generates realistic user queries related to its industry  
2. Asks multiple AI engines those queries  
3. Detects whether the brand is mentioned  
4. Identifies competitors mentioned before it  
5. Computes a visibility score  
6. Explains why competitors appear  
7. Generates recommendations to improve visibility  
8. Tracks evolution over time  

---

## 🧠 Problem Statement

AI assistants are becoming a primary discovery channel.

Brands now compete to be:

- cited
- recommended
- ranked first
- associated with specific use cases

This tool measures and analyzes that positioning.

---

## 🚀 Core Features (MVP)

### Domain Analysis
- Input a domain or brand name
- Automatically detect or infer industry (optional)

### Query Generation
- Generate realistic user prompts
- Cover comparisons, alternatives, recommendations, etc.

### AI Response Collection
- Send queries to multiple LLM providers
- Store raw responses

### Response Analysis
- Detect brand mentions
- Detect mention order (ranking)
- Identify competitors
- Extract context snippets

### Visibility Scoring
- Compute score per query
- Aggregate global score
- Store historical scores

### Recommendations Engine
- Identify gaps in visibility
- Explain competitor advantage
- Generate actionable improvements

### Historical Tracking
- Store past results
- Display score evolution

---

## 🏗 Tech Stack

Frontend:
- React
- Axios
- Chart library (Recharts / Chart.js)

Backend:
- Node.js
- Express

Database:
- MySQL

AI Layer:
- LLM API providers
- Prompt orchestration
- Text analysis

---

## 🧩 System Architecture

User Input (domain)
        ↓
Query Generator
        ↓
AI Providers
        ↓
Response Storage
        ↓
Response Analyzer
        ↓
Visibility Scorer
        ↓
Recommendation Engine
        ↓
Dashboard

---

## 🗄 Database Schema

### domains
- id
- domain_name
- industry
- created_at

### prompts
- id
- domain_id
- query_text
- created_at

### ai_responses
- id
- prompt_id
- ai_provider
- response_text
- created_at

### brand_mentions
- id
- response_id
- brand_name
- position
- sentiment
- context_snippet

### competitors
- id
- response_id
- competitor_name
- position

### visibility_scores
- id
- domain_id
- score
- created_at

---

## 📊 Visibility Score (MVP Logic)

Example scoring model:

- Brand mentioned → +3  
- Top 1 mention → +5  
- Top 3 mention → +3  
- Each competitor before brand → −2  

Normalized to 0–100.

---

## 📁 Project Structure

/client
  /components
  /pages
  /services

/server
  /controllers
  /services
  /routes
  /models
  /config

/database
  schema.sql

---

## ⚙ Analysis Pipeline

1. Create or load domain  
2. Generate queries  
3. Send queries to AI providers  
4. Store responses  
5. Extract mentions and competitors  
6. Compute visibility score  
7. Generate recommendations  
8. Save results  
9. Return report  

---

## 📋 Task List (GitHub Project)

### Project Setup
- Initialize repository
- Setup React frontend
- Setup Express backend
- Configure MySQL connection
- Environment variables
- Health check endpoint

### Database
- Design schema
- Create migration script
- Create models
- Seed test data

### Query Generation
- Build query generator service
- LLM prompt for industry queries
- Endpoint to generate queries
- Store queries in DB

### AI Integration
- AI client abstraction layer
- Provider configuration
- Response normalization
- Store responses

### Response Analysis (Core)
- Detect brand mentions
- Extract mention position
- Identify competitors
- Extract context snippet
- Store structured analysis

### Visibility Scoring
- Implement scoring algorithm
- Compute per-query score
- Aggregate global score
- Persist history

### Recommendation Engine
- Analyze visibility gaps
- Detect dominant competitors
- Generate improvement suggestions
- Endpoint to retrieve recommendations

### Dashboard UI
- Domain input form
- Analysis trigger button
- Visibility score display
- Competitor list
- AI response viewer
- Recommendations panel
- Historical score chart

### Pipeline Orchestration
- Single endpoint for full analysis
- Async execution handling
- Error handling and retries

### Testing
- API route tests
- Scoring tests
- Extraction logic tests

### Documentation
- Installation guide
- Architecture explanation
- Assumptions and limitations
- Future improvements

---

## ⭐ Optional Enhancements

- Scheduled automatic re-analysis
- Multi-domain comparison
- Sentiment analysis
- Export PDF report
- Auth system
- Job queue for async processing
- Provider reliability weighting
- Query clustering
- Prompt reproducibility controls

---

## 🧪 MVP Success Criteria

The system can:

✔ analyze a domain end-to-end  
✔ detect brand presence in AI answers  
✔ identify competitors  
✔ compute a visibility score  
✔ generate recommendations  
✔ store historical results  

---

## ⏱ Suggested Development Timeline (2 Days)

Day 1:
- Backend setup
- Database schema
- Query generation
- AI calls
- Response storage

Day 2:
- Response analysis
- Scoring
- Recommendations
- Dashboard UI
- History chart

---

## 📄 License

Prototype — internal evaluation use.