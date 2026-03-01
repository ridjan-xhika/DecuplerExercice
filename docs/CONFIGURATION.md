# ⚙️ Configuration Guide

Complete configuration reference for AI Visibility Tracker.

---

## 📋 Table of Contents

- [Environment Variables](#environment-variables)
- [Docker Configuration](#docker-configuration)
- [AI Provider Setup](#ai-provider-setup)
- [Database Configuration](#database-configuration)
- [Advanced Settings](#advanced-settings)

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Variables

```env
# Database
DB_PASSWORD=rootpassword
DB_NAME=ai_visibility
```

### Optional Variables

```env
# AI Providers (comma-separated)
# Options: ollama, gemini
# Default: ollama,gemini
AI_PROVIDERS=ollama

# Ollama Configuration
OLLAMA_MODEL=llama3.2

# Gemini Configuration (optional)
# GEMINI_API_KEY=your_api_key_here
```

---

## Complete Environment File

```env
# ===========================================
# AI Visibility Tracker Configuration
# ===========================================

# -----------------------------
# Database Configuration
# -----------------------------
DB_PASSWORD=rootpassword
DB_NAME=ai_visibility

# -----------------------------
# AI Provider Configuration
# -----------------------------
# Comma-separated list of enabled providers
# Available: ollama, gemini
AI_PROVIDERS=ollama

# Ollama (Local AI)
# Model to use for queries
OLLAMA_MODEL=llama3.2

# Google Gemini (Cloud AI)
# Get your API key from: https://makersuite.google.com/
# GEMINI_API_KEY=your_api_key_here

# -----------------------------
# Server Configuration
# -----------------------------
# PORT=5000                    # Backend port (default: 5000)
# NODE_ENV=development         # Environment mode

# -----------------------------
# Analysis Configuration
# -----------------------------
# MAX_QUERIES=35              # Maximum queries per analysis
# QUERY_TIMEOUT=30000         # Timeout per query in ms
```

---

## Docker Configuration

### docker-compose.yml Structure

The application uses three services:

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| `db` | ai_visibility_db | 3306 | MySQL 8.0 database |
| `server` | ai_visibility_server | 5000 | Express.js backend |
| `client` | ai_visibility_client | 3000 | React frontend |

### Customizing Ports

To change default ports, modify `docker-compose.yml`:

```yaml
services:
  server:
    ports:
      - "8080:5000"  # Host port 8080 → Container port 5000
  client:
    ports:
      - "8000:3000"  # Host port 8000 → Container port 3000
```

### Volume Mounts

```yaml
volumes:
  - mysql_data:/var/lib/mysql           # Persistent database storage
  - ./server/src:/app/src               # Live reload for backend
  - ./client/app/src:/app/src           # Live reload for frontend
```

### Docker Commands

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server

# Restart specific service
docker-compose restart server

# Remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## AI Provider Setup

### Ollama (Recommended)

Ollama runs locally and provides free, unlimited AI queries.

#### Installation

1. **Download Ollama**: https://ollama.ai/

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```

3. **Pull the model**:
   ```bash
   ollama pull llama3.2
   ```

4. **Verify installation**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

#### Supported Models

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| `llama3.2` | 4GB | Fast | Good (recommended) |
| `llama3.2:1b` | 1GB | Very Fast | Moderate |
| `llama3.1` | 8GB | Medium | Better |
| `mistral` | 4GB | Fast | Good |

To change model:
```env
OLLAMA_MODEL=mistral
```

#### Troubleshooting Ollama

**Cannot connect to Ollama**
```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart Ollama
# On macOS: Click Ollama icon → Quit, then restart
# On Linux: systemctl restart ollama
```

**Model not found**
```bash
ollama list           # See installed models
ollama pull llama3.2  # Download model
```

---

### Google Gemini (Optional)

Gemini provides cloud-based AI with good quality but has rate limits.

#### Setup

1. **Get API Key**: https://makersuite.google.com/

2. **Add to `.env`**:
   ```env
   AI_PROVIDERS=ollama,gemini
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Restart server**:
   ```bash
   docker-compose restart server
   ```

#### Rate Limits

| Tier | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 15 | 1,500 |
| Paid | 60+ | 10,000+ |

**Recommendation**: Use Ollama as primary, Gemini as backup.

---

## Database Configuration

### Connection Settings

The database connection is configured in the server environment:

```yaml
# docker-compose.yml
environment:
  DB_HOST: db
  DB_PORT: 3306
  DB_USER: root
  DB_PASSWORD: ${DB_PASSWORD:-rootpassword}
  DB_NAME: ${DB_NAME:-ai_visibility}
```

### Accessing MySQL

```bash
# Via Docker
docker exec -it ai_visibility_db mysql -uroot -prootpassword ai_visibility

# Via MySQL client (if installed locally)
mysql -h 127.0.0.1 -P 3306 -uroot -prootpassword ai_visibility
```

### Database Backup

```bash
# Backup
docker exec ai_visibility_db mysqldump -uroot -prootpassword ai_visibility > backup.sql

# Restore
docker exec -i ai_visibility_db mysql -uroot -prootpassword ai_visibility < backup.sql
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volume
docker volume rm decuplerexercice_mysql_data

# Restart (will recreate database)
docker-compose up
```

---

## Advanced Settings

### Query Generation Settings

In `server/src/services/queryGenerator.js`:

```javascript
const enhancedQueryOptions = {
  queriesPerType: 3,      // Queries per category
  maxTotalQueries: 35     // Maximum total queries
};
```

### Scoring Weights

In `server/src/services/visibilityScorer.js`:

```javascript
const SCORING_WEIGHTS = {
  BASE_SCORE: 50,           // Neutral starting point
  MENTIONED: 10,            // Points for being mentioned
  TOP_1: 15,                // Bonus for first mention
  TOP_3: 8,                 // Bonus for top 3
  COMPETITOR_BEFORE: -3,    // Penalty per competitor before
  MAX_COMPETITOR_PENALTY: -15,
  NOT_MENTIONED: -5,        // Penalty for no mention
  MAX_SCORE: 100,
  MIN_SCORE: 0
};
```

### API Timeouts

In `server/src/services/ollamaClient.js`:

```javascript
const DEFAULT_TIMEOUT = 30000; // 30 seconds per query
```

### Frontend API URL

In `client/app/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

For production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

---

## Environment-Specific Configs

### Development

```env
NODE_ENV=development
AI_PROVIDERS=ollama
OLLAMA_MODEL=llama3.2
```

### Production

```env
NODE_ENV=production
AI_PROVIDERS=ollama,gemini
GEMINI_API_KEY=your_production_key
OLLAMA_MODEL=llama3.1
```

### Testing

```env
NODE_ENV=test
AI_PROVIDERS=ollama
OLLAMA_MODEL=llama3.2:1b  # Faster model for tests
```
