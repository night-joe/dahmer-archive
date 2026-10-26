/**
 * tools/build_sources.mjs
 * Build-time static generator for the Jeffrey Dahmer Case Archive.
 *
 * Implements: Phase C Specification Part 7.3 - 7.13, Part 4.4, Part 5.8, Part 10.3 (Blocker B-01).
 * Inputs:
 *   - Locked Tab Plans and dedicated register files in plan/
 * Outputs:
 *   - sources.html (pure offline static HTML with By-Tab and By-Source views)
 *   - assets/data/sources.json (canonical deduplicated source registry)
 *   - assets/data/route-aliases.json (machine-readable alias concordance)
 *
 * Zero runtime external dependencies; 100% file:// compatible.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. INPUT FILE PATHS
const FILES = {
  tab1_overview: path.join(ROOT_DIR, 'plan/01_overview_content_plan_v03_final_locked.txt'),
  tab2_victims:  path.join(ROOT_DIR, 'plan/08_victims_final_bibliography_v02.txt'),
  tab3_timeline: path.join(ROOT_DIR, 'plan/05_timeline_content_plan_v04_final_locked.txt'),
  tab4_context:  path.join(ROOT_DIR, 'plan/02_context_content_plan_v03_final_locked.txt'),
  tab5_case:     path.join(ROOT_DIR, 'plan/08_case_final_bibliography_v01.txt'),
  tab6_analysis: path.join(ROOT_DIR, 'plan/08_analysis_final_bibliography_v01.txt'),
  tab7_impact:   path.join(ROOT_DIR, 'plan/08_impact_final_bibliography_v01.txt'),
};

// 2. OUTPUT FILE PATHS
const OUTPUTS = {
  html:          path.join(ROOT_DIR, 'sources.html'),
  sources_json:  path.join(ROOT_DIR, 'assets/data/sources.json'),
  aliases_json:  path.join(ROOT_DIR, 'assets/data/route-aliases.json')
};

// 3. TIER DEFINITIONS (Phase C Part 7.11 & 4.4)
const TIERS = {
  'primary-judicial': {
    id: 'primary-judicial',
    title: 'Primary Judicial, Statutory & Municipal Records',
    description: 'Official court charging instruments, case dockets, certified appellate decisions, legislative statutes, and municipal administrative codes.',
    badgeClass: 'tier-primary-judicial'
  },
  'primary-archival': {
    id: 'primary-archival',
    title: 'Primary Forensic, Archival & Investigative Repositories',
    description: 'Federal Bureau of Investigation declassified FOIA files, institutional security inquiries, medical examiner autopsy protocols, and certified demographic records.',
    badgeClass: 'tier-primary-archival'
  },
  'scholarly': {
    id: 'scholarly',
    title: 'Scholarly Monographs & Peer-Reviewed Academic Studies',
    description: 'Peer-reviewed forensic pathology literature, university law reviews, academic sociological texts, and diagnostic manuals.',
    badgeClass: 'tier-scholarly'
  },
  'contemporary': {
    id: 'contemporary',
    title: 'Contemporaneous Journalism & Investigative Wire Services',
    description: 'Contemporaneous news reporting (1991–1996) by national newspapers of record and news wire services (NYT, WaPo, UPI, AP, ChiTrib, MJS).',
    badgeClass: 'tier-contemporary'
  },
  'secondary': {
    id: 'secondary',
    title: 'Critical Media Studies, Ethics, Memoirs & Retrospectives',
    description: 'Investigative memoirs by primary participants, comprehensive modern retrospectives, cultural analyses, and ethical reviews.',
    badgeClass: 'tier-secondary'
  }
};

// Helper: Normalize URL (Part 7.6 Rule 1)
function normalizeUrl(rawUrl) {
  if (!rawUrl) return '';
  return rawUrl.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')
    .split('#')[0]
    .split('?')[0];
}

// Slice text between section markers
function extractSlice(filePath, startMarker, endMarker) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(startMarker)) {
      if (!lines[i].trim().startsWith('1.')) {
        startIdx = i;
        break;
      }
    }
  }
  if (startIdx === -1) throw new Error(`Start marker "${startMarker}" not found in ${filePath}`);

  let endIdx = lines.length;
  if (endMarker) {
    const foundEnd = lines.findIndex((l, i) => i > startIdx && l.includes(endMarker));
    if (foundEnd !== -1) endIdx = foundEnd;
  }
  return lines.slice(startIdx, endIdx);
}

// Parse entries from slice
function parseSectionEntries(lines, tabKey, tabName, partPrefix = '') {
  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*\[(SRC-)?(\d+[a-z]?)\]\s*(.*)/i);
    if (match) {
      if (current) entries.push(current);
      const numStr = match[2];
      const prefix = match[1] || '';
      const localNum = `${partPrefix}[${prefix}${numStr}]`.trim();
      const rawHeader = line.trim();
      const rest = match[3].trim();

      current = {
        tab: tabKey,
        tabName: tabName,
        localId: localNum,
        rawHeader: rawHeader,
        citationLines: rest ? [rest] : [],
        url: '',
        urls: [],
        usedFor: '',
        tier: ''
      };
      continue;
    }

    if (!current) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;

    const tierMatch = trimmed.match(/^\[([A-Z\s/—–-]+)\]$/);
    if (tierMatch) {
      current.tier = tierMatch[1].trim();
      continue;
    }

    // Extract any URL present in the line if current.url is not yet set
    const lineUrlMatches = trimmed.match(/https?:\/\/[^\s)]+/g);
    if (lineUrlMatches) {
      lineUrlMatches.forEach(u => {
        const cleanU = u.replace(/[.,;'">]+$/, '');
        if (!current.url) current.url = cleanU;
        if (!current.urls.includes(cleanU)) current.urls.push(cleanU);
      });
    }

    const isUrlOnlyLine = /^https?:\/\//i.test(trimmed);
    const isUrlLabeledLine = /^(URL|URLs|Collection|Collection URL|DocumentCloud|DocumentCloud URL|PMC URL|WCCA docket|Justia URL|Wisconsin Legislature|Wisconsin Legislature Digital Archives|Ohio Laws & Administrative Rules)\s*:/i.test(trimmed);

    if (isUrlOnlyLine || isUrlLabeledLine) {
      continue;
    }

    if (trimmed.startsWith('- Part ') || trimmed.startsWith('- Initial ') || trimmed.startsWith('- Amended ') || trimmed.startsWith('- Preliminary ') || trimmed.startsWith('- Docket ') || trimmed.startsWith('- Dahmer_') || trimmed.startsWith('- Jeffrey_')) {
      const urlMatch = trimmed.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        if (!current.url) current.url = urlMatch[0];
        current.urls.push(urlMatch[0]);
      }
      current.citationLines.push(trimmed);
      continue;
    }

    if (trimmed.startsWith('Used for:') || trimmed.startsWith('Scope:') || trimmed.startsWith('Covers:') || trimmed.startsWith('Evidentiary Scope:')) {
      current.usedFor = trimmed.replace(/^(Used for:|Scope:|Covers:|Evidentiary Scope:)\s*/, '');
      continue;
    }

    if (trimmed.startsWith('Court:') || trimmed.startsWith('Presiding Jurist:') || trimmed.startsWith('Panel:') || trimmed.startsWith('Date of Decision:') || trimmed.startsWith('Docket / Record:') || trimmed.startsWith('Locator:') || trimmed.startsWith('Archive / File Locator:')) {
      current.citationLines.push(trimmed);
      continue;
    }

    if (current.usedFor) {
      current.usedFor += ' ' + trimmed;
    } else {
      current.citationLines.push(trimmed);
    }
  }

  if (current) entries.push(current);
  return entries;
}

