# BA: Law of the Firm — The Neon Edge

An interactive educational web application for **Business Associations: Law of the Firm** by Professor Seth C. Oranburg. Built with React + Vite + Tailwind CSS, deployed to GitHub Pages.

**Live site:** [oranburg.github.io/BA/](https://oranburg.github.io/BA/)

## What This Is

A 16-chapter interactive course companion for a business associations law textbook. Students work through the firm lifecycle — from formation through financing, governance conflict, M&A, and distress — via interactive activities set in a cyberpunk "New Boston 2077" scenario following founders Zeeva and Sammy as they build ConstructEdge.

Every chapter has:
- A **doctrine primer** teaching the legal concepts before the activity
- An **interactive exercise** that makes students apply the law
- A **synthesis/verdict step** requiring legal analysis
- An **export** producing a downloadable counsel sheet

## The Four Problems of the Firm

The unifying pedagogical framework. Every entity is a legal technology for solving these four coordination problems:

| Problem | Question | Key Chapters |
|---------|----------|-------------|
| **Attribution** | Who is responsible for an agent's acts? | 1, 2, 7 |
| **Governance** | Who controls the firm and how? | 1, 5, 6, 9, 12, 13 |
| **Risk** | Who bears the firm's losses? | 1, 3, 10, 15 |
| **Partitioning** | How are asset pools separated? | 1, 4, 11, 14 |

## Chapter Activities

| Ch | Title | Activity | Key Doctrine |
|----|-------|----------|-------------|
| 01 | Why Law | Four Problems Diagnostic | Transaction costs, agency costs |
| 02 | Agency | The Neural-Link Handshake | Control test, authority types, respondeat superior |
| 03 | Partnership | The Partnership Forge | RUPA § 202 formation, profit-sharing presumption |
| 04 | Corporations | The Entity Shield | Asset partitioning, veil-piercing two-prong test |
| 05 | LLCs | The Governance Hybrid | Operating agreement, contractual duty modification |
| 06 | Nonprofits | The Nondistribution Constraint | IRC § 501(c)(3), Hansmann theory |
| 07 | DAOs | Code as Law | Sarcuni partnership default, legal wrappers |
| 08 | Entity Selection | Formation Studio | Four Problems scoring across entity types |
| 09 | Fiduciary Duties | Board Process Simulator | Duty of care/loyalty, DGCL § 144 safe harbor |
| 10 | Staying Private | The Preference Stack | VC term sheets, liquidation preference waterfall |
| 11 | Going Public | The Disclosure Scrubber | Securities Act § 11 liability, materiality |
| 12 | Shareholder Franchise | Proxy Contest Control Room | Blasius, Unocal applied to franchise |
| 13 | M&A | The Deal Room | Unocal two-prong, Revlon triggers |
| 14 | Piercing the Veil | The Veil-Piercing Wall | Alter ego, unity of interest + injustice |
| 15 | Capital Structure | Distress Governance Lab | Solvency tests, UVTA § 4, Gheewalla |
| 16 | Conclusion | Lifecycle Synthesis | Four Problems capstone |

## Tome of Law (Legal Reference Database)

A searchable legal reference with 711 entries across 16 documents, lazy-loaded:

| Source | Entries | Coverage |
|--------|---------|----------|
| DGCL | 137 | §§ 101–285, Close Corps, PBCs |
| MBCA | 226 | Full black-letter text |
| RUPA | 95 | All sections |
| ULLCA | 89 | All sections |
| R3A (Restatement of Agency) | 54 | Chapters 1–8 |
| Securities Act 1933 | 13 | §§ 2–18 |
| Exchange Act 1934 | 10 | §§ 3–21A |
| GENIUS Act | 20 | Full text |
| IRC / MNCA / Other | 13 | Key sections |
| Case Law | 23 | Structured holdings |
| Scholarship (BACG) | 31 | Doctrinal "why" explanations |

Three access modes:
- **Quick Lookup** (side panel) — opens from CitationChip clicks in activities
- **Course View** (/tome) — chapters with their statutes, cases, and comparisons
- **Document Reader** (/tome/:docSlug) — full codebook with TOC, prev/next, cross-references

Search uses relevance-ranked scoring across section numbers, titles, concept tags, and full text.

## Tech Stack

- [Vite 8](https://vitejs.dev) + [React 19](https://react.dev)
- [Tailwind CSS v3](https://tailwindcss.com) with custom "Sprawl" color palette
- [React Router v7](https://reactrouter.com) with SPA redirect for GitHub Pages
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)

## Getting Started

```bash
npm install
npm run dev          # development server at localhost:5173/BA/
npm run build        # production build
npm run preview      # preview production build
npm run lint         # ESLint
npm run check:app    # validate:dist + validate:integrity
```

## Deployment (GitHub Pages)

Automated via `.github/workflows/deploy.yml` on push to `main`:
1. `npm ci` → `npm run build` → `npm run validate:dist`
2. Upload `dist/` via `actions/upload-pages-artifact`
3. Deploy via `actions/deploy-pages`

Base path is `/BA/` (set in `vite.config.js`). SPA deep-link refresh handled by `public/404.html` redirect.

## Project Structure

```
src/
  assets/
    chapters/         # Optimized chapter illustrations (ch00-ch16.jpg)
    images/            # New Boston 2077 hero image
  components/
    course/            # ModuleBreadcrumb, ChapterHero, ContinuityPanels
    layout/            # Navbar, MainLayout, ThemeContext
    toolkit/           # FiduciarySlider, VeilPiercingWall, AuthorityMatrix, etc.
    ui/                # AppImage, ErrorBoundary
  course/              # lifecycle.js (module flow), coherence.js, matterFile.js
  data/
    manifests/         # Chapter, image, legal work manifests
    statutes/          # Legacy statute retrieval (TomeOfLaw component)
    tome/              # Lazy-loaded JSON: rupa, ullca, dgcl, mbca, r3a, cases, etc.
  learning/            # progress.js (localStorage persistence)
  modules/
    ch01-why-law/      # All 16 chapter activities
    ch02-agency/
    ...
    ch16-conclusion/
  pages/               # LandingPage, SpaRedirectHandler
  routing/             # routes.js, HashRouteHandler, ScrollToTop
  tome/                # TomeCourseView, TomeDocReader, TomeQuickRef, corpus, resolver
```

## Navigation

| Nav Item | Destination | Purpose |
|----------|-------------|---------|
| Home | / | Landing page with hero, Four Problems, toolkit demos, chapter roadmap |
| Chapters | /#course-map | Scroll to curriculum roadmap with progress tracking |
| Toolkit | /#simulation-lab | Scroll to interactive tool demos |
| Quick Lookup | Side panel | Opens Tome panel for fast citation reference |
| Corpus | /tome | Full Course View with chapter-organized legal references |

## Learning Progress

Student progress is stored in `localStorage` under `ba-learning-progress-v1`:
- Per-module state (answers, scores, phase)
- Completion status and timestamps
- Last visited module for resume recommendations
- Matter file (ConstructEdge dossier carrying forward across chapters)

## Verification

```bash
npm run check:app    # validates dist artifact + internal link integrity
npm run lint         # ESLint with React hooks/refresh rules
```

Deep-link test: `http://localhost:4173/BA/ch02-agency` should load and refresh successfully.

## Recovery

If a deployment breaks:
1. Find last good commit in GitHub Actions
2. Revert or re-run that workflow
3. Verify `/BA/` loads, deep-links refresh, no console errors
