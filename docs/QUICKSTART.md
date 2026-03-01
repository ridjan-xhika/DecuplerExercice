# 🚀 Quick Start Guide

Get AI Visibility Tracker running in 5 minutes.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.ai/) (for local AI)

---

## Installation Steps

### 1. Clone & Configure

```bash
# Clone the repo
git clone <repo-url>
cd DecuplerExercice

# Copy environment file
cp .env.example .env
```

### 2. Start Ollama (Host Machine)

```bash
# Start Ollama service
ollama serve

# Pull the model (in another terminal)
ollama pull llama3.2
```

### 3. Start the Application

```bash
docker-compose up --build
```

### 4. Access the App

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:3000 |
| **API** | http://localhost:5000 |
| **Health Check** | http://localhost:5000/api/health |

---

## First Analysis

1. Open http://localhost:3000
2. Enter a brand name: `Salesforce`
3. Click **Analyze**
4. Watch the live progress feed
5. View your visibility report!

---

## What to Expect

### Analysis Takes 30-90 Seconds

The system:
- Detects your industry
- Generates 20-35 smart queries
- Sends each to Ollama
- Analyzes all responses
- Calculates your score
- Generates recommendations

### Live Progress

You'll see real-time updates:
- 🔍 Industry detection
- 📝 Query generation
- 🤖 AI responses (with mention indicators)
- 📊 Score calculation

---

## Troubleshooting

### "Cannot connect to Ollama"

Make sure Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

If not running:
```bash
ollama serve
```

### "Database connection failed"

Wait for MySQL to fully initialize (~30 seconds):
```bash
docker logs ai_visibility_db
# Look for "ready for connections"
```

### Slow Analysis

This is normal for first-time runs. To speed up:
- Use a smaller model: `OLLAMA_MODEL=llama3.2:1b`
- Reduce queries in `queryGenerator.js`

### Port Already in Use

```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Or change ports in docker-compose.yml
```

---

## Next Steps

- 📖 Read the full [Documentation](./README.md)
- 📊 [Understand scoring](./SCORING.md)
- ⚙️ [Configure settings](./CONFIGURATION.md)
- 🔧 [Troubleshooting guide](./TROUBLESHOOTING.md)

---

## Quick Commands

```bash
# Start everything
docker-compose up

# Start with rebuild
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f server

# Reset database
docker-compose down -v
docker-compose up

# Check health
curl http://localhost:5000/api/health
```
