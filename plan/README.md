# The Jeffrey Dahmer Case Archive — Webapp Research & Development Guide

**Active Workspace:** `D:\.gemini\WebApps Projects\Dahmer html\plan`  
**Root Webapp Directory:** `D:\.gemini\WebApps Projects\Dahmer html`  
**Last Updated:** 2026-10-25  
**Current Phase:** Phase B — Content & Citation Verification (Tab-by-Tab)

---

## 1. Project Overview & Core Philosophy

This project is a serious, source-cited historical and research repository documenting the 1978–1991 Jeffrey Dahmer offenses, systemic institutional failures (police, probation, municipal), forensic psychiatry, and civic aftermath in Milwaukee and Ohio.

### Editorial & Architectural Mandate:
- **Restrained Editorial Tone:** Read like a serious scholarly/journalistic publication, not sensational true crime.
- **Human-Centered Victimology:** Focus on who the victims were as individuals (their backgrounds, talents, and families); avoid reducing lives to case numbers or sensational forensic details.
- **Strict Evidence Standards:** Separate documented facts from interpretations, trial arguments, and cultural mythologies.
- **Milestone Separation:** Never conflate (1) Last-Known Sighting, (2) Missing-Person Report Date, (3) Alleged Offense Date, and (4) Forensic Identification Date.
- **Two Distinct Conclusions:** A concise conclusion at the end of the Overview article (`/overview#conclusion`), and a comprehensive master research treatise closing the Impact section (`/impact#master-conclusion`).

---

## 2. Master Implementation Strategy

> **Core Operating Rule:**  
> **Finish claim-level citations and lock content across ALL tabs first, then build the HTML pages one by one.**

### Why this strategy:
1. **Evidentiary Consistency:** Dates, birth years, and institutional milestones are synchronized across all tabs before committing to HTML.
2. **Anchor Stability:** Cross-linking anchor IDs (e.g., `#era-1991`, `#event-sinthasomphone-1991`, `#steven-hicks`) are defined and stable across the entire site.
3. **Rapid HTML Production:** Building HTML becomes purely focused on semantics, accessibility, typography, responsive styling, and UI interactions without pausing to chase citation locators.

---

## 3. Phase 1 Tracker: Content & Citation Verification (Tab by Tab)

