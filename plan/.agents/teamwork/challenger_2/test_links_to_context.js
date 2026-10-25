const fs = require('fs');
const path = require('path');
const dir = 'D:\\.gemini\\WebApps Projects\\Dahmer html\\plan';

const checkFiles = [
  '04_victims_content_plan_v05_final_locked.txt',
  '05_timeline_content_plan_v04_final_locked.txt',
  '00_webapp_master_implementation_plan_v04.txt',
  '01_overview_content_plan_v02.txt',
  'README.md'
];

checkFiles.forEach(f => {
  const filePath = path.join(dir, f);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = [...content.matchAll(/(?:\/context[^\s`"'\]\)]*)/g)].map(m => m[0]);
    console.log(`=== ${f} ===`);
    console.log([...new Set(matches)]);
  }
});
