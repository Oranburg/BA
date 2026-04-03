# BA: Law of the Firm — The Neon Edge

An interactive educational web application for the law course **Business Associations: Law of the Firm** by Professor Seth C. Oranburg. Built with React + Vite + Tailwind CSS.

## Features

- **Landing page** with hero section, Four Problems of the Firm, and 16-chapter curriculum roadmap
- **Interactive Toolkit** components:
  - **Fiduciary Shield Analyzer** — Business Judgment Rule tipping-point calculator
  - **Tome of Law** — Retrieve verbatim statutory text (RSA, RUPA, RULLCA, MBCA, DGCL, UVTA)
  - **Veil-Piercing Wall** — Drag-and-drop corporate veil integrity tester
  - **Investigation Desk** — Tabbed case file viewer (Zeeva v. Sammy)
  - **Mad-Libs Holding** — Build a court's holding with inline select menus
  - **Authority Matrix** — Classify agent actions by authority type (quiz)
- **Casebook Reader** with paragraph-level anchor deep-linking (`3689B` IDs)
- **Dark/light mode** toggle
- 16 chapter modules (ch01–ch16) covering Agency through Conclusion

## Tech Stack

- [Vite](https://vitejs.dev) + [React 19](https://react.dev)
- [Tailwind CSS v3](https://tailwindcss.com) with custom "Sprawl" design palette
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- [react-router-dom](https://reactrouter.com)
- [@dnd-kit](https://dndkit.com) for drag-and-drop interactions

## Getting Started

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
npm run validate:dist  # verify production artifact safety
npm run validate:integrity  # verify internal links, anchors, and image references
npm run check:app # dist + integrity checks together
```

## Production Deployment (GitHub Pages via Actions Artifacts)

- Hosting target: `https://oranburg.law/BA/`
- Vite base path is `/BA/` (`vite.config.js`) so all built assets resolve under that subpath.
- Pages deploy source must be **GitHub Actions**, not branch publish.
- Deployment workflow: `.github/workflows/deploy.yml`
  1. `npm ci`
  2. `npm run build`
  3. `npm run validate:dist`
  4. upload `dist/` using `actions/upload-pages-artifact`
  5. deploy using `actions/deploy-pages`

This ensures production serves built `dist/index.html` (hashed assets), not source `index.html`.

## Local Production Validation

Run:

```bash
npm ci
npm run build
npm run check:app
npm run preview
```

Then verify:
- app loads at `http://localhost:4173/BA/`
- no request to `/src/main.jsx`
- a deep link like `http://localhost:4173/BA/ch02-agency` loads and refreshes successfully
- legacy `http://localhost:4173/BA/#problems` redirects to canonical Tome route (`/BA/tome?panel=problems`)
- no fatal console errors on initial load

## Link/Citation/Hash Conventions

- **Canonical internal routes** are centralized in `src/routing/routes.js`.
- Legacy hash entrypoint `#problems` is backward-compatible and now canonicalized to `/tome?panel=problems`.
- Hash navigation uses `HashRouteHandler` with mount-aware retry for anchors and safe missing-target behavior.
- Citation matching is centralized in `src/tome/citationRegistry.js` via `resolveCitation`.
- Citation aliases are normalized to one canonical source (including `GENIUS Act`/`PLAW-119(-27)` variants).
- Unresolved citations degrade gracefully (opens Tome search and logs a warning).

## Troubleshooting / Failure Signatures

### 1) GET request to /src/main.jsx returns 404 with blank page

Likely cause: source `index.html` was served instead of built artifact.  
Action:
- confirm Pages source is **GitHub Actions**
- run/inspect latest deploy workflow
- verify artifact upload path is `dist`
- run `npm run build && npm run validate:dist` locally

### 2) Blank page with HTML loading successfully

Likely causes:
- incorrect base path for subpath hosting
- broken asset URLs
- runtime exception during initial render

Action:
- check `vite.config.js` has `base: '/BA/'`
- inspect network tab for missing `/BA/assets/...` files
- inspect browser console for runtime errors

### 3) Deep-link refresh 404 under `/BA/`

Likely cause: static host fallback missing for SPA routes.  
Action:
- ensure `public/404.html` exists and is included in `dist/404.html`
- ensure redirect handler runs at app bootstrap (`SpaRedirectHandler`)

### 4) Broken internal links, anchors, or image references

Run:

```bash
npm run validate:integrity
```

This checks:
- app-internal route targets used in navigation and CTAs
- hash anchor existence for hash links used by app code
- referenced local image asset existence

## Recovery / Rollback

If a deployment misbehaves:
1. Open GitHub Actions and identify the last known-good successful Pages deployment.
2. Re-run that workflow commit (or revert problematic commit on `main`).
3. Confirm Pages deploy job completes and environment URL is updated.
4. Verify:
   - `/BA/` loads
   - no `/src/main.jsx` requests
   - deep-link refresh works
5. If urgent, temporarily lock deploys to trusted commits only until root cause is corrected.

## Project Structure

```
src/
  components/
    layout/         # Navbar, MainLayout, ThemeContext
    toolkit/        # Interactive law toolkit components
  data/
    statutes/       # Statutory text database
    caselaw/        # Case law data (future)
  modules/
    ch01-why-law/   # Chapter stubs (ch01–ch16)
    ...
  pages/            # LandingPage
  reader/           # CasebookReader with para-ID anchors
```

## The Four Problems of the Firm

| Problem | Description | Key Chapters |
|---------|-------------|--------------|
| **Attribution** | Who is responsible for an agent's acts? | 2, 7 |
| **Governance** | Who controls the firm? | 5, 6, 9, 12, 13 |
| **Risk** | Who bears the firm's losses? | 3, 10, 15 |
| **Partitioning** | How are asset pools separated? | 4, 11, 14 |
