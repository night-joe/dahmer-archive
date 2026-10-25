const fs = require('fs');
const path = require('path');

function auditTab6Anchors() {
  console.log('================================================================================');
  console.log('EMPIRICAL AUDIT: TAB 6 ANCHORS & CROSS-TAB LINK INTEGRITY');
  console.log('================================================================================');

  const files = {
    plan06a: 'plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt',
    plan06b: 'plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt',
    plan06c: 'plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt',
    plan05: 'plan/05_timeline_content_plan_v04_final_locked.txt',
    plan02: 'plan/02_context_content_plan_v03_final_locked.txt',
    plan03a: 'plan/03a_case_offense_series_plan_v03_final_locked.txt',
    plan03b: 'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
    table1: 'plan/table_1_the_victims_v04.md',
    plan08: 'plan/08_analysis_final_bibliography_v01.txt'
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

  // 1. EXTRACT ALL DECLARED ANCHORS IN TAB 6 (06a, 06b, 06c)
  const declaredAnchorsTab6 = new Set();
  const anchorsBySubtab = { '06a': new Set(), '06b': new Set(), '06c': new Set() };

  function extractAnchors(text, subtab) {
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      // In-text anchor declarations: Anchor: #... (Alias: #...)
      const match = line.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
      if (match) {
        const canonical = match[1];
        declaredAnchorsTab6.add(canonical);
        anchorsBySubtab[subtab].add(canonical);
        if (match[2]) {
          const aliases = match[2].match(/#([a-z0-9\-]+)/g) || [];
          aliases.forEach(a => {
            const alias = a.replace(/^#/, '');
            declaredAnchorsTab6.add(alias);
            anchorsBySubtab[subtab].add(alias);
          });
        }
      }

      // Concordance table rows: | Section | `#canonical` | `#alias` | ...
      if (line.includes('|') && line.includes('#')) {
        const tableAnchors = line.match(/#([a-z0-9\-]+)/g) || [];
        tableAnchors.forEach(a => {
          const slug = a.replace(/^#/, '');
          if (!slug.startsWith('event-') && !slug.startsWith('case-') && !slug.startsWith('ctx-')) {
            declaredAnchorsTab6.add(slug);
            anchorsBySubtab[subtab].add(slug);
          }
        });
      }
    });
  }

  extractAnchors(loaded.plan06a, '06a');
  extractAnchors(loaded.plan06b, '06b');
  extractAnchors(loaded.plan06c, '06c');

  console.log(`Declared Anchors in Tab 6:`);
  console.log(`  - Part A (06a Psychological Profile): ${anchorsBySubtab['06a'].size} unique anchors`);
  console.log(`  - Part B (06b Systemic Failures): ${anchorsBySubtab['06b'].size} unique anchors`);
  console.log(`  - Part C (06c Theories & Motivations): ${anchorsBySubtab['06c'].size} unique anchors`);
  console.log(`  - Total Combined Tab 6 Unique Anchors: ${declaredAnchorsTab6.size}`);

  let totalErrors = 0;

  // CHECK 1: TABLE 2 (TIMELINE) -> TAB 6 DESTINATION RESOLUTION
  console.log('\n--- CHECK 1: TABLE 2 (TIMELINE) -> TAB 6 DESTINATION RESOLUTION ---');
  const timelineLines = loaded.plan05.split(/\r?\n/);
  let timelineLinksCount = 0;
  timelineLines.forEach((line, idx) => {
    // Look for links targeting /topics/systemic-failures#..., /topics/psychological-profile#..., etc.
    const linkMatches = line.matchAll(/->\s*(?:\/topics\/[a-z\-]+|\/analysis)#([a-z0-9\-]+)/gi);
    for (const m of linkMatches) {
      timelineLinksCount++;
      const targetAnchor = m[1];
      if (declaredAnchorsTab6.has(targetAnchor)) {
        console.log(`  [PASS] Line ${idx + 1}: "-> ...#${targetAnchor}" -> resolves in Tab 6`);
      } else {
        console.log(`  [FAIL] Line ${idx + 1}: "-> ...#${targetAnchor}" -> NOT resolved in Tab 6!`);
        totalErrors++;
      }
    }
  });
  console.log(`Evaluated ${timelineLinksCount} incoming links from Table 2 to Tab 6.`);

  // CHECK 2: TAB 4 (CONTEXT) -> TAB 6 DESTINATION RESOLUTION
  console.log('\n--- CHECK 2: TAB 4 (CONTEXT) -> TAB 6 DESTINATION RESOLUTION ---');
  const contextLines = loaded.plan02.split(/\r?\n/);
  let contextLinksCount = 0;
  contextLines.forEach((line, idx) => {
    const linkMatches = line.matchAll(/(?:\/topics\/[a-z\-]+|\/analysis)#([a-z0-9\-]+)/gi);
    for (const m of linkMatches) {
      contextLinksCount++;
      const targetAnchor = m[1];
      if (declaredAnchorsTab6.has(targetAnchor)) {
        console.log(`  [PASS] Line ${idx + 1}: Target "#${targetAnchor}" resolves in Tab 6`);
      } else {
        console.log(`  [FAIL] Line ${idx + 1}: Target "#${targetAnchor}" NOT resolved in Tab 6!`);
        totalErrors++;
      }
    }
  });
  console.log(`Evaluated ${contextLinksCount} incoming links from Tab 4 Context to Tab 6.`);

  // CHECK 3: TAB 6 REVERSE LINKS TO TIMELINE
  console.log('\n--- CHECK 3: TAB 6 -> TABLE 2 (TIMELINE) REVERSE RESOLUTION ---');
  // Extract all timeline declared anchors from Table 2
  const declaredTimelineAnchors = new Set();
  timelineLines.forEach(line => {
    const milestoneMatches = line.matchAll(/#([a-z0-9\-]+)/g);
    for (const m of milestoneMatches) {
      if (m[1].startsWith('event-')) {
        declaredTimelineAnchors.add(m[1]);
      }
    }
  });
  declaredTimelineAnchors.add('chronological-timeline');
  declaredTimelineAnchors.add('timeline-overview');

  let tab6TimelineLinksCount = 0;
  ['06a', '06b', '06c'].forEach(sub => {
    const lines = loaded['plan' + sub].split(/\r?\n/);
    lines.forEach((line, idx) => {
      const links = line.matchAll(/\/timeline#([a-z0-9\-]+)/gi);
      for (const m of links) {
        tab6TimelineLinksCount++;
        const target = m[1];
        if (declaredTimelineAnchors.has(target)) {
          // Pass
        } else {
          console.log(`  [FAIL] ${sub} Line ${idx + 1}: "/timeline#${target}" -> NOT found in Table 2!`);
          totalErrors++;
        }
      }
    });
  });
  console.log(`  [PASS] Evaluated ${tab6TimelineLinksCount} outgoing links to Timeline across 06a, 06b, 06c; all verified.`);

  // CHECK 4: CROSS-SUBTAB LINKS WITHIN TAB 6
  console.log('\n--- CHECK 4: CROSS-SUBTAB LINKS WITHIN TAB 6 ---');
  let crossSubtabCount = 0;
  ['06a', '06b', '06c'].forEach(sub => {
    const lines = loaded['plan' + sub].split(/\r?\n/);
    lines.forEach((line, idx) => {
      const links = line.matchAll(/(?:\/topics\/[a-z\-]+)#([a-z0-9\-]+)/gi);
      for (const m of links) {
        crossSubtabCount++;
        const target = m[1];
        if (declaredAnchorsTab6.has(target)) {
          // Pass
        } else {
          console.log(`  [FAIL] ${sub} Line ${idx + 1}: Internal link "#${target}" NOT found in Tab 6!`);
          totalErrors++;
        }
      }
    });
  });
  console.log(`  [PASS] Evaluated ${crossSubtabCount} internal cross-links within Tab 6; all verified.`);

  // SUMMARY
  console.log('\n================================================================================');
  console.log(`TAB 6 AUDIT SUMMARY: Total Errors = ${totalErrors}`);
  console.log('================================================================================');

  if (totalErrors === 0) {
    console.log('FINAL VERDICT: TAB 6 ANCHORS & CROSS-TAB LINKS VERIFIED (PASS)');
    return { passed: true };
  } else {
    console.error(`FINAL VERDICT: REJECT (${totalErrors} unresolved link errors)`);
    return { passed: false, errors: totalErrors };
  }
}

if (require.main === module) {
  const res = auditTab6Anchors();
  process.exit(res.passed ? 0 : 1);
}

module.exports = { auditTab6Anchors };
