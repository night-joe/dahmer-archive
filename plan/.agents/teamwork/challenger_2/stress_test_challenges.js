const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\.gemini\\WebApps Projects\\Dahmer html\\plan';

const contextV03Path = path.join(projectRoot, '02_context_content_plan_v03_final_locked.txt');
const timelineV04Path = path.join(projectRoot, '05_timeline_content_plan_v04_final_locked.txt');
const overviewV02Path = path.join(projectRoot, '01_overview_content_plan_v02.txt');
const auditPath = path.join(projectRoot, 'context_evidentiary_audit.md');

const contextV03 = fs.readFileSync(contextV03Path, 'utf8');
const timelineV04 = fs.readFileSync(timelineV04Path, 'utf8');
const overviewV02 = fs.readFileSync(overviewV02Path, 'utf8');
const audit = fs.readFileSync(auditPath, 'utf8');

console.log('=== ADVERSARIAL STRESS TEST: CROSS-TAB CONSISTENCY ===\n');

// 1. Broken Anchors from Locked Baselines
console.log('1. INCOMING ANCHOR TEST:');
const timelineIncoming = [
  { file: '05_timeline_v04', line: 50, link: '/context#early-life', target: '#early-life' },
  { file: '05_timeline_v04', line: 52, link: '/context#military', target: '#military' },
  { file: '05_timeline_v04', line: 108, link: '/context#early-life', target: '#early-life' },
  { file: '05_timeline_v04', line: 127, link: '/context#military', target: '#military' },
  { file: '01_overview_v02', line: 76, link: '/context#early-life', target: '#early-life' }
];

timelineIncoming.forEach(item => {
  const targetExists = contextV03.includes(item.target);
  console.log(`[${targetExists ? 'PASS' : 'BROKEN'}] ${item.file}:${item.line} -> ${item.link}: exists in contextV03 = ${targetExists}`);
});

// 2. Dispatch #ctx-* prefix pattern check
console.log('\n2. DISPATCH #ctx-* ANCHOR PATTERN TEST:');
const dispatchAnchors = [
  '#ctx-econ-deindustrialization',
  '#ctx-seg-indices',
  '#ctx-oxford-apts',
  '#ctx-mpd-governance',
  '#ctx-lgbtq-history',
  '#ctx-bio-early-life',
  '#ctx-edu-military',
  '#ctx-legal-pre1988'
];

dispatchAnchors.forEach(a => {
  const exists = contextV03.includes(a);
  console.log(`[${exists ? 'PASS' : 'MISSING'}] ${a}: exists in contextV03 = ${exists}`);
});

// 3. 1988 Assault Apartment 3 check
console.log('\n3. 1988 ASSAULT LOCATION PRECISION TEST:');
const assaultLine = contextV03.split('\n').find(l => l.includes('808 N. 24th Street'));
console.log('Line in contextV03:', assaultLine);
const hasApt3 = /Apt(?:artment)?\s*3/i.test(assaultLine || '');
console.log(`[${hasApt3 ? 'PASS' : 'DEFECT'}] 808 N. 24th Street includes Apartment 3: ${hasApt3}`);

// 4. Victim Names in Context v03 Body Text
console.log('\n4. VICTIM ROSTER COVERAGE IN CONTEXT V03:');
const victimNames = [
  'Steven Hicks', 'Steven Tuomi', 'James Doxtator', 'Richard Guerrero', 'Anthony Sears',
  'Raymond Smith', 'Edward Smith', 'Ernest Miller', 'David Thomas', 'Curtis Straughter',
  'Errol Lindsey', 'Anthony Hughes', 'Konerak Sinthasomphone', 'Matt Turner',
  'Jeremiah Weinberger', 'Oliver Lacy', 'Joseph Bradehoft', 'Tracy Edwards'
];

const contextBody = contextV03.slice(0, contextV03.indexOf('MASTER NUMBERED BIBLIOGRAPHY'));
victimNames.forEach(name => {
  const inBody = contextBody.includes(name);
  console.log(`[${inBody ? 'PRESENT' : 'OMITTED_FROM_BODY'}] ${name}`);
});

console.log('\n=== END OF ADVERSARIAL STRESS TEST ===');
