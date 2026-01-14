# TALA Setup Troubleshooting & Quick Start Guide

**Status**: Project structure created, ready for local development setup (API/Web/Docs)

## ✅ What's Been Delivered

- Complete monorepo structure (apps/, packages/, config/)
- Prisma schema (18 tables)
- Security middleware & utilities
- Example API routes
- React components
- Comprehensive documentation
- Configuration files

## 🔧 Setup Instructions

### Step 1: Ensure Prerequisites

```powershell
# Verify Node.js is installed (v18+ required)
node --version
# Output: v24.12.0 ✓

# Verify npm is available
npm --version
```

### Step 2: Install pnpm (Already Done)

```powershell
# pnpm v8.0.0 is now installed globally
pnpm --version
# Output: 8.0.0 ✓
```

### Step 3: Install Dependencies

**✅ RESOLVED**: npm install now complete! (docs workspace now included)

```powershell
cd c:\code\tala
npm install
```

**Status**: All workspaces install successfully (api, web, database, audit, auth, shared, cache, docs)
- @tala/api (Express backend) ✓
- @tala/web (Next.js frontend) ✓
- @tala/database (Prisma) ✓
- @tala/audit (Audit logger) ✓
- @tala/auth (RBAC middleware) ✓
- @tala/shared (Utilities) ✓

**What was fixed**:
- Upgraded pnpm to latest (pnpm v8 had Node v24 compatibility issues)
- Fixed package versions: jsonwebtoken 9.0.3, Prisma 5.8.0, Next.js 14.1.0
- Used npm instead of pnpm for more reliable monorepo support
- Cleared node_modules and cache to resolve file lock issues

### Step 4: Setup PostgreSQL Database

You need a PostgreSQL database. Options:

**Option A: Docker Compose (Recommended)**
```powershell
# Complete containerized environment with DB, API, Web, and pgAdmin
# See DOCKER_GUIDE.md for full instructions
docker compose up -d
```

**Option B: Local PostgreSQL**
```powershell
# Download from: https://www.postgresql.org/download/windows/
# Or use: choco install postgresql
# Create database: createdb tala_dev
```

**Option C: Single Docker Container**
```powershell
docker run --name tala-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_DB=tala_dev `
  -p 5432:5432 `
  -d postgres:15
```

**Option D: Cloud Database**
- AWS RDS PostgreSQL
- DigitalOcean Managed Database
- Railway.app PostgreSQL
- Neon (Serverless PostgreSQL)

### Step 5: Configure Environment

```powershell
# Copy template
cp .env.example .env

# Edit .env with your database credentials
# Example:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/tala_dev"
# JWT_SECRET="your-strong-secret-key-change-in-production"
# ENCRYPTION_KEY="your-32-character-encryption-key-minimum"
```

### Step 6: Initialize Database

```powershell
# If using Prisma (recommended)
pnpm exec prisma db push
pnpm exec prisma db seed

# Or with npm
npx prisma db push
npx prisma db seed
```

### Step 7: Start Development Servers

```powershell
# Terminal 1: Start API
cd apps/api
npm run dev
# Server running on http://localhost:3001

# Terminal 2: Start Web
cd apps/web
npm run dev
# App running on http://localhost:3000

# Terminal 3: Start Docs (Docusaurus)
cd apps/docs
npm run start
# Docs running on http://localhost:3002
```

---

## 📋 File Structure Reference

```
c:\code\tala\
├── apps/
│   ├── api/           ← Express backend
│   ├── web/           ← Next.js frontend
│   └── docs/          ← Docusaurus Docs-as-Code (BIR + technical)
├── packages/
│   ├── database/      ← Prisma schema
│   ├── audit/         ← Audit logger
│   ├── auth/          ← Middleware
│   └── shared/        ← Utilities
├── config/
│   └── tailwind.config.js
├── package.json       ← Root config
├── pnpm-workspace.yaml ← Workspace config
├── tsconfig.json
├── .env.example
└── apps/docs/docs/    ← All documentation moved into Docusaurus
```

---

## 🔐 Environment Variables Template

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tala_dev"

# JWT & Security
JWT_SECRET="change-this-to-a-strong-random-string"
JWT_EXPIRY="24h"
ENCRYPTION_KEY="use-a-32-character-key-minimum-!!!"

# API
API_PORT=3001
API_NODE_ENV="development"
API_CORS_ORIGIN="http://localhost:3000"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## 🚀 Quick Commands

```powershell
# Development
pnpm dev                    # Start all servers
pnpm build                  # Build all packages
pnpm format                 # Format code

# Database
pnpm db:push               # Apply schema changes
pnpm db:seed               # Seed default data
pnpm db:studio             # Open Prisma Studio UI

# Individual packages
cd apps/api && npm run dev
cd apps/web && npm run dev
cd packages/database && npm run migrate
```

---

## ✨ First Steps After Setup

1. **Review Documentation**
   - Read [README.md](README.md)
   - Review [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

2. **Test Audit Chain**
   ```powershell
   # In your API server console, test:
   POST /api/journal-entries
   {
     "journalNumber": "JE-2024-001",
     "description": "Test",
     "entryDate": "2024-01-15",
     "companyId": "...",
     "details": [
       { "chartOfAccountId": "...", "debit": 100 },
       { "chartOfAccountId": "...", "credit": 100 }
     ]
   }
   
   # Then retrieve audit:
   GET /api/audit-logs?entityType=JournalEntry&entityId=xxx
   ```

3. **Explore Prisma Studio**
   ```powershell
   cd packages/database
   pnpm exec prisma studio
   # Opens http://localhost:5555 - visual database explorer
   ```

4. **Test Data Masking**
   - Create vendors with TIN & bank account
   - Login as Clerk (no 'view_sensitive_data' permission)
   - Verify TIN/account are masked

5. **Verify RBAC**
   - Test each role's permissions
   - Verify denied access returns 403
   - Check audit logs for failed attempts

---

## 🆘 Troubleshooting

### Issue: pnpm ERR_INVALID_THIS
**Solution**: This is an npm registry connectivity issue
```powershell
# Try clearing cache
pnpm store prune

# Use public registry
pnpm config set registry https://registry.npmjs.org/

# Or use npm directly instead
npm install
```

### Issue: Database connection fails
**Solution**: Check PostgreSQL is running
```powershell
# Check service status
Get-Service | Where-Object {$_.Name -like '*postgres*'}

# Or test connection
psql -U postgres -d tala_dev -c "SELECT 1"
```

### Issue: Port 3001 already in use
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 3001

# Kill process (replace PID)
Stop-Process -Id <PID> -Force
```

### Issue: Prisma client not found
```powershell
# Regenerate Prisma client
pnpm exec prisma generate
```

---

## 📞 Support Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com
- **Next.js**: https://nextjs.org/docs
- **pnpm**: https://pnpm.io
- **PostgreSQL**: https://www.postgresql.org/docs

---

## ✅ Verification Checklist

- [ ] Node.js v18+ installed
- [ ] pnpm v8 installed
- [ ] PostgreSQL database created
- [ ] `.env` file configured
- [ ] `pnpm install` completed
- [ ] `pnpm db:push` executed
- [ ] `pnpm db:seed` executed
- [ ] `pnpm dev` started successfully
- [ ] API accessible on http://localhost:3001
- [ ] Web accessible on http://localhost:3000

---

**Next**: Run `pnpm install` or `npm install` and follow database setup steps above.

**Status**: ✅ Ready for development environment setup
