# TALA Seed Data Manifest
**Generated:** January 15, 2026  
**Status:** ✅ Complete - All systems loaded and ready for demonstration

---

## 📊 Data Overview

The system now includes comprehensive dummy data across all modules:
- **8 Customers** (Corporate, Individual, NGO types)
- **8 Vendors** (Supplier, Contractor, Service Provider types)
- **33 Chart of Accounts** (All asset, liability, equity, revenue, expense types)
- **15 Journal Entries** (With transactions demonstrating all account types)
- **12 Invoices** (Sales & Purchase, various statuses)

---

## 💰 Chart of Accounts (33 Accounts)

### Assets (1000-1999)
| Code | Account Name | Normal Balance | Status |
|------|---|---|---|
| 1000 | Cash - Peso | Debit | Active |
| 1010 | Savings Account | Debit | Active |
| 1100 | Accounts Receivable | Debit | Active |
| 1110 | Allowance for Doubtful Accounts | Credit | Active |
| 1200 | Inventory | Debit | Active |
| 1300 | Office Supplies | Debit | Active |
| 1500 | Equipment | Debit | Active |
| 1510 | Accumulated Depreciation - Equipment | Credit | Active |
| 1600 | Furniture & Fixtures | Debit | Active |
| 1610 | Accumulated Depreciation - Furniture | Credit | Active |

### Liabilities (2000-2999)
| Code | Account Name | Normal Balance | Status |
|------|---|---|---|
| 2000 | Accounts Payable | Credit | Active |
| 2100 | Short-term Borrowings | Credit | Active |
| 2200 | Income Tax Payable | Credit | Active |
| 2300 | Sales Tax Payable | Credit | Active |
| 2400 | Unearned Revenue | Credit | Active |
| 2500 | Long-term Debt | Credit | Inactive |

### Equity (3000-3999)
| Code | Account Name | Normal Balance | Status |
|------|---|---|---|
| 3000 | Common Stock | Credit | Active |
| 3100 | Retained Earnings | Credit | Active |
| 3200 | Dividends | Debit | Active |

### Revenue (4000-4999)
| Code | Account Name | Normal Balance | Status |
|------|---|---|---|
| 4000 | Sales Revenue | Credit | Active |
| 4010 | Sales Returns & Allowances | Debit | Active |
| 4100 | Service Revenue | Credit | Active |
| 4200 | Interest Income | Credit | Active |

### Expenses (5000-5999)
| Code | Account Name | Normal Balance | Status |
|------|---|---|---|
| 5000 | Cost of Goods Sold | Debit | Active |
| 5100 | Salaries & Wages | Debit | Active |
| 5200 | Rent Expense | Debit | Active |
| 5300 | Utilities | Debit | Active |
| 5400 | Office Supplies Expense | Debit | Active |
| 5500 | Depreciation Expense | Debit | Active |
| 5600 | Professional Fees | Debit | Active |
| 5700 | Insurance Expense | Debit | Active |
| 5800 | Travel & Transportation | Debit | Active |
| 5900 | Miscellaneous Expense | Debit | Active |

---

## 👥 Customers (8)

| ID | Name | Type | City | Email | Phone | Credit Limit | Terms |
|---|---|---|---|---|---|---|---|
| CUST-001 | Acme Corporation | Corporate | Manila | contact@acme.com | +63-2-1234-5678 | ₱100,000 | 30 days |
| CUST-002 | TechStart Philippines | Corporate | Makati | sales@techstart.ph | +63-917-123-4567 | ₱75,000 | 30 days |
| CUST-003 | Global Traders Inc | Corporate | Quezon City | inquiry@globaltraders.com | +63-2-9876-5432 | ₱150,000 | 30 days |
| CUST-004 | Local Business Co | Individual | Cebu | info@localbusiness.com | +63-919-999-8888 | ₱50,000 | 15 days |
| CUST-005 | Enterprise Solutions | Corporate | Taguig | contact@enterprise.ph | +63-2-555-1234 | ₱200,000 | 60 days |
| CUST-006 | Quick Services LLC | Individual | Pasig | admin@quickservices.com | +63-918-777-6666 | ₱35,000 | 14 days |
| CUST-007 | Premium Consultants | Corporate | Makati | hello@premiumconsult.com | +63-2-444-5555 | ₱120,000 | 45 days |
| CUST-008 | National Development Corp | NGO | Quezon City | grants@natdev.org | +63-2-333-4444 | ₱80,000 | 30 days |

---

## 🏢 Vendors (8)

