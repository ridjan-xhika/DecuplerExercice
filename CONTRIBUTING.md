# Contributing to AI Visibility Tracker

Thank you for your interest in contributing to AI Visibility Tracker! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Ollama (for local AI)
- Git

### Fork & Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/DecuplerExercice.git
   cd DecuplerExercice
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/DecuplerExercice.git
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client/app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env as needed
```

### 3. Start Services

```bash
# Start all services with Docker
docker-compose up --build

# Or start individually for development:

# Terminal 1: Database
docker-compose up db

# Terminal 2: Backend (with hot reload)
cd server
npm run dev

# Terminal 3: Frontend (with hot reload)
cd client/app
npm start
```

### 4. Verify Setup

```bash
curl http://localhost:5000/api/health
```

---

## Project Structure

```
/
├── client/                 # React frontend
│   └── app/
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── services/   # API client
│       │   ├── App.js      # Main application
│       │   └── App.css     # Styles
│       └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.js        # Entry point
│   └── package.json
│
├── database/               # SQL schemas
│   ├── schema.sql          # Main schema
│   └── migrations/         # Schema migrations
│
├── docs/                   # Documentation
│
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment template
└── README.md               # Project readme
```

---

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-openai-support`
- `fix/score-calculation-bug`
- `docs/update-api-reference`
- `refactor/simplify-query-generator`

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following coding standards

3. **Test your changes:**
   ```bash
   # Run the application
   docker-compose up --build
   
   # Test functionality manually
   # Run any automated tests
   ```

4. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add OpenAI provider support"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Changes have been tested locally
- [ ] Documentation has been updated if needed
- [ ] Commit messages are clear and descriptive

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Motivation for the changes
- **How**: Technical approach (if complex)
- **Testing**: How you tested the changes

### Example PR Description

```markdown
## What
Add OpenAI as an AI provider option

## Why
Users requested OpenAI support for better response quality

## How
- Created `openaiClient.js` service
- Updated `aiClient.js` to route to OpenAI
- Added `OPENAI_API_KEY` environment variable

## Testing
- Tested with valid API key
- Verified fallback when OpenAI unavailable
- Ran full analysis with OpenAI as provider
```

---

## Coding Standards

### JavaScript/Node.js

```javascript
// Use const/let, not var
const config = {};
let count = 0;

// Use async/await over callbacks
async function fetchData() {
  const result = await api.get('/data');
  return result;
}

// Use descriptive names
const userVisibilityScore = calculateScore(responses);  // Good
const x = calc(r);  // Bad

// Add JSDoc comments for functions
/**
 * Calculate visibility score from analysis results
 * @param {object} analysisResults - Results from responseAnalyzer
 * @returns {object} Computed score with breakdown
 */
function calculateScore(analysisResults) {
  // ...
}
```

### React Components

```jsx
// Use functional components with hooks
function ScoreDisplay({ score, interpretation }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="score-display">
      {/* ... */}
    </div>
  );
}

// PropTypes or TypeScript for type checking
ScoreDisplay.propTypes = {
  score: PropTypes.number.isRequired,
  interpretation: PropTypes.string
};
```

### CSS

```css
/* Use BEM-like naming */
.score-display { }
.score-display__value { }
.score-display--excellent { }

/* Use CSS custom properties for theming */
.score-display {
  color: var(--color-primary);
}
```

### SQL

```sql
-- Use uppercase for SQL keywords
SELECT id, domain_name FROM domains WHERE industry = 'CRM';

-- Add indexes for frequently queried columns
CREATE INDEX idx_scores_domain ON visibility_scores(domain_id);
```

---

## Testing

### Manual Testing Checklist

- [ ] Health endpoint returns correct status
- [ ] Analysis completes successfully
- [ ] Score is calculated correctly
- [ ] Recommendations are generated
- [ ] Historical data is saved
- [ ] Frontend displays results correctly
- [ ] SSE streaming works properly

### Testing AI Changes

When modifying AI-related code:
1. Test with Ollama (required)
2. Test with Gemini if available
3. Test fallback when providers fail
4. Verify rate limiting works

### Testing Database Changes

1. Add migration file in `/database/migrations/`
2. Test migration on fresh database
3. Test with existing data

---

## Areas for Contribution

### High Priority
- [ ] Add more AI providers (OpenAI, Claude)
- [ ] Improve competitor detection for niche industries
- [ ] Add automated tests
- [ ] PDF/CSV export functionality

### Medium Priority
- [ ] User authentication
- [ ] Scheduled automatic re-analysis
- [ ] Multi-domain comparison view
- [ ] Email notifications

### Low Priority
- [ ] Dark mode theme
- [ ] Internationalization (i18n)
- [ ] Mobile responsive improvements

---

## Questions?

- Open a GitHub issue for questions
- Check existing issues for similar problems
- Review documentation in `/docs`

Thank you for contributing! 🎉
