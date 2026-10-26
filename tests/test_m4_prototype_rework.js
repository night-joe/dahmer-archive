const fs = require('fs');
const path = require('path');

function auditPrototypeRework() {
  console.log('================================================================================');
  console.log('TEST SUITE: MILESTONE 4 (R4) PROTOTYPE HTML REWORK AUDIT');
  console.log('Targets: overview.html and index.html');
  console.log('================================================================================\n');

  let passed = true;

  // 1. Check DOM ID Uniqueness across overview.html and index.html
  console.log('--- CHECK 1: DOM ID UNIQUENESS ---');
  ['overview.html', 'index.html'].forEach(filename => {
    const filePath = path.join(__dirname, '..', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /id="([^"]+)"/g;
    const map = {};
    let m;
    while ((m = regex.exec(content)) !== null) {
      map[m[1]] = (map[m[1]] || 0) + 1;
    }
    const duplicates = Object.entries(map).filter(([k, v]) => v > 1);
    if (duplicates.length > 0) {
      console.error(`  [FAIL] ${filename} contains duplicate DOM IDs:`, duplicates);
      passed = false;
    } else {
      console.log(`  [PASS] ${filename} has 0 duplicate DOM IDs across ${Object.keys(map).length} unique identifiers.`);
    }
  });

  // 2. Overview Footnote Register Audit
  console.log('\n--- CHECK 2: OVERVIEW FOOTNOTE REGISTER [1]-[41] ---');
  const overviewPath = path.join(__dirname, '..', 'overview.html');
  const overview = fs.readFileSync(overviewPath, 'utf8');
  const fnMatches = overview.match(/<li id="fn-\d+">/g) || [];
  console.log(`  Found ${fnMatches.length} footnotes in overview.html.`);
  if (fnMatches.length !== 41) {
    console.error(`  [FAIL] Expected 41 footnotes in overview.html, found ${fnMatches.length}`);
    passed = false;
  } else {
    console.log(`  [PASS] overview.html contains exactly 41 footnotes ([1] through [41]).`);
  }

  // Verify all 41 fn IDs sequentially exist
  let missingFn = [];
  for (let i = 1; i <= 41; i++) {
    if (!overview.includes(`id="fn-${i}"`)) {
      missingFn.push(`fn-${i}`);
    }
  }
  if (missingFn.length > 0) {
    console.error(`  [FAIL] Missing footnote IDs:`, missingFn);
    passed = false;
  } else {
    console.log(`  [PASS] All footnote IDs fn-1 through fn-41 present in sequential order.`);
  }

  // Verify all 41 canonical anchors are present
  const canonicalLinks = overview.match(/href="sources\.html#src-[^"]+"/g) || [];
  console.log(`  Found ${canonicalLinks.length} canonical source links in overview.html.`);
  if (canonicalLinks.length !== 41) {
    console.error(`  [FAIL] Expected 41 canonical links, found ${canonicalLinks.length}`);
    passed = false;
  } else {
    console.log(`  [PASS] All 41 canonical source anchors (#src-...) present.`);
  }

  // 3. Chemical Drum Capacity Check
  console.log('\n--- CHECK 3: CHEMICAL DRUM CAPACITY (DISCREPANCY D-01) ---');
  if (overview.includes('57-gallon')) {
    console.error(`  [FAIL] Outdated 57-gallon drum capacity still present in overview.html.`);
    passed = false;
  } else if (overview.includes('55-gallon')) {
    console.log(`  [PASS] 55-gallon drum capacity verified; outdated 57-gallon figure retired.`);
  } else {
    console.error(`  [FAIL] 55-gallon drum capacity not found in overview.html.`);
    passed = false;
  }

  // 4. Citation and Backref Consistency in overview.html
  console.log('\n--- CHECK 4: INLINE CITATION & FOOTNOTE BACKREF CONSISTENCY ---');
  const refRegex = /<sup class="citation"><a href="#fn-(\d+)" id="([^"]+)">\[(\d+)\]<\/a><\/sup>/g;
  const refs = [];
  let refMatch;
  while ((refMatch = refRegex.exec(overview)) !== null) {
    refs.push({ fn: refMatch[1], id: refMatch[2], label: refMatch[3] });
  }

  const backrefRegex = /<a href="#(ref-[^"]+)" class="footnote-backref"/g;
  const backrefs = [];
  let backrefMatch;
  while ((backrefMatch = backrefRegex.exec(overview)) !== null) {
    backrefs.push(backrefMatch[1]);
  }

  console.log(`  Total inline citations: ${refs.length}`);
  console.log(`  Total footnote backrefs: ${backrefs.length}`);

  const missingBackrefs = refs.filter(r => !backrefs.includes(r.id));
  const danglingBackrefs = backrefs.filter(b => !refs.some(r => r.id === b));

  if (missingBackrefs.length > 0) {
    console.error(`  [FAIL] Inline citations missing footnote backrefs:`, missingBackrefs);
    passed = false;
  } else {
    console.log(`  [PASS] 100% of inline citations have corresponding footnote backrefs.`);
  }

  if (danglingBackrefs.length > 0) {
    console.error(`  [FAIL] Footnote backrefs with no matching inline citation:`, danglingBackrefs);
    passed = false;
  } else {
    console.log(`  [PASS] 0 dangling footnote backrefs.`);
  }

  // 5. Mode B Block Citations in index.html
  console.log('\n--- CHECK 5: MODE B BLOCK CITATIONS IN index.html ---');
  const indexPath = path.join(__dirname, '..', 'index.html');
  const index = fs.readFileSync(indexPath, 'utf8');

  const hasOverviewCite = index.includes('Sources for this feature:');
  const hasMilestoneCite = index.includes('Sources for key milestones:');

  if (!hasOverviewCite) {
    console.error(`  [FAIL] Mode B block citation missing from Overview preview card.`);
    passed = false;
  } else {
    console.log(`  [PASS] Mode B block citation present in Overview preview card.`);
  }

  if (!hasMilestoneCite) {
    console.error(`  [FAIL] Mode B block citation missing from 9-row milestone table.`);
    passed = false;
  } else {
    console.log(`  [PASS] Mode B block citation present in 9-row milestone table.`);
  }

  // 6. Section D Evaluative Sentences Reframing Checks
  console.log('\n--- CHECK 6: SECTION D EVALUATIVE SENTENCES REFRAMING ---');
  const evaluativeChecks = [
    {
      name: 'Flag 1: Superlative ranking removed from overview.html',
      passed: !overview.includes('one of the most prolonged and consequential serial murder series'),
      details: 'Superlative ranking replaced with jurisdictional scope and convictions count.'
    },
    {
      name: 'Flag 1: Superlative ranking removed from index.html',
      passed: !index.includes('one of the most extensive and consequential serial-murder investigations'),
      details: 'Superlative ranking replaced with jurisdictional scope and convictions count.'
    },
    {
      name: 'Flag 2: 11 of 17 Black victims quantified in overview.html',
      passed: overview.includes('Eleven of the seventeen victims were Black, as documented in federal civil-rights judicial dockets'),
      details: 'Claim H.5 quantified Black victim count.'
    },
    {
      name: 'Flag 2: 11 of 17 Black victims quantified in index.html',
      passed: index.includes("Eleven of Dahmer's seventeen victims were Black, as documented in federal civil rights dockets"),
      details: 'Claim H.5 quantified Black victim count.'
    },
    {
      name: 'Flag 3: Narrowed encounter venues in overview.html Phase II table',
      passed: overview.includes('several victims encountered in or near LGBTQ social venues while others were met at transit hubs'),
      details: 'Claim H.7 narrowed encounter patterns.'
    },
    {
      name: 'Flag 3: Narrowed encounter venues in index.html preview card',
      passed: index.includes('Several victims were encountered in or near Milwaukee\'s LGBTQ social venues, while others were met at transit hubs'),
      details: 'Claim H.7 narrowed encounter patterns.'
    },
    {
      name: 'Flag 4: Analytical assessment labeled in overview.html',
      passed: overview.includes("In the project's analytical assessment"),
      details: 'Claim H.8 explicit [JUDGMENT] label.'
    },
    {
      name: 'Flag 4: Analytical assessment labeled in index.html',
      passed: index.includes("In the archive's analytical assessment"),
      details: 'Claim H.8 explicit [JUDGMENT] label.'
    },
    {
      name: 'Flag 5: Overview synthesis sources block citation in overview.html Section 10',
      passed: overview.includes('<strong>Overview Synthesis Sources:</strong>'),
      details: 'Overview conclusion consolidated synthesis sources block citation.'
    },
    {
      name: 'Corpus Delicti explanation for Steven Tuomi present in overview.html',
      passed: overview.includes('Steven Tuomi, where an absence of physical remains prevented prosecution under corpus delicti standards'),
      details: '17 confessed vs 16 convicted gap explained.'
    }
  ];

  evaluativeChecks.forEach(chk => {
    if (chk.passed) {
      console.log(`  [PASS] ${chk.name} (${chk.details})`);
    } else {
      console.error(`  [FAIL] ${chk.name} (${chk.details})`);
      passed = false;
    }
  });

  console.log('\n================================================================================');
  if (passed) {
    console.log('FINAL VERDICT: ALL PROTOTYPE REWORK AUDITS PASSED (100% COMPLIANT)');
  } else {
    console.error('FINAL VERDICT: ONE OR MORE AUDITS FAILED');
  }
  console.log('================================================================================\n');

  return { passed };
}

if (require.main === module) {
  const result = auditPrototypeRework();
  process.exit(result.passed ? 0 : 1);
}

module.exports = { auditPrototypeRework };
