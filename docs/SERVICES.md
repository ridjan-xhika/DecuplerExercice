# 🔧 Backend Services Documentation

This document describes the backend services that power AI Visibility Tracker.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Service Architecture](#service-architecture)
- [Services](#services)
  - [Analysis Pipeline](#analysis-pipeline)
  - [Query Generator](#query-generator)
  - [AI Client](#ai-client)
  - [Response Analyzer](#response-analyzer)
  - [Visibility Scorer](#visibility-scorer)
  - [Recommendation Engine](#recommendation-engine)
  - [Streaming Analysis](#streaming-analysis)

---

## Overview

The backend services are organized into modular components that work together to:

1. Generate intelligent queries based on brand/domain
2. Send queries to multiple AI providers
3. Analyze AI responses for brand mentions
4. Calculate visibility scores
5. Generate actionable recommendations

All services are located in `/server/src/services/`.

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Analysis Pipeline                            │
│                  (analysisPipeline.js)                          │
│         Orchestrates the entire analysis workflow                │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐
│   Query     │ │    AI       │ │  Response   │ │  Visibility     │
│  Generator  │ │   Client    │ │  Analyzer   │ │    Scorer       │
│             │ │             │ │             │ │                 │
│ Creates     │ │ Routes to   │ │ Detects     │ │ Calculates      │
│ smart       │ │ Ollama/     │ │ mentions &  │ │ score from      │
│ queries     │ │ Gemini      │ │ competitors │ │ 0-100           │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘
                                       │              │
                                       ▼              ▼
                               ┌─────────────────────────────────┐
                               │    Recommendation Engine        │
                               │                                 │
                               │ Generates standard + AI-powered │
                               │ actionable recommendations      │
                               └─────────────────────────────────┘
```

---

## Services

### Analysis Pipeline

**File:** `analysisPipeline.js`

The main orchestrator that coordinates the entire analysis workflow.

#### Key Functions

##### `runFullAnalysis(domainName, options)`

Runs the complete analysis pipeline for a brand/domain.

**Parameters:**
```javascript
{
  domainName: string,      // Brand or domain to analyze
  options: {
    industry: string,       // Optional: pre-specified industry
    targetAudience: string, // Optional: target audience
    mainUseCases: string,   // Optional: comma-separated use cases
    knownCompetitors: string, // Optional: comma-separated competitors
    productDescription: string, // Optional: what the product does
    region: string          // Optional: geographic region
  }
}
```

**Returns:**
```javascript
{
  success: boolean,
  report: {
    domain: { id, domain_name, industry },
    companyAnalysis: { industry, topCompetitors, mainUseCases },
    queries: { count, generated, aiEnhanced },
    aiResponses: { promptsTotal, promptsSuccessful, promptsFailed },
    analysis: { totalResponses, responsesWithTarget, totalMentions, top1Count, top3Count },
    score: { score, breakdown, stats },
    interpretation: string,
    trend: { scores, direction },
    recommendations: [...],
    aiRecommendations: [...],
    topCompetitors: [...]
  }
}
```

**Pipeline Steps:**
1. Create or find domain in database
2. Analyze company with AI (detect industry, competitors)
3. Generate queries (brand + discovery queries)
4. Send queries to all AI providers
5. Analyze responses for mentions and positions
6. Calculate visibility score
7. Get score trend (historical data)
8. Generate recommendations (standard + AI)
9. Get top competitors

---

### Query Generator

**File:** `queryGenerator.js`

Generates comprehensive queries to test brand visibility across different scenarios.

#### Query Types

| Category | Mentions Brand | Purpose |
|----------|---------------|---------|
| **Brand Queries** | ✅ Yes | Test if AI knows the brand |
| **Discovery Queries** | ❌ No | Test if AI naturally recommends |
| **Website Queries** | ❌ No | Test domain/URL visibility |

#### Key Functions

##### `generateQueriesWithAI(domain, industry, options)`

Uses AI to generate smarter, context-aware queries.

```javascript
const queries = await generateQueriesWithAI('Shopify', 'ecommerce', {
  queriesPerType: 3,
  maxTotalQueries: 35,
  knownCompetitors: 'WooCommerce, BigCommerce',
  targetAudience: 'small business owners'
});
```

##### `analyzeCompanyWithAI(domainName, context)`

Analyzes a company using AI to detect industry, competitors, and use cases.

```javascript
const analysis = await analyzeCompanyWithAI('Salesforce', {
  industry: 'CRM',
  targetAudience: 'Enterprise sales teams'
});

// Returns:
{
  industry: 'CRM',
  topCompetitors: ['HubSpot', 'Zoho CRM', 'Pipedrive'],
  mainUseCases: ['sales tracking', 'lead management', 'customer relationships'],
  productTypes: ['CRM software', 'sales platform']
}
```

##### `detectInputType(input)`

Detects if input is a website domain or brand name.

```javascript
detectInputType('shopify.com');
// { isDomain: true, cleanName: 'Shopify', domain: 'shopify.com', inputType: 'website' }

detectInputType('Nike');
// { isDomain: false, cleanName: 'Nike', domain: null, inputType: 'physical_brand' }
```

#### Query Templates

```javascript
// Brand Queries (mention brand)
"What is {brand}?"
"How do you rate {brand}?"
"{brand} vs {competitor}?"

// Discovery Queries (don't mention brand)
"Best {productType}?"
"What should I use to {productAction}?"
"Top {productType} in 2024?"

// Website Queries
"Best website for {productAction}?"
"Top {productType} platforms?"
```

---

### AI Client

**File:** `aiClient.js`

Unified client that routes queries to multiple AI providers.

#### Supported Providers

| Provider | Type | Configuration |
|----------|------|---------------|
| **Ollama** | Local | `OLLAMA_URL`, `OLLAMA_MODEL` |
| **Gemini** | Cloud | `GEMINI_API_KEY` |

#### Key Functions

##### `askAllProviders(query, options)`

Sends a query to ALL enabled providers and returns aggregated results.

```javascript
const results = await askAllProviders('What is the best CRM?');

// Returns:
[
  { provider: 'ollama', success: true, response: '...' },
  { provider: 'gemini', success: true, response: '...' }
]
```

##### `checkAllProviders()`

Checks the health status of all AI providers.

```javascript
const status = await checkAllProviders();

// Returns:
{
  ollama: { working: true, models: ['llama3.2'] },
  gemini: { working: true },
  anyWorking: true,
  allWorking: true
}
```

##### `getWorkingProviders()`

Returns list of currently working provider names.

```javascript
const providers = await getWorkingProviders();
// ['ollama', 'gemini']
```

#### Provider Configuration

```env
# Enable providers (comma-separated)
AI_PROVIDERS=ollama,gemini

# Ollama settings
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2

# Gemini settings
GEMINI_API_KEY=your_api_key
```

---

### Response Analyzer

**File:** `responseAnalyzer.js`

Analyzes AI responses to detect brand mentions, positions, and competitors.

#### Key Functions

##### `analyzeAllResponses(responses, targetBrand)`

Analyzes multiple AI responses for brand mentions.

```javascript
const analysis = await analyzeAllResponses(responses, 'Salesforce');

// Returns:
{
  totalResponses: 20,
  responsesWithTarget: 15,
  totalMentions: 18,
  top1Count: 8,      // Times mentioned first
  top3Count: 12,     // Times in top 3
  analyses: [...],   // Per-response details
  sentiment: { positive: 12, neutral: 5, negative: 1 }
}
```

##### `analyzeMentionSentiment(text, brandName)`

Analyzes the sentiment of how a brand is mentioned.

```javascript
const sentiment = analyzeMentionSentiment(responseText, 'Salesforce');
// { sentiment: 'positive', confidence: 0.85 }
```

#### Industry-Aware Competitor Detection

The analyzer uses industry mappings to only detect **actual competitors** in the same field:

```javascript
const INDUSTRY_COMPETITORS = {
  'crm': ['salesforce', 'hubspot', 'zoho crm', 'pipedrive', ...],
  'ecommerce': ['shopify', 'woocommerce', 'bigcommerce', ...],
  'social media': ['facebook', 'instagram', 'twitter', 'tiktok', ...],
  // 30+ industries supported
};
```

This prevents false positives like counting "Amazon" as a competitor for a CRM brand.

---

### Visibility Scorer

**File:** `visibilityScorer.js`

Calculates fair visibility scores based on brand mentions.

#### Scoring Model

The scoring system starts from a **neutral base of 50** and adjusts:

| Factor | Points | Description |
|--------|--------|-------------|
| **Base Score** | 50 | Neutral starting point |
| **Mentioned** | +10 | Brand was mentioned in response |
| **#1 Position** | +15 | Mentioned first |
| **Top 3** | +8 | Mentioned in top 3 |
| **Competitor Before** | -3 each | Per competitor mentioned before (max -15) |
| **Not Mentioned** | -5 | Brand not mentioned at all |

#### Key Functions

##### `calculateScore(analysisResults)`

Calculates visibility score from analysis results.

```javascript
const scoreData = calculateScore(analysisResults);

// Returns:
{
  score: 72.5,
  rawScore: 72.5,
  maxPossibleScore: 100,
  breakdown: {
    base: 50,
    mentions: 8.5,
    top1: 11.25,
    top3: 2.4,
    competitorPenalty: -2.1,
    notMentionedPenalty: -1.5
  },
  stats: {
    totalQueries: 20,
    totalMentions: 17,
    top1Count: 8,
    top3Count: 12,
    avgPosition: 2.3,
    mentionRate: 85
  }
}
```

##### `interpretScore(score)`

Returns a human-readable interpretation.

```javascript
interpretScore(72);
// "Good - Regularly mentioned, good positioning"
```

#### Score Interpretation

| Score | Rating | Meaning |
|-------|--------|---------|
| 80-100 | Excellent | Strong AI visibility, often mentioned first |
| 60-79 | Good | Regularly mentioned, good positioning |
| 40-59 | Average | Mentioned sometimes, room for improvement |
| 20-39 | Poor | Rarely mentioned, competitors dominate |
| 0-19 | Critical | Almost never mentioned by AI |

---

### Recommendation Engine

**File:** `recommendationEngine.js`

Generates actionable recommendations to improve visibility.

#### Recommendation Types

| Type | Trigger | Focus |
|------|---------|-------|
| `visibility_gap` | Low mention rate | Increase overall visibility |
| `positioning` | Poor position when mentioned | Improve ranking |
| `competitor_gap` | Competitors rank higher | Competitive strategy |
| `content` | Missing from certain query types | Content creation |
| `ai_generated` | Always (if AI available) | Personalized AI advice |

#### Key Functions

##### `generateAndSaveRecommendations(domainId, scoreId, analysis, scoreData, trend, brandName)`

Generates both standard and AI-powered recommendations.

```javascript
const recommendations = await generateAndSaveRecommendations(
  domainId, scoreId, analysisResults, scoreData, trend, 'Salesforce'
);

// Returns:
{
  standard: [
    {
      type: 'visibility_gap',
      title: 'Increase Brand Visibility',
      description: '...',
      priority: 'high',
      actionSteps: [
        { step: 1, action: 'Audit content', details: '...', timeframe: '1-2 days' }
      ]
    }
  ],
  aiGenerated: [
    {
      type: 'ai_generated',
      title: 'AI-Powered Recommendation',
      description: 'Based on analysis of Salesforce...',
      priority: 'high',
      isAiGenerated: true,
      aiProvider: 'ollama'
    }
  ]
}
```

#### Action Steps Structure

Each recommendation includes detailed action steps:

```javascript
{
  step: 1,
  action: 'Audit your existing content',
  details: 'Review all website pages, blog posts, and marketing materials...',
  timeframe: '1-2 days'
}
```

---

### Streaming Analysis

**File:** `streamingAnalysis.js`

Provides real-time analysis updates via Server-Sent Events (SSE).

#### Event Types

| Event | Data | Description |
|-------|------|-------------|
| `status` | `{ message }` | Status update message |
| `analysis` | `{ industry, competitors }` | Company analysis complete |
| `queries` | `{ total }` | Queries generated |
| `query` | `{ index, question }` | Current query being processed |
| `response` | `{ question, provider, preview, mentioned }` | AI response received |
| `score` | `{ score, interpretation }` | Score calculated |
| `complete` | `{ report }` | Full analysis complete |
| `error` | `{ message }` | Error occurred |

#### Usage

```javascript
// Client-side
const eventSource = new EventSource('/api/analysis/stream?domain=Salesforce');

eventSource.addEventListener('response', (e) => {
  const data = JSON.parse(e.data);
  console.log(`Query: ${data.question}`);
  console.log(`Mentioned: ${data.mentioned}`);
});

eventSource.addEventListener('complete', (e) => {
  const { report } = JSON.parse(e.data);
  console.log(`Final score: ${report.score.score}`);
});
```

---

## Service Dependencies

```
analysisPipeline.js
├── queryGenerator.js
│   └── aiClient.js
├── aiResponseService.js
│   └── aiClient.js
├── responseAnalyzer.js
├── visibilityScorer.js
└── recommendationEngine.js
    └── aiClient.js

streamingAnalysis.js
├── queryGenerator.js
├── aiClient.js
├── responseAnalyzer.js
├── visibilityScorer.js
└── recommendationEngine.js
```

---

## Error Handling

All services follow consistent error handling:

```javascript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: error.message };
}
```

Services gracefully degrade when AI providers are unavailable, falling back to simpler methods.
