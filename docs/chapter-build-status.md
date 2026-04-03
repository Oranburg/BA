# Chapter Activity Build Status

## What's Built and Working (6 modules)

| Ch | Title | Route | Status |
|----|-------|-------|--------|
| 02 | Agency Law | /ch02-agency | Working |
| 08 | Entity Selection | /ch08-entity-selection | Working |
| 09 | Fiduciary Duties | /ch09-fiduciary-duties | Working |
| 12 | Shareholder Franchise | /ch12-shareholder-franchise | Working |
| 13 | M&A | /ch13-m-and-a | Working |
| 15 | Capital Structure | /ch15-capital-structure | Working |

## What I Can Build Now (7 modules)

These chapters have complete HTML sim templates in `inbox/sims/` with self-contained interactive mechanics and enough legal content embedded in the sims to build working activities:

| Ch | Title | Sim File | Core Mechanic |
|----|-------|----------|---------------|
| 01 | Why Law | mod1.html | Four Problems tabs, Entity radar chart, Fiduciary lab |
| 03 | Partnership | mod2.html | RUPA § 202 phrase identifier, Verdict builder |
| 05 | LLCs | mod5.html | OA configuration (member/manager, duties, allocation), Governance matrix |
| 07 | DAOs | mod7.html | Code-as-law attribution, Node flow visualization |
| 10 | Staying Private | mod10.html | VC term sheet comparison, Exit waterfall chart |
| 11 | Going Public | mod11.html | Disclosure flag/unflag, Market confidence chart |
| 16 | Conclusion | mod16.html | Four Problems synthesis radar, Lifecycle reflection |

## What Needs Your Input (3 modules)

### Ch 04 — Corporations & Tech (Entity Shielding)
**Problem:** The HTML sim (mod3.html) teaches partnership fiduciary duties (Guth v. Loft, corporate opportunity), but the textbook chapter covers corporate veil-piercing and limited liability doctrine. These are different topics.

**Question:** Should the Ch 04 activity focus on:
- (a) Veil-piercing/entity shielding (matching the textbook), or
- (b) Corporate opportunity doctrine (matching the sim)?
- (c) Both — with phases for formation/shielding then fiduciary duties?

I have the textbook content on veil-piercing (Walkovszky, Sea-Land v. Pepper Source) and can build either direction.

### Ch 06 — Nonprofits
**Problem:** The sim (mod6.html) covers the nondistribution constraint and nonprofit capital flow — good content. But the only textbook file I found for Ch 06 is on DAOs, not nonprofits.

**Question:** Is there a separate nonprofit textbook chapter I'm missing, or should I build from the sim content alone (Hansmann nondistribution theory, IRC 501(c)(3), MNCA)?

### Ch 14 — Piercing the Veil
**Problem:** The sim (mod14.html) covers alter ego/piercing — great mechanics (drag evidence onto shield wall). But the textbook file labeled "Ch 14 Corporate Numeracy" covers UVTA fraudulent transfers and solvency tests, not piercing doctrine.

**Question:** The sim and textbook seem to be about different topics. Which is correct for Ch 14:
- (a) Piercing the veil / alter ego (matching the sim), or
- (b) Corporate numeracy / solvency tests / UVTA (matching the textbook)?

If it's piercing, I have enough from the sim + case law (Walkovszky, Sea-Land) to build it. If it's numeracy/UVTA, I'd need guidance on the interactive mechanics.

## Module-to-Sim Mapping (Confirmed)

| mod | Chapter | Topic |
|-----|---------|-------|
| mod1 | Ch 01 | Introduction / Four Problems |
| mod2 | Ch 03 | Partnership Forge (RUPA § 202) |
| mod3 | Ch 04 | Fiduciary Pivot (Corporate Opportunity) |
| mod4 | Ch 04? | Asset Partitioning (entity shielding) |
| mod5 | Ch 05 | LLC Governance Hybrid |
| mod6 | Ch 06 | Nondistribution Constraint (Nonprofits) |
| mod7 | Ch 07 | DAOs: Code as Law |
| mod8 | Ch 08 | Entity Selection Synthesis |
| mod9 | Ch 09 | Fiduciary Shield (BJR) |
| mod10 | Ch 10 | VC Preference Stack |
| mod11 | Ch 11 | IPO Disclosure Scrubber |
| mod12 | Ch 12 | Proxy War |
| mod13 | Ch 13 | M&A Gambit |
| mod14 | Ch 14 | Piercing the Veil |
| mod15 | Ch 15 | Solvency Breach (UVTA) |
| mod16 | Ch 16 | Lifecycle Synthesis |
