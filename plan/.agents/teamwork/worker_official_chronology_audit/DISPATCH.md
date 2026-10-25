# Dispatch Instructions for Agent C — Official Chronology Audit

## Mission & Role
You are Agent C, a specialist judicial records and official chronology auditor (`teamwork_preview_worker`).
Your working directory is: `D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\worker_official_chronology_audit`
Your parent orchestrator conversation ID: 59066f32-e920-4ee0-a9f9-6bd158d9e3b2

## Original User Request
Read the original user request verbatim at:
`D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\ORIGINAL_REQUEST.md`

## Integrity Warning (MANDATORY)
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Non-Destructive Operation & Read-Only Policy
- All existing files (`.txt`, `.md`, `.pdf`) in `D:\.gemini\WebApps Projects\Dahmer html\plan` are STRICTLY READ-ONLY. DO NOT modify, overwrite, or delete any of them.
- Your deliverable must be a brand new standalone Markdown file located at:
  `D:\.gemini\WebApps Projects\Dahmer html\plan\official_chronology_audit.md`
- You have exclusive write ownership over `official_chronology_audit.md` and metadata files in your working directory (`.agents/teamwork/worker_official_chronology_audit/`).

## Task Specifics: Official Chronology Audit (R3)
1. Audit the criminal complaints, amended complaints, and official investigative chronology:
   - Initial Milwaukee County Criminal Complaint (July 25, 1991: counts 1-4)
   - Amended Criminal Complaint (August 6, 1991: 15 counts of first-degree intentional homicide)
   - Ohio indictment / conviction (Steven Hicks, Summit County, 1992)
   - Medical Examiner / MPD / FBI official investigative records.
   - Reference files: `03a_case_offense_series_plan_v02.txt`, `03b_case_investigation_and_trial_plan_v02.txt`, `05_timeline_content_plan_v03.txt`, `table_1_the_victims_v04.md`, `Dahmer_Victims_Evidence_Map_Updated.md`, `Dahmer_Victims_Evidence_Anchor_and_Date_Audit_Report_corrected.md`.
2. Enforce strict, non-negotiable separation across four distinct chronological milestones for each victim:
   - Milestone 1: Date of last-known contact (when victim was last seen alive by family/friends/witnesses)
   - Milestone 2: Missing-person report filing date (when formal report was filed with MPD/law enforcement)
   - Milestone 3: Alleged offense date (date range or specific date alleged in the criminal complaint / confessed by Dahmer)
   - Milestone 4: Official identification date (when remains were forensically identified by Milwaukee County Medical Examiner Dr. Jeffrey Jentzen / dental / fingerprint / DNA records).
3. Under no circumstances collapse these distinct legal/chronological milestones into a single date.
4. Partition findings strictly into:
   - `## Verified Findings`
   - `## Proposed Corrections`
   - `## Unresolved Discrepancies`
5. If an original source cannot be accessed, report it transparently as a lead for human review, not verified. Do not fabricate or speculate.

When finished, produce `official_chronology_audit.md`, write your `handoff.md` in your working directory, and send a completion message back to the orchestrator.
