# 🎨 Frontend Components Documentation

This document describes the React components that make up the AI Visibility Tracker UI.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [Components](#components)
  - [App](#app)
  - [AnalysisForm](#analysisform)
  - [ScoreDisplay](#scoredisplay)
  - [StatsGrid](#statsgrid)
  - [CompetitorList](#competitorlist)
  - [RecommendationList](#recommendationlist)
  - [ScoreChart](#scorechart)
  - [LiveFeed](#livefeed)
  - [QueryBreakdown](#querybreakdown)
  - [SentimentIndicator](#sentimentindicator)
  - [TrendPrediction](#trendprediction)
  - [ExportButton](#exportbutton)
  - [SkeletonLoader](#skeletonloader)
- [Services](#services)
- [Styling](#styling)

---

## Overview

The frontend is built with **React 18** and uses:
- **Recharts** for data visualization
- **react-markdown** for rendering AI-generated content
- **Axios** for API communication
- **Server-Sent Events** for real-time updates

All components are located in `/client/app/src/components/`.

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.js                                 │
│                     (Main Application)                           │
└─────────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────────────────────────────────┐
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐                               ┌─────────────────┐
│  AnalysisForm   │                               │    LiveFeed     │
│ (Input + Start) │                               │ (Real-time log) │
└─────────────────┘                               └─────────────────┘
         │
         │ (After analysis complete)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Results Section                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  ScoreDisplay   │    StatsGrid    │      SentimentIndicator     │
│  (Main score)   │   (Key stats)   │    (Sentiment breakdown)    │
├─────────────────┴─────────────────┴─────────────────────────────┤
│                       QueryBreakdown                             │
│              (Brand vs Discovery query performance)              │
├─────────────────────────────────────────────────────────────────┤
│                        ScoreChart                                │
│                  (Historical score trend)                        │
├─────────────────┬───────────────────────────────────────────────┤
│  CompetitorList │              RecommendationList                │
│ (Top competitors)│         (Standard + AI recommendations)       │
├─────────────────┴───────────────────────────────────────────────┤
│              TrendPrediction        │       ExportButton         │
│          (Future score prediction)  │    (Export results)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### App

**File:** `App.js`

The main application component that manages state and orchestrates the analysis flow.

#### State Management

```javascript
const [loading, setLoading] = useState(false);     // Analysis in progress
const [error, setError] = useState(null);          // Error message
const [report, setReport] = useState(null);        // Analysis results
const [liveEvents, setLiveEvents] = useState([]);  // Real-time event log
const [currentQuery, setCurrentQuery] = useState(null); // Current query being processed
const [progress, setProgress] = useState(null);    // { current, total }
```

#### SSE Integration

The app uses Server-Sent Events for real-time updates:

```javascript
const eventSource = new EventSource(`/api/analysis/stream?domain=${domain}`);

eventSource.addEventListener('response', (e) => {
  const data = JSON.parse(e.data);
  setLiveEvents(prev => [...prev, { type: 'response', ...data }]);
});

eventSource.addEventListener('complete', (e) => {
  const { report } = JSON.parse(e.data);
  setReport(report);
  setLoading(false);
});
```

---

### AnalysisForm

**File:** `components/AnalysisForm.js`

Input form for starting a new analysis.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `onAnalyze` | function | Callback with (domain, options) |
| `loading` | boolean | Disables form when true |

#### Input Fields

| Field | Type | Description |
|-------|------|-------------|
| Domain/Brand | text | Required - brand name or domain |
| Industry | text | Optional - helps accuracy |
| Target Audience | text | Optional - who uses the product |
| Main Use Cases | text | Optional - comma-separated |
| Known Competitors | text | Optional - comma-separated |
| Product Description | textarea | Optional - what the product does |
| Region | select | Optional - geographic focus |

#### Usage

```jsx
<AnalysisForm 
  onAnalyze={(domain, options) => handleAnalyze(domain, options)}
  loading={loading}
/>
```

---

### ScoreDisplay

**File:** `components/ScoreDisplay.js`

Displays the main visibility score with visual indicator.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `score` | number | Visibility score (0-100) |
| `interpretation` | string | Score interpretation text |

#### Score Colors

| Range | Color | CSS Class |
|-------|-------|-----------|
| 80-100 | Green | `.score-excellent` |
| 60-79 | Blue | `.score-good` |
| 40-59 | Yellow | `.score-average` |
| 20-39 | Orange | `.score-poor` |
| 0-19 | Red | `.score-critical` |

#### Usage

```jsx
<ScoreDisplay 
  score={report.score.score}
  interpretation={report.interpretation}
/>
```

---

### StatsGrid

**File:** `components/StatsGrid.js`

Grid of key statistics from the analysis.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `stats` | object | Statistics object |

#### Displayed Stats

- **Mention Rate** - Percentage of responses mentioning the brand
- **#1 Positions** - Times mentioned first
- **Top 3 Positions** - Times in top 3
- **Average Position** - Mean position when mentioned
- **Total Queries** - Number of queries sent
- **AI Responses** - Number of successful responses

#### Usage

```jsx
<StatsGrid stats={report.score.stats} />
```

---

### CompetitorList

**File:** `components/CompetitorList.js`

Displays top competitors detected in AI responses.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `competitors` | array | List of competitor objects |

#### Competitor Object

```javascript
{
  competitor_name: string,
  mention_count: number,
  times_before_target: number
}
```

#### Usage

```jsx
<CompetitorList competitors={report.topCompetitors} />
```

---

### RecommendationList

**File:** `components/RecommendationList.js`

Displays standard and AI-generated recommendations.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `recommendations` | array | Standard recommendations |
| `aiRecommendations` | array | AI-generated recommendations |

#### Recommendation Object

```javascript
{
  type: string,          // 'visibility_gap', 'positioning', etc.
  title: string,
  description: string,
  priority: string,      // 'high', 'medium', 'low'
  actionSteps: array,    // Detailed steps
  isAiGenerated: boolean,
  aiProvider: string     // If AI generated
}
```

#### Features

- Expandable sections for each recommendation
- Priority badges (High/Medium/Low)
- Action steps with timeframes
- Markdown rendering for AI recommendations
- Visual distinction for AI-generated content

#### Usage

```jsx
<RecommendationList 
  recommendations={report.recommendations}
  aiRecommendations={report.aiRecommendations}
/>
```

---

### ScoreChart

**File:** `components/ScoreChart.js`

Line chart showing historical score trend.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `history` | array | Array of { score, created_at } |
| `domainId` | number | Domain ID for fetching history |

#### Features

- Line chart using Recharts
- Date formatting on X-axis
- Score on Y-axis (0-100)
- Tooltip with exact values
- Responsive sizing

#### Usage

```jsx
<ScoreChart history={report.trend?.scores} domainId={report.domain.id} />
```

---

### LiveFeed

**File:** `components/LiveFeed.js`

Real-time event feed showing analysis progress.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `events` | array | Array of event objects |
| `currentQuery` | string | Currently processing query |
| `progress` | object | { current, total } |

#### Event Types

| Type | Display |
|------|---------|
| `status` | Status message |
| `analysis` | Industry/competitor detection |
| `response` | AI response with mention indicator |
| `score` | Score calculation |

#### Usage

```jsx
<LiveFeed 
  events={liveEvents}
  currentQuery={currentQuery}
  progress={progress}
/>
```

---

### QueryBreakdown

**File:** `components/QueryBreakdown.js`

Shows performance breakdown by query type.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `analysis` | object | Analysis results with query breakdowns |

#### Displayed Breakdowns

- **Brand Queries** - Queries that mention the brand
- **Discovery Queries** - Queries that don't mention brand
- **Website Queries** - Domain-specific queries

#### Usage

```jsx
<QueryBreakdown analysis={report.analysis} />
```

---

### SentimentIndicator

**File:** `components/SentimentIndicator.js`

Shows sentiment analysis of brand mentions.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `sentiment` | object | { positive, neutral, negative } counts |

#### Display

- Pie chart or bar showing sentiment distribution
- Color-coded segments (green/gray/red)
- Percentage labels

#### Usage

```jsx
<SentimentIndicator sentiment={report.analysis.sentiment} />
```

---

### TrendPrediction

**File:** `components/TrendPrediction.js`

Predicts future score based on historical trend.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `trend` | object | Trend data with direction |
| `currentScore` | number | Current visibility score |

#### Display

- Trend direction indicator (↑ ↓ →)
- Predicted score range
- Confidence level

#### Usage

```jsx
<TrendPrediction trend={report.trend} currentScore={report.score.score} />
```

---

### ExportButton

**File:** `components/ExportButton.js`

Button to export analysis results.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `report` | object | Full analysis report |

#### Export Formats

- JSON download
- (Future: PDF, CSV)

#### Usage

```jsx
<ExportButton report={report} />
```

---

### SkeletonLoader

**File:** `components/SkeletonLoader.js`

Loading placeholder during analysis.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | string | 'score', 'stats', 'chart', etc. |

#### Usage

```jsx
{loading && <SkeletonLoader type="score" />}
```

---

## Services

### API Service

**File:** `services/api.js`

Axios-based API client for backend communication.

```javascript
import { analysisAPI, healthCheck } from './services/api';

// Run analysis
const response = await analysisAPI.analyze('Salesforce', {
  industry: 'CRM',
  targetAudience: 'Sales teams'
});

// Get domains
const domains = await analysisAPI.getDomains();

// Get history
const history = await analysisAPI.getHistory(domainId, 30);

// Health check
const health = await healthCheck();
```

---

## Styling

### CSS Structure

**File:** `App.css`

Main stylesheet with:
- CSS custom properties (variables)
- Responsive breakpoints
- Component-specific styles

### Color Variables

```css
:root {
  --color-excellent: #22c55e;  /* Green */
  --color-good: #3b82f6;       /* Blue */
  --color-average: #eab308;    /* Yellow */
  --color-poor: #f97316;       /* Orange */
  --color-critical: #ef4444;   /* Red */
  
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## Best Practices

### Component Guidelines

1. **Single Responsibility** - Each component does one thing well
2. **Props Validation** - Use PropTypes or TypeScript
3. **Controlled Components** - Form inputs are controlled
4. **Error Boundaries** - Wrap sections in error boundaries
5. **Memoization** - Use `useMemo`/`useCallback` for expensive operations

### State Management

- Local state for UI-only concerns
- Lift state up when shared between components
- Use `useCallback` for event handlers passed as props

### Performance

- Lazy load heavy components
- Virtualize long lists
- Debounce frequent updates
- Use `React.memo` for pure components
