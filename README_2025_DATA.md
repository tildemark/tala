# 📊 2025 Seed Data - Quick Reference

## What Changed
Dashboard cards now show **real data from 55 journal entries and 20 invoices** spanning the complete year 2025.

## Key Metrics (Live)
| Metric | Amount | Source |
|--------|--------|--------|
| Total Revenue | ₱1,998,000 | 12 sales invoices (paid) |
| Total Expenses | ₱1,353,500 | Monthly operations |
| Net Income | ₱21,125 | Revenue - Expenses |
| Accounts Receivable | ₱280,000 | 2 unpaid invoices |
| Accounts Payable | ₱168,000 | 1 pending purchase |

## Dataset Overview
- **Time Period:** Jan 1, 2025 - Dec 31, 2025
- **Transactions:** 55 journal entries
- **Sales Invoices:** 12 (4-5 per quarter)
- **Purchase Invoices:** 8 (monthly to quarterly)
- **Customers:** 8 companies
- **Vendors:** 8 suppliers
- **Accounts Used:** 20+

## Monthly Pattern
- **Fixed Costs:** Rent ₱40k/month, Salaries ₱60-100k/month
- **Variable Revenue:** Ranges ₱0 (setup months) to ₱350k (peak months)
- **Quarterly Events:** Interest income, depreciation adjustments

## Major Transactions
- **Jan 1:** ₱500k capital investment
- **Jan 2-4:** ₱370k equipment & furniture setup
- **Jan 5:** ₱150k initial inventory
- **Throughout Year:** 55 operational entries
- **Dec 31:** Year-end depreciation & adjustments

## Invoice Examples
- Smallest: ₱25,760 (maintenance)
- Largest: ₱235,200 (enterprise project)
- Median: ₱130,000-₱162,000

## How Data Flows
```
Database (dev.ts) 
    ↓
API (http://localhost:3004)
    ↓
Dashboard (http://localhost:3001)
    ↓
User sees real metrics
```

## Accessing the Data

### Web UI
```
Dashboard:    http://localhost:3001/
Invoices:     http://localhost:3001/invoicing/
Accounting:   http://localhost:3001/accounting/
```

### API
```
GET /api/dashboard/metrics
GET /api/journal-entries
GET /api/invoices?type=sales
GET /api/invoices?type=purchase
GET /api/chart-of-accounts
```

## Key Files Modified
- `apps/api/src/dev.ts` - 55 entries + 20 invoices added
- `apps/web/src/app/page.tsx` - API port fixed (3004)

## All Systems
✅ API running on 3004
✅ Web running on 3001
✅ Dashboard showing 2025 data
✅ All invoices linked to customers/vendors
✅ Year-end ready

## Documents Created
- `SEED_DATA_2025_COMPLETE.md` - Full details
- `DASHBOARD_2025_DATA_COMPLETE.md` - Implementation guide
- This file - Quick reference

---

**Status:** ✅ Complete and operational  
**Dashboard:** Now showing live 2025 financial data  
**Ready for:** Year-end closing procedures, 2026 opening setup

