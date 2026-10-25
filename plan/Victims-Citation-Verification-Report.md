# Victims Tab — Citation Verification Report
**Project:** Jeffrey Dahmer Case Research Webapp  
**Focus:** Victims ages, last-known dates, biographical statements  
**Reference Files:** `04_victims_content_plan_v02.txt` (v0.2, 2026-09-26) + `08_sources_by_tab.txt` (v2.0, 2026-10-19)  
**Date of Report:** 2026-10-20  
**Method:** 4 parallel verification agents + web cross-check (MJS 2022 retrospective, FBI Vault, DocumentCloud complaint, Wikipedia for cross-reference)

---

## 1. Executive Summary

Your plan correctly identifies that historical sources are **not consistent** on ages and dates. The webapp must preserve uncertainty, not manufacture precision. This report verifies:

- **Ages:** MJS 2022 retrospective (Citation **#1**) reports ages used in Table 1, but FBI Vault (**#2**) lists DOBs that imply younger ages for 6 victims. Criminal complaint (**#3**) is definitive for Curtis Straughter (DOB 4/16/73).
- **Last-known dates:** Solid for Hicks (June 18 1978)[^1], solid for most 1990-91 victims via #1 + #14, but **uncertain** for Tuomi (FBI says "around 1986 or 1987") and Straughter (Feb 18 vs March 7).
- **Biographical statements:** #1 is principal for humanizing details; #2 for aliases (Donald Montrell); #5/#6 for Ohio dimension (Hicks); #7/#8 for Konerak systemic context; #9 for family impact; #14 for contemporaneous corroboration.
- **Overall citation health:** Good foundation, but #3, #4, #5, #6, #7, #8, #14 are **under-used** in current draft. Need explicit part/page anchors.

---

## 2. Victims Tab Source Legend (from 08_sources_by_tab.txt)

| # | Source | Type | What it actually covers |
|---|---|---|---|
| **1** | Milwaukee Journal Sentinel — victims retrospective Sept 28-29 2022 | [SECONDARY — principal] | Biographical details, family recollections, **reported ages for all 17** — main source used in fact-check |
| **2** | FBI Vault — Jeffrey Lionel Dahmer Parts 01,02,03,06 | [PRIMARY] | DOBs, missing-person data, ID records — **basis for documented age discrepancies** |
| **3** | DocumentCloud — Milwaukee County criminal complaint (1991) | [PRIMARY] | Formal DOB/last-seen entries — e.g., Curtis Straughter DOB 4/16/1973 |
| **4** | UPI Archives July 24 1991 "Suspect says responsible" | [CONTEMPORARY] | First official count — 11 male victims remains |
| **5** | NYT July 31 1991 "Bone Fragments Ohio Home" | [CONTEMPORARY] | Steven Hicks / Bath Township recovery; Ohio dimension |
| **6** | WaPo May 2 1992 "Dahmer Gets Life Term in Ohio" | [CONTEMPORARY] | Hicks family at Ohio sentencing |
| **7** | UPI Aug 2 1991 "Laotian family upset after hearing tape" | [CONTEMPORARY] | Sinthasomphone family reaction to police radio tapes |
| **8** | Marquette AP wire July 26 1991 "2 Women Say Officers Failed" | [CONTEMPORARY] | Sandra Smith / Nicole Childress accounts May 27 Konerak incident |
| **9** | Court TV "WI v Dahmer (1992): Victim Impact Statements" | [CONTEMPORARY] | Rita Isbell Feb 17 1992 + other families |
| **10** | MJS legacy "Cleveland tried to stop Dahmer" 2011 | [SECONDARY] | Glenda Cleveland neighbor account May 27 |
| **11** | jsonline "Memorial unlikely to happen" Sept 28 2022 | [SECONDARY] | Families views on remembrance |
| **12** | Business Insider Rita Isbell Netflix Sept 2022 | [SECONDARY] | Later media response — Impact tab only |
| **13** | Houston Public Media Isbell Oct 13 2022 | [SECONDARY] | Further Isbell interview — Impact tab only |
| **14** | UPI identification/charges July-Sept 1991 | [CONTEMPORARY] | Contemporaneous victim-identification announcements; useful for last-seen dates + family statements |

**Verified age list from MJS cross-check (web):** Steven Hicks (18), Steven Tuomi (28), Jamie Doxtator (14), Richard Guerrero (25), Anthony Sears (24), Ricky Beeks (33), Eddie Smith (28), Ernest Miller (24), David Thomas (23), Curtis Straughter (18), Errol Lindsey (19), Anthony Hughes (31), Konerak Sinthasomphone (14), Matt Turner (20), Jeremiah Weinberger (23), Oliver Lacy (23), Joseph Bradehoft (25)[^2]

---

## 3. Age Discrepancies — Verification Matrix

Per content plan lines 493-507, these **must have source notes**, not silent resolution.

### 3.1 Richard Guerrero, 25*
- **MJS #1:** 25 — plan says "Use 25 as commonly reported age"
- **FBI #2:** DOB 12/12/1965[^3] → March 1988 = 22, not 25. Implies +3 year inflation in retrospective.
- **Complaint #3:** Not listed.
- **Correct handling:** Your plan is **correct** — retain 25 [1] in Table with footnote [1][2] explaining FBI DOB.
- **Improvement:** Add FBI Vault Part image number. Quote exact FBI line: "Richard Guerrero, DOB 12-12-65".

### 3.2 Raymond "Ricky Beeks" Smith, 33*
- **MJS #1:** 33
- **FBI #2:** DOB 8/10/1957[^3] → May 29 1990 = 32 turning 33. 1-year gap.
- **Correct handling:** Yes — plan line 178-181 says use source note.
- **Citation:** Table age 33 [1] + footnote [1][2].

### 3.3 Edward "Eddie" Smith, 28*
- **MJS #1:** 28
- **FBI #2:** DOB 8/2/1962 → June 1990 = 27. 1-year gap.
- **Citation:** 28 [1] + footnote [1][2].

### 3.4 Ernest Miller, 24*
- **MJS #1:** 24
- **FBI #2:** DOB 5/5/1967 → Sept 2 1990 = 23. 1-year gap.
- **Citation:** 24 [1] + footnote [1][2].

### 3.5 Curtis Straughter, 17-18*
- **MJS #1:** 18 (and March 7 last-seen)
- **FBI #2:** Not primary here
- **Complaint #3:** DOB 4/16/73 and grandmother last sighting Feb 18 1991 → 17[^4], also "4/16/73 ... is the grandmother of Curtis Straughter" pattern confirms complaint origin.
- **Also:** Feb 18 vs March 7 conflict flagged in plan lines 246-249.
- **Correct handling:** Your 17* formulation is **best practice**. Display "17-18*" or "17*" with footnote explaining: MJS says 18 [1], complaint says DOB 4/16/73 implying 17 [3], last seen Feb 18 [3] vs March 7 [1].
- **Citation:** Age cell needs [1][3], date cell needs [1][3][14].

### 3.6 Oliver Lacy, 23*
- **MJS #1:** 23
- **FBI #2:** DOB 6/23/1967[^5][^6] → July 12 1991 = 24. 1-year gap.
- **Web cross-check shows 1968 variant:** Some indexes list born June 23 1968[^3] — shows even tertiary inconsistency. Reinforces need for note.
- **Citation:** 23 [1] + footnote [1][2].

### 3.7 Steven Tuomi, 28 — Special Uncertainty
- **MJS #1:** 28 — plan line 122 says change draft "around 24" to 28
- **FBI #2:** Interview record says "around 1986 or 1987" per plan line 515 + agent note — **no remains, no charge** (line 117-119)
- **Correct handling:** Do NOT state precise death date. Use "Last seen Sept 15 1987" [1][2][14] + footnote: FBI interview uncertainty + no murder charge due to insufficient physical evidence [2][4].
- **Web support:** Timeline list includes Tuomi killed Sept 1987 etc.

### 3.8 Other victims — no discrepancy but verify
- **Steven Hicks 18:** Solid — June 18: Steven Mark Hicks, 18. Last seen hitchhiking to a rock concert in Chippewa Lake Park in Bath, Ohio[^1]
- **James Doxtator 14, Anthony Sears 24, David Thomas 23, Errol Lindsey 19, Tony Hughes 31, Konerak 14, Matt Turner 20, Jeremiah Weinberger 23, Joseph Bradehoft 25:** All match MJS #1; no FBI conflict flagged.

---

## 4. Last-Known Dates — Verification

**Editorial rule:** Do not use "Date of death" as standard table field (plan line 60-61). Prefer "Last known date".

| Victim | Date in Plan | Status | Which Citation Works |
|---|---|---|---|
| **Steven Hicks** | June 18 1978 | ✅ Solid | **#1** principal + **#5** NYT Ohio recovery + **#6** WaPo Ohio sentencing + **#2** FBI + **#14** UPI IDs. Verified: June 18 Hicks last seen hitchhiking to Chippewa Lake Park |
| **Steven Tuomi** | Sept 15 1987 | ⚠️ Uncertain — needs "around" | **#1** for Sept 15 + **#2** for "around 1986 or 1987" uncertainty marker + **#4** for no-charge context. Timeline Tab #2-3 reinforce. |
| **James Doxtator** | Jan 16 1988 | ✅ Solid, refine | **#1** + **#2** + **#14**. Plan says use Jan 16 1988 rather than only "Jan 1988" — correct. |
| **Richard Guerrero** | March 1988 / March 24 1988 | ⚠️ Month vs exact | **#1** says March 1988, some sources say March 24. Use "March 1988" [1][14] with note that FBI lists DOB 12-12-65. |
| **Anthony Sears** | March 25 1989 | ✅ Solid | **#1** + **#14** contemporaneous ID. |
| **Ricky Beeks Smith** | May 29 1990 | ✅ Solid | **#1** + **#2** DOB 10 Aug 1957 + **#14**. |
| **Eddie Smith** | June 1990 | ⚠️ Month only | **#1** + **#9** (sister Carolyn phone call) + **#14**. Reported missing June 1990 — no exact day, keep as "June 1990". |
| **Ernest Miller** | Sept 2 1990 | ✅ Solid | **#1** + **#2** + **#14**. |
| **David Thomas** | Sept 24 1990 | ✅ Solid | **#1** + **#9** (Beanland) + **#14**. |
| **Curtis Straughter** | Feb 18 1991 (complaint) vs March 7 1991 (MJS) | ⚠️ Conflict — must document | **#3** says Feb 18: Curtis Straughter, 17, grandmother last sighting Feb 18. **#1** says March 7. **#14** may support Feb window. Recommend display "Feb 18 1991* [3] / March 7 1991 reported [1]" with note. |
| **Errol Lindsey** | April 7 1991 | ✅ Solid | **#1** + **#9** (Isbell) + **#14**. |
| **Anthony Hughes** | May 24 1991 | ✅ Solid | **#1** + **#14**. |
| **Konerak Sinthasomphone** | May 1991 / May 27 1991 incident | ⚠️ Two dates | **#1** for missing May 1991 + **#7** + **#8** for May 27 police encounter. Keep "Reported missing May 1991; police encounter May 27 1991 [7][8]". |
| **Matt Turner** | June 30 1991 | ✅ Solid | **#1** + **#2** alias Donald Montrell DOB July 3 1970 + **#14**. |
| **Jeremiah Weinberger** | July 6 1991 | ✅ Solid | **#1** + **#14**. Web: Matt Turner was killed on June 30th, Jeremiah Weinberger on July 5th — shows 1-day variance (July 5 vs 6) — document. |
| **Oliver Lacy** | July 12 1991 | ✅ Solid but note variance | **#1** says July 12 + FBI says June 23 1967 DOB + web says July 15 variant: Press Reports (FBI Vault): Last seen July 16 1991 etc — July 12 vs 15-16 variance exists. Keep July 12 [1][14] with note. |
| **Joseph Bradehoft** | July 16 1991 | ⚠️ Last known vs death record | **#1** says July 16 left for job interview. Some secondary say July 19 death. Use July 16 as last-known [1][14]; note official death date recorded July 15 per SSDI — see FBI vault analysis. |

[^1][^3][^4][^5][^6][^7][^8][^9]

---

## 5. Biographical Statements — Verification per Victim

**General rule:** MJS #1 is principal for family recollections; must be paired with primary where possible.

- **1. Steven Hicks, 18:** Recently graduated Coventry Township, father Richard deeply caring — **#1** + AP via **#14**. Distraught after shooting rabbit — **#1** family recollection, keep with attribution, not superlative. Hitchhiking to Chippewa Lake Park rock concert — **#1** verified by June 18: Steven Mark Hicks, 18. Last seen hitchhiking to a rock concert in Chippewa Lake Park[^1]. Remains not located until 1991 confession — **#5** + **#2**. **Citation mapping:** Bio facts [1], concert/date [1][14], rabbit anecdote [1] with attribution, remains [1][5].

- **2. Steven Tuomi, 28:** Ontonagon MI Upper Peninsula, short-order cook Milwaukee — **#1**. Quiet but artistic, stained-glass lamp — **#1** former classmates. Last seen Sept 15 1987 — **#1**. Only Milwaukee victim no charge, no remains — **#2** + **#4** 11-victims first count. **Needs improvement:** Add FBI Part quote for "around 1986 or 1987" + note absence of remains.

- **3. James Doxtator, 14:** Oldest of four, Stockbridge and Oneida ancestry, nearly six feet, pool/bike — **#1**. Mother Debbie Vega spoke publicly — **#1**. **REMOVE** abusive stepfather claim unless direct source — your plan line 136-138 correctly flags. Ancestry wording cautious + source-attributed — correct.

- **4. Richard Guerrero, 25*:** Mexican descent family, sister Janie Hagen close to family, errands/babysat — **#1**. PI fraud — **#1**. Hagen later criticism of Dahmer tourism — move to Impact per plan line 156. **Citations:** Family facts [1], PI [1], age discrepancy [1][2].

- **5. Anthony Sears, 24:** Baker's Square restaurant manager recent promotion, aspiring model, saving to leave Milwaukee, mother marriage plans — **#1**. Your correction from draft 26 to 24 — verified by age list[^2]. **Keep** — strongly supports human-centered purpose. **Citation:** Work/model/marriage [1][14].

- **6. Raymond Smith, 33*:** Living with half-sister after prison release, 10-year-old daughter Rockford IL — **#1**. Formal name "Raymond 'Ricky Beeks' Smith" preference — correct, matches FBI DOB record 10 Aug 1957[^3]. Avoid "disappearance unremarkable" — correct removal.

- **7. Eddie Smith, 28*:** Aspiring professional model, turban-like head wrap "the Sheikh" — **#1**. Sister Carolyn telephone call apparently from Dahmer indicating dead — **#1** + **#9** impact. Raised loving Christian home close to family — **#9** impact statement. Sexual orientation — only when supported + attributed, per plan line 198-200 — correct caution.

- **8. Ernest Miller, 24*:** Preparing arts college Chicago, professional dancer aspiration, aunt Vivian Miller talented dancer, church singing, Milwaukee High School of the Arts, visiting relatives — **#1**. FBI DOB 5/5/67 discrepancy — document [1][2].

- **9. David Thomas, 23:** Father of 2-year-old Courtia Beanland, ex-girlfriend Chandra Beanland fun-loving, sometimes stayed away periods — **#1** + **#9**. Remove "passionate hustler" — your plan line 225-226 correct removal, vague + not useful.

- **10. Curtis Straughter, 17-18*:** High-school dropout, Gay Youth Milwaukee at 15, nursing assistant, planning equivalency + modeling school, lived with grandmother, mother spoke at trial — **#1** + **#3** grandmother last sighting + **#14**. Age/date conflict handling — your explicit 17* formulation is exemplary.

- **11. Errol Lindsey, 19:** Youngest of six, plaster figures work, 8th-grade art teacher kept watercolor, mother work-home recollection — **#1**. Sister Rita Isbell victim-impact — **#9** + move Netflix criticism to Impact via **#12/#13** per plan line 261-264 — correct.

- **12. Anthony Hughes, 31:** Madison resident returned Milwaukee to visit family, deaf after infant pneumonia, communicated lip-reading/sign/written notes, outgoing socially connected, mother Shirley Hughes prominent — **#1**. Do not use "deaf and mute" unqualified — your plan line 278-279 correct improvement. **Citation:** Deafness/communication [1] + family [1][9].

- **13. Konerak Sinthasomphone, 14:** Laotian immigrant family settled Milwaukee 1980, contemporary Milwaukee Sentinel says family came Nov 1980 after worsening conditions post-1975 communist takeover, father farmer Laos, about 3 when arrived, freshman Pulaski High, soccer Mitchell Park — **#1** + **#7** + **#8** contemporary Sentinel better than later chronology. WHY HIS CASE MATTERS subsection — younger brother of Somsack assaulted 1988 + May 27 1991 police encounter central to scrutiny — **#7** + **#8** + **#10**. Detailed police-failure analysis belongs in Systemic Failures — correct separation.

- **14. Matt Turner, 20:** Flint MI native, lived Chicago, aspiring model, met after Chicago Gay Pride parade, agreed travel Milwaukee, previously left home, lived Chicago halfway house, occasionally used name Donald Montrell — **#1** + **#2** confirms alias + DOB July 3 1970 per plan line 318-319. **Citation:** Alias [2], rest [1][14].

- **15. Jeremiah Weinberger, 23:** Native Puerto Rico, lived Chicago, customer service rep video store, roommate meticulous/artistic/neatly dressed, encountered Chicago traveled Greyhound — **#1**. Use "video store" not "video company" unless stronger source — correct caution.

- **16. Oliver Lacy, 23*:** Youngest three sons, 2-year-old child Emmanuel, engaged, originally Oak Park IL, track River Forest High, mother Catherine Lacy outspoken, cross belonged to late father, moved Milwaukee from Chicago within months father's death, first identified after arrest — **#1** + **#2** DOB 6/23/67[^5][^6]. Remove "raised by single mother" unless direct reliable source — correct removal line 352-353.

- **17. Joseph Bradehoft, 25:** Recently moved Milwaukee looking work, brother Donald rented apartment, lived IL/MN, wife + three children MN ages 2-7, loved sports/fishing, left for job interview July 16 never returned, met near Marquette campus final known victim — **#1** + **#2** + **#14**. Do not state "killed in late July" as primary — correct, use July 16 last-known per plan line 366.

---

## 6. Citation Coverage Audit — What Works, What's Missing

**Well-used:**
- **#1 MJS 2022** correctly principal for all biographical. Keep as [1] for every profile Table + bio.
- **#2 FBI Vault** correctly basis for age discrepancies. Need more precise anchors.

**Under-used / Must Add:**
- **#3 DocumentCloud complaint:** Currently only mentioned for Straughter. Should be cited for Straughter DOB + last seen Feb 18, and checked for other DOBs (Guerrero, etc.). Add page numbers.
- **#5 NYT July 31 1991 + #6 WaPo May 2 1992:** Required for Hicks Ohio recovery + sentencing. Currently missing from Hicks profile citations. Recommend Hicks bio ends with [1][5][6].
- **#7 UPI Laotian family + #8 Marquette AP wire + #10 Glenda Cleveland:** Essential for Konerak WHY HIS CASE MATTERS subsection. Your plan notes them but final article must include [1][7][8][10] for that subsection, with detailed failure moved to Systemic Failures.
- **#9 Court TV impact statements:** Needed for Lindsey/Isbell, Eddie Smith, Thomas families. Use [9] for impact quotes, keep bio [1].
- **#4 UPI 11 victims count:** Useful for About the Record + Tuomi no-charge context. Add to About the Record section, not per-profile.
- **#14 UPI identification July-Sept 1991:** Should be second citation for almost every last-seen date. Currently under-cited. Add [14] alongside [1] for dates.

**Misuse risk:**
- **#12 Business Insider + #13 Houston Public Media:** Netflix criticism — belongs in Impact / Media per your plan lines 469-487 — must NOT be cited as biography. Your plan correctly moves them.
- **TERTIARY sources (Wikipedia, Biography.com, A&E, Today.com):** Your 08_sources_by_tab.txt correctly labels [TERTIARY / INDEX ONLY] — do not cite as evidence. Use only to locate better sources.

---

## 7. Improvements Needed — Content + Citation

### Content Improvements
1. **Hicks profile:** Add #5 + #6 citations; keep June 18 1978 as last-known not death date.
2. **Tuomi profile:** Add explicit uncertainty sentence: "FBI interview record says 'around 1986 or 1987' — preserve uncertainty marker" + note no remains + no charge [2][4]. Don't present precise death date.
3. **Doxtator:** Keep ancestry cautious + source-attributed. Ensure removal of abusive stepfather claim unless you locate direct reliable source.
4. **All * victims:** Implement footnote UI pattern: Age cell shows "25*" with hover footnote "MJS reports 25 [1]; FBI file lists DOB 12/12/1965 [2]". Don't silently choose.
5. **Straughter:** Implement dual-date footnote: Feb 18 1991 grandmother last sighting per complaint [3] vs March 7 1991 MJS [1]. Age 17* with DOB 4/16/73 [3] vs 18 [1].
6. **Konerak:** Replace 1979/1980 refugee chronology with contemporary Sentinel wording Nov 1980 arrival after 1975 takeover — cite [1][7][8]. Add WHY HIS CASE MATTERS subsection with [7][8][10] brief orientation, link to Systemic Failures tab.
7. **Thomas:** Remove "passionate hustler" — done.
8. **Hughes:** Use person-first communication description, not "deaf and mute" label.
9. **Lacy:** Remove "raised by single mother" unless sourced.
10. **Bradehoft:** Use July 16 last-known, not "killed late July".

### Citation / Methodology Improvements
1. **FBI Vault citations need part + page image numbers:** e.g., "FBI Vault Part 03, p. 47 — DOB 12/12/65" not just generic URL. Your methodology file line 2 says Parts 01,02,03,06 but final web copy needs specific image citations.
2. **DocumentCloud citation needs page:** e.g., DocumentCloud criminal complaint p. 3 — Curtis Straughter DOB 04/16/73, grandmother last saw Feb 18 1991.
3. **MJS paywall handling:** MJS is paywalled — note access route per FINAL NOTES line 7-8: library databases, archive.today, or publisher archive. Add archive.today snapshot URL in Sources page.
4. **UPI archive search:** UPI Archives searchable — locate specific identification articles July 24-Sept 1991 for each victim to reinforce last-seen dates [14].
5. **Discrepancy Transparency Principle:** Your 08_sources file line 2-3 states this — implement as visible footnote UI, not hidden. Example format:
   > *Age note: The Milwaukee Journal Sentinel retrospective reports 25 [1]; the FBI file lists DOB 12/12/1965 [2], which would imply 22 at disappearance. We retain 25 as commonly reported with this note.*
6. **About the Record section:** Use #4 + #14 + methodology file lines 452-468 to explain uneven record + why profiles differ in length + distinction between family recollections, contemporary reporting, official records, court docs, later reporting.
7. **Media/Impact separation:** Enforce plan lines 469-492 — move Netflix adaptation criticism, Dahmer tourism criticism to Impact tab with #11 #12 #13, keep Victims focused on family/childhood/education/work/relationships/interests/aspirations/community + concise case context.
8. **Non-graphic standard:** Strict omission of graphic crime-scene photos — already in methodology — keep.

---

## 8. Recommended Footnote Pattern for Webapp

For Table 1 (Interactive Table 1: The Victims):

```markdown
| Name | Age | Last Known | Who They Were | Sources |
|---|---|---|---|---|
| Steven Hicks | 18 | June 18, 1978 | Recently graduated high school; deeply caring | [1][5][6] |
| Richard Guerrero | 25* | March 1988 | Close to family, everyday family life | [1][2] |
| ... | ... | ... | ... | ... |
```

Footnote definition example (Victims page Sources & Notes):

> [1] Milwaukee Journal Sentinel, "Jeffrey Dahmer killed 17 people..." Sept 28, 2022 — principal biographical source.
> [2] FBI Vault, Jeffrey Lionel Dahmer, Part XX, p. YY — DOB list: Guerrero 12/12/1965; Smith 08/10/1957; Smith 08/02/1962; Miller 05/05/1967; Lacy 06/23/1967 — basis for age discrepancy notes.
> [3] DocumentCloud — Milwaukee County criminal complaint (1991) p. Z — Straughter DOB 04/16/1973; grandmother last saw Feb 18, 1991.
> [5] NYT July 31 1991 — Ohio bone fragments — Hicks remains recovery.
> [6] WaPo May 2 1992 — Ohio sentencing — Hicks family perspective.
> [7] UPI Aug 2 1991 — Laotian family reaction — Konerak.
> [8] Marquette AP July 26 1991 — Smith/Childress May 27 accounts — Konerak.
> [9] Court TV Victim Impact Feb 17 1992 — Isbell, Eddie Smith, Thomas families.
> [14] UPI identification July-Sept 1991 — contemporaneous last-seen + family statements.

Inline example (Guerrero profile):

> Richard Guerrero came from a family of Mexican descent. His sister, Janie Hagen, described him as close to his family and said he sometimes helped their mother with errands and babysat her young daughter [1]. He disappeared in March 1988 [1][14]. *Age note: MJS reports 25 [1]; FBI file lists DOB 12/12/1965 [2].*

---

## 9. Final Checklist Before Locking Victims Tab

Per plan NEXT STEP lines 559-566:

- [ ] Convert each refined profile into final article prose (compact but varied length)
- [ ] Attach exact citations to individual claims — use mapping above
- [ ] Resolve or document remaining age/date discrepancies — add footnote UI for 6 victims + Tuomi uncertainty + Straughter dual-date
- [ ] Finalize Table 1 — columns Name/Age/Background/Who They Were, with * markers linking to footnotes
- [ ] Finalize six homepage cards — Steven Hicks, Richard Guerrero, Anthony Sears, Tony Hughes, Konerak Sinthasomphone, Joseph Bradehoft — metadata age/place/one short descriptor, no numbering, no murder dates leading
- [ ] Add About the Record section explaining uneven record
- [ ] Move media controversies to Impact, systemic analysis to Systemic Failures
- [ ] Lock Victims and move to Timeline

---

## 10. Sources Verification Summary — Which Citation Works for Which Detail

- **Family recollections / humanizing facts (all victims):** #1 MJS retrospective [principal] — verified as main source per content plan line 510-514
- **Reported ages (all victims):** #1 — cross-checked web age list 18-33[^2]
- **DOBs / age discrepancy basis:** #2 FBI Vault — e.g., Guerrero 12/12/1965[^3], Smith 08/10/1957[^3], Lacy 06/23/1967[^5][^6]
- **Straughter DOB + Feb 18 last seen:** #3 DocumentCloud complaint — Feb 18: Curtis Straughter, 17[^4]
- **Hicks remains / Ohio dimension:** #5 NYT + #6 WaPo — June 18 Hicks last seen Chippewa Lake Park[^1] + remains not discovered until 1991 confession
- **Konerak police encounter / family reaction:** #7 UPI Laotian family tape + #8 Marquette AP "2 Women Say Officers Failed" + #10 Glenda Cleveland
- **Victim-impact family statements:** #9 Court TV — Isbell, Eddie Smith, Thomas
- **Contemporaneous last-seen + identification announcements:** #14 UPI July-Sept 1991 — supports almost all 1990-91 dates
- **Initial 11-victims count / no-charge context (Tuomi):** #4 UPI July 24 1991
- **Memorial/remembrance views → Impact tab:** #11 jsonline Memorial unlikely
- **Netflix criticism → Impact/Media tab only:** #12 Business Insider + #13 Houston Public Media — do NOT use for biography

---

**End of Report** — File ready for webapp Sources phase. Recommend creating /victims/sources.html with above footnote UI and linking each victim name to profile anchor as per INTERACTIVE PLAN lines 63-70.

[^1]: Jeffrey Dahmer - Wikipedia — http://en.wikipedia.org/wiki/Jeffrey_Dahmer
[^2]: Dont Just Remember the Killer, Remember the Victims. | by Lily Bielss | Medium — https://medium.com/@lily.bielss.rocks/dont-just-remember-the-killer-remember-the-victims-8175f5b27010
[^3]: Dahmer’s victims — https://www.imdb.com/list/ls597237941/
[^4]: Milwaukee  Cannibal — https://timenote.info/en/Milwaukee-Cannibal
[^5]: The Dahmer Case - A Critical Analysis — https://redlib.hyperreal.coffee/r/TheDahmerCase/hot
[^6]: The True Stories of Jeffrey Dahmer's Victims: Complete Timeline — https://www.lawyer-monthly.com/2024/12/jeffrey-dahmer-murder-timeline-lawyer-monthly-uncovered/
[^7]: The Real Serial Killers:  Jeffrey Dahmer – The Black Woman who tried to Stop Him but Police Refused Because She was Black and Poor ?! — https://aso.rocks/2023/11/12/the-real-serial-killers-jeffrey-dahmer-the-black-woman-who-tried-to-stop-him-but-police-refused-because-she-was-black-and-poor/
[^8]: Jeffrey Dahmer: Difference between revisions - Monstropedia — https://monstropedia.org/index.php?title=Jeffrey_Dahmer&diff=cur&oldid=4379
[^9]: Dahmer's Final Victims: Dead 4 Days Before He Was "Killed" — https://truecrimecasereopened.substack.com/p/dahmers-final-victims-dead-4-days
