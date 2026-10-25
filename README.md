# The Jeffrey Dahmer Case Archive — Webapp Research & Development Guide

**Last Updated:** 2026-10-25  
**Current Phase:** Phase 1 — Content & Citation Verification (Tab-by-Tab) *(corresponds to Phase B in Master Implementation Plan)*

---

## 1. Project Overview & Core Philosophy

This project is a serious, source-cited historical and research repository documenting the 1978–1991 Jeffrey Dahmer offenses, systemic institutional failures (police, probation, municipal), forensic psychiatry, and civic aftermath in Milwaukee and Ohio.

### Editorial & Architectural Mandate:

* **Restrained Editorial Tone:** Read like a serious scholarly/journalistic publication, not sensational true crime.
* **Human-Centered Victimology:** Focus on who the victims were as individuals (their backgrounds, talents, and families); avoid reducing lives to case numbers or sensational forensic details.
* **Strict Evidence Standards:** Separate documented facts from interpretations, trial arguments, and cultural mythologies.
* **Milestone Separation:** Never conflate (1) Last-Known Sighting, (2) Missing-Person Report Date, (3) Alleged Offense Date, and (4) Forensic Identification Date.
* **Two Distinct Conclusions:** A concise conclusion at the end of the Overview article (`/overview#conclusion`), and a comprehensive master research treatise closing the Impact section (`/impact#master-conclusion`).

---

## 2. Master Implementation Strategy

> **Core Operating Rule:**  
> **Finish claim-level citations and lock content across ALL tabs first (Phase 1), then build the HTML pages one by one (Phase 2).**

### Strategic Two-Phase Phasing:
* **Phase 1: Content & Citation Verification (Master Plan Phase B):** Reconcile primary records (FBI Vault, dockets, contemporary reports), map 1-based page coordinates, resolve historical discrepancies, and lock all tab plans.
* **Phase 2: HTML Page Implementation (Master Plan Phase D):** Construct semantic, accessible, responsive pages with cross-linking anchor IDs once content and citations are locked.

### Why this strategy:

1. **Evidentiary Consistency:** Dates, birth years, and institutional milestones are synchronized across all tabs before committing to HTML.
2. **Anchor Stability:** Cross-linking anchor IDs (e.g., `#era-1991`, `#event-sinthasomphone-1991`, `#steven-hicks`) are defined and stable across the entire site.
3. **Rapid HTML Production:** Building HTML becomes purely focused on semantics, accessibility, typography, responsive styling, and UI interactions without pausing to chase citation locators.

---

## 3. Phase 1 Tracker: Content & Citation Verification (Tab by Tab)

