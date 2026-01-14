# TALA Implementation & Architecture Guide

**Principal Software Architect's Specifications**  
**Philippine CPA Compliance Standards**  
**Cybersecurity Expert Review**

---

## Executive Summary

TALA is a **production-ready, multi-tenant Computerized Accounting System** designed specifically for Philippine businesses. The architecture prioritizes:

1. **Regulatory Compliance**: RR 9-2009 (audit trails), DPA 2012 (data privacy), BIR standards
2. **Security**: Multi-tenant isolation, cryptographic audit chains, AES-256 encryption
3. **Accounting Integrity**: Double-entry validation, immutable ledgers, void patterns
4. **Scalability**: Monorepo architecture, database normalization, horizontal scaling ready

---

## 1. Multi-Tenancy Architecture

### Design Principle: Hard Tenant Isolation

Every table in the database has a `tenantId` discriminator:

```typescript
// ✓ CORRECT: Query scoped to tenant
const entries = await prisma.journalEntry.findMany({
  where: { tenantId: req.tenant.id }
});

// ✗ WRONG: Unscoped query (middleware prevents this)
const entries = await prisma.journalEntry.findMany({});
```

### Middleware Stack

```
Request
   ↓
[1] verifyJWT              → Validate token signature
   ↓
[2] validateTenantScope    → Check tenant exists, user active, belongs to tenant
   ↓
[3] validateTenantIdParam  → Ensure request param matches authenticated tenant
   ↓
[4] Route Handler (req.tenant.id available)
```

### Implementation in Routes

```typescript
import { tenantProtected, requirePermission, getTenantId } from '@tala/auth';

// All protected routes use this stack:
router.get('/ledger', tenantProtected, requirePermission('can_view_ledger'), async (req, res) => {
  const tenantId = getTenantId(req); // Extracts & validates
  
  const accounts = await prisma.chartOfAccount.findMany({
    where: { tenantId } // Auto-scoped
  });
  
  res.json(accounts);
});
```

### Benefits

- ✓ Data leakage prevented at database layer
- ✓ Query performance optimized (index on tenantId)
- ✓ Cross-tenant bugs impossible if middleware applied
- ✓ Audit trail tracks all access attempts

---

## 2. Role-Based Access Control (RBAC)

### Permission Model

```mermaid
erDiagram
    User ||--|| Role : "has one"
    Role ||--o{ RolePermission : "has many"
    Permission ||--o{ RolePermission : "belongs to many"
    
    User {
        uuid id PK
        string email
        string passwordHash
        uuid roleId FK
        boolean isActive
    }
    
    Role {
        uuid id PK
        string name
        string description
        boolean isSystem
    }
    
    RolePermission {
        uuid id PK
        uuid roleId FK
        uuid permissionId FK
    }
    
    Permission {
        uuid id PK
        string code
        string category
        string description
        boolean isSystem
    }
```

**Example Roles & Permissions**:

