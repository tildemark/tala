# TALA - Tax and Ledger Assistant

A **multi-tenant, enterprise-grade Computerized Accounting System (CAS)** engineered for Philippine business architecture and regulatory compliance (BIR, CPA, DPA 2012).

## 📋 Table of Contents

- [Architecture](#architecture)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Database Schema Overview](#database-schema-overview)
- [Security & Compliance](#security--compliance)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)

---

## 🏗️ Architecture

TALA is built as a **monorepo** using modern cloud-native patterns:

```
┌─────────────────────────────────────────────┐
│   Next.js Frontend (React + Tailwind)        │
│   - Multi-tenant interface                   │
│   - Real-time audit trail visualization     │
│   - Dark/Light theme (Professional Design)  │
└─────────────────────────────────────────────┘
                      ↕ (API)
┌─────────────────────────────────────────────┐
│   Express.js Backend (TypeScript)            │
│   - Multi-tenant middleware                  │
│   - JWT + RBAC                               │
│   - Audit chain generation                   │
└─────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────┐
│   PostgreSQL + Prisma ORM                    │
│   - Tenant-scoped queries                    │
│   - Cryptographic audit logs                 │
│   - Double-entry ledger                      │
└─────────────────────────────────────────────┘
```

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS 3.4, TypeScript
- **Backend**: Express.js, TypeScript, Node.js 18+
- **Database**: PostgreSQL 14+, Prisma ORM 5.x
- **Security**: JWT, AES-256 Encryption, SHA-256 Hash Chain, RBAC
- **Package Manager**: pnpm 8.x (workspaces)
- **Build Tool**: Turbo (monorepo orchestration)

---

## ✨ Core Features

### 1. **Multi-Tenancy with Strict Data Isolation**
- `tenantId` discriminator on all tables
- Middleware enforces tenant scoping on every query
- Cross-tenant access attempts logged and blocked

### 2. **Granular RBAC (Role-Based Access Control)**
- **Default Roles**: Super Admin, Company Admin, Accountant, Clerk, Auditor
- **Permission System**: 25+ granular permissions (e.g., `can_post_ledger`, `view_sensitive_data`)
- **Dynamic role assignment** per tenant

### 3. **Audit & Integrity (RR 9-2009 Compliant)**
- **Cryptographic Audit Chain**: SHA-256 hash linking every entry
- **Tamper Detection**: Automatic chain validation
- **Immutable Trail**: Void patterns, no hard deletes
- **Audit Sidebar**: Frontend component displaying change history with diffs

### 4. **Privacy by Design (DPA 2012 Compliant)**
- **Data Masking Layer**: TINs, bank accounts, phone numbers masked based on permissions
- **Encryption at Rest**: AES-256 for sensitive fields
- **Consent Logging**: T&C and Privacy Policy acceptance tracking

### 5. **Philippine Business Logic**
- **Double-Entry Validation**: Automatic debit/credit reconciliation
- **Automated Chart of Accounts**: Industry-specific seeding (Service/Merchandising)
- **BIR Tax Codes**: VAT, EWT, ATC pre-configured
- **Mandatory Reports**: General Ledger, Journal, SLS/SLP, Form 2307

### 6. **Accounting Features**
- Journal entry management with draft → posted → voided workflow
- Sales & Purchase invoice tracking
- General ledger with running balances
- Tax code linking for Form 2307
- Bank account reconciliation support

---

## 📁 Project Structure

```
tala/
├── apps/
│   ├── api/                          # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/               # API endpoints
│   │   │   ├── controllers/          # Business logic
│   │   │   ├── services/             # Domain services
│   │   │   ├── middleware/           # Express middleware
│   │   │   └── index.ts              # Server entry
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   ├── components/           # React components
│       │   │   ├── audit-sidebar/    # Audit trail visualization
│       │   │   ├── ledger/           # Accounting tables
│       │   │   └── forms/            # Data entry forms
│       │   ├── hooks/                # Custom React hooks
│       │   ├── lib/                  # Utilities
│       │   └── styles/               # Global styles
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                     # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Full data model
│   │   │   └── migrations/           # DB migrations
│   │   └── src/
│   │       └── seed.ts               # Seeding logic
│   │
│   ├── audit/                        # Cryptographic audit logger
│   │   └── src/
│   │       └── AuditLogger.ts        # SHA-256 hash chain
│   │
│   ├── auth/                         # Authentication middleware
│   │   └── src/
│   │       └── TenantScope.ts        # JWT + tenant validation
│   │
│   └── shared/                       # Shared utilities
│       └── src/
│           ├── security.ts           # Encryption & data masking
│           ├── types.ts              # Shared TypeScript types
│           └── constants.ts          # App-wide constants
│
├── config/
│   └── tailwind.config.js            # Professional TALA theme
│
├── .env.example                      # Environment template
├── package.json                      # Root monorepo config
├── tsconfig.json                     # Root TypeScript config
├── .prettierrc                       # Code formatting
└── README.md                         # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ (check with `node --version`)
- PostgreSQL 14+ running locally or remotely
- pnpm 8.x (`npm install -g pnpm`)

### 1. Clone & Install Dependencies

```bash
cd c:\code\tala

# Install root dependencies
pnpm install

# Generate Prisma client
pnpm db:generate
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your local database credentials
# Example:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/tala_dev"
# JWT_SECRET="your-super-secret-key-change-in-production"
# ENCRYPTION_KEY="your-aes-256-key-32-chars-minimum"
```

### 3. Initialize Database

```bash
# Run migrations
pnpm db:push

# (Optional) Seed default data
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start both API and web in parallel
pnpm dev

# Or separately:
cd apps/api && pnpm dev        # API on http://localhost:3001
cd apps/web && pnpm dev        # Web on http://localhost:3000
```

---

## 🗄️ Database Schema Overview

### Core Entities

#### **Tenant** (Multi-tenancy Root)
- Represents a company using TALA
- Fields: `id`, `name`, `slug`, `industry`, `timezone`, `registrationNumber`
- All tables have `tenantId` foreign key

#### **User & RBAC**
```
Tenant
  ├── User (email, passwordHash, isActive, lastLoginAt)
  ├── Role (name, isSystem, isDefault)
  ├── Permission (code, category, isSystem)
  └── RolePermission (junction: roleId ↔ permissionId)
```

#### **Audit Trail**
```
AuditLog
  ├── tenantId, userId, entityType, entityId, action
  ├── changesBefore (JSON), changesAfter (JSON)
  ├── previousHash (SHA-256 of last log)
  ├── dataHash (SHA-256 of current entry)
  ├── hashVerified (integrity check)
  └── createdAt, ipAddress, userAgent
```

#### **Accounting Ledger**
```
ChartOfAccount (GL accounts: Assets, Liabilities, Equity, Revenue, Expense)
  ├── accountCode, accountName, accountType, debitBalance
  
JournalEntry (Header: draft → posted → voided)
  ├── journalNumber, referenceNumber, description
  ├── status, totalDebit, totalCredit, isBalanced
  ├── entryDate, postingDate, postedBy, approvedBy
  └── JournalDetail[] (individual line items)
    ├── chartOfAccountId, debit, credit
    └── taxCodeId (for tax tracking)

GeneralLedger (Running balance per GL account)
  ├── chartOfAccountId, journalNumber
  ├── debit, credit, balance, transactionDate
```

#### **Transactions**
```
SalesInvoice
  ├── invoiceNumber, invoiceDate, dueDate
  ├── customerName, customerTIN
  └── subtotal, vatAmount, totalAmount, status

PurchaseInvoice
  ├── invoiceNumber, vendorInvoiceNumber
  ├── vendorId (FK), companyId (FK)
  └── subtotal, ewtAmount, vatAmount, totalAmount, status

Vendor
  ├── name, vendorType, tinEncrypted (AES-256), taxStatus
  ├── address, bankAccountNumberEncrypted
```

#### **Compliance**
```
TaxCode (BIR codes: VAT, EWT, ATC, Non-VAT)
Form2307 (Quarterly withholding tax report)
BankAccount (Encrypted account details)
ConsentRecord (T&C, Privacy Policy acceptance)
```

---

## 🔒 Security & Compliance

### 1. **Multi-Tenancy Isolation**

**Middleware: TenantScope.ts**
```typescript
// Every protected route must use:
router.get('/ledger', verifyJWT, validateTenantScope, getLedger);

// Enforces:
// ✓ JWT valid & not expired
// ✓ User active & belongs to tenant
// ✓ All queries filtered by tenantId
// ✗ Blocks cross-tenant access attempts
```

### 2. **Cryptographic Audit Chain (RR 9-2009)**

**AuditLogger.ts** implements:
```
dataHash[n] = SHA-256(previousHash[n-1] + entityType + entityId + action + timestamp + userId)
```

If any record is tampered with:
- Its `dataHash` will be invalid
- The chain breaks at that point
- `AuditLogger.detectTampering()` identifies compromised records

### 3. **Data Masking (DPA 2012)**

**DataMaskingService.ts** provides:
```typescript
// Automatic masking if user lacks 'view_sensitive_data' permission
TIN:            "123-456-789-012" → "123-***-***-012"
Bank Account:   "1234567890123456" → "****3456"
Email:          "john.doe@ph.com" → "j***@ph.com"
Phone:          "+639171234567" → "+63***234567"
```

### 4. **Encryption at Rest (AES-256)**

Sensitive fields encrypted in database:
- `Vendor.tinEncrypted`
- `Vendor.bankAccountNumberEncrypted`
- `Company.tinEncrypted`
- `Company.bankAccountNumberEncrypted`
- `BankAccount.accountNumberEncrypted`

### 5. **RBAC Permission Model**

```
// Example: Accountant can post ledger, Clerk cannot
if (!req.user.permissions.includes('can_post_ledger')) {
  return res.status(403).json({ error: 'InsufficientPermissions' });
}

// Unauthorized attempts logged to AuditLog
```

---

## 📡 API Documentation

### Authentication

**POST /auth/register** - Create new tenant & super admin
```json
{
  "tenantName": "ABC Corporation",
  "industry": "service",
  "email": "admin@abc-corp.ph",
  "password": "securePassword123"
}
```

**POST /auth/login** - Get JWT token
```json
{
  "email": "admin@abc-corp.ph",
  "password": "securePassword123"
}
Response: { accessToken, refreshToken, user }
```

**POST /auth/refresh** - Refresh expired JWT
```json
{ "refreshToken": "..." }
```

---

### Ledger Management

**GET /api/ledger** - List GL accounts (paginated)
```
Query: ?tenantId=xxx&limit=50&offset=0
Response: { data: ChartOfAccount[], total, page }
```

**POST /api/journal-entries** - Create new journal entry
```json
{
  "journalNumber": "JE-2024-001",
  "description": "Monthly rent payment",
  "entryDate": "2024-01-15",
  "details": [
    { "chartOfAccountId": "1000", "debit": 10000 },
    { "chartOfAccountId": "2000", "credit": 10000 }
  ]
}
```

**POST /api/journal-entries/:id/post** - Post entry (requires `can_post_ledger`)
```json
{}
Response: { status: "posted", postingDate }
```

**POST /api/journal-entries/:id/void** - Void entry (requires `can_void_ledger`)
```json
{ "voidReason": "Data entry error" }
Response: { status: "voided", voidedAt }
```

---

### Audit Trail

**GET /api/audit-logs?entityType=JournalEntry&entityId=xxx** - Audit trail for entity
```
Response: {
  logs: [
    {
      user: { firstName, lastName, email },
      action: "Posted",
      changesBefore: { status: "draft" },
      changesAfter: { status: "posted" },
      createdAt,
      hashVerified: true,
      chainValid: true
    }
  ]
}
```

**GET /api/audit-logs/detect-tampering** - Scan for chain breaks (Super Admin only)
```
Response: {
  tampered: [
    {
      logId,
      entityType,
      storedHash,
      expectedHash,
      createdAt
    }
  ]
}
```

---

### Reports (BIR Compliance)

**GET /api/reports/general-ledger?startDate=2024-01-01&endDate=2024-12-31**
```
Response: {
  accounts: [
    {
      accountCode, accountName,
      openingBalance, debits, credits, closingBalance
    }
  ]
}
```

**GET /api/reports/form-2307?year=2024&quarter=1**
```
Response: {
  vendorTIN, vendorName,
  grossAmount, ewtAmount, ewtRate,
  status, submittedAt
}
```

---

## 🛠️ Development Guide

### Adding a New Permission

1. **Add to `DEFAULT_PERMISSIONS` in `packages/database/src/seed.ts`**:
   ```typescript
   can_export_custom_report: {
     code: 'can_export_custom_report',
     description: 'Export custom reports',
     category: 'reporting',
   }
   ```

2. **Assign to a role** in `DEFAULT_ROLES`
3. **Check in middleware**:
   ```typescript
   router.get('/custom-report', requirePermission('can_export_custom_report'), handler);
   ```

### Creating a New Audit Event

```typescript
import AuditLogger from '@tala/audit';

// When posting a journal entry:
await AuditLogger.log({
  tenantId: req.tenant.id,
  userId: req.user.id,
  entityType: 'JournalEntry',
  entityId: journalEntry.id,
  action: 'Posted',
  changesBefore: { status: 'draft' },
  changesAfter: { status: 'posted', postingDate: new Date() },
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

### Using Data Masking

```typescript
import { DataMaskingService } from '@tala/shared';

// Check if user has permission
if (!req.user.permissions.includes('view_sensitive_data')) {
  vendor.tinEncrypted = DataMaskingService.maskTIN(vendor.tinEncrypted);
  vendor.bankAccountNumberEncrypted = DataMaskingService.maskBankAccount(
    vendor.bankAccountNumberEncrypted
  );
}
```

### Running Database Migrations

```bash
# Create a new migration
pnpm exec prisma migrate dev --name add_new_field

# View migrations
ls packages/database/prisma/migrations/

# Reset database (dev only!)
pnpm exec prisma migrate reset
```

### Deploying to Production

1. **Build all packages**:
   ```bash
   pnpm build
   ```

2. **Set environment variables** in your hosting platform (AWS, Vercel, etc.)

3. **Run migrations**:
   ```bash
   pnpm db:push
   ```

4. **Deploy API** (`apps/api`) to your backend service
5. **Deploy frontend** (`apps/web`) to Vercel or similar

---

## 📚 Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Express.js Guide**: https://expressjs.com
- **Next.js App Router**: https://nextjs.org/docs/app
- **Tailwind CSS**: https://tailwindcss.com
- **BIR Resources**: https://www.bir.gov.ph

---

## 🤝 Contributing

When contributing to TALA:

1. Follow the folder structure conventions
2. Use TypeScript strictly (no `any`)
3. Add audit logging for sensitive operations
4. Test multi-tenant isolation
5. Document new API endpoints
6. Format code with `pnpm format`

---

## 📝 License

PROPRIETARY - TALA is proprietary software for Philippine business use.

---

**Built with ❤️ for Philippine businesses**  
Last updated: January 14, 2026
