---
name: astro-starlight-playwright-guardrails
description: >-
  Guard Astro/Starlight documentation sites with build checks plus Playwright E2E.
  Use when adding or changing docs, sidebar entries in astro.config.mjs, internal
  markdown links, Playwright tests, or when npm run build fails with missing slug,
  404, or Starlight sidebar errors.
---

# Astro/Starlight docs guardrails (build + Playwright)

Use **two layers**. Playwright alone does not replace `npm run build`.

| Layer              | Catches                                                                            | When it runs                                     |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Build gate**     | Missing sidebar slugs, invalid Starlight config, broken content collection         | `npm run build` (fail fast in CI before E2E)     |
| **Playwright E2E** | Broken nav after build, bad internal links in rendered HTML, custom UI regressions | After a successful build, against preview server |

## When the agent should add or update guardrails

Apply this skill when you:

- Add or rename files under `src/content/docs/`
- Edit `sidebar` in `astro.config.mjs`
- Add internal links in `.md` / `.mdx` (e.g. `/kickstart/some-page/`)
- Scaffold Playwright or fix flaky doc-site tests
- See errors like:
  `The slug "…" specified in the Starlight sidebar config does not exist`

**Do not assume Playwright will catch build-time slug errors** — the static
build fails before any browser test runs.

## Layer 1: Build gate

1. Run `npm run build` after sidebar or content changes (or wire it as a
   Playwright `globalSetup` prerequisite).
2. Run sidebar slug validation before or with build:

```bash
node .cursor/skills/astro-starlight-playwright-guardrails/scripts/validate-sidebar-slugs.mjs
```

Copy that script into `scripts/` at repo root when the project adopts guardrails
permanently.

3. In CI, order jobs: **validate slugs → build → playwright**. Do not skip
   build.

### Typical build failure (sidebar slug)

```
[AstroUserError] The slug "kickstart/opencode-deepinfra-kimi-k2.6" specified in the Starlight sidebar config does not exist.
```

**Common cause:** A markdown file exists but its **collection id** differs from
the sidebar `slug`. Default `docsLoader()` slugifies each path segment
(`github-slugger`). Example: `kimi-k2.6.md` → id
`kickstart/opencode-deepinfra-kimi-k26`, not `…-kimi-k2.6`.

**Fix (pick one):**

1. Set sidebar `slug` to the real collection id (validator prints it).
2. Rename the file to avoid dots (e.g. `kimi-k2-6.md`).
3. Customize `generateId` in `content.config.ts` to preserve dots
   ([Starlight 0.35](https://starlight.astro.build/reference/configuration/#configure-content-collections)).

Also update internal links in other docs to match the final URL.

## Layer 2: Playwright E2E

Test the **built** site the same way production serves it (not only
`astro dev`).

### denoise-docs defaults

- Build: `npm run build` → `dist/`
- Preview: `npm run preview` (Deno `src/app/serve.ts`, port **4321**)
- `playwright.config.ts`: `baseURL: 'http://localhost:4321'`,
  `webServer.command: 'npm run build && npm run preview'`

### Tests to add or extend when docs change

| Test                    | Purpose                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Sidebar slug crawl**  | For each `slug` in `astro.config.mjs`, `page.goto('/{slug}/')` → expect 200 and visible `h1`  |
| **Internal link crawl** | On each doc page, collect same-origin `a[href^="/"]`, visit each → no 404, no console `error` |
| **Splash / CTAs**       | Home hero links resolve                                                                       |
| **Custom components**   | Theme toggle, footer links (project-specific)                                                 |

Prefer `getByRole` / `getByLabel`. Avoid brittle CSS-only selectors unless no
alternative.

### Example: sidebar pages load (add slugs here when sidebar grows)

```typescript
import { expect, test } from "@playwright/test";

const SIDEBAR_SLUGS = [
  "introduction",
  "denoise/getting-started",
  // … keep in sync with astro.config.mjs or generate from validate script output
];

for (const slug of SIDEBAR_SLUGS) {
  test(`sidebar page loads: ${slug}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    const res = await page.goto(`/${slug}/`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors, `console errors on /${slug}/`).toEqual([]);
  });
}
```

### Example: internal markdown links (catches stale cross-links)

Stale links in markdown **pass** sidebar validation but **fail** at runtime.
Crawl rendered pages:

```typescript
test("internal doc links resolve", async ({ page, request }) => {
  await page.goto("/introduction/");
  const hrefs = await page.locator('main a[href^="/"]').evaluateAll((
    els,
  ) => [
    ...new Set(els.map((a) => (a as HTMLAnchorElement).getAttribute("href")!)),
  ]);
  for (const href of hrefs) {
    if (href.startsWith("//") || href.includes("#")) continue;
    const res = await request.get(href);
    expect(res.status(), href).toBeLessThan(400);
  }
});
```

## Agent workflow checklist

Copy and track when editing docs:

```
- [ ] Content file exists: src/content/docs/<slug>.md(x)
- [ ] astro.config.mjs sidebar slug matches filename (no .md extension in slug)
- [ ] Internal links updated in other docs
- [ ] node scripts/validate-sidebar-slugs.mjs (or skill script)
- [ ] npm run build
- [ ] npm run test:e2e (after Playwright is installed)
```

When implementing Playwright from scratch, follow the repo plan in
`plans/playwright-e2e.plan.md` or GitHub issue #2 if present.

## package.json scripts (target state)

```json
{
  "scripts": {
    "validate:docs": "node scripts/validate-sidebar-slugs.mjs",
    "test:e2e": "playwright test",
    "test:docs": "npm run validate:docs && npm run build && npm run test:e2e"
  }
}
```

## What Playwright does not cover

- TypeScript/Deno lint (`make lint`) — keep separate
- Missing content at build time — use build + validate script
- Deno Deploy edge config — test `dist/` locally only

## Additional resources

- Script:
  [scripts/validate-sidebar-slugs.mjs](scripts/validate-sidebar-slugs.mjs)
- Examples: [examples.md](examples.md)
