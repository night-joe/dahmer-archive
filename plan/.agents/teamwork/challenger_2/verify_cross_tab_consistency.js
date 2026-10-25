const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\.gemini\\WebApps Projects\\Dahmer html\\plan';

// Load files
const files = {
  contextV03: fs.readFileSync(path.join(projectRoot, '02_context_content_plan_v03_final_locked.txt'), 'utf8'),
  contextAudit: fs.readFileSync(path.join(projectRoot, 'context_evidentiary_audit.md'), 'utf8'),
  victimsV05: fs.readFileSync(path.join(projectRoot, '04_victims_content_plan_v05_final_locked.txt'), 'utf8'),
  timelineV04: fs.readFileSync(path.join(projectRoot, '05_timeline_content_plan_v04_final_locked.txt'), 'utf8'),
  overviewV02: fs.readFileSync(path.join(projectRoot, '01_overview_content_plan_v02.txt'), 'utf8'),
  readme: fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8')
};

const results = {
  task1_geographic: [],
  task2_chronological_victims: [],
  task3_anchors: [],
  task4_file_integrity: []
};

function recordTest(suite, testName, passed, details) {
  results[suite].push({ testName, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] [${suite}] ${testName}: ${details}`);
}

// ============================================================================
// TASK 1: GEOGRAPHIC & SPATIAL ALIGNMENT
// ============================================================================
console.log('\n================== TASK 1: GEOGRAPHIC & SPATIAL ALIGNMENT ==================');

// 1.1 Oxford Apartments: 924 N. 25th Street, Apt 213, May 1990
{
  const addressRegex = /924\s+N\.\s+25th\s+Street/i;
  const aptRegex = /Apartment\s+213|Apt\.?\s*213/i;
  const moveInRegex = /May\s+1990/i;

  const ctxHasAddr = addressRegex.test(files.contextV03);
  const ctxHasApt = aptRegex.test(files.contextV03);
  const ctxHasMoveIn = moveInRegex.test(files.contextV03);
  const timelineHasAddr = addressRegex.test(files.timelineV04);
  const timelineHasMoveIn = moveInRegex.test(files.timelineV04);

  recordTest('task1_geographic', 'Oxford Apts Address (924 N. 25th St)', ctxHasAddr && timelineHasAddr,
    `contextV03=${ctxHasAddr}, timelineV04=${timelineHasAddr}`);
  recordTest('task1_geographic', 'Oxford Apts Unit (Apartment 213)', ctxHasApt,
    `contextV03 specifies Apt 213: ${ctxHasApt}`);
  recordTest('task1_geographic', 'Oxford Apts Move-in Date (May 1990)', ctxHasMoveIn && timelineHasMoveIn,
    `contextV03=${ctxHasMoveIn}, timelineV04=${timelineHasMoveIn}`);
}

// 1.2 West Allis grandmother residence: 2357 S. 57th Street (late 1981 – May 1990)
{
  const westAllisAddr = /2357\s+S\.\s+57th\s+Street/i;
  const westAllisSpan = /late\s+1981\s*(?:–|-|to)\s*May\s+1990/i;
  const searsCovered = /Anthony\s+Sears/i.test(files.contextV03) && /March\s+1989/i.test(files.contextV03);
  const huberCovered = /Huber/i.test(files.contextV03);

  const ctxHasAddr = westAllisAddr.test(files.contextV03);
  const ctxHasSpan = westAllisSpan.test(files.contextV03);

  recordTest('task1_geographic', 'West Allis Address (2357 S. 57th St)', ctxHasAddr,
    `contextV03 specifies 2357 S. 57th St: ${ctxHasAddr}`);
  recordTest('task1_geographic', 'West Allis Span (late 1981 – May 1990)', ctxHasSpan,
    `contextV03 specifies late 1981 – May 1990: ${ctxHasSpan}`);
  recordTest('task1_geographic', 'West Allis Sears & Huber Context', searsCovered && huberCovered,
    `Sears covered=${searsCovered}, Huber covered=${huberCovered}`);
}

// 1.3 Ambrosia Chocolate Factory: 1133 North 5th Street (Jan 14, 1985; fired July 15, 1991)
{
  const ambrosiaAddr = /1133\s+North\s+5th\s+Street|1133\s+N\.\s+5th\s+Street/i;
  const ambrosiaHired = /Jan(?:uary)?\s+14,\s*1985/i;
  const ambrosiaFired = /July\s+15,\s*1991/i;

  const ctxHasAddr = ambrosiaAddr.test(files.contextV03);
  const ctxHasHired = ambrosiaHired.test(files.contextV03);
  const ctxHasFired = ambrosiaFired.test(files.contextV03);

  recordTest('task1_geographic', 'Ambrosia Address (1133 North 5th Street)', ctxHasAddr,
    `contextV03 specifies 1133 North 5th Street: ${ctxHasAddr}`);
  recordTest('task1_geographic', 'Ambrosia Hire Date (January 14, 1985)', ctxHasHired,
    `contextV03 specifies Jan 14, 1985: ${ctxHasHired}`);
  recordTest('task1_geographic', 'Ambrosia Fired Date (July 15, 1991)', ctxHasFired,
    `contextV03 specifies July 15, 1991: ${ctxHasFired}`);
}

// 1.4 1988 assault location: 808 North 24th Street, Apartment 3
{
  const assaultAddr = /808\s+North\s+24th\s+Street|808\s+N\.\s+24th\s+Street/i;
  const assaultApt = /Apartment\s+3|Apt\.?\s*3/i;

  const ctxHasAddr = assaultAddr.test(files.contextV03);
  const ctxHasApt = assaultApt.test(files.contextV03);
  const auditCorrectsTimeline = files.contextAudit.includes('808 North 24th Street') &&
    files.contextAudit.includes('225 24th Street');

  recordTest('task1_geographic', '1988 Assault Address (808 North 24th Street, Apt 3)', ctxHasAddr && ctxHasApt,
    `contextV03 specifies 808 N. 24th St Apt 3: addr=${ctxHasAddr}, apt=${ctxHasApt}`);
  recordTest('task1_geographic', 'Audit documents 225 24th St correction', auditCorrectsTimeline,
    `context_evidentiary_audit.md notes correction of 225 24th St: ${auditCorrectsTimeline}`);
}


// ============================================================================
// TASK 2: CHRONOLOGICAL & VICTIM NAME ALIGNMENT
// ============================================================================
console.log('\n============== TASK 2: CHRONOLOGICAL & VICTIM NAME ALIGNMENT ==============');

const victimsList = [
  { name: 'Steven Hicks', date: 'June 18, 1978', key: /Steven\s+(?:Mark\s+)?Hicks/i },
  { name: 'Steven Tuomi', date: '1987', key: /Steven\s+(?:Walter\s+)?Tuomi/i },
  { name: 'James Doxtator', date: 'January 1988', key: /James\s+(?:\"Jamie\"\s+)?Doxtator|Jamie\s+Doxtator/i },
  { name: 'Richard Guerrero', date: 'March 1988', key: /Richard\s+Guerrero/i },
  { name: 'Anthony Sears', date: 'March 1989', key: /Anthony\s+(?:Lee\s+)?Sears/i },
  { name: 'Raymond Smith', date: 'May 1990', key: /Raymond\s+(?:\"Ricky\s+Beeks\"\s+)?Smith|Ricky\s+Beeks/i },
  { name: 'Edward Smith', date: 'June 1990', key: /Edward\s+(?:\"Eddie\"\s+)?Smith|Eddie\s+Smith/i },
  { name: 'Ernest Miller', date: 'September 1990', key: /Ernest\s+Miller/i },
  { name: 'David Thomas', date: 'September 1990', key: /David\s+(?:Courtney\s+)?Thomas/i },
  { name: 'Curtis Straughter', date: 'February 1991', key: /Curtis\s+Straughter/i },
  { name: 'Errol Lindsey', date: 'April 1991', key: /Errol\s+Lindsey/i },
  { name: 'Anthony Hughes', date: 'May 1991', key: /Anthony\s+(?:\"Tony\"\s+)?Hughes|Tony\s+Hughes/i },
  { name: 'Konerak Sinthasomphone', date: 'May 1991', key: /Konerak\s+Sinthasomphone/i },
  { name: 'Matt Turner', date: 'June 1991', key: /Matt\s+Turner/i },
  { name: 'Jeremiah Weinberger', date: 'July 1991', key: /Jeremiah\s+Weinberger/i },
  { name: 'Oliver Lacy', date: 'July 1991', key: /Oliver\s+Lacy/i },
  { name: 'Joseph Bradehoft', date: 'July 1991', key: /Joseph\s+Bradehoft/i },
  { name: 'Tracy Edwards', date: 'July 22, 1991', key: /Tracy\s+Edwards/i }
];

victimsList.forEach(v => {
  const inContext = v.key.test(files.contextV03);
  const inVictims = v.key.test(files.victimsV05);
  const inTimeline = v.key.test(files.timelineV04);
  recordTest('task2_chronological_victims', `Victim Alignment: ${v.name}`, inContext && inVictims && inTimeline,
    `inContext=${inContext}, inVictims=${inVictims}, inTimeline=${inTimeline}`);
});

// Somsack vs Konerak distinction
{
  const somsackInContext = /Somsack\s+Sinthasomphone/i.test(files.contextV03);
  const konerakInContext = /Konerak\s+Sinthasomphone/i.test(files.contextV03);
  const distinctionDescribed = files.contextV03.includes('Somsack') && files.contextV03.includes('Konerak') &&
    (files.contextV03.includes('1988') && files.contextV03.includes('1991'));
  const auditClarifiesSombat = files.contextAudit.includes('Sombat') && files.contextAudit.includes('Somsack');

  recordTest('task2_chronological_victims', 'Somsack (1988, age 13) present in Context', somsackInContext,
    `Somsack mentioned: ${somsackInContext}`);
  recordTest('task2_chronological_victims', 'Konerak (1991, age 14) present in Context', konerakInContext,
    `Konerak mentioned: ${konerakInContext}`);
  recordTest('task2_chronological_victims', 'Distinction between Somsack and Konerak explicitly maintained', distinctionDescribed,
    `Distinction maintained in contextV03: ${distinctionDescribed}`);
  recordTest('task2_chronological_victims', 'Audit addresses Timeline v04 Sombat error', auditClarifiesSombat,
    `Audit notes Sombat vs Somsack: ${auditClarifiesSombat}`);
}


// ============================================================================
// TASK 3: BIDIRECTIONAL ANCHOR CONSISTENCY
// ============================================================================
console.log('\n================ TASK 3: BIDIRECTIONAL ANCHOR CONSISTENCY ================');

// Extract all Section A and Section B anchors declared in Context v03
const declaredContextAnchors = [
  '#macroeconomic-restructuring',
  '#residential-segregation',
  '#avenues-west-oxford-apartments',
  '#mpd-institutional-culture',
  '#ernest-lacy-case',
  '#milwaukee-lgbtq-history',
  '#less-dead-framework',
  '#historical-context-synthesis',
  '#birth-and-family-origins',
  '#childhood-health-recollections',
  '#family-instability-divorce',
  '#animal-remains-anatomy',
  '#revere-high-school-alcoholism',
  '#ohio-state-university-dismissal',
  '#us-army-service-counseling',
  '#west-allis-grandmother-residence',
  '#ambrosia-chocolate-employment',
  '#pre-1988-legal-contacts',
  '#probation-supervision-failure',
  '#adolescent-fantasies-jogger',
  '#transition-1978-first-homicide'
];

declaredContextAnchors.forEach(a => {
  const count = (files.contextV03.match(new RegExp(a, 'g')) || []).length;
  // An anchor should appear at least twice: once in the section heading/header list and once in the crosswalk table
  recordTest('task3_anchors', `Context Anchor Definition: ${a}`, count >= 2,
    `found ${count} occurrences in contextV03`);
});

// Check linked timeline event anchors from Context v03 Crosswalk Table
const linkedTimelineAnchors = [
  '#event-1990-oxford-move',
  '#event-1992-oxford-demolition',
  '#event-1991-officer-suspensions',
  '#event-1991-sinthasomphone',
  '#event-1981-bath-arrest',
  '#event-1991-hughes',
  '#event-1991-turner',
  '#event-1960-birth',
  '#event-1978-hicks',
  '#event-1979-army',
  '#event-1987-tuomi-homicide',
  '#event-1988-doxtator',
  '#event-1989-sentencing',
  '#event-1982-state-fair',
  '#event-1986-arrest',
  '#event-1987-conviction'
];

linkedTimelineAnchors.forEach(a => {
  const existsInTimeline = files.timelineV04.includes(a);
  recordTest('task3_anchors', `Timeline Anchor Cross-Reference: ${a}`, existsInTimeline,
    `exists in timelineV04: ${existsInTimeline}`);
});

// Check incoming cross-links from Timeline and Overview to Context
const incomingLinks = [
  { source: '05_timeline_v04', target: '#early-life', path: '/context#early-life' },
  { source: '05_timeline_v04', target: '#military', path: '/context#military' },
  { source: '01_overview_v02', target: '#early-life', path: '/context#early-life' }
];

incomingLinks.forEach(link => {
  const targetExists = files.contextV03.includes(link.target);
  recordTest('task3_anchors', `Incoming Cross-Link Resolution: ${link.source} -> ${link.path}`, targetExists,
    `target anchor ${link.target} exists in contextV03: ${targetExists}`);
});

// Check alternative #ctx-* prefix pattern mentioned in dispatch
const ctxPrefixExamples = [
  '#ctx-econ-deindustrialization',
  '#ctx-seg-indices',
  '#ctx-oxford-apts',
  '#ctx-mpd-governance',
  '#ctx-lgbtq-history',
  '#ctx-bio-early-life',
  '#ctx-edu-military',
  '#ctx-legal-pre1988'
];

ctxPrefixExamples.forEach(ex => {
  const exists = files.contextV03.includes(ex);
  recordTest('task3_anchors', `Dispatch #ctx-* prefix pattern: ${ex}`, exists,
    `exists in contextV03: ${exists}`);
});


// ============================================================================
// TASK 4: REPOSITORY INTEGRITY
// ============================================================================
console.log('\n================== TASK 4: REPOSITORY INTEGRITY ==================');

// Check modification timestamps or pre-existing files
const preexistingFiles = [
  '00_webapp_master_implementation_plan_v04.txt',
  '01_overview_content_plan_v02.txt',
  '02_context_content_plan_v02.txt',
  '03a_case_offense_series_plan_v02.txt',
  '03b_case_investigation_and_trial_plan_v02.txt',
  '04_victims_content_plan_v02.txt',
  '04_victims_content_plan_v05_final_locked.txt',
  '05_timeline_content_plan_v03.txt',
  '05_timeline_content_plan_v04_final_locked.txt',
  'README.md'
];

preexistingFiles.forEach(f => {
  const fullPath = path.join(projectRoot, f);
  const exists = fs.existsSync(fullPath);
  recordTest('task4_file_integrity', `Preexisting file preserved: ${f}`, exists,
    `file exists in plan directory: ${exists}`);
});

// Write summary JSON
fs.writeFileSync(
  path.join(__dirname, 'verification_results.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);
console.log('\nResults written to verification_results.json');
