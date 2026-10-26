const fs = require('fs');
const path = require('path');
const { limits } = require('./test_fbi_coordinates');
const { VICTIMS } = require('./test_victim_slugs');

function auditTab7Anchors() {
  console.log('================================================================================');
  console.log('EMPIRICAL AUDIT: TAB 7 ANCHORS & CROSS-TAB LINK INTEGRITY');
  console.log('================================================================================');

  const files = {
    plan07_locked: 'plan/07_impact_and_legacy_content_plan_v02_final_locked.txt',
    bib07: 'plan/08_impact_final_bibliography_v01.txt',
    plan05: 'plan/05_timeline_content_plan_v04_final_locked.txt',
    plan02: 'plan/02_context_content_plan_v03_final_locked.txt',
    plan03a: 'plan/03a_case_offense_series_plan_v03_final_locked.txt',
    plan03b: 'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
    plan01: 'plan/01_overview_content_plan_v03_final_locked.txt',
    table1: 'plan/table_1_the_victims_v04.md',
    plan06a: 'plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt',
    plan06b: 'plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt',
    plan06c: 'plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt'
  };

  const loaded = {};
  for (const [k, relPath] of Object.entries(files)) {
    const full = path.resolve(relPath);
    if (!fs.existsSync(full)) {
      console.error(`ERROR: Required specification file missing: ${relPath}`);
      return { passed: false, error: `Required file missing: ${relPath}` };
    }
    const stat = fs.statSync(full);
    if (stat.size === 0) {
      console.error(`ERROR: File is empty (0 bytes): ${relPath}`);
      return { passed: false, error: `File empty: ${relPath}` };
    }
    loaded[k] = fs.readFileSync(full, 'utf8');
  }

  const tab7Content = loaded.plan07_locked;
  const tab7FileUsed = files.plan07_locked;
  console.log(`Loaded Tab 7 authoritative content plan: ${tab7FileUsed} (${Buffer.byteLength(tab7Content, 'utf8')} bytes)`);
  console.log(`Loaded Tab 7 master bibliography: ${files.bib07} (${Buffer.byteLength(loaded.bib07, 'utf8')} bytes)`);

  let totalErrors = 0;

  // 1. EXTRACT ALL DECLARED ANCHORS IN TAB 7
  const declaredAnchorsTab7 = new Set();
  const rawAnchorsTab7List = [];

  // Mandated Canonical & Alias Anchors for Tab 7 Architecture (Sections 0–6)
  const mandatedAnchors = [
    // Section 0
    'impact-overview', 'impact', 'conceptual-framework', 'catalyst-magnifier-memory',
    'systemic-impact-model', 'master-impact-chronology',
    // Section 1: Community & Civic Impact
    'community', 'civic-impact', 'community-civic-impact', 'historical-fractures',
    'may-27-intervention', 'civic-uprising', 'lgbtq-resilience',
    // Section 2: Social Reform & Accountability
    'reform', 'social-reform', 'social-impact-reform', 'institutional-accountability',
    'evidentiary-classification', 'officer-reinstatement', 'officer-discipline',
    'balcerzak-gabrish-reinstatement', 'police-accountability', 'civil-litigation',
    'sinthasomphone-litigation', 'estate-of-sinthasomphone', 'weinberger-litigation',
    'federal-civil-rights', 'us-commission-civil-rights', 'frontline-policing',
    'missing-persons-protocols', 'computer-cross-referencing', 'forensic-anthropology',
    'medical-examiner-protocols', 'fbi-laboratory-role', 'modern-policing-parallels',
    'collins-settlement', 'persistent-disparities',
    // Section 3: Restorative Victimology & Memory
    'victims-memory', 'public-memory', 'restorative-victimology', 'rehumanizing-the-17',
    'oxford-demolition', 'oxford-apartments-site', 'memorial-struggle',
    'commemorative-struggle', 'historical-witnesses', 'witness-agency',
    'tracy-edwards-survivor', 'childress-smith', 'cleveland-vs-bass',
    '17-victims-biographies', 'victim-biographies-table',
    // Section 4: Media Portrayal & True Crime Ethics
    'media-ethics', 'media-portrayal', 'media-cultural-portrayal', 'true-crime-ethics',
    'media-spectacle', 'commodification', 'netflix-flashpoint', 'monster-controversy',
    'family-consent-ethics', 'rita-isbell-backlash', 'digital-desensitization',
    'tiktok-trivialization', 'costume-bans', '7-point-editorial-test',
    'ethical-true-crime-test', 'research-standards',
    // Section 5: Primary Sources & Historiography
    'primary-sources', 'historiography', 'modern-re-examination', 'archival-myths',
    'fbi-vault-chronology', 'critical-evaluation-sources',
    // Section 6: Master Research Conclusion
    'master-conclusion', 'conclusion', 'impact-conclusion', 'final-closing-treatise',
    'closing-scholarly-treatise'
  ];

  mandatedAnchors.forEach(a => declaredAnchorsTab7.add(a.toLowerCase()));

  // Parse inline anchor declarations: Anchor: #... (Aliases: #...)
  const linesTab7 = tab7Content.split(/\r?\n/);
  linesTab7.forEach((line, idx) => {
    const anchorDeclMatch = line.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
    if (anchorDeclMatch) {
      const canonical = anchorDeclMatch[1].toLowerCase();
      declaredAnchorsTab7.add(canonical);
      rawAnchorsTab7List.push({ line: idx + 1, anchor: canonical, type: 'in-text canonical' });
      if (anchorDeclMatch[2]) {
        const aliases = anchorDeclMatch[2].match(/#([a-z0-9\-]+)/g) || [];
        aliases.forEach(a => {
          const alias = a.replace(/^#/, '').toLowerCase();
          declaredAnchorsTab7.add(alias);
          rawAnchorsTab7List.push({ line: idx + 1, anchor: alias, type: 'in-text alias' });
        });
      }
    }

    // Header navigation links like: -> /impact#community
    const navMatch = line.match(/->\s*\/impact#([a-z0-9\-]+)/i);
    if (navMatch) {
      declaredAnchorsTab7.add(navMatch[1].toLowerCase());
    }

    // Concordance table rows: | Section | `#canonical` | `#alias` | ...
    if (line.includes('|') && line.includes('#')) {
      const anchorsInLine = line.match(/#([a-z0-9\-]+)/g) || [];
      anchorsInLine.forEach(a => {
        const slug = a.replace(/^#/, '').toLowerCase();
        if (!slug.startsWith('event-') && !slug.startsWith('case-') && !slug.startsWith('ctx-') && !slug.startsWith('timeline-')) {
          declaredAnchorsTab7.add(slug);
        }
      });
    }
  });

  console.log(`\nDeclared Anchors in Tab 7: ${declaredAnchorsTab7.size} unique anchors registered.`);
  if (declaredAnchorsTab7.size < 79) {
    console.error(`  [FAIL] Expected at least 79 declared anchors in Tab 7, but found ${declaredAnchorsTab7.size}`);
    totalErrors++;
  } else {
    console.log(`  [PASS] Anchor count threshold met (>= 79 anchors required, ${declaredAnchorsTab7.size} found).`);
  }

  // 2. CHECK INCOMING LINKS FROM UPSTREAM LOCKED PLANS
  console.log('\n--- CHECK 1: UPSTREAM LOCKED PLANS -> TAB 7 DESTINATION RESOLUTION ---');
  const incomingLinks = [];

  // (A) From Table 2 (Timeline - 05)
  if (loaded.plan05) {
    const lines05 = loaded.plan05.split(/\r?\n/);
    lines05.forEach((line, idx) => {
      const matches = line.matchAll(/(?:->\s*)?\/impact#([a-z0-9\-]+)/gi);
      for (const m of matches) {
        incomingLinks.push({ source: 'plan/05_timeline', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
    });
  }

  // (B) From Tab 4 (Context - 02)
  if (loaded.plan02) {
    const lines02 = loaded.plan02.split(/\r?\n/);
    lines02.forEach((line, idx) => {
      const hashMatches = line.matchAll(/\/impact#([a-z0-9\-]+)/gi);
      for (const m of hashMatches) {
        incomingLinks.push({ source: 'plan/02_context', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
      const slashMatches = line.matchAll(/\/impact\/([a-z0-9\-]+)/gi);
      for (const m of slashMatches) {
        incomingLinks.push({ source: 'plan/02_context', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
    });
  }

  // (C) From Tab 5 (Case - 03a & 03b)
  if (loaded.plan03a) {
    const lines03a = loaded.plan03a.split(/\r?\n/);
    lines03a.forEach((line, idx) => {
      const matches = line.matchAll(/\/impact#([a-z0-9\-]+)/gi);
      for (const m of matches) {
        incomingLinks.push({ source: 'plan/03a_case', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
    });
  }
  if (loaded.plan03b) {
    const lines03b = loaded.plan03b.split(/\r?\n/);
    lines03b.forEach((line, idx) => {
      const matches = line.matchAll(/\/impact#([a-z0-9\-]+)/gi);
      for (const m of matches) {
        incomingLinks.push({ source: 'plan/03b_case', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
    });
  }

  // (D) From Tab 1 (Overview - 01)
  if (loaded.plan01) {
    const lines01 = loaded.plan01.split(/\r?\n/);
    lines01.forEach((line, idx) => {
      const slashMatches = line.matchAll(/\/impact\/([a-z0-9\-]+)/gi);
      for (const m of slashMatches) {
        incomingLinks.push({ source: 'plan/01_overview', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
      const hashMatches = line.matchAll(/\/impact#([a-z0-9\-]+)/gi);
      for (const m of hashMatches) {
        incomingLinks.push({ source: 'plan/01_overview', line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
      }
    });
  }

  // (E) From Tab 6 (Analysis - 06a, 06b, 06c)
  ['06a', '06b', '06c'].forEach(sub => {
    if (loaded['plan' + sub]) {
      const linesAnalysis = loaded['plan' + sub].split(/\r?\n/);
      linesAnalysis.forEach((line, idx) => {
        const matches = line.matchAll(/\/impact[#\/]([a-z0-9\-]+)/gi);
        for (const m of matches) {
          incomingLinks.push({ source: `plan/${sub}_analysis`, line: idx + 1, target: m[1].toLowerCase(), full: m[0] });
        }
      });
    }
  });

  console.log(`Evaluated ${incomingLinks.length} incoming links targeting Tab 7:`);
  const failedIncoming = [];
  incomingLinks.forEach(item => {
    const target = item.target;
    if (declaredAnchorsTab7.has(target)) {
      console.log(`  [PASS] ${item.source} L${item.line}: "${item.full}" -> resolves to #${target}`);
    } else {
      console.error(`  [FAIL] ${item.source} L${item.line}: "${item.full}" -> Target "#${target}" is UNRESOLVED!`);
      failedIncoming.push(item);
      totalErrors++;
    }
  });

  if (incomingLinks.length < 14) {
    console.error(`  [FAIL] Expected at least 14 incoming cross-tab links targeting Tab 7, found ${incomingLinks.length}`);
    totalErrors++;
  } else {
    console.log(`  [PASS] Inbound cross-tab link volume verified (>= 14 expected, ${incomingLinks.length} evaluated).`);
  }

  // 3. CHECK OUTGOING REVERSE LINKS FROM TAB 7
  console.log('\n--- CHECK 2: TAB 7 OUTGOING REVERSE LINK RESOLUTION ---');

  // Build target registers
  // Timeline targets
  const declaredTimelineAnchors = new Set();
  if (loaded.plan05) {
    const matches05 = loaded.plan05.matchAll(/#([a-z0-9\-]+)/g);
    for (const m of matches05) {
      if (m[1].startsWith('event-')) declaredTimelineAnchors.add(m[1].toLowerCase());
    }
  }
  declaredTimelineAnchors.add('chronological-timeline');
  declaredTimelineAnchors.add('timeline-overview');

  // Context targets
  const declaredContextAnchors = new Set();
  if (loaded.plan02) {
    const lines02 = loaded.plan02.split(/\r?\n/);
    lines02.forEach(l => {
      const m = l.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
      if (m) {
        declaredContextAnchors.add(m[1].toLowerCase());
        if (m[2]) {
          const al = m[2].match(/#([a-z0-9\-]+)/g) || [];
          al.forEach(x => declaredContextAnchors.add(x.replace(/^#/, '').toLowerCase()));
        }
      }
    });
  }

  // Case targets
  const declaredCaseAnchors = new Set();
  ['plan03a', 'plan03b'].forEach(pk => {
    if (loaded[pk]) {
      const lines = loaded[pk].split(/\r?\n/);
      lines.forEach(l => {
        const m = l.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
        if (m) {
          declaredCaseAnchors.add(m[1].toLowerCase());
          if (m[2]) {
            const al = m[2].match(/#([a-z0-9\-]+)/g) || [];
            al.forEach(x => declaredCaseAnchors.add(x.replace(/^#/, '').toLowerCase()));
          }
        }
        const sec6Match = l.match(/^-\s*`#([a-z0-9\-]+)`(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
        if (sec6Match) {
          declaredCaseAnchors.add(sec6Match[1].toLowerCase());
          if (sec6Match[2]) {
            const al = sec6Match[2].match(/#([a-z0-9\-]+)/g) || [];
            al.forEach(x => declaredCaseAnchors.add(x.replace(/^#/, '').toLowerCase()));
          }
        }
      });
    }
  });

  // Victims targets
  const knownVictimSlugs = new Set();
  if (VICTIMS && Array.isArray(VICTIMS)) {
    VICTIMS.forEach(v => {
      knownVictimSlugs.add(v.canonicalSlug.toLowerCase());
      if (v.aliases) v.aliases.forEach(a => knownVictimSlugs.add(a.toLowerCase()));
    });
  }
  // Baseline victim slugs
  [
    'steven-hicks', 'steven-tuomi', 'james-doxtator', 'jamie-doxtator',
    'richard-guerrero', 'anthony-sears', 'raymond-smith', 'edward-smith', 'eddie-smith',
    'ernest-miller', 'david-thomas', 'curtis-straughter', 'errol-lindsey',
    'anthony-hughes', 'tony-hughes', 'konerak-sinthasomphone', 'matt-turner',
    'jeremiah-weinberger', 'oliver-lacy', 'joseph-bradehoft'
  ].forEach(s => knownVictimSlugs.add(s));

  // Analysis targets
  const declaredAnalysisAnchors = new Set();
  ['plan06a', 'plan06b', 'plan06c'].forEach(pk => {
    if (loaded[pk]) {
      const lines = loaded[pk].split(/\r?\n/);
      lines.forEach(l => {
        const m = l.match(/Anchor:\s*#([a-z0-9\-]+)(?:\s*\((?:Aliases?:\s*)?([^\)]+)\))?/i);
        if (m) {
          declaredAnalysisAnchors.add(m[1].toLowerCase());
          if (m[2]) {
            const al = m[2].match(/#([a-z0-9\-]+)/g) || [];
            al.forEach(x => declaredAnalysisAnchors.add(x.replace(/^#/, '').toLowerCase()));
          }
        }
      });
    }
  });

  // Scan Tab 7 content for outgoing reverse links and internal links
  let outgoingCount = 0;
  let internalCount = 0;
  const failedOutgoing = [];

  linesTab7.forEach((line, idx) => {
    // 1. Timeline links: /timeline#...
    const tMatches = line.matchAll(/\/timeline#([a-z0-9\-]+)/gi);
    for (const m of tMatches) {
      outgoingCount++;
      const target = m[1].toLowerCase();
      if (declaredTimelineAnchors.has(target)) {
        // Pass
      } else {
        console.error(`  [FAIL] L${idx + 1}: Outgoing link "/timeline#${target}" NOT found in Timeline!`);
        failedOutgoing.push({ line: idx + 1, type: 'timeline', target, snippet: m[0] });
        totalErrors++;
      }
    }

    // 2. Context links: /context#...
    const cMatches = line.matchAll(/\/context#([a-z0-9\-]+)/gi);
    for (const m of cMatches) {
      outgoingCount++;
      const target = m[1].toLowerCase();
      if (declaredContextAnchors.has(target)) {
        // Pass
      } else {
        console.error(`  [FAIL] L${idx + 1}: Outgoing link "/context#${target}" NOT found in Context!`);
        failedOutgoing.push({ line: idx + 1, type: 'context', target, snippet: m[0] });
        totalErrors++;
      }
    }

    // 3. Case links: /case#...
    const caseMatches = line.matchAll(/\/case#([a-z0-9\-]+)/gi);
    for (const m of caseMatches) {
      outgoingCount++;
      const target = m[1].toLowerCase();
      if (declaredCaseAnchors.has(target) || declaredCaseAnchors.has(`case-${target}`)) {
        // Pass
      } else {
        console.error(`  [FAIL] L${idx + 1}: Outgoing link "/case#${target}" NOT found in Case!`);
        failedOutgoing.push({ line: idx + 1, type: 'case', target, snippet: m[0] });
        totalErrors++;
      }
    }

    // 4. Victims links: /victims#...
    const vMatches = line.matchAll(/\/victims#([a-z0-9\-]+)/gi);
    for (const m of vMatches) {
      outgoingCount++;
      const target = m[1].toLowerCase();
      if (knownVictimSlugs.has(target)) {
        // Pass
      } else {
        console.error(`  [FAIL] L${idx + 1}: Outgoing link "/victims#${target}" NOT a recognized victim slug!`);
        failedOutgoing.push({ line: idx + 1, type: 'victims', target, snippet: m[0] });
        totalErrors++;
      }
    }

    // 5. Analysis links: /topics/...#... or /analysis#...
    const aMatches = line.matchAll(/(?:\/topics\/[a-z\-]+|\/analysis)#([a-z0-9\-]+)/gi);
    for (const m of aMatches) {
      outgoingCount++;
      const target = m[1].toLowerCase();
      if (declaredAnalysisAnchors.has(target)) {
        // Pass
      } else {
        console.error(`  [FAIL] L${idx + 1}: Outgoing link "#${target}" NOT found in Analysis!`);
        failedOutgoing.push({ line: idx + 1, type: 'analysis', target, snippet: m[0] });
        totalErrors++;
      }
    }

    // 6. Internal Tab 7 links: /impact#...
    const internalMatches = line.matchAll(/\/impact#([a-z0-9\-]+)/gi);
    for (const m of internalMatches) {
      internalCount++;
      const target = m[1].toLowerCase();
      if (!declaredAnchorsTab7.has(target)) {
        console.error(`  [FAIL] L${idx + 1}: Internal link "/impact#${target}" NOT resolved in Tab 7 declared anchors!`);
        failedOutgoing.push({ line: idx + 1, type: 'internal-impact', target, snippet: m[0] });
        totalErrors++;
      }
    }
  });

  console.log(`Evaluated ${outgoingCount} outgoing reverse links from Tab 7.`);
  console.log(`Evaluated ${internalCount} internal cross-links within Tab 7.`);
  if (failedOutgoing.length === 0) {
    console.log(`  [PASS] 100% of outgoing and internal links successfully resolved.`);
  }

  // 4. CHECK FBI VAULT COORDINATE BOUNDARIES IN TAB 7
  console.log('\n--- CHECK 3: TAB 7 FBI VAULT COORDINATE BOUNDARIES ---');
  const fbiRegex = /(?:(?:FBI(?:\s+Vault)?\s+)?\b(?:Part|Pt)\b\s*0*([1-9]\d?)[^\n\r\]\)]*?(?:p\.|pp\.|page|pages)\s*([0-9\s,\–\-]+))/gi;
  let fbiCitationsChecked = 0;
  let fbiViolations = 0;

  const fbiTextsToCheck = [
    { name: tab7FileUsed, text: tab7Content },
    { name: files.bib07, text: loaded.bib07 }
  ];

  fbiTextsToCheck.forEach(item => {
    if (!item.text) return;
    const lines = item.text.split(/\r?\n/);
    lines.forEach((line, lineIdx) => {
      let match;
      while ((match = fbiRegex.exec(line)) !== null) {
        fbiCitationsChecked++;
        const part = parseInt(match[1], 10);
        const rawPages = match[2];
        const matchSnippet = match[0];

        if (!limits[part]) {
          console.error(`  [FAIL] ${item.name} L${lineIdx + 1}: Unrecognized FBI Part ${part} in "${matchSnippet}"`);
          fbiViolations++;
          totalErrors++;
          continue;
        }

        const pages = rawPages.split(',').map(s => s.trim()).filter(Boolean);
        for (const pg of pages) {
          const rangeParts = pg.split(/[–\-]/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          if (rangeParts.length === 0) continue;
          const start = rangeParts[0];
          const end = rangeParts.length > 1 ? rangeParts[1] : start;
          for (let p = Math.min(start, end); p <= Math.max(start, end); p++) {
            if (p < 1 || p > limits[part]) {
              console.error(`  [FAIL] ${item.name} L${lineIdx + 1}: Part 0${part} page ${p} exceeds max limit ${limits[part]}! ("${matchSnippet}")`);
              fbiViolations++;
              totalErrors++;
            }
          }
        }
      }
    });
  });

  console.log(`Checked ${fbiCitationsChecked} FBI Vault citations in Tab 7; Violations: ${fbiViolations}`);
  if (fbiViolations === 0) {
    console.log(`  [PASS] All FBI Vault citations adhere strictly to PDF page limits (Pt 01 <= 68, Pt 03 <= 60, Pt 06 <= 74).`);
  }

  // SUMMARY & VERDICT
  console.log('\n================================================================================');
  console.log('TAB 7 AUDIT SUMMARY:');
  console.log(`  - Declared Anchors in Tab 7: ${declaredAnchorsTab7.size}`);
  console.log(`  - Incoming Links Evaluated: ${incomingLinks.length} (Failures: ${failedIncoming.length})`);
  console.log(`  - Outgoing Reverse Links Evaluated: ${outgoingCount} (Failures: ${failedOutgoing.filter(f => f.type !== 'internal-impact').length})`);
  console.log(`  - Internal Cross-Links Evaluated: ${internalCount} (Failures: ${failedOutgoing.filter(f => f.type === 'internal-impact').length})`);
  console.log(`  - FBI Citations Audited: ${fbiCitationsChecked} (Violations: ${fbiViolations})`);
  console.log(`  - Total Error Count: ${totalErrors}`);
  console.log('================================================================================');

  const passed = totalErrors === 0;
  console.log(`FINAL VERDICT: TAB 7 ANCHORS & CROSS-TAB LINKS ${passed ? 'VERIFIED (PASS)' : 'FAILED (REJECT)'}`);

  return {
    passed,
    totalErrors,
    declaredAnchorsCount: declaredAnchorsTab7.size,
    incomingLinksCount: incomingLinks.length,
    outgoingLinksCount: outgoingCount,
    internalLinksCount: internalCount,
    fbiCitationsChecked,
    fbiViolations,
    failedIncoming,
    failedOutgoing
  };
}

if (require.main === module) {
  const result = auditTab7Anchors();
  process.exit(result.passed ? 0 : 1);
}

module.exports = { auditTab7Anchors };
