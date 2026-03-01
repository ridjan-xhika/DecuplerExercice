# 🔧 Troubleshooting Guide

Common issues and their solutions for AI Visibility Tracker.

---

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Connection Issues](#connection-issues)
- [AI Provider Issues](#ai-provider-issues)
- [Database Issues](#database-issues)
- [Analysis Issues](#analysis-issues)
- [Frontend Issues](#frontend-issues)
- [Docker Issues](#docker-issues)
- [Performance Issues](#performance-issues)

---

## Quick Diagnostics

Run these commands to quickly identify issues:

```bash
# Check all services are running
docker-compose ps

# Check health endpoint
curl http://localhost:5000/api/health

# Check Ollama
curl http://localhost:11434/api/tags

# View server logs
docker-compose logs -f server

# View database logs
docker-compose logs -f db
```

### Health Check Response

A healthy system returns:
```json
{
  "status": "ok",
  "database": "connected",
  "ai": {
    "ollama": "connected",
    "anyWorking": true
  }
}
```

---

## Connection Issues

### Cannot connect to localhost:3000

**Symptoms:**
- Browser shows "This site can't be reached"
- ERR_CONNECTION_REFUSED

**Solutions:**

1. **Check if client container is running:**
   ```bash
   docker-compose ps client
   ```

2. **Check client logs:**
   ```bash
   docker-compose logs client
   ```

3. **Restart client:**
   ```bash
   docker-compose restart client
   ```

4. **Rebuild if needed:**
   ```bash
   docker-compose up --build client
   ```

---

### Cannot connect to localhost:5000

**Symptoms:**
- API requests fail
- "Network Error" in browser console

**Solutions:**

1. **Check server status:**
   ```bash
   docker-compose ps server
   curl http://localhost:5000/api/health
   ```

2. **Check server logs:**
   ```bash
   docker-compose logs -f server
   ```

3. **Common causes:**
   - Database not ready (wait 30 seconds after startup)
   - Port 5000 already in use
   - Missing environment variables

4. **Fix port conflict:**
   ```bash
   # Find what's using port 5000
   netstat -ano | findstr :5000  # Windows
   lsof -i :5000                  # Mac/Linux
   
   # Kill the process or change port in docker-compose.yml
   ```

---

## AI Provider Issues

### "Cannot connect to Ollama"

**Symptoms:**
- Health check shows `ollama: "disconnected"`
- Analysis fails with "No AI providers available"

**Solutions:**

1. **Check Ollama is running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Verify model is installed:**
   ```bash
   ollama list
   ollama pull llama3.2
   ```

4. **Check Docker can reach host:**
   
   The Docker container uses `host.docker.internal` to reach Ollama on your machine. This should work automatically on Docker Desktop.

5. **Manual test from container:**
   ```bash
   docker exec -it ai_visibility_server curl http://host.docker.internal:11434/api/tags
   ```

---

### "Gemini rate limit exceeded"

**Symptoms:**
- Gemini queries fail
- Error: "429 Too Many Requests"

**Solutions:**

1. **Reduce Gemini usage:**
   ```env
   AI_PROVIDERS=ollama
   ```

2. **Add delays (already implemented in code)**

3. **Upgrade to paid tier** (for heavy usage)

4. **Wait and retry** (free tier resets per minute)

---

### Slow AI responses

**Symptoms:**
- Analysis takes > 5 minutes
- Timeout errors

**Solutions:**

1. **Use faster model:**
   ```env
   OLLAMA_MODEL=llama3.2:1b  # Smaller, faster
   ```

2. **Reduce query count:**
   Edit `queryGenerator.js`:
   ```javascript
   maxTotalQueries: 20  // Default is 35
   ```

3. **Check system resources:**
   - Ollama requires significant RAM (8GB+ recommended)
   - Close other applications

4. **Run Ollama on GPU** (if available)

---

## Database Issues

### "Database connection failed"

**Symptoms:**
- Health check shows `database: "disconnected"`
- "ECONNREFUSED" errors

**Solutions:**

1. **Wait for MySQL to initialize:**
   ```bash
   docker-compose logs db
   # Look for "ready for connections"
   ```

2. **Check database health:**
   ```bash
   docker exec ai_visibility_db mysqladmin ping -uroot -prootpassword
   ```

3. **Restart database:**
   ```bash
   docker-compose restart db
   ```

4. **Reset database completely:**
   ```bash
   docker-compose down -v
   docker-compose up
   ```

---

### "Table doesn't exist"

**Symptoms:**
- SQL errors mentioning missing tables
- Analysis fails

**Solutions:**

1. **Run schema manually:**
   ```bash
   docker exec -i ai_visibility_db mysql -uroot -prootpassword ai_visibility < database/schema.sql
   ```

2. **Check schema was applied:**
   ```bash
   docker exec -it ai_visibility_db mysql -uroot -prootpassword -e "SHOW TABLES" ai_visibility
   ```

---

## Analysis Issues

### "Analysis failed" with no details

**Symptoms:**
- Analysis starts but fails silently
- Empty results

**Solutions:**

1. **Check server logs:**
   ```bash
   docker-compose logs -f server
   ```

2. **Verify AI is working:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Try smaller analysis:**
   - Enter just a brand name
   - Remove optional fields

---

### Score always 0 or 50

**Symptoms:**
- Every analysis returns same score
- No mentions detected

**Solutions:**

1. **Check AI responses are saved:**
   ```bash
   docker exec -it ai_visibility_db mysql -uroot -prootpassword -e \
     "SELECT COUNT(*) FROM ai_responses" ai_visibility
   ```

2. **Verify responses contain brand:**
   - Check server logs during analysis
   - AI might not know obscure brands

3. **Try well-known brand:**
   - Test with "Salesforce", "Nike", "Shopify"
   - These should show varying scores

---

### No competitors detected

**Symptoms:**
- Competitor list is empty
- Only your brand shows up

**Solutions:**

1. **Specify industry:**
   - Competitors are industry-specific
   - Add industry in the form

2. **Check industry mappings:**
   - See `responseAnalyzer.js` for supported industries
   - Your industry might not be in the list

3. **Add known competitors:**
   - Use the "Known Competitors" field
   - Comma-separated list

---

## Frontend Issues

### Page not updating after analysis

**Symptoms:**
- Analysis completes but UI doesn't change
- Old data showing

**Solutions:**

1. **Hard refresh:**
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

2. **Clear browser cache**

3. **Check browser console** for errors:
   - Press F12 → Console tab

---

### Charts not rendering

**Symptoms:**
- Score chart area is blank
- No historical data showing

**Solutions:**

1. **Run multiple analyses:**
   - Charts need 2+ data points
   - Run analysis again

2. **Check for JavaScript errors:**
   - Browser console (F12)

3. **Verify history endpoint:**
   ```bash
   curl http://localhost:5000/api/analysis/history/1
   ```

---

## Docker Issues

### Container keeps restarting

**Symptoms:**
- `docker-compose ps` shows "Restarting"
- Service never becomes healthy

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs [service_name]
   ```

2. **Common causes:**
   - Missing environment variables
   - Database connection timeout
   - Syntax error in code

3. **Start fresh:**
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

---

### Out of disk space

**Symptoms:**
- Docker commands fail
- "No space left on device"

**Solutions:**

1. **Clean Docker:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

2. **Remove unused images:**
   ```bash
   docker image prune -a
   ```

---

## Performance Issues

### Analysis too slow

**Expected times:**
| Queries | Time |
|---------|------|
| 20 | 30-60 seconds |
| 35 | 60-90 seconds |

**If slower:**

1. Check Ollama resources (RAM, CPU)
2. Use smaller model
3. Reduce query count
4. Check network latency to Gemini

---

### High memory usage

**Solutions:**

1. **Limit Docker memory:**
   Add to `docker-compose.yml`:
   ```yaml
   services:
     server:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

2. **Use smaller Ollama model**

3. **Restart containers periodically**

---

## Getting Help

If issues persist:

1. **Check server logs:**
   ```bash
   docker-compose logs -f server 2>&1 | tee server-debug.log
   ```

2. **Check database state:**
   ```bash
   docker exec -it ai_visibility_db mysql -uroot -prootpassword ai_visibility
   ```

3. **Open an issue** with:
   - Error messages
   - Server logs
   - Steps to reproduce
   - Your `.env` (without API keys)
