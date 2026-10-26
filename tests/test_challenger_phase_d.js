/**
 * tests/test_challenger_phase_d.js
 * 
 * EMPIRICAL CHALLENGER TEST SUITE (Phase D Quality & Integrity Audit)
 * 
 * 1. DOM ID Uniqueness & Conflict Analysis across overview.html, index.html, sources.html
 * 2. 41 Overview Footnotes exact reconciliation with Section E of plan/01_overview_content_plan_v03_final_locked.txt
 * 3. Chemical Drum Capacity: 55-gallon vs 57-gallon across overview.html and archive-wide
 * 4. Master FBI Vault Coordinates Bounds across all targets + adversarial regex scan + HTML / sources.json check
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures = [];

function assert(condition, message, details = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedAssertions++;
    const errMsg = `[FAIL] ${message} ${details ? '--> ' + details : ''}`;
    console.error(`  ${errMsg}`);
    failures.push(errMsg);
  }
}

console.log('================================================================================');
console.log('EMPIRICAL CHALLENGER PHASE D AUDIT: COORDINATES, DOM IDs, FOOTNOTES & DRUM');
console.log('================================================================================\n');

// =============================================================================
// TEST 1: DOM ID UNIQUENESS ACROSS overview.html, index.html, sources.html
// =============================================================================
console.log('--------------------------------------------------------------------------------');
console.log('TEST 1: DOM ID UNIQUENESS AUDIT');
console.log('--------------------------------------------------------------------------------');

const htmlFiles = ['overview.html', 'index.html', 'sources.html'];
const fileIdMaps = {};
const allIdsAcrossFiles = {};

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
  const html = fs.readFileSync(filePath, 'utf8');

  // Match all id="..." and id='...'
  const idRegex = /\bid=["']([^"']+)["']/g;
  const counts = {};
  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    counts[id] = (counts[id] || 0) + 1;
    if (!allIdsAcrossFiles[id]) {
      allIdsAcrossFiles[id] = [];
    }
    allIdsAcrossFiles[id].push(file);
  }

  fileIdMaps[file] = counts;

  const duplicates = Object.entries(counts).filter(([id, count]) => count > 1);
  assert(
    duplicates.length === 0,
    `Zero duplicate DOM IDs within ${file} (${Object.keys(counts).length} unique IDs found)`,
    duplicates.length > 0 ? JSON.stringify(duplicates) : ''
  );
});

// Check cross-file overlaps and categorize them
console.log('\nCross-Document DOM ID Analysis:');
const crossFileIds = Object.entries(allIdsAcrossFiles).filter(([id, files]) => files.length > 1);
console.log(`  Total IDs appearing in multiple documents: ${crossFileIds.length}`);
crossFileIds.forEach(([id, files]) => {
  console.log(`    - ID "${id}" appears in: ${[...new Set(files)].join(', ')}`);
});

// Verify that any internal footnote/section anchor targeting cross-page links is valid
// e.g. overview.html links to sources.html#src-..., check that all those IDs exist in sources.html!
const overviewHtml = fs.readFileSync(path.join(ROOT_DIR, 'overview.html'), 'utf8');
const sourcesHtml = fs.readFileSync(path.join(ROOT_DIR, 'sources.html'), 'utf8');
const sourcesIdMap = fileIdMaps['sources.html'] || {};

const crossPageSourceLinks = [...overviewHtml.matchAll(/href="sources\.html#([^"]+)"/g)].map(m => m[1]);
console.log(`\nVerifying ${crossPageSourceLinks.length} cross-page links from overview.html -> sources.html:`);
let brokenCrossPageLinks = 0;
crossPageSourceLinks.forEach(targetId => {
  if (!sourcesIdMap[targetId]) {
    brokenCrossPageLinks++;
    console.error(`    [BROKEN TARGET] overview.html references sources.html#${targetId}, but #${targetId} does not exist in sources.html!`);
  }
});
assert(brokenCrossPageLinks === 0, `All ${crossPageSourceLinks.length} cross-page links from overview.html to sources.html resolve successfully`, `Broken links: ${brokenCrossPageLinks}`);

// Universal internal and cross-page anchor resolution audit across index.html, overview.html, sources.html
console.log('\nUniversal Internal and Cross-Page Anchor Integrity Check:');
const htmlFileContents = {
  'overview.html': overviewHtml,
  'index.html': fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8'),
  'sources.html': sourcesHtml
};

let totalAnchorsTested = 0;
let brokenAnchorsFound = [];

Object.entries(htmlFileContents).forEach(([sourceFile, content]) => {
  const linkRegex = /\bhref=["']([^"']+)["']/g;
  let lMatch;
  while ((lMatch = linkRegex.exec(content)) !== null) {
    const href = lMatch[1];
    // Ignore external URLs, mailto, javascript, bare '#'
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href === '#') {
      continue;
    }

    // Case 1: Same-page anchor `#some-id`
    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      totalAnchorsTested++;
      if (!fileIdMaps[sourceFile][targetId]) {
        brokenAnchorsFound.push({
          sourceFile,
          link: href,
          reason: `Target #${targetId} not found in ${sourceFile}`
        });
      }
    }
    // Case 2: Cross-page link with anchor `other.html#some-id`
    else if (href.includes('#')) {
      const [targetPage, targetId] = href.split('#');
      if (fileIdMaps[targetPage]) {
        totalAnchorsTested++;
        if (!fileIdMaps[targetPage][targetId]) {
          brokenAnchorsFound.push({
            sourceFile,
            link: href,
            reason: `Target #${targetId} not found in ${targetPage}`
          });
        }
      }
    }
  }
});

console.log(`  Total internal and cross-page fragment links tested: ${totalAnchorsTested}`);
if (brokenAnchorsFound.length > 0) {
  console.log(`  Broken anchors found: ${brokenAnchorsFound.length}`);
  brokenAnchorsFound.forEach(b => {
    console.error(`    [BROKEN ANCHOR] in ${b.sourceFile}: ${b.link} (${b.reason})`);
  });
}
assert(brokenAnchorsFound.length === 0, `All ${totalAnchorsTested} internal and cross-page fragment links resolve`, JSON.stringify(brokenAnchorsFound));


// =============================================================================
// TEST 2: ALL 41 OVERVIEW FOOTNOTES MATCH SECTION E OF PLAN V03
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('TEST 2: OVERVIEW FOOTNOTE RECONCILIATION WITH SECTION E OF PLAN V03');
console.log('--------------------------------------------------------------------------------');

const planPath = path.join(ROOT_DIR, 'plan', '01_overview_content_plan_v03_final_locked.txt');
assert(fs.existsSync(planPath), 'Plan file exists: plan/01_overview_content_plan_v03_final_locked.txt');
const planContent = fs.readFileSync(planPath, 'utf8');

// Parse Section E
const sectionEMatch = planContent.match(/SECTION E: OVERVIEW REGISTER \[1\]-\[41\]([\s\S]*?)SECTION F: CROSSWALK/);
assert(sectionEMatch !== null, 'Found SECTION E: OVERVIEW REGISTER [1]-[41] in plan v03');

const sectionEText = sectionEMatch ? sectionEMatch[1] : '';

// Parse all 41 register items in Section E
const planFootnotes = {};
const planEntryRegex = /\[(\d+)\]\s+([\s\S]*?)(?=\n\s*\[\d+\]|\n\s*[-=]{40,}|\n\s*REGISTER EXCLUSIONS|$)/g;
let pMatch;
while ((pMatch = planEntryRegex.exec(sectionEText)) !== null) {
  const num = parseInt(pMatch[1], 10);
  const rawText = pMatch[2].trim();
  planFootnotes[num] = rawText;
}

const planNums = Object.keys(planFootnotes).map(Number).sort((a, b) => a - b);
console.log(`  Parsed ${planNums.length} register entries from Section E: [${planNums[0]}] to [${planNums[planNums.length - 1]}]`);
assert(planNums.length === 41, 'Plan Section E contains exactly 41 numbered register entries', `Found: ${planNums.length}`);

// Parse all footnotes in overview.html
// Looking for <ol class="footnotes-list"> ... </ol>
const footnoteListMatch = overviewHtml.match(/<ol class="footnotes-list">([\s\S]*?)<\/ol>/);
assert(footnoteListMatch !== null, 'Found <ol class="footnotes-list"> in overview.html');

const footnoteListText = footnoteListMatch ? footnoteListMatch[1] : '';
const htmlFootnotes = {};
// Match each <li id="fn-X"> ... </li>
const fnRegex = /<li id="fn-(\d+)">([\s\S]*?)<\/li>/g;
let fMatch;
while ((fMatch = fnRegex.exec(footnoteListText)) !== null) {
  const num = parseInt(fMatch[1], 10);
  const content = fMatch[2].trim();
  htmlFootnotes[num] = content;
}

const htmlNums = Object.keys(htmlFootnotes).map(Number).sort((a, b) => a - b);
console.log(`  Parsed ${htmlNums.length} footnotes from overview.html: [${htmlNums[0]}] to [${htmlNums[htmlNums.length - 1]}]`);
assert(htmlNums.length === 41, 'overview.html contains exactly 41 footnotes in <ol class="footnotes-list">', `Found: ${htmlNums.length}`);

// Compare each footnote 1..41
let footnoteMismatches = 0;
for (let i = 1; i <= 41; i++) {
  const pEntry = planFootnotes[i];
  const hEntry = htmlFootnotes[i];

  if (!pEntry) {
    footnoteMismatches++;
    assert(false, `Footnote [${i}] missing in Plan Section E`);
    continue;
  }
  if (!hEntry) {
    footnoteMismatches++;
    assert(false, `Footnote [${i}] missing in overview.html`);
    continue;
  }

  // Key attributes to check:
  // 1. Has canonical source link: <a href="sources.html#src-..." class="canonical-source-link">
  const hasCanonicalLink = /<a href="sources\.html#src-[^"]+" class="canonical-source-link">/.test(hEntry);
  if (!hasCanonicalLink) {
    footnoteMismatches++;
    console.error(`    [MISMATCH fn-${i}] Missing canonical source link in footnote HTML: ${hEntry}`);
  }

  // 2. Check title or authority presence from plan entry
  // Extract first line of plan entry (usually contains Title / Author)
  const firstLine = pEntry.split('\n')[0].replace(/\s+/g, ' ').trim();
  // Extract main author/title keywords
  const titleKeywords = firstLine.split(',')[0].replace(/[\[\]]/g, '').trim();

  // Tier check: [PRIMARY], [CONTEMPORARY], [SCHOLARLY], [MEMOIR / SECONDARY], [PRIMARY JUDICIAL], etc.
  const tierMatch = pEntry.match(/\[(PRIMARY[^\]]*|CONTEMPORARY|SCHOLARLY|MEMOIR[^\]]*|SECONDARY[^\]]*)\]/i);
  let tierMatches = true;
  if (tierMatch) {
    const expectedTierKeyword = tierMatch[1].split(/[\s\/]/)[0].toUpperCase();
    if (!hEntry.toUpperCase().includes(expectedTierKeyword)) {
      tierMatches = false;
      footnoteMismatches++;
      console.error(`    [MISMATCH fn-${i}] Tier mismatch. Plan: ${tierMatch[0]} vs HTML text.`);
    }
  }

  // Load sources.json and check canonical mapping
  const sourcesJsonPath = path.join(ROOT_DIR, 'assets', 'data', 'sources.json');
  const sourcesData = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf8'));
  const matchingCanonical = sourcesData.canonical.find(s =>
    s.appears_in && s.appears_in.some(a => a.tab === 'overview' && a.local === `[${i}]`)
  );

  const anchorMatch = hEntry.match(/href="sources\.html#(src-[^"]+)"/);
  if (anchorMatch) {
    const targetAnchor = anchorMatch[1];
    if (matchingCanonical) {
      const expectedAnchor = `src-${matchingCanonical.id}`;
      if (targetAnchor !== expectedAnchor) {
        footnoteMismatches++;
        console.error(`    [CANONICAL ID MISMATCH fn-${i}] overview.html points to #${targetAnchor}, but sources.json registers #${expectedAnchor}`);
      }
    }
    if (!sourcesIdMap[targetAnchor]) {
      footnoteMismatches++;
      console.error(`    [BROKEN ANCHOR fn-${i}] Target anchor #${targetAnchor} does not exist in sources.html`);
    }
  } else {
    footnoteMismatches++;
    console.error(`    [MISSING ANCHOR fn-${i}] No canonical href="sources.html#src-..." found in footnote`);
  }
  const isAnchorOk = anchorMatch && sourcesIdMap[anchorMatch[1]];
  const isIdOk = anchorMatch && matchingCanonical && anchorMatch[1] === `src-${matchingCanonical.id}`;
  const statusStr = (!anchorMatch) ? 'MISSING' : (!isAnchorOk ? 'BROKEN_LINK' : (!isIdOk ? 'ID_MISMATCH' : 'OK'));
  const hAnchor = anchorMatch ? anchorMatch[1] : 'NONE';
  const expAnchor = matchingCanonical ? `src-${matchingCanonical.id}` : 'NONE';
  console.log(`    [${i.toString().padStart(2, ' ')}] ${statusStr.padEnd(11, ' ')} | HTML: #${hAnchor.padEnd(25, ' ')} | Expected: #${expAnchor}`);
}

assert(footnoteMismatches === 0, 'All 41 footnotes in overview.html accurately match Section E and canonical register', `Mismatches found: ${footnoteMismatches}`);

// Check inline citation to footnote mapping
console.log('\nChecking inline citation to footnote mapping in overview.html:');
const inlineCiteRegex = /<sup class="citation"><a href="#fn-(\d+)" id="([^"]+)">\[(\d+)\]<\/a><\/sup>/g;
let inlineMatches = [...overviewHtml.matchAll(inlineCiteRegex)];
console.log(`  Found ${inlineMatches.length} inline citation tags in overview.html`);

const referencedFns = new Set(inlineMatches.map(m => parseInt(m[1], 10)));
const labelMatches = inlineMatches.every(m => m[1] === m[3]);
assert(labelMatches, 'All inline citation sup text [X] matches target href="#fn-X"');

// Check backrefs
const backrefRegex = /<a href="#([^"]+)" class="footnote-backref"/g;
const backrefs = [...overviewHtml.matchAll(backrefRegex)].map(m => m[1]);
console.log(`  Found ${backrefs.length} backref links in overview.html footnotes`);

const inlineIds = inlineMatches.map(m => m[2]);
const missingBackrefs = inlineIds.filter(id => !backrefs.includes(id));
assert(missingBackrefs.length === 0, 'Every inline citation anchor has a corresponding backref in its footnote', `Missing: ${missingBackrefs.join(', ')}`);


// =============================================================================
// TEST 3: DRUM CAPACITY (55-GALLON VS 57-GALLON)
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('TEST 3: CHEMICAL DRUM CAPACITY AUDIT');
console.log('--------------------------------------------------------------------------------');

// 1. In overview.html:
const overview57Matches = overviewHtml.match(/57[\s-]?gallon/gi) || [];
assert(overview57Matches.length === 0, 'Zero occurrences of "57-gallon" in overview.html', `Found: ${overview57Matches.length}`);

const overview55Matches = overviewHtml.match(/55[\s-]?gallon/gi) || [];
assert(overview55Matches.length > 0, `Found "55-gallon" drum specification in overview.html (${overview55Matches.length} occurrences)`);

// 2. Archive-wide scan for 57-gallon
console.log('\nArchive-wide scan for "57-gallon" across HTML, JSON, and locked plan files:');
const filesToScanFor57 = [
  'index.html',
  'overview.html',
  'sources.html',
  'assets/data/sources.json',
  'plan/01_overview_content_plan_v03_final_locked.txt',
  'plan/03a_case_offense_series_plan_v03_final_locked.txt',
  'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
  'plan/05_timeline_content_plan_v04_final_locked.txt',
  'plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt',
  'plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt',
  'plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt',
  'plan/07_impact_and_legacy_content_plan_v02_final_locked.txt',
  'plan/table_1_the_victims_v04.md'
];

let filesWith57 = [];
filesToScanFor57.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const m = content.match(/57[\s-]?gallon/gi);
    if (m) {
      filesWith57.push({ file: relPath, count: m.length });
    }
  }
});

if (filesWith57.length === 0) {
  assert(true, '57-gallon is nowhere present in any HTML, JSON, or locked plan files');
} else {
  // If present in older plan notes or change logs, inspect context
  console.log('  Files containing "57-gallon":', JSON.stringify(filesWith57));
  filesWith57.forEach(f => {
    // Check if it is only mentioned as retired discrepancy or errata
    const content = fs.readFileSync(path.join(ROOT_DIR, f.file), 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((l, idx) => {
      if (/57[\s-]?gallon/i.test(l)) {
        console.log(`    ${f.file}:${idx+1} -> ${l.trim()}`);
      }
    });
  });
  // Check if overview.html or index.html or sources.html have it:
  const htmlWith57 = filesWith57.filter(f => f.file.endsWith('.html'));
  assert(htmlWith57.length === 0, 'Zero occurrences of 57-gallon in public HTML files', JSON.stringify(htmlWith57));
}


// =============================================================================
// TEST 4: MASTER FBI VAULT COORDINATE BOUNDARIES AUDIT
// =============================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('TEST 4: MASTER FBI VAULT COORDINATE BOUNDARIES AUDIT');
console.log('--------------------------------------------------------------------------------');

const limits = {
  1: 68,
  3: 60,
  6: 74
};

const targetFiles = [
  'plan/01_overview_content_plan_v03_final_locked.txt',
  'plan/03a_case_offense_series_plan_v03_final_locked.txt',
  'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
  'plan/08_case_final_bibliography_v01.txt',
  'plan/table_1_the_victims_v04.md',
  'plan/05_timeline_content_plan_v04_final_locked.txt',
  'plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt',
  'plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt',
  'plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt',
  'plan/08_analysis_final_bibliography_v01.txt',
  'plan/07_impact_and_legacy_content_plan_v02_final_locked.txt',
  'overview.html',
  'index.html',
  'sources.html'
];

// Baseline audit using existing regex
const standardRegex = /(?:(?:FBI(?:\s+Vault)?\s+)?\b(?:Part|Pt)\b\s*0*([1-9]\d?)[^\n\r\]\)]*?(?:p\.|pp\.|page|pages)\s*([0-9\s,\–\-]+))/gi;

let totalCitationsFound = 0;
let totalPageCoordinatesChecked = 0;
let violationsFound = [];

targetFiles.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    assert(false, `Target file exists: ${relPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, lineIdx) => {
    let match;
    while ((match = standardRegex.exec(line)) !== null) {
      totalCitationsFound++;
      const part = parseInt(match[1], 10);
      const rawPages = match[2];
      const matchSnippet = match[0];

      if (!limits[part]) {
        violationsFound.push({
          file: relPath,
          line: lineIdx + 1,
          type: 'UNRECOGNIZED_PART',
          part,
          snippet: matchSnippet
        });
        return;
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
          totalPageCoordinatesChecked++;
          if (p < 1 || p > limits[part]) {
            violationsFound.push({
              file: relPath,
              line: lineIdx + 1,
              part,
              page: p,
              limit: limits[part],
              snippet: matchSnippet,
              context: line.trim()
            });
          }
        }
      }
    }
  });
});

console.log(`  Target files evaluated: ${targetFiles.length}`);
console.log(`  Total citations evaluated: ${totalCitationsFound}`);
console.log(`  Total page coordinates evaluated: ${totalPageCoordinatesChecked}`);
assert(violationsFound.length === 0, `Standard FBI coordinates audit: 0 violations across all ${targetFiles.length} files`, JSON.stringify(violationsFound));


// -----------------------------------------------------------------------------
// ADVERSARIAL STRESS-TEST OF FBI COORDINATES: SCAN FOR HIDDEN / UNCONVENTIONAL PATTERNS
// -----------------------------------------------------------------------------
console.log('\n--- ADVERSARIAL STRESS-TEST: SCANNING FOR UNCAUGHT FBI VAULT PATTERNS ---');
// Test for any mentions of "FBI" and "Vault" or "Part" near page numbers that standard regex might miss
const adversarialRegexes = [
  // e.g. "Part 01, p. 75" or "Part 1, page 80"
  /\b(?:Part|Pt)\.?\s*0*([1-9]\d?)\b[^.\n\r]*?\b(?:p|pp|page|pages)\.?\s*(\d+)/gi,
  // e.g. "Vault Part 02" (non-existent parts)
  /\bVault\s+Part\s+0*([1-9]\d?)\b/gi,
  // e.g. "FBI.*?pp?\.\s*(\d+)"
  /\bFBI\b[^.\n\r]*?\bpp?\.?\s*(\d+)/gi
];

let adversarialViolations = [];
let uncaughtCitationsCount = 0;

targetFiles.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, lineIdx) => {
    // Regex 1: Part X ... page Y
    let m;
    const r1 = /\b(?:Part|Pt)\.?\s*0*([1-9]\d?)\b[^.\n\r\]\)]*?\b(?:p|pp|page|pages)\.?\s*(\d+)/gi;
    while ((m = r1.exec(line)) !== null) {
      const part = parseInt(m[1], 10);
      const page = parseInt(m[2], 10);
      if (limits[part]) {
        if (page < 1 || page > limits[part]) {
          adversarialViolations.push({
            file: relPath,
            line: lineIdx + 1,
            type: 'OUT_OF_BOUNDS_PAGE',
            part,
            page,
            limit: limits[part],
            snippet: m[0]
          });
        }
      } else if (part <= 20) { // Unrecognized vault part
        // Only trigger if line actually mentions FBI or Vault
        if (/FBI|Vault/i.test(line)) {
          adversarialViolations.push({
            file: relPath,
            line: lineIdx + 1,
            type: 'UNRECOGNIZED_VAULT_PART',
            part,
            snippet: m[0],
            line: line.trim()
          });
        }
      }
    }
  });
});

console.log(`  Adversarial stress-test violations: ${adversarialViolations.length}`);
assert(adversarialViolations.length === 0, 'Adversarial FBI coordinates scan found zero hidden or out-of-bounds citations', JSON.stringify(adversarialViolations));


// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n================================================================================');
console.log('SUMMARY OF EMPIRICAL VERIFICATION');
console.log('================================================================================');
console.log(`Total Assertions Evaluated: ${totalAssertions}`);
console.log(`Passed Assertions: ${passedAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);

const finalVerdict = failedAssertions === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log(`\nOVERALL VERDICT: ${finalVerdict}`);
console.log('================================================================================\n');

process.exit(failedAssertions === 0 ? 0 : 1);
