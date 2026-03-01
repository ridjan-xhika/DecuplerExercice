# 🗄️ Database Documentation

This document describes the MySQL database schema used by AI Visibility Tracker.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Indexes](#indexes)
- [Migrations](#migrations)

---

## Overview

The database uses **MySQL 8.0** and stores all analysis data including:
- Analyzed domains/brands
- Generated queries (prompts)
- AI responses from multiple providers
- Brand mentions and positions
- Competitors detected
- Visibility scores over time
- Recommendations

---

## Entity Relationship Diagram

```
┌─────────────┐
│   domains   │
│─────────────│
│ id (PK)     │──────┬──────────────────────────────────────────┐
│ domain_name │      │                                          │
│ industry    │      │                                          │
│ created_at  │      │                                          │
│ updated_at  │      │                                          │
└─────────────┘      │                                          │
                     │                                          │
      ┌──────────────┼──────────────┐                           │
      ▼              ▼              ▼                           ▼
┌───────────┐ ┌───────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│  prompts  │ │visibility_    │ │ recommendations │ │                     │
│───────────│ │scores         │ │─────────────────│ │                     │
│ id (PK)   │ │───────────────│ │ id (PK)         │ │                     │
│ domain_id │ │ id (PK)       │ │ domain_id (FK)  │ │                     │
│ query_text│ │ domain_id(FK) │ │ score_id (FK)   │ │                     │
│ query_type│ │ score         │ │ type            │ │                     │
│ created_at│ │ total_queries │ │ title           │ │                     │
└─────┬─────┘ │ total_mentions│ │ description     │ │                     │
      │       │ top1_count    │ │ priority        │ │                     │
      │       │ top3_count    │ │ action_steps    │ │                     │
      │       │ avg_position  │ │ is_ai_generated │ │                     │
      │       │ created_at    │ │ ai_provider     │ │                     │
      │       └───────────────┘ └─────────────────┘ │                     │
      ▼                                             │                     │
┌─────────────────┐                                 │                     │
│  ai_responses   │                                 │                     │
│─────────────────│                                 │                     │
│ id (PK)         │──────────────────────┐          │                     │
│ prompt_id (FK)  │                      │          │                     │
│ ai_provider     │                      │          │                     │
│ response_text   │                      │          │                     │
│ response_time_ms│                      │          │                     │
│ created_at      │                      │          │                     │
└─────────────────┘                      │          │                     │
                                         │          │                     │
                    ┌────────────────────┼──────────┘                     │
                    ▼                    ▼                                │
          ┌─────────────────┐  ┌─────────────────┐                        │
          │ brand_mentions  │  │  competitors    │                        │
          │─────────────────│  │─────────────────│                        │
          │ id (PK)         │  │ id (PK)         │                        │
          │ response_id(FK) │  │ response_id(FK) │                        │
          │ brand_name      │  │ competitor_name │                        │
          │ position        │  │ position        │                        │
          │ sentiment       │  │ mentioned_before│                        │
          │ context_snippet │  │ _target         │                        │
          │ is_target_brand │  │ created_at      │                        │
          │ created_at      │  └─────────────────┘                        │
          └─────────────────┘                                             │
```

---

## Tables

### `domains`

Stores analyzed brands/domains.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `domain_name` | VARCHAR(255) | Brand or domain name (unique) |
| `industry` | VARCHAR(100) | Detected or specified industry |
| `created_at` | TIMESTAMP | When the domain was first analyzed |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Example:**
```sql
INSERT INTO domains (domain_name, industry) VALUES ('Salesforce', 'CRM');
```

---

### `prompts`

Stores generated queries for each domain.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `domain_id` | INT | Foreign key to domains |
| `query_text` | TEXT | The actual query sent to AI |
| `query_type` | VARCHAR(50) | Type: 'comparison', 'discovery', 'brand', etc. |
| `created_at` | TIMESTAMP | Creation timestamp |

**Query Types:**
- `directBrand` - "What is {brand}?"
- `comparison` - "{brand} vs {competitor}"
- `productDiscovery` - "Best {product_type}?"
- `useCase` - "Best for {use_case}?"
- `websiteDiscovery` - "Best website for {action}?"

---

### `ai_responses`

Stores raw responses from LLM providers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `prompt_id` | INT | Foreign key to prompts |
| `ai_provider` | VARCHAR(50) | 'ollama', 'gemini', etc. |
| `response_text` | TEXT | Full AI response |
| `response_time_ms` | INT | Response latency in milliseconds |
| `created_at` | TIMESTAMP | When response was received |

---

### `brand_mentions`

Extracted brand mentions from AI responses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `response_id` | INT | Foreign key to ai_responses |
| `brand_name` | VARCHAR(255) | Name of the mentioned brand |
| `position` | INT | Mention order (1 = first mentioned) |
| `sentiment` | VARCHAR(20) | 'positive', 'neutral', 'negative' |
| `context_snippet` | TEXT | Surrounding text of the mention |
| `is_target_brand` | BOOLEAN | True if this is the analyzed brand |
| `created_at` | TIMESTAMP | Extraction timestamp |

---

### `competitors`

Identified competitors from responses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `response_id` | INT | Foreign key to ai_responses |
| `competitor_name` | VARCHAR(255) | Competitor brand name |
| `position` | INT | Mention order |
| `mentioned_before_target` | BOOLEAN | True if mentioned before target brand |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### `visibility_scores`

Historical visibility scores for tracking over time.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `domain_id` | INT | Foreign key to domains |
| `score` | DECIMAL(5,2) | Visibility score (0.00 - 100.00) |
| `total_queries` | INT | Number of queries in this analysis |
| `total_mentions` | INT | Times brand was mentioned |
| `top1_count` | INT | Times brand was mentioned first |
| `top3_count` | INT | Times brand was in top 3 |
| `avg_position` | DECIMAL(4,2) | Average mention position |
| `created_at` | TIMESTAMP | Score calculation timestamp |

---

### `recommendations`

Generated improvement suggestions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `domain_id` | INT | Foreign key to domains |
| `score_id` | INT | Foreign key to visibility_scores |
| `recommendation_type` | VARCHAR(50) | 'content', 'positioning', 'competitor_gap', 'ai_generated' |
| `title` | VARCHAR(255) | Short recommendation title |
| `description` | TEXT | Detailed description |
| `priority` | VARCHAR(20) | 'high', 'medium', 'low' |
| `action_steps` | JSON | Detailed steps with timeframes |
| `is_ai_generated` | BOOLEAN | True if generated by AI |
| `ai_provider` | VARCHAR(50) | Provider if AI-generated |
| `created_at` | TIMESTAMP | Generation timestamp |

**Action Steps JSON Structure:**
```json
[
  {
    "step": 1,
    "action": "Audit your existing content",
    "details": "Review all your website pages...",
    "timeframe": "1-2 days"
  }
]
```

---

## Indexes

Performance indexes for common queries:

```sql
-- Query performance indexes
CREATE INDEX idx_prompts_domain ON prompts(domain_id);
CREATE INDEX idx_responses_prompt ON ai_responses(prompt_id);
CREATE INDEX idx_responses_provider ON ai_responses(ai_provider);
CREATE INDEX idx_mentions_response ON brand_mentions(response_id);
CREATE INDEX idx_mentions_brand ON brand_mentions(brand_name);
CREATE INDEX idx_competitors_response ON competitors(response_id);
CREATE INDEX idx_scores_domain ON visibility_scores(domain_id);
CREATE INDEX idx_scores_date ON visibility_scores(created_at);
CREATE INDEX idx_recommendations_domain ON recommendations(domain_id);
```

---

## Migrations

### Location
Migrations are stored in `/database/migrations/`

### Running Migrations
Migrations are automatically applied when the Docker container starts. For manual migration:

```bash
docker exec -i ai_visibility_db mysql -uroot -prootpassword ai_visibility < database/migrations/002_add_recommendation_fields.sql
```

### Migration History

| Version | Description |
|---------|-------------|
| 001 | Initial schema (schema.sql) |
| 002 | Add recommendation action_steps, is_ai_generated, ai_provider fields |

---

## Common Queries

### Get Latest Score for a Domain
```sql
SELECT * FROM visibility_scores 
WHERE domain_id = ? 
ORDER BY created_at DESC 
LIMIT 1;
```

### Get Score History (Last 30 Days)
```sql
SELECT score, created_at 
FROM visibility_scores 
WHERE domain_id = ? 
ORDER BY created_at DESC 
LIMIT 30;
```

### Get Top Competitors for a Domain
```sql
SELECT competitor_name, COUNT(*) as mention_count,
       SUM(CASE WHEN mentioned_before_target THEN 1 ELSE 0 END) as times_before_target
FROM competitors c
JOIN ai_responses ar ON c.response_id = ar.id
JOIN prompts p ON ar.prompt_id = p.id
WHERE p.domain_id = ?
GROUP BY competitor_name
ORDER BY mention_count DESC
LIMIT 5;
```

### Get Mention Rate
```sql
SELECT 
  COUNT(*) as total_responses,
  SUM(CASE WHEN EXISTS (
    SELECT 1 FROM brand_mentions bm 
    WHERE bm.response_id = ar.id AND bm.is_target_brand = 1
  ) THEN 1 ELSE 0 END) as responses_with_mention
FROM ai_responses ar
JOIN prompts p ON ar.prompt_id = p.id
WHERE p.domain_id = ?;
```
