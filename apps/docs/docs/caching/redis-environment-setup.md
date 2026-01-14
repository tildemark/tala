# TALA Redis Caching - Environment Setup

## Environment Variables

Add these to your `.env` file in the project root:

```env
# ============================================================================
# REDIS CACHE CONFIGURATION
# ============================================================================

# Redis connection URL for Docker network
REDIS_URL=redis://:redis_password_change_in_production@tala-cache:6379

# Redis authentication password
REDIS_PASSWORD=redis_password_change_in_production

# Redis port (default: 6379)
REDIS_PORT=6379

# ============================================================================
# CACHING SETTINGS
# ============================================================================

# Trial Balance Cache TTL (in seconds, default: 86400 = 24 hours)
TRIAL_BALANCE_CACHE_TTL=86400

# General Ledger Cache TTL (in seconds, default: 86400 = 24 hours)
GENERAL_LEDGER_CACHE_TTL=86400

# Enable/disable caching (default: true)
ENABLE_REPORT_CACHING=true
```

## Docker Compose Integration

The following services are already configured in `docker-compose.yml`:

### tala-cache Service

```yaml
services:
  tala-cache:
    image: redis:7-alpine
    container_name: tala-cache
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    environment:
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - tala-cache-data:/data
    networks:
      - tala-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### tala-api Service Updates

```yaml
tala-api:
  # ... existing config ...
  depends_on:
    tala-db:
      condition: service_healthy
    tala-cache:
      condition: service_healthy  # ← Added Redis dependency
  environment:
    # ... existing vars ...
    REDIS_URL: redis://:${REDIS_PASSWORD:-redis_password_change_in_production}@tala-cache:6379
    REDIS_PASSWORD: ${REDIS_PASSWORD:-redis_password_change_in_production}
    # ... rest of config ...
```

## Local Development

### Option 1: Using Docker Compose (Recommended)

```bash
# Start all services including Redis
docker-compose up -d

# Verify Redis is healthy
docker-compose ps
# Look for: tala-cache (healthy)

# Check Redis connection
docker exec tala-cache redis-cli ping
# Expected: PONG
```

### Option 2: Local Redis Installation

#### Windows (WSL2 or Docker Desktop)

```bash
# Using Docker
docker run -d \
  -p 6379:6379 \
  --name redis \
  redis:7-alpine

# Using Chocolatey
choco install redis
```

#### macOS

```bash
# Using Homebrew
brew install redis

# Start service
brew services start redis
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Start service
sudo systemctl start redis-server
```

### Update .env for Local Redis

```env
# Local development
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=  # Leave empty if no auth
```

## Starting the Application

### With Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f tala-api

# Stop services
docker-compose down
```

### With npm/pnpm

```bash
# Install dependencies (if not done)
pnpm install

# Run development server
pnpm dev

# API will start on http://localhost:3001
```

## Verify Setup

### Check Redis Connection

```bash
# Test Redis connectivity from API
curl http://localhost:3001/cache/stats

# Expected response (if authenticated):
{
  "success": true,
  "data": {
    "totalKeys": 0,
    "keys": []
  }
}
```

### Test Report Caching

```bash
# First request (cache miss, will be slow)
curl "http://localhost:3001/api/reports/trial-balance?period=2024-01"

# Second request (cache hit, will be fast)
curl "http://localhost:3001/api/reports/trial-balance?period=2024-01"

# Check response for "cached" flag
{
  "success": true,
  "data": { ... },
  "cached": true,  # ← Indicates cache hit
  "cacheKey": "tenant:...:report:trial_balance:2024-01"
}
```

## Production Deployment

### Environment Variables to Change

```env
# Production - use secure password
REDIS_PASSWORD=your_very_secure_password_here_minimum_32_chars

# Production - use full Redis cluster URL if applicable
REDIS_URL=redis://:secure_password@redis-production.example.com:6379

# Production - consider shorter cache for real-time data
TRIAL_BALANCE_CACHE_TTL=3600        # 1 hour
GENERAL_LEDGER_CACHE_TTL=3600       # 1 hour
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
services:
  tala-cache:
    image: redis:7-alpine
    restart: always
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis-persistent-data:/data
    networks:
      - tala-network
    # Remove ports for security (only internal access)
```

### Security Checklist

- ✅ Set strong `REDIS_PASSWORD` (32+ characters)
- ✅ Use internal Docker network (no public Redis port exposure)
- ✅ Enable persistence (`--appendonly yes`)
- ✅ Set memory limits (`--maxmemory 512mb`)
- ✅ Configure eviction policy (`--maxmemory-policy allkeys-lru`)
- ✅ Use SSL/TLS for remote Redis servers
- ✅ Monitor Redis logs for errors
- ✅ Regular backup of Redis data

## Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
1. Verify Redis is running: `docker exec tala-cache redis-cli ping`
2. Check `REDIS_URL` in `.env`
3. Verify port mapping in `docker-compose.yml`
4. Restart Redis: `docker-compose restart tala-cache`

### Authentication Failed

```
Error: NOAUTH Authentication required
```

**Solution**:
1. Check password matches: `$REDIS_PASSWORD`
2. Verify connection URL includes password: `redis://:password@host:6379`
3. Redis CLI: `AUTH password`

### Memory Issues

```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solution**:
1. Increase memory limit in compose file: `--maxmemory 1gb`
2. Clear old cache: `docker exec tala-cache redis-cli FLUSHALL`
3. Monitor memory: `docker exec tala-cache redis-cli INFO memory`

### Cache Not Persisting

**Solution**:
Ensure persistence is enabled in `docker-compose.yml`:
```yaml
command: redis-server --appendonly yes
volumes:
  - tala-cache-data:/data
```

## Performance Tuning

### Optimize Redis Configuration

```bash
# Connect to Redis
docker exec -it tala-cache redis-cli

# View current config
CONFIG GET maxmemory
CONFIG GET timeout
CONFIG GET tcp-keepalive

# Set memory limit
CONFIG SET maxmemory 512mb

# Set eviction policy
CONFIG SET maxmemory-policy allkeys-lru

# Save config
CONFIG REWRITE
```

### Monitor Performance

```bash
# View real-time commands
docker exec tala-cache redis-cli MONITOR

# View stats
docker exec tala-cache redis-cli INFO stats

# View memory usage
docker exec tala-cache redis-cli INFO memory

# View key count
docker exec tala-cache redis-cli DBSIZE
```

## Maintenance

### Regular Health Checks

```bash
# Weekly: Verify Redis connectivity
docker exec tala-cache redis-cli PING

# Weekly: Check memory usage
docker exec tala-cache redis-cli INFO memory

# Monthly: Review cache keys
docker exec tala-cache redis-cli KEYS "tenant:*:report:*" | wc -l

# Monthly: Clear expired sessions/reports
docker exec tala-cache redis-cli EVAL \
  "return redis.call('del',unpack(redis.call('keys','tenant:*:report:*')))" 0
```

### Backup & Restore

```bash
# Backup Redis data
docker exec tala-cache redis-cli BGSAVE
docker cp tala-cache:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb

# Restore from backup
docker cp ./redis-backup.rdb tala-cache:/data/dump.rdb
docker exec tala-cache redis-cli SHUTDOWN
docker-compose up -d
```

## References

- [Redis Official Documentation](https://redis.io/documentation)
- [Docker Redis Image](https://hub.docker.com/_/redis)
- [Node.js Redis Client](https://github.com/redis/node-redis)
- [TALA Caching Guide](./REDIS_CACHING_GUIDE.md)

