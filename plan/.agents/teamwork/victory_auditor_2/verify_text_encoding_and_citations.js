const fs = require('fs');
const path = require('path');

const planFile = path.join(__dirname, '..', '..', '..', '02_context_content_plan_v03_final_locked.txt');
const content = fs.readFileSync(planFile, 'utf8');

console.log('=== VERIFYING TEXT ENCODING & GLYPH INTEGRITY ===');
// Check specifically for Cyrillic letters (0x0400 to 0x04FF)
const cyrillic = [];
for (let i = 0; i < content.length; i++) {
  const code = content.charCodeAt(i);
  if (code >= 0x0400 && code <= 0x04FF) {
    cyrillic.push({ index: i, char: content[i], hex: code.toString(16), line: content.slice(0, i).split('\n').length });
  }
}
console.log('Cyrillic characters found:', cyrillic.length, cyrillic);

// Check for "REВERE" vs "REVERE"
console.log('Contains RE\\u0412ERE:', content.includes('RE\u0412ERE'));
console.log('Contains standard REVERE:', content.includes('REVERE'));

console.log('\n=== VERIFYING MASTER BIBLIOGRAPHY & CITATIONS ===');
// Match all [SRC-XX]
const bibMatches = content.match(/\[SRC-\d+\]/g) || [];
const uniqueSrc = [...new Set(bibMatches)].sort();
console.log('Total unique [SRC-xx] references found in doc:', uniqueSrc.length);

const missingBib = [];
for (let i = 1; i <= 32; i++) {
  const key = '[SRC-' + (i < 10 ? '0' + i : i) + ']';
  if (!content.includes(key)) {
    missingBib.push(key);
  }
}
console.log('Missing bibliography keys (1-32):', missingBib);

// Check bibliography section
const bibStart = content.indexOf('MASTER NUMBERED BIBLIOGRAPHY');
console.log('Bibliography section present:', bibStart !== -1);

if (bibStart !== -1) {
  const bibSection = content.slice(bibStart);
  let allFoundInBib = true;
  for (let i = 1; i <= 32; i++) {
    const key = '[SRC-' + (i < 10 ? '0' + i : i) + ']';
    if (!bibSection.includes(key)) {
      console.log('Key missing from bibliography section:', key);
      allFoundInBib = false;
    }
  }
  if (allFoundInBib) {
    console.log('All 32 [SRC-01] to [SRC-32] sources are explicitly present in the Bibliography section!');
  }
}

// Check citation counts in text
const citePattern = /\[SRC-\d+[^\]]*\]/g;
const allCitations = content.match(citePattern) || [];
console.log('Total citation instances in text:', allCitations.length);
