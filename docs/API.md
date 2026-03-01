# 📡 API Documentation

Complete API reference for AI Visibility Tracker.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Analysis](#analysis)
  - [Queries](#queries)
  - [AI](#ai)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Overview

The AI Visibility Tracker API is a RESTful API that allows you to:
- Run brand visibility analyses
- Stream real-time analysis progress
- Retrieve historical data and reports
- Generate and preview queries

---

## Base URL

```
http://localhost:5000/api
```

For production deployments, replace with your production URL.

---

## Authentication

Currently, the API does not require authentication. This is planned for future versions.

---

## Endpoints

### Health Check

#### GET `/api/health`

Check API and service health status.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected",
  "ai": {
    "ollama": "connected",
    "gemini": "disconnected",
    "anyWorking": true
  },
  "ollamaModels": ["llama3.2"]
}
```

---

### Analysis

#### POST `/api/analysis`

Run a full visibility analysis for a brand/domain.

**Request Body:**
```json
{
  "domain": "Salesforce",
  "industry": "CRM",
  "targetAudience": "Enterprise sales teams",
  "mainUseCases": "lead tracking, sales pipeline",
  "knownCompetitors": "HubSpot, Zoho CRM",
  "productDescription": "Cloud-based CRM platform",
  "region": "global"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `domain` | string | ✅ | Brand name or domain to analyze |
| `industry` | string | ❌ | Industry/vertical (auto-detected if not provided) |
| `targetAudience` | string | ❌ | Target customer segment |
| `mainUseCases` | string | ❌ | Comma-separated use cases |
| `knownCompetitors` | string | ❌ | Comma-separated competitor names |
| `productDescription` | string | ❌ | Brief product description |
| `region` | string | ❌ | Geographic focus (default: "global") |

**Response:**
```json
{
  "domain": {
    "id": 1,
    "domain_name": "Salesforce",
    "industry": "CRM"
  },
  "companyAnalysis": {
    "industry": "CRM",
    "topCompetitors": ["HubSpot", "Zoho CRM", "Pipedrive"],
    "mainUseCases": ["sales tracking", "lead management"]
  },
  "queries": {
    "count": 35,
    "aiEnhanced": true
  },
  "aiResponses": {
    "promptsTotal": 35,
    "promptsSuccessful": 34,
    "promptsFailed": 1,
    "totalResponses": 34
  },
  "analysis": {
    "totalResponses": 34,
    "responsesWithTarget": 28,
    "totalMentions": 32,
    "top1Count": 15,
    "top3Count": 24
  },
  "score": {
    "score": 72.5,
    "breakdown": {
      "base": 50,
      "mentions": 8.2,
      "top1": 11.5,
      "top3": 2.8,
      "competitorPenalty": -1.5,
      "notMentionedPenalty": -0.5
    },
    "stats": {
      "totalQueries": 34,
      "totalMentions": 32,
      "top1Count": 15,
      "top3Count": 24,
      "avgPosition": 1.8,
      "mentionRate": 82
    }
  },
  "interpretation": "Good - Regularly mentioned, good positioning",
  "trend": {
    "scores": [65.2, 68.5, 72.5],
    "direction": "up"
  },
  "recommendations": [...],
  "aiRecommendations": [...],
  "topCompetitors": [...]
}
```

---

#### GET `/api/analysis/stream`

Stream real-time analysis progress using Server-Sent Events.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `domain` | string | ✅ | Brand/domain to analyze |
| `industry` | string | ❌ | Industry hint |
| `targetAudience` | string | ❌ | Target audience |
| `mainUseCases` | string | ❌ | Use cases |
| `knownCompetitors` | string | ❌ | Known competitors |
| `productDescription` | string | ❌ | Product description |
| `region` | string | ❌ | Region |

**SSE Events:**

| Event | Data | Description |
|-------|------|-------------|
| `status` | `{ message: string }` | Status update |
| `analysis` | `{ industry, competitors }` | Company analysis done |
| `queries` | `{ total: number }` | Queries generated |
| `query` | `{ index, question }` | Processing query |
| `response` | `{ question, provider, preview, mentioned }` | AI response |
| `score` | `{ score, interpretation }` | Score calculated |
| `complete` | `{ report }` | Analysis complete |
| `error` | `{ message }` | Error occurred |

**Example Usage:**
```javascript
const eventSource = new EventSource(
  'http://localhost:5000/api/analysis/stream?domain=Salesforce&industry=CRM'
);

eventSource.addEventListener('response', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Query: ${data.question}`);
  console.log(`Mentioned: ${data.mentioned}`);
});