// Canonical ID resolution according to Phase C Part 7.3 & 7.6
function resolveCanonicalId(entry) {
  const full = (entry.rawHeader + ' ' + entry.citationLines.join(' ')).toLowerCase();

  // Primary Archival & Judicial
  if (full.includes('vault.fbi.gov') || full.includes('foia records, vault') || full.includes('foia records, fbi vault') || full.includes('fbi vault foia') || full.includes('foia vault release') || full.includes('foia files (parts 01, 03, 06)') || full.includes('dahmer foia records: vault part') || full.includes('declassified fbi vault') || (full.includes('federal bureau of investigation') && full.includes('vault'))) {
    return 'fbi-vault';
  }
  if (full.includes('court tv') || (full.includes('courttv') && full.includes('1992'))) {
    return 'courttv-1992';
  }
  if (full.includes('f-912542') || full.includes('milwaukee county charging documents') || (full.includes('state of wisconsin v. jeffrey l. dahmer') && full.includes('criminal complaint'))) {
    return 'wi-complaint-f912542';
  }
  if (full.includes('cr-91-08-1686') || full.includes('summit county court of common pleas') || full.includes('summit county ohio common pleas')) {
    return 'oh-cr-91-08-1686';
  }
  if (full.includes('f-882410')) {
    return 'wi-f882410';
  }
  if (full.includes('act 399') || full.includes('1987 wisconsin act 399')) {
    return 'wis-act-399';
  }
  if (full.includes('940.01') && (full.includes('statute') || full.includes('wis. stat'))) {
    return 'wis-940-01';
  }
  if (full.includes('971.15') && full.includes('971.165')) {
    return 'wis-971-15-165';
  }
  if (full.includes('971.15')) {
    return 'wis-971-15';
  }
  if (full.includes('971.165')) {
    return 'wis-971-165';
  }
  if (full.includes('805.09')) {
    return 'wis-805-09-2';
  }
  if (full.includes('2903.01') || full.includes('ohio revised code § 2903.01') || full.includes('ohio rev. code 2903.01')) {
    return 'oh-rev-2903-01';
  }
  if (full.includes('weinberger v. state') || full.includes('weinberger v. wisconsin') || full.includes('105 f.3d 1182') || full.includes('906 f. supp. 485')) {
    return 'weinberger-1997';
  }
  if (full.includes('doc 328.04') || full.includes('wis. admin. code § doc 328.04')) {
    return 'wi-doc-328-04';
  }
  // WDOC December 1994 Report: merge all citations across Overview [11], Timeline [29], Case Part B [29], Impact [SRC-09]
  if (
    (full.includes('department of corrections') || full.includes('wdoc')) &&
    (full.includes('1994') || full.includes('investigative report') || full.includes('dahmer homicide') || full.includes('adult institutions') || full.includes('deaths of inmates') || full.includes('columbia correctional'))
  ) {
    return 'wi-doc-1994';
  }
  // State v. Verhasselt (1978): merge Case Part B [24] and Case Part A [30]
  if (full.includes('verhasselt') || full.includes('83 wis. 2d 647')) {
    return 'verhasselt-1978';
  }
  if (full.includes('bies v. state') || full.includes('53 wis. 2d 322')) {
    return 'bies-1972';
  }
  if (full.includes('bell v. city of milwaukee') || full.includes('746 f.2d 1205')) {
    return 'bell-1984';
  }
  if (full.includes('collins v. city of milwaukee') || full.includes('17-cv-00234')) {
    return 'collins-2018';
  }
  if (full.includes('sinthasomphone v. city of milwaukee') || full.includes('estate of sinthasomphone')) {
    if (full.includes('785 f. supp') || full.includes('1343') || full.includes('march 5, 1992') || full.includes('(1992)')) return 'sinthasomphone-1992';
    if (full.includes('838 f. supp') || full.includes('1320') || full.includes('1993')) return 'sinthasomphone-1993';
    if (full.includes('common council') || full.includes('850,000') || full.includes('settlement')) return 'sinthasomphone-1995';
    return 'sinthasomphone-1992';
  }
  if (entry.rawHeader.includes('UPI') && full.includes('two cops fired')) {
    return 'upi-1991-09-06';
  }
  if (full.includes('balcerzak') && (full.includes('gabrish') || full.includes('city of milwaukee') || full.includes('980 f. supp') || full.includes('163 f.3d 993') || full.includes('judge parins'))) {
    return 'balcerzak-1998';
  }
  if (full.includes('christopher scarver') || full.includes('columbia county circuit court') || full.includes('case no. 94-cf-220') || full.includes('94-cf-220')) {
    return 'scarver-1995';
  }
  if (full.includes('inside edition') || full.includes('stone phillips')) {
    return 'inside-edition-1993';
  }

  // Official Municipal / County / Police Records
  if (full.includes('911 audio') || full.includes('radio dispatch tapes') || full.includes('squad 25 communications') || full.includes('glenda cleveland follow-up')) {
    return 'mpd-dispatch-1991';
  }
  if (full.includes('94-pr-002145') || (full.includes('probate division') && full.includes('estate of jeffrey l. dahmer'))) {
    return 'wi-probate-94pr002145';
  }
  if (full.includes('autopsy protocols, identification logs') || (full.includes('milwaukee county medical examiner') && full.includes('autopsy protocols'))) {
    return 'mcme-autopsy-1991';
  }
  if (full.includes('inquest proceedings into the death of ernest lacy') || (full.includes('circuit court') && full.includes('ernest lacy'))) {
    return 'lacy-inquest-1981';
  }
  if (full.includes('chapter 112, laws of 1981') || full.includes('1983 wisconsin act 179')) {
    return 'wis-laws-1981-ch112';
  }
  if (full.includes('commission on civil rights') || full.includes('racial and ethnic tensions in american communities')) {
    return 'usccr-1994';
  }
  if (full.includes('aclu of wisconsin') || full.includes('after five years, city of milwaukee')) {
    return 'aclu-wi-2025';
  }

  // Scholarly / Books / Monographs / Demographics
  if (full.includes('o\'meara') || full.includes('text, context, and politics')) {
    return 'omeara-2009';
  }
  if (full.includes('jentzen') && (full.includes('2017') || full.includes('micro disasters'))) {
    return 'jentzen-2017';
  }
  if (full.includes('jentzen') && (full.includes('destructive hostility') || full.includes('withdrawn') || full.includes('epublications.marquette.edu/dentistry_fac/74'))) {
    return 'jentzen-1994';
  }
  if (
    full.includes('jentzen') &&
    (full.includes('destruction of evidence') || full.includes('1992/1993') || full.includes('forensic pathology reports & career reflections') || full.includes('reflections on the milwaukee serial homicide investigation') || full.includes('national association of medical examiners'))
  ) {
    return 'jentzen-1993';
  }
  if (full.includes('lankford') && full.includes('hayes')) {
    return 'lankford-hayes-2022';
  }
  if (full.includes('kennedy') && (full.includes('grilling dahmer') || full.includes('maharaj'))) {
    return 'kennedy-2022';
  }
  if (full.includes('lionel dahmer') || full.includes('a father\'s story')) {
    return 'dahmer-1994';
  }
  if (full.includes('backderf') || full.includes('my friend dahmer')) {
    return 'backderf-2012';
  }
  if (full.includes('tithecott') || full.includes('of men and monsters')) {
    return 'tithecott-1997';
  }
  if (full.includes('takach') || full.includes('lgbtq milwaukee') || full.includes('milwaukee drag')) {
    return 'takach-2016';
  }
  if (full.includes('masters') || full.includes('the shrine of jeffrey dahmer')) {
    return 'masters-1993';
  }
  if (full.includes('massey') && full.includes('denton')) {
    return 'massey-denton-1993';
  }
  if (full.includes('egger') || full.includes('less-dead') || full.includes('kill me first')) {
    return 'egger-2002';
  }
  if (full.includes('schwartz') || full.includes('the man who could not kill enough')) {
    return 'schwartz-1992';
  }
  if (full.includes('dsm-iii-r') || full.includes('american psychiatric association (1987)')) {
    return 'apa-dsm3r-1987';
  }
  if (full.includes('levine') && (full.includes('economic state of milwaukee') || full.includes('deindustrialization of milwaukee'))) {
    return 'levine-1992';
  }
  if (full.includes('federal reserve bank of chicago') || full.includes('chicago fed letter')) {
    return 'chicago-fed-1998';
  }
  if (full.includes('oxford research encyclopedia')) {
    return 'oxford-encyclopedia-2018';
  }
  if (full.includes('encyclopedia of milwaukee') || full.includes('emke.uwm.edu')) {
    return 'encyclopedia-milwaukee';
  }
  if (full.includes('population reference bureau') || full.includes('prb.org')) {
    return 'prb-2011';
  }
  if (full.includes('wasielewski') || full.includes('brady east std clinic')) {
    return 'wasielewski-2018';
  }
  if (full.includes('wisconsin lgbtq history project') || full.includes('wislgbthistory')) {
    if (full.includes('aids history chronology') || full.includes('2021')) return 'wislgbtq-aids-chronology-2021';
    return 'wislgbtq-history-project';
  }
  if (full.includes('milwaukee aids project') || full.includes('arcw')) {
    return 'map-arcw-records';
  }
  if (full.includes('city of milwaukee police department') && full.includes('chiefs of police')) {
    return 'mpd-chiefs-registry-2020';
  }
  if (full.includes('milwaukee police historical society')) {
    return 'mphs-police-chiefs-2019';
  }
  if (full.includes('citizen police support committee')) {
    return 'citizen-police-committee-1992';
  }
  if (full.includes('shepherd express') && full.includes('ernest lacy')) {
    return 'shepherd-express-lacy-2020';
  }
  if (full.includes('census bureau') || full.includes('1990 census')) {
    return 'census-1990';
  }
  if (full.includes('frey') && (full.includes('segregation') || full.includes('population studies center'))) {
    return 'frey-2005';
  }
  if (full.includes('the conversation') && full.includes('dangers of fictionalising')) {
    return 'conversation-2022-10';
  }
  if (full.includes('time magazine') && full.includes('netflix')) {
    return 'time-2022-09';
  }
  if ((full.includes('fox 29') || full.includes('associated press')) && full.includes('costumes')) {
    return 'ap-fox29-2022-10';
  }
  if (full.includes('milwaukee journal / milwaukee sentinel') && (full.includes('ambrosia chocolate') || full.includes('demolition'))) {
    return 'mj-ms-reporting-series';
  }

  // Contemporary News Outlets
  let outlet = '';
  if (full.includes('new york times') || full.includes('nyt')) outlet = 'nyt';
  else if (full.includes('washington post') || full.includes('wapo')) outlet = 'wapo';
  else if (full.includes('united press international') || full.includes('upi')) outlet = 'upi';
  else if (full.includes('journal sentinel') || full.includes('jsonline') || full.includes('milwaukee journal') || full.includes('milwaukee sentinel')) {
    if (full.includes('journal sentinel') || full.includes('jsonline')) outlet = 'mjs';
    else if (full.includes('milwaukee sentinel')) outlet = 'ms';
    else outlet = 'mj';
  }
  else if (full.includes('chicago tribune')) outlet = 'chitrib';
  else if (full.includes('marquette') || full.includes('cuap')) outlet = 'marquette-ap';
  else if (full.includes('associated press') || full.includes(' ap ')) outlet = 'ap';
  else if (full.includes('los angeles times') || full.includes('la times')) outlet = 'latimes';
  else if (full.includes('spokesman-review')) outlet = 'spokesman';
  else if (full.includes('chicago sun-times')) outlet = 'suntimes';
  else if (full.includes('christian science monitor')) outlet = 'csmonitor';
  else if (full.includes('guardian')) outlet = 'guardian';
  else if (full.includes('bbc')) outlet = 'bbc';
  else if (full.includes('time magazine') || full.includes('time.com')) outlet = 'time';
  else if (full.includes('business insider')) outlet = 'insider';
  else if (full.includes('the conversation')) outlet = 'conversation';

  // Comprehensive date extraction
  const isoDate = full.match(/\b(19\d\d|20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  const textDate = full.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:–\d{1,2}|\/\d{1,2})?,?\s+(19\d\d|20\d\d)\b/);
  const monthNames = {
    jan:'01', january:'01', feb:'02', february:'02', mar:'03', march:'03', apr:'04', april:'04',
    may:'05', jun:'06', june:'06', jul:'07', july:'07', aug:'08', august:'08', sep:'09', sept:'09',
    september:'09', oct:'10', october:'10', nov:'11', november:'11', dec:'12', december:'12'
  };

  let dateSlug = '';
  if (isoDate) {
    const yyyy = isoDate[1];
    const mm = isoDate[2].padStart(2, '0');
    const dd = isoDate[3].padStart(2, '0');
    dateSlug = `${yyyy}-${mm}-${dd}`;
  } else if (textDate) {
    const prefix = textDate[1].toLowerCase().slice(0, 4);
    const mm = monthNames[textDate[1].toLowerCase()] || monthNames[prefix] || monthNames[prefix.slice(0, 3)] || '01';
    const dd = textDate[2].padStart(2, '0');
    const yyyy = textDate[3];
    dateSlug = `${yyyy}-${mm}-${dd}`;
  }

  // Disambiguation for distinct articles on the same date (Part 7.3 disambiguation rule)
  if (outlet === 'upi' && dateSlug === '1991-08-02') {
    if (full.includes('lao youth mourned')) return 'upi-1991-08-02-mourned';
    if (full.includes('formally charged with 12')) return 'upi-1991-08-02-charged';
    return 'upi-1991-08-02'; // "Laotian Family Upset"
  }
  if (outlet === 'upi' && dateSlug === '1991-07-26') {
    if (full.includes('charged with four murders')) return 'upi-1991-07-26-b';
    return 'upi-1991-07-26'; // "Three More Mass Murder Victims Identified"
  }
  if (outlet === 'upi' && dateSlug === '1991-08-06') {
    if (full.includes('four more identified')) return 'upi-1991-08-06-b';
    return 'upi-1991-08-06'; // "Dozens of killings tied to Dahmer"
  }
  if (outlet === 'upi' && dateSlug === '1992-02-05') {
    if (full.includes('multiple mental disorders')) return 'upi-1992-02-05-b';
    return 'upi-1992-02-05'; // Dr. Becker testimony
  }
  // WaPo Sanity Verdict (Phase C Part 7.6 Rule 1 / Overview [19], Timeline [20], Case Part B [14], Analysis [SRC-30], Impact [SRC-36])
  if (
    outlet === 'wapo' &&
    (dateSlug === '1992-02-16' || dateSlug === '1992-02-15' || full.includes('jury rejects insanity defense') || full.includes('finds dahmer sane') || full.includes('dahmer ruled sane') || full.includes('all 15 counts'))
  ) {
    return 'wapo-1992-02-16';
  }

  // WaPo Insanity Defense Hint (August 22/23, 1991 - Victims [16], Timeline [10], Case Part A [16], Case Part B [20])
  if (
    outlet === 'wapo' &&
    (dateSlug === '1991-08-23' || dateSlug === '1991-08-22' || full.includes('hints at insanity defense'))
  ) {
    return 'wapo-1991-08-23';
  }

  if (outlet && dateSlug) {
    return `${outlet}-${dateSlug}`;
  }

  // Year-only fallback
  const yearMatch = full.match(/\b(19\d\d|20\d\d)\b/);
  if (outlet && yearMatch) {
    if (outlet === 'mjs' && yearMatch[1] === '2022') {
      if (full.includes('fact-check') || full.includes('netflix')) return 'mjs-2022-10-04';
      return 'mjs-2022-09-28';
    }
    return `${outlet}-${yearMatch[1]}`;
  }

  return `${outlet || entry.tab}-${entry.localId.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
}

// Determine canonical tier for grouping
function determineCanonicalTier(canonId, entry) {
  const full = (canonId + ' ' + entry.rawHeader + ' ' + entry.citationLines.join(' ')).toLowerCase();

  // Tier 1: Primary Judicial, Statutory & Municipal
  if (
    canonId.startsWith('wi-complaint') ||
    canonId.startsWith('oh-cr') ||
    canonId.startsWith('wi-f88') ||
    canonId.startsWith('wis-') ||
    canonId.startsWith('oh-rev') ||
    canonId.startsWith('wi-doc-328') ||
    canonId.startsWith('bies-') ||
    canonId.startsWith('bell-') ||
    canonId.startsWith('collins-') ||
    canonId.startsWith('sinthasomphone-') ||
    canonId.startsWith('balcerzak-') ||
    canonId.startsWith('weinberger-') ||
    canonId.startsWith('scarver-') ||
    canonId.startsWith('verhasselt-') ||
    canonId.startsWith('lacy-inquest') ||
    canonId.startsWith('wi-probate') ||
    canonId.startsWith('mpd-dispatch') ||
    canonId.startsWith('mpd-chiefs') ||
    canonId.includes('911-audio') ||
    full.includes('911 audio') ||
    full.includes('radio dispatch tapes') ||
    full.includes('f. supp') ||
    full.includes('f.3d') ||
    full.includes('wis. 2d') ||
    full.includes('statute') ||
    full.includes('circuit court') ||
    full.includes('common council') ||
    full.includes('fire and police commission')
  ) {
    return 'primary-judicial';
  }

  // Tier 2: Primary Forensic, Archival & Repositories
  if (
    canonId === 'fbi-vault' ||
    canonId.startsWith('courttv') ||
    canonId.startsWith('wi-doc-1994') ||
    canonId.startsWith('usccr-') ||
    canonId.startsWith('aclu-') ||
    canonId.startsWith('census-') ||
    canonId.startsWith('mcme-') ||
    canonId.startsWith('wislgbtq-') ||
    canonId.startsWith('map-arcw') ||
    canonId.startsWith('mphs-') ||
    canonId.startsWith('citizen-police') ||
    full.includes('fbi vault') ||
    full.includes('medical examiner') ||
    full.includes('autopsy') ||
    full.includes('investigative report into the homicides of jeffrey dahmer') ||
    full.includes('internal administrative security inquiry') ||
    full.includes('court tv')
  ) {
    return 'primary-archival';
  }

  // Tier 4: Contemporaneous Journalism & Investigative Wire Services
  // (Evaluated before Tier 3 to prevent newspapers like The Milwaukee Journal,
  // Spokesman-Review, or Marquette AP Wire from matching generic "journal" or "review")
  if (
    canonId.startsWith('nyt-') ||
    canonId.startsWith('wapo-') ||
    canonId.startsWith('upi-') ||
    canonId.startsWith('chitrib-') ||
    canonId.startsWith('marquette-ap-') ||
    canonId.startsWith('ap-') ||
    canonId.startsWith('latimes-') ||
    canonId.startsWith('spokesman-') ||
    canonId.startsWith('suntimes-') ||
    canonId.startsWith('csmonitor-') ||
    canonId.startsWith('ms-') ||
    canonId.startsWith('mj-') ||
    canonId.startsWith('mjs-') ||
    canonId.startsWith('fox29-')
  ) {
    return 'contemporary';
  }

  // Tier 3: Scholarly Monographs & Academic Studies
  if (
    canonId.startsWith('omeara-') ||
    canonId.startsWith('jentzen-2017') ||
    canonId.startsWith('jentzen-1994') ||
    canonId.startsWith('jentzen-1993') ||
    canonId.startsWith('lankford-') ||
    canonId.startsWith('massey-') ||
    canonId.startsWith('tithecott-') ||
    canonId.startsWith('takach-') ||
    canonId.startsWith('masters-') ||
    canonId.startsWith('egger-') ||
    canonId.startsWith('apa-dsm') ||
    canonId.startsWith('frey-') ||
    canonId.startsWith('prb-') ||
    canonId.startsWith('levine-') ||
    canonId.startsWith('chicago-fed') ||
    canonId.startsWith('oxford-encyclopedia') ||
    canonId.startsWith('encyclopedia-milwaukee') ||
    canonId.startsWith('wasielewski-') ||
    full.includes('university') ||
    full.includes('peer-reviewed') ||
    full.includes('pathology') ||
    full.includes('academic') ||
    full.includes('dsm-iii')
  ) {
    return 'scholarly';
  }

  // Tier 5: Critical Media Studies, Ethics, Memoirs & Retrospectives
  return 'secondary';
}

// Determine source format type (newspaper, judicial-record, statute, book, broadcast, archival-foia, etc.)
function determineSourceType(canonId, tier) {
  if (tier === 'primary-judicial') {
    if (canonId.startsWith('wis-') || canonId.startsWith('oh-rev') || canonId.startsWith('wi-doc-328')) return 'statute';
    if (canonId.startsWith('mpd-dispatch') || canonId.includes('911-audio')) return 'official-audio-recording';
    return 'judicial-record';
  }
  if (tier === 'primary-archival') {
    if (canonId.startsWith('courttv')) return 'broadcast-archive';
    return 'archival-foia';
  }
  if (tier === 'scholarly') return 'peer-reviewed-study';
  if (tier === 'contemporary') return 'newspaper';
  return 'book-or-retrospective';
}

// Format clean citation string (prevents duplicating header title)
function formatCleanCitation(entry) {
  return entry.citationLines.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

// 4. MAIN BUILD SOURCES FUNCTION
export async function buildSources() {
  console.log('================================================================================');
  console.log('PHASE D BUILD: SOURCES GENERATOR & DUAL-VIEW PAGE (Requirement R3)');
  console.log('================================================================================\n');

  // Verify inputs
  for (const [k, p] of Object.entries(FILES)) {
    if (!fs.existsSync(p)) {
      throw new Error(`Required input file missing: ${p}`);
    }
  }

  // 1. Parse all 7 locked tab plans
  const tabConfigs = [
    { key: 'overview', name: 'Overview', file: FILES.tab1_overview, start: 'SECTION E: OVERVIEW REGISTER', end: 'SECTION F: CROSSWALK', expected: 41, prefix: '' },
    { key: 'victims',  name: 'Victims',  file: FILES.tab2_victims,  start: 'VICTIMS REGISTER [1]-[27]', end: 'SECTION 2: PARENT-REGISTER CROSSWALK', expected: 27, prefix: '' },
    { key: 'timeline', name: 'Timeline', file: FILES.tab3_timeline, start: 'TIMELINE REGISTER ([1]–[33])', end: 'FINAL VERIFICATION SIGN-OFF', expected: 33, prefix: '' },
    { key: 'context',  name: 'Context',  file: FILES.tab4_context,  start: 'CONTEXT REGISTER ([SRC-01]–[SRC-32])', end: 'VERIFICATION & LOCKING METADATA', expected: 32, prefix: '' },
    { key: 'case',     name: 'Case',     file: FILES.tab5_case,     start: 'TAB 5 PART B REGISTER ([1]–[33])', end: 'SECTION 3: AUTHORITATIVE NUMBERED BIBLIOGRAPHY: TAB 5 PART A', expected: 33, prefix: 'Part B ' },
    { key: 'case',     name: 'Case',     file: FILES.tab5_case,     start: 'TAB 5 PART A REGISTER ([1]–[32])', end: 'SECTION 4: UNIFIED DEDUPLICATED MASTER CONCORDANCE REGISTER', expected: 32, prefix: 'Part A ' },
    { key: 'analysis', name: 'Analysis', file: FILES.tab6_analysis, start: 'SECTION 2: MASTER AUTHORITATIVE BIBLIOGRAPHY', end: 'END OF MASTER BIBLIOGRAPHY', expected: 36, prefix: '' },
    { key: 'impact',   name: 'Impact',   file: FILES.tab7_impact,   start: 'TIER 1: PRIMARY JUDICIAL, STATUTORY & MUNICIPAL RECORDS', end: 'MASTER CITATION CROSSWALK MATRIX', expected: 52, prefix: '' }
  ];

  const parsedTabsMap = new Map();
  const allParsedEntries = [];

  for (const tc of tabConfigs) {
    const lines = extractSlice(tc.file, tc.start, tc.end);
    const entries = parseSectionEntries(lines, tc.key, tc.name, tc.prefix);

    if (entries.length !== tc.expected) {
      throw new Error(`Parse count mismatch for ${tc.name} (${tc.prefix || 'main'}): got ${entries.length}, expected ${tc.expected}`);
    }

    console.log(`✓ Parsed ${entries.length.toString().padStart(2)} entries from ${tc.name.padEnd(8)} ${tc.prefix ? `(${tc.prefix.trim()})` : '        '}`);

    // Group by tab key
    if (!parsedTabsMap.has(tc.key)) {
      parsedTabsMap.set(tc.key, { key: tc.key, name: tc.name, entries: [] });
    }
    parsedTabsMap.get(tc.key).entries.push(...entries);
    allParsedEntries.push(...entries);
  }

  console.log(`\nTotal local entries successfully parsed: ${allParsedEntries.length} / 286 target.`);
  if (allParsedEntries.length !== 286) {
    throw new Error(`Total entry count violation: expected 286, got ${allParsedEntries.length}`);
  }

  // 2. Canonical Deduplication & Assembly
  const canonicalMap = new Map();
  const mergeLog = [];

  for (const entry of allParsedEntries) {
    const canonId = resolveCanonicalId(entry);
    entry.resolvedCanonId = canonId;
    const tier = determineCanonicalTier(canonId, entry);
    const type = determineSourceType(canonId, tier);
    const citation = formatCleanCitation(entry);
    const normUrl = normalizeUrl(entry.url);

    if (canonicalMap.has(canonId)) {
      const existing = canonicalMap.get(canonId);
      existing.appears_in.push({ tab: entry.tab, local: entry.localId });
      // Keep most comprehensive citation or first
      if (citation.length > existing.citation.length && !existing.citation.includes(citation)) {
        existing.citation = citation;
      }
      if (!existing.url && entry.url) {
        existing.url = entry.url;
      }
      mergeLog.push({ canonId, tab: entry.tab, local: entry.localId });
    } else {
      canonicalMap.set(canonId, {
        id: canonId,
        tier: tier,
        tier_label: TIERS[tier].title,
        type: type,
        citation: citation,
        url: entry.url || '',
        appears_in: [{ tab: entry.tab, local: entry.localId }],
        notes: ''
      });
    }
  }

  console.log(`\n================================================================================`);
  console.log(`DEDUPLICATION REPORT (Phase C Part 7.6)`);
  console.log(`================================================================================`);
  console.log(`Total Citations Linked:   ${allParsedEntries.length}`);
  console.log(`Unique Canonical Sources: ${canonicalMap.size}`);
  console.log(`Merges Performed:         ${mergeLog.length}`);

  // 3. Emit assets/data/sources.json
  const sourcesJsonData = {
    generated: new Date().toISOString().split('T')[0],
    canonical_count: canonicalMap.size,
    total_locators: allParsedEntries.length,
    canonical: Array.from(canonicalMap.values())
  };

  const dataDir = path.dirname(OUTPUTS.sources_json);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(OUTPUTS.sources_json, JSON.stringify(sourcesJsonData, null, 2), 'utf8');
  console.log(`\n✓ Wrote: ${path.relative(ROOT_DIR, OUTPUTS.sources_json)}`);

  // 4. Emit assets/data/route-aliases.json (Phase C Part 5.8)
  const routeAliasesData = {
    generated: new Date().toISOString().split('T')[0],
    total_conflicts_registered: 43,
    aliases: [
      { conflict_id: "R-01", alias: "/case/offense-series", target: "case.html#offense-series", category: "D", status: "resolved", resolution: "Part A wrapper, repairs four dangling inbound links" },
      { conflict_id: "R-02", alias: "/case/investigation", target: "case.html#investigation-arrest", category: "D", status: "resolved", resolution: "Tier 1 wrapper, plan's #investigation stays on content block" },
      { conflict_id: "R-03", alias: "/case/trial", target: "case.html#trial-proceedings", category: "D", status: "resolved", resolution: "Tier 1 wrapper, #trial-plea and #sanity-trial remain" },
      { conflict_id: "R-04", alias: "/case#arrest-and-discovery", target: "case.html#arrest-and-discovery", category: "CARRIED", status: "carried", resolution: "Carried to case.html build step; choose canonical arrest/discovery block" },
      { conflict_id: "R-05", alias: "/case#case-detective-interrogations", target: "case.html#investigation", category: "B", status: "resolved", resolution: "Alias #case-detective-interrogations to #investigation" },
      { conflict_id: "R-06", alias: "/topics/systemic-failures", target: "analysis.html#topics-systemic-failures", category: "A", status: "resolved", resolution: "Build-time rewrite to analysis.html#topics-systemic-failures" },
      { conflict_id: "R-07", alias: "/topics/psychological-profile", target: "analysis.html#topics-psychological-profile", category: "A", status: "resolved", resolution: "Build-time rewrite to analysis.html#topics-psychological-profile" },
      { conflict_id: "R-08", alias: "/topics/theories-motivations", target: "analysis.html#topics-theories-motivations", category: "A", status: "resolved", resolution: "Build-time rewrite to analysis.html#topics-theories-motivations" },
      { conflict_id: "R-09", alias: "/analysis#psychiatric-profile", target: "analysis.html#topics-psychological-profile", category: "B", status: "resolved", resolution: "Declared alias of #topics-psychological-profile" },
      { conflict_id: "R-10", alias: "/impact/community-civic-impact", target: "impact.html#community", category: "A", status: "resolved", resolution: "Build-time rewrite to impact.html#community" },
      { conflict_id: "R-11", alias: "/impact/social-impact-reform", target: "impact.html#reform", category: "A", status: "resolved", resolution: "Build-time rewrite to impact.html#reform" },
      { conflict_id: "R-12", alias: "/impact/media-cultural-portrayal", target: "impact.html#media-ethics", category: "A", status: "resolved", resolution: "Build-time rewrite to impact.html#media-ethics" },
      { conflict_id: "R-13", alias: "/impact/modern-re-examination", target: "impact.html#primary-sources", category: "A", status: "resolved", resolution: "Build-time rewrite to impact.html#primary-sources" },
      { conflict_id: "R-14", alias: "#civil-litig", target: "impact.html#civil-litigation", category: "B", status: "resolved", resolution: "Canonical #civil-litigation, repaired truncated table entry" },
      { conflict_id: "R-15", alias: "#oxford-demol", target: "impact.html#oxford-demolition", category: "B", status: "resolved", resolution: "Canonical #oxford-demolition" },
      { conflict_id: "R-16", alias: "#officer-reinst", target: "impact.html#officer-reinstatement", category: "B", status: "resolved", resolution: "Canonical #officer-reinstatement" },
      { conflict_id: "R-17", alias: "/overview#conclusion", target: "overview.html#overview-conclusion", category: "B", status: "resolved", resolution: "Canonical #overview-conclusion" },
      { conflict_id: "R-18", alias: "/victims#eddie-smith", target: "victims.html#edward-smith", category: "B", status: "resolved", resolution: "Registry alias from Section 5.6" },
      { conflict_id: "R-19", alias: "/victims#tony-hughes", target: "victims.html#anthony-hughes", category: "B", status: "resolved", resolution: "Registry alias from Section 5.6" },
      { conflict_id: "R-20", alias: "/victims#jamie-doxtator", target: "victims.html#james-doxtator", category: "B", status: "resolved", resolution: "Registry alias from Section 5.6" },
      { conflict_id: "R-21", alias: "#event-1990-smith", target: "timeline.html#event-1990-eddie-smith", category: "B", status: "resolved", resolution: "Canonical #event-1990-eddie-smith" },
      { conflict_id: "R-22", alias: "#steven-hicks", target: "timeline.html#event-1978-hicks", category: "B", status: "resolved", resolution: "Canonical #event-1978-hicks" },
      { conflict_id: "R-23", alias: "#tracy-edwards", target: "timeline.html#event-1991-edwards-escape", category: "B", status: "resolved", resolution: "Canonical #event-1991-edwards-escape" },
      { conflict_id: "R-24", alias: "#konerak-sinthasomphone", target: "timeline.html#event-1991-sinthasomphone", category: "B", status: "resolved", resolution: "Canonical #event-1991-sinthasomphone" },
      { conflict_id: "R-25", alias: "#trial", target: "timeline.html#event-1992-sanity-trial", category: "B", status: "resolved", resolution: "Alias #trial to #event-1992-sanity-trial" },
      { conflict_id: "R-26", alias: "#sentencing", target: "timeline.html#event-1992-sentencing", category: "B", status: "resolved", resolution: "Canonical #event-1992-sentencing" },
      { conflict_id: "R-27", alias: "#officer-discipline", target: "timeline.html#event-1991-officer-suspensions", category: "B", status: "resolved", resolution: "Canonical #event-1991-officer-suspensions" },
      { conflict_id: "R-28", alias: "/timeline#probation", target: "context.html#probation-supervision-failure", category: "A", status: "resolved", resolution: "Cross-page resolve to context.html#probation-supervision-failure" },
      { conflict_id: "R-29", alias: "#apartment-discovery", target: "timeline.html#apartment-discovery", category: "CARRIED", status: "carried", resolution: "Carried to timeline.html build step; ambiguous between 1990 move and 1991 search" },
      { conflict_id: "R-30", alias: "#oxford-apartments-profile", target: "context.html#avenues-west-oxford-apartments", category: "B", status: "resolved", resolution: "Canonical #avenues-west-oxford-apartments" },
      { conflict_id: "R-31", alias: "#lgbtq-community", target: "context.html#milwaukee-lgbtq-history", category: "B", status: "resolved", resolution: "Canonical #milwaukee-lgbtq-history" },
      { conflict_id: "R-32", alias: "#konerak", target: "analysis.html#konerak-sinthasomphone", category: "B", status: "resolved", resolution: "Canonical #konerak-sinthasomphone under #topics-systemic-failures" },
      { conflict_id: "R-33", alias: "#control", target: "analysis.html#control-experiments", category: "B", status: "resolved", resolution: "Canonical #control-experiments" },
      { conflict_id: "R-34", alias: "/case/reporter", target: null, category: "C", status: "excluded", resolution: "Category C legal citation artifact; not a routable link" },
      { conflict_id: "R-35", alias: "/victims/sources", target: null, category: "C", status: "excluded", resolution: "Category C heading reference; not a routable link" },
      { conflict_id: "R-36", alias: "/timeline/milwaukee-police-changes-in-policies-culture", target: null, category: "CARRIED", status: "carried", resolution: "Carried to timeline.html build step; malformed source title rendered as path" },
      { conflict_id: "R-37", alias: "/case/estate-of-sinthasomphone-v-milwaukee", target: null, category: "CARRIED", status: "carried", resolution: "Carried to case.html build step; resolve to analysis topic or source reference" },
      { conflict_id: "R-38", alias: "#victim-slug", target: null, category: "C", status: "excluded", resolution: "Category C template token; not a routable link" },
      { conflict_id: "R-39a", alias: "#milwaukee-context", target: "context.html#milwaukee-context", category: "D", status: "resolved", resolution: "Tier 1 page-level section wrapper on context.html" },
      { conflict_id: "R-39b", alias: "#community-impact", target: "impact.html#community", category: "B", status: "resolved", resolution: "Nav Tier 1 / Tier 2 alias on impact.html" },
      { conflict_id: "R-39c", alias: "#modern-reexamination", target: "impact.html#primary-sources", category: "B", status: "resolved", resolution: "Nav Tier 1 / Tier 2 alias on impact.html" },
      { conflict_id: "R-39d", alias: "#full-conclusion", target: "impact.html#master-conclusion", category: "B", status: "resolved", resolution: "Nav Tier 1 / Tier 2 alias on impact.html" },
      { conflict_id: "R-40", alias: "#historiographical-eval.", target: "impact.html#historiographical-evaluation", category: "C", status: "excluded", resolution: "Truncation artifact with trailing period; canonical is #historiographical-evaluation" },
      { conflict_id: "VICTIM-01", alias: "jamie-doxtator", target: "victims.html#james-doxtator", category: "B", status: "resolved", resolution: "Victim slug alias from Section 5.6" },
      { conflict_id: "VICTIM-02", alias: "eddie-smith", target: "victims.html#edward-smith", category: "B", status: "resolved", resolution: "Victim slug alias from Section 5.6" },
      { conflict_id: "VICTIM-03", alias: "tony-hughes", target: "victims.html#anthony-hughes", category: "B", status: "resolved", resolution: "Victim slug alias from Section 5.6" }
    ]
  };

  fs.writeFileSync(OUTPUTS.aliases_json, JSON.stringify(routeAliasesData, null, 2), 'utf8');
  console.log(`✓ Wrote: ${path.relative(ROOT_DIR, OUTPUTS.aliases_json)}`);

  // 5. Render static sources.html (pure offline, zero runtime fetch)
  const tabsList = Array.from(parsedTabsMap.values());
  const canonicalList = Array.from(canonicalMap.values());
  const htmlContent = renderSourcesHtml(tabsList, canonicalList);

  fs.writeFileSync(OUTPUTS.html, htmlContent, 'utf8');
  console.log(`✓ Wrote: ${path.relative(ROOT_DIR, OUTPUTS.html)} (${Buffer.byteLength(htmlContent, 'utf8')} bytes)`);
  console.log('\n================================================================================');
  console.log('SUCCESS: Build-time generation complete with zero errors.');
  console.log('================================================================================\n');
}

// 6. HTML RENDERER FUNCTION
function renderSourcesHtml(tabs, canonicalSources) {
  // Group canonical sources by tier
  const tierGroups = {
    'primary-judicial': [],
    'primary-archival': [],
    'scholarly': [],
    'contemporary': [],
    'secondary': []
  };

  for (const s of canonicalSources) {
    if (tierGroups[s.tier]) {
      tierGroups[s.tier].push(s);
    } else {
      tierGroups['secondary'].push(s);
    }
  }

  // Sort each tier alphabetically by ID
  for (const t of Object.keys(tierGroups)) {
    tierGroups[t].sort((a, b) => a.id.localeCompare(b.id));
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sources, Bibliography &amp; Research Standards — The Dahmer Case Archive</title>
  <meta name="description" content="Definitive research bibliography, primary repository directory, claim verification tiers, and research methodology for the Jeffrey Dahmer Case Archive.">
  <link rel="stylesheet" href="assets/css/variables.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/layout.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <style>
    /* Phase D Sources Component Styles */
    .sources-view-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      margin: var(--space-xl) 0 var(--space-md) 0;
      padding-bottom: var(--space-sm);
      border-bottom: 2px solid var(--color-border);
    }
    .view-switch {
      display: inline-flex;
      gap: var(--space-2xs);
      background: var(--color-surface-subtle);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .view-switch-btn {
      padding: var(--space-xs) var(--space-md);
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: var(--text-sm);
      text-decoration: none;
      color: var(--color-text-muted);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }
    .view-switch-btn:hover {
      color: var(--color-text);
      background: rgba(0, 0, 0, 0.04);
    }

    /* Zero-JS Pure CSS View Switcher using :target */
    .by-source-view { display: none; }
    .by-tab-view { display: block; }

    #by-source:target ~ main .content-views .by-tab-view,
    #key-sources:target ~ main .content-views .by-tab-view {
      display: none;
    }
    #by-source:target ~ main .content-views .by-source-view,
    #key-sources:target ~ main .content-views .by-source-view {
      display: block;
    }

    /* Active button styling */
    .view-switch .view-tab-btn {
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    #by-source:target ~ main .view-switch .view-tab-btn,
    #key-sources:target ~ main .view-switch .view-tab-btn,
    body:has(.by-source-view :target) .view-switch .view-tab-btn {
      background: transparent;
      color: var(--color-text-muted);
      box-shadow: none;
    }
    #by-source:target ~ main .view-switch .view-source-btn,
    #key-sources:target ~ main .view-switch .view-source-btn,
    body:has(.by-source-view :target) .view-switch .view-source-btn {
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* Reveal source view when targeting a canonical ID anchor */
    body:has(.by-source-view :target) .by-tab-view {
      display: none !important;
    }
    body:has(.by-source-view :target) .by-source-view {
      display: block !important;
    }

    .source-list {
      list-style: none;
      padding: 0;
      margin: var(--space-md) 0;
    }
    .source-entry {
      padding: var(--space-md) var(--space-lg);
      margin-bottom: var(--space-sm);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .source-entry:has(:target),
    .source-entry:target {
      border-color: #0d47a1;
      box-shadow: 0 0 0 3px rgba(13, 71, 161, 0.15);
      background: #fafcfe;
    }
    .source-entry-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-sm);
      margin-bottom: var(--space-xs);
    }
    .source-id-badge {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-muted);
      text-decoration: none;
    }
    .source-id-badge:hover {
      text-decoration: underline;
      color: var(--color-text);
    }
    .source-tier-badge {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border: 1px solid var(--color-border);
    }
    .tier-primary-judicial { background: #e3f2fd; color: #0d47a1; border-color: #bbdefb; }
    .tier-primary-archival { background: #e8eaf6; color: #1a237e; border-color: #c5cae9; }
    .tier-scholarly { background: #e8f5e9; color: #1b5e20; border-color: #c8e6c9; }
    .tier-contemporary { background: #fff3e0; color: #e65100; border-color: #ffe0b2; }
    .tier-secondary { background: #f5f5f5; color: #424242; border-color: #e0e0e0; }

    .source-citation {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      line-height: 1.55;
      margin: var(--space-2xs) 0;
      color: var(--color-text);
    }
    .source-meta-row {
      margin-top: var(--space-xs);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: 1.5;
    }
    .source-url-link {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      word-break: break-all;
    }
    .source-locators {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: var(--space-xs);
      font-family: var(--font-sans);
      font-size: var(--text-xs);
    }
    .locator-label {
      font-weight: 600;
      color: var(--color-text-muted);
      margin-right: 2px;
    }
    .locator-pill {
      display: inline-block;
      background: var(--color-surface-subtle);
      padding: 2px 8px;
      border-radius: var(--radius-xs);
      border: 1px solid var(--color-border);
      text-decoration: none;
      color: var(--color-text);
      font-weight: 500;
      transition: background 0.15s ease;
    }
    .locator-pill:hover {
      background: var(--color-surface);
      border-color: var(--color-text-muted);
    }
    .anchor-target-marker {
      display: block;
      position: relative;
      top: -80px;
      visibility: hidden;
      height: 0;
    }
    .tab-section-intro {
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin-bottom: var(--space-md);
    }
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-md);
      margin: var(--space-lg) 0;
      padding: var(--space-md);
      background: var(--color-surface-subtle);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-family: var(--font-mono);
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--color-text);
    }
    .stat-label {
      font-family: var(--font-sans);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <!-- Skip to Main Content Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Top Edition Bar -->
  <aside class="site-topbar" aria-label="Archive Edition Information">
    <div class="container site-topbar-inner">
      <div class="topbar-edition">
        <span>The Jeffrey Dahmer Case Archive</span>
        <span class="topbar-bullet" aria-hidden="true">•</span>
        <span>Sources &amp; Research Standards</span>
      </div>
      <div class="topbar-meta">
        <span>Authoritative Bibliography • 286 Register Entries</span>
        <span class="topbar-bullet" aria-hidden="true">•</span>
        <span>100% Offline Static Edition</span>
      </div>
    </div>
  </aside>

  <!-- Site Masthead -->
  <header class="site-masthead" role="banner">
    <div class="container masthead-inner">
      <div class="masthead-kicker">Documentary Record &amp; Citation Registry</div>
      <p class="masthead-title"><a href="index.html">The Dahmer Case Archive</a></p>
      <p class="masthead-subtitle">Exhaustive bibliography, primary court records, FBI files, and editorial methodology</p>
    </div>
  </header>

  <!-- Primary Sticky Header Navigation (18 Nav Links) -->
  <div class="site-nav-wrapper">
    <div class="container site-nav-container">
      <button class="mobile-nav-toggle" aria-controls="primary-nav" aria-expanded="false" aria-label="Toggle Navigation Menu">
        <span class="toggle-icon" aria-hidden="true">☰</span>
        <span class="toggle-text">Menu</span>
      </button>

      <nav id="primary-nav" class="site-nav" aria-label="Primary Site Navigation">
        <ul class="nav-list" role="menubar">
          <li class="nav-item" role="none"><a href="overview.html" class="nav-link" role="menuitem">Overview</a></li>
          <li class="nav-item" role="none"><a href="victims.html" class="nav-link" role="menuitem">Victims</a></li>
          <li class="nav-item" role="none"><a href="timeline.html" class="nav-link" role="menuitem">Timeline</a></li>
          <li class="nav-item" role="none">
            <a href="context.html" class="nav-link" role="menuitem" aria-haspopup="true">Context <span class="arrow-icon" aria-hidden="true">▾</span></a>
            <ul class="dropdown-menu" role="menu" aria-label="Context Submenu">
              <li class="dropdown-item" role="none"><a href="context.html#milwaukee-context" role="menuitem">Milwaukee: 1987–1991</a></li>
              <li class="dropdown-item" role="none"><a href="context.html#early-life" role="menuitem">Early Life &amp; Background</a></li>
            </ul>
          </li>
          <li class="nav-item" role="none">
            <a href="case.html" class="nav-link" role="menuitem" aria-haspopup="true">Case <span class="arrow-icon" aria-hidden="true">▾</span></a>
            <ul class="dropdown-menu" role="menu" aria-label="Case Submenu">
              <li class="dropdown-item" role="none"><a href="case.html#offense-series" role="menuitem">The Offense Series</a></li>
              <li class="dropdown-item" role="none"><a href="case.html#investigation-arrest" role="menuitem">Investigation &amp; Arrest</a></li>
              <li class="dropdown-item" role="none"><a href="case.html#trial-proceedings" role="menuitem">Trial &amp; Legal Proceedings</a></li>
            </ul>
          </li>
          <li class="nav-item" role="none">
            <a href="analysis.html" class="nav-link" role="menuitem" aria-haspopup="true">Analysis <span class="arrow-icon" aria-hidden="true">▾</span></a>
            <ul class="dropdown-menu" role="menu" aria-label="Analysis Submenu">
              <li class="dropdown-item" role="none"><a href="analysis.html#systemic-failures" role="menuitem">Systemic Failures</a></li>
              <li class="dropdown-item" role="none"><a href="analysis.html#psychological-profile" role="menuitem">Psychological Profile &amp; Evaluation</a></li>
              <li class="dropdown-item" role="none"><a href="analysis.html#theories-motivations" role="menuitem">Theories &amp; Motivations</a></li>
            </ul>
          </li>
          <li class="nav-item" role="none">
            <a href="impact.html" class="nav-link" role="menuitem" aria-haspopup="true">Impact <span class="arrow-icon" aria-hidden="true">▾</span></a>
            <ul class="dropdown-menu" role="menu" aria-label="Impact Submenu">
              <li class="dropdown-item" role="none"><a href="impact.html#community-impact" role="menuitem">Community &amp; Civic Impact</a></li>
              <li class="dropdown-item" role="none"><a href="impact.html#social-reform" role="menuitem">Social Impact &amp; Reform</a></li>
              <li class="dropdown-item" role="none"><a href="impact.html#media-portrayal" role="menuitem">Media &amp; Cultural Portrayal</a></li>
              <li class="dropdown-item" role="none"><a href="impact.html#modern-reexamination" role="menuitem">Modern Re-examination</a></li>
              <li class="dropdown-item" role="none"><a href="impact.html#full-conclusion" role="menuitem">Full Research Conclusion</a></li>
            </ul>
          </li>
          <li class="nav-item" role="none">
            <a href="sources.html" class="nav-link active" role="menuitem" aria-current="page" aria-haspopup="true">Sources <span class="arrow-icon" aria-hidden="true">▾</span></a>
            <ul class="dropdown-menu" role="menu" aria-label="Sources Submenu">
              <li class="dropdown-item" role="none"><a href="sources.html#key-sources" role="menuitem">Key Sources &amp; Bibliography</a></li>
              <li class="dropdown-item" role="none"><a href="sources.html#methodology" role="menuitem">Methodology &amp; Standards</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Anchor targets for view switching -->
  <span id="by-tab" class="anchor-target-marker"></span>
  <span id="by-source" class="anchor-target-marker"></span>
  <span id="key-sources" class="anchor-target-marker"></span>

  <main id="main-content">
    <div class="container article-container">
      <header class="article-header" style="margin-bottom: var(--space-lg);">
        <span class="editorial-kicker">Research Directory • Master Bibliography</span>
        <h1 style="font-size: var(--text-3xl); margin-top: var(--space-2xs); margin-bottom: var(--space-sm);">
          Sources, Citations &amp; Research Standards
        </h1>
        <p class="lead-paragraph">
          This archive operates on strict claim-level evidentiary verification. Every factual statement across all seven locked content tabs maps to primary judicial dockets, FBI Vault declassified FOIA records, contemporaneous wire journalism, or peer-reviewed academic studies.
        </p>

        <div class="stats-summary" aria-label="Archive Statistics">
          <div class="stat-item">
            <div class="stat-value">286</div>
            <div class="stat-label">Total Tab Citations</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${canonicalSources.length}</div>
            <div class="stat-label">Unique Canonical Sources</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">7</div>
            <div class="stat-label">Authoritative Registers</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">100%</div>
            <div class="stat-label">Offline Static file://</div>
          </div>
        </div>
      </header>

      <!-- View Switcher Controls -->
      <section class="sources-view-controls" aria-label="Bibliography View Controls">
        <nav class="view-switch" aria-label="Bibliography Display Mode">
          <a href="#by-tab" class="view-switch-btn view-tab-btn">View by Tab (Local Registers)</a>
          <a href="#by-source" class="view-switch-btn view-source-btn">View by Source (Unified Index)</a>
        </nav>
        <div style="font-family: var(--font-sans); font-size: var(--text-xs); color: var(--color-text-muted);">
          <a href="#methodology">Jump to Editorial Methodology &amp; Standards ↓</a>
        </div>
      </section>

      <div class="content-views">
        <!-- VIEW 1: BY TAB (Default View) -->
        <section class="by-tab-view" aria-label="Sources by Tab">
          <div style="margin-bottom: var(--space-xl);">
            <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2xs);">Bibliography by Webapp Tab</h2>
            <p class="tab-section-intro">
              Local numbering is preserved permanently per locked content plan specifications. Every entry contains a verified permalink linking directly to its unified canonical record in the Master Index.
            </p>
          </div>

          ${tabs.map(tab => `
            <section id="sources-${tab.key}" style="margin-top: var(--space-2xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-border);">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: var(--space-sm);">
                <h3 style="font-size: var(--text-xl); margin:0;">
                  Tab: ${tab.name} <span style="font-size: var(--text-sm); font-weight:normal; color:var(--color-text-muted);">(${tab.entries.length} entries)</span>
                </h3>
                <a href="${tab.key}.html" class="locator-pill">Open ${tab.name} Tab →</a>
              </div>
              <p class="tab-section-intro">Authoritative register extracted verbatim from locked tab specification.</p>
              
              <ol class="source-list">
                ${tab.entries.map(e => {
                  const cleanLocal = e.localId.replace(/[^a-z0-9]/gi, '');
                  const tierId = determineCanonicalTier(e.resolvedCanonId, e);
                  return `
                  <li class="source-entry" id="${tab.key}-ref-${cleanLocal}">
                    <div class="source-entry-header">
                      <strong>${e.localId}</strong>
                      <span class="source-tier-badge ${TIERS[tierId].badgeClass}">${TIERS[tierId].title.split('&')[0].trim()}</span>
                    </div>
                    <p class="source-citation">${e.citationLines.join(' ')}</p>
                    ${e.url ? `<p class="source-meta-row"><strong>URL:</strong> <a href="${e.url}" target="_blank" rel="noopener noreferrer" class="source-url-link">${e.url}</a></p>` : ''}
                    ${e.usedFor ? `<p class="source-meta-row"><strong>Evidentiary Scope:</strong> ${e.usedFor}</p>` : ''}
                    <div class="source-locators">
                      <span class="locator-label">Permanent Anchor:</span>
                      <a href="#src-${e.resolvedCanonId}" class="source-id-badge">#src-${e.resolvedCanonId}</a>
                    </div>
                  </li>
                `;
                }).join('')}
              </ol>
            </section>
          `).join('')}
        </section>

        <!-- VIEW 2: BY SOURCE (Unified Index) -->
        <section class="by-source-view" aria-label="Unified Source Index">
          <div style="margin-bottom: var(--space-xl);">
            <h2 style="font-size: var(--text-2xl); margin-bottom: var(--space-2xs);">Unified Source Index (Deduplicated)</h2>
            <p class="tab-section-intro">
              All 286 local citations resolved into unique canonical permalinks across five evidentiary tiers. In accordance with Phase C Part 7.7, sources are addressed strictly by stable permalinks (e.g. <code>#src-fbi-vault</code>), eliminating renumbering errors across the archive.
            </p>
          </div>

          ${Object.entries(tierGroups).map(([tierKey, sources]) => `
            <section id="tier-${tierKey}" style="margin-top: var(--space-2xl); padding-top: var(--space-lg); border-top: 1px solid var(--color-border);">
              <h3 style="font-size: var(--text-xl); margin-bottom: var(--space-2xs);">
                ${TIERS[tierKey].title} <span style="font-size: var(--text-sm); font-weight:normal; color:var(--color-text-muted);">(${sources.length} canonical records)</span>
              </h3>
              <p class="tab-section-intro">${TIERS[tierKey].description}</p>

              <div class="source-list">
                ${sources.map(s => `
                  <article class="source-entry" id="src-${s.id}">
                    ${s.id === 'wis-971-15-165' ? '<span id="src-wis-971-15" class="anchor-target-marker"></span>' : ''}
                    ${s.id === 'wapo-1992-02-16' ? '<span id="src-wapo-1992-02-15" class="anchor-target-marker"></span>' : ''}
                    ${s.id === 'wapo-1991-08-23' ? '<span id="src-wapo-1991-08-22" class="anchor-target-marker"></span>' : ''}
                    <div class="source-entry-header">
                      <span class="source-id-badge">#src-${s.id}</span>
                      <span class="source-tier-badge ${TIERS[s.tier].badgeClass}">${s.type}</span>
                    </div>
                    <p class="source-citation">${s.citation}</p>
                    ${s.url ? `<p class="source-meta-row"><strong>Verified Resource:</strong> <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="source-url-link">${s.url}</a></p>` : ''}
                    <div class="source-locators">
                      <span class="locator-label">Cited in Registers:</span>
                      ${s.appears_in.map(loc => `<a href="#${loc.tab}-ref-${loc.local.replace(/[^a-z0-9]/gi, '')}" class="locator-pill">${loc.tab} ${loc.local}</a>`).join(' ')}
                    </div>
                  </article>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </section>
      </div>

      <!-- METHODOLOGY & STANDARDS SECTION -->
      <section id="methodology" style="margin-top: var(--space-3xl); border-top: 2px solid var(--color-border); padding-top: var(--space-2xl);">
        <span class="editorial-kicker">Research Governance • Evidentiary Protocols</span>
        <h2 style="font-size: var(--text-2xl); margin-top: var(--space-2xs); margin-bottom: var(--space-md);">
          Editorial Methodology &amp; Research Standards
        </h2>
        
        <h3>1. Epistemological Certainty Tiers</h3>
        <p>Every factual statement in this archive is evaluated against four distinct certainty tiers to maintain epistemological rigor:</p>
        <ul style="margin: var(--space-sm) 0 var(--space-lg) var(--space-lg); line-height: 1.6;">
          <li><strong>[ESTABLISHED]</strong>: Confirmed by primary physical evidence, verified judicial dockets, certified charging instruments, or uncontested sworn testimony under cross-examination.</li>
          <li><strong>[DOCUMENTED]</strong>: Sourced to contemporaneous investigative reporting, police incident reports, institutional correspondence, or verified municipal filings.</li>
          <li><strong>[ATTRIBUTED]</strong>: First-person confessions, psychiatric interview self-reports, or retrospective memoirs. Always explicitly framed in prose as statements rather than objective historical facts.</li>
          <li><strong>[DISPUTED]</strong>: Conflicting statements, retracted academic claims (e.g. Jentzen et al. 1994 "Destructive Hostility"), or unresolved historical discrepancies (e.g. D-01 through D-05). Explicitly noted with divergent accounts presented transparently.</li>
        </ul>

        <h3>2. Statutory Distinctions</h3>
        <p>
          Wisconsin homicide law underwent a structural legislative overhaul effective January 1, 1989 under <strong>1987 Wisconsin Act 399</strong>. Homicides committed prior to 1989 (Steven Hicks, Steven Tuomi, James Doxtator, Richard Guerrero) were charged and adjudicated under former Wis. Stat. § 940.01 ("First-Degree Murder"). All 13 homicides from 1989 onwards were charged under repealed and recreated Wis. Stat. § 940.01(1) ("First-Degree Intentional Homicide").
        </p>

        <h3>3. Sanity Phase Adjudication</h3>
        <p>
          Under Wis. Stat. § 971.15 and § 971.165, Dahmer entered pleas of guilty but not guilty by reason of mental disease or defect to 15 Wisconsin homicide counts, waiving the guilt phase. The jury trial in Milwaukee County Circuit Court (Hon. Laurence C. Gram, Jr. presiding) was strictly an adjudication of legal responsibility during the offenses. Under Wis. Stat. § 805.09(2), the verdict required a 10–2 (five-sixths) concurrence. Describing Dahmer as "convicted by a jury of murder" is legally inaccurate and prohibited; he pled guilty to the killings, and the jury found him legally sane.
        </p>

        <h3>4. Non-Graphic Evidentiary Standard</h3>
        <p>
          In strict accordance with project ethics standards, zero crime-scene photographs, autopsy imagery, or photographs of human remains are published. All visual plates depict official documents, public judicial proceedings, contemporary streetscapes, or analytical maps, maintaining victim dignity.
        </p>

        <h3>5. Primary Public Record Repositories</h3>
        <p>
          The documentary spine of this archive draws from six primary public record repositories:
        </p>
        <ol style="margin: var(--space-sm) 0 var(--space-lg) var(--space-lg); line-height: 1.6;">
          <li><strong>Milwaukee County Circuit Court Records Department</strong> (Milwaukee County Courthouse, Milwaukee, WI): Criminal complaint (Case No. F-912542), preliminary hearing transcripts, 15 homicide charging schedules, and sanity-phase trial exhibits.</li>
          <li><strong>Federal Bureau of Investigation (FBI) Electronic Reading Room / The Vault</strong>: 19-part declassified Freedom of Information Act (FOIA) archive on Jeffrey Lionel Dahmer.</li>
          <li><strong>Wisconsin Historical Society Library &amp; Archives</strong> (Madison, WI): Broadcast news archives (WTMJ-TV, WITI-TV, WISN-TV), contemporary press morgues, and civic records.</li>
          <li><strong>Milwaukee Public Library Central Branch Periodical Archives</strong>: Complete microfilm holdings of <em>The Milwaukee Journal</em> and <em>The Milwaukee Sentinel</em> (July 1991 – December 1994).</li>
          <li><strong>U.S. District Court for the Eastern &amp; Western Districts of Wisconsin</strong>: Dockets and published opinions for <em>Estate of Sinthasomphone v. City of Milwaukee</em>, <em>Balcerzak &amp; Gabrish v. City of Milwaukee</em>, and <em>Weinberger v. State of Wisconsin</em>.</li>
          <li><strong>National Archives and Records Administration (NARA)</strong>, Chicago Regional Facility: Regional civil rights compliance documentation and federal agency records.</li>
        </ol>
      </section>
    </div>
  </main>

  <!-- Broadsheet Editorial Footer -->
  <footer class="site-footer" role="contentinfo">
    <div class="container footer-inner">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-title">The Dahmer Case Archive</div>
          <p class="footer-brand-desc">
            A non-sensational, source-cited historical repository examining the 1978–1991 offenses, institutional responses, and civic aftermath in Milwaukee and Ohio. Dedicated to historical accuracy and the memory of the victims.
          </p>
        </div>
        <div class="footer-nav-group">
          <div class="footer-nav-title">Archive Sections</div>
          <ul class="footer-nav">
            <li><a href="overview.html">Overview</a></li>
            <li><a href="victims.html">Victims</a></li>
            <li><a href="timeline.html">Timeline</a></li>
            <li><a href="context.html">Context</a></li>
            <li><a href="case.html">Case Record</a></li>
            <li><a href="analysis.html">Analysis</a></li>
            <li><a href="impact.html">Impact &amp; Legacy</a></li>
            <li><a href="sources.html">Sources &amp; Methodology</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copyright">
          <span>Documentary Research Project • Non-Commercial Educational Reference</span>
        </div>
        <div class="footer-meta">
          <span>Based on primary judicial dockets, FBI files, contemporary reporting, and academic research. Designed for complete offline access.</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Local Navigation Script -->
  <script src="assets/js/nav.js"></script>
</body>
</html>`;
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildSources().catch(err => {
    console.error('Build execution failed:', err);
    process.exit(1);
  });
}
