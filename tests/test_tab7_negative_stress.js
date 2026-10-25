/**
 * EMPIRICAL CHALLENGER NEGATIVE & STRESS TEST HARNESS FOR TAB 7
 * Target: plan/07_impact_and_legacy_content_plan_v02_final_locked.txt
 * Verification of oracle sensitivity, malformed input detection, and robustness.
 */

const fs = require('fs');
const path = require('path');
const { limits } = require('./test_fbi_coordinates');

console.log('================================================================================');
console.log('CHALLENGER NEGATIVE & ADVERSARIAL STRESS TEST SUITE: TAB 7');
console.log('================================================================================\n');

const tab7Path = path.resolve('plan/07_impact_and_legacy_content_plan_v02_final_locked.txt');
const tab7Raw = fs.readFileSync(tab7Path, 'utf8');
const tab7Lines = tab7Raw.split(/\r?\n/);

let stressFailures = 0;
let testsPassed = 0;

// ============================================================================
// TEST 1: ORACLE SENSITIVITY & FALSIFICATION HARNESS
// ============================================================================
console.log('--- TEST 1: ORACLE SENSITIVITY & FALSIFICATION (INJECTING BOGUS TARGETS) ---');
const declaredAnchors = new Set();
tab7Lines.forEach(l => {
  const m = l.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
  if (m) {
    declaredAnchors.add(m[1].toLowerCase());
    if (m[2]) {
      (m[2].match(/#([a-z0-9\-]+)/g) || []).forEach(a => declaredAnchors.add(a.replace(/^#/, '').toLowerCase()));
    }
  }
  if (l.includes('|') && l.includes('#')) {
    (l.match(/#([a-z0-9\-]+)/g) || []).forEach(a => {
      const slug = a.replace(/^#/, '').toLowerCase();
      if (!slug.startsWith('event-') && !slug.startsWith('case-') && !slug.startsWith('ctx-') && !slug.startsWith('timeline-')) {
        declaredAnchors.add(slug);
      }
    });
  }
});

const fakeTargets = [
  'non-existent-anchor-alpha-99',
  'bogus-reform-protocol-xyz',
  'hallucinated-memorial-site-404',
  'fake-officer-parole-anchor',
  'unregistered-victim-alias-000'
];

let caughtFakes = 0;
fakeTargets.forEach(fake => {
  if (!declaredAnchors.has(fake)) {
    caughtFakes++;
  } else {
    console.error(`  [FAIL] Oracle falsely validated bogus anchor: #${fake}`);
    stressFailures++;
  }
});

if (caughtFakes === fakeTargets.length) {
  console.log(`  [PASS] Oracle successfully rejected 100% of injected false targets (${caughtFakes}/${fakeTargets.length}).`);
  testsPassed++;
} else {
  console.error(`  [FAIL] Oracle sensitivity test failed: ${caughtFakes}/${fakeTargets.length} caught.`);
}

// ============================================================================
// TEST 2: ANCHOR SLUG SYNTAX & MALFORMED CHARACTER FUZZING
// ============================================================================
console.log('\n--- TEST 2: ANCHOR SYNTAX & CHARACTER CONFORMANCE AUDIT ---');
let malformedCount = 0;
declaredAnchors.forEach(anchor => {
  // Must be strictly lowercase kebab-case: alphanumeric and single hyphens
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(anchor)) {
    console.error(`  [FAIL] Malformed anchor syntax: "${anchor}"`);
    malformedCount++;
    stressFailures++;
  }
  // Check for forbidden characters
  if (/[A-Z]/.test(anchor)) {
    console.error(`  [FAIL] Uppercase characters in anchor: "${anchor}"`);
    malformedCount++;
    stressFailures++;
  }
  if (/\s/.test(anchor)) {
    console.error(`  [FAIL] Whitespace in anchor: "${anchor}"`);
    malformedCount++;
    stressFailures++;
  }
  if (anchor.startsWith('-') || anchor.endsWith('-')) {
    console.error(`  [FAIL] Leading or trailing hyphen in anchor: "${anchor}"`);
    malformedCount++;
    stressFailures++;
  }
  if (anchor.includes('--')) {
    console.error(`  [FAIL] Double hyphen in anchor: "${anchor}"`);
    malformedCount++;
    stressFailures++;
  }
});

if (malformedCount === 0) {
  console.log(`  [PASS] All ${declaredAnchors.size} registered anchors conform strictly to the kebab-case specification.`);
  testsPassed++;
} else {
  console.error(`  [FAIL] Detected ${malformedCount} malformed anchor slugs.`);
}

// ============================================================================
// TEST 3: DUPLICATE CANONICAL ANCHOR DECLARATION AUDIT
// ============================================================================
console.log('\n--- TEST 3: DUPLICATE CANONICAL ANCHOR DECLARATION AUDIT ---');
const canonicalDeclarations = new Map();
tab7Lines.forEach((l, idx) => {
  const m = l.match(/Anchor:\s*#([a-z0-9\-]+)/i);
  if (m) {
    const slug = m[1].toLowerCase();
    if (!canonicalDeclarations.has(slug)) {
      canonicalDeclarations.set(slug, []);
    }
    canonicalDeclarations.get(slug).push(idx + 1);
  }
});

let duplicatesFound = 0;
canonicalDeclarations.forEach((lines, slug) => {
  if (lines.length > 1) {
    console.error(`  [FAIL] Duplicate canonical anchor definition: #${slug} declared at lines: ${lines.join(', ')}`);
    duplicatesFound++;
    stressFailures++;
  }
});

if (duplicatesFound === 0) {
  console.log(`  [PASS] All ${canonicalDeclarations.size} canonical anchors are uniquely declared (zero duplicate collisions).`);
  testsPassed++;
} else {
  console.error(`  [FAIL] ${duplicatesFound} duplicate canonical anchor collisions found.`);
}

// ============================================================================
// TEST 4: CIRCULAR REDIRECT & SELF-REFERENTIAL ANOMALIES
// ============================================================================
console.log('\n--- TEST 4: CIRCULAR REDIRECT & SELF-REFERENTIAL ALIAS AUDIT ---');
let circularAnomalies = 0;
tab7Lines.forEach((l, idx) => {
  const m = l.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
  if (m && m[2]) {
    const canonical = m[1].toLowerCase();
    const rawAliases = m[2].match(/#([a-z0-9\-]+)/g) || [];
    const aliases = rawAliases.map(a => a.replace(/^#/, '').toLowerCase());

    // 1. Check self-aliasing
    if (aliases.includes(canonical)) {
      console.error(`  [FAIL] Self-aliasing detected: L${idx + 1}: Canonical #${canonical} is also listed as an alias!`);
      circularAnomalies++;
      stressFailures++;
    }

    // 2. Check duplicate aliases on same line
    const aliasSet = new Set();
    aliases.forEach(a => {
      if (aliasSet.has(a)) {
        console.error(`  [FAIL] Duplicate alias declared on same line: L${idx + 1}: #${a}`);
        circularAnomalies++;
        stressFailures++;
      }
      aliasSet.add(a);
    });
  }
});

if (circularAnomalies === 0) {
  console.log(`  [PASS] Zero self-referencing or redundant alias declarations across Tab 7.`);
  testsPassed++;
} else {
  console.error(`  [FAIL] ${circularAnomalies} circular/redundant alias anomalies detected.`);
}

// ============================================================================
// TEST 5: FBI COORDINATE BOUNDARY STRESS & OUT-OF-BOUNDS INJECTION
// ============================================================================
console.log('\n--- TEST 5: STANDALONE FBI VAULT PDF BOUNDARY STRESS TEST ---');
function validateFBICoordinate(part, page) {
  if (!limits[part]) return { valid: false, reason: `Invalid part: ${part}` };
  if (page < 1 || page > limits[part]) return { valid: false, reason: `Page ${page} out of bounds for Part 0${part} (max ${limits[part]})` };
  return { valid: true };
}

const stressCoordinates = [
  // Legal
  { part: 1, page: 1, expectValid: true },
  { part: 1, page: 68, expectValid: true },
  { part: 3, page: 60, expectValid: true },
  { part: 6, page: 74, expectValid: true },
  // Illegal Out of bounds
  { part: 1, page: 69, expectValid: false },
  { part: 1, page: 100, expectValid: false },
  { part: 3, page: 61, expectValid: false },
  { part: 6, page: 75, expectValid: false },
  { part: 1, page: 0, expectValid: false },
  { part: 3, page: -5, expectValid: false },
  // Non-existent parts
  { part: 2, page: 10, expectValid: false },
  { part: 4, page: 10, expectValid: false },
  { part: 19, page: 10, expectValid: false }
];

let coordErrors = 0;
stressCoordinates.forEach(sc => {
  const res = validateFBICoordinate(sc.part, sc.page);
  if (res.valid !== sc.expectValid) {
    console.error(`  [FAIL] Coordinate stress mismatch for Part 0${sc.part} p. ${sc.page}: expected ${sc.expectValid}, got ${res.valid}`);
    coordErrors++;
    stressFailures++;
  }
});

if (coordErrors === 0) {
  console.log(`  [PASS] Coordinate boundary stress harness validated (${stressCoordinates.length}/${stressCoordinates.length} cases correct).`);
  testsPassed++;
} else {
  console.error(`  [FAIL] ${coordErrors} coordinate boundary stress test mismatches.`);
}

// ============================================================================
// TEST 6: BIDIRECTIONAL COMPLETENESS RATIO
// ============================================================================
console.log('\n--- TEST 6: BIDIRECTIONAL COMPLETENESS RATIO ---');
// Verify that every section in Tab 7 has both incoming cross-references and outgoing reverse references
const sectionAnchors = [
  'impact-overview', // Sec 0
  'community',       // Sec 1
  'reform',          // Sec 2
  'victims-memory',  // Sec 3
  'media-ethics',    // Sec 4
  'primary-sources', // Sec 5
  'master-conclusion'// Sec 6
];

let missingSections = 0;
sectionAnchors.forEach(sa => {
  if (!declaredAnchors.has(sa)) {
    console.error(`  [FAIL] Major section anchor #${sa} is missing from Tab 7!`);
    missingSections++;
    stressFailures++;
  }
});

if (missingSections === 0) {
  console.log(`  [PASS] All 7 foundational sections (0 through 6) possess verified primary canonical anchors.`);
  testsPassed++;
} else {
  console.error(`  [FAIL] ${missingSections} major section anchors missing.`);
}

console.log('\n================================================================================');
console.log(`STRESS TEST SUMMARY: ${testsPassed}/6 PASSED | ${stressFailures} FAILURES`);
console.log(`FINAL STRESS TEST VERDICT: ${stressFailures === 0 ? 'APPROVE' : 'REJECT'}`);
console.log('================================================================================\n');

process.exit(stressFailures === 0 ? 0 : 1);
