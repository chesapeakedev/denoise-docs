# Playwright guardrail examples

## CI job order

```yaml
- run: node scripts/validate-sidebar-slugs.mjs
- run: npm run build
- run: npx playwright install --with-deps
- run: npm run test:e2e
```

## playwright.config.ts (denoise-docs)

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 40_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4321/",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## Regenerating slug list for tests

After sidebar changes, run validation and mirror slugs in
`e2e/sidebar-slugs.ts`:

```bash
node .cursor/skills/astro-starlight-playwright-guardrails/scripts/validate-sidebar-slugs.mjs
# Then update SIDEBAR_SLUGS in e2e/sidebar-pages.spec.ts
```

Long term: export slugs from a small shared `scripts/list-sidebar-slugs.mjs`
used by both validator and test codegen.

## Failure: file exists but build still fails

```
The slug "kickstart/opencode-deepinfra-kimi-k2.6" specified in the Starlight sidebar config does not exist.
```

`src/content/docs/kickstart/opencode-deepinfra-kimi-k2.6.md` may exist.
Slugifier maps it to `kickstart/opencode-deepinfra-kimi-k26`.

```bash
node .cursor/skills/astro-starlight-playwright-guardrails/scripts/validate-sidebar-slugs.mjs
#   - sidebar: kickstart/opencode-deepinfra-kimi-k2.6
#     file on disk: src/content/docs/kickstart/opencode-deepinfra-kimi-k2.6.md
#     use sidebar slug: kickstart/opencode-deepinfra-kimi-k26
```

Playwright never runs until sidebar slugs and collection ids align. The validate
script catches this faster than a full `npm run build`.
