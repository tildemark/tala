# TALA Cache Testing - Command Reference

## Windows PowerShell Commands

### 1. Test Health Endpoint (No Authentication)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

### 2. Test API Root (No Authentication)
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json
```

### 3. Test Protected Endpoint (Will fail without valid JWT)
```powershell
$headers = @{"Authorization" = "Bearer invalid-token"}
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/cache/stats" `
  -Headers $headers `
  -UseBasicParsing `
  -ErrorAction SilentlyContinue

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "error": "InvalidToken",
  "message": "Invalid JWT token"
}
```

---

## Generate Valid JWT Token

### Option 1: Using Node.js (Recommended for TALA)
```powershell
# Create a Node.js script to generate JWT
@'
const jwt = require('jsonwebtoken');

const payload = {
  sub: "user-123",
  tenantId: "org-1",
  email: "test@example.com",
  role: "admin"
};

const secret = process.env.JWT_SECRET || "change-this-to-a-very-long-random-string-in-production";

const token = jwt.sign(payload, secret, {
  expiresIn: "1h",
  algorithm: "HS256"
});

console.log(token);
'@ | Out-File -FilePath "generate-token.js" -Encoding UTF8

# Run it
node generate-token.js
```

### Option 2: Using jwt.io Website
1. Go to https://jwt.io
2. Payload (JSON):
```json
{
  "sub": "user-123",
  "tenantId": "org-1",
  "email": "test@example.com",
  "role": "admin",
  "iat": 1704067200,
  "exp": 1704070800
}
```
3. Secret: `change-this-to-a-very-long-random-string-in-production`
4. Copy the encoded token

---

## Test With Valid JWT Token

Once you have a valid JWT token:

```powershell
# Store the token
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."

# Create headers
$headers = @{"Authorization" = "Bearer $token"}

# Test Cache Stats
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/cache/stats" `
  -Headers $headers `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result (First Call):**
```json
{
  "tenantId": "org-1",
  "keys": [],
  "size": 0
}
```

---

## Test Trial Balance Caching

### First Request (Cache Miss - Slower)
```powershell
$token = "your-valid-jwt-token-here"
$headers = @{"Authorization" = "Bearer $token"}

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/reports/trial-balance?period=2024-01" `
  -Headers $headers `
  -UseBasicParsing

$stopwatch.Stop()

$result = $response.Content | ConvertFrom-Json
Write-Host "Time taken: $($stopwatch.ElapsedMilliseconds)ms"
Write-Host "Cached: $($result.cached)"
Write-Host "Cache Key: $($result.cacheKey)"
$result | ConvertTo-Json
```

**Expected Result (First Time - Cache Miss):**
```json
{
  "cached": false,
  "cacheKey": "tenant:org-1:report:trial_balance:2024-01",
  "report": {
    "period": "2024-01",
    "totalDebit": 100000.00,
    "totalCredit": 100000.00,
    "accounts": [...]
  }
}
// Time taken: ~2000-5000ms (First request, calculates from database)
```

### Second Request (Cache Hit - Faster)
```powershell
# Run the exact same command again
$token = "your-valid-jwt-token-here"
$headers = @{"Authorization" = "Bearer $token"}

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/reports/trial-balance?period=2024-01" `
  -Headers $headers `
  -UseBasicParsing

$stopwatch.Stop()

$result = $response.Content | ConvertFrom-Json
Write-Host "Time taken: $($stopwatch.ElapsedMilliseconds)ms"
Write-Host "Cached: $($result.cached)"
Write-Host "Cache Key: $($result.cacheKey)"
```

**Expected Result (Second Time - Cache Hit):**
```json
{
  "cached": true,
  "cacheKey": "tenant:org-1:report:trial_balance:2024-01",
  "report": {
    // Same data as before
  }
}
// Time taken: ~50-150ms (Returned from Redis cache)
```

---

## Test General Ledger Caching

### First Request (Cache Miss)
```powershell
$token = "your-valid-jwt-token-here"
$headers = @{"Authorization" = "Bearer $token"}

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/reports/general-ledger?accountCode=1000&period=2024-01" `
  -Headers $headers `
  -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
$result | ConvertTo-Json
```

### Second Request (Cache Hit)
```powershell
# Same command - should be faster and show "cached": true
```

---

## Test Cache Invalidation

### Manual Invalidation
```powershell
$token = "your-valid-jwt-token-here"
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

$body = @{
  tenantId = "org-1"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/cache/invalidate" `
  -Method POST `
  -Headers $headers `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "message": "Cache invalidated for tenant org-1",
  "invalidatedKeys": 2,
  "pattern": "tenant:org-1:report:*"
}
```

### Automatic Invalidation via Transaction
```powershell
$token = "your-valid-jwt-token-here"
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}

$transaction = @{
  date = "2024-01-15"
  description = "Test transaction"
  debitAccountId = 1
  creditAccountId = 2
  amount = 100.00
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/journal-entries" `
  -Method POST `
  -Headers $headers `
  -Body $transaction `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Result:**
```json
{
  "id": 1,
  "message": "Journal entry created and cache invalidated"
}
```

After this, the `/api/reports/trial-balance` endpoint will return `"cached": false` (cache was invalidated).

---

## Verify Redis Cache Keys

### Using PowerShell
```powershell
# First, get a shell in the Redis container
docker exec -it tala-cache /bin/sh

# Then use redis-cli
redis-cli -a redis_password_change_in_production

# In redis-cli:
KEYS "tenant:*"
GET "tenant:org-1:report:trial_balance:2024-01"
TTL "tenant:org-1:report:trial_balance:2024-01"
```

### Direct Command
```powershell
docker exec tala-cache redis-cli -a redis_password_change_in_production KEYS "tenant:*"
```

**Expected Output:**
```
1) "tenant:org-1:report:trial_balance:2024-01"
2) "tenant:org-1:report:general_ledger:1000:2024-01"
```

---

## Quick Test Workflow

```powershell
# 1. Generate JWT token and save it
$token = "your-valid-jwt-token"

# 2. Test cache is empty
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "http://localhost:3001/api/cache/stats" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 3. First Trial Balance request (SLOW - ~3-5 seconds)
Invoke-WebRequest -Uri "http://localhost:3001/api/reports/trial-balance?period=2024-01" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 4. Check cache is now populated
Invoke-WebRequest -Uri "http://localhost:3001/api/cache/stats" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 5. Second Trial Balance request (FAST - ~100ms)
Invoke-WebRequest -Uri "http://localhost:3001/api/reports/trial-balance?period=2024-01" -Headers $headers -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 6. Verify response shows cached: true and faster time
```

---

## Troubleshooting

### "InvalidToken" Error
- Your JWT token is invalid or malformed
- Verify token format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....`
- Check JWT_SECRET matches what API expects
- Use https://jwt.io to verify token validity

### "Invalid Content-Type" Error
- Ensure header includes: `"Content-Type" = "application/json"`
- Add to your headers: `$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}`

### Redis Connection Error
- Verify Redis is running: `docker exec tala-cache redis-cli -a redis_password_change_in_production PING`
- Check API logs: `docker logs tala-api --tail 20`
- Verify REDIS_URL in docker-compose.yml

### Report Endpoint Returns Empty
- Ensure database has accounts and journal entries
- Check Prisma seed data loaded: `docker logs tala-db`
- Manually verify: `docker exec tala-db psql -U postgres -d tala -c "SELECT * FROM accounts;"`