| # | Tab / Section | Target Working File(s) | Citations & Content Status | Last Updated | Notes / Key Milestones |
|:---:|---|---|:---:|:---:|---|
| **01** | **Overview** | [`01_overview_content_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/01_overview_content_plan_v02.txt) | **COMPLETED & LOCKED** | 2026-10-19 | Factual spine established; prototype [`overview.html`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/overview.html) live. |
| **02** | **Victims** | [`04_victims_content_plan_v05_final_locked.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/04_victims_content_plan_v05_final_locked.txt), [`table_1_the_victims_v04.md`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/table_1_the_victims_v04.md) | **COMPLETED & LOCKED** | 2026-10-25 | 100% primary DOB coverage; dagger (`†`) retired; 27-entry bibliography locked; 17 profiles fact-checked. |
| **03** | **Timeline** | [`05_timeline_content_plan_v04_final_locked.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/05_timeline_content_plan_v04_final_locked.txt) | **COMPLETED & LOCKED** | 2026-10-25 | Table 2 verified; 44 milestones cited with 1-based FBI locators; 33-entry bibliography locked; stable anchor IDs established. |
| **04** | **Context** | [`02_context_content_plan_v03_final_locked.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/02_context_content_plan_v03_final_locked.txt) | **COMPLETED & LOCKED** | 2026-10-25 | Sections A & B audited; 32-source bibliography locked; primary FBI 1-based page coordinates verified (Part 01 p. 29); non-deterministic framing enforced. |
| **05** | **Case** | [`03a_case_offense_series_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/03a_case_offense_series_plan_v02.txt), [`03b_case_investigation_and_trial_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/03b_case_investigation_and_trial_plan_v02.txt) | **[ ] IN PROGRESS** | 2026-10-25 | Offense pattern, investigation, arrest, and trial proceedings. |
| **06** | **Analysis** | [`06a_analysis_psychological_profile_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/06a_analysis_psychological_profile_plan_v02.txt), [`06b_analysis_systemic_failures_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/06b_analysis_systemic_failures_plan_v02.txt), [`06c_analysis_theories_and_motivations_plan_v02.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/06c_analysis_theories_and_motivations_plan_v02.txt) | **[ ] PENDING** | — | Clinical psychiatry, 4 systemic failure themes, theories vs evidence. |
| **07** | **Impact** | [`07_impact_and_legacy_content_plan_v01.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/07_impact_and_legacy_content_plan_v01.txt) | **[ ] PENDING FINAL RECONCILIATION** | 2026-10-19 | 50 scholarly/primary citations drafted; needs global crosswalk verification. |
| **08** | **Sources** | [`08_sources_by_tab.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/08_sources_by_tab.txt) | **[ ] PENDING GLOBAL CONSOLIDATION** | 2026-10-19 | Master repository directory governing `/sources.html`. |

---

## 4. Phase 2 Tracker: HTML Page Implementation (After Phase 1 is Complete)

- [x] **`index.html`** (Homepage editorial front page with expandable Overview preview & 6 Selected Victims cards)
- [x] **`overview.html`** (Comprehensive case overview & factual spine)
- [ ] **`victims.html`** (Interactive Table 1 with filters, 17 profiles, and modal/biographical expanders)
- [ ] **`timeline.html`** (Interactive Table 2 with era navigation, category filters, and cross-linking anchors)
- [ ] **`context.html`** (Historical Milwaukee 1987–1991 and early background)
- [ ] **`case.html`** (Offense series, investigation, and trial)
- [ ] **`analysis.html`** (Systemic failures, psychiatric profile, and research theories)
- [ ] **`impact.html`** (Community impact, media ethics, and master closing conclusion)
- [ ] **`sources.html`** (Comprehensive research directory, methodology, and further reading)

---

## 5. Master Reference Files Directory

- **Master Plan:** [`00_webapp_master_implementation_plan_v04.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/00_webapp_master_implementation_plan_v04.txt)
- **Victims Reconciled Concordance:** [`Dahmer_Victims_Master_Citation_Tracker_v10.md`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/Dahmer_Victims_Master_Citation_Tracker_v10.md)
- **Victims Master Table 1:** [`table_1_the_victims_v04.md`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/table_1_the_victims_v04.md)
- **Victims Final Locked Copy:** [`04_victims_content_plan_v05_final_locked.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/04_victims_content_plan_v05_final_locked.txt)
- **Timeline Working Plan:** [`05_timeline_content_plan_v03.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/05_timeline_content_plan_v03.txt)
- **Impact Final Research Dossier:** [`07_impact_and_legacy_content_plan_v01.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/07_impact_and_legacy_content_plan_v01.txt)
- **Central Sources Register:** [`08_sources_by_tab.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/08_sources_by_tab.txt)
- **Primary FBI Vault PDFs:** Located in [`assets/`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/assets/) (`Dahmer Part 01.pdf` [68 pp.], `Part 03 of 19.pdf` [60 pp.], `Part 06 of 19.pdf` [74 pp.]).

---

## 6. How to Resume Work in Antigravity (AGY CLI)

When starting a new session:
1. Open this [`README.md`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/README.md) file to check the current `[ ] IN PROGRESS` tab under **Section 3**.
2. Read the active tab's content plan in `plan/` (e.g., [`05_timeline_content_plan_v03.txt`](file:///D:/.gemini/WebApps%20Projects/Dahmer%20html/plan/05_timeline_content_plan_v03.txt)).
3. Verify claims against primary documents in `plan/` and `assets/`.
4. Insert citations, synchronize facts with previously locked tabs, and produce the `_final_locked.txt` copy.
5. Update the checkbox in this `README.md` and move to the next tab in sequence.
