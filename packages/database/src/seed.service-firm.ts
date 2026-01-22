/**
 * Seed Data for Service-Type Firm (2025)
 * Professional Services Consulting - Complete Chart of Accounts + Transactions
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const TENANT_NAME = 'Quantum Consulting Solutions Inc.';
const TENANT_INDUSTRY = 'Professional Services';
const TENANT_BIR_RR = 'RR 9-2009'; // Philippine BIR compliance

// Service Firm Chart of Accounts (Real chart for consulting/professional services)
const CHART_OF_ACCOUNTS = [
  // ASSETS (1000-1999)
  { code: '1010', name: 'Cash - Peso', type: 'asset', subType: 'current' },
  { code: '1020', name: 'Cash - USD', type: 'asset', subType: 'current' },
  { code: '1030', name: 'Petty Cash', type: 'asset', subType: 'current' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', subType: 'current' },
  { code: '1150', name: 'Allowance for Doubtful Accounts', type: 'asset', subType: 'current' },
  { code: '1200', name: 'Prepaid Insurance', type: 'asset', subType: 'current' },
  { code: '1210', name: 'Prepaid Software Licenses', type: 'asset', subType: 'current' },
  { code: '1300', name: 'Office Equipment', type: 'asset', subType: 'fixed' },
  { code: '1310', name: 'Accumulated Depreciation - Equipment', type: 'asset', subType: 'fixed' },
  { code: '1320', name: 'Furniture & Fixtures', type: 'asset', subType: 'fixed' },
  { code: '1330', name: 'Accumulated Depreciation - Furniture', type: 'asset', subType: 'fixed' },
  { code: '1400', name: 'Computer & IT Equipment', type: 'asset', subType: 'fixed' },
  { code: '1410', name: 'Accumulated Depreciation - IT Equipment', type: 'asset', subType: 'fixed' },
  { code: '1500', name: 'Leasehold Improvements', type: 'asset', subType: 'fixed' },
  { code: '1510', name: 'Accumulated Amortization - Leasehold', type: 'asset', subType: 'fixed' },

  // LIABILITIES (2000-2999)
  { code: '2100', name: 'Accounts Payable', type: 'liability', subType: 'current' },
  { code: '2110', name: 'Salaries Payable', type: 'liability', subType: 'current' },
  { code: '2120', name: 'Taxes Payable', type: 'liability', subType: 'current' },
  { code: '2130', name: 'Income Tax Payable', type: 'liability', subType: 'current' },
  { code: '2140', name: 'VAT Payable', type: 'liability', subType: 'current' },
  { code: '2150', name: 'SSS/PhilHealth Payable', type: 'liability', subType: 'current' },
  { code: '2200', name: 'Deferred Revenue', type: 'liability', subType: 'current' },
  { code: '2300', name: 'Client Retainers', type: 'liability', subType: 'current' },
  { code: '2500', name: 'Long-term Debt', type: 'liability', subType: 'longterm' },

  // EQUITY (3000-3999)
  { code: '3100', name: 'Common Stock', type: 'equity', subType: 'capital' },
  { code: '3200', name: 'Additional Paid-in Capital', type: 'equity', subType: 'capital' },
  { code: '3300', name: 'Retained Earnings', type: 'equity', subType: 'retained' },
  { code: '3400', name: 'Current Year Income', type: 'equity', subType: 'retained' },

  // REVENUE (4000-4999)
  { code: '4100', name: 'Service Revenue - Consulting', type: 'revenue', subType: 'operating' },
  { code: '4110', name: 'Service Revenue - Project-Based', type: 'revenue', subType: 'operating' },
  { code: '4120', name: 'Service Revenue - Retainer Fees', type: 'revenue', subType: 'operating' },
  { code: '4130', name: 'Service Revenue - Training', type: 'revenue', subType: 'operating' },
  { code: '4200', name: 'Other Income - Interest', type: 'revenue', subType: 'other' },
  { code: '4210', name: 'Other Income - Rental', type: 'revenue', subType: 'other' },
  { code: '4220', name: 'Other Income - Miscellaneous', type: 'revenue', subType: 'other' },

  // EXPENSES - Cost of Services (5000-5999)
  { code: '5100', name: 'Subcontractor Costs', type: 'expense', subType: 'cogs' },
  { code: '5110', name: 'Freelance Consultant Fees', type: 'expense', subType: 'cogs' },
  { code: '5120', name: 'Software & Tools (Project-based)', type: 'expense', subType: 'cogs' },

  // EXPENSES - Personnel (6000-6999)
  { code: '6100', name: 'Salaries & Wages', type: 'expense', subType: 'personnel' },
  { code: '6110', name: 'Consultants & Project Managers', type: 'expense', subType: 'personnel' },
  { code: '6120', name: 'Bonuses & Incentives', type: 'expense', subType: 'personnel' },
  { code: '6130', name: 'SSS Contribution', type: 'expense', subType: 'personnel' },
  { code: '6140', name: 'PhilHealth Contribution', type: 'expense', subType: 'personnel' },
  { code: '6150', name: 'PAG-IBIG Contribution', type: 'expense', subType: 'personnel' },
  { code: '6160', name: 'Employee Benefits', type: 'expense', subType: 'personnel' },
  { code: '6170', name: 'Professional Development & Training', type: 'expense', subType: 'personnel' },

  // EXPENSES - Operating (7000-7999)
  { code: '7100', name: 'Rent - Office Space', type: 'expense', subType: 'operating' },
  { code: '7110', name: 'Utilities - Electricity', type: 'expense', subType: 'operating' },
  { code: '7120', name: 'Utilities - Internet & Phone', type: 'expense', subType: 'operating' },
  { code: '7130', name: 'Office Supplies', type: 'expense', subType: 'operating' },
  { code: '7140', name: 'Software Licenses & Subscriptions', type: 'expense', subType: 'operating' },
  { code: '7150', name: 'Equipment Maintenance', type: 'expense', subType: 'operating' },
  { code: '7160', name: 'Insurance', type: 'expense', subType: 'operating' },
  { code: '7170', name: 'Professional Fees - Audit & Accounting', type: 'expense', subType: 'operating' },
  { code: '7180', name: 'Professional Fees - Legal', type: 'expense', subType: 'operating' },
  { code: '7190', name: 'Travel & Transportation', type: 'expense', subType: 'operating' },
  { code: '7200', name: 'Marketing & Business Development', type: 'expense', subType: 'operating' },
  { code: '7210', name: 'Client Entertainment', type: 'expense', subType: 'operating' },
  { code: '7220', name: 'Depreciation - Equipment', type: 'expense', subType: 'operating' },
  { code: '7230', name: 'Depreciation - Furniture', type: 'expense', subType: 'operating' },
  { code: '7240', name: 'Amortization - Leasehold', type: 'expense', subType: 'operating' },

  // EXPENSES - Taxes & Penalties (8000-8999)
  { code: '8100', name: 'Income Tax Expense', type: 'expense', subType: 'tax' },
  { code: '8110', name: 'VAT Expense', type: 'expense', subType: 'tax' },
  { code: '8120', name: 'Local Business Tax', type: 'expense', subType: 'tax' },
];

// Helper: Create audit log hash
const createAuditHash = (previousHash: string | null, action: string, entityId: string): string => {
  const payload = `${previousHash || ''}|${action}|${entityId}|${Date.now()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

// Helper: Format date to ISO
const dateToISO = (year: number, month: number, day: number): string => {
  return new Date(year, month - 1, day).toISOString();
};

export const seedServiceFirm = async () => {
  try {
    console.log('\n🌱 Seeding Service Firm - Quantum Consulting Solutions\n');

    // 1. Create Tenant
    const tenant = await prisma.tenant.upsert({
      where: { name: TENANT_NAME },
      update: {},
      create: {
        name: TENANT_NAME,
        industry: TENANT_INDUSTRY,
        country: 'Philippines',
        complianceFramework: TENANT_BIR_RR,
        isActive: true,
      },
    });
    console.log(`✓ Tenant created: ${tenant.id}`);

    // 2. Create Chart of Accounts
    const chartOfAccountsMap = new Map();
    for (const account of CHART_OF_ACCOUNTS) {
      const coa = await prisma.chartOfAccount.upsert({
        where: { tenantId_code: { tenantId: tenant.id, code: account.code } },
        update: { isActive: true },
        create: {
          tenantId: tenant.id,
          code: account.code,
          name: account.name,
          accountType: account.type,
          subType: account.subType,
          description: `${account.name} for ${TENANT_NAME}`,
          isActive: true,
          normalBalance: account.type === 'liability' || account.type === 'equity' || account.type === 'revenue' ? 'credit' : 'debit',
        },
      });
      chartOfAccountsMap.set(account.code, coa);
    }
    console.log(`✓ Chart of Accounts created: ${chartOfAccountsMap.size} accounts`);

    // 3. Create User (System Admin for audit log)
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@quantum.ph' } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: 'admin@quantum.ph',
        firstName: 'System',
        lastName: 'Admin',
        isActive: true,
      },
    });
    console.log(`✓ User created: ${user.id}`);

    // 4. Create Opening Balance Journal Entry (Jan 1, 2025)
    const openingEntry = await prisma.journalEntry.create({
      data: {
        tenantId: tenant.id,
        journalNumber: 'JE-2025-001',
        entryDate: dateToISO(2025, 1, 1),
        description: 'Opening Balance - Company Start with Capital Investment',
        referenceNo: 'OPENING-2025',
        status: 'posted',
        postedBy: user.id,
        postedAt: dateToISO(2025, 1, 1),
        items: {
          create: [
            {
              tenantId: tenant.id,
              accountId: chartOfAccountsMap.get('1010').id,
              debit: 500000,
              credit: 0,
              description: 'Initial cash investment',
            },
            {
              tenantId: tenant.id,
              accountId: chartOfAccountsMap.get('3100').id,
              debit: 0,
              credit: 500000,
              description: 'Common stock issued',
            },
          ],
        },
      },
    });
    console.log(`✓ Opening balance entry created: ${openingEntry.id}`);

    // 5. Create Monthly Revenue Entries (Jan-Dec 2025)
    const monthlyRevenue = [65000, 72000, 68000, 85000, 92000, 88000, 95000, 78000, 82000, 90000, 98000, 105000];
    let entryCount = 1;

    for (let month = 1; month <= 12; month++) {
      const lastDay = new Date(2025, month, 0).getDate();
      const entryDate = dateToISO(2025, month, Math.min(5, lastDay)); // 5th of each month

      const revenue = monthlyRevenue[month - 1];
      const revenueEntry = await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          journalNumber: `JE-2025-${String(entryCount + 1).padStart(3, '0')}`,
          entryDate,
          description: `Service Revenue - ${new Date(2025, month - 1).toLocaleString('en-US', { month: 'long' })} 2025`,
          referenceNo: `REV-${month.toString().padStart(2, '0')}-2025`,
          status: 'posted',
          postedBy: user.id,
          postedAt: entryDate,
          items: {
            create: [
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('1010').id,
                debit: revenue,
                credit: 0,
                description: `Revenue collection - ${new Date(2025, month - 1).toLocaleString('en-US', { month: 'long' })}`,
              },
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('4100').id,
                debit: 0,
                credit: revenue,
                description: 'Service revenue earned',
              },
            ],
          },
        },
      });
      entryCount++;
    }
    console.log(`✓ Monthly revenue entries created (12 entries, Jan-Dec)`);

    // 6. Create Salary Expense Entries (Monthly)
    const monthlySalary = 250000;
    for (let month = 1; month <= 12; month++) {
      const lastDay = new Date(2025, month, 0).getDate();
      const entryDate = dateToISO(2025, month, Math.min(28, lastDay)); // 28th of each month

      await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          journalNumber: `JE-2025-${String(entryCount + 1).padStart(3, '0')}`,
          entryDate,
          description: `Monthly Salary Expense - ${new Date(2025, month - 1).toLocaleString('en-US', { month: 'long' })} 2025`,
          referenceNo: `SAL-${month.toString().padStart(2, '0')}-2025`,
          status: 'posted',
          postedBy: user.id,
          postedAt: entryDate,
          items: {
            create: [
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('6100').id,
                debit: monthlySalary,
                credit: 0,
                description: 'Monthly salaries',
              },
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('1010').id,
                debit: 0,
                credit: monthlySalary,
                description: 'Salary payment',
              },
            ],
          },
        },
      });
      entryCount++;
    }
    console.log(`✓ Monthly salary entries created (12 entries, Jan-Dec)`);

    // 7. Create Operating Expense Entries
    const operatingExpenses = [
      { code: '7100', amount: 50000, description: 'Office rent' },
      { code: '7110', amount: 8000, description: 'Electricity bill' },
      { code: '7120', amount: 5000, description: 'Internet & phone' },
      { code: '7130', amount: 3000, description: 'Office supplies' },
      { code: '7140', amount: 12000, description: 'Software licenses' },
      { code: '7160', amount: 8000, description: 'Insurance' },
      { code: '7200', amount: 15000, description: 'Marketing & BD' },
    ];

    for (const expense of operatingExpenses) {
      await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          journalNumber: `JE-2025-${String(entryCount + 1).padStart(3, '0')}`,
          entryDate: dateToISO(2025, Math.floor(Math.random() * 12) + 1, 15),
          description: `Operating Expense - ${expense.description}`,
          referenceNo: `EXP-${expense.code}-2025`,
          status: 'posted',
          postedBy: user.id,
          postedAt: dateToISO(2025, Math.floor(Math.random() * 12) + 1, 15),
          items: {
            create: [
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get(expense.code).id,
                debit: expense.amount,
                credit: 0,
                description: expense.description,
              },
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('1010').id,
                debit: 0,
                credit: expense.amount,
                description: 'Payment made',
              },
            ],
          },
        },
      });
      entryCount++;
    }
    console.log(`✓ Operating expense entries created (${operatingExpenses.length} entries)`);

    // 8. Create Subcontractor/Cost of Services Entries
    for (let month = 1; month <= 12; month += 3) {
      const amount = 25000;
      await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          journalNumber: `JE-2025-${String(entryCount + 1).padStart(3, '0')}`,
          entryDate: dateToISO(2025, month, 10),
          description: `Subcontractor Costs - Q${Math.ceil(month / 3)} 2025`,
          referenceNo: `SUB-Q${Math.ceil(month / 3)}-2025`,
          status: 'posted',
          postedBy: user.id,
          postedAt: dateToISO(2025, month, 10),
          items: {
            create: [
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('5100').id,
                debit: amount,
                credit: 0,
                description: 'Subcontractor fees',
              },
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('2100').id,
                debit: 0,
                credit: amount,
                description: 'Payable to contractors',
              },
            ],
          },
        },
      });
      entryCount++;
    }
    console.log(`✓ Subcontractor cost entries created (4 entries quarterly)`);

    // 9. Create Depreciation Entries (Quarterly)
    for (let quarter = 1; quarter <= 4; quarter++) {
      const month = quarter * 3;
      await prisma.journalEntry.create({
        data: {
          tenantId: tenant.id,
          journalNumber: `JE-2025-${String(entryCount + 1).padStart(3, '0')}`,
          entryDate: dateToISO(2025, month, 30),
          description: `Quarterly Depreciation - Q${quarter} 2025`,
          referenceNo: `DEP-Q${quarter}-2025`,
          status: 'posted',
          postedBy: user.id,
          postedAt: dateToISO(2025, month, 30),
          items: {
            create: [
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('7220').id,
                debit: 5000,
                credit: 0,
                description: 'Depreciation expense',
              },
              {
                tenantId: tenant.id,
                accountId: chartOfAccountsMap.get('1310').id,
                debit: 0,
                credit: 5000,
                description: 'Accumulated depreciation',
              },
            ],
          },
        },
      });
      entryCount++;
    }
    console.log(`✓ Depreciation entries created (4 quarterly entries)`);

    // 10. Create Audit Log Entries
    let auditHash: string | null = null;
    for (let i = 0; i < entryCount; i++) {
      auditHash = createAuditHash(auditHash, 'JournalEntryPosted', `JE-2025-${String(i + 1).padStart(3, '0')}`);
      
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          entityType: 'JournalEntry',
          entityId: `JE-2025-${String(i + 1).padStart(3, '0')}`,
          action: 'Posted',
          description: `Journal entry posted to ledger`,
          userId: user.id,
          previousHash: i === 0 ? null : auditHash,
          dataHash: auditHash,
          hashVerified: true,
          ipAddress: '192.168.1.1',
          userAgent: 'System/Seed',
        },
      });
    }
    console.log(`✓ Audit log entries created (${entryCount} entries with hash chain)`);

    console.log(`\n✅ Service Firm seeding completed!\n`);
    console.log(`📊 Summary:`);
    console.log(`   - Tenant: ${TENANT_NAME} (${tenant.id})`);
    console.log(`   - Chart of Accounts: ${chartOfAccountsMap.size} accounts`);
    console.log(`   - Journal Entries: ${entryCount} entries`);
    console.log(`   - Period: January 1 - December 31, 2025`);
    console.log(`   - Audit Trail: Fully tracked with SHA-256 hash chain\n`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run if executed directly
seedServiceFirm().catch((e) => {
  console.error(e);
  process.exit(1);
});
