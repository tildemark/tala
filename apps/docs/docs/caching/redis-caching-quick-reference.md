# TALA Redis Caching - Quick Reference

## Installation & Setup

### 1. Install Dependencies

```bash
# Install Redis client in API
cd apps/api
npm install redis

# Or with pnpm (workspace)
pnpm add redis
```

### 2. Start Docker Services

```bash
# Start all services including Redis
docker-compose up -d

# Verify Redis is running
docker exec -it tala-cache redis-cli ping
# Expected: PONG
```

### 3. Environment Variables

Add to `.env`:
```env
REDIS_URL=redis://:redis_password_change_in_production@localhost:6379
REDIS_PASSWORD=redis_password_change_in_production
```

---

## API Usage

### Get Trial Balance (Cached)

```bash
# First request (cache miss, ~2-5s)
curl "http://localhost:3001/api/reports/trial-balance?period=2024-01"

# Second request (cache hit, ~50-100ms)
curl "http://localhost:3001/api/reports/trial-balance?period=2024-01"

# Force refresh
curl "http://localhost:3001/api/reports/trial-balance?period=2024-01&skipCache=true"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "2024-01",
    "totalDebits": 150000,
    "totalCredits": 150000,
    "balanced": true,
    "accounts": [...]
  },
  "cached": true,
  "cacheKey": "tenant:12345:report:trial_balance:2024-01"
}
```

### Get General Ledger (Cached)

```bash
# Get GL for account 1000
curl "http://localhost:3001/api/reports/general-ledger?accountCode=1000&period=2024-01"
```

**Cache Key**: `tenant:12345:report:general_ledger:1000:2024-01`

### View Cache Statistics

```bash
curl http://localhost:3001/api/cache/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalKeys": 5,
    "keys": [
      "tenant:12345:report:trial_balance:2024-01",
      "tenant:12345:report:general_ledger:1000:2024-01",
      ...
    ]
  }
}
```

### Clear Cache Manually

```bash
curl -X POST http://localhost:3001/api/cache/invalidate \
  -H "Authorization: Bearer <token>"
```

---

## Cache Key Reference

### Key Format
```
tenant:{tenantId}:report:{reportName}:{context}
```

### Examples

| Report | Key |
|--------|-----|
| Trial Balance (Jan 2024) | `tenant:org-1:report:trial_balance:2024-01` |
| GL Account 1000 (Jan 2024) | `tenant:org-1:report:general_ledger:1000:2024-01` |
| GL Account 2000 (Feb 2024) | `tenant:org-1:report:general_ledger:2000:2024-02` |

### Invalidation Patterns

```bash
# All reports for tenant (pattern)
tenant:org-1:report:*

# Specific report type
tenant:org-1:report:trial_balance:*
tenant:org-1:report:general_ledger:*
```

---

## Code Examples

### Generate Report with Cache

```typescript
import { FinancialReportsService } from '../services/FinancialReportsService';

// Get or generate from cache
const report = await FinancialReportsService.getTrialBalance(
  tenantId,
  '2024-01'  // period
);

// Force refresh (skip cache)
const fresh = await FinancialReportsService.getTrialBalance(
  tenantId,
  '2024-01',
  true  // skipCache
);
```

### Manual Cache Operations

```typescript
import { CacheService, CacheKeyBuilder } from '@tala/cache';

// Connect to Redis
await CacheService.connect();

// Build key
const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, '2024-01');

// Set value
await CacheService.set(key, reportData, 86400);  // 24 hours

// Get value
const cached = await CacheService.get(key);

// Check existence
if (await CacheService.exists(key)) {
  console.log('Cached!');
}

// Delete specific key
await CacheService.delete(key);

// Invalidate all tenant reports
await CacheService.invalidateTenantReports(tenantId);

// Get cache statistics
const stats = await CacheService.getTenantCacheStats(tenantId);
console.log(`Cached keys: ${stats.totalKeys}`);
```

### Invalidate on Transaction

```typescript
// When posting new journal entries
import { FinancialReportsService } from '../services/FinancialReportsService';

// ... create journal entry ...

// Clear all reports for this tenant
await FinancialReportsService.invalidateReportsOnTransaction(tenantId);

// Next report request will regenerate and cache
```

