/**
 * tests/test_offline_links_adversarial.js
 * 
 * EMPIRICAL ADVERSARIAL CHALLENGER TEST SUITE:
 * Offline Browsing (file://), External CDN/Remote Assets, Network Isolation, 
 * Anchor Topology & Cross-Reference Integrity across sources.html, overview.html, and index.html.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_FILES = ['sources.html', 'overview.html', 'index.html'];

console.log('================================================================================');
console.log('ADVERSARIAL CHALLENGE: OFFLINE BROWSING & LINK TOPOLOGY AUDIT');
console.log('Targets: sources.html, overview.html, index.html');
console.log('================================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const findings = [];

function recordResult(passed, checkName, details = '', severity = 'CRITICAL') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`  ✓ PASS: ${checkName}`);
  } else {
    failedChecks++;
    findings.push({ severity, checkName, details });
    console.error(`  ✗ FAIL [${severity}]: ${checkName}`);
    if (details) {
      console.error(`      Details: ${details}`);
    }
  }
}

// -----------------------------------------------------------------------------
// CHECK 1: ZERO EXTERNAL CDN URLS OR REMOTE ASSET FETCHES
// -----------------------------------------------------------------------------
console.log('--- TEST 1: REMOTE ASSET FETCHES & CDN AUDIT ---');

const REMOTE_ASSET_TAG_REGEX = /<(link|script|img|iframe|object|embed|video|audio|source)\b([^>]*?)>/gi;
const REMOTE_URL_REGEX = /(?:href|src|data)=["'](https?:\/\/|\/\/)[^"']*["']/i;
const PRECONNECT_REGEX = /rel=["'](?:preconnect|dns-prefetch)["']/i;

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check <link>, <script>, <img>, etc. for remote URLs or preconnects
  const remoteAssetMatches = [];
  let match;
  REMOTE_ASSET_TAG_REGEX.lastIndex = 0;
  while ((match = REMOTE_ASSET_TAG_REGEX.exec(content)) !== null) {
    const fullTag = match[0];
    const tagAttrs = match[2];
    
    // Check if tag references a remote URL or preconnect
    if (REMOTE_URL_REGEX.test(tagAttrs) || PRECONNECT_REGEX.test(tagAttrs)) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      remoteAssetMatches.push({ tag: fullTag.trim(), line: lineNum });
    }
  }

  // Check inline styles for url('http...')
  const inlineStyleRemote = [];
  const styleBlockRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleBlockRegex.exec(content)) !== null) {
    const styleContent = styleMatch[1];
    if (/url\(["']?https?:\/\//i.test(styleContent) || /@import\s+["']?https?:\/\//i.test(styleContent)) {
      const lineNum = content.substring(0, styleMatch.index).split('\n').length;
      inlineStyleRemote.push({ line: lineNum, snippet: styleMatch[0].substring(0, 100) });
    }
  }

  const passed = remoteAssetMatches.length === 0 && inlineStyleRemote.length === 0;
  recordResult(
    passed,
    `Zero external CDN / remote asset tags in ${filename}`,
    passed ? '' : `Found ${remoteAssetMatches.length} remote asset tags:\n` +
      remoteAssetMatches.map(m => `        Line ${m.line}: ${m.tag}`).join('\n') +
      (inlineStyleRemote.length > 0 ? `\n      Inline remote styles: ${JSON.stringify(inlineStyleRemote)}` : ''),
    'CRITICAL'
  );
});

// Linked CSS files for remote @import or url(...)
console.log('\n--- TEST 1b: LINKED CSS AUDIT FOR REMOTE ASSET FETCHES ---');
const CSS_DIR = path.join(ROOT_DIR, 'assets', 'css');
if (fs.existsSync(CSS_DIR)) {
  fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css')).forEach(cssFile => {
    const cssPath = path.join(CSS_DIR, cssFile);
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const hasRemote = /url\(["']?https?:\/\//i.test(cssContent) || /@import\s+["']?https?:\/\//i.test(cssContent);
    recordResult(
      !hasRemote,
      `Zero remote URL imports in assets/css/${cssFile}`,
      hasRemote ? `Remote asset reference found in ${cssFile}` : '',
      'HIGH'
    );
  });
}

// -----------------------------------------------------------------------------
// CHECK 2: ZERO RUNTIME NETWORK CALLS (fetch, XMLHttpRequest, WebSocket, etc.)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 2: RUNTIME NETWORK FETCH CALL AUDIT ---');

const RUNTIME_FETCH_REGEX = /\b(fetch\s*\(|new\s+XMLHttpRequest\b|jQuery\.ajax\b|\$\.ajax\b|axios\b|new\s+WebSocket\b|new\s+EventSource\b|navigator\.sendBeacon\b)/i;

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all <script> blocks
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  const scriptCalls = [];
  while ((scriptMatch = scriptRegex.exec(content)) !== null) {
    const scriptBody = scriptMatch[1];
    if (RUNTIME_FETCH_REGEX.test(scriptBody)) {
      const lineNum = content.substring(0, scriptMatch.index).split('\n').length;
      scriptCalls.push({ line: lineNum, snippet: scriptBody.substring(0, 100) });
    }
  }

  const passed = scriptCalls.length === 0;
  recordResult(
    passed,
    `Zero runtime network fetch calls in inline scripts of ${filename}`,
    passed ? '' : `Found network calls:\n` + scriptCalls.map(c => `        Line ${c.line}: ${c.snippet}`).join('\n'),
    'CRITICAL'
  );
});

// Check external linked JS files
console.log('\n--- TEST 2b: LINKED JS AUDIT FOR RUNTIME NETWORK FETCH CALLS ---');
const JS_DIR = path.join(ROOT_DIR, 'assets', 'js');
if (fs.existsSync(JS_DIR)) {
  fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js')).forEach(jsFile => {
    const jsPath = path.join(JS_DIR, jsFile);
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const hasFetch = RUNTIME_FETCH_REGEX.test(jsContent);
    recordResult(
      !hasFetch,
      `Zero runtime fetch calls in assets/js/${jsFile}`,
      hasFetch ? `Runtime fetch found in ${jsFile}` : '',
      'CRITICAL'
    );
  });
}

// -----------------------------------------------------------------------------
// CHECK 3: ROOT-RELATIVE PATH AUDIT (file:// BROWSABILITY HAZARD)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 3: OFFLINE file:// PROTOCOL PATH AUDIT (NO ROOT-RELATIVE PATHS) ---');

const ROOT_RELATIVE_REGEX = /\b(href|src|data)=["'](\/[a-zA-Z0-9_\-][^"']*)["']/gi;

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const rootRelativeMatches = [];
  let m;
  ROOT_RELATIVE_REGEX.lastIndex = 0;
  while ((m = ROOT_RELATIVE_REGEX.exec(content)) !== null) {
    const lineNum = content.substring(0, m.index).split('\n').length;
    rootRelativeMatches.push({ attr: m[1], val: m[2], line: lineNum });
  }

  const passed = rootRelativeMatches.length === 0;
  recordResult(
    passed,
    `Zero root-relative paths (/...) in ${filename} (ensures file:// compatibility)`,
    passed ? '' : `Found root-relative paths:\n` + rootRelativeMatches.map(r => `        Line ${r.line}: ${r.attr}="${r.val}"`).join('\n'),
    'HIGH'
  );
});

// -----------------------------------------------------------------------------
// CHECK 4: LOCAL ASSET EXISTENCE ON DISK
// -----------------------------------------------------------------------------
console.log('\n--- TEST 4: LOCAL ASSET EXISTENCE AUDIT ---');

const LOCAL_ASSET_REGEX = /\b(?:src|href)=["']([^"':#?]+(?:\.css|\.js|\.png|\.jpg|\.svg|\.pdf|\.json))["']/gi;

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const missingAssets = [];
  let m;
  LOCAL_ASSET_REGEX.lastIndex = 0;
  while ((m = LOCAL_ASSET_REGEX.exec(content)) !== null) {
    const relAssetPath = m[1];
    const resolvedPath = path.resolve(ROOT_DIR, relAssetPath);
    if (!fs.existsSync(resolvedPath)) {
      const lineNum = content.substring(0, m.index).split('\n').length;
      missingAssets.push({ asset: relAssetPath, line: lineNum });
    }
  }

  const passed = missingAssets.length === 0;
  recordResult(
    passed,
    `All referenced local assets in ${filename} exist on disk`,
    passed ? '' : `Missing assets referenced from ${filename}:\n` + missingAssets.map(a => `        Line ${a.line}: ${a.asset}`).join('\n'),
    'HIGH'
  );
});

// -----------------------------------------------------------------------------
// CHECK 5: DOM ID UNIQUENESS & ANCHOR REGISTRATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST 5: DOM ID & ANCHOR PARSING ACROSS PAGES ---');

const domIdsByFile = {};
const hrefsByFile = {};

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Collect all IDs
  const idRegex = /\bid=["']([^"']+)["']/gi;
  const ids = new Set();
  const duplicateIds = [];
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    const id = m[1];
    if (ids.has(id)) {
      duplicateIds.push(id);
    }
    ids.add(id);
  }

  // Also collect <a name="...">
  const nameRegex = /<a\b[^>]*\bname=["']([^"']+)["']/gi;
  while ((m = nameRegex.exec(content)) !== null) {
    ids.add(m[1]);
  }

  domIdsByFile[filename] = ids;

  recordResult(
    duplicateIds.length === 0,
    `Zero duplicate DOM IDs in ${filename} (${ids.size} unique IDs registered)`,
    duplicateIds.length > 0 ? `Duplicates: ${duplicateIds.join(', ')}` : '',
    'HIGH'
  );

  // Collect all hrefs in <a> tags
  const aHrefRegex = /<a\b[^>]*\bhref=["']([^"']*)["']/gi;
  const hrefs = [];
  while ((m = aHrefRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, m.index).split('\n').length;
    hrefs.push({ href: m[1], line: lineNum });
  }
  hrefsByFile[filename] = hrefs;
});

// -----------------------------------------------------------------------------
// CHECK 6: INTRA-PAGE ANCHOR RESOLUTION (href="#anchor")
// -----------------------------------------------------------------------------
console.log('\n--- TEST 6: INTRA-PAGE ANCHOR RESOLUTION ---');

HTML_FILES.forEach(filename => {
  const registeredIds = domIdsByFile[filename];
  const hrefs = hrefsByFile[filename];
  
  const brokenIntraAnchors = [];
  hrefs.forEach(({ href, line }) => {
    if (href.startsWith('#') && href.length > 1) {
      const anchor = href.substring(1);
      if (!registeredIds.has(anchor)) {
        brokenIntraAnchors.push({ href, line });
      }
    }
  });

  const passed = brokenIntraAnchors.length === 0;
  recordResult(
    passed,
    `All intra-page anchors (#...) in ${filename} resolve cleanly (${hrefs.filter(h => h.href.startsWith('#') && h.href.length > 1).length} checked)`,
    passed ? '' : `Found ${brokenIntraAnchors.length} unresolved intra-page anchors in ${filename}:\n` +
      brokenIntraAnchors.map(b => `        Line ${b.line}: ${b.href}`).join('\n'),
    'HIGH'
  );
});

// -----------------------------------------------------------------------------
// CHECK 7: CROSS-PAGE LINK & ANCHOR RESOLUTION (overview <-> sources <-> index)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 7: CROSS-PAGE LINK & ANCHOR RESOLUTION ---');

HTML_FILES.forEach(sourceFile => {
  const hrefs = hrefsByFile[sourceFile];
  const brokenCrossLinks = [];
  let evaluatedLinks = 0;

  hrefs.forEach(({ href, line }) => {
    let targetPage = null;
    let targetAnchor = null;

    if (href.startsWith('sources.html')) {
      targetPage = 'sources.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    } else if (href.startsWith('overview.html')) {
      targetPage = 'overview.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    } else if (href.startsWith('index.html')) {
      targetPage = 'index.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    }

    if (targetPage) {
      evaluatedLinks++;
      const targetIds = domIdsByFile[targetPage];
      if (targetAnchor && !targetIds.has(targetAnchor)) {
        brokenCrossLinks.push({ sourceFile, href, targetPage, targetAnchor, line });
      }
    }
  });

  const passed = brokenCrossLinks.length === 0;
  recordResult(
    passed,
    `All cross-page links from ${sourceFile} into target HTML pages resolve (${evaluatedLinks} checked)`,
    passed ? '' : `Found ${brokenCrossLinks.length} unresolved cross-page links from ${sourceFile}:\n` +
      brokenCrossLinks.map(b => `        Line ${b.line}: href="${b.href}" (target anchor #${b.targetAnchor} not found in ${b.targetPage})`).join('\n'),
    'CRITICAL'
  );
});

// -----------------------------------------------------------------------------
// CHECK 8: CANONICAL PERMALINKS IN overview.html (#src-<canonical-id>)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 8: CANONICAL PERMALINKS AUDIT (overview.html -> sources.html) ---');

const overviewHrefs = hrefsByFile['overview.html'];
const sourcesIds = domIdsByFile['sources.html'];

const canonicalSrcLinks = [];
overviewHrefs.forEach(({ href, line }) => {
  if (href.includes('sources.html#src-') || href.startsWith('#src-')) {
    const srcId = href.split('#')[1];
    canonicalSrcLinks.push({ srcId, fullHref: href, line });
  }
});

console.log(`  Identified ${canonicalSrcLinks.length} canonical source permalinks in overview.html:`);
canonicalSrcLinks.forEach((item, i) => {
  const exists = sourcesIds.has(item.srcId);
  console.log(`    [fn-${i + 1}] Line ${item.line}: #${item.srcId} -> ${exists ? 'RESOLVED' : 'FAILED (NOT FOUND)'}`);
});

const missingPermalinks = [];
canonicalSrcLinks.forEach(({ srcId, fullHref, line }) => {
  if (!sourcesIds.has(srcId)) {
    missingPermalinks.push({ srcId, fullHref, line });
  }
});

recordResult(
  canonicalSrcLinks.length >= 41,
  `overview.html contains at least 41 canonical permalinks (found ${canonicalSrcLinks.length})`,
  `Expected at least 41, found ${canonicalSrcLinks.length}`,
  'HIGH'
);

recordResult(
  missingPermalinks.length === 0,
  `Every canonical permalink (#src-...) in overview.html exists in sources.html`,
  missingPermalinks.length > 0 ? `Unresolved canonical permalinks in sources.html:\n` +
    missingPermalinks.map(m => `        Line ${m.line}: ${m.fullHref}`).join('\n') : '',
  'CRITICAL'
);

// Verify canonical IDs against assets/data/sources.json
console.log('\n--- TEST 8b: CANONICAL ID CONCORDANCE WITH sources.json ---');
const sourcesJsonPath = path.join(ROOT_DIR, 'assets', 'data', 'sources.json');
if (fs.existsSync(sourcesJsonPath)) {
  const sourcesJson = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf8'));
  const jsonCanonicalIds = new Set(sourcesJson.canonical.map(c => `src-${c.id}`));
  
  const unmappedOverviewIds = [];
  canonicalSrcLinks.forEach(({ srcId, line }) => {
    if (!jsonCanonicalIds.has(srcId)) {
      unmappedOverviewIds.push({ srcId, line });
    }
  });

  recordResult(
    unmappedOverviewIds.length === 0,
    `All canonical IDs in overview.html match canonical entries in sources.json`,
    unmappedOverviewIds.length > 0 ? `Unmapped in sources.json:\n` +
      unmappedOverviewIds.map(u => `        Line ${u.line}: #${u.srcId}`).join('\n') : '',
    'HIGH'
  );

  const missingJsonInHtml = [];
  jsonCanonicalIds.forEach(id => {
    if (!sourcesIds.has(id)) {
      missingJsonInHtml.push(id);
    }
  });

  recordResult(
    missingJsonInHtml.length === 0,
    `All ${jsonCanonicalIds.size} canonical IDs in sources.json exist as DOM anchors in sources.html`,
    missingJsonInHtml.length > 0 ? `Missing in sources.html: ${missingJsonInHtml.join(', ')}` : '',
    'CRITICAL'
  );
}

// -----------------------------------------------------------------------------
// CHECK 9: NAVIGATION TARGET ANCHOR AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- TEST 9: NAVIGATION TARGET ANCHOR AUDIT ---');

HTML_FILES.forEach(filename => {
  const filePath = path.join(ROOT_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract <nav ...> ... </nav> block
  const navBlockMatch = content.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/i);
  if (!navBlockMatch) {
    recordResult(false, `Navigation block found in ${filename}`, 'No <nav> element found', 'HIGH');
    return;
  }

  const navContent = navBlockMatch[1];
  const aHrefRegex = /<a\b[^>]*\bhref=["']([^"']*)["']/gi;
  let m;
  const navHrefs = [];
  while ((m = aHrefRegex.exec(navContent)) !== null) {
    navHrefs.push(m[1]);
  }

  const brokenNavTargets = [];
  navHrefs.forEach(href => {
    let targetPage = null;
    let targetAnchor = null;

    if (href.startsWith('sources.html')) {
      targetPage = 'sources.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    } else if (href.startsWith('overview.html')) {
      targetPage = 'overview.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    } else if (href.startsWith('index.html')) {
      targetPage = 'index.html';
      const parts = href.split('#');
      if (parts.length > 1) targetAnchor = parts[1];
    }

    if (targetPage && targetAnchor) {
      const targetIds = domIdsByFile[targetPage];
      if (!targetIds.has(targetAnchor)) {
        brokenNavTargets.push({ href, targetPage, targetAnchor });
      }
    }
  });

  const passed = brokenNavTargets.length === 0;
  recordResult(
    passed,
    `All navigation links in ${filename} targeting existing HTML pages resolve (${navHrefs.length} nav links)`,
    passed ? '' : `Broken nav targets in ${filename}:\n` +
      brokenNavTargets.map(b => `        href="${b.href}" (target #${b.targetAnchor} not found in ${b.targetPage})`).join('\n'),
    'CRITICAL'
  );
});

// -----------------------------------------------------------------------------
// CHECK 10: VIEW SWITCHING INTEGRITY (#by-tab and #by-source)
// -----------------------------------------------------------------------------
console.log('\n--- TEST 10: DUAL-VIEW SWITCHING INTEGRITY IN sources.html ---');
const sourcesHtml = fs.readFileSync(path.join(ROOT_DIR, 'sources.html'), 'utf8');

const hasByTabAnchor = sourcesHtml.includes('id="by-tab"');
const hasBySourceAnchor = sourcesHtml.includes('id="by-source"');
const hasViewSwitchCss = sourcesHtml.includes('#by-source:target');

recordResult(
  hasByTabAnchor && hasBySourceAnchor && hasViewSwitchCss,
  `sources.html contains complete CSS :target Dual-View switching mechanics (#by-tab and #by-source)`,
  `hasByTab: ${hasByTabAnchor}, hasBySource: ${hasBySourceAnchor}, hasViewSwitchCss: ${hasViewSwitchCss}`,
  'HIGH'
);

// -----------------------------------------------------------------------------
// SUMMARY & VERDICT
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log('AUDIT SUMMARY');
console.log('================================================================================');
console.log(`Total Checks Evaluated: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);

if (findings.length > 0) {
  console.log('\nFAILURES / FINDINGS REQUIRING ATTENTION:');
  findings.forEach((f, idx) => {
    console.log(`\n[Finding ${idx + 1}] [${f.severity}] ${f.checkName}`);
    if (f.details) console.log(`   ${f.details}`);
  });
}

const finalVerdict = failedChecks === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
console.log('\n================================================================================');
console.log(`CHALLENGER VERDICT: ${finalVerdict}`);
console.log('================================================================================\n');

process.exit(failedChecks === 0 ? 0 : 1);
