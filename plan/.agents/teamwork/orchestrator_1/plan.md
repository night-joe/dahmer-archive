# Detailed Orchestration Plan: Dahmer Victims Source Audits

## Overview & Objectives
Conduct three independent, rigorous source audits for Table 1: The Victims in the Jeffrey Dahmer research project:
1. R1: Agent A (FBI Vault Locator Audit) -> `fbi_vault_locator_audit.md` in project root
2. R2: Agent B (Contemporary Press Audit) -> `contemporary_reporting_audit.md` in project root
3. R3: Agent C (Official Chronology Audit) -> `official_chronology_audit.md` in project root
4. R4: Strict non-destructive read-only policy on all existing 45 files in `D:\.gemini\WebApps Projects\Dahmer html\plan`.

## Input Files for All Agents (Read-Only)
- `ORIGINAL_REQUEST.md`: Full task specification and acceptance criteria.
- Target Table: `table_1_the_victims_v04.md` (and prior versions `table_1_the_victims_v01.md`, `v02`, `v03`, `table 1 for reference.md`).
- Evidence & Citation Maps:
  * `Dahmer_Victims_Evidence_Map_Updated.md`
  * `Dahmer_Victims_Evidence_Map.md`
  * `Dahmer_Victims_Evidence_Map - updated.md`
  * `Dahmer_Victims_Master_Citation_Tracker_v09.md` (v01, v07, v08)
  * `Dahmer_Victims_Citation_Audit_Report.md`
  * `Dahmer_Victims_v04_Comprehensive_Audit_Report.md`
  * `Dahmer_Victims_v04_FBI_Primary_Source_Audit.md`
  * `Dahmer_Victims_FBI_Anchor_Verification_Addendum.md`
  * `Dahmer_Victims_Evidence_Anchor_and_Date_Audit_Report_corrected.md`
- Primary Document PDFs:
  * `Jeffrey Lionel Dahmer Part 01.pdf` (or `Dahmer Part 01.pdf`)
  * `Jeffrey Lionel Dahmer Part 03 of 19.pdf`
  * `Jeffrey Lionel Dahmer Part 06 of 19.pdf`
- Content Plans:
  * `04_victims_content_plan_v04_citation_audit_corrected.txt`
  * `05_timeline_content_plan_v03.txt`
  * `08_sources_by_tab_working_victims_consolidation_v03.txt`

## Subagent Streams & Working Directories
All subagents are allocated dedicated directories under `.agents/teamwork/`:
1. **Agent A (FBI Vault Locator Audit)**:
   - Type: `teamwork_preview_worker`
   - Working Directory: `.agents/teamwork/worker_fbi_vault_audit/`
   - Target Deliverable: `D:\.gemini\WebApps Projects\Dahmer html\plan\fbi_vault_locator_audit.md`
   - Mandatory Sections: `Verified Findings`, `Proposed Corrections`, `Unresolved Discrepancies`
   - Core Focus: Cross-reference every cited FBI Vault part and PDF page locator in Table 1 v04 and evidence maps against primary PDFs (`Dahmer Part 01.pdf`, `Part 03 of 19.pdf`, `Part 06 of 19.pdf`). Document exact claims supported, conflicting DOBs/dates, and unverified/inaccessible locators.

2. **Agent B (Contemporary Press Audit)**:
   - Type: `teamwork_preview_worker`
   - Working Directory: `.agents/teamwork/worker_contemporary_press_audit/`
   - Target Deliverable: `D:\.gemini\WebApps Projects\Dahmer html\plan\contemporary_reporting_audit.md`
   - Mandatory Sections: `Verified Findings`, `Proposed Corrections`, `Unresolved Discrepancies`
   - Core Focus: Audit 1991 contemporary news reports (AP, UPI, Milwaukee Journal, Milwaukee Sentinel, Chicago Tribune, NYT, etc.). Verify headlines, publication dates, reported victim ages, missing-person report dates, and official identification dates. Explicitly compare 1991 reporting vs later retrospective accounts.

3. **Agent C (Official Chronology Audit)**:
   - Type: `teamwork_preview_worker`
   - Working Directory: `.agents/teamwork/worker_official_chronology_audit/`
   - Target Deliverable: `D:\.gemini\WebApps Projects\Dahmer html\plan\official_chronology_audit.md`
   - Mandatory Sections: `Verified Findings`, `Proposed Corrections`, `Unresolved Discrepancies`
   - Core Focus: Audit criminal complaint counts, amended complaint specifications, and official investigative chronology. Maintain strict separation of 4 chronological milestones: (1) Date of last-known contact, (2) Missing-person report filing date, (3) Alleged offense date, (4) Official identification date. Never collapse distinct milestones into one.

4. **Review & Integrity Gate**:
   - Spawning independent Reviewer (`teamwork_preview_reviewer`) and Forensic Auditor (`teamwork_preview_auditor`) to verify:
     * All 3 deliverables exist and are complete.
     * All acceptance criteria are satisfied.
     * Tripartite partitioning (`Verified Findings`, `Proposed Corrections`, `Unresolved Discrepancies`) is adhered to.
     * ZERO existing project files were modified or deleted.

## Execution Timeline
- Phase 1: Planning and Subagent Workspace Setup (Done)
- Phase 2: Concurrent Dispatch of Agents A, B, and C
- Phase 3: Monitoring & Intermediate Progress Checks
- Phase 4: Output Collection & Cross-Verification
- Phase 5: Review & Audit Gate Verification
- Phase 6: Synthesis, Handoff, and Completion Reporting to Parent