---

## Redis CLI Commands

```bash
# Connect to Redis
docker exec -it tala-cache redis-cli

# Authenticate (if required)
AUTH password

# Ping
PING

# View all cache keys
KEYS "tenant:*:report:*"

# View specific tenant keys
KEYS "tenant:12345:report:*"

# Get cache key details
TTL "tenant:12345:report:trial_balance:2024-01"
GET "tenant:12345:report:trial_balance:2024-01"

# Delete specific key
DEL "tenant:12345:report:trial_balance:2024-01"

# Delete all tenant reports
DEL $(redis-cli KEYS "tenant:12345:report:*")

# View Redis info
INFO stats
INFO memory

# Get total keys
DBSIZE

# Flush all (⚠️ danger - clears entire Redis)
FLUSHALL
```

---

## Performance Tips

### ✅ Do's

- ✅ Use `period` parameters (e.g., 2024-01) for cache differentiation
- ✅ Call reports multiple times without regeneration
- ✅ Post transactions frequently (cache auto-invalidates)
- ✅ Monitor `cached` flag in responses
- ✅ Use `skipCache=true` only when needed

### ❌ Don'ts

- ❌ Use `skipCache=true` for every request (defeats purpose)
- ❌ Call `invalidate` endpoint unless necessary
- ❌ Fetch reports with different date filters on same cached key
- ❌ Run multiple Redis instances per tenant

---

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep tala-cache

# View Redis logs
docker logs tala-cache

# Test connection
docker exec tala-cache redis-cli ping

# Check Redis URL is correct
echo $REDIS_URL
```

### Cache Not Working

```bash
# Check if cache keys exist
docker exec tala-cache redis-cli KEYS "tenant:*:report:*"

# View specific cache entry
docker exec tala-cache redis-cli GET "tenant:12345:report:trial_balance:2024-01"

# Check TTL (remaining time in seconds)
docker exec tala-cache redis-cli TTL "tenant:12345:report:trial_balance:2024-01"
```

### Memory Issues

```bash
# View Redis memory usage
docker exec tala-cache redis-cli INFO memory

# If cache is too large, manually clear
docker exec tala-cache redis-cli FLUSHALL

# Or clear specific tenant
docker exec tala-cache redis-cli EVAL \
  "return redis.call('del',unpack(redis.call('keys','tenant:12345:report:*')))" 0
```

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Cache Hit Response | 50-100ms |
| Cache Miss (Fresh Gen) | 2-5 seconds |
| Typical Cache Hit Rate | 80-90% |
| Memory per Report | 100-500KB |
| Max TTL | 24 hours (86400s) |
| Auto-Invalidation | On transaction |

---

## Files Created/Modified

### New Files
- `packages/cache/src/index.ts` - Cache service implementation
- `packages/cache/package.json` - Cache package config
- `packages/cache/tsconfig.json` - TypeScript config
- `apps/api/src/services/FinancialReportsService.ts` - Report generation
- `apps/api/src/routes/accounting-cached.ts` - Cached API endpoints

### Modified Files
- `docker-compose.yml` - Added REDIS_URL env vars, Redis dependency
- `apps/api/package.json` - Added redis dependency
- `.env` - Add REDIS_URL and REDIS_PASSWORD

### Documentation
- `REDIS_CACHING_GUIDE.md` - Comprehensive guide
- `REDIS_CACHING_QUICK_REFERENCE.md` - This file

---

## Next Steps

1. Install Redis: `npm install redis` in API
2. Update `.env` with Redis credentials
3. Start Docker: `docker-compose up -d`
4. Test endpoint: `curl http://localhost:3001/api/reports/trial-balance?period=2024-01`
5. Monitor cache: `GET /api/cache/stats`

---

## Support

For more details, see **REDIS_CACHING_GUIDE.md** for:
- Architecture overview
- Detailed API documentation
- Cache invalidation strategy
- Multi-tenant isolation
- Monitoring & debugging
- Enhancement recommendations

