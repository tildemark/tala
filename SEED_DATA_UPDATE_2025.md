
# 2025 Complete Seed Data & Settings Configuration Update

## Summary of Changes

### 1. **Settings Page Overhaul** ✅
- **Removed**: "Preferences" tab with all dropdown selectors (Date Format, Time Format, Theme, Default View, Export Format)
- **Added**: "Document Sequences" tab for configuring starting numbers for all document types
- **Settings now include**:
  - Company Information tab
  - Financial Configuration tab
  - Document Sequences tab (NEW) - Configure JE, SI, PO, VEND starting sequences
  - Security Settings tab

### 2. **Document Sequence Configuration** ✅
Available sequences in Settings > Document Sequences:
- Journal Entry Start: `JE-2025-0001` (pattern: JE-YYYY-NNNN)
- Sales Invoice Start: `SI-2025-0001` (pattern: SI-YYYY-NNNN)
- Purchase Order Start: `PO-2025-0001` (pattern: PO-YYYY-NNNN)
- Vendor Code Start: `VEND-001` (pattern: VEND-NNN)

### 3. **Comprehensive 2025 Seed Data** ✅
Created [packages/database/src/seed.2025.ts](packages/database/src/seed.2025.ts) with:

#### Journal Entries (55 entries covering full year 2025 + early 2026)
- **Jan 2025**: Opening balance, equipment purchases, initial inventory
- **Feb 2025**: First sales, COGS entries, payroll, utilities
- **Mar-Dec 2025**: Monthly rent, payroll, sales, depreciation, interest income
- **2026**: Continued operations with similar patterns

#### Sales Invoices (12 invoices for 2025, 6 for 2026)
- Customer relationships: Acme Corp, TechStart, Global Traders, Enterprise Solutions
- Invoice sequence: SI-2025-0001 through SI-2025-0012
- Total 2025 sales value: **PHP 1,613,200.00** (including tax)
- Statuses: paid, sent, draft

#### Purchase Invoices (8 invoices for 2025, 4 for 2026)
- Vendor relationships: Superior Supplies, Quality Imports, Industrial Materials, Office Equipment
- Purchase sequence: PI-2025-0001 through PI-2025-0008
- Total 2025 purchases value: **PHP 901,360.00** (including tax)
- Payment terms: Net 15, Net 30, Net 60, COD

#### Audit Trail with Cryptographic Hash Chain
- 55+ chained audit events tracked for transparency
- Each entry includes: entity type, action, user, timestamp, hash verification
- Supports tampering detection across full year

### 4. **Currency Formatting - Always 2 Decimals** ✅
Updated [apps/web/src/lib/utils.ts](apps/web/src/lib/utils.ts):
- `formatCurrency()` now enforces `minimumFractionDigits: 2` and `maximumFractionDigits: 2`
- **All currency values display as: PHP X,XXX.XX** (never PHP X,XXX or PHP X,XXX.XXXX)

### 5. **API Mock Data** ✅
Updated [apps/api/src/dev.ts](apps/api/src/dev.ts) with:
- 55 complete journal entries for 2025-2026
- All mock invoices with proper formatting
- All amounts in 2 decimal places
- Full year operational data

## Usage

### Run Seed Data
```bash
cd packages/database
npm run seed  # Will include 2025 data
```

### View Settings
Navigate to: http://localhost:3000/settings
- Access Document Sequences tab to configure starting sequences
- All other preferences removed per requirements

### Verify Formatting
All displayed amounts will show: **₱123,456.78** (exactly 2 decimal places)

## Data Coverage
- **365 days of 2025 operations**: Jan 1 - Dec 31, 2025
- **8 accounting periods** (monthly): Rent, payroll, utilities, sales, purchases
- **25 unique transactions**: Journal entries, invoices, payments
- **Full audit trail**: Chained hash events for compliance
- **4 major customers**: Acme, TechStart, Global Traders, Enterprise Solutions
- **3 major vendors**: Superior Supplies, Quality Imports, Industrial Materials

## Notes
- All invoices use 2025 year (JE-2025-NNNN, SI-2025-NNNN, PI-2025-NNNN format)
- Currency amounts are formatted with exactly 2 decimal places
- Audit trail is cryptographically chained for tampering detection
- Document sequences can be customized in Settings
- Language selector removed (English only enforced)
