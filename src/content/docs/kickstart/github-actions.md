---
title: GitHub Actions
description: Install canonical dn workflows and run kickstart in CI.
---

`dn` can run in GitHub Actions to prepare plans, generate milestone stacks, or
implement issues and open pull requests. Start with canonical workflows
installed by `dn init workflows`; use legacy label workflows only for older
repositories.

| Guide                                                                         | When to use it                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [GitHub workflow integration](/kickstart/github-actions-integration/)         | Installed canonical workflows (`dn init workflows`), dispatch payloads, secrets, validation |
| [OpenCode with DeepInfra Kimi K2.6](/kickstart/opencode-deepinfra-kimi-k2-6/) | OpenCode + DeepInfra Kimi K2.6 in those workflows                                           |

## Quick setup (canonical workflows)

Install templates and pick an agent once per repository:

```bash
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY
# Commit .github/dn/config.json, .github/dn/install-agent.sh, and workflow YAML
dn workflows validate --json
```

Each workflow reads `.github/dn/config.json`, installs only that agent harness,
and runs `dn --agent <configured>`. Dispatch payloads do **not** include
`agent`.

Trigger kickstart:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows run dn.kickstart_issue --repo owner/repo --json --wait
```

See [GitHub workflow integration](/kickstart/github-actions-integration/) for
full payload schemas, permissions, and denoise integration.

## Legacy label workflows

Some repositories still ship standalone workflows (for example
`kickstart-opencode.yml` / `kickstart-cursor.yml`) that trigger on issue labels:

| Label          | Workflow           |
| -------------- | ------------------ |
| `opencode awp` | OpenCode kickstart |
| `cursor awp`   | Cursor kickstart   |

These workflows typically support:

- **`workflow_dispatch`** — manual run with an `issue_url` input
- **`issues.labeled`** — runs when the matching label is applied

### Required setup (legacy)

1. **Dependencies** — Deno, OpenCode and/or Cursor CLI (or use
   `chesapeakedev/dn-action@v1` for `dn` only)
2. **Secrets** — `GITHUB_TOKEN` (automatic), plus `OPENAI_API_KEY`,
   `CURSOR_API_KEY`, or `ANTHROPIC_API_KEY` depending on agent
3. **Permissions** — `contents: write`, `pull-requests: write`, `issues: write`
4. **PR creation** — Enable **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**

### Minimal modern workflow snippet

Prefer canonical templates when possible. If you write a workflow from scratch:

```yaml
name: Kickstart with dn

on:
  issues:
    types: [labeled]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  kickstart:
    if: github.event.label.name == 'opencode awp'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install dn
        uses: chesapeakedev/dn-action@v1

      - name: Install OpenCode
        run: bash .github/dn/install-agent.sh

      - name: Run dn kickstart
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          IS_OPEN_SOURCE: "true"
          NO_COLOR: "1"
        run: |
          dn --agent opencode kickstart --awp "${{ github.event.issue.html_url }}"
```

Pin the action version when you need reproducibility:

```yaml
- uses: chesapeakedev/dn-action@v1
  with:
    version: "1.2.3"
```

## Workflow output

After execution, integrations typically post a comment on the issue with status,
PR link, and error details. Branch names use the `kickstart/` prefix, for
example `kickstart/issue_123_add-new-feature`.

## Self-hosted runners

For running kickstart on your own hardware, see
[Self-hosted runners](/operations/self-hosted-runners/).
