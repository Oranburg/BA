# BA: Law of the Firm — Activity Development Log

## Overview

This log tracks the development of interactive learning activities for **BA: Law of the Firm**,
mapped to the 16 chapters of Professor Oranburg's casebook. Activities are built as standalone
React modules and live in `src/modules/`. All activities run inside the Neon Edge narrative
universe (Cyberpunk-inspired) with Zeeva (Principal) and Sammy (Agent) as central characters.

**Design Principles:**
- Each activity is self-contained (single directory, no cross-module dependencies)
- Law is the ground truth: all answers traceable to RSA, RUPA, RULLCA, MBCA, or DGCL
- At least one non-MCQ mechanic per activity (slider, drag-drop, evidence classification)
- Feedback explains the *why* based on casebook reasoning and statutory text
- IRAC structure: identify the rule before reaching the conclusion

---

## Activity Roadmap

### ✅ BUILT

| Chapter | Title | Mechanic | Statute | Status |
|---------|-------|----------|---------|--------|
| Ch02 | **The Neural-Link Handshake** — Agency: Who Controls the Fixer? | Scales of Control (classification) + Authority Matrix + Respondeat Superior MCQ | RSA §§ 1.01, 2.01–2.03, 7.07 | ✅ Complete |
| Ch13 | **The Deal Room** — Enhanced Scrutiny in The Sprawl | Evidence classification (Unocal Prong 1) + MCQ (Prong 2) + Revlon trigger analysis + Mad-Libs Holding | DGCL § 141(a) · Unocal, Revlon | ✅ Complete |

---

### 📋 PLANNED (by chapter)

| Chapter | Proposed Activity | Core Mechanic | Primary Statute |
|---------|-------------------|---------------|-----------------|
| **Ch01** | *The Four Problems Diagnostic* — classify real-world business disputes into Attribution / Governance / Risk / Partitioning | Drag-and-drop sorter | Conceptual (no statute) |
| **Ch03** | *The Accidental Partnership* — find the profit-sharing clause that created a RUPA partnership without intent | Redline Spotter: highlight the trigger phrase in an email thread | RUPA § 202 |
| **Ch04** | *The Entity Shield* — match corporate attributes (limited liability, perpetual existence, transferability) to entity types | Matching / sorting cards | DGCL § 101; MBCA § 2.01 |
| **Ch05** | *Operating Agreement Architect* — draft key LLC operating agreement provisions by choosing from menus | Mad-Libs clause builder | RULLCA § 110 |
| **Ch06** | *The Nondistribution Constraint* — identify which distributions would violate nonprofit law | Classification quiz with explanations | IRC § 501(c)(3) (concept); casebook |
| **Ch07** | *Code is Law: DAO Governance* — trace a smart contract execution chain to identify who is "responsible" | Authority Matrix adapted for DAO nodes | Conceptual |
| **Ch08** | *Entity Selection Simulator* — Zeeva is forming a new firm; choose entity type based on investor, liability, and governance goals | Interactive decision tree | RUPA, RULLCA, MBCA, DGCL |
| **Ch09** | *The Fiduciary Pivot* — apply Duty of Care (BJR) then pivot to Duty of Loyalty (corporate opportunity) if Care passes | Fiduciary Slider + Guth test quiz | DGCL § 144; MBCA § 8.30–8.31 |
| **Ch10** | *The VC Term Sheet* — identify which provisions favor founders vs. investors (liquidation preference, anti-dilution, board seats) | Annotation / labeling tool | DGCL § 151 |
| **Ch11** | *IPO Disclosure Checklist* — identify which facts trigger SEC disclosure obligations | Checkbox + scenario analysis | Securities Act § 11 |
| **Ch12** | *Shareholder Voting Calculator* — calculate quorum and supermajority thresholds; determine if a board resolution passes | Numeric input + calculation check | DGCL § 211; MBCA § 7.25 |
| **Ch14** | *The Veil-Piercing Wall* — drag evidence of commingling and undercapitalization onto the corporate veil to "break" it | Veil-Piercing Wall (drag-and-drop) | DGCL; Walkovszky v. Carlton |
| **Ch15** | *The Solvency Test* — determine if a distribution is lawful under balance-sheet and equity-insolvency tests | Numeric slider + calculation | DGCL § 170; MBCA § 6.40 |
| **Ch16** | *The Four Problems: Final Synthesis* — classify a complex transaction (e.g., leveraged buyout) across all four problem categories | Multi-dimension classification matrix | All statutes |

---

## Technical Architecture

### Activity Conventions
- **Location**: `src/modules/ch{N}-{slug}/index.jsx`
- **Routing**: Registered in `src/App.jsx` under `/ch{N}-{slug}`
- **Landing page**: Chapter card shows `▶ Play` badge when `route` is set; links directly to activity
- **Styling**: Use Sprawl palette from `tailwind.config.js`. No inline style objects except for gradient hacks.
- **State**: Component-local `useState`. No global store needed for single-activity modules.

### Phase Structure Template
Activities use a numbered phase approach:
1. `phase === 0` — Narrative intro (transmission from Zeeva/Sammy scenario)
2. `phase === 1..N` — Interactive analysis phases
3. `phase === last` — Final verdict with score breakdown and casebook citations

### Toolkit Components Available
| Component | File | Usage |
|-----------|------|-------|
| FiduciarySlider | `src/components/toolkit/FiduciarySlider.jsx` | BJR analysis |
| AuthorityMatrix | `src/components/toolkit/AuthorityMatrix.jsx` | Authority classification |
| TomeOfLaw | `src/components/toolkit/TomeOfLaw.jsx` | Fetch statutory text |
| VeilPiercingWall | `src/components/toolkit/VeilPiercingWall.jsx` | Commingling drag-drop |
| InvestigationDesk | `src/components/toolkit/InvestigationDesk.jsx` | Case file viewer |
| MadLibsHolding | `src/components/toolkit/MadLibsHolding.jsx` | Draft court holding |

---

## Future Integration Notes

This activity system is designed to eventually integrate with:
- **Quaere** (learning objectives → assessments → activities mapping)
- **PTS** (Protecting Trade Secrets course activities)
- **K** (Contracts course activities)

Integration conventions to observe now:
1. Each activity's `index.jsx` should export a default component with no required props
2. Stat tracking (scores, completions) should eventually flow to a shared `useProgress()` hook
3. Casebook anchors (paragraph IDs like `3689B`) should be preserved in feedback for deep-linking
4. Activity metadata (title, chapter, statute, objective) should be exportable as a named `ACTIVITY_META` const

---

## Run History

| Date | Milestone |
|------|-----------|
| 2026-04-03 | Ch02 (Agency) and Ch13 (M&A) activities built and deployed |
| 2026-04-03 | Processor improvements: citation extraction, body-section detection, PDF section detection, fallback regex with deduplication |
| 2026-04-03 | GitHub Pages deployment updated to use actions/deploy-pages@v4 (Actions source) |
