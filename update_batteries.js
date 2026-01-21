const fs = require('fs');

let content = fs.readFileSync('src/data/batteries.ts', 'utf8');

// Add condition field after batteryType
content = content.replace(
  /(\s+batteryType: '[^']+',)\n(\s+price:)/g,
  "$1,\n    condition: 'refurbished',\n$2"
);

// Change warranty from '1 year' to '3 years'
content = content.replace(
  /warranty: '1 year'/g,
  "warranty: '3 years'"
);

fs.writeFileSync('src/data/batteries.ts', content);
console.log('✅ Campo condition agregado y garantía actualizada a 3 years');

