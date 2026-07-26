# Add Playwright E2E tests for the Astro/Starlight docs site

## Overview

Introduce Playwright end-to-end tests for **denoise-docs** (Astro 5 + Starlight,
static output, Deno file server in `src/app/serve.ts`). Tests should guard
navigation, custom UI (theme toggle, footer), and representative doc pages. Wire
tests into local dev workflow and CI.

## Research: Do OSS projects use Playwright for Astro sites?

Yes — Playwright is a common choice for Astro/Starlight documentation sites.

| Source                                                                                                               | Pattern                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Astro Testing guide](https://docs.astro.build/en/guides/testing/)                                                   | Official recommendation: `npm init playwright@latest`, `webServer` runs `npm run preview`, `baseURL` `http://localhost:4321`, script `test:e2e`                                                                                                      |
| [withastro/starlight](https://github.com/withastro/starlight)                                                        | Package-level `playwright.config.ts`, tests in `packages/starlight/__e2e__/*.test.ts`, 40s timeout, Chrome with `channel: 'chrome'` on CI; [PR #2075](https://github.com/withastro/starlight/pull/2075) disables Pagefind/telemetry in E2E for speed |
| [slint-ui/slint](https://github.com/slint-ui/slint) (`docs/astro/playwright.config.ts`)                              | Starlight docs reuse shared `starlightPlaywrightSharedOptions` / `starlightPlaywrightProjects` helpers                                                                                                                                               |
| [learn-ukrainian/learn-ukrainian.github.io](https://github.com/learn-ukrainian/learn-ukrainian.github.io/issues/655) | Starlight migration issue documents Playwright E2E for interactive MDX components + smoke tests                                                                                                                                                      |

**Conclusion:** Playwright is well-established for Astro/Starlight. This repo
should follow the Astro docs pattern (`build` + preview server) but point
`webServer` at our **production-like** server (`deno run -A src/app/serve.ts` on
port 4321), not `astro dev`, since deploy and local preview both serve `dist/`
via Deno.

## Issue Context

- **Repository:** chesapeakedev/denoise-docs
- **Stack:** Astro 5, `@astrojs/starlight`, static `output`, custom
  `ThemeProvider` / `ThemeSelect` / `Footer`
- **Serving:** `npm run build` → `dist/`; `npm run preview` / Deno `serve.ts`
  (SPA fallback for 404 → `index.html`, favicon cache headers)
- **Existing checks:** `Makefile` `lint` / `fmt_check` cover Deno server only —
  no browser tests today
- **No `.github/workflows`** in this repo yet — CI workflow is part of this work
  (or parent monorepo; confirm where PR checks should live)

## Implementation Plan

### 1. Install and scaffold Playwright

- Run `npm init playwright@latest` (TypeScript, `e2e/` test dir, optional GH
  Actions template as starting point).
- Add devDependencies: `@playwright/test`.
- Add `package.json` scripts:
  - `test:e2e` — `playwright test`
  - `test:e2e:ui` — `playwright test --ui` (optional, for local debugging)

### 2. Configure `playwright.config.ts`

- `testDir`: `./e2e`
- `use.baseURL`: `http://localhost:4321`
- `webServer`:
  - **CI:** `command: 'npm run build && npm run preview'`,
    `reuseExistingServer: false`
  - **Local:** same command or split; `reuseExistingServer: !process.env.CI`
  - `url`: `http://localhost:4321/`, `timeout`: 120_000 (Starlight/Astro builds
    can be slow on Windows)
- **Projects:** start with **Chromium only** in CI (match Starlight’s pragmatic
  default); add Firefox/WebKit later if needed.
- `forbidOnly: !!process.env.CI`, `retries` on CI (1–2),
  `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`.
- Consider `timeout: 40_000` per test (Starlight uses 40s for fixture + serve).

### 3. Initial test suite (high value, low flake)

| Area                   | Tests                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home / splash**      | `/` loads; hero value blurb visible; primary CTA → `/dn-cli/installation/`; secondary → `/denoise/getting-started/`; segment deep links resolve                                                                                         |
| **Sidebar navigation** | Open a page from each sidebar group (Introduction, Denoise, dn CLI, Kickstart, Operations) — assert `h1` or unique heading                                            |
| **Theme switcher**     | Custom `ThemeSelect`: click light/dark; assert `document.documentElement.dataset.theme` and `aria-pressed` on buttons; optional reload persistence via `localStorage` |
| **Footer**             | Chesapeake footer bar visible; external Website/About links have `target="_blank"` and `rel="noopener noreferrer"`                                                    |
| **Static assets**      | `GET /favicon.svg` returns 200                                                                                                                                        |
| **SPA fallback**       | Unknown path serves app shell (200 with Starlight content) per Deno handler — smoke only, not full client-router depth                                                |
| **Smoke**              | No console `error` on homepage (filter known benign warnings if any)                                                                                                  |

Use role- and text-based locators (`getByRole`, `getByLabel`) for
accessibility-aligned selectors.

### 4. CI integration

- Add `.github/workflows/playwright.yml` (or extend parent repo CI if checks run
  from monorepo root):
  - `checkout`, `setup-node`, `npm ci`
  - `npx playwright install --with-deps` (do not cache browsers per Playwright
    CI guidance)
  - `npm run build` then `npx playwright test`
  - Upload `playwright-report` artifact on failure
- Optional: run E2E only on `paths` filters for `src/`, `astro.config.mjs`,
  `public/`, `e2e/`, `playwright.config.ts` (Starlight discussion: skip E2E on
  unrelated PRs).

### 5. Developer docs and Makefile

- Short section in `README.md`: install browsers, run
  `npm run build && npm run test:e2e`.
- Optional `make test_e2e` target delegating to npm script.
- Document that E2E requires a built `dist/` (same as deploy).

### 6. Out of scope (follow-ups)

- Visual regression / Percy
- Pagefind search assertions (enable only if search is configured and stable in
  CI)
- Multi-browser matrix in CI
- Testing Deno Deploy edge behavior (test served static bundle locally)

## Acceptance Criteria

- [ ] `@playwright/test` installed; `playwright.config.ts` serves built site on
      port 4321 via `npm run preview` (Deno)
- [ ] `e2e/` contains smoke + navigation + theme + footer tests described above
- [ ] `npm run test:e2e` passes locally after `npm run build`
- [ ] GitHub Actions workflow runs Playwright on PR/push to default branch
- [ ] README documents how to run E2E tests
- [ ] No flaky failures in three consecutive local runs

## Code Pointers

| File / area                        | Notes                                                |
| ---------------------------------- | ---------------------------------------------------- |
| `package.json`                     | Add scripts and devDependency                        |
| `playwright.config.ts`             | New — webServer + baseURL                            |
| `e2e/*.spec.ts`                    | New test files                                       |
| `src/app/serve.ts`                 | Port 4321, SPA fallback — must match `baseURL`       |
| `astro.config.mjs`                 | Sidebar slugs define navigation targets              |
| `src/components/ThemeSelect.astro` | `data-mode`, `aria-pressed`, `localStorage('theme')` |
| `src/components/Footer.astro`      | `.site-footer-*` selectors                           |
| `src/content/docs/index.mdx`       | Splash hero copy for assertions                      |
| `.github/workflows/playwright.yml` | New CI job                                           |

## Notes

- **Implement with kickstart:** `dn kickstart <issue#>` or `dn prep <issue#>`
  then `dn loop --plan-file plans/playwright-e2e.plan.md`
- Prefer testing **built static output** (matches Deno Deploy and Raspberry Pi
  deploy path).
- Starlight may run Pagefind indexing at build time; if CI is slow, consider env
  flag or config to skip search index in E2E builds (see Starlight PR #2075).
