# 📊 Scoring System Documentation

Understanding how AI Visibility Tracker calculates visibility scores.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Scoring Model](#scoring-model)
- [Score Calculation](#score-calculation)
- [Score Interpretation](#score-interpretation)
- [Factors That Affect Score](#factors-that-affect-score)
- [Improving Your Score](#improving-your-score)

---

## Overview

The visibility score measures how prominently your brand appears in AI-generated responses. It answers the question: **"When users ask AI about topics related to my industry, how often and how well am I mentioned?"**

### Key Principles

1. **Neutral Base** - Everyone starts at 50 (not 0)
2. **Fair Penalties** - Small penalties, capped to avoid harshness
3. **Position Matters** - Being mentioned first is better
4. **Discovery Queries** - Tests if AI naturally recommends you

---

## Scoring Model

### Base Score

Every analysis starts with a **base score of 50**, representing a neutral starting point.

### Scoring Components

| Component | Points | Description |
|-----------|--------|-------------|
| **Base Score** | 50 | Neutral starting point |
| **Mentioned** | +10 | Brand was mentioned in response |
| **#1 Position** | +15 | Mentioned first in the response |
| **Top 3 Position** | +8 | Mentioned in positions 2-3 |
| **Competitor Before** | -3 each | Penalty per competitor mentioned before you |
| **Max Competitor Penalty** | -15 | Cap on competitor penalties |
| **Not Mentioned** | -5 | Brand not mentioned at all |

### Score Range

- **Minimum**: 0
- **Maximum**: 100
- **Starting Point**: 50

---

## Score Calculation

### Formula

For each AI response:

```
responseScore = baseScore
              + (mentioned ? MENTIONED_BONUS : NOT_MENTIONED_PENALTY)
              + (position == 1 ? TOP_1_BONUS : 0)
              + (position <= 3 && position > 1 ? TOP_3_BONUS : 0)
              + max(COMPETITOR_PENALTY, competitorsBeforeTarget * COMPETITOR_BEFORE)
```

### Example Calculation

**Scenario:** 20 queries, brand mentioned in 16, first mention 8 times, top 3 in 12, avg 2 competitors before

```
Base Score:           50.00

Mentioned Bonus:      (16/20) × 10 = +8.00
Not Mentioned:        (4/20) × -5 = -1.00
Top 1 Bonus:          (8/20) × 15 = +6.00
Top 3 Bonus:          (4/20) × 8 = +1.60
Competitor Penalty:   avg 2 × -3 = -6.00 (capped at -15)

-----------------------------------
Final Score:          58.60 → 59
```

---

## Score Interpretation

### Score Ranges

| Score | Rating | Description | What It Means |
|-------|--------|-------------|---------------|
| **80-100** | 🟢 Excellent | Strong AI visibility | AI frequently mentions you first; you're a top recommendation |
| **60-79** | 🔵 Good | Regularly mentioned | AI knows you well; good positioning with room to improve |
| **40-59** | 🟡 Average | Mentioned sometimes | AI mentions you but competitors often rank higher |
| **20-39** | 🟠 Poor | Rarely mentioned | AI rarely recommends you; competitors dominate |
| **0-19** | 🔴 Critical | Almost never mentioned | AI doesn't know or recommend your brand |

### What Each Rating Suggests

#### 🟢 Excellent (80-100)
- Your brand is well-established in AI training data
- You appear in authoritative sources AI learns from
- Continue current content strategy
- Focus on maintaining position

#### 🔵 Good (60-79)
- AI recognizes your brand
- You could improve positioning
- Create more comparison content
- Build more authoritative backlinks

#### 🟡 Average (40-59)
- AI sometimes recommends you
- Competitors often rank higher
- Focus on differentiating content
- Create more "best of" and comparison content

#### 🟠 Poor (20-39)
- AI rarely mentions you
- Significant work needed
- Build brand awareness
- Create foundational content

#### 🔴 Critical (0-19)
- AI doesn't know your brand
- Start with basic visibility
- Focus on getting mentioned anywhere
- Consider if brand name is unique enough

---

## Factors That Affect Score

### Positive Factors

| Factor | Impact | How to Improve |
|--------|--------|----------------|
| **Mentioned in response** | +10 per response | Increase brand awareness |
| **First position** | +15 bonus | Establish as market leader |
| **Top 3 position** | +8 bonus | Build strong positioning |
| **Consistent mentions** | Higher average | Regular content creation |

### Negative Factors

| Factor | Impact | How to Minimize |
|--------|--------|-----------------|
| **Not mentioned** | -5 per response | Create more content |
| **Competitors before** | -3 each (max -15) | Differentiate from competitors |
| **Low mention rate** | Lower base | Improve overall visibility |

---

## Query Types and Their Impact

### Brand Queries
Queries that mention your brand directly:
- "What is [Brand]?"
- "How good is [Brand]?"
- "[Brand] vs [Competitor]"

**Purpose:** Tests if AI knows your brand and what it says about you.

### Discovery Queries
Queries that don't mention your brand:
- "Best [product type]?"
- "What should I use for [use case]?"
- "Top [category] tools"

**Purpose:** Tests if AI naturally recommends you when users are searching.

**Discovery queries are the TRUE test of visibility** - they show whether AI would recommend you to users who don't know your brand yet.

---

## Improving Your Score

### Quick Wins (1-2 weeks)

1. **Create definitive "What is [Brand]" content**
   - Clear, comprehensive page explaining your product
   - Use structured data markup

2. **Build comparison pages**
   - "[Your Brand] vs [Competitor]" pages
   - Honest, detailed comparisons

3. **Optimize existing content**
   - Ensure brand name appears clearly
   - Add FAQ sections with schema markup

### Medium-Term (1-2 months)

1. **Get featured in "best of" articles**
   - Reach out to industry reviewers
   - Provide product demos for reviews

2. **Create topic clusters**
   - 5-10 interlinked pages on your expertise
   - Establish topical authority

3. **Build citations on authority sites**
   - Wikipedia mentions (if notable)
   - Industry directories
   - Guest posts on high-authority sites

### Long-Term (3+ months)

1. **Consistent content creation**
   - Regular blog posts
   - Industry insights
   - Original research

2. **Build brand authority**
   - Expert quotes in publications
   - Conference speaking
   - Thought leadership

3. **Track and iterate**
   - Run regular analyses
   - Monitor score trends
   - Adjust strategy based on results

---

## Understanding Score Trends

### Trend Indicators

| Trend | Meaning |
|-------|---------|
| ↑ **Improving** | Your visibility efforts are working |
| → **Stable** | Maintaining position; consider new initiatives |
| ↓ **Declining** | Competitors may be improving; take action |

### Typical Score Patterns

- **New brands**: Start 30-50, improve with effort
- **Established brands**: Usually 50-70
- **Market leaders**: Often 75-90
- **Niche brands**: Can vary widely (40-80)

---

## FAQ

### Why did my score start at 50?

The base score of 50 represents a neutral starting point. This is fairer than starting at 0, which would make the math harsh for brands that are mentioned but not first.

### Why is my score different from last time?

Scores can vary based on:
- Different AI responses (AI has some randomness)
- Different queries generated
- AI model updates
- Actual changes in your visibility

### Can I get 100?

Theoretically yes, but it requires:
- Being mentioned in every response
- Being first in every response
- No competitors mentioned before you

In practice, scores above 85 are excellent.

### Why are my competitors scoring higher?

They likely have:
- More content about their industry
- More authoritative backlinks
- Better positioning in comparison content
- Longer market presence