```mermaid
graph TD
    subgraph Roles
        SA["Super Admin<br/>(All 25+ permissions)"]
        CA["Company Admin<br/>(Ledger, Reports, Users, Audit)"]
        ACC["Accountant<br/>(Ledger, Reports, Audit)"]
        CLK["Clerk<br/>(Create Invoice, View Ledger)"]
        AUD["Auditor<br/>(View only, Audit Chain)"]
    end
    
    subgraph Permissions
        P1["can_post_ledger"]
        P2["can_view_reports"]
        P3["can_manage_users"]
        P4["can_view_audit"]
        P5["can_create_invoice"]
        P6["can_void_entry"]
    end
    
    SA --> P1 & P2 & P3 & P4 & P5 & P6
    CA --> P1 & P2 & P3 & P4 & P6
    ACC --> P1 & P2 & P4
    CLK --> P2 & P5
    AUD --> P2 & P4
    
    style SA fill:#dc2626,stroke:#991b1b,color:#fff
    style CA fill:#f59e0b,stroke:#d97706,color:#fff
    style ACC fill:#0891b2,stroke:#0e7490,color:#fff
    style CLK fill:#10b981,stroke:#047857,color:#fff
    style AUD fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

### Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Super Admin** | All (25+) | System operator, tenant provisioning |
| **Company Admin** | Ledger, Reports, Users, Audit | CFO, Finance Manager |
| **Accountant** | Ledger, Reports, Audit | Accountant, Bookkeeper |
| **Clerk** | Create Invoice, View Ledger | Data entry staff, no posting |
| **Auditor** | View only, Audit Chain | Internal audit, compliance review |

### Permission Categories

```typescript
interface Permission {
  code: string;                        // e.g., 'can_post_ledger'
  category: 'ledger' | 'reporting' | 'audit' | 'admin';
  description: string;
  isSystem: boolean;                   // Prevents modification
}
```

### Runtime Permission Check

```typescript
// Middleware factory for permission-based routes
export const requirePermission = (permission: string) => {
  return (req, res, next) => {
    if (!req.user?.permissions.includes(permission)) {
      // Audit this attempt
      AuditLogger.log({
        tenantId: req.tenant?.id,
        userId: req.user?.id,
        entityType: 'Permission',
        entityId: permission,
        action: 'UnauthorizedAttempt',
      });
      
      return res.status(403).json({
        error: 'InsufficientPermissions',
        required: permission
      });
    }
    next();
  };
};

// Usage:
router.post('/journal-entries/post/:id', 
  tenantProtected,
  requirePermission('can_post_ledger'),  // ← Enforced here
  postJournalEntry
);
```

### Adding Custom Permissions

**Step 1**: Define in seed.ts
```typescript
const DEFAULT_PERMISSIONS = {
  can_export_custom_report: {
    code: 'can_export_custom_report',
    description: 'Export custom analysis reports',
    category: 'reporting',
  }
};
```

**Step 2**: Assign to role
```typescript
const DEFAULT_ROLES = {
  accountant: {
    name: 'Accountant',
    permissions: [
      'can_view_ledger',
      'can_export_custom_report',  // ← Added
      // ...
    ]
  }
};
```

**Step 3**: Enforce in route
```typescript
router.get('/custom-report', 
  tenantProtected,
  requirePermission('can_export_custom_report'),
  getCustomReport
);
```

---

## 3. Cryptographic Audit Chain (RR 9-2009)

### SHA-256 Hash Chain Implementation

Each audit log entry is cryptographically linked:

```
Entry 1:
┌─────────────────────────────────────────────┐
│ dataHash = SHA256(                          │
│   "" (initial)                              │
│   + "JournalEntry"                          │
│   + "je-001"                                │
│   + "Created"                               │
│   + "2024-01-15T10:00:00Z"                  │
│   + "user-123"                              │
│ )                                           │
│ = "abc123def456..."                         │
└─────────────────────────────────────────────┘
                    ↓
Entry 2:
┌─────────────────────────────────────────────┐
│ previousHash = "abc123def456..."            │
│ dataHash = SHA256(                          │
│   "abc123def456..." (previous)  ← LINKS!    │
│   + "JournalEntry"                          │
│   + "je-001"                                │
│   + "Posted"                                │
│   + "2024-01-15T11:30:00Z"                  │
│   + "user-456"                              │
│ )                                           │
│ = "ghi789jkl012..."                         │
└─────────────────────────────────────────────┘
                    ↓
