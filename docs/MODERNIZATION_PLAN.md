# Modernization PR Plan

> **Repo:** Oranburg/BA
> **Created:** 2026-04-04
> **Strategy:** Small, safe PRs — quick wins first, then medium refactors.
> Each PR is self-contained and independently revertible.

---

## Phase 1: Quick Wins (Tooling & Docs)

Low risk, high value. No behavior changes — only infrastructure improvements.

### PR 1.1 — Fix README accuracy

| Field | Value |
|-------|-------|
| **Changes** | Remove `@dnd-kit` from tech stack; update any stale references |
| **Files** | `README.md` |
| **Risk** | None — documentation only |
| **Impact** | Prevents contributor confusion |
| **Rollback** | Revert single commit |
| **Estimate** | 5 minutes |

### PR 1.2 — Add Prettier + EditorConfig

| Field | Value |
|-------|-------|
| **Changes** | Add `.prettierrc`, `.editorconfig`, `npm run format` script; one-time format pass |
| **Files** | `.prettierrc`, `.editorconfig`, `package.json`, all `src/**/*.{js,jsx}` |
| **Risk** | Low — cosmetic changes only; large diff but no logic changes |
| **Impact** | Consistent formatting across all contributors |
| **Rollback** | `git revert` the format commit; remove config files |
| **Estimate** | 15 minutes |
| **Dependency** | None |

### PR 1.3 — Add lint + integrity checks to CI

| Field | Value |
|-------|-------|
| **Changes** | Add `npm run lint` and `npm run validate:integrity` steps to `deploy.yml` before build |
| **Files** | `.github/workflows/deploy.yml` |
| **Risk** | Low — if lint currently passes (it does), no deployment blocking |
| **Impact** | Prevents lint regressions from reaching production |
| **Rollback** | Remove the added steps from the workflow |
| **Estimate** | 10 minutes |
| **Dependency** | None |

### PR 1.4 — Add Husky + lint-staged pre-commit hooks

| Field | Value |
|-------|-------|
| **Changes** | Install Husky + lint-staged; run ESLint + Prettier on staged files before each commit |
| **Files** | `package.json`, `.husky/pre-commit`, `.lintstagedrc` |
| **Risk** | Low — developers can bypass with `--no-verify` if needed |
| **Impact** | Enforces quality at commit time; reduces CI failures |
| **Rollback** | `npm uninstall husky lint-staged`; delete `.husky/` |
| **Estimate** | 15 minutes |
| **Dependency** | PR 1.2 (Prettier) |

---

## Phase 2: Testing Foundation

Medium risk due to new dependencies — but no behavior changes to production code.

### PR 2.1 — Install Vitest + write smoke tests

| Field | Value |
|-------|-------|
| **Changes** | Install Vitest; add `npm run test` script; write 10–15 smoke tests for core utilities |
| **Files** | `package.json`, `vite.config.js` (test config), `src/**/*.test.js` (new files) |
| **Test targets** | `citationRegistry.js` (alias resolution), `resolver.js` (section lookup), `progress.js` (localStorage round-trip), `routes.js` (route constant integrity), `lifecycle.js` (module flow completeness) |
| **Risk** | Low — adds files only; no production code changes |
| **Impact** | Establishes test infrastructure; validates most critical subsystem (Tome) |
| **Rollback** | `npm uninstall vitest`; delete `*.test.js` files |
| **Estimate** | 1–2 hours |
| **Dependency** | None (but benefits from PR 1.3 for CI integration) |

### PR 2.2 — Add test job to CI workflow

| Field | Value |
|-------|-------|
| **Changes** | Add `npm run test` step to `deploy.yml` between lint and build |
| **Files** | `.github/workflows/deploy.yml` |
| **Risk** | Low — only blocks deploy if tests fail |
| **Impact** | Automated regression detection on every push to main |
| **Rollback** | Remove the test step from the workflow |
| **Estimate** | 5 minutes |
| **Dependency** | PR 2.1 (Vitest installed) |

### PR 2.3 — Add component render tests with @testing-library/react

| Field | Value |
|-------|-------|
| **Changes** | Install testing-library; write render tests for all 6 toolkit components + LandingPage |
| **Files** | `package.json`, `src/components/toolkit/*.test.jsx`, `src/pages/LandingPage.test.jsx` |
| **Risk** | Low — test files only; may need jsdom environment config |
| **Impact** | Catches render errors in interactive components before deploy |
| **Rollback** | Remove test files; uninstall testing-library |
| **Estimate** | 2–3 hours |
| **Dependency** | PR 2.1 |

---

## Phase 3: Performance & Code Quality

Medium risk — changes production behavior but improves UX.

### PR 3.1 — Route-based code splitting with React.lazy

| Field | Value |
|-------|-------|
| **Changes** | Convert 16 chapter imports in `App.jsx` to `React.lazy()` + `Suspense` |
| **Files** | `src/App.jsx` |
| **Risk** | Medium — changes loading behavior; users see a loading state briefly on navigation |
| **Impact** | Main bundle drops from 701 kB → ~200 kB; 70% faster initial load |
| **Rollback** | Revert to static imports (single commit revert) |
| **Estimate** | 30 minutes |
| **Dependency** | PR 2.3 (component tests catch regressions) |
| **Verification** | `npm run build` — check that chunk count increases; main bundle shrinks |

### PR 3.2 — Add ESLint a11y plugin

