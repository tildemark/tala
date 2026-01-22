const fs = require('fs');

// Read the file
const lines = fs.readFileSync('./scripts/service-firm-data.json', 'utf-8').split('\n');

// Find where JSON starts (after "JSON Output:")
let jsonStartIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('JSON Output:')) {
    jsonStartIndex = i + 1;
    break;
  }
}

if (jsonStartIndex === -1) {
  console.error('Could not find "JSON Output:" marker');
  process.exit(1);
}

// Extract JSON lines
const jsonLines = lines.slice(jsonStartIndex).join('\n');

try {
  const data = JSON.parse(jsonLines);
  fs.writeFileSync('./scripts/service-firm-clean.json', JSON.stringify(data, null, 2));
  console.log(`Extracted ${data.accounts.length} accounts and ${data.entries.length} entries`);
} catch (e) {
  console.error('Parse error:', e.message);
  process.exit(1);
}