|#|Tab / Section|Target Working File(s)|Citations & Content Status|Last Updated|Notes / Key Milestones|
|:-:|-|-|:-:|:-:|-|
|**01**|**Overview**|[`plan/01_overview_content_plan_v02.txt`](plan/01_overview_content_plan_v02.txt)|**COMPLETED & LOCKED**|2026-10-19|Factual spine established; prototype [`overview.html`](overview.html) live.|
|**02**|**Victims**|[`plan/04_victims_content_plan_v05_final_locked.txt`](plan/04_victims_content_plan_v05_final_locked.txt), [`plan/table_1_the_victims_v04.md`](plan/table_1_the_victims_v04.md)|**COMPLETED & LOCKED**|2026-10-25|100% primary DOB coverage; dagger (`†`) retired; 27-entry bibliography locked; 17 profiles fact-checked; verified in [`plan/Dahmer_Victims_Master_Citation_Tracker_v10.md`](plan/Dahmer_Victims_Master_Citation_Tracker_v10.md).|
|**03**|**Timeline**|[`plan/05_timeline_content_plan_v04_final_locked.txt`](plan/05_timeline_content_plan_v04_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|Table 2 verified; 44 milestones cited with 1-based FBI locators; 33-entry bibliography locked; stable anchor IDs established (supersedes working draft [`plan/05_timeline_content_plan_v03.txt`](plan/05_timeline_content_plan_v03.txt)).|
|**04**|**Context**|[`plan/02_context_content_plan_v03_final_locked.txt`](plan/02_context_content_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|Sections A & B audited; 32-source bibliography locked; primary FBI 1-based page coordinates verified (Part 01 p. 29); non-deterministic framing enforced.|
|**05**|**Case**|[`plan/03a_case_offense_series_plan_v03_final_locked.txt`](plan/03a_case_offense_series_plan_v03_final_locked.txt), [`plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt`](plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|17 victim homicides audited; strict 4-milestone separation; 1-based FBI Vault coordinates; Edwards escape & Apt 213 search verified; statutory split (pre-1988 murder vs post-1988 intentional homicide, 1987 Wis. Act 399); Wis. Stat. § 971.15 sanity phase trial & sentencing locked.|
|**06**|**Analysis**|[`plan/06a_analysis_psychological_profile_plan_v02.txt`](plan/06a_analysis_psychological_profile_plan_v02.txt), [`plan/06b_analysis_systemic_failures_plan_v02.txt`](plan/06b_analysis_systemic_failures_plan_v02.txt), [`plan/06c_analysis_theories_and_motivations_plan_v02.txt`](plan/06c_analysis_theories_and_motivations_plan_v02.txt)|**[ ] IN PROGRESS**|2026-10-25|Clinical psychiatry, 4 systemic failure themes, theories vs evidence; research dossiers ready for evidentiary audit.|
|**07**|**Impact**|[`plan/07_impact_and_legacy_content_plan_v01.txt`](plan/07_impact_and_legacy_content_plan_v01.txt)|**[ ] PENDING FINAL RECONCILIATION**|2026-10-19|50 scholarly/primary citations drafted; needs global crosswalk verification.|
|**08**|**Sources**|[`plan/08_sources_by_tab.txt`](plan/08_sources_by_tab.txt)|**[ ] PENDING GLOBAL CONSOLIDATION**|2026-10-19|Master repository directory governing `/sources.html`.|

---

## 4. Phase 2 Tracker: HTML Page Implementation (After Phase 1 is Complete)

* [x] **`index.html`** (Homepage editorial front page with expandable Overview preview & 6 Selected Victims cards)
* [x] **`overview.html`** (Comprehensive case overview & factual spine)
* [ ] **`victims.html`** (Interactive Table 1 with filters, 17 profiles, and modal/biographical expanders)
* [ ] **`timeline.html`** (Interactive Table 2 with era navigation, category filters, and cross-linking anchors)
* [ ] **`context.html`** (Historical Milwaukee 1987–1991 and early background)
* [ ] **`case.html`** (Offense series, investigation, and trial)
* [ ] **`analysis.html`** (Systemic failures, psychiatric profile, and research theories)
* [ ] **`impact.html`** (Community impact, media ethics, and master closing conclusion)
* [ ] **`sources.html`** (Comprehensive research directory, methodology, and further reading)

---

## 5. Master Reference Files Directory

* **Master Plan:** [`plan/00_webapp_master_implementation_plan_v04.txt`](plan/00_webapp_master_implementation_plan_v04.txt)
* **Victims Reconciled Concordance:** [`plan/Dahmer_Victims_Master_Citation_Tracker_v10.md`](plan/Dahmer_Victims_Master_Citation_Tracker_v10.md)
* **Victims Master Table 1:** [`plan/table_1_the_victims_v04.md`](plan/table_1_the_victims_v04.md)
* **Victims Final Locked Copy:** [`plan/04_victims_content_plan_v05_final_locked.txt`](plan/04_victims_content_plan_v05_final_locked.txt)
* **Timeline Final Locked Copy:** [`plan/05_timeline_content_plan_v04_final_locked.txt`](plan/05_timeline_content_plan_v04_final_locked.txt) *(superseding working draft [`plan/05_timeline_content_plan_v03.txt`](plan/05_timeline_content_plan_v03.txt))*
* **Context Final Locked Copy:** [`plan/02_context_content_plan_v03_final_locked.txt`](plan/02_context_content_plan_v03_final_locked.txt)
* **Case Offense Series Final Locked Copy:** [`plan/03a_case_offense_series_plan_v03_final_locked.txt`](plan/03a_case_offense_series_plan_v03_final_locked.txt)
* **Case Investigation & Trial Final Locked Copy:** [`plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt`](plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt)
* **Case Authoritative Master Bibliography:** [`plan/08_case_final_bibliography_v01.txt`](plan/08_case_final_bibliography_v01.txt)
* **Impact Final Research Dossier:** [`plan/07_impact_and_legacy_content_plan_v01.txt`](plan/07_impact_and_legacy_content_plan_v01.txt)
* **Central Sources Register:** [`plan/08_sources_by_tab.txt`](plan/08_sources_by_tab.txt)
* **Primary FBI Vault PDFs:** Located in [`assets/docs/`](assets/docs/) (`Dahmer_Part_01.pdf` [68 pp.], `Jeffrey_Lionel_Dahmer_Part_03_of_19.pdf` [60 pp.], `Jeffrey_Lionel_Dahmer_Part_06_of_19.pdf` [74 pp.]).

---

## 6. How to Resume Work in Antigravity (AGY CLI)

When starting a new session:

1. Open this `README.md` file to check the current `[ ] IN PROGRESS` tab under **Section 3**.
2. Read the active tab's content plan in `plan/` (e.g., [`plan/03a_case_offense_series_plan_v02.txt`](plan/03a_case_offense_series_plan_v02.txt)).
3. Verify claims against primary documents in `plan/` and `assets/docs/`.
4. Insert citations, synchronize facts with previously locked tabs, and produce the `_final_locked.txt` copy.
5. Update the checkbox in this `README.md` and move to the next tab in sequence.

---

## 7. Working From More Than One Machine

This repository is edited from both a desktop and a laptop. Git does not push work from one machine to the other: a push updates GitHub, and each machine must fetch before it sees the new commits.

**Rule of thumb: pull before you type, push before you switch machines.**

### Quick sync (recommended)

Run from the repository root after any editing session:

```powershell
.\sync.ps1 "what you changed"
```

The script stages everything, commits, fetches, rebases onto `origin/main`, and pushes. If both machines edited the same lines it stops at the conflict, explains how to resolve or abort, and pushes nothing.

Options:

* `.\sync.ps1` — commits with a generated message: `sync <machine> <timestamp>`.
* `.\sync.ps1 -NoPush "work in progress"` — commit locally only, no network.

### Manual equivalent

```powershell
# finishing on one machine
git add -A
git commit -m "what you changed"
git push

# starting on the other machine
git pull --ff-only
```

`pull.ff` is configured as `only`, so a pull that would require a merge stops instead of quietly producing a merge commit.

### Line endings

[`.gitattributes`](.gitattributes) normalizes every text file to LF in both the repository and the working tree, and marks PDFs and images as binary. This repository's local config sets `core.autocrlf` to `false` so the Git for Windows system default cannot override the attributes file.

### If a pull is rejected because of uncommitted work

```powershell
git stash -u
git pull --ff-only
git stash pop
```

### First-time setup on a new machine

```powershell
git clone https://github.com/night-joe/dahmer-archive.git
```