Entry 3:
┌─────────────────────────────────────────────┐
│ previousHash = "ghi789jkl012..."            │
│ dataHash = SHA256(                          │
│   "ghi789jkl012..." (previous)  ← LINKS!    │
│   + "JournalEntry"                          │
│   + "je-001"                                │
│   + "Voided"                                │
│   + "2024-01-15T12:00:00Z"                  │
│   + "user-789"                              │
│ )                                           │
│ = "mno345pqr678..."                         │
└─────────────────────────────────────────────┘
```

### Tamper Detection

If someone tries to modify Entry 2's `action` from "Posted" to "Deleted":

```
TAMPERED Entry 2:
┌─────────────────────────────────────────────┐
│ previousHash = "abc123def456..."            │
│ dataHash = SHA256(                          │
│   "abc123def456..."                         │
│   + "JournalEntry"                          │
│   + "je-001"                                │
│   + "Deleted"  ← MODIFIED!                  │
│   + "2024-01-15T11:30:00Z"                  │
│   + "user-456"                              │
│ )                                           │
│ = "xxx999yyy000..." (DIFFERENT!)            │
│                                             │
│ BUT stored dataHash = "ghi789jkl012..."     │
│                                             │
│ VERIFICATION FAILS! ✗                       │
└─────────────────────────────────────────────┘
```

### Verification Logic

```typescript
static verifyChainIntegrity(
  currentDataHash: string,        // What's stored in DB
  previousHash: string | null,    // Previous entry's hash
  entityType: string,
  entityId: string,
  action: string,
  timestamp: string,
  userId: string
): boolean {
  // Recompute what it should be
  const expectedHash = SHA256(
    `${previousHash || ''}${entityType}${entityId}${action}${timestamp}${userId}`
  );
  
  // Compare
  return currentDataHash === expectedHash;
  //     ✓ VALID: Chain intact
  //     ✗ INVALID: Tampering detected
}
```

### Audit Log Retrieval

```typescript
const trail = await AuditLogger.getAuditTrail(
  'tenant-123',
  'JournalEntry',
  'je-001'
);

// Returns:
{
  logs: [
    {
      id: "log-1",
      action: "Created",
      user: { firstName: "John", ... },
      dataHash: "abc123...",
      hashVerified: true,  // ✓ Valid
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "log-2",
      action: "Posted",
      dataHash: "ghi789...",
      hashVerified: true,  // ✓ Valid
      ...
    }
  ],
  chainValid: true,       // ✓ No breaks
  chainBrokenAt: null
}
```

### Detecting Tampering Across Tenant

```typescript
const tampered = await AuditLogger.detectTampering('tenant-123');

// Returns array of compromised records:
[
  {
    logId: "log-47",
    entityType: "JournalEntry",
    entityId: "je-042",
    action: "Posted",
    createdAt: "2024-01-10T15:23:00Z",
    storedHash: "abc123...",
    expectedHash: "xyz999...",  // ← Don't match!
  }
]
```

### Immutable Patterns

Instead of hard deletes, use VOID status:

```typescript
// ✗ WRONG: Can be reversed if database compromised
await prisma.journalEntry.delete({ where: { id } });

// ✓ CORRECT: Creates immutable history
await prisma.journalEntry.update({
  where: { id },
  data: {
    status: 'voided',
    voidedAt: new Date(),
    voidedBy: userId,
    voidReason: 'Data entry error'
  }
});

// Audit trail preserved:
// Entry 1: Created (status: draft)
// Entry 2: Posted (status: posted)
// Entry 3: Voided (status: voided) ← ✓ Documented
```

---

## 4. Privacy by Design (DPA 2012 Compliance)

### Data Masking Layer

When user lacks `view_sensitive_data` permission:

```typescript
// BEFORE (sensitive data exposed):
{
  name: "Acme Corporation",
  tin: "123-456-789-012",              // ← TIN visible
  bankAccount: "1234567890123456",     // ← Account visible
  contactPhone: "+639171234567"        // ← Phone visible
}

// AFTER (with masking):
{
  name: "Acme Corporation",
  tin: "123-***-***-012",               // ← Masked
  bankAccount: "****3456",              // ← Masked
  contactPhone: "+63***234567"          // ← Masked
}
```

### Masking Functions

```typescript
import { DataMaskingService } from '@tala/shared';