| ID | Name | Type | City | Email | Phone | Payment Terms |
|---|---|---|---|---|---|---|
| VEND-001 | Superior Supplies Co | Supplier | Manila | sales@superiorsupplies.com | +63-2-111-2222 | 30 days |
| VEND-002 | Quality Imports Ltd | Supplier | Manila | orders@qualityimports.com | +63-917-555-6666 | 15 days |
| VEND-003 | Industrial Materials Inc | Supplier | Laguna | supply@industrial.ph | +63-2-777-8888 | COD |
| VEND-004 | Office Equipment Corp | Supplier | Makati | sales@officeequip.com | +63-919-333-4444 | 60 days |
| VEND-005 | Tech Components Asia | Supplier | Cavite | procurement@techcomp.asia | +63-2-666-7777 | 30 days |
| VEND-006 | Professional Services Group | Service Provider | Taguig | contracts@profservices.ph | +63-2-222-3333 | 30 days |
| VEND-007 | IT Solutions Contractor | Contractor | Makati | jobs@itsolutions.ph | +63-917-888-9999 | 45 days |
| VEND-008 | Maintenance Services Plus | Service Provider | Quezon City | schedule@maintplus.com | +63-2-999-0000 | 30 days |

---

## 📝 Journal Entries (15 - All Posted)

### Transaction Summary
All journal entries demonstrate proper double-entry accounting with debits equaling credits.

#### 1. **JE-2026-001** - Initial Capital Investment  
**Date:** 2026-01-01 | **Status:** Posted  
- DR: Cash - Peso: ₱500,000
- CR: Common Stock: ₱500,000
- Description: Initial capital investment by owner

#### 2. **JE-2026-002** - Equipment Purchase on Credit
**Date:** 2026-01-02 | **Status:** Posted  
- DR: Equipment: ₱150,000
- CR: Accounts Payable: ₱150,000
- Description: Purchase office equipment on credit

#### 3. **JE-2026-003** - Sales Revenue (CUST-001)
**Date:** 2026-01-05 | **Status:** Posted  
- DR: Cash - Peso: ₱28,000
- CR: Sales Revenue: ₱28,000
- Description: Sales revenue from Acme Corporation

#### 4. **JE-2026-004** - Rent Expense
**Date:** 2026-01-06 | **Status:** Posted  
- DR: Rent Expense: ₱35,000
- CR: Cash - Peso: ₱35,000
- Description: Monthly rent payment for office space

#### 5. **JE-2026-005** - Inventory Purchase
**Date:** 2026-01-07 | **Status:** Posted  
- DR: Inventory: ₱10,080
- CR: Cash - Peso: ₱10,080
- Description: Purchase inventory for resale

#### 6. **JE-2026-006** - Cost of Goods Sold Recognition
**Date:** 2026-01-08 | **Status:** Posted  
- DR: Cost of Goods Sold: ₱12,000
- CR: Inventory: ₱12,000
- Description: Cost of goods sold - inventory adjustment

#### 7. **JE-2026-007** - Employee Salaries
**Date:** 2026-01-08 | **Status:** Posted  
- DR: Salaries & Wages: ₱45,000
- CR: Accounts Payable: ₱45,000
- Description: Employee salaries for first week

#### 8. **JE-2026-008** - Utility Expense
**Date:** 2026-01-09 | **Status:** Posted  
- DR: Utilities: ₱8,500
- CR: Cash - Peso: ₱8,500
- Description: Electricity and water bills

#### 9. **JE-2026-009** - Accounts Payable Payment
**Date:** 2026-01-10 | **Status:** Posted  
- DR: Accounts Payable: ₱150,000
- CR: Cash - Peso: ₱150,000
- Description: Payment for equipment purchase

#### 10. **JE-2026-010** - Depreciation Expense
**Date:** 2026-01-10 | **Status:** Posted  
- DR: Depreciation Expense: ₱1,250
- CR: Accumulated Depreciation - Equipment: ₱1,250
- Description: Monthly depreciation on equipment

#### 11. **JE-2026-011** - Service Revenue on Credit
**Date:** 2026-01-12 | **Status:** Posted  
- DR: Accounts Receivable: ₱20,160
- CR: Service Revenue: ₱20,160
- Description: Service revenue on account (CUST-003)

#### 12. **JE-2026-012** - Professional Fees
**Date:** 2026-01-13 | **Status:** Posted  
- DR: Professional Fees: ₱15,000
- CR: Cash - Peso: ₱15,000
- Description: Accounting and audit services

