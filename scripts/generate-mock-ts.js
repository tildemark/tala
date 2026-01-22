const fs = require('fs');

// Load the service firm data
const data = JSON.parse(fs.readFileSync('./scripts/service-firm-clean.json', 'utf-8'));

// Generate mockAccounts TypeScript code
const accountsCode = `const mockAccounts = [
${data.accounts.map(acc => {
  const accType = acc.type === 'asset' ? 'Asset' : 
                 acc.type === 'liability' ? 'Liability' :
                 acc.type === 'equity' ? 'Equity' :
                 acc.type === 'revenue' ? 'Revenue' : 'Expense';
  
  const normalBalance = acc.type === 'asset' || acc.type === 'expense' ? 'debit' : 'credit';
  
  return `  { id: '${acc.id}', accountCode: '${acc.code}', accountName: '${acc.name}', accountType: '${accType}', normalBalance: '${normalBalance}', isActive: true }`;
}).join(',\n')}
];`;

// Generate mockEntries TypeScript code  
const entriesCode = `const mockEntries = [
${data.entries.map(entry => {
  const itemsCode = entry.items.map(item => 
    `{ accountId: '${item.accountId}', debit: ${item.debit}, credit: ${item.credit}, description: '${item.description}' }`
  ).join(', ');
  
  return `  { id: '${entry.id}', journalNumber: '${entry.journalNumber}', entryDate: '${entry.entryDate}', description: '${entry.description}', referenceNo: '${entry.referenceNo}', status: '${entry.status}', items: [${itemsCode}] }`;
}).join(',\n')}
];`;

console.log(accountsCode);
console.log('\n\n');
console.log(entriesCode);