| Field | Value |
|-------|-------|
| **Changes** | Install `eslint-plugin-jsx-a11y`; add to ESLint config; fix critical a11y violations |
| **Files** | `eslint.config.js`, `package.json`, toolkit component files (ARIA attributes) |
| **Risk** | Medium — may surface many warnings; only fix critical errors initially |
| **Impact** | Accessibility compliance for educational tool; required by ADA/508 |
| **Rollback** | Remove plugin from ESLint config |
| **Estimate** | 1–2 hours |
| **Dependency** | PR 1.3 (lint in CI) |

### PR 3.3 — Add TypeScript types (JSDoc or .d.ts)

| Field | Value |
|-------|-------|
| **Changes** | Add JSDoc `@typedef` annotations or `.d.ts` files for core data structures (Tome sections, course progress, manifests) |
| **Files** | `src/tome/*.js`, `src/learning/progress.js`, `src/data/manifests/*.json` |
| **Risk** | Low — annotations only; no runtime changes |
| **Impact** | IDE autocomplete + documentation for contributors; catches type errors |
| **Rollback** | Remove JSDoc comments or `.d.ts` files |
| **Estimate** | 2–3 hours |
| **Dependency** | None |

---

## Phase 4: Medium Refactors

Higher risk — structural changes that improve maintainability.

### PR 4.1 — Extract shared module framework

| Field | Value |
|-------|-------|
| **Changes** | Extract common phase management pattern from 16 chapter modules into a shared `useModulePhases` hook + `ModuleShell` component |
| **Files** | New: `src/modules/shared/useModulePhases.js`, `src/modules/shared/ModuleShell.jsx`; Modified: 2–3 pilot chapter modules |
| **Risk** | Medium-high — changes module rendering behavior; start with 2–3 chapters |
| **Impact** | Reduces ~300 lines of duplicated phase-management boilerplate per module |
| **Rollback** | Revert to inline phase logic in affected modules |
| **Estimate** | 3–4 hours |
| **Dependency** | PR 2.3 (component tests for affected modules) |

### PR 4.2 — Add Storybook for toolkit components

| Field | Value |
|-------|-------|
| **Changes** | Install Storybook; create stories for all 6 toolkit components |
| **Files** | `.storybook/`, `src/components/toolkit/*.stories.jsx` |
| **Risk** | Low — additive only; no production code changes |
| **Impact** | Visual component development + documentation; easier contributor onboarding |
| **Rollback** | Remove `.storybook/` and `*.stories.jsx` files |
| **Estimate** | 2–3 hours |
| **Dependency** | None |

### PR 4.3 — Separate CI workflow for PRs

| Field | Value |
|-------|-------|
| **Changes** | Create `.github/workflows/ci.yml` — runs lint + test + build on PRs (no deploy) |
| **Files** | `.github/workflows/ci.yml` |
| **Risk** | Low — additive; does not change deploy workflow |
| **Impact** | PR authors get feedback before merge; reduces broken-main incidents |
| **Rollback** | Delete the workflow file |
| **Estimate** | 15 minutes |
| **Dependency** | PR 2.2 (test job exists) |

---

## Execution Order (Recommended Sequence)

```
Week 1 — Quick Wins (no risk)
  PR 1.1  Fix README accuracy
  PR 1.2  Add Prettier + EditorConfig
  PR 1.3  Add lint/integrity to CI
  PR 1.4  Add Husky + lint-staged

Week 2 — Testing Foundation
  PR 2.1  Install Vitest + smoke tests
  PR 2.2  Add test job to CI
  PR 2.3  Component render tests

Week 3 — Performance & Quality
  PR 3.1  Route-based code splitting
  PR 3.2  ESLint a11y plugin
  PR 3.3  TypeScript types (JSDoc)

Week 4 — Medium Refactors
  PR 4.1  Extract shared module framework
  PR 4.2  Add Storybook
  PR 4.3  Separate CI workflow for PRs
```

---

## Risk Summary

| PR | Risk | Reversible? | Blocks Deploy? |
|----|------|-------------|----------------|
| 1.1 | None | ✅ Instant | No |
| 1.2 | Low | ✅ Instant | No |
| 1.3 | Low | ✅ Instant | Only if lint fails |
| 1.4 | Low | ✅ Instant | No (local only) |
| 2.1 | Low | ✅ Instant | No |
| 2.2 | Low | ✅ Instant | Only if tests fail |
| 2.3 | Low | ✅ Instant | No |
| 3.1 | Medium | ✅ Single revert | No |
| 3.2 | Medium | ✅ Config revert | Only if a11y lint fails |
| 3.3 | Low | ✅ Instant | No |
| 4.1 | Medium-High | ⚠️ Multi-file revert | No |
| 4.2 | Low | ✅ Instant | No |
| 4.3 | Low | ✅ Instant | No |

---

## Rollback Strategy

Every PR follows this rollback protocol:

1. **Revert commit:** `git revert <merge-commit-sha>` — creates a clean revert PR
2. **Verify:** CI must pass on the revert PR before merging
3. **Deploy:** Revert auto-deploys to GitHub Pages on merge to main
4. **Post-mortem:** Document what broke and why in the reverted PR's comments

For the highest-risk PR (4.1 — shared module framework):
- Pilot with only 2–3 modules; leave the rest untouched
- If the pilot fails, only those modules need reverting
- Full rollout only after pilot is stable for 1 week
