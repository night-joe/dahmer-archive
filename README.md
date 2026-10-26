# The Jeffrey Dahmer Case Archive — Webapp Research & Development Guide

**Last Updated:** 2026-10-26  
**Current Phase:** Phase 1 — Content & Citation Verification (Tab-by-Tab) — **ALL TABS COMPLETE**; Phase 2 (HTML implementation) may begin.

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

### Strategic Phasing:

* **Phase 1 - Content & Citation Verification (Master Plan Phase B):** Reconcile primary records (FBI Vault, dockets, contemporary reports), map 1-based page coordinates, resolve historical discrepancies, and lock all tab plans. **COMPLETE** — all eight tabs locked.
* **Phase C - Design & Citation Specification (Master Plan Phase C):** Lock typography, color, spacing, card hierarchy, routes, mobile behavior, citation mechanics and image treatment before any build work. **COMPLETE** — see [`plan/09_phase_c_design_and_citation_spec_v01_final_locked.txt`](plan/09_phase_c_design_and_citation_spec_v01_final_locked.txt).
* **Phase 2 - HTML Page Implementation (Master Plan Phase D):** Construct semantic, accessible, responsive pages with cross-linking anchor IDs once content and citations are locked. **AUTHORIZED** — begins with `sources.html`.

### Why this strategy:

1. **Evidentiary Consistency:** Dates, birth years, and institutional milestones are synchronized across all tabs before committing to HTML.
2. **Anchor Stability:** Cross-linking anchor IDs (e.g., `#era-1991`, `#event-sinthasomphone-1991`, `#steven-hicks`) are defined and stable across the entire site.
3. **Rapid HTML Production:** Building HTML becomes purely focused on semantics, accessibility, typography, responsive styling, and UI interactions without pausing to chase citation locators.

---

## 3. Phase 1 Tracker: Content & Citation Verification (Tab by Tab)

