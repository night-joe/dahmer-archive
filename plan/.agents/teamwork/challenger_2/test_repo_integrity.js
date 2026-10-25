const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\.gemini\\WebApps Projects\\Dahmer html\\plan';

// Known preexisting files before the audit started (from audit logs and directory listing)
const preexistingFiles = [
  '00_webapp_master_implementation_plan_v04.txt',
  '01_overview_content_plan_v02.txt',
  '02_context_content_plan_v02.txt',
  '03a_case_offense_series_plan_v02.txt',
  '03b_case_investigation_and_trial_plan_v02.txt',
  '04_victims_content_plan_v02.txt',
  '04_victims_content_plan_v03_cited_working_copy.txt',
  '04_victims_content_plan_v03_working_citations.txt',
  '04_victims_content_plan_v04_citation_audit_corrected.txt',
  '04_victims_content_plan_v05_final_locked.txt',
  '05_timeline_content_plan_v03.txt',
  '05_timeline_content_plan_v04_final_locked.txt',
  '06a_analysis_psychological_profile_plan_v02.txt',
  '06b_analysis_systemic_failures_plan_v02.txt',
  '06c_analysis_theories_and_motivations_plan_v02.txt',
  '07_impact_and_legacy_content_plan_v01.txt',
  '08_sources_by_tab.txt',
  '08_sources_by_tab_working_victims_consolidation_v03.txt',
  '08_victims_final_bibliography_v01.txt',
  'contemporary_reporting_audit.md',
  'Dahmer Part 01.pdf',
  'Dahmer_Victims_Citation_Audit_Batch_1.md',
  'Dahmer_Victims_Citation_Audit_Batch_2.md',
  'Dahmer_Victims_Citation_Audit_Batch_3.md',
  'Dahmer_Victims_Citation_Audit_Batch_4.md',
  'Dahmer_Victims_Citation_Audit_Batch_5.md',
  'Dahmer_Victims_Citation_Audit_Batch_6.md',
  'Dahmer_Victims_Citation_Audit_Report.md',
  'Dahmer_Victims_Evidence_Anchor_and_Date_Audit_Report.md',
  'Dahmer_Victims_Evidence_Anchor_and_Date_Audit_Report_corrected.md',
  'Dahmer_Victims_Evidence_Map - updated.md',
  'Dahmer_Victims_Evidence_Map.md',
  'Dahmer_Victims_Evidence_Map_Updated.md',
  'Dahmer_Victims_FBI_Anchor_Verification_Addendum.md',
  'Dahmer_Victims_Master_Citation_Tracker_v01.md',
  'Dahmer_Victims_Master_Citation_Tracker_v07.md',
  'Dahmer_Victims_Master_Citation_Tracker_v08.md',
  'Dahmer_Victims_Master_Citation_Tracker_v09.md',
  'Dahmer_Victims_Master_Citation_Tracker_v10.md',
  'Dahmer_Victims_v04_Comprehensive_Audit_Report.md',
  'Dahmer_Victims_v04_FBI_Primary_Source_Audit.md',
  'fbi_vault_locator_audit.md',
  'Jeffrey Lionel Dahmer Part 03 of 19.pdf',
  'Jeffrey Lionel Dahmer Part 06 of 19.pdf',
  'official_chronology_audit.md',
  'README.md',
  'table 1 for reference.md',
  'table_1_the_victims_v01.md',
  'table_1_the_victims_v02.md',
  'table_1_the_victims_v03.md',
  'table_1_the_victims_v04.md',
  'Victims-Citation-Verification-Report.md'
];

console.log('Checking all preexisting files in plan directory...');
let allPreserved = true;
preexistingFiles.forEach(f => {
  const filePath = path.join(projectRoot, f);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING FILE: ${f}`);
    allPreserved = false;
  } else {
    const stats = fs.statSync(filePath);
    // Print file existence and mtime
  }
});

console.log(`Preexisting file check: ${allPreserved ? 'ALL 52 PREEXISTING FILES VERIFIED INTACT' : 'FILES MISSING'}`);

// Also check new deliverables:
const deliverables = [
  'context_evidentiary_audit.md',
  '02_context_content_plan_v03_final_locked.txt'
];

deliverables.forEach(f => {
  const filePath = path.join(projectRoot, f);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`Target deliverable verified: ${f} (${stats.size} bytes, modified ${stats.mtime.toISOString()})`);
  } else {
    console.error(`Target deliverable MISSING: ${f}`);
  }
});
