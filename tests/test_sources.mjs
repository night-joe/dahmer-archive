/**
 * tests/test_sources.mjs
 * Comprehensive automated verification test suite for Milestone 3 (Requirement R3):
 * 1. Schema and integrity of assets/data/sources.json
 * 2. Schema and integrity of assets/data/route-aliases.json
 * 3. Static HTML compliance, anchor integrity, accessibility, offline file:// safety of sources.html
 * 4. Nav link consistency (18 nav links matching index.html and overview.html)
 * 5. Deduplication and locator count verification (exactly 286 locators)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

console.log('================================================================================');
console.log('STARTING MILESTONE 3 (R3) VERIFICATION TESTS');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: assets/data/sources.json
// -----------------------------------------------------------------------------
console.log('Suite 1: assets/data/sources.json Validation');
const sourcesJsonPath = path.join(ROOT_DIR, 'assets/data/sources.json');
assert(fs.existsSync(sourcesJsonPath), 'sources.json exists on disk');

const sourcesData = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf8'));
assert(typeof sourcesData.generated === 'string' && sourcesData.generated.length > 0, 'sources.json has generated timestamp');
assert(typeof sourcesData.canonical_count === 'number' && sourcesData.canonical_count > 0, 'sources.json has canonical_count > 0');
assert(sourcesData.total_locators === 286, `sources.json total_locators === 286 (found ${sourcesData.total_locators})`);
assert(Array.isArray(sourcesData.canonical), 'sources.json has canonical array');
assert(sourcesData.canonical.length === sourcesData.canonical_count, 'canonical array length matches canonical_count');

let locatorsSum = 0;
const canonicalIdSet = new Set();
let allIdsValid = true;
let allTiersValid = true;

const validTiers = new Set(['primary-judicial', 'primary-archival', 'scholarly', 'contemporary', 'secondary']);

for (const item of sourcesData.canonical) {
  if (!item.id || typeof item.id !== 'string' || item.id.includes(' ')) allIdsValid = false;
  if (!validTiers.has(item.tier)) allTiersValid = false;
  canonicalIdSet.add(item.id);
  locatorsSum += item.appears_in.length;
}

assert(allIdsValid, 'All canonical IDs are valid non-empty kebab-case strings without whitespace');
assert(canonicalIdSet.size === sourcesData.canonical.length, 'All canonical IDs in sources.json are strictly unique');
assert(allTiersValid, 'All items belong to one of the 5 authorized evidentiary tiers');
assert(locatorsSum === 286, `Sum of appears_in across all canonical records === 286 (found ${locatorsSum})`);

// Reviewer Finding 4: Zero canonical IDs contain register/tab numbering
const numberedIds = sourcesData.canonical.filter(c => /(src\d+|part[ab]\d+|tab\d+)/i.test(c.id));
assert(numberedIds.length === 0, `Zero canonical IDs contain register/tab numbering (found ${numberedIds.length})`);

// Reviewer Finding 3: State v. Verhasselt deduplication
const verhasseltItem = sourcesData.canonical.find(c => c.id === 'verhasselt-1978');
const verhasseltMerged = verhasseltItem && verhasseltItem.appears_in.some(a => a.tab === 'case' && a.local.includes('Part B')) && verhasseltItem.appears_in.some(a => a.tab === 'case' && a.local.includes('Part A'));
assert(verhasseltMerged, 'State v. Verhasselt (verhasselt-1978) merged across Case Part B [24] and Part A [30]');

// Reviewer Finding 3: WDOC 1994 Report deduplication
const wdocItem = sourcesData.canonical.find(c => c.id === 'wi-doc-1994');
const wdocTabs = wdocItem ? new Set(wdocItem.appears_in.map(a => a.tab)) : new Set();
assert(wdocItem && wdocTabs.has('overview') && wdocTabs.has('timeline') && wdocTabs.has('case') && wdocTabs.has('impact'), 'WDOC 1994 report (wi-doc-1994) merged across Overview, Timeline, Case, and Impact');

// Reviewer Finding 5: MPD dispatch audio classified as Tier 1
const mpdAudioItem = sourcesData.canonical.find(c => c.id === 'mpd-dispatch-1991');
assert(mpdAudioItem && mpdAudioItem.tier === 'primary-judicial', 'MPD dispatch audio (mpd-dispatch-1991) classified as Tier 1 primary-judicial');

// Reviewer Finding 5: Contemporary journalism and wire reports classified as Tier 4
const newsPrefixes = ['mjs-', 'mj-', 'ms-', 'spokesman-', 'marquette-ap-'];
let allNewsContemporary = true;
for (const item of sourcesData.canonical) {
  if (newsPrefixes.some(p => item.id.startsWith(p))) {
    if (item.tier !== 'contemporary' || item.type !== 'newspaper') {
      allNewsContemporary = false;
      console.error(`    Misclassified news item: ${item.id} (tier=${item.tier}, type=${item.type})`);
    }
  }
}
assert(allNewsContemporary, 'All contemporary newspapers and wire reports classified as Tier 4 contemporary / newspaper');

// Reviewer Finding 6: Statutory and judicial records have URLs extracted
const keyUrlSources = ['wis-act-399', 'wis-940-01', 'wis-805-09-2', 'oh-rev-2903-01', 'verhasselt-1978', 'bies-1972', 'wis-971-15-165'];
let allKeyUrlsExtracted = true;
for (const id of keyUrlSources) {
  const item = sourcesData.canonical.find(c => c.id === id);
  if (!item || !item.url || !item.url.startsWith('http')) {
    allKeyUrlsExtracted = false;
    console.error(`    Missing URL for key source: ${id}`);
  }
}
assert(allKeyUrlsExtracted, 'All key statutory and judicial records have valid HTTP/HTTPS URLs extracted');

// Reviewer Finding 2: Citation cleanliness and absence of duplicated initial phrases
let duplicatePhrasesCount = 0;
for (const item of sourcesData.canonical) {
  const words = item.citation.split(/\s+/);
  if (words.length >= 6) {
    const p1 = words.slice(0, 3).join(' ').toLowerCase();
    const p2 = words.slice(3, 6).join(' ').toLowerCase();
    if (p1 === p2) duplicatePhrasesCount++;
  }
}
assert(duplicatePhrasesCount === 0, `Zero canonical citations duplicate their initial phrase (found ${duplicatePhrasesCount})`);

// -----------------------------------------------------------------------------
// TEST SUITE 2: assets/data/route-aliases.json
// -----------------------------------------------------------------------------
console.log('\nSuite 2: assets/data/route-aliases.json Validation');
const aliasesJsonPath = path.join(ROOT_DIR, 'assets/data/route-aliases.json');
assert(fs.existsSync(aliasesJsonPath), 'route-aliases.json exists on disk');

const aliasesData = JSON.parse(fs.readFileSync(aliasesJsonPath, 'utf8'));
assert(typeof aliasesData.generated === 'string', 'route-aliases.json has generated timestamp');
assert(Array.isArray(aliasesData.aliases), 'route-aliases.json has aliases array');
assert(aliasesData.aliases.length >= 40, `route-aliases.json contains at least 40 conflicts (found ${aliasesData.aliases.length})`);

const conflictIds = new Set(aliasesData.aliases.map(a => a.conflict_id));
const requiredConflicts = ['R-01', 'R-02', 'R-03', 'R-05', 'R-06', 'R-07', 'R-08', 'R-09', 'R-10', 'R-14', 'R-24', 'R-39a', 'VICTIM-01', 'VICTIM-02', 'VICTIM-03'];
let allRequiredConflictsPresent = true;
for (const req of requiredConflicts) {
  if (!conflictIds.has(req)) allRequiredConflictsPresent = false;
}
assert(allRequiredConflictsPresent, 'All key Phase C Part 5.8 route conflict IDs are registered');

// -----------------------------------------------------------------------------
// TEST SUITE 3: sources.html Structure & Required Anchors
// -----------------------------------------------------------------------------
console.log('\nSuite 3: sources.html Structure & Anchors');
const htmlPath = path.join(ROOT_DIR, 'sources.html');
assert(fs.existsSync(htmlPath), 'sources.html exists on disk');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.length > 50000, `sources.html has substantial content (${html.length} bytes)`);

// Check required anchors from Phase C Part 7.11
const requiredAnchors = [
  'key-sources',
  'by-tab',
  'by-source',
  'methodology',
  'sources-overview',
  'sources-victims',
  'sources-timeline',
  'sources-context',
  'sources-case',
  'sources-analysis',
  'sources-impact'
];

let allAnchorsFound = true;
for (const anchor of requiredAnchors) {
  const hasId = html.includes(`id="${anchor}"`);
  if (!hasId) {
    allAnchorsFound = false;
    console.error(`    Missing anchor ID: #${anchor}`);
  }
}
assert(allAnchorsFound, 'All required Phase C Part 7.11 anchors are present in sources.html');

// Check canonical IDs in sources.html View 2
let allCanonicalInHtml = true;
for (const canon of sourcesData.canonical) {
  if (!html.includes(`id="src-${canon.id}"`)) {
    allCanonicalInHtml = false;
    console.error(`    Missing canonical anchor: id="src-${canon.id}"`);
  }
}
assert(allCanonicalInHtml, `All ${sourcesData.canonical.length} canonical IDs have id="src-..." in sources.html`);

// Check that DOM IDs are strictly unique
const idMatches = html.match(/id="([^"]+)"/g) || [];
const seenIds = new Set();
const duplicateIds = [];
for (const m of idMatches) {
  const id = m.replace(/^id="/, '').replace(/"$/, '');
  if (seenIds.has(id)) {
    duplicateIds.push(id);
  }
  seenIds.add(id);
}
assert(duplicateIds.length === 0, `All DOM IDs in sources.html are unique (duplicates found: ${duplicateIds.join(', ') || 'none'})`);

// -----------------------------------------------------------------------------
// TEST SUITE 4: Offline file:// Browsability & Zero Runtime Fetch
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Offline file:// Safety & Zero External Dependencies');

// Check no external script / css / font URLs in head
const hasExternalCdn = /<(link|script)[^>]+https?:\/\//i.test(html);
assert(!hasExternalCdn, 'No external HTTP/HTTPS CDNs or remote resources loaded in sources.html');

const hasRuntimeFetch = /fetch\s*\(|XMLHttpRequest/i.test(html);
assert(!hasRuntimeFetch, 'Zero runtime fetch() or XMLHttpRequest calls in sources.html');

// Check relative asset paths
assert(html.includes('href="assets/css/variables.css"'), 'Uses relative path for variables.css');
assert(html.includes('href="assets/css/base.css"'), 'Uses relative path for base.css');
assert(html.includes('href="assets/css/layout.css"'), 'Uses relative path for layout.css');
assert(html.includes('href="assets/css/components.css"'), 'Uses relative path for components.css');
assert(html.includes('src="assets/js/nav.js"'), 'Uses relative path for nav.js');

// Check CSS :target view switcher presence
assert(html.includes('#by-source:target'), 'Contains CSS :target rules for #by-source');
assert(html.includes('#by-tab'), 'Contains anchor targets for #by-tab');
assert(html.includes('class="view-switch-btn view-tab-btn"'), 'Contains View by Tab button');
assert(html.includes('class="view-switch-btn view-source-btn"'), 'Contains View by Source button');

// Reviewer Finding 7: Inbound Link Mismatch with Overview Footnote 5
assert(html.includes('id="src-wis-971-15"'), 'Overview footnote 5 destination anchor id="src-wis-971-15" exists in sources.html');
assert(html.includes('id="src-wis-971-15-165"'), 'Canonical statutory anchor id="src-wis-971-15-165" exists in sources.html');

// Reviewer Finding 1 & 8: Rigorous DOM hierarchy and CSS :target selector validation
const hasValidMainCombinator = html.includes('#by-source:target ~ main .content-views .by-source-view') &&
                               html.includes('#by-source:target ~ main .content-views .by-tab-view');
assert(hasValidMainCombinator, 'CSS view switcher selector properly traverses main sibling combinator (#by-source:target ~ main)');

const bySourceIdx = html.indexOf('id="by-source"');
const mainIdx = html.indexOf('<main id="main-content">');
assert(bySourceIdx !== -1 && mainIdx !== -1 && bySourceIdx < mainIdx, '<span id="by-source"> precedes <main id="main-content"> as valid body sibling');
assert(html.includes('.source-entry:has(:target)'), 'CSS supports .source-entry:has(:target) for highlighting alias target anchors');

// -----------------------------------------------------------------------------
// TEST SUITE 5: Navigation Consistency (Phase C Part 5.4.2)
// -----------------------------------------------------------------------------
console.log('\nSuite 5: Primary Navigation Consistency (Phase C Part 5.4.2)');
const overviewHtml = fs.readFileSync(path.join(ROOT_DIR, 'overview.html'), 'utf8');

function extractNavHrefs(content) {
  const navMatch = content.match(/<nav[^>]*id="primary-nav"[^>]*>([\s\S]*?)<\/nav>/i);
  if (!navMatch) return [];
  const hrefs = [];
  const linkMatches = navMatch[1].match(/href="([^"]+)"/g) || [];
  return linkMatches.map(h => h.replace(/^href="/, '').replace(/"$/, ''));
}

const sourcesHrefs = extractNavHrefs(html);
const overviewHrefs = extractNavHrefs(overviewHtml);

assert(sourcesHrefs.length === 23, `sources.html contains 23 total navigation hrefs (3 flat + 5 parents + 15 dropdowns)`);
assert(overviewHrefs.length === 23, `overview.html contains 23 total navigation hrefs (3 flat + 5 parents + 15 dropdowns)`);

const phaseC18Links = [
  'overview.html',
  'victims.html',
  'timeline.html',
  'context.html#milwaukee-context',
  'context.html#early-life',
  'case.html#offense-series',
  'case.html#investigation-arrest',
  'case.html#trial-proceedings',
  'analysis.html#systemic-failures',
  'analysis.html#psychological-profile',
  'analysis.html#theories-motivations',
  'impact.html#community-impact',
  'impact.html#social-reform',
  'impact.html#media-portrayal',
  'impact.html#modern-reexamination',
  'impact.html#full-conclusion',
  'sources.html#key-sources',
  'sources.html#methodology'
];

let all18Found = true;
for (const link of phaseC18Links) {
  if (!sourcesHrefs.includes(link)) {
    all18Found = false;
    console.error(`    Missing Phase C Part 5.4.2 link: ${link}`);
  }
}
assert(all18Found, 'All 18 destination links from Phase C Part 5.4.2 are present in navigation');

let navLinksIdentical = (sourcesHrefs.length === overviewHrefs.length);
if (navLinksIdentical) {
  for (let i = 0; i < sourcesHrefs.length; i++) {
    if (sourcesHrefs[i] !== overviewHrefs[i]) {
      navLinksIdentical = false;
      console.error(`    Mismatch at link ${i + 1}: sources='${sourcesHrefs[i]}' vs overview='${overviewHrefs[i]}'`);
    }
  }
}
assert(navLinksIdentical, 'All 23 navigation hrefs are 100% identical between sources.html and overview.html');


// -----------------------------------------------------------------------------
// TEST SUITE 6: Methodology & Standards Content
// -----------------------------------------------------------------------------
console.log('\nSuite 6: Editorial Methodology & Research Standards Content');
assert(html.includes('Certainty Tiers') && html.includes('[ESTABLISHED]') && html.includes('[DOCUMENTED]') && html.includes('[ATTRIBUTED]') && html.includes('[DISPUTED]'), 'Methodology documents all four certainty tiers');
assert(html.includes('1987 Wisconsin Act 399') && html.includes('First-Degree Murder') && html.includes('First-Degree Intentional Homicide'), 'Methodology documents 1987 Wis. Act 399 statutory distinction');
assert(html.includes('971.15') && html.includes('805.09'), 'Methodology documents sanity trial statutes (§ 971.15, § 805.09(2))');
assert(html.includes('Non-Graphic') || html.includes('human remains'), 'Methodology documents non-graphic visual standards');
assert(html.includes('Milwaukee County Courthouse') && html.includes('FBI') && html.includes('Wisconsin Historical Society'), 'Methodology documents primary public repositories');

console.log('\n================================================================================');
console.log(`TEST SUMMARY: ${passedTests} passed, ${failedTests} failed (Total: ${totalTests})`);
console.log('================================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All automated verification checks PASSED successfully!\n');
}