|#|Tab / Section|Target Working File(s)|Citations & Content Status|Last Updated|Notes / Key Milestones|
|:-:|-|-|:-:|:-:|-|
|**01**|**Overview**|[`plan/01_overview_content_plan_v03_final_locked.txt`](plan/01_overview_content_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-26|Claim-level citations inserted (v02 had deferred them); 41-entry register `[1]`–`[41]`; 65 cited claims (54 `/overview` + 11 homepage); verified verbatim FBI teletype anchor for the Edwards escape (Part 01 p. 4); 17/16/11 numeric separation enforced; 5 evaluative sentences flagged for Phase 2 rewrite; crosswalk reconciles all parent-tab numbering schemes (supersedes working reference [`plan/01_overview_content_plan_v02.txt`](plan/01_overview_content_plan_v02.txt)); prototype [`overview.html`](overview.html) live.|
|**02**|**Victims**|[`plan/04_victims_content_plan_v05_final_locked.txt`](plan/04_victims_content_plan_v05_final_locked.txt), [`plan/table_1_the_victims_v04.md`](plan/table_1_the_victims_v04.md), [`plan/08_victims_final_bibliography_v02.txt`](plan/08_victims_final_bibliography_v02.txt)|**COMPLETED & LOCKED**|2026-10-26|100% primary DOB coverage; dagger (`†`) retired; 27-entry bibliography locked and **register regenerated** against the v05 lock (v1.0 held only 17 entries tied to the superseded v03 working copy); 17 profiles fact-checked; verified in [`plan/Dahmer_Victims_Master_Citation_Tracker_v10.md`](plan/Dahmer_Victims_Master_Citation_Tracker_v10.md).|
|**03**|**Timeline**|[`plan/05_timeline_content_plan_v04_final_locked.txt`](plan/05_timeline_content_plan_v04_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|Table 2 verified; 44 milestones cited with 1-based FBI locators; 33-entry bibliography locked; stable anchor IDs established (supersedes working draft [`plan/05_timeline_content_plan_v03.txt`](plan/05_timeline_content_plan_v03.txt)).|
|**04**|**Context**|[`plan/02_context_content_plan_v03_final_locked.txt`](plan/02_context_content_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|Sections A & B audited; 32-source bibliography locked; primary FBI 1-based page coordinates verified (Part 01 p. 29); non-deterministic framing enforced.|
|**05**|**Case**|[`plan/03a_case_offense_series_plan_v03_final_locked.txt`](plan/03a_case_offense_series_plan_v03_final_locked.txt), [`plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt`](plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|17 victim homicides audited; strict 4-milestone separation; 1-based FBI Vault coordinates; Edwards escape & Apt 213 search verified; statutory split (pre-1988 murder vs post-1988 intentional homicide, 1987 Wis. Act 399); Wis. Stat. § 971.15 sanity phase trial & sentencing locked.|
|**06**|**Analysis**|[`plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt`](plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt), [`plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt`](plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt), [`plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt`](plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt)|**COMPLETED & LOCKED**|2026-10-25|Tripartite specification locked; 7 trial psychiatric expert dossiers verified; clinical disorder vs Wis. Stat. § 971.15 legal sanity divide enforced; May 27 Konerak incident & officer discipline/reinstatement (Parins 1994) audited; Sinthasomphone civil litigation ($850k settlement) verified; probation supervision (Chester, DOC 328.04 waivers, Weinberger 7th Cir.) reconciled; 7 motivational theories structured across 3 certainty tiers; 36-entry master bibliography locked in [`plan/08_analysis_final_bibliography_v01.txt`](plan/08_analysis_final_bibliography_v01.txt); audited in [`plan/analysis_evidentiary_audit.md`](plan/analysis_evidentiary_audit.md).|
|**07**|**Impact**|[`plan/07_impact_and_legacy_content_plan_v02_final_locked.txt`](plan/07_impact_and_legacy_content_plan_v02_final_locked.txt), [`plan/08_impact_final_bibliography_v01.txt`](plan/08_impact_final_bibliography_v01.txt)|**COMPLETED & LOCKED**|2026-10-25|All 6 mandated sections + Introduction & Master Research Conclusion locked; 184 registered anchors (100% bidirectional cross-tab resolution in [`tests/test_tab7_anchors.js`](tests/test_tab7_anchors.js)); 52-source tiered master bibliography locked in [`plan/08_impact_final_bibliography_v01.txt`](plan/08_impact_final_bibliography_v01.txt); comprehensive evidentiary audit in [`plan/impact_evidentiary_audit.md`](plan/impact_evidentiary_audit.md); factually reconciled Judge Parins 1994 statutory reinstatement order, Marquette Campus Circle Project Oxford demolition, Sinthasomphone $850k civil settlement without admitted liability, Zilber $407k murderabilia auction buyout/incineration, Christopher Scarver 1994 CCI homicide proceedings (Columbia County Case No. 94-CF-208), historical witness disambiguation (Childress/Smith/Cleveland/Bass), and Dual-Failure Thesis closed.|
|**08**|**Sources**|[`plan/08_sources_by_tab.txt`](plan/08_sources_by_tab.txt)|**COMPLETED & LOCKED**|2026-10-26|v3.0 lock-synchronized master register; all seven tab registers reconciled (41 / 27 / 33 / 32 / 65 / 36 / 52 entries respectively); per-tab authoritative-register pointers added; stale v01 impact references corrected (50 → 52 sources); superseded "Section 8" reference replaced; 305 UTF-8 mojibake sequences repaired; governs `/sources.html` implementation in Phase 2.|

---

## 4. Phase 2 Tracker: HTML Page Implementation (Phase D — AUTHORIZED)

Build order per Phase C Part 10.3. Status distinguishes "prototype exists" from
"compliant with the locked content".

* [~] **`index.html`** (Homepage editorial front page) — prototype exists, **needs rework**: 0 citations against a 9-row factual milestone table and the homepage feature
* [~] **`overview.html`** (Comprehensive case overview) — prototype exists, **needs rework**: 22 footnotes vs the 41-entry register, 3 uncited superlatives (L174, L177, L205), and 16 duplicate DOM ids
* [ ] **`sources.html`** (Research directory, methodology) — **next build step**: build-time generator, canonical permalink layer, two views
* [ ] **`victims.html`** (Table 1, 17 profiles, detail panels) — clear to build
* [ ] **`timeline.html`** (Table 2, era navigation, cross-linking anchors) — clear to build
* [ ] **`context.html`** (Historical Milwaukee 1987-1991 and early background) — clear to build
* [ ] **`case.html`** (Offense series, investigation, trial) — must emit `#offense-series` wrapper (repairs 4 dangling inbound links)
* [ ] **`analysis.html`** (Systemic failures, psychiatric profile, theories) — canonical anchors are `#topics-*`
* [ ] **`impact.html`** (Community impact, media ethics, master conclusion) — 184 anchors; build last

**Known site state at Phase C sign-off:** 2 of 9 pages exist; 7 nav targets currently 404. All 286 local register entries remain numbered as locked — the citation architecture adds permalinks, it does not renumber.

---

## 5. Master Reference Files Directory

* **Master Plan:** [`plan/00_webapp_master_implementation_plan_v04.txt`](plan/00_webapp_master_implementation_plan_v04.txt)
* **Phase C Design & Citation Spec (Final Locked):** [`plan/09_phase_c_design_and_citation_spec_v01_final_locked.txt`](plan/09_phase_c_design_and_citation_spec_v01_final_locked.txt) — typography, color, spacing, card hierarchy, two-tier route model, mobile behavior, citation permalink architecture, image policy, discrepancy register, build order
* **Overview Final Locked Copy:** [`plan/01_overview_content_plan_v03_final_locked.txt`](plan/01_overview_content_plan_v03_final_locked.txt) *(superseding working reference [`plan/01_overview_content_plan_v02.txt`](plan/01_overview_content_plan_v02.txt))*
* **Overview Register:** 41 entries `[1]`–`[41]` inside the locked Overview plan, with a parent-tab crosswalk
* **Victims Reconciled Concordance:** [`plan/Dahmer_Victims_Master_Citation_Tracker_v10.md`](plan/Dahmer_Victims_Master_Citation_Tracker_v10.md)
* **Victims Master Table 1:** [`plan/table_1_the_victims_v04.md`](plan/table_1_the_victims_v04.md)
* **Victims Final Locked Copy:** [`plan/04_victims_content_plan_v05_final_locked.txt`](plan/04_victims_content_plan_v05_final_locked.txt)
* **Victims Authoritative Bibliography:** [`plan/08_victims_final_bibliography_v02.txt`](plan/08_victims_final_bibliography_v02.txt) *(27 entries, reconciled to v05; supersedes [`v01`](plan/08_victims_final_bibliography_v01.txt), which described the retired v03 working copy)*
* **Timeline Final Locked Copy:** [`plan/05_timeline_content_plan_v04_final_locked.txt`](plan/05_timeline_content_plan_v04_final_locked.txt) *(superseding working draft [`plan/05_timeline_content_plan_v03.txt`](plan/05_timeline_content_plan_v03.txt))*
* **Context Final Locked Copy:** [`plan/02_context_content_plan_v03_final_locked.txt`](plan/02_context_content_plan_v03_final_locked.txt)
* **Case Offense Series Final Locked Copy:** [`plan/03a_case_offense_series_plan_v03_final_locked.txt`](plan/03a_case_offense_series_plan_v03_final_locked.txt)
* **Case Investigation & Trial Final Locked Copy:** [`plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt`](plan/03b_case_investigation_and_trial_plan_v03_final_locked.txt)
* **Case Authoritative Master Bibliography:** [`plan/08_case_final_bibliography_v01.txt`](plan/08_case_final_bibliography_v01.txt)
* **Analysis Psychological Profile Final Locked Copy:** [`plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt`](plan/06a_analysis_psychological_profile_plan_v03_final_locked.txt)
* **Analysis Systemic Failures Final Locked Copy:** [`plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt`](plan/06b_analysis_systemic_failures_plan_v03_final_locked.txt)
* **Analysis Theories & Motivations Final Locked Copy:** [`plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt`](plan/06c_analysis_theories_and_motivations_plan_v03_final_locked.txt)
* **Analysis Master Bibliography:** [`plan/08_analysis_final_bibliography_v01.txt`](plan/08_analysis_final_bibliography_v01.txt)
* **Analysis Evidentiary Audit Report:** [`plan/analysis_evidentiary_audit.md`](plan/analysis_evidentiary_audit.md)
* **Impact & Legacy Final Locked Copy:** [`plan/07_impact_and_legacy_content_plan_v02_final_locked.txt`](plan/07_impact_and_legacy_content_plan_v02_final_locked.txt) *(superseding working draft [`plan/07_impact_and_legacy_content_plan_v01.txt`](plan/07_impact_and_legacy_content_plan_v01.txt))*
* **Impact Authoritative Master Bibliography:** [`plan/08_impact_final_bibliography_v01.txt`](plan/08_impact_final_bibliography_v01.txt)
* **Impact Evidentiary Audit Report:** [`plan/impact_evidentiary_audit.md`](plan/impact_evidentiary_audit.md)
* **Impact Link & Coordinate Test Suite:** [`tests/test_tab7_anchors.js`](tests/test_tab7_anchors.js)
* **Central Sources Register:** [`plan/08_sources_by_tab.txt`](plan/08_sources_by_tab.txt) — v3.0, lock-synchronized across all seven tabs
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

### Git-free pull fallback (`pull.ps1`)

If working on a machine where Git CLI is not installed (or in restricted environments), run:

```powershell
.\pull.ps1
```

This queries the GitHub API directly for the latest commit on `main`, checks whether the local workspace is already up to date, and downloads/extracts any updated files directly into the workspace without needing Git. Use `.\pull.ps1 -Force` to force-sync all files.

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