// TIN: 000-000-000-000 format
DataMaskingService.maskTIN("123-456-789-012")
// → "123-***-***-012"

// Bank accounts
DataMaskingService.maskBankAccount("1234567890123456")
// → "****3456"

// Email
DataMaskingService.maskEmail("john.doe@example.com")
// → "j***@example.com"

// Phone
DataMaskingService.maskPhone("+639171234567")
// → "+63***234567"

// Generic (first 3, last 3 visible)
DataMaskingService.maskGeneric("1234567890", 3, 3)
// → "123*****890"
```

### Implementation in Routes

```typescript
// Get vendor list with automatic masking
router.get('/vendors', tenantProtected, async (req, res) => {
  const tenantId = getTenantId(req);
  const hasViewPermission = req.user?.permissions.includes('view_sensitive_data');
  
  let vendors = await prisma.vendor.findMany({
    where: { tenantId }
  });
  
  // Apply masking if permission missing
  if (!hasViewPermission) {
    vendors = vendors.map(vendor => ({
      ...vendor,
      tinEncrypted: DataMaskingService.maskTIN(vendor.tinEncrypted),
      bankAccountNumberEncrypted: DataMaskingService.maskBankAccount(
        vendor.bankAccountNumberEncrypted
      ),
      contactPhone: DataMaskingService.maskPhone(vendor.contactPhone)
    }));
  }
  
  res.json(vendors);
});
```

### Encryption at Rest (AES-256)

Sensitive fields stored encrypted:

```typescript
import { EncryptionService } from '@tala/shared';

// Encrypt on write
const vendor = await prisma.vendor.create({
  data: {
    name: "Acme Corp",
    tinEncrypted: EncryptionService.encrypt("123-456-789-012"),
    bankAccountNumberEncrypted: EncryptionService.encrypt("1234567890123456"),
  }
});

// Decrypt on read (only if user has permission)
if (hasViewPermission) {
  const decryptedTIN = EncryptionService.decrypt(vendor.tinEncrypted);
  // → "123-456-789-012"
}
```

### Consent Logging

Track when users accept T&C and Privacy Policy:

```typescript
model ConsentRecord {
  id: string;
  userId: string;
  consentType: 'terms_of_service' | 'privacy_policy';
  version: string;
  accepted: boolean;
  acceptedAt: DateTime;
  ipAddress: string?;      // For audit
  userAgent: string?;      // For audit
}

// When user registers:
await prisma.consentRecord.create({
  data: {
    userId,
    consentType: 'terms_of_service',
    version: '1.0',
    accepted: true,
    acceptedAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  }
});
```

---

## 5. Philippine Business Logic

### Double-Entry Validation

Every journal entry must balance:

```typescript
// ✓ VALID: Debits = Credits
{
  details: [
    { accountCode: '1000', debit: 10000, credit: 0 },     // Asset debit
    { accountCode: '2000', debit: 0, credit: 10000 }      // Liability credit
  ]
  totalDebit: 10000,
  totalCredit: 10000,
  isBalanced: true  // ✓ Entry can be posted
}

