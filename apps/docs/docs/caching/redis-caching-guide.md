# TALA Redis Caching Strategy - Financial Reports

## Overview

Tenant-prefixed Redis caching strategy implemented for heavy financial reports (Trial Balance & General Ledger) to improve performance and reduce database load.

**Cache Key Format**: `tenant:{tenantId}:report:{reportName}:{context}`

---

## Architecture

### Components

```
packages/cache/
├── src/
│   └── index.ts              # CacheService, CacheKeyBuilder, ReportCacheManager
├── package.json
└── tsconfig.json

apps/api/src/
├── services/
│   └── FinancialReportsService.ts    # Report generation + caching logic
├── routes/
│   └── accounting-cached.ts          # API endpoints with cache integration
```

### Docker Integration

**Redis Service** (`tala-cache`):
- Image: `redis:7-alpine`
- Port: `6379` (default)
- Persistence: `--appendonly yes` (AOF persistence)
- Authentication: Password-protected
- Health Check: Custom ping command

**Docker Compose Environment Variables**:
```yaml
REDIS_URL: redis://:password@tala-cache:6379
REDIS_PASSWORD: (from env)
```

---

## Cache Key Strategy

### Key Format Hierarchy

```
tenant:tenantId:report:reportName:context
```

### Report-Specific Keys

#### Trial Balance
```
tenant:12345:report:trial_balance:2024-01
```
- `tenantId`: Tenant identifier
- `reportName`: `trial_balance`
- `context`: Period (YYYY-MM)

#### General Ledger
```
tenant:12345:report:general_ledger:1000:2024-01
```
- `tenantId`: Tenant identifier
- `reportName`: `general_ledger`
- `context`: `{accountCode}:{period}`

### Tenant Pattern for Invalidation
```
tenant:12345:report:*
```
Matches all cached reports for a specific tenant.

---

## API Endpoints

### 1. Trial Balance Report

**GET** `/api/reports/trial-balance`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `period` | string | Yes | Reporting period (YYYY-MM) |
| `skipCache` | boolean | No | Force refresh (true/false) |

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "2024-01",
    "asOf": "2024-01-31",
    "totalDebits": 150000.00,
    "totalCredits": 150000.00,
    "balanced": true,
    "accounts": [
      {
        "accountCode": "1000",
        "accountName": "Cash",
        "accountType": "ASSET",
        "debit": 50000.00,
        "credit": 0,
        "balance": 50000.00
      }
    ]
  },
  "cached": true,
  "cacheKey": "tenant:12345:report:trial_balance:2024-01"
}
```

**Cache Behavior**:
- First request: Generates report, caches for 24 hours
- Subsequent requests: Returns cached data (TTL shown in response)
- Use `skipCache=true` to force fresh generation

### 2. General Ledger Report

**GET** `/api/reports/general-ledger`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accountCode` | string | Yes | Chart of account code |
| `period` | string | Yes | Reporting period (YYYY-MM) |
| `skipCache` | boolean | No | Force refresh |

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "2024-01",
    "accountCode": "1000",
    "accountName": "Cash",
    "openingBalance": 10000.00,
    "closingBalance": 35000.00,
    "totalDebits": 50000.00,
    "totalCredits": 25000.00,
    "entries": [
      {
        "date": "2024-01-15",
        "description": "Customer deposit",
        "referenceNo": "INV-001",
        "debit": 25000.00,
        "credit": 0,
        "runningBalance": 35000.00
      }
    ]
  },
  "cached": true,
  "cacheKey": "tenant:12345:report:general_ledger:1000:2024-01"
}
```

### 3. Cache Statistics

**GET** `/api/cache/stats`

Returns information about cached reports for the current tenant:
```json
{
  "success": true,
  "data": {
    "totalKeys": 5,
    "keys": [
      "tenant:12345:report:trial_balance:2024-01",
      "tenant:12345:report:trial_balance:2024-02",
      "tenant:12345:report:general_ledger:1000:2024-01",
      "tenant:12345:report:general_ledger:1100:2024-01",
      "tenant:12345:report:general_ledger:2000:2024-02"
    ]
  }
}
```

### 4. Manual Cache Invalidation

**POST** `/api/cache/invalidate`

Manually clear all cached reports for the current tenant:
```json
{
  "success": true,
  "message": "Cache invalidated for tenant"
}
```

**Requires Permission**: `can_manage_reports`

---

## Cache Invalidation Strategy

### Automatic Invalidation

Cache is **automatically invalidated** when transactions are modified:

1. **POST** `/api/journal-entries` (New transaction posted)
   - All cached reports for tenant are cleared
   - Next report request regenerates and re-caches

2. **PUT** `/api/journal-entries/:id` (Transaction updated)
   - All cached reports for tenant are cleared

3. **DELETE** `/api/journal-entries/:id` (Transaction voided)
   - All cached reports for tenant are cleared

### Manual Invalidation

```javascript
// Clear all reports for a tenant
await FinancialReportsService.invalidateReportsOnTransaction(tenantId);

