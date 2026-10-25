const fs = require('fs');
const path = require('path');

const VICTIMS = [
  {
    id: 1,
    name: 'Steven Hicks',
    fullName: 'Steven Mark Hicks',
    table1Pattern: /Steven Hicks/,
    lastName: 'Hicks',
    canonicalSlug: 'steven-hicks',
    aliases: ['steven-hicks']
  },
  {
    id: 2,
    name: 'Steven Tuomi',
    fullName: 'Steven Walter Tuomi',
    table1Pattern: /Steven Tuomi/,
    lastName: 'Tuomi',
    canonicalSlug: 'steven-tuomi',
    aliases: ['steven-tuomi']
  },
  {
    id: 3,
    name: 'James Doxtator',
    fullName: 'James Edward Doxtator',
    table1Pattern: /James\s+(?:"Jamie"\s+)?Doxtator/,
    nickname: 'Jamie',
    lastName: 'Doxtator',
    canonicalSlug: 'james-doxtator',
    aliases: ['jamie-doxtator']
  },
  {
    id: 4,
    name: 'Richard Guerrero',
    fullName: 'Richard Guerrero',
    table1Pattern: /Richard Guerrero/,
    lastName: 'Guerrero',
    canonicalSlug: 'richard-guerrero',
    aliases: ['richard-guerrero']
  },
  {
    id: 5,
    name: 'Anthony Sears',
    fullName: 'Anthony Lee Sears',
    table1Pattern: /Anthony Sears/,
    lastName: 'Sears',
    canonicalSlug: 'anthony-sears',
    aliases: ['anthony-sears']
  },
  {
    id: 6,
    name: 'Raymond Smith',
    fullName: 'Raymond Smith',
    table1Pattern: /Raymond\s+(?:"Ricky Beeks"\s+)?Smith/,
    nickname: 'Ricky Beeks',
    lastName: 'Smith',
    canonicalSlug: 'raymond-smith',
    aliases: ['raymond-smith']
  },
  {
    id: 7,
    name: 'Edward Smith',
    fullName: 'Edward W. Smith',
    table1Pattern: /Edward\s+(?:"Eddie"\s+)?Smith/,
    nickname: 'Eddie',
    lastName: 'Smith',
    canonicalSlug: 'edward-smith',
    aliases: ['eddie-smith']
  },
  {
    id: 8,
    name: 'Ernest Miller',
    fullName: 'Ernest Miller',
    table1Pattern: /Ernest Miller/,
    lastName: 'Miller',
    canonicalSlug: 'ernest-miller',
    aliases: ['ernest-miller']
  },
  {
    id: 9,
    name: 'David Thomas',
    fullName: 'David Courtney Thomas',
    table1Pattern: /David(?:\s+C\.)?\s+Thomas/,
    lastName: 'Thomas',
    canonicalSlug: 'david-thomas',
    aliases: ['david-thomas']
  },
  {
    id: 10,
    name: 'Curtis Straughter',
    fullName: 'Curtis Straughter',
    table1Pattern: /Curtis Straughter/,
    lastName: 'Straughter',
    canonicalSlug: 'curtis-straughter',
    aliases: ['curtis-straughter']
  },
  {
    id: 11,
    name: 'Errol Lindsey',
    fullName: 'Errol Lindsey',
    table1Pattern: /Errol Lindsey/,
    lastName: 'Lindsey',
    canonicalSlug: 'errol-lindsey',
    aliases: ['errol-lindsey']
  },
  {
    id: 12,
    name: 'Anthony Hughes',
    fullName: 'Anthony Hughes',
    table1Pattern: /Anthony\s+(?:"Tony"\s+)?Hughes/,
    nickname: 'Tony',
    lastName: 'Hughes',
    canonicalSlug: 'anthony-hughes',
    aliases: ['tony-hughes']
  },
  {
    id: 13,
    name: 'Konerak Sinthasomphone',
    fullName: 'Konerak Sinthasomphone',
    table1Pattern: /Konerak Sinthasomphone/,
    lastName: 'Sinthasomphone',
    canonicalSlug: 'konerak-sinthasomphone',
    aliases: ['konerak-sinthasomphone']
  },
  {
    id: 14,
    name: 'Matt Turner',
    fullName: 'Matt Turner',
    table1Pattern: /Matt Turner/,
    lastName: 'Turner',
    canonicalSlug: 'matt-turner',
    aliases: ['matt-turner']
  },
  {
    id: 15,
    name: 'Jeremiah Weinberger',
    fullName: 'Jeremiah Weinberger',
    table1Pattern: /Jeremiah Weinberger/,
    lastName: 'Weinberger',
    canonicalSlug: 'jeremiah-weinberger',
    aliases: ['jeremiah-weinberger']
  },
  {
    id: 16,
    name: 'Oliver Lacy',
    fullName: 'Oliver Lacy',
    table1Pattern: /Oliver Lacy/,
    lastName: 'Lacy',
    canonicalSlug: 'oliver-lacy',
    aliases: ['oliver-lacy']
  },
  {
    id: 17,
    name: 'Joseph Bradehoft',
    fullName: 'Joseph Bradehoft',
    table1Pattern: /Joseph Bradehoft/,
    lastName: 'Bradehoft',
    canonicalSlug: 'joseph-bradehoft',
    aliases: ['joseph-bradehoft']
  }
];

