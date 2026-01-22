# TALA Codebase AI Agent Instructions

**TALA** is a multi-tenant, enterprise-grade Computerized Accounting System (CAS) for Philippine compliance (BIR RR 9-2009, DPA 2012). All code changes must respect multi-tenancy, security, and cryptographic audit requirements.

## Architecture Essentials

### Monorepo Structure (pnpm workspaces + Turbo)
- **apps/** → Three main applications: `api` (Express backend), `web` (Next.js frontend), `docs` (Docusaurus)
- **packages/** → Shared libraries: `database` (Prisma schema), `auth` (JWT + RBAC), `cache` (Redis), `audit` (crypto hash chain), `shared` (security utilities)

**Key flows:**
- **Frontend** (Next.js/3000) → **API** (Express/3001) via REST/JWT
- **API** queries PostgreSQL via Prisma ORM and caches results in Redis (tenant-prefixed keys)
- **All data modifications** must create audit log entries with cryptographic hash linking

### Multi-Tenancy & Data Isolation
Every table has `tenantId` discriminator. The `@tala/auth` middleware enforces tenant scoping on every request:
- `verifyJWT` middleware extracts tenant from JWT token
- All Prisma queries **must filter by `req.tenant.id`**—cross-tenant access is a security violation
- Cache keys use format: `tenant:{tenantId}:report:{reportName}`
- Route handlers access tenant via `req.tenant.id` or `req.auth.tenantId`

**Pattern example:** `{ where: { tenantId: req.tenant.id, ...otherFilters } }`

## Critical Developer Workflows

### Running the Stack
- **Development mode:** `pnpm dev` (starts all 3 apps in parallel: web/3000, api/3001, docs/3002)
- **Full Docker:** `docker-compose up` (PostgreSQL, Redis, pgAdmin, all services)
- **Database migrations:** `pnpm db:migrate` or `pnpm db:push` (from root, runs in `packages/database`)
- **Seeding:** `pnpm db:seed` (populates realistic 2025 accounting data)
- **API docs:** Navigate to `http://localhost:3001/api-docs` (Swagger UI with interactive endpoints)

### Building for Production
- `pnpm build` (Turbo orchestrates builds across all workspaces)
- `pnpm lint` / `pnpm type-check` / `pnpm format` (monorepo-wide)
- Docker images built via `apps/{app}/Dockerfile` during compose

### Testing & Validation
- `pnpm test` (runs test suite across workspaces; currently sparse—add tests per feature)
- Swagger/API docs automatically updated via `swagger-jsdoc` comments in route files

## Project-Specific Patterns

### Cryptographic Audit Chain (Non-Negotiable)
TALA implements SHA-256 hash chain for RR 9-2009 compliance. Every data modification must:

1. Call `AuditLogger.log(payload)` from `@tala/audit`
2. Pass: `tenantId`, `userId`, `entityType`, `entityId`, `action`, `description`, `changesBefore`, `changesAfter`
3. **Never hard-delete data**—use void patterns (mark as inactive with timestamp)

**Example:** 
```typescript
import AuditLogger from '@tala/audit';

await AuditLogger.log({
  tenantId: req.tenant.id,
  userId: req.user.id,
  entityType: 'JournalEntry',
  entityId: entryId,
  action: 'Posted',
  description: 'Entry posted to ledger',
  changesBefore: { status: 'Draft' },
  changesAfter: { status: 'Posted', postedAt: new Date() }
});
```

### Cache-Aside Pattern for Financial Reports
Expensive reports (Trial Balance, General Ledger) use Redis caching:

- `CacheKeyBuilder.buildTrialBalanceKey(tenantId, period, filters)` generates tenant-prefixed key
- API route first checks cache; on miss, queries database and caches result
- Cache TTL typically 1 hour; invalidate on new journal entries for same tenant
- See `apps/api/src/routes/accounting-cached.ts` for pattern

### JWT & RBAC Middleware
`@tala/auth/TenantScope.ts` provides:

- `verifyJWT()` - Validates token, extracts tenant/user/permissions, attaches to `req.auth`, `req.tenant`, `req.user`
- `validatePermission(permission)` - Checks if user has specific permission (e.g., `can_post_ledger`)

**Usage:**
```typescript
import { verifyJWT, validatePermission } from '@tala/auth';

router.post('/ledger/post', verifyJWT, validatePermission('can_post_ledger'), (req, res) => {
  // req.tenant.id, req.user.id, req.auth.permissions available
});
```

### API Documentation via Swagger
All endpoints must have JSDoc comments with swagger tags. Express routes auto-generate OpenAPI spec:

```typescript
/**
 * @swagger
 * /api/accounting/trial-balance:
 *   get:
 *     summary: Get Trial Balance report
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trial Balance
 */
```

Routes mounted at `apps/api/src/routes/` and imported in `apps/api/src/index.ts`.

## Integration Points & External Dependencies

### PostgreSQL + Prisma
- Schema defined in `packages/database/prisma/schema.prisma`
- All queries use Prisma Client (imported via `@tala/database`)
- Migrations stored in `packages/database/prisma/migrations/`
- **Always filter by `tenantId` in WHERE clauses**

### Redis Connection
- Created via `redis` npm package in `@tala/cache`
- Environment: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Connection pooling handled by client; reuse singleton instance

### Docusaurus Documentation
- Deployed to `apps/docs/`
- Add technical docs to `apps/docs/docs/technical/`
- Rebuild: `pnpm docs:build` (if script exists)

## Common Pitfalls to Avoid

1. **Forgetting tenant scoping** → Cross-tenant data leaks. Every query must filter by `req.tenant.id`
2. **Missing audit logs** → Data changes won't be trackable or RR 9-2009 compliant
3. **Hard-deleting records** → Use soft deletes (update status to inactive)
4. **Ignoring cache invalidation** → Stale financial reports. Invalidate on data changes
5. **Not using Swagger comments** → API docs fall out of sync; makes debugging harder
6. **Assuming global state in Express middleware** → Each request is isolated; pass context via `req` augmentation

## Key File References

- **Monorepo config:** [pnpm-workspace.yaml](pnpm-workspace.yaml), [turbo.json](turbo.json)
- **API entry:** [apps/api/src/index.ts](apps/api/src/index.ts), [apps/api/src/routes/](apps/api/src/routes/)
- **Auth middleware:** [packages/auth/src/TenantScope.ts](packages/auth/src/TenantScope.ts)
- **Audit implementation:** [packages/audit/src/AuditLogger.ts](packages/audit/src/AuditLogger.ts)
- **Cache service:** [packages/cache/src/index.ts](packages/cache/src/index.ts)
- **Database schema:** [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)
- **API docs:** [apps/api/src/config/swagger.ts](apps/api/src/config/swagger.ts)
- **Docker setup:** [docker-compose.yml](docker-compose.yml)

---

**Last Updated:** January 15, 2026  
**Maintained By:** TALA Development Team