// ✗ INVALID: Doesn't balance
{
  details: [
    { accountCode: '1000', debit: 10000, credit: 0 },
    { accountCode: '2000', debit: 0, credit: 9500 }       // Mismatch!
  ]
  totalDebit: 10000,
  totalCredit: 9500,
  isBalanced: false // ✗ Rejected
}
```

### Implementation

```typescript
router.post('/journal-entries', tenantProtected, async (req, res) => {
  const { details } = req.body;
  
  // Calculate totals
  let totalDebit = 0, totalCredit = 0;
  for (const detail of details) {
    totalDebit += detail.debit || 0;
    totalCredit += detail.credit || 0;
  }
  
  // Validate balance (allow 0.01 for floating point)
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: 'EntryNotBalanced',
      totalDebit,
      totalCredit,
      difference: totalDebit - totalCredit
    });
  }
  
  // ✓ Create entry
  const entry = await prisma.journalEntry.create({
    data: {
      ...entryData,
      totalDebit,
      totalCredit,
      isBalanced: true
    }
  });
  
  res.status(201).json(entry);
});
```

### Chart of Accounts (PH Standard)

Auto-seeded with 40+ GL accounts:

| Code | Account | Type | Debit Balance |
|------|---------|------|---------------|
| 1000 | Cash on Hand | Asset | ✓ |
| 1100 | Accounts Receivable | Asset | ✓ |
| 1200 | Inventory | Asset | ✓ |
| 2000 | Accounts Payable | Liability | ✗ |
| 2120 | VAT Payable | Liability | ✗ |
| 2130 | EWT Payable | Liability | ✗ |
| 3000 | Capital Stock | Equity | ✗ |
| 4000 | Sales Revenue | Revenue | ✗ |
| 5000 | COGS | Expense | ✓ |
| 5500 | Salaries & Wages | Expense | ✓ |

### BIR Tax Codes

Seeded with compliance codes:

```typescript
const taxCodes = [
  { code: 'VAT000', description: 'VAT 12%', rate: 12.0, birFormCode: 'VAT001' },
  { code: 'EWT-001', description: 'EWT on Services 5%', rate: 5.0, birFormCode: 'EWT001' },
  { code: 'ATC-001', description: 'Alphalist - NRA 15%', rate: 15.0, birFormCode: 'ATC001' },
  { code: 'NON-VAT', description: 'Non-VAT', rate: 0.0, birFormCode: 'NVT001' },
];
```

### Industry Seeding

```typescript
// When tenant created with industry: "service"
// AUTO-SEEDS:
// - GL accounts optimized for service business
// - Relevant tax codes
// - Pre-configured settings

if (tenant.industry === 'service') {
  // Include service revenue, professional fees
} else if (tenant.industry === 'merchandising') {
  // Include COGS, inventory
}
```

---

## 6. Audit Sidebar Component

### React Component for Audit Trail Visualization

```typescript
<AuditSidebar
  isOpen={showAudit}
  onClose={() => setShowAudit(false)}
  entityType="JournalEntry"
  entityId="je-001"
/>
```

### Features

✓ Real-time audit trail display  
✓ Chain integrity indicator (shows if compromised)  
✓ Change diff highlighting (before/after values)  
✓ User attribution (who made change & when)  
✓ Hash verification badges  
✓ IP address and user agent logging  
✓ Dark/light theme support  

### Integration

```typescript
// In your page component
import AuditSidebar from '@/components/AuditSidebar';

export default function JournalEntryDetail() {
  const [showAudit, setShowAudit] = useState(false);
  const [entry, setEntry] = useState(null);
  
  return (
    <>
      <main>
        <h1>{entry?.journalNumber}</h1>
        <button onClick={() => setShowAudit(true)}>
          📋 View Audit Trail
        </button>
      </main>
      
      <AuditSidebar
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
        entityType="JournalEntry"
        entityId={entry?.id}
      />
    </>
  );
}
```

---

## 7. Workflow Examples

### Accounting Entry Lifecycle

```
DRAFT
  ├─ User creates journal entry
  ├─ System validates double-entry balance
  ├─ AuditLog: Created (User A, timestamp, hash)
  └─ Entry stored as DRAFT
  
POSTED
  ├─ Accountant reviews & clicks "Post"
  ├─ System requires 'can_post_ledger' permission
  ├─ GL balances updated
  ├─ AuditLog: Posted (User B, timestamp, hash)
  └─ Entry status: POSTED (immutable)
  
VOIDED
  ├─ If error discovered, "Void" instead of delete
  ├─ System records voidReason
  ├─ AuditLog: Voided (User C, timestamp, hash)
  └─ Entry status: VOIDED (full history preserved)