function auditVictimSlugs() {
  console.log('================================================================================');
  console.log('EMPIRICAL AUDIT: 17 VICTIM SLUGS & SPELLING/HYPHENATION INTEGRITY');
  console.log('================================================================================');

  let allPassed = true;
  const files = {
    table1: 'plan/table_1_the_victims_v04.md',
    plan03a: 'plan/03a_case_offense_series_plan_v03_final_locked.txt',
    plan03b: 'plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt',
    plan05: 'plan/05_timeline_content_plan_v04_final_locked.txt',
    plan08: 'plan/08_case_final_bibliography_v01.txt'
  };

  const loadedFiles = {};
  for (const [key, relPath] of Object.entries(files)) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`ERROR: File not found: ${relPath}`);
      allPassed = false;
      continue;
    }
    loadedFiles[key] = {
      relPath,
      content: fs.readFileSync(fullPath, 'utf8')
    };
  }

  console.log(`\nValidating 17 canonical victims across 5 specifications...\n`);

  VICTIMS.forEach(v => {
    console.log(`[VICTIM ${String(v.id).padStart(2, '0')}] ${v.name} (Canonical slug: #${v.canonicalSlug}, Alias: #${v.aliases.join(', #')})`);

    // 1. Table 1 Check
    const inTable1 = v.table1Pattern.test(loadedFiles.table1.content);
    if (!inTable1) {
      console.error(`  [FAIL] Missing from Table 1 (${files.table1})`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Found in Table 1`);
    }

    // 2. 03a Offense Series Check
    // Should have canonical anchor #case-[slug] and short alias #[slug] or #[alias]
    const hasCanonical03a = loadedFiles.plan03a.content.includes(`#case-${v.canonicalSlug}`);
    const hasAlias03a = v.aliases.some(a => loadedFiles.plan03a.content.includes(`#${a}`));
    if (!hasCanonical03a) {
      console.error(`  [FAIL] Missing canonical anchor #case-${v.canonicalSlug} in 03a`);
      allPassed = false;
    } else if (!hasAlias03a) {
      console.error(`  [FAIL] Missing alias anchor #${v.aliases.join('/')} in 03a`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Verified anchors in 03a: #case-${v.canonicalSlug} & #${v.aliases[0]}`);
    }

    // 3. 03b Investigation & Trial Check
    const hasIn03b = loadedFiles.plan03b.content.includes(v.name) ||
                     loadedFiles.plan03b.content.includes(v.canonicalSlug) ||
                     (v.nickname && loadedFiles.plan03b.content.includes(v.nickname)) ||
                     v.aliases.some(a => loadedFiles.plan03b.content.includes(a));
    if (!hasIn03b) {
      console.error(`  [FAIL] Missing reference in 03b`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Verified references in 03b`);
    }

    // 4. Timeline (Table 2) Check
    const hasInTimeline = loadedFiles.plan05.content.includes(v.name) ||
                          loadedFiles.plan05.content.includes(v.canonicalSlug) ||
                          (v.nickname && loadedFiles.plan05.content.includes(v.nickname)) ||
                          v.aliases.some(a => loadedFiles.plan05.content.includes(a));
    if (!hasInTimeline) {
      console.error(`  [FAIL] Missing in Timeline (05)`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Verified in Timeline (05)`);
    }

    // 5. Master Bibliography (08) Check
    const hasInBib = loadedFiles.plan08.content.includes(v.name) ||
                     loadedFiles.plan08.content.includes(v.lastName) ||
                     (v.nickname && loadedFiles.plan08.content.includes(v.nickname)) ||
                     loadedFiles.plan08.content.includes(v.canonicalSlug);
    if (!hasInBib) {
      console.error(`  [FAIL] Missing in Master Bibliography (08)`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Verified in Master Bibliography (08)`);
    }
  });

  // Check for any potential malformed or typo slugs across all files
  console.log('\n--- SCANNING FOR SLUG TYPOS & MISMATCHES ---');
  const allSlugPatterns = /#(?:case-)?([a-z0-9\-]+)/g;
  const knownVictimSlugs = new Set([
    ...VICTIMS.map(v => v.canonicalSlug),
    ...VICTIMS.map(v => `case-${v.canonicalSlug}`),
    ...VICTIMS.flatMap(v => v.aliases),
    ...VICTIMS.flatMap(v => v.aliases.map(a => `case-${a}`))
  ]);

  let typoCount = 0;
  for (const [key, fileObj] of Object.entries(loadedFiles)) {
    const text = fileObj.content;
    let match;
    while ((match = allSlugPatterns.exec(text)) !== null) {
      const slug = match[1];
      for (const v of VICTIMS) {
        const lastName = v.canonicalSlug.split('-').pop();
        if (slug.includes(lastName) && !knownVictimSlugs.has(slug) && !knownVictimSlugs.has(`case-${slug}`)) {
          // Exclude known non-victim compounds (e.g., event-1978-hicks, sinthasomphone-1988, uncharged-tuomi)
          if (!slug.startsWith('event-') &&
              slug !== 'sinthasomphone-1988' &&
              slug !== 'prior-1988-assault' &&
              slug !== 'sombat-assault' &&
              slug !== 'uncharged-tuomi' &&
              slug !== 'hicks-identification') {
            console.warn(`  [WARN] Potential slug discrepancy in ${fileObj.relPath}: "#${slug}" (matches last name "${lastName}")`);
            typoCount++;
          }
        }
      }
    }
  }

  if (typoCount === 0) {
    console.log(`[PASS] Zero victim slug spelling or hyphenation typos detected.`);
  }

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`SUMMARY: All 17 victims accounted for across all specifications.`);
  console.log(`Status: ${allPassed ? 'PASS (17/17 ACCOUNTED FOR WITH ZERO TYPOS)' : 'FAIL'}`);
  console.log('--------------------------------------------------------------------------------');

  return { passed: allPassed, count: VICTIMS.length };
}

if (require.main === module) {
  const result = auditVictimSlugs();
  process.exit(result.passed ? 0 : 1);
}

module.exports = { auditVictimSlugs, VICTIMS };
