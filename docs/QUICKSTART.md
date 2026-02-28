# Quick Start Guide

Get AI Visibility Tracker running in 5 minutes.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.ai/) (for local AI)

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

- **Web UI**: http://localhost:3000
- **API**: http://localhost:5000

## First Analysis

1. Open http://localhost:3000
2. Enter a brand name: `Salesforce`
3. Click **Analyze**
4. Wait ~30-60 seconds
5. View your visibility report!

## Troubleshooting

### "Cannot connect to Ollama"

Make sure Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

### "Database connection failed"

Wait for MySQL to fully initialize (check Docker logs):
```bash
docker logs ai_visibility_db
```

### Slow analysis

This is normal - we're querying AI for each prompt. Reduce queries:
```bash
# In .env, you can adjust:
MAX_QUERIES=10
```

## Next Steps

- Read the full [Documentation](./README.md)
- Try analyzing different brands
- Run multiple analyses to see the score chart