eventSource.addEventListener('complete', (e) => {
  const { report } = JSON.parse(e.data);
  console.log(`Score: ${report.score.score}`);
  eventSource.close();
});
```

---

#### GET `/api/analysis/domains`

Get all analyzed domains.

**Response:**
```json
{
  "success": true,
  "domains": [
    {
      "id": 1,
      "domain_name": "Salesforce",
      "industry": "CRM",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T14:20:00Z"
    }
  ]
}
```

---

#### GET `/api/analysis/domain/:domainId`

Get details for a specific domain.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `domainId` | number | Domain ID |

**Response:**
```json
{
  "success": true,
  "domain": {
    "id": 1,
    "domain_name": "Salesforce",
    "industry": "CRM",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "queryCount": 35,
  "responseCount": 34,
  "latestScore": 72.5
}
```

---

#### GET `/api/analysis/report/:domainId`

Get existing analysis report for a domain.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `domainId` | number | Domain ID |

**Response:**
Same structure as POST `/api/analysis` response.

---

#### GET `/api/analysis/history/:domainId`

Get score history for charts.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `domainId` | number | Domain ID |

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 30 | Max records to return |

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "score": 72.5,
      "created_at": "2024-01-15T14:20:00Z"
    },
    {
      "score": 68.5,
      "created_at": "2024-01-10T09:15:00Z"
    }
  ]
}
```

---

### Queries

#### POST `/api/queries`

Generate and save queries for a domain.

**Request Body:**
```json
{
  "domain": "Salesforce",
  "industry": "CRM",
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "queries": [
    {
      "queryText": "What is Salesforce?",
      "queryType": "directBrand"
    },
    {
      "queryText": "Best CRM for enterprise?",
      "queryType": "productDiscovery"
    }
  ],
  "count": 35,
  "aiEnhanced": true
}
```

---

#### POST `/api/queries/preview`

Preview queries without saving to database.

**Request Body:**
```json
{
  "domain": "Shopify",
  "industry": "E-commerce",
  "useAI": true
}
```

**Response:**
Same as POST `/api/queries` but queries are not persisted.

---

#### GET `/api/queries/:domainId`

Get all queries for a domain.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `domainId` | number | Domain ID |

**Response:**
```json
{
  "success": true,
  "queries": [
    {
      "id": 1,
      "query_text": "What is Salesforce?",
      "query_type": "directBrand",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### AI

#### GET `/api/ai/status`

Check AI provider status.

**Response:**
```json
{
  "ollama": {
    "working": true,
    "models": ["llama3.2"]
  },
  "gemini": {
    "working": false,
    "error": "API key not configured"
  },
  "anyWorking": true,
  "enabledProviders": ["ollama"]
}
```

---

#### POST `/api/ai/ask`

Send a direct query to AI providers.

**Request Body:**
```json
{
  "query": "What are the best CRM tools?",
  "provider": "ollama"
}
```

**Response:**
```json
{
  "success": true,
  "responses": [
    {
      "provider": "ollama",
      "success": true,
      "response": "Some of the best CRM tools include...",
      "responseTime": 2340
    }
  ]
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here",
  "details": "Additional details if available"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request - Invalid parameters |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Domain is required` | Missing domain parameter | Provide domain in request |
| `Domain not found` | Invalid domain ID | Check domain exists |
| `No AI providers available` | All AI services down | Check Ollama is running |
| `Database connection failed` | MySQL not reachable | Check database container |

---

## Examples

### cURL Examples

#### Run Analysis
```bash
curl -X POST http://localhost:5000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "Salesforce",
    "industry": "CRM"
  }'
```

#### Check Health
```bash
curl http://localhost:5000/api/health
```

#### Get Score History
```bash
curl http://localhost:5000/api/analysis/history/1?limit=10
```

#### Preview Queries
```bash
curl -X POST http://localhost:5000/api/queries/preview \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "Shopify",
    "useAI": true
  }'
```

### JavaScript Examples

#### Using Fetch API
```javascript
// Run analysis
const response = await fetch('http://localhost:5000/api/analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    domain: 'Salesforce',
    industry: 'CRM'
  })
});
const data = await response.json();
console.log(`Score: ${data.score.score}`);
```

#### Using SSE for Streaming
```javascript
const params = new URLSearchParams({
  domain: 'Salesforce',
  industry: 'CRM'
});

const eventSource = new EventSource(
  `http://localhost:5000/api/analysis/stream?${params}`
);

eventSource.addEventListener('response', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Processing: ${data.question}`);
});

eventSource.addEventListener('complete', (e) => {
  const { report } = JSON.parse(e.data);
  console.log('Analysis complete:', report);
  eventSource.close();
});

eventSource.onerror = () => {
  console.error('Connection lost');
  eventSource.close();
};
```

### Python Examples

```python
import requests

# Run analysis
response = requests.post(
    'http://localhost:5000/api/analysis',
    json={
        'domain': 'Salesforce',
        'industry': 'CRM'
    }
)
data = response.json()
print(f"Score: {data['score']['score']}")

# Get history
history = requests.get(
    'http://localhost:5000/api/analysis/history/1',
    params={'limit': 10}
).json()

for record in history['history']:
    print(f"{record['created_at']}: {record['score']}")
```
