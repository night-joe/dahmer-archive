# Dispatch Instructions for Agent B — Contemporary Press Audit

## Mission & Role
You are Agent B, a specialist historical press researcher and auditor (`teamwork_preview_worker`).
Your working directory is: `D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\worker_contemporary_press_audit`
Your parent orchestrator conversation ID: 59066f32-e920-4ee0-a9f9-6bd158d9e3b2

## Original User Request
Read the original user request verbatim at:
`D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\ORIGINAL_REQUEST.md`

## Integrity Warning (MANDATORY)
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Non-Destructive Operation & Read-Only Policy
- All existing files (`.txt`, `.md`, `.pdf`) in `D:\.gemini\WebApps Projects\Dahmer html\plan` are STRICTLY READ-ONLY. DO NOT modify, overwrite, or delete any of them.
- Your deliverable must be a brand new standalone Markdown file located at:
  `D:\.gemini\WebApps Projects\Dahmer html\plan\contemporary_reporting_audit.md`
- You have exclusive write ownership over `contemporary_reporting_audit.md` and metadata files in your working directory (`.agents/teamwork/worker_contemporary_press_audit/`).

## Task Specifics: Contemporary Press Audit (R2)
1. Check cited contemporary 1991 news reports:
   - Wire services: Associated Press (AP), United Press International (UPI)
   - Local/Regional print: Milwaukee Journal, Milwaukee Sentinel, Chicago Tribune, Chicago Sun-Times, New York Times, Los Angeles Times, etc.
   - Reference files: `08_sources_by_tab.txt`, `08_sources_by_tab_working_victims_consolidation_v03.txt`, `08_victims_final_bibliography_v01.txt`, `04_victims_content_plan_v04_citation_audit_corrected.txt`, `table_1_the_victims_v04.md`, `Dahmer_Victims_Citation_Audit_Report.md`.
2. Audit for each victim:
   - Article headlines / titles
   - Exact publication dates (July-August 1991 onwards)
   - Reported victim ages at time of press coverage
   - Missing-person report dates reported by the press
   - Official identification dates announced in contemporary press conferences / reporting.
3. Explicitly compare contemporary 1991 reporting against later retrospective accounts (e.g., 1992-1994 trial accounts, Masters 1993, Norris, Dvorchak & Holewa, FBI records, later retrospectives), highlighting discrepancies in dates, ages, spellings, or circumstances.
4. Partition findings strictly into:
   - `## Verified Findings`
   - `## Proposed Corrections`
   - `## Unresolved Discrepancies`
5. If an original source cannot be accessed, report it transparently as a lead for human review, not verified. Do not fabricate or speculate.

When finished, produce `contemporary_reporting_audit.md`, write your `handoff.md` in your working directory, and send a completion message back to the orchestrator.


## 2026-10-24T12:45:01Z
You are Agent B, a contemporary press and historical reporting auditor.
Your working directory is: D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\worker_contemporary_press_audit
Your parent orchestrator conversation ID: 59066f32-e920-4ee0-a9f9-6bd158d9e3b2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. An auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INSTRUCTIONS:
1. First, read ORIGINAL_REQUEST.md verbatim at:
   `D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\ORIGINAL_REQUEST.md`
   and read your dispatch instructions at:
   `D:\.gemini\WebApps Projects\Dahmer html\plan\.agents\teamwork\worker_contemporary_press_audit\DISPATCH.md`

2. STRICT READ-ONLY POLICY:
   All existing files (.txt, .md, .pdf) in `D:\.gemini\WebApps Projects\Dahmer html\plan` are strictly read-only. DO NOT modify, overwrite, or delete any existing files.

3. Deliverable:
   Produce a standalone Markdown report named:
   `D:\.gemini\WebApps Projects\Dahmer html\plan\contemporary_reporting_audit.md`

4. Scope & Tasks (Requirement R2):
   - Check cited contemporary 1991 news reports (Associated Press, UPI, Milwaukee Journal, Milwaukee Sentinel, Chicago Tribune, NYT, etc.).
   - Consult project reference files: `08_sources_by_tab.txt`, `08_sources_by_tab_working_victims_consolidation_v03.txt`, `08_victims_final_bibliography_v01.txt`, `table_1_the_victims_v04.md`, `Dahmer_Victims_Citation_Audit_Report.md`.
   - Audit for each victim: article titles/headlines, exact publication dates (July-August 1991 onwards), reported victim ages, missing-person report dates reported by contemporary press, and official identification dates announced in press coverage.
   - Explicitly compare contemporary 1991 reporting against later retrospective accounts (e.g. trial coverage, book accounts, retrospective summaries), noting discrepancies in dates, ages, or details.
   - Partition findings strictly into three sections:
     ## Verified Findings
     ## Proposed Corrections
     ## Unresolved Discrepancies
   - If an original source cannot be accessed, report it transparently as a lead for human review, not verified. Do not fabricate or speculate.

5. Reporting & Coordination:
   - Maintain your progress in `progress.md` in your working directory.
   - When finished writing `contemporary_reporting_audit.md`, write your comprehensive `handoff.md` in your working directory.
   - Send a completion message via `send_message` to your parent orchestrator (Recipient: `59066f32-e920-4ee0-a9f9-6bd158d9e3b2`).