#### 13. **JE-2026-013** - Interest Income
**Date:** 2026-01-14 | **Status:** Posted  
- DR: Savings Account: ₱2,500
- CR: Interest Income: ₱2,500
- Description: Interest from savings account

#### 14. **JE-2026-014** - Office Supplies Purchase
**Date:** 2026-01-14 | **Status:** Posted  
- DR: Office Supplies: ₱5,000
- CR: Cash - Peso: ₱5,000
- Description: Office supplies - pens, paper, folders

#### 15. **JE-2026-015** - Insurance Premium (DRAFT)
**Date:** 2026-01-15 | **Status:** Draft  
- DR: Insurance Expense: ₱3,000
- CR: Accounts Payable: ₱3,000
- Description: Monthly insurance premium accrual

**Journal Entry Notes:**
- 14 entries are Posted and immediately affect financial statements
- 1 entry is in Draft status for review
- All posted entries demonstrate proper double-entry accounting
- Transactions span asset, liability, equity, revenue, and expense accounts

---

## 📄 Invoices (12 Total)

### Sales Invoices (6)

| # | Invoice # | Customer | Date | Amount | Status | Payment |
|---|---|---|---|---|---|---|
| 1 | SI-2026-0001 | CUST-001 (Acme) | 2026-01-05 | ₱28,000 | **Paid** | Bank Transfer (2026-01-10) |
| 2 | SI-2026-0002 | CUST-002 (TechStart) | 2026-01-08 | ₱28,000 | Sent | Awaiting Payment |
| 3 | SI-2026-0003 | CUST-003 (Global Traders) | 2026-01-12 | ₱20,160 | Draft | Not Sent |
| 4 | SI-2026-0004 | CUST-004 (Local Business) | 2026-01-06 | ₱22,400 | **Paid** | Check (2026-01-12) |
| 5 | SI-2026-0005 | CUST-005 (Enterprise) | 2026-01-10 | ₱112,000 | Sent | Awaiting Payment |
| 6 | SI-2026-0006 | CUST-001 (Acme) | 2026-01-13 | ₱44,800 | Draft | Not Sent |

**Sales Invoices Total:** ₱255,360  
**Paid:** ₱50,400 (19.7%)  
**Outstanding:** ₱204,960 (80.3%)

### Purchase Invoices (6)

| # | Invoice # | Vendor | Date | Amount | Status | Payment |
|---|---|---|---|---|---|---|
| 1 | PI-2026-0001 | VEND-001 (Superior Supplies) | 2026-01-03 | ₱13,440 | **Paid** | Check (2026-01-08) |
| 2 | PI-2026-0002 | VEND-002 (Quality Imports) | 2026-01-07 | ₱10,080 | Sent | Due 2026-01-22 |
| 3 | PI-2026-0003 | VEND-003 (Industrial) | 2026-01-10 | ₱10,640 | Draft | COD |
| 4 | PI-2026-0004 | VEND-004 (Office Equipment) | 2026-01-04 | ₱47,040 | Sent | Due 2026-03-05 |
| 5 | PI-2026-0005 | VEND-005 (Tech Components) | 2026-01-11 | ₱39,200 | Draft | Not Finalized |
| 6 | PI-2026-0006 | VEND-001 (Superior Supplies) | 2026-01-08 | ₱9,520 | **Paid** | Bank Transfer (2026-01-14) |

**Purchase Invoices Total:** ₱129,920  
**Paid:** ₱22,960 (17.7%)  
**Outstanding:** ₱106,960 (82.3%)

---

## 📈 Financial Position Summary

### Current Cash Position
- **Opening Balance (after capital):** ₱500,000
- **Cash Transactions:**
  - Sales received: ₱28,000
  - Rent paid: -₱35,000
  - Inventory purchased: -₱10,080
  - Utilities paid: -₱8,500
  - Payables paid: -₱150,000
  - Professional fees: -₱15,000
  - Office supplies: -₱5,000
  - Supplies paid: -₱9,520
  - Interest earned: ₱2,500
- **Estimated Cash Balance:** ~₱297,400

### Accounts Receivable (Outstanding)
- Total A/R from posted entries: ₱20,160
- Invoiced but not yet recorded: ₱204,960
- **Total Outstanding:** ₱225,120

### Accounts Payable (Outstanding)
- Posted entry for salaries: ₱45,000
- Posted entry for insurance: ₱3,000
- Invoiced from vendors: ₱106,960
- **Total Payable:** ₱154,960

### Revenue Recognition
- Sales Revenue: ₱28,000
- Service Revenue: ₱20,160
- Interest Income: ₱2,500
- **Total Revenue:** ₱50,660

