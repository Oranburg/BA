# Contributing to BA: Law of the Firm

Welcome! This guide will help you understand the project architecture and start contributing quickly.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Module Map](#module-map)
- [Data Flow](#data-flow)
- [Key Entry Points](#key-entry-points)
- [Environment Variables](#environment-variables)
- [Run / Build / Test Commands](#run--build--test-commands)
- [Deployment](#deployment)
- [Code Conventions](#code-conventions)
- [Your First 3 Starter Tasks](#your-first-3-starter-tasks)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/Oranburg/BA.git
cd BA
npm install

# Development
npm run dev          # → http://localhost:5173/BA/

# Production check
npm run build        # Vite production build → dist/
npm run preview      # Preview production build locally
npm run check:app    # Validate dist artifact + link integrity
```

**Requirements:** Node.js 20+, npm 10+

---

## Architecture Overview

BA is a **fully static, client-side React SPA** for an interactive law course. There are no backend APIs — all data (499+ statutory sections, 16 chapter modules, case holdings) is bundled as JSON and lazy-loaded on demand.

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                         │
│                     (Vite entry)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                  src/main.jsx
                       │
                  src/App.jsx
                       │
          ┌────────────┼───────────────┐
          │            │               │
    ThemeProvider  TomeProvider    BrowserRouter
          │            │          (basename=/BA/)
          │            │               │
          │      Lazy JSON load   ┌────┴─────┐
          │      (499+ sections)  │  Routes   │
          │                       │ (17 total)│
          │                       └────┬──────┘
          │                            │
     MainLayout ───────────────────────┤
     (Navbar +                         │
      TomePanel +              ┌───────┴────────┐
      Footer)                  │                │
                          LandingPage     16 Chapter Modules
                          (/ route)       (/ch01 → /ch16)
                                               │
                                          Toolkit Components
                                          (interactive law sims)
```

### Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 19 (concurrent mode)        |
| Build       | Vite 8                            |
| Styling     | Tailwind CSS 3.4 (class dark mode)|
| Routing     | react-router-dom 7                |
| Markdown    | react-markdown + remark-gfm       |
| Hosting     | GitHub Pages (Actions deploy)     |

---

## Module Map

```
src/
├── main.jsx                    # React DOM entry point
├── App.jsx                     # Root component: providers + router
├── index.css                   # Tailwind directives + custom animations
│
├── routing/
│   ├── routes.js               # APP_ROUTES constant (all 17 route paths)
│   ├── HashRouteHandler.jsx    # Legacy #hash → /route migration
│   └── ScrollToTop.jsx         # Reset scroll on navigation
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Top nav: logo, theme toggle, tome search
│   │   ├── MainLayout.jsx      # Page wrapper: navbar + content + footer
│   │   ├── ThemeContext.jsx     # Dark/light mode context provider
│   │   └── useTheme.js         # Theme consumer hook
│   ├── toolkit/                # ⭐ Interactive law simulation components
│   │   ├── AuthorityMatrix.jsx # Agent authority classification quiz
│   │   ├── FiduciarySlider.jsx # Business Judgment Rule calculator
│   │   ├── TomeOfLaw.jsx       # Statutory text search & display
│   │   ├── InvestigationDesk.jsx # Tabbed case file viewer
│   │   ├── VeilPiercingWall.jsx  # Drag-drop veil piercing exercise
│   │   └── MadLibsHolding.jsx   # Build-a-holding with select menus
│   ├── ui/
│   │   ├── ErrorBoundary.jsx   # React error catch + fallback UI
│   │   └── AppImage.jsx        # Image wrapper with error handling
│   └── course/
│       ├── ChapterHero.jsx     # Chapter header: title + image + objectives
│       ├── ModuleBreadcrumb.jsx # Breadcrumb navigation
│       └── ContinuityPanels.jsx # Narrative bridges between chapters
│
├── modules/                    # 16 chapter interactive modules
│   ├── ch01-why-law/index.jsx
│   ├── ch02-agency/index.jsx
│   ├── ch03-partnership/index.jsx
│   ├── ch04-corporations-tech/index.jsx
│   ├── ch05-fiduciary-duty/index.jsx
│   ├── ch06-llc/index.jsx
│   ├── ch07-daos/index.jsx
│   ├── ch08-nonprofit/index.jsx
│   ├── ch09-governance/index.jsx
│   ├── ch10-shareholder-rights/index.jsx
│   ├── ch11-going-public/index.jsx
│   ├── ch12-securities-regulation/index.jsx
│   ├── ch13-m-and-a/index.jsx
│   ├── ch14-piercing-the-veil/index.jsx
│   ├── ch15-capital-structure/index.jsx
│   └── ch16-conclusion/index.jsx
│
├── pages/
│   ├── LandingPage.jsx         # Home: hero + 4 problems + course map
│   └── SpaRedirectHandler.jsx  # GitHub Pages 404 → SPA redirect
│
├── tome/                       # Legal reference engine
│   ├── TomeContext.jsx         # Context provider + lazy document loading
│   ├── corpus.js               # Document registry (19 legal works)
│   ├── citationRegistry.js     # Citation alias resolution
│   ├── resolver.js             # Search + section lookup logic
│   └── TomePages.jsx           # Tome UI: home, document, section views
│
├── reader/
│   └── index.js                # Markdown → structured content parser
│
├── learning/
│   └── progress.js             # localStorage course progress tracking
│
├── course/
│   ├── lifecycle.js            # Module flow + bridge narratives
│   ├── coherence.js            # Internal coherence utilities
│   └── matterFile.js           # Matter file utilities
│
├── data/
│   ├── tome/                   # 📚 JSON statutory text (lazy-loaded)
│   │   ├── rupa-sections.json       # 95 sections
│   │   ├── ullca-sections.json      # 89 sections
│   │   ├── mbca-sections.json       # 226 sections
│   │   ├── dgcl-sections.json       # 21 sections
│   │   ├── r3a-sections.json        # 15 sections
│   │   ├── securities-act-sections.json
│   │   ├── exchange-act-sections.json
│   │   ├── genius-act-sections.json
│   │   ├── irc-sections.json
│   │   ├── mnca-sections.json
│   │   ├── cases.json               # 13 case holdings
│   │   └── scholarship-sections.json # 30 doctrinal extracts
│   ├── statutes/
│   │   └── index.js            # Hardcoded statute snippets (quick ref)
│   ├── manifests/
│   │   ├── chapter-manifest.json    # Chapter metadata + objectives
│   │   ├── legal-work-manifest.json # Document metadata + aliases
│   │   └── image-manifest.json      # Image naming policy
│   └── caselaw/                # Case data (placeholder)
│
└── assets/
    ├── chapters/               # Chapter hero images (ch00–ch16.jpg)
    └── images/                 # World-building images
```

---

## Data Flow

### 1. Application Boot
```
index.html
  → src/main.jsx (createRoot, StrictMode)
    → App.jsx
      → BrowserRouter (basename="/BA/")
      → ThemeProvider (reads <html class="dark">)
      → TomeProvider (triggers loadAllAndRebuild on mount)
        → Fetches 12 JSON files from src/data/tome/
        → Builds in-memory search index + citation registry
      → Routes matched → Page component rendered
```

### 2. Chapter Module Lifecycle
```
User clicks chapter card on LandingPage
  → react-router navigates to /ch{NN}-{slug}
  → Module component mounts (src/modules/ch{NN}/index.jsx)
  → Phase 0: Narrative introduction (static text)
  → Phase 1–N: Interactive phases (toolkit components)
    → User interacts with sliders/dropdowns/drag-drop
    → Local useState tracks answers + score
  → Final Phase: Verdict/debrief with feedback
  → Progress saved to localStorage (learning/progress.js)
```

### 3. Tome (Legal Reference) Flow
```
User opens Tome panel (via Navbar button or citation link)
  → TomeContext.openTome({ query: "RUPA § 202" })
  → citationRegistry.js resolves alias → document + section
  → resolver.js searches in-memory section data
  → TomePages.jsx renders section text + metadata
```

### 4. Progress Persistence
```
Module completion event
  → learning/progress.js writes to localStorage
    key: "ba-learning-progress-v1"
    value: { modules: { ch02: { completed: true, score: 85 } }, ... }
  → LandingPage reads progress → shows completion badges on chapter cards
```

---

## Key Entry Points

| What you want to do | Start here |
|---|---|
| Add a new chapter module | `src/modules/ch{NN}-{slug}/index.jsx` (copy existing pattern) + register in `src/routing/routes.js` + `src/App.jsx` + `src/course/lifecycle.js` |
| Add a new toolkit component | `src/components/toolkit/` (self-contained, no external deps) |
| Add a new legal document to Tome | `src/data/tome/{doc}-sections.json` + register in `src/tome/corpus.js` + aliases in `src/tome/citationRegistry.js` |
| Modify routing | `src/routing/routes.js` (source of truth) + `src/App.jsx` (route registration) |
| Change theme/colors | `tailwind.config.js` (Sprawl palette) + `src/index.css` (animations) |
| Fix deployment | `.github/workflows/deploy.yml` + `vite.config.js` (base path) |
| Update course metadata | `src/data/manifests/chapter-manifest.json` |

---

## Environment Variables

This is a **fully static application** with no runtime environment variables.

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `DEPLOY_BASE_PATH` | `scripts/validate-dist.mjs` | `/BA/` | Override base path for dist validation |

All configuration is hardcoded:
- **Base path:** `/BA/` (in `vite.config.js`)
- **Theme:** Dark by default (`class="dark"` on `<html>`)
- **Fonts:** Google Fonts (Oswald, Crimson Text, Roboto) loaded via CDN in `index.html`

---

## Run / Build / Test Commands

| Command | Purpose | When to use |
|---|---|---|
| `npm run dev` | Start Vite dev server with HMR | Daily development |
| `npm run build` | Production build → `dist/` | Before deploy, to check for errors |
| `npm run preview` | Serve `dist/` locally | Verify production build behavior |
| `npm run lint` | Run ESLint on all source files | Before committing |
| `npm run validate:dist` | Check dist artifact integrity | After `npm run build` |
| `npm run validate:integrity` | Verify routes, anchors, images | After changing links/routes |
| `npm run check:app` | Both validations combined | Full pre-deploy check |
| `npm run build:verify` | Build + validate:dist | CI equivalent locally |

### Typical Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes — HMR updates browser instantly

# 3. Before committing
npm run lint
npm run build:verify
npm run validate:integrity

# 4. Push to main → auto-deploys via GitHub Actions
```

---

## Deployment

Deployment is **automatic** via GitHub Actions on push to `main`.

**Pipeline:** `npm ci → npm run build → validate:dist → upload to GitHub Pages`

**Live URL:** [https://oranburg.github.io/BA/](https://oranburg.github.io/BA/)

To deploy manually: trigger the workflow via **Actions → Deploy to GitHub Pages → Run workflow**.

---

## Code Conventions

- **Components:** Functional components with hooks (no class components)
- **State:** Local `useState` per module; `useContext` for theme and Tome
- **Routing:** All routes defined in `src/routing/routes.js` as a frozen object
- **Styling:** Tailwind utility classes; custom `sprawl-*` colors; `font-headline`, `font-body`, `font-ui`
- **Dark mode:** Class-based (`dark:` prefix) — controlled by ThemeContext
- **Data:** Static JSON files imported at build time; no API calls
- **File naming:** Lowercase kebab-case for directories; PascalCase for components
- **ESLint rules:** React Hooks + React Refresh; unused vars allowed if UPPERCASE or `_`-prefixed

---

## Your First 3 Starter Tasks

These tasks are designed to help new contributors learn the codebase while making meaningful improvements.

### 🟢 Task 1: Fix the README tech stack (5 minutes)

**File:** `README.md`

The README lists `@dnd-kit` as a dependency, but it is not installed. The VeilPiercingWall component uses native HTML5 drag events instead. Remove the `@dnd-kit` line from the tech stack section and replace it with "Native HTML5 Drag and Drop API."

**What you'll learn:** The project's actual dependencies and the README structure.

### 🟡 Task 2: Add route-based code splitting with React.lazy (30 minutes)

**File:** `src/App.jsx`

The main JS bundle is 701 kB because all 16 chapter modules are imported eagerly. Convert the chapter imports to use `React.lazy()` + `<Suspense>` so each chapter loads on demand.

```
Before: import Ch02Agency from "./modules/ch02-agency"
After:  const Ch02Agency = React.lazy(() => import("./modules/ch02-agency"))
```

Add a `<Suspense fallback={<div>Loading...</div>}>` wrapper around `<Routes>`.

**What you'll learn:** The routing system, module structure, and Vite's automatic code splitting.

### 🟡 Task 3: Write a smoke test for the citation resolver (45 minutes)

**Files:** `src/tome/citationRegistry.js`, `src/tome/resolver.js`

Install Vitest (`npm install -D vitest`) and write tests that verify:
1. `citationRegistry` resolves known aliases (e.g., "RUPA" → rupa document ID)
2. `resolver` finds sections by number (e.g., "§ 202" in RUPA returns the correct section)
3. Edge cases: unknown citations return null, partial matches work

**What you'll learn:** The Tome legal reference engine — the most complex subsystem in the app.
