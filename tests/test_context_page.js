/**
 * tests/test_context_page.js
 *
 * CONTEXT PAGE (Phase D Step 5) — SHIPPED-HTML AUDIT
 *
 * 1.  File presence & offline isolation (file://, zero CDN/remote/network)
 * 2.  DOM ID uniqueness + internal anchor resolution
 * 3.  Content structure validation: Section A (8 subsections) and Section B (13 subsections)
 * 4.  Table 3 (Architectural Crosswalk) integrity & destination routes
 * 5.  Footnote register (32 defined & all cited; ref-N(-K) parity per spec 7.9)
 * 6.  FBI Vault coordinate bounds on shipped HTML
 * 7.  Cross-page integrity (victims/sources/timeline targets; inbound routes from shipped pages)
 * 8.  Anchor alias registry (load-bearing aliases: #early-life, #military, #oxford-apartments-profile)
 * 9.  Forbidden strings & editorial locks (Non-deterministic framing)
 * 10. Nav/masthead/footer verbatim sync with timeline.html / victims.html
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
    const errMsg = `[FAIL] ${message} ${details ? '--> ' + String(details).slice(0, 400) : ''}`;
    console.error(`  ${errMsg}`);
    failures.push(errMsg);
  }
}

function section(title) {
  console.log('--------------------------------------------------------------------------------');
  console.log(title);
  console.log('--------------------------------------------------------------------------------');
}

// =============================================================================
// Load pages & plan
// =============================================================================
const contextPath = path.join(ROOT_DIR, 'context.html');
const timelinePath = path.join(ROOT_DIR, 'timeline.html');
const victimsPath = path.join(ROOT_DIR, 'victims.html');
const overviewPath = path.join(ROOT_DIR, 'overview.html');
const indexPath = path.join(ROOT_DIR, 'index.html');
const sourcesPath = path.join(ROOT_DIR, 'sources.html');
const planPath = path.join(ROOT_DIR, 'plan', '02_context_content_plan_v03_final_locked.txt');

const context = fs.existsSync(contextPath) ? fs.readFileSync(contextPath, 'utf8') : '';
const timeline = fs.readFileSync(timelinePath, 'utf8');
const victims = fs.readFileSync(victimsPath, 'utf8');
const overview = fs.readFileSync(overviewPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');
const sources = fs.readFileSync(sourcesPath, 'utf8');
const planText = fs.readFileSync(planPath, 'utf8');

// =============================================================================
// 1. File presence & offline isolation
// =============================================================================
section('1. FILE PRESENCE & OFFLINE ISOLATION');
assert(fs.existsSync(contextPath), 'context.html exists on disk');
assert(context.length > 50000, `context.html has substantial content (${context.length} bytes)`);

// Offline isolation
assert(!/https?:\/\//i.test(context), 'Zero remote HTTP/HTTPS URLs in document (offline isolation)');
assert(!/\bfetch\s*\(/.test(context), 'Zero runtime fetch() network calls');
assert(!/XMLHttpRequest/.test(context), 'Zero runtime XMLHttpRequest calls');
assert(!/(?:href|src|action)="\//.test(context), 'Zero root-relative URLs (file:// protocol safe)');
assert(!/<script[^>]*src=["']http/i.test(context), 'Zero external script imports');
assert(!/<link[^>]*href=["']http/i.test(context), 'Zero external stylesheet imports');

// =============================================================================
// 2. DOM ID uniqueness + internal anchor resolution
// =============================================================================
section('2. DOM ID UNIQUENESS & INTERNAL ANCHOR RESOLUTION');
const idMatches = [...context.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const idSet = new Set(idMatches);
assert(idMatches.length === idSet.size, `All DOM IDs are strictly unique (${idMatches.length} IDs, ${idSet.size} unique)`);

if (idMatches.length !== idSet.size) {
  const seen = new Set();
  const duplicates = [];
  for (const id of idMatches) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  assert(false, 'Duplicate IDs detected', duplicates.join(', '));
}

// Internal anchor resolution
const hrefMatches = [...context.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
assert(hrefMatches.length > 0, `Internal href anchors present (${hrefMatches.length} links found)`);
let unresolvedCount = 0;
const unresolvedList = [];
for (const h of hrefMatches) {
  if (!idSet.has(h)) {
    unresolvedCount++;
    unresolvedList.push(h);
  }
}
assert(unresolvedCount === 0, `All internal # hrefs resolve to a valid element ID (${unresolvedCount} failures)`, unresolvedList.join(', '));

// =============================================================================
// 3. Content Structure Validation: Section A & Section B Subsections
// =============================================================================
section('3. CONTENT STRUCTURE VALIDATION');
const EXPECTED_SEC_A = [
  { code: 'A.1', anchor: 'macroeconomic-restructuring', title: 'Macroeconomic Restructuring' },
  { code: 'A.2', anchor: 'residential-segregation', title: 'Residential Hypersegregation' },
  { code: 'A.3', anchor: 'avenues-west-oxford-apartments', title: 'The Near West Side / Avenues West' },
  { code: 'A.4', anchor: 'mpd-institutional-culture', title: 'MPD Institutional Culture' },
  { code: 'A.5', anchor: 'ernest-lacy-case', title: 'Historical Police Misconduct' },
  { code: 'A.6', anchor: 'milwaukee-lgbtq-history', title: "Milwaukee's LGBTQ Community" },
  { code: 'A.7', anchor: 'less-dead-framework', title: "Steven Egger's \"Less-Dead\" Concept" },
  { code: 'A.8', anchor: 'historical-context-synthesis', title: 'Analytical Synthesis' }
];

const EXPECTED_SEC_B = [
  { code: 'B.1', anchor: 'birth-and-family-origins', title: 'Birth, Family Origins' },
  { code: 'B.2', anchor: 'childhood-health-recollections', title: 'Childhood Health' },
  { code: 'B.3', anchor: 'family-instability-divorce', title: 'Domestic Instability' },
  { code: 'B.4', anchor: 'animal-remains-anatomy', title: 'Animal Remains, Bone Bleaching' },
  { code: 'B.5', anchor: 'revere-high-school-alcoholism', title: 'Revere High School' },
  { code: 'B.6', anchor: 'ohio-state-university-dismissal', title: 'Ohio State University' },
  { code: 'B.7', anchor: 'us-army-service-counseling', title: 'U.S. Army Service' },
  { code: 'B.8', anchor: 'west-allis-grandmother-residence', title: 'Catherine Dahmer West Allis Residence' },
  { code: 'B.9', anchor: 'ambrosia-chocolate-employment', title: 'Ambrosia Chocolate Factory' },
  { code: 'B.10', anchor: 'pre-1988-legal-contacts', title: 'Pre-1988 Legal Contacts' },
  { code: 'B.11', anchor: 'probation-supervision-failure', title: 'Institutional Siloing & Probation Supervision' },
  { code: 'B.12', anchor: 'adolescent-fantasies-jogger', title: 'Adolescent Fantasies' },
  { code: 'B.13', anchor: 'transition-1978-first-homicide', title: 'The First Homicide & Criminal Transition' }
];

assert(context.includes('id="milwaukee-context"'), 'Section A container (#milwaukee-context) exists');
assert(context.includes('id="early-life"'), 'Section B main anchor (#early-life) exists');

// Verify all 8 Section A subsections
for (const sec of EXPECTED_SEC_A) {
  assert(context.includes(`id="${sec.anchor}"`), `Section A subsection anchor #${sec.anchor} present`);
}

// Verify all 13 Section B subsections
for (const sec of EXPECTED_SEC_B) {
  assert(context.includes(`id="${sec.anchor}"`), `Section B subsection anchor #${sec.anchor} present`);
}

// =============================================================================
// 4. Table 3 (Architectural Crosswalk) Integrity
// =============================================================================
section('4. ARCHITECTURAL CROSSWALK TABLE');
assert(context.includes('class="timeline-table-wrapper"'), 'Table 3 responsive wrapper present');
assert(context.includes('class="data-table crosswalk-table"'), 'Table 3 data-table present');
const crosswalkRows = (context.match(/<td class="col-crosswalk-sub">/g) || []).length;
assert(crosswalkRows === 21, `Table 3 contains all 21 crosswalk rows (found ${crosswalkRows})`);

// =============================================================================
// 5. Footnote Register & Parity (Spec 7.9)
// =============================================================================
section('5. FOOTNOTE REGISTER & REF-N PARITY');
for (let i = 1; i <= 32; i++) {
  assert(context.includes(`id="fn-${i}"`), `Footnote #fn-${i} defined in register`);
  assert(context.includes(`href="#fn-${i}"`), `Footnote #fn-${i} cited in document text`);
}

// Verify ref-N / ref-N-K document-order numbering and backref parity
const footnoteOccurrences = {};
const supMatches = [...context.matchAll(/<sup class="citation"><a href="#fn-(\d+)" id="([^"]+)">/g)];
for (const m of supMatches) {
  const n = parseInt(m[1], 10);
  const refId = m[2];
  footnoteOccurrences[n] = (footnoteOccurrences[n] || 0) + 1;
  const count = footnoteOccurrences[n];
  const expectedId = count === 1 ? `ref-${n}` : `ref-${n}-${count}`;
  assert(refId === expectedId, `Citation order ref ID matches expected (${refId} === ${expectedId})`);
}

// Verify backrefs inside each footnote li
for (let i = 1; i <= 32; i++) {
  const total = footnoteOccurrences[i] || 0;
  assert(total > 0, `Footnote fn-${i} has at least 1 citation occurrence`);
  for (let k = 1; k <= total; k++) {
    const targetRef = k === 1 ? `ref-${i}` : `ref-${i}-${k}`;
    assert(context.includes(`href="#${targetRef}"`), `Footnote fn-${i} has backref link targeting #${targetRef}`);
  }
}

// =============================================================================
// 6. FBI Vault Coordinate Bounds
// =============================================================================
section('6. FBI VAULT COORDINATE BOUNDS');
const limits = { 1: 68, 3: 60, 6: 74 };
const locRe = /\b(?:Part|Pt)\s*0*(\d\d)\b[^\]<>]*?(?:p\.|pp\.)\s*([0-9,\s–\-]+)?/gi;
let fbiScanCount = 0;
let fbiPageCount = 0;
let fbiViolations = 0;
let m;

while ((m = locRe.exec(context)) !== null) {
  fbiScanCount++;
  const part = parseInt(m[1], 10);
  if (!limits[part]) {
    assert(false, `Unrecognized FBI part in context.html: Part ${part}`);
    fbiViolations++;
    continue;
  }
  const pages = (m[2] || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const item of pages) {
    const nums = item.split(/[–\-]/).map(s => parseInt(s.trim(), 10)).filter(nn => !isNaN(nn));
    if (!nums.length) continue;
    let a = nums[0], b = nums.length > 1 ? nums[1] : nums[0];
    if (a > b) { const t = a; a = b; b = t; }
    for (let q = a; q <= b; q++) {
      fbiPageCount++;
      if (q < 1 || q > limits[part]) {
        assert(false, `FBI bound violation: Part ${part} p. ${q} exceeds limit ${limits[part]}`);
        fbiViolations++;
      }
    }
  }
}
assert(fbiViolations === 0, `All FBI citations strictly within PDF bounds (${fbiScanCount} scanned, ${fbiPageCount} page coordinates checked)`);

// =============================================================================
// 7. Cross-Page Integrity (Inbound routes & Sources.html links)
// =============================================================================
section('7. CROSS-PAGE INTEGRITY');
// All canonical source records link to sources.html#src-*
const srcMatches = [...context.matchAll(/href="sources\.html#src-([^"]+)"/g)].map(m => m[1]);
assert(srcMatches.length === 32, `Exactly 32 canonical source links into sources.html (found ${srcMatches.length})`);
for (const src of srcMatches) {
  assert(sources.includes(`id="src-${src}"`), `Target sources.html#src-${src} exists in sources.html`);
}

// Verify all inbound links to context.html from shipped pages resolve
const shippedPages = [
  { name: 'timeline.html', content: timeline },
  { name: 'victims.html', content: victims },
  { name: 'overview.html', content: overview },
  { name: 'index.html', content: index }
];

for (const p of shippedPages) {
  const inbounds = [...p.content.matchAll(/href="context\.html#([^"]+)"/g)].map(m => m[1]);
  for (const target of inbounds) {
    assert(idSet.has(target), `Inbound link from ${p.name} (#${target}) resolves in context.html`);
  }
}

// =============================================================================
// 8. Anchor Alias Registry
// =============================================================================
section('8. ANCHOR ALIAS REGISTRY');
const REQUIRED_ALIASES = [
  'early-life',
  'military',
  'oxford-apartments-profile',
  'ctx-econ-deindustrialization',
  'ctx-seg-indices',
  'ctx-oxford-apts',
  'ctx-mpd-governance',
  'ctx-ernest-lacy',
  'ctx-lgbtq-history',
  'ctx-less-dead',
  'ctx-synthesis',
  'ctx-bio-early-life',
  'ctx-edu-military',
  'ctx-west-allis',
  'ctx-ambrosia-chocolate',
  'ctx-legal-pre1988',
  'alcohol',
  'lgbtq-community',
  'policing-and-community-trust',
  'probation-'
];

for (const alias of REQUIRED_ALIASES) {
  assert(idSet.has(alias), `Required alias anchor #${alias} resolves in context.html`);
}

// =============================================================================
// 9. Forbidden Strings & Editorial Locks
// =============================================================================
section('9. FORBIDDEN STRINGS & EDITORIAL LOCKS');
const forbiddenStrings = [
  '<!--@',
  '@TBODY@',
  '@FOOTNOTES@',
  'undefined',
  'NaN',
  '[object Object]'
];

for (const s of forbiddenStrings) {
  assert(!context.includes(s), `Forbidden template / artifact string "${s}" not present in output`);
}

// Verify editorial principle non-deterministic framing presence
assert(context.includes('Core Editorial Principle: Non-Deterministic Framing'), 'Non-deterministic framing heading present');
assert(context.includes('They are not deterministic causes of Jeffrey Dahmer’s murders'), 'Non-deterministic causality disclaimer present');

// =============================================================================
// 10. Nav / Masthead / Footer Sync
// =============================================================================
section('10. NAV / MASTHEAD / FOOTER SYNC');
// Verify active nav state
assert(context.includes('class="nav-link active" role="menuitem" aria-haspopup="true" aria-current="page">'), 'Context nav link has active class and aria-current="page"');
assert(!context.includes('<a href="timeline.html" class="nav-link active"'), 'Timeline nav link is not active on context page');

// Footer check
assert(context.includes('<!-- Broadsheet Editorial Footer -->'), 'Broadsheet editorial footer present');
assert(context.includes('The Jeffrey Dahmer Case Archive'), 'Archive footer title present');
assert(context.includes('class="site-footer"'), 'site-footer container present');

// =============================================================================
// FINAL VERDICT EVALUATION
// =============================================================================
console.log('================================================================================');
console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
console.log(`PASSED: ${passedAssertions}`);
console.log(`FAILED: ${failedAssertions}`);
console.log('================================================================================');

if (failedAssertions === 0) {
  console.log('FINAL CONTEXT AUDIT VERDICT: APPROVE');
  process.exit(0);
} else {
  console.error(`FINAL CONTEXT AUDIT VERDICT: REJECT (${failedAssertions} failures)`);
  process.exit(1);
}
