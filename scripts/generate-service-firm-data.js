/**
 * Generate realistic service firm chart of accounts and 2025 journal entries
 * Run: node scripts/generate-service-firm-data.js
 */

const crypto = require('crypto');

// Service Firm Chart of Accounts
const SERVICE_FIRM_ACCOUNTS = [
  // ASSETS
  { id: '1', code: '1010', name: 'Cash - Peso', type: 'asset' },
  { id: '2', code: '1020', name: 'Cash - USD', type: 'asset' },
  { id: '3', code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { id: '4', code: '1150', name: 'Allowance for Doubtful Accounts', type: 'asset' },
  { id: '5', code: '1300', name: 'Office Supplies', type: 'asset' },
  { id: '6', code: '1400', name: 'Computer & IT Equipment', type: 'asset' },
  { id: '7', code: '1410', name: 'Accumulated Depreciation - IT', type: 'asset' },
  { id: '8', code: '1500', name: 'Office Equipment', type: 'asset' },
  { id: '9', code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'asset' },
  { id: '10', code: '1600', name: 'Furniture & Fixtures', type: 'asset' },
  { id: '11', code: '1610', name: 'Accumulated Depreciation - Furniture', type: 'asset' },
  
  // LIABILITIES
  { id: '12', code: '2100', name: 'Accounts Payable', type: 'liability' },
  { id: '13', code: '2110', name: 'Salaries Payable', type: 'liability' },
  { id: '14', code: '2120', name: 'Taxes Payable', type: 'liability' },
  { id: '15', code: '2130', name: 'Income Tax Payable', type: 'liability' },
  { id: '16', code: '2140', name: 'VAT Payable', type: 'liability' },
  { id: '17', code: '2150', name: 'Social Benefits Payable', type: 'liability' },
  { id: '18', code: '2200', name: 'Unearned Revenue', type: 'liability' },
  
  // EQUITY
  { id: '19', code: '3100', name: 'Common Stock', type: 'equity' },
  { id: '20', code: '3200', name: 'Additional Paid-in Capital', type: 'equity' },
  { id: '21', code: '3300', name: 'Retained Earnings', type: 'equity' },
  
  // REVENUE
  { id: '22', code: '4100', name: 'Consulting Revenue', type: 'revenue' },
  { id: '23', code: '4110', name: 'Project Revenue', type: 'revenue' },
  { id: '24', code: '4120', name: 'Retainer Fee Revenue', type: 'revenue' },
  { id: '25', code: '4200', name: 'Other Income', type: 'revenue' },
  
  // EXPENSES - Cost of Services
  { id: '26', code: '5100', name: 'Subcontractor Costs', type: 'expense' },
  { id: '27', code: '5110', name: 'Freelancer Fees', type: 'expense' },
  { id: '28', code: '5200', name: 'Software & Tools', type: 'expense' },
  
  // EXPENSES - Personnel
  { id: '29', code: '6100', name: 'Salaries & Wages', type: 'expense' },
  { id: '30', code: '6110', name: 'Employee Benefits', type: 'expense' },
  { id: '31', code: '6120', name: 'SSS Contribution', type: 'expense' },
  { id: '32', code: '6130', name: 'PhilHealth Contribution', type: 'expense' },
  { id: '33', code: '6140', name: 'PAG-IBIG Contribution', type: 'expense' },
  
  // EXPENSES - Operating
  { id: '34', code: '7100', name: 'Rent Expense', type: 'expense' },
  { id: '35', code: '7110', name: 'Utilities', type: 'expense' },
  { id: '36', code: '7120', name: 'Internet & Phone', type: 'expense' },
  { id: '37', code: '7130', name: 'Office Supplies', type: 'expense' },
  { id: '38', code: '7140', name: 'Professional Fees', type: 'expense' },
  { id: '39', code: '7150', name: 'Insurance', type: 'expense' },
  { id: '40', code: '7160', name: 'Travel & Transportation', type: 'expense' },
  { id: '41', code: '7170', name: 'Marketing & Business Development', type: 'expense' },
  { id: '42', code: '7200', name: 'Depreciation - Equipment', type: 'expense' },
  { id: '43', code: '7210', name: 'Depreciation - Furniture', type: 'expense' },
];

// Generate 2025 Journal Entries
const entries = [];
let entryNum = 1;

// Opening Entry (Jan 1)
entries.push({
  journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
  entryDate: '2025-01-01',
  description: 'Opening Balance - Capital Investment',
  referenceNo: 'OPENING-2025',
  status: 'posted',
  items: [
    { accountId: '1', debit: 1000000, credit: 0, description: 'Initial cash' },
    { accountId: '19', debit: 0, credit: 1000000, description: 'Common stock' },
  ],
});

// Monthly Revenue Entries (Jan-Dec)
const monthlyRevenue = [65000, 72000, 68000, 85000, 92000, 88000, 95000, 78000, 82000, 90000, 98000, 105000];
monthlyRevenue.forEach((revenue, monthIdx) => {
  const month = monthIdx + 1;
  const day = Math.min(5, new Date(2025, month, 0).getDate());
  entries.push({
    journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
    entryDate: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    description: `Service Revenue - ${new Date(2025, month-1).toLocaleString('en-US', {month: 'long'})}`,
    referenceNo: `REV-${String(month).padStart(2, '0')}-2025`,
    status: 'posted',
    items: [
      { accountId: '1', debit: revenue, credit: 0, description: 'Revenue collection' },
      { accountId: '22', debit: 0, credit: revenue, description: 'Consulting revenue' },
    ],
  });
});

// Monthly Salary Expenses
const monthlySalary = 250000;
for (let month = 1; month <= 12; month++) {
  const day = 28;
  entries.push({
    journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
    entryDate: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    description: `Monthly Salaries - ${new Date(2025, month-1).toLocaleString('en-US', {month: 'long'})}`,
    referenceNo: `SAL-${String(month).padStart(2, '0')}-2025`,
    status: 'posted',
    items: [
      { accountId: '29', debit: monthlySalary, credit: 0, description: 'Staff salaries' },
      { accountId: '1', debit: 0, credit: monthlySalary, description: 'Salary payment' },
    ],
  });
}

// Operating Expenses (Rent, Utilities, Professional Fees)
const operatingExpenses = [
  { accountId: '34', code: '7100', amount: 50000, description: 'Monthly rent' },
  { accountId: '35', code: '7110', amount: 8000, description: 'Utilities' },
  { accountId: '36', code: '7120', amount: 5000, description: 'Internet/Phone' },
  { accountId: '37', code: '7130', amount: 3000, description: 'Office supplies' },
  { accountId: '38', code: '7140', amount: 10000, description: 'Professional fees' },
  { accountId: '39', code: '7150', amount: 8000, description: 'Insurance' },
];

operatingExpenses.forEach((exp, idx) => {
  for (let month = 1; month <= 12; month++) {
    entries.push({
      journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
      entryDate: `2025-${String(month).padStart(2, '0')}-15`,
      description: `${exp.description} - ${new Date(2025, month-1).toLocaleString('en-US', {month: 'long'})}`,
      referenceNo: `EXP-${exp.code}-${String(month).padStart(2, '0')}-2025`,
      status: 'posted',
      items: [
        { accountId: exp.accountId, debit: exp.amount, credit: 0, description: exp.description },
        { accountId: '1', debit: 0, credit: exp.amount, description: 'Payment' },
      ],
    });
  }
});

// Subcontractor Costs (Quarterly)
for (let q = 1; q <= 4; q++) {
  const month = q * 3;
  entries.push({
    journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
    entryDate: `2025-${String(month).padStart(2, '0')}-10`,
    description: `Subcontractor Costs - Q${q} 2025`,
    referenceNo: `SUB-Q${q}-2025`,
    status: 'posted',
    items: [
      { accountId: '26', debit: 30000, credit: 0, description: 'Freelance costs' },
      { accountId: '12', debit: 0, credit: 30000, description: 'Payable' },
    ],
  });
}

// Depreciation (Quarterly)
for (let q = 1; q <= 4; q++) {
  const month = q * 3;
  entries.push({
    journalNumber: `JE-2025-${String(entryNum++).padStart(3, '0')}`,
    entryDate: `2025-${String(month).padStart(2, '0')}-30`,
    description: `Depreciation Expense - Q${q} 2025`,
    referenceNo: `DEP-Q${q}-2025`,
    status: 'posted',
    items: [
      { accountId: '42', debit: 5000, credit: 0, description: 'Depreciation' },
      { accountId: '9', debit: 0, credit: 5000, description: 'Accumulated depreciation' },
    ],
  });
}

console.log('Service Firm Chart of Accounts & 2025 Entries Generated');
console.log('Accounts:', SERVICE_FIRM_ACCOUNTS.length);
console.log('Journal Entries:', entries.length);
console.log('\nJSON Output:');
console.log(JSON.stringify({ accounts: SERVICE_FIRM_ACCOUNTS, entries }, null, 2));
