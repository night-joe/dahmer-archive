const fs = require('fs');
const path = require('path');

function auditTab5Anchors() {
  console.log('================================================================================');
  console.log('EMPIRICAL AUDIT: TAB 5 ANCHORS & CROSS-TAB LINK INTEGRITY');
  console.log('================================================================================');

  const files = {
    plan03a: 'plan/03a_case_offense_series_plan_v03_final_locked.txt',
    plan03b: 'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
    plan05: 'plan/05_timeline_content_plan_v04_final_locked.txt',
    table1: 'plan/table_1_the_victims_v04.md',
    plan08: 'plan/08_case_final_bibliography_v01.txt'
  };

  const loaded = {};
  for (const [k, relPath] of Object.entries(files)) {
    const full = path.resolve(relPath);
    if (!fs.existsSync(full)) {
      console.error(`ERROR: File missing: ${relPath}`);
      return { passed: false, error: `File missing: ${relPath}` };
    }
    loaded[k] = fs.readFileSync(full, 'utf8');
  }

  // 1. EXTRACT ALL DECLARED ANCHORS IN TAB 5 PART A (03a)
  const declaredAnchors03a = new Set();
  const rawAnchors03aList = [];

  // Parse Section 7 table in 03a
  const lines03a = loaded.plan03a.split(/\r?\n/);
  lines03a.forEach((line, idx) => {
    // In-text anchor declarations like: Anchor: #... (Alias: #...)
    const anchorDeclMatch = line.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (anchorDeclMatch) {
      const canonical = anchorDeclMatch[1];
      declaredAnchors03a.add(canonical);
      rawAnchors03aList.push({ line: idx + 1, anchor: canonical, type: 'in-text canonical' });
      if (anchorDeclMatch[2]) {
        const aliases = anchorDeclMatch[2].match(/#([a-z0-9\-]+)/g) || [];
        aliases.forEach(a => {
          const alias = a.replace(/^#/, '');
          declaredAnchors03a.add(alias);
          rawAnchors03aList.push({ line: idx + 1, anchor: alias, type: 'in-text alias' });
        });
      }
    }

    // Section 7 Table rows: | Section Name | #canonical | #alias | ...
    if (line.includes('|') && line.includes('#case-')) {
      const anchorsInLine = line.match(/#([a-z0-9\-]+)/g) || [];
      anchorsInLine.forEach(a => {
        const slug = a.replace(/^#/, '');
        // Exclude destination anchors to other tabs (event-*)
        if (!slug.startsWith('event-')) {
          declaredAnchors03a.add(slug);
        }
      });
    }
  });

  // 2. EXTRACT ALL DECLARED ANCHORS IN TAB 5 PART B (03b)
  const declaredAnchors03b = new Set();
  const rawAnchors03bList = [];

  const lines03b = loaded.plan03b.split(/\r?\n/);
  lines03b.forEach((line, idx) => {
    // In-text anchor declarations: Anchor: #... (Alias: #...)
    const anchorDeclMatch = line.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (anchorDeclMatch) {
      const canonical = anchorDeclMatch[1];
      declaredAnchors03b.add(canonical);
      rawAnchors03bList.push({ line: idx + 1, anchor: canonical, type: 'in-text canonical' });
      if (anchorDeclMatch[2]) {
        const aliases = anchorDeclMatch[2].match(/#([a-z0-9\-]+)/g) || [];
        aliases.forEach(a => {
          const alias = a.replace(/^#/, '');
          declaredAnchors03b.add(alias);
          rawAnchors03bList.push({ line: idx + 1, anchor: alias, type: 'in-text alias' });
        });
      }
    }

    // Section 6.1 list items: - `#canonical` (Alias: `#alias`)
    const sec6Match = line.match(/^-\s*`#([a-z0-9\-]+)`(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (sec6Match) {
      const canonical = sec6Match[1];
      declaredAnchors03b.add(canonical);
      if (sec6Match[2]) {
        const aliases = sec6Match[2].match(/#([a-z0-9\-]+)/g) || [];
        aliases.forEach(a => {
          const alias = a.replace(/^#/, '');
          declaredAnchors03b.add(alias);
        });
      }
    }
  });

  // Unified Tab 5 Anchors
  const allTab5Anchors = new Set([...declaredAnchors03a, ...declaredAnchors03b]);

  console.log(`\nDeclared Anchors in Tab 5:`);
  console.log(`  - Part A (03a) Unique Anchors: ${declaredAnchors03a.size}`);
  console.log(`  - Part B (03b) Unique Anchors: ${declaredAnchors03b.size}`);
  console.log(`  - Total Combined Tab 5 Unique Anchors: ${allTab5Anchors.size}`);

  // 3. CHECK TABLE 2 (TIMELINE) -> TAB 5 RESOLUTION
  console.log(`\n--- CHECK 1: TABLE 2 (TIMELINE) -> TAB 5 DESTINATION RESOLUTION ---`);
  const timelineCaseLinks = [];
  const lines05 = loaded.plan05.split(/\r?\n/);
  lines05.forEach((line, idx) => {
    const match = line.match(/->\s*\/case#([a-z0-9\-]+)/i);
    if (match) {
      timelineCaseLinks.push({ line: idx + 1, target: match[1], full: match[0], context: line.trim() });
    }
  });

  console.log(`Found ${timelineCaseLinks.length} incoming links to /case#... from Table 2.`);
  const failedTimelineLinks = [];
  timelineCaseLinks.forEach(item => {
    const target = item.target;
    // Check if target is directly in Tab 5 anchors, or with 'case-' prefix
    const resolves = allTab5Anchors.has(target) || allTab5Anchors.has(`case-${target}`);
    if (resolves) {
      const matched = allTab5Anchors.has(target) ? target : `case-${target}`;
      console.log(`  [PASS] Line ${item.line}: "${item.full}" -> resolves to #${matched}`);
    } else {
      console.error(`  [FAIL] Line ${item.line}: "${item.full}" -> UNRESOLVED`);
      failedTimelineLinks.push(item);
    }
  });

  // 4. CHECK TAB 5 -> TABLE 2 (TIMELINE) REVERSE RESOLUTION
  console.log(`\n--- CHECK 2: TAB 5 -> TABLE 2 (TIMELINE) REVERSE RESOLUTION ---`);
  const declaredTimelineAnchors = new Set();
  lines05.forEach(line => {
    const m = line.match(/#event-[a-z0-9\-]+/gi);
    if (m) m.forEach(a => declaredTimelineAnchors.add(a.toLowerCase()));
  });
  console.log(`Table 2 declares ${declaredTimelineAnchors.size} milestone anchor IDs.`);

  // Check 03a -> Timeline
  const timelineLinksIn03a = loaded.plan03a.match(/\/timeline#(event-[a-z0-9\-]+)/gi) || [];
  console.log(`\nChecking 03a outgoing links to Timeline (${timelineLinksIn03a.length} links):`);
  const failedTimelineLinksIn03a = [];
  timelineLinksIn03a.forEach(link => {
    const anchor = '#' + link.split('#')[1].toLowerCase();
    const exists = declaredTimelineAnchors.has(anchor);
    if (!exists) {
      console.error(`  [FAIL] Unresolved link in 03a: ${link}`);
      failedTimelineLinksIn03a.push(link);
    }
  });
  if (failedTimelineLinksIn03a.length === 0) {
    console.log(`  [PASS] All ${timelineLinksIn03a.length} timeline links in 03a resolve in Table 2.`);
  }

  // Check 03b -> Timeline
  // Section 6.2 lists: - `#event-...` -> Links from Section ...
  const timelineLinksIn03b = loaded.plan03b.match(/#(event-[a-z0-9\-]+)/gi) || [];
  console.log(`\nChecking 03b outgoing links to Timeline (${timelineLinksIn03b.length} links):`);
  const failedTimelineLinksIn03b = [];
  timelineLinksIn03b.forEach(link => {
    const anchor = link.toLowerCase();
    const exists = declaredTimelineAnchors.has(anchor);
    if (!exists) {
      console.error(`  [FAIL] Unresolved link in 03b: ${link}`);
      failedTimelineLinksIn03b.push(link);
    }
  });
  if (failedTimelineLinksIn03b.length === 0) {
    console.log(`  [PASS] All ${timelineLinksIn03b.length} timeline links in 03b resolve in Table 2.`);
  }

  // 5. CHECK CROSS-TAB INTER-SPEC LINKS (03a -> 03b)
  console.log(`\n--- CHECK 3: SUB-TAB CROSS-LINK INTEGRITY (03a -> 03b) ---`);
  // Check lines in 03a that link into /case/investigation#...
  const crossSubtabLinks = [];
  lines03a.forEach((line, idx) => {
    const match = line.match(/\/case\/investigation#([a-z0-9\-]+)/i);
    if (match) {
      crossSubtabLinks.push({ line: idx + 1, target: match[1], full: match[0], context: line.trim() });
    }
  });

  console.log(`Found ${crossSubtabLinks.length} cross-subtab links from 03a into 03b (/case/investigation#...):`);
  const failedCrossSubtab = [];
  crossSubtabLinks.forEach(item => {
    const target = item.target;
    const in03b = declaredAnchors03b.has(target) || declaredAnchors03b.has(`case-${target}`);
    if (in03b) {
      console.log(`  [PASS] Line ${item.line}: "${item.full}" -> resolves in 03b`);
    } else {
      console.error(`  [MISMATCH] Line ${item.line}: "${item.full}" -> Target "#${target}" is NOT declared in 03b!`);
      failedCrossSubtab.push(item);
    }
  });

  // 6. SUMMARY & VERDICT
  console.log('\n================================================================================');
  console.log('AUDIT SUMMARY METRICS:');
  console.log(`  - Table 2 -> Tab 5 Destinations Evaluated: ${timelineCaseLinks.length}`);
  console.log(`  - Table 2 -> Tab 5 Unresolved Failures: ${failedTimelineLinks.length}`);
  console.log(`  - Tab 5 -> Table 2 Reverse Destinations Evaluated: ${timelineLinksIn03a.length + timelineLinksIn03b.length}`);
  console.log(`  - Tab 5 -> Table 2 Unresolved Failures: ${failedTimelineLinksIn03a.length + failedTimelineLinksIn03b.length}`);
  console.log(`  - Tab 5 Part A -> Part B Cross-Subtab Links Evaluated: ${crossSubtabLinks.length}`);
  console.log(`  - Tab 5 Part A -> Part B Anchor Mismatches: ${failedCrossSubtab.length}`);
  console.log('================================================================================');

  const overallPassed = (failedTimelineLinks.length === 0) &&
                        (failedTimelineLinksIn03a.length === 0) &&
                        (failedTimelineLinksIn03b.length === 0);

  return {
    passed: overallPassed,
    hasSubtabMismatches: failedCrossSubtab.length > 0,
    failedTimelineLinks,
    failedTimelineLinksIn03a,
    failedTimelineLinksIn03b,
    failedCrossSubtab
  };
}

if (require.main === module) {
  const res = auditTab5Anchors();
  process.exit(res.passed ? 0 : 1);
}

module.exports = { auditTab5Anchors };
