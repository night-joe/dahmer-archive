const fs = require('fs');
const path = require('path');

const limits = {
  1: 68,
  3: 60,
  6: 74
};

const targetFiles = [
  'plan/03a_case_offense_series_plan_v03_final_locked.txt',
  'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
  'plan/08_case_final_bibliography_v01.txt',
  'plan/table_1_the_victims_v04.md',
  'plan/05_timeline_content_plan_v04_final_locked.txt',
  'plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt',
  'plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt',
  'plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt',
  'plan/08_analysis_final_bibliography_v01.txt',
  'plan/07_impact_and_legacy_content_plan_v02_final_locked.txt'
];

function auditFBICitations() {
  console.log('================================================================================');
  console.log('EMPIRICAL AUDIT: FBI VAULT PDF COORDINATE BOUNDARIES');
  console.log('================================================================================');

  let allPassed = true;
  const grandTotal = {
    citations: 0,
    pageReferences: 0,
    violations: []
  };

  const fileReports = [];

  for (const relPath of targetFiles) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`ERROR: File not found: ${relPath}`);
      allPassed = false;
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split(/\r?\n/);

    const report = {
      file: relPath,
      citationCount: 0,
      pageRefCount: 0,
      partStats: {
        1: { count: 0, pages: new Set(), maxPage: 0, minPage: 999 },
        3: { count: 0, pages: new Set(), maxPage: 0, minPage: 999 },
        6: { count: 0, pages: new Set(), maxPage: 0, minPage: 999 }
      },
      unrecognizedParts: [],
      violations: []
    };

    // Regex to match Part / Pt notations with page references
    const regex = /(?:(?:FBI(?:\s+Vault)?\s+)?\b(?:Part|Pt)\b\s*0*([1-9]\d?)[^\n\r\]\)]*?(?:p\.|pp\.|page|pages)\s*([0-9\s,\–\-]+))/gi;

    lines.forEach((line, lineIdx) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        report.citationCount++;
        grandTotal.citations++;
        const part = parseInt(match[1], 10);
        const rawPages = match[2];
        const matchSnippet = match[0];

        if (!limits[part]) {
          report.unrecognizedParts.push({
            line: lineIdx + 1,
            part,
            snippet: matchSnippet,
            context: line.trim()
          });
          report.violations.push({
            line: lineIdx + 1,
            type: 'UNRECOGNIZED_PART',
            part,
            snippet: matchSnippet
          });
          allPassed = false;
          continue;
        }

        const items = rawPages.split(',').map(s => s.trim()).filter(Boolean);
        for (const item of items) {
          const rangeParts = item.split(/[–\-]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          if (rangeParts.length === 0) continue;

          let start = rangeParts[0];
          let end = rangeParts.length > 1 ? rangeParts[1] : start;

          if (start > end) {
            const tmp = start; start = end; end = tmp;
          }

          for (let p = start; p <= end; p++) {
            report.pageRefCount++;
            grandTotal.pageReferences++;
            const stats = report.partStats[part];
            stats.count++;
            stats.pages.add(p);
            if (p > stats.maxPage) stats.maxPage = p;
            if (p < stats.minPage) stats.minPage = p;

            if (p < 1 || p > limits[part]) {
              const violation = {
                file: relPath,
                line: lineIdx + 1,
                part,
                page: p,
                limit: limits[part],
                snippet: matchSnippet,
                context: line.trim()
              };
              report.violations.push(violation);
              grandTotal.violations.push(violation);
              allPassed = false;
            }
          }
        }
      }
    });

    fileReports.push(report);
  }

  // Print results
  for (const rep of fileReports) {
    console.log(`\nFile: ${rep.file}`);
    console.log(`  - Total Citations: ${rep.citationCount}`);
    console.log(`  - Total Page References Evaluated: ${rep.pageRefCount}`);
    [1, 3, 6].forEach(pt => {
      const s = rep.partStats[pt];
      const pagesArray = Array.from(s.pages).sort((a, b) => a - b);
      if (pagesArray.length > 0) {
        console.log(`  - Part 0${pt} (Limit: <= ${limits[pt]}): ${s.count} refs across ${pagesArray.length} unique pages [min: ${s.minPage}, max: ${s.maxPage}]`);
        console.log(`    Pages: ${pagesArray.join(', ')}`);
      } else {
        console.log(`  - Part 0${pt} (Limit: <= ${limits[pt]}): 0 refs`);
      }
    });

    if (rep.unrecognizedParts.length > 0) {
      console.log(`  - [FAIL] Unrecognized Parts Cited: ${rep.unrecognizedParts.length}`);
      rep.unrecognizedParts.forEach(u => {
        console.log(`    Line ${u.line}: Part ${u.part} -> "${u.snippet}"`);
      });
    }

    if (rep.violations.length > 0) {
      console.log(`  - [FAIL] Coordinate Boundary Violations: ${rep.violations.length}`);
      rep.violations.forEach(v => {
        console.log(`    Line ${v.line}: Part 0${v.part} Page ${v.page} exceeds limit ${v.limit}! Snippet: "${v.snippet}"`);
      });
    } else {
      console.log(`  - [PASS] All coordinates strictly within PDF boundaries.`);
    }
  }

  console.log('\n--------------------------------------------------------------------------------');
  console.log('GRAND TOTALS:');
  console.log(`  - Total Citations Found: ${grandTotal.citations}`);
  console.log(`  - Total Page References Checked: ${grandTotal.pageReferences}`);
  console.log(`  - Total Violations: ${grandTotal.violations.length}`);
  console.log(`  - OVERALL STATUS: ${allPassed ? 'PASS (VERIFIED)' : 'FAIL (VIOLATIONS DETECTED)'}`);
  console.log('--------------------------------------------------------------------------------');

  return { passed: allPassed, grandTotal, fileReports };
}

if (require.main === module) {
  const result = auditFBICitations();
  process.exit(result.passed ? 0 : 1);
}

module.exports = { auditFBICitations, limits };
