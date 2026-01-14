# API Documentation (Swagger)

> Interactive API documentation and testing interface powered by Swagger UI

## 🚀 Quick Access

**Swagger UI**: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

The Swagger UI provides an interactive interface where you can:
- ✅ Browse all API endpoints
- ✅ Test APIs directly without Postman
- ✅ View request/response schemas
- ✅ See authentication requirements
- ✅ Download OpenAPI specification

---

## 📋 API Endpoints Overview

### Health Checks
- `GET /health` - Health check with database connectivity
- `GET /ready` - Readiness probe for Kubernetes
- `GET /live` - Liveness probe for Kubernetes

### Chart of Accounts
- `GET /api/chart-of-accounts` - List all GL accounts
- `POST /api/chart-of-accounts` - Create new GL account
- `PUT /api/chart-of-accounts/:id` - Update GL account
- `DELETE /api/chart-of-accounts/:id` - Delete GL account

### Journal Entries
- `GET /api/journal-entries` - List journal entries
- `POST /api/journal-entries` - Create new journal entry (draft)
- `POST /api/journal-entries/:id/post` - Post journal entry (finalizes transaction)
- `POST /api/journal-entries/:id/void` - Void posted entry

### Financial Reports
- `GET /api/reports/trial-balance?period=2024-01` - Trial balance report
- `GET /api/reports/general-ledger?accountCode=1010&period=2024-01` - General ledger

### Cache Management
- `GET /api/cache/stats` - Redis cache statistics
- `POST /api/cache/clear` - Clear all tenant-specific cache

---

## 🔐 Authentication

All API endpoints (except health checks) require JWT authentication.

### Development Mode (Current Setup)

Since `DISABLE_AUTH=true` is set in your environment, authentication is bypassed:

**In Swagger UI:**
1. Click "Authorize" button (🔒)
2. Leave empty or enter any value
3. Click "Authorize"
4. All requests will work without real JWT

### Production Mode

When `DISABLE_AUTH=false`:

**Get JWT Token:**
```bash
POST /api/auth/login
{
  "email": "admin@tenant.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "uuid",
    "email": "admin@tenant.com",
    "tenantId": "tenant-uuid"
  }
}
```

**Use Token in Swagger:**
1. Copy the `token` value
2. Click "Authorize" in Swagger UI
3. Enter: `Bearer <your-token-here>`
4. Click "Authorize"

---

## 🧪 Testing APIs in Swagger

### Example 1: Get Chart of Accounts

1. Navigate to [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
2. Find `GET /api/chart-of-accounts` under "Chart of Accounts" section
3. Click to expand
4. Click **"Try it out"**
5. Click **"Execute"**
6. View the response below

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tenantId": "dev-tenant",
      "accountCode": "1010",
      "accountName": "Cash - Bank Account",
      "accountType": "ASSET",
      "normalBalance": "DEBIT",
      "isActive": true
    }
  ],
  "count": 40
}
```

### Example 2: Create New GL Account

1. Find `POST /api/chart-of-accounts`
2. Click **"Try it out"**
3. Edit the request body:

```json
{
  "accountCode": "1020",
  "accountName": "Petty Cash",
  "accountType": "ASSET",
  "normalBalance": "DEBIT"
}
```

4. Click **"Execute"**
5. View created account in response

### Example 3: Generate Trial Balance

1. Find `GET /api/reports/trial-balance`
2. Click **"Try it out"**
3. Enter period: `2024-01`
4. Leave `skipCache` empty (uses cache if available)
5. Click **"Execute"**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "period": "2024-01",
    "accounts": [
      {
        "accountCode": "1010",
        "accountName": "Cash - Bank Account",
        "debit": 50000.00,
        "credit": 0.00
      }
    ],
    "totalDebit": 50000.00,
    "totalCredit": 50000.00,
    "isBalanced": true
  },
  "cached": true
}
```

---

## 📖 Schema Reference

### ChartOfAccount

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "accountCode": "1010",
  "accountName": "Cash - Bank Account",
  "accountType": "ASSET | LIABILITY | EQUITY | REVENUE | EXPENSE",
  "normalBalance": "DEBIT | CREDIT",
  "isActive": true,
  "createdAt": "2024-01-14T10:00:00Z",
  "deletedAt": null
}
```

### JournalEntry

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "entryDate": "2024-01-14",
  "description": "Sales invoice payment",
  "status": "DRAFT | POSTED | VOIDED",
  "totalDebit": 1000.00,
  "totalCredit": 1000.00,
  "createdAt": "2024-01-14T10:00:00Z",
  "postedAt": null,
  "voidedAt": null
}
```

### JournalDetail (Line Item)

```json
{
  "id": "uuid",
  "journalEntryId": "uuid",
  "accountId": "uuid",
  "debit": 1000.00,
  "credit": 0.00,
  "description": "Cash received"
}
```

---

## 🔄 Cache Behavior

### Trial Balance Caching

**Cache Key**: `tenant:{tenantId}:report:trial_balance:{period}`

**TTL**: 24 hours

**Invalidation**:
- Automatic when journal entries are posted
- Manual via `POST /api/cache/clear`
- Query param `?skipCache=true` to bypass

**Check if cached**:
```bash
GET /api/cache/stats
```

Response shows cache hit/miss rates per tenant.

---

## 🚨 Common Errors

### 401 Unauthorized

**Cause**: Missing or invalid JWT token

**Solution**: 
- In dev mode: Ensure `DISABLE_AUTH=true` in docker-compose.yml
- In prod mode: Obtain JWT via `/api/auth/login`

### 403 Forbidden

**Cause**: User lacks required permission

**Example**: Trying to create account without `can_create_account` permission

**Solution**: 
- Check user's role assignments
- Verify role has required permissions in database

### 400 Bad Request

**Cause**: Invalid request body or missing required fields

**Solution**: Check Swagger UI schema for required fields

### 500 Internal Server Error

**Cause**: Database error, Redis connection issue, or code bug

**Solution**: Check API logs:
```bash
docker compose logs tala-api --tail 50
```

---

## 📥 Export OpenAPI Specification

Download the complete OpenAPI spec in JSON format:

**URL**: [http://localhost:3001/api-docs.json](http://localhost:3001/api-docs.json)

Use this file to:
- Generate client SDKs (TypeScript, Python, etc.)
- Import into Postman collections
- Generate documentation in other formats
- Share API contract with frontend team

---

## 🔗 Related Documentation

- [Architecture Overview](../technical/architecture-overview.md) - System design and components
- [Implementation Guide](../technical/implementation-guide.md) - RBAC and authentication details
- [Transaction Lifecycle](../technical/transaction-lifecycle.md) - Journal entry workflow
- [Redis Caching](../caching/redis-caching-overview.md) - Cache strategy and TTL

---

**Last Updated**: 2026-01-14  
**Swagger Version**: OpenAPI 3.0.0  
**API Base URL**: http://localhost:3001