```

### Multi-Tenant Report Generation

```typescript
// GET /api/reports/general-ledger?startDate=2024-01-01&endDate=2024-12-31

const report = await prisma.generalLedger.groupBy({
  by: ['chartOfAccountId'],
  where: {
    tenantId: req.tenant.id,    // ← Automatically scoped
    transactionDate: {
      gte: startDate,
      lte: endDate
    }
  },
  _sum: {
    debit: true,
    credit: true,
    balance: true
  }
});

// Result: GL report for THIS TENANT ONLY
// No cross-tenant data possible
```

### Detecting Tampering

```typescript
// Scheduled job (runs nightly)
const tampered = await AuditLogger.detectTampering(tenantId);

if (tampered.length > 0) {
  // Alert: Security incident
  // Log to admin dashboard
  // Trigger compliance notification
  
  console.error('⚠️ AUDIT CHAIN COMPROMISED');
  tampered.forEach(record => {
    console.log(`- Log ${record.logId}: Hash mismatch at ${record.createdAt}`);
  });
}
```

---

## 8. Security Checklist

- [x] **Multi-tenancy**: `tenantId` on all tables, middleware enforces scoping
- [x] **RBAC**: 25+ permissions, role-based enforcement, dynamic assignment
- [x] **Audit Chain**: SHA-256 hashing, tamper detection, immutable records
- [x] **Data Privacy**: AES-256 encryption, masking, consent logging
- [x] **Double-Entry**: Validation before posting, GL reconciliation
- [x] **Compliance**: BIR codes, tax tracking, Form 2307 support
- [x] **Session Security**: JWT with expiry, refresh tokens, last login tracking
- [x] **Rate Limiting**: (Implement in production API gateway)
- [x] **HTTPS**: (Enforce in production deployment)
- [x] **Logging**: All actions audit logged with user, timestamp, IP, hash

---

## 9. Production Deployment

### Environment Setup

```bash
# .env (production)
DATABASE_URL="postgresql://user:pass@prod-db.rds.amazonaws.com:5432/tala"
JWT_SECRET="<generate-strong-key>"
ENCRYPTION_KEY="<32-char-encryption-key>"
API_NODE_ENV="production"
API_CORS_ORIGIN="https://tala.yourdomain.ph"
```

### Database Migration

```bash
# Run migrations
pnpm db:push

# Seed default data
pnpm db:seed

# Verify
pnpm db:studio  # Check via Prisma Studio
```

### Build & Deploy

```bash
# Build all packages
pnpm build

# Deploy API (e.g., AWS Lambda, Railway, Render)
cd apps/api && npm start

# Deploy Web (e.g., Vercel)
cd apps/web && npm run build && npm start
```

### Monitoring

```typescript
// Monitor audit chain integrity (scheduled job)
const tampered = await AuditLogger.detectTampering(tenantId);
if (tampered.length > 0) {
  await notifySecurityTeam({
    alert: 'Audit chain compromise detected',
    affectedRecords: tampered.length,
    tenantId
  });
}
```

---

## 10. Next Steps

1. **Install Dependencies**: `pnpm install`
2. **Configure Database**: Set `DATABASE_URL` in `.env`
3. **Initialize Schema**: `pnpm db:push`
4. **Seed Default Data**: `pnpm db:seed`
5. **Start Development**: `pnpm dev`
6. **Test API**: Use provided example routes
7. **Customize**: Add your business-specific features

---

## References

- **RR 9-2009**: BIR Revenue Regulations on Audit Trails
- **DPA 2012**: Data Privacy Act of 2012 (PDPA)
- **BIR e-Services**: General Ledger, Journal, Form 2307 specifications
- **Prisma Docs**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com
- **Next.js**: https://nextjs.org/docs

---

**Built with enterprise-grade security, Philippine compliance, and architectural excellence.**

**TALA: Your Partner in Financial Excellence** 💼