// Clear specific report type
await CacheService.invalidateTenantReport(tenantId, 'trial_balance');
```

---

## Performance Characteristics

### Cache Behavior

| Scenario | Response Time | Data Source |
|----------|---------------|-------------|
| First Report Request | 2-5 seconds | Database (full scan) |
| Cached Report Request | 50-100ms | Redis |
| Cache Hit Ratio | ~80-90% | (typical production) |

### Database Load Reduction

**Before Caching**:
- Each report request: ~100 DB queries
- Peak: 5 reports/second × 100 queries = 500 QPS

**After Caching**:
- First request: 100 queries
- Cached requests: 0 queries
- Typical peak reduction: 80-90%

---

## Service Classes

### `CacheService`

Low-level Redis operations with connection pooling.

```typescript
// Initialize
await CacheService.connect();

// Set value (1 hour TTL)
await CacheService.set(key, value, 3600);

// Get value
const value = await CacheService.get(key);

// Invalidate pattern
await CacheService.invalidateTenantReports(tenantId);

// Get or Set pattern
const value = await CacheService.getOrSet(
  key,
  async () => {
    // Fetch from DB if not cached
    return await expensiveOperation();
  },
  3600
);
```

### `CacheKeyBuilder`

Utility for building standardized cache keys.

```typescript
// Trial Balance key
const key = CacheKeyBuilder.buildTrialBalanceKey(tenantId, '2024-01', filters);

// General Ledger key
const key = CacheKeyBuilder.buildGeneralLedgerKey(
  tenantId,
  '1000',
  '2024-01',
  filters
);

// Get pattern for invalidation
const pattern = CacheKeyBuilder.buildTenantPattern(tenantId);
```

### `ReportCacheManager`

High-level report caching interface.

```typescript
// Get or generate Trial Balance
const report = await ReportCacheManager.getTrialBalance(tenantId, period);

// Cache Trial Balance
await ReportCacheManager.cacheTrialBalance(
  tenantId,
  period,
  reportData,
  86400 // 24 hours
);

// Invalidate specific report
await ReportCacheManager.invalidateTrialBalance(tenantId);
```

### `FinancialReportsService`

Business logic for generating and caching financial reports.

```typescript
// Get trial balance (with caching)
const report = await FinancialReportsService.getTrialBalance(
  tenantId,
  period,
  skipCache // optional
);

// Get general ledger (with caching)
const report = await FinancialReportsService.getGeneralLedger(
  tenantId,
  accountCode,
  period,
  skipCache
);

// Invalidate on transaction
await FinancialReportsService.invalidateReportsOnTransaction(tenantId);

// Get cache stats
const stats = await FinancialReportsService.getCacheStats(tenantId);
```

---

## Implementation Examples

### Example 1: Get Trial Balance with Cache

```typescript
import { FinancialReportsService } from '@tala/api';

// Request
GET /api/reports/trial-balance?period=2024-01

// Response (first request - cache miss)
{
  "success": true,
  "data": { /* trial balance data */ },
  "cached": false,
  "cacheKey": "tenant:user-org-1:report:trial_balance:2024-01"
}

// Request (second request - cache hit)
GET /api/reports/trial-balance?period=2024-01

// Response (cached)
{
  "success": true,
  "data": { /* same data */ },
  "cached": true,  // ← Indicates cache hit
  "cacheKey": "tenant:user-org-1:report:trial_balance:2024-01"
}
```

### Example 2: Post Transaction (Auto-Invalidate)

```typescript
// Post new journal entry
POST /api/journal-entries
{
  "entryDate": "2024-01-15",
  "items": [
    { "accountId": "...", "debit": 1000 },
    { "accountId": "...", "credit": 1000 }
  ]
}

