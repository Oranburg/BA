# Repo Health Audit — Top Risk Issues

> **Audit date:** 2026-04-04
> **Auditor:** Automated repo health scan
> **Repo:** Oranburg/BA (interactive law course — React + Vite + Tailwind)

Each section below is a standalone GitHub issue ready to be filed.
Paste the title and body into **Issues → New issue** or use `gh issue create`.

---

## Issue 1: No test framework or test coverage

**Title:** `[Health] Add test framework and baseline test coverage`

**Labels:** `testing`, `health`, `priority:high`

**Body:**

### Problem
The repository has **zero test files**, no test runner (Jest, Vitest, etc.), and no coverage tooling. There are 57 source files (~15,600 LOC) with no automated quality gates beyond build validation.

### Risk
- Regressions in interactive toolkit components (FiduciarySlider, AuthorityMatrix, VeilPiercingWall, MadLibsHolding) go undetected
- Refactors to the Tome citation/resolution system could silently break legal reference lookups across 499+ sections
- Course progress (localStorage persistence) is untested — data loss is possible on schema changes

### Suggested Action
1. Install Vitest (already ships with Vite ecosystem — zero extra bundler config)
2. Add `npm run test` script to `package.json`
3. Write smoke tests for: `App.jsx` renders, route definitions match modules, `citationRegistry.js` resolves known aliases, `progress.js` round-trips to localStorage
4. Add coverage threshold (target: 30% initial, raise over time)
5. Add a `test` job to `deploy.yml` CI workflow that blocks deployment on test failures

### Impact
High — this is the single largest quality gap. Every other modernization step depends on test coverage to validate safety.

---

## Issue 2: CI pipeline has no lint or test gates

**Title:** `[Health] Add lint and test jobs to CI workflow`

**Labels:** `ci`, `health`, `priority:high`

**Body:**

### Problem
The GitHub Actions workflow (`deploy.yml`) only runs `npm run build` and `npm run validate:dist`. It does **not** run `npm run lint` or any test command. Lint errors and broken logic can ship to production.

### Current Workflow
```
build → validate:dist → upload artifact → deploy
```

### Desired Workflow
```
lint → test → build → validate:dist → validate:integrity → upload artifact → deploy
```

### Risk
- ESLint catches real bugs (unused variables, hook rule violations) — these currently only surface if a developer remembers to run `npm run lint` locally
- Without a test gate, there is no automated safety net for any code change

### Suggested Action
1. Add a `lint` step before `build` in `deploy.yml`
2. Add a `test` step (once Issue 1 is resolved)
3. Add `npm run validate:integrity` step after build
4. Consider adding a separate `ci.yml` workflow for PRs (non-deploy checks)

---

## Issue 3: No code formatting enforcement (Prettier / pre-commit hooks)

**Title:** `[Health] Add Prettier and pre-commit formatting enforcement`

**Labels:** `tooling`, `health`, `priority:medium`

**Body:**

### Problem
There is no Prettier configuration, no `.editorconfig`, and no pre-commit hooks (Husky/lint-staged). Code style across 57 source files is inconsistent — some files use single quotes, others double quotes; indentation varies.

### Risk
- Code review friction increases as contributors use different formatters
- Merge conflicts from whitespace/formatting differences
- Inconsistent style makes the codebase harder to read and maintain

### Suggested Action
1. Add Prettier with a `.prettierrc` config (match existing dominant style)
2. Add `npm run format` and `npm run format:check` scripts
3. Install Husky + lint-staged for pre-commit enforcement
4. Run `npx prettier --write .` once to normalize all files (single formatting commit)
5. Add format check to CI pipeline

---

## Issue 4: README references `@dnd-kit` but it is not installed

**Title:** `[Health] README tech stack lists @dnd-kit but the package is not installed`

**Labels:** `documentation`, `health`, `priority:low`

**Body:**

### Problem
The README's tech stack section lists:
> - [@dnd-kit](https://dndkit.com) for drag-and-drop interactions

However, `@dnd-kit` is **not** in `package.json` (neither dependencies nor devDependencies). The VeilPiercingWall component implements drag-and-drop using native HTML5 drag events, not @dnd-kit.

### Risk
- Misleads contributors about the tech stack
- Contributors may try to import `@dnd-kit` and encounter confusing errors

### Suggested Action
Remove the `@dnd-kit` line from the README tech stack section, or replace it with a note about native HTML5 drag-and-drop.

---

## Issue 5: Main JS bundle exceeds 500 kB (code-splitting opportunity)

**Title:** `[Health] Main bundle is 701 kB — add route-based code splitting`

**Labels:** `performance`, `health`, `priority:medium`

**Body:**

### Problem
The production build emits a single `index-*.js` bundle of **701 kB** (176 kB gzipped). Vite warns:
> Some chunks are larger than 500 kB after minification. Consider using dynamic import() to code-split.

All 16 chapter modules (~15K LOC) are bundled together even though users only visit one chapter at a time.

### Risk
- Slow initial load on mobile/low-bandwidth connections (the primary audience is law students)
- Wastes bandwidth — users download all 16 chapters even if they only visit one
- Bundle will grow as more chapters and toolkit components are added

### Suggested Action
1. Convert chapter module imports in `App.jsx` to `React.lazy()` + `Suspense`
2. Each `src/modules/ch**/index.jsx` becomes a separate chunk loaded on navigation
3. Expected improvement: initial bundle drops to ~200 kB; each chapter loads ~30–60 kB on demand
4. Add a loading spinner/skeleton as the Suspense fallback

---

## Issue 6: No accessibility (a11y) testing or ARIA audit

**Title:** `[Health] Add accessibility audit and ARIA improvements`

**Labels:** `accessibility`, `health`, `priority:medium`

**Body:**

### Problem
The application has no accessibility testing (axe-core, pa11y, Lighthouse CI), and interactive toolkit components (FiduciarySlider, AuthorityMatrix, VeilPiercingWall, MadLibsHolding) appear to lack ARIA labels, keyboard navigation, and screen reader support.

As an **educational application** used by law students (potentially with disabilities), accessibility compliance is both a legal and ethical requirement.

### Risk
- Inaccessible interactive components exclude students with disabilities
- Potential legal exposure under ADA / Section 508 for educational tools
- Poor Lighthouse accessibility scores reduce discoverability

### Suggested Action
1. Run `npx lighthouse` or `axe-core` audit on the built site
2. Add `aria-label`, `role`, and keyboard event handlers to all toolkit components
3. Ensure color contrast meets WCAG 2.1 AA (the neon-on-dark theme may fail)
4. Add an ESLint a11y plugin (`eslint-plugin-jsx-a11y`) to catch issues at lint time
5. Consider adding Lighthouse CI to the GitHub Actions workflow
