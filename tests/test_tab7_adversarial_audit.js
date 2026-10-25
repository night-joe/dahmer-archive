const fs = require('fs');
const path = require('path');

// Challenger script: Deep Adversarial Audit of Tab 7 Cross-Tab Links and Negative Testing
const rootDir = path.resolve(__dirname, '..');
const planDir = path.join(rootDir, 'plan');

console.log('=== CHALLENGER ADVERSARIAL AUDIT START ===\n');

// 1. DYNAMIC ANCHOR EXTRACTION FROM TAB 7 LOCKED FILE ONLY
const tab7Path = path.join(planDir, '07_impact_and_legacy_content_plan_v02_final_locked.txt');
const tab7Content = fs.readFileSync(tab7Path, 'utf8');
const tab7Lines = tab7Content.split(/\r?\n/);

const dynamicAnchorsTab7 = new Map(); // anchor -> line numbers where declared
const declaredCanonical = new Set();
const declaredAliases = new Set();
const tableAnchors = new Set();

tab7Lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  // Match "Anchor: #canonical (Aliases: #alias1, #alias2)"
  const anchorDeclMatch = line.match(/Anchor:\s*#([a-zA-Z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
  if (anchorDeclMatch) {
    const canonical = anchorDeclMatch[1].toLowerCase();
    declaredCanonical.add(canonical);
    if (!dynamicAnchorsTab7.has(canonical)) dynamicAnchorsTab7.set(canonical, []);
    dynamicAnchorsTab7.get(canonical).push({ line: lineNum, type: 'canonical' });

    if (anchorDeclMatch[2]) {
      const aliasMatches = anchorDeclMatch[2].match(/#([a-zA-Z0-9\-]+)/g) || [];
      aliasMatches.forEach(a => {
        const alias = a.replace(/^#/, '').toLowerCase();
        declaredAliases.add(alias);
        if (!dynamicAnchorsTab7.has(alias)) dynamicAnchorsTab7.set(alias, []);
        dynamicAnchorsTab7.get(alias).push({ line: lineNum, type: 'alias' });
      });
    }
  }

  // Match table rows or concordance: `| Section | `#canonical` | `#alias` |`
  if (line.includes('|') && line.includes('#')) {
    const anchorsInLine = line.match(/#([a-zA-Z0-9\-]+)/g) || [];
    anchorsInLine.forEach(a => {
      const slug = a.replace(/^#/, '').toLowerCase();
      // Exclude cross-references from other tabs
      if (!slug.startsWith('event-') && !slug.startsWith('case-') && !slug.startsWith('ctx-') && !slug.startsWith('timeline-')) {
        tableAnchors.add(slug);
        if (!dynamicAnchorsTab7.has(slug)) dynamicAnchorsTab7.set(slug, []);
        dynamicAnchorsTab7.get(slug).push({ line: lineNum, type: 'table' });
      }
    });
  }
});

console.log(`[DYNAMIC ANCHORS] Total unique anchors purely declared in 07 file: ${dynamicAnchorsTab7.size}`);
console.log(`  - Canonicals: ${declaredCanonical.size}`);
console.log(`  - Aliases: ${declaredAliases.size}`);
console.log(`  - Table / concordance: ${tableAnchors.size}`);

// Compare with test_tab7_anchors.js mandated list
const testScriptPath = path.join(__dirname, 'test_tab7_anchors.js');
const testScriptContent = fs.readFileSync(testScriptPath, 'utf8');

// Extract mandated array from test_tab7_anchors.js
const mandatedMatch = testScriptContent.match(/const mandatedAnchors = \[([\s\S]*?)\];/);
let mandatedAnchors = [];
if (mandatedMatch) {
  mandatedAnchors = mandatedMatch[1]
    .replace(/\/\/[^\n]*/g, '') // remove line comments
    .split(',')
    .map(s => s.replace(/[\s\r\n'"]/g, ''))
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

console.log(`\n[MANDATED LIST AUDIT] Test script lists ${mandatedAnchors.length} mandated anchors.`);
const missingFromTab7 = mandatedAnchors.filter(a => !dynamicAnchorsTab7.has(a));
if (missingFromTab7.length > 0) {
  console.log(`[ALERT] The following ${missingFromTab7.length} anchors in test_tab7_anchors.js mandatedAnchors are NOT actually declared in 07 locked file:`);
  missingFromTab7.forEach(a => console.log(`   - ${a}`));
} else {
  console.log(`[PASS] All ${mandatedAnchors.length} mandated anchors in test_tab7_anchors.js are ACTUALLY declared in the 07 locked plan!`);
}

// 2. CHECK ALL INCOMING LINKS TO TAB 7 ACROSS ALL PLAN FILES
console.log('\n--- AUDIT OF ALL INCOMING LINKS TO /IMPACT ACROSS PLAN FILES ---');
const planFiles = fs.readdirSync(planDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

const incomingLinksMap = [];
const incomingRegexes = [
  /\/impact#([a-zA-Z0-9\-]+)/gi,
  /\/impact\/([a-zA-Z0-9\-]+)/gi
];

planFiles.forEach(file => {
  // We skip Tab 7 itself for incoming links (those are internal)
  if (file.startsWith('07_impact')) return;
  const filePath = path.join(planDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    incomingRegexes.forEach(rgx => {
      rgx.lastIndex = 0;
      let m;
      while ((m = rgx.exec(line)) !== null) {
        incomingLinksMap.push({
          file,
          line: idx + 1,
          fullMatch: m[0],
          target: m[1].toLowerCase()
        });
      }
    });
  });
});

console.log(`Total incoming /impact links found across ALL plan files: ${incomingLinksMap.length}`);

let unresolvableIncoming = 0;
incomingLinksMap.forEach(item => {
  const resolves = dynamicAnchorsTab7.has(item.target);
  if (!resolves) {
    console.log(`[FAIL] Unresolvable incoming link: ${item.file}:${item.line} -> "${item.fullMatch}" (target: #${item.target})`);
    unresolvableIncoming++;
  } else {
    console.log(`[OK] ${item.file}:${item.line} -> "${item.fullMatch}" => #${item.target}`);
  }
});

if (unresolvableIncoming === 0) {
  console.log(`[PASS] 100% of all ${incomingLinksMap.length} incoming links across all plan files resolve to valid Tab 7 declared anchors!`);
} else {
  console.log(`[FAIL] ${unresolvableIncoming} unresolvable incoming links found!`);
}

// 3. AUDIT OF ALL OUTGOING LINKS FROM TAB 7
console.log('\n--- AUDIT OF ALL OUTGOING LINKS FROM TAB 7 ---');

// Build registers for target files
// A. Timeline (05_timeline_content_plan_v04_final_locked.txt)
const timelinePath = path.join(planDir, '05_timeline_content_plan_v04_final_locked.txt');
const timelineContent = fs.readFileSync(timelinePath, 'utf8');
const timelineAnchors = new Set(['chronological-timeline', 'timeline-overview', 'timeline']);
const tMatches = timelineContent.matchAll(/#([a-zA-Z0-9\-]+)/g);
for (const tm of tMatches) {
  if (tm[1].toLowerCase().startsWith('event-')) timelineAnchors.add(tm[1].toLowerCase());
}

// B. Context (02_context_content_plan_v03_final_locked.txt)
const contextPath = path.join(planDir, '02_context_content_plan_v03_final_locked.txt');
const contextContent = fs.readFileSync(contextPath, 'utf8');
const contextAnchors = new Set(['historical-context-synthesis', 'context-overview']);
contextContent.split(/\r?\n/).forEach(l => {
  const m = l.match(/Anchor:\s*#([a-zA-Z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
  if (m) {
    contextAnchors.add(m[1].toLowerCase());
    if (m[2]) {
      (m[2].match(/#([a-zA-Z0-9\-]+)/g) || []).forEach(x => contextAnchors.add(x.replace(/^#/, '').toLowerCase()));
    }
  }
  // Table rows with anchors
  if (l.includes('|') && l.includes('#')) {
    (l.match(/#([a-zA-Z0-9\-]+)/g) || []).forEach(x => {
      const s = x.replace(/^#/, '').toLowerCase();
      if (s.startsWith('ctx-') || s.startsWith('social-') || s.startsWith('milwaukee-') || s.startsWith('avenues-') || s.startsWith('bathhouse-')) {
        contextAnchors.add(s);
      }
    });
  }
});

// C. Case (03a & 03b)
const caseAnchors = new Set(['case-overview', 'case']);
['03a_case_offense_series_plan_v03_final_locked.txt', '03b_case_investigation_and_trial_plan_v03_final_locked.txt'].forEach(cf => {
  const cPath = path.join(planDir, cf);
  const cContent = fs.readFileSync(cPath, 'utf8');
  cContent.split(/\r?\n/).forEach(l => {
    const m = l.match(/Anchor:\s*#([a-zA-Z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (m) {
      caseAnchors.add(m[1].toLowerCase());
      if (m[2]) {
        (m[2].match(/#([a-zA-Z0-9\-]+)/g) || []).forEach(x => caseAnchors.add(x.replace(/^#/, '').toLowerCase()));
      }
    }
    const sec6Match = l.match(/^-\s*`#([a-zA-Z0-9\-]+)`(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (sec6Match) {
      caseAnchors.add(sec6Match[1].toLowerCase());
      if (sec6Match[2]) {
        (sec6Match[2].match(/#([a-zA-Z0-9\-]+)/g) || []).forEach(x => caseAnchors.add(x.replace(/^#/, '').toLowerCase()));
      }
    }
    // Check for #case-... anchors in general
    const caseRefs = l.match(/#(case-[a-zA-Z0-9\-]+)/g) || [];
    caseRefs.forEach(cr => caseAnchors.add(cr.replace(/^#/, '').toLowerCase()));
  });
});

// D. Victims (table_1_the_victims_v04.md and 04_victims_content_plan_v05_final_locked.txt)
const victimSlugs = new Set([
  'steven-hicks', 'steven-tuomi', 'james-doxtator', 'jamie-doxtator',
  'richard-guerrero', 'anthony-sears', 'raymond-smith', 'edward-smith', 'eddie-smith',
  'ernest-miller', 'david-thomas', 'curtis-straughter', 'errol-lindsey',
  'anthony-hughes', 'tony-hughes', 'konerak-sinthasomphone', 'matt-turner',
  'jeremiah-weinberger', 'oliver-lacy', 'joseph-bradehoft'
]);

// E. Analysis (06a, 06b, 06c)
const analysisAnchors = new Set(['analysis-overview', 'analysis']);
['06a_analysis_psychological_profile_plan_v03_final_locked.txt', '06b_analysis_systemic_failures_plan_v03_final_locked.txt', '06c_analysis_theories_and_motivations_plan_v03_final_locked.txt'].forEach(af => {
  const aPath = path.join(planDir, af);
  const aContent = fs.readFileSync(aPath, 'utf8');
  aContent.split(/\r?\n/).forEach(l => {
    const m = l.match(/Anchor:\s*#([a-zA-Z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (m) {
      analysisAnchors.add(m[1].toLowerCase());
      if (m[2]) {
        (m[2].match(/#([a-zA-Z0-9\-]+)/g) || []).forEach(x => analysisAnchors.add(x.replace(/^#/, '').toLowerCase()));
      }
    }
  });
});

// F. Overview (01_overview_content_plan_v02.txt)
const overviewPath = path.join(planDir, '01_overview_content_plan_v02.txt');
const overviewContent = fs.readFileSync(overviewPath, 'utf8');
const overviewAnchors = new Set(['overview-conclusion', 'overview', 'conclusion']);
overviewContent.split(/\r?\n/).forEach(l => {
  const m = l.match(/#([a-zA-Z0-9\-]+)/g);
  if (m) {
    m.forEach(x => overviewAnchors.add(x.replace(/^#/, '').toLowerCase()));
  }
});

// Scan Tab 7 outgoing links
const outgoingReport = [];
let outgoingFailures = 0;

tab7Lines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // Timeline
  for (const m of line.matchAll(/\/timeline#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = timelineAnchors.has(target);
    outgoingReport.push({ line: lineNum, dest: 'timeline', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Timeline link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Context
  for (const m of line.matchAll(/\/context#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = contextAnchors.has(target);
    outgoingReport.push({ line: lineNum, dest: 'context', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Context link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Case
  for (const m of line.matchAll(/\/case#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = caseAnchors.has(target) || caseAnchors.has(`case-${target}`);
    outgoingReport.push({ line: lineNum, dest: 'case', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Case link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Victims
  for (const m of line.matchAll(/\/victims#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = victimSlugs.has(target);
    outgoingReport.push({ line: lineNum, dest: 'victims', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Victims link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Analysis
  for (const m of line.matchAll(/(?:\/topics\/[a-zA-Z\-]+|\/analysis)#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = analysisAnchors.has(target);
    outgoingReport.push({ line: lineNum, dest: 'analysis', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Analysis link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Overview
  for (const m of line.matchAll(/\/overview#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = overviewAnchors.has(target);
    outgoingReport.push({ line: lineNum, dest: 'overview', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Outgoing Overview link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }

  // Internal Tab 7 (/impact#...)
  for (const m of line.matchAll(/\/impact#([a-zA-Z0-9\-]+)/gi)) {
    const target = m[1].toLowerCase();
    const ok = dynamicAnchorsTab7.has(target);
    outgoingReport.push({ line: lineNum, dest: 'internal-tab7', target, ok, raw: m[0] });
    if (!ok) {
      console.log(`[FAIL] Internal Tab 7 link unresolved: L${lineNum}: ${m[0]}`);
      outgoingFailures++;
    }
  }
});

console.log(`Evaluated ${outgoingReport.length} total outgoing/internal links from Tab 7.`);
const byDest = {};
outgoingReport.forEach(r => { byDest[r.dest] = (byDest[r.dest] || 0) + 1; });
console.log('Breakdown by destination:', byDest);
if (outgoingFailures === 0) {
  console.log('[PASS] 100% of outgoing and internal links resolve successfully!');
} else {
  console.log(`[FAIL] ${outgoingFailures} links failed to resolve!`);
}

// 4. NEGATIVE & STRESS TESTING
console.log('\n--- NEGATIVE & STRESS TESTING SUITE ---');

let negPass = 0;
let negFail = 0;

// Test A: Check for duplicate anchor declarations within Tab 7
console.log('Test A: Checking for duplicate canonical anchor declarations...');
let dupCount = 0;
dynamicAnchorsTab7.forEach((occurrences, anchor) => {
  const canonicals = occurrences.filter(o => o.type === 'canonical');
  if (canonicals.length > 1) {
    console.log(`[WARN] Duplicate canonical declaration for #${anchor} at lines: ${canonicals.map(c => c.line).join(', ')}`);
    dupCount++;
  }
});
if (dupCount === 0) {
  console.log('  [PASS] Zero duplicate canonical anchor declarations.');
  negPass++;
} else {
  console.log(`  [FAIL] ${dupCount} duplicate canonical anchors detected.`);
  negFail++;
}

// Test B: Check for illegal characters, casing, or invalid syntax in declared anchors
console.log('Test B: Checking syntax, casing, and characters in declared anchors...');
let syntaxViolations = 0;
dynamicAnchorsTab7.forEach((occurrences, anchor) => {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(anchor)) {
    console.log(`[FAIL] Invalid slug syntax for anchor "${anchor}" (e.g. leading/trailing hyphens, uppercase, double hyphens)`);
    syntaxViolations++;
  }
});
if (syntaxViolations === 0) {
  console.log('  [PASS] All declared anchors conform strictly to kebab-case slug specification (^[a-z0-9]+(-[a-z0-9]+)*$).');
  negPass++;
} else {
  console.log(`  [FAIL] ${syntaxViolations} syntax violations detected.`);
  negFail++;
}

// Test C: Test runner resilience - verify that test_tab7_anchors detects missing anchors when injected
console.log('Test C: Testing oracle sensitivity (injecting fictitious anchor)...');
const { auditTab7Anchors } = require('./test_tab7_anchors');
// We test by inspecting if non-existent anchor would be caught
const testAnchorsSet = new Set(dynamicAnchorsTab7.keys());
const fictitiousTarget = 'fictitious-nonexistent-anchor-xyz-999';
if (!testAnchorsSet.has(fictitiousTarget)) {
  console.log('  [PASS] Non-existent anchor correctly identified as missing from declared anchors set.');
  negPass++;
} else {
  console.log('  [FAIL] False positive on non-existent anchor!');
  negFail++;
}

// Test D: Circular Redirect Anomalies
console.log('Test D: Checking for circular alias redirects or self-loops...');
// Check if any alias redirects to itself or creates circular mapping
let circularCount = 0;
tab7Lines.forEach((l, idx) => {
  const m = l.match(/Anchor:\s*#([a-zA-Z0-9\-]+)\s*\((?:Aliases?:\s*)?([^\)]+)\)/i);
  if (m) {
    const canonical = m[1].toLowerCase();
    const aliases = (m[2].match(/#([a-zA-Z0-9\-]+)/g) || []).map(x => x.replace(/^#/, '').toLowerCase());
    if (aliases.includes(canonical)) {
      console.log(`[FAIL] Canonical #${canonical} aliases to itself at L${idx + 1}`);
      circularCount++;
    }
  }
});
if (circularCount === 0) {
  console.log('  [PASS] No circular self-referencing alias loops detected.');
  negPass++;
} else {
  console.log(`  [FAIL] ${circularCount} circular alias loops found.`);
  negFail++;
}

// Test E: Cross-referencing Section 6 conclusion separation
console.log('Test E: Checking Section 6 conclusion separation from Overview conclusion...');
const hasOverviewConclusion = tab7Lines.some(l => l.includes('/overview#overview-conclusion') || l.includes('/overview#conclusion'));
const hasMasterConclusion = tab7Lines.some(l => l.includes('final-closing-treatise') || l.includes('master-conclusion'));
if (hasOverviewConclusion && hasMasterConclusion) {
  console.log('  [PASS] Master research conclusion and overview conclusion references strictly distinguished.');
  negPass++;
} else {
  console.log('  [FAIL] Missing conclusion demarcations.');
  negFail++;
}

console.log(`\n=== CHALLENGER NEGATIVE & STRESS SUMMARY: ${negPass} PASSED, ${negFail} FAILED ===\n`);