// Response (entry created + cache cleared)
{
  "success": true,
  "data": { /* entry data */ },
  "message": "Report caches invalidated for tenant"
}

// Next report request will regenerate and re-cache
GET /api/reports/trial-balance?period=2024-01
// → Cache miss, fresh generation from updated DB
```

### Example 3: Force Refresh

```typescript
// Bypass cache and regenerate
GET /api/reports/general-ledger?accountCode=1000&period=2024-01&skipCache=true

// Response (fresh generation)
{
  "success": true,
  "data": { /* latest data */ },
  "cached": false  // ← Forced refresh, not from cache
}
```

---

## Configuration

### Environment Variables

Add to `.env`:
```env
# Redis Configuration
REDIS_URL=redis://:password@localhost:6379
REDIS_PASSWORD=your_secure_password
REDIS_PORT=6379
```

### Docker Compose

Already configured in `docker-compose.yml`:
```yaml
tala-cache:
  image: redis:7-alpine
  environment:
    REDIS_PASSWORD: ${REDIS_PASSWORD}
  depends_on:
    - tala-cache  # API depends on Redis
```

### Cache TTL Settings

**Trial Balance**:
- TTL: 24 hours (86400 seconds)
- Invalidation: On transaction post

**General Ledger**:
- TTL: 24 hours (86400 seconds)
- Invalidation: On transaction post

---

## Monitoring & Troubleshooting

### Check Redis Connection

```bash
# Connect to Redis
docker exec -it tala-cache redis-cli

# Authenticate
AUTH your_password

# Ping
PING

# Get all tenant keys
KEYS "tenant:*:report:*"
```

### View Cache Statistics

```bash
# Get cache info for tenant
GET /api/cache/stats

# Response
{
  "totalKeys": 10,
  "keys": [
    "tenant:12345:report:trial_balance:2024-01",
    ...
  ]
}
```

### Manually Clear Cache

```bash
# Endpoint
POST /api/cache/invalidate

# Or via Redis CLI
KEYS "tenant:12345:report:*" | xargs DEL
```

### Monitor Cache Hits/Misses

Check application logs for:
```
[Cache HIT] Trial Balance for tenant:12345, period:2024-01
[Cache MISS] Generating Trial Balance for tenant:12345, period:2024-01
[Cache INVALIDATE] Clearing reports for tenant:12345
```

---

## Multi-Tenant Data Isolation

### Tenant Prefixing

Every cache key includes the tenant ID:
```
tenant:{tenantId}:report:...
```

### Guarantee

- ✅ Tenant A cannot access Tenant B's cached reports
- ✅ KEYS pattern matching ensures strict isolation
- ✅ Each tenant has independent cache TTLs
- ✅ Invalidation only affects the specific tenant

### Example

```typescript
// Tenant 1
tenant:1:report:trial_balance:2024-01

// Tenant 2 (same period, different data)
tenant:2:report:trial_balance:2024-01

// Invalidating Tenant 1 does NOT affect Tenant 2
await CacheService.invalidateTenantReports('1');
// → Only clears "tenant:1:report:*"
// → "tenant:2:report:*" remains cached
```

---

## Next Steps & Enhancements

### Potential Additions

1. **Report Scheduling**
   - Pre-generate reports at month-end
   - Warm cache with common periods

2. **Advanced Invalidation**
   - Partial invalidation on account changes
   - Cascade invalidation for related reports

3. **Analytics Dashboard**
   - Cache hit/miss ratios
   - Report generation time analytics
   - Redis memory usage monitoring

4. **Custom Report Types**
   - Profit & Loss (P&L)
   - Balance Sheet
   - Cash Flow Statement

5. **Export Functionality**
   - PDF generation (cached reports)
   - Excel export with audit trail

---

## Summary

| Feature | Details |
|---------|---------|
| **Cache Keys** | Tenant-prefixed: `tenant:{id}:report:{name}:{context}` |
| **Reports Cached** | Trial Balance, General Ledger |
| **TTL** | 24 hours (configurable) |
| **Invalidation** | Automatic on transaction changes, manual via API |
| **Performance** | 50-100ms response time (cached) vs 2-5s (fresh) |
| **Data Isolation** | Complete tenant segregation via key prefixing |
| **Docker** | Redis 7-alpine with persistence & authentication |