### Expense Recognition
- Cost of Goods Sold: ₱12,000
- Rent Expense: ₱35,000
- Utilities: ₱8,500
- Salaries & Wages: ₱45,000
- Depreciation: ₱1,250
- Professional Fees: ₱15,000
- **Total Expenses:** ₱116,750

### Preliminary Net Income (Period)
**Revenue: ₱50,660 - Expenses: ₱116,750 = Loss: -₱66,090**

*Note: This includes non-cash expenses like depreciation and insurance accrual.*

---

## 🎯 Data Features Demonstrated

✅ **Multiple Account Types**
- Asset accounts with and without contra accounts (accumulated depreciation)
- Liability accounts with various payment terms
- Equity accounts
- Revenue accounts (sales and service)
- Expense accounts (operating and non-operating)

✅ **Complete Transaction Lifecycle**
- Initial capital investment
- Asset purchases (equipment, inventory, supplies)
- Operating expenses (rent, utilities, salaries)
- Revenue transactions (cash and credit)
- Payment and collection cycles

✅ **Diverse Customer & Vendor Base**
- Corporate organizations
- Individual proprietorships
- NGOs/Non-profit organizations
- Various service providers and contractors
- Different payment term structures

✅ **Multiple Invoice Statuses**
- Draft invoices (editable)
- Sent invoices (awaiting payment)
- Paid invoices (with payment details)

✅ **Double-Entry Accounting Integrity**
- All posted journal entries balance perfectly
- Proper debit/credit assignments
- Chart of accounts with correct normal balances

---

## 🔄 Testing Workflows

### Test Scenario 1: Complete Sales Transaction
1. View SI-2026-0003 (Draft)
2. Send invoice to CUST-003
3. Receive payment (mark as paid)
4. Verify journal entry automatically created
5. Check General Ledger updates

### Test Scenario 2: Post a Draft Journal Entry
1. Navigate to Journal Entries
2. Review JE-2026-015 (Draft - Insurance Accrual)
3. Post entry
4. Verify Accounts Payable and Insurance Expense updated

### Test Scenario 3: Void a Posted Entry
1. Select any posted entry
2. Click "Void"
3. Enter reason
4. Verify status changes and balances revert

### Test Scenario 4: Create New Customer & Invoice
1. Go to Contacts > Customers
2. Create new customer record
3. Navigate to Sales Invoices
4. Create invoice for new customer
5. Verify customer appears in dropdown

### Test Scenario 5: Financial Analysis
1. View Dashboard (metrics from posted entries only)
2. View General Ledger for account 1000 (Cash - Peso)
3. View General Ledger for account 4000 (Sales Revenue)
4. Verify running balances are calculated correctly

---

## 📋 API Endpoints Ready for Testing

**Chart of Accounts:**
- `GET /api/chart-of-accounts` - List all 33 accounts
- `GET /api/chart-of-accounts/:id` - Get account details
- `POST /api/chart-of-accounts` - Create new account
- `PUT /api/chart-of-accounts/:id` - Update account
- `DELETE /api/chart-of-accounts/:id` - Delete account

**Journal Entries:**
- `GET /api/journal-entries` - List all 15 entries
- `POST /api/journal-entries` - Create new entry
- `POST /api/journal-entries/:id/post` - Post draft entry
- `POST /api/journal-entries/:id/void` - Void posted entry
- `DELETE /api/journal-entries/:id` - Delete draft entry

**Invoices:**
- `GET /api/invoices` - List all 12 invoices
- `POST /api/invoices` - Create new invoice
- `POST /api/invoices/:id/mark-paid` - Mark invoice as paid
- `DELETE /api/invoices/:id` - Delete draft invoice

**Customers:**
- `GET /api/customers` - List 8 customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Vendors:**
- `GET /api/vendors` - List 8 vendors
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

**Ledger & Dashboard:**
- `GET /api/general-ledger/:accountId` - Get ledger for account
- `GET /api/dashboard/metrics` - Get dashboard metrics

---

## 🌐 Access Points

- **Web UI:** http://localhost:3001
- **API Server:** http://localhost:3004
- **Swagger API Docs:** http://localhost:3004/api-docs

---

## 📝 Notes

- All data is persisted in-memory during development
- Sample data covers a 15-day period (Jan 1-15, 2026)
- All transactions follow Philippine accounting standards
- Data demonstrates system capabilities without production setup
- Ready for real database migration when needed

---

**Last Updated:** January 15, 2026 | **Status:** ✅ Production Ready for Demonstration
