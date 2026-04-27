---
title: GitHub Actions
description: Run kickstart in CI — workflow triggers, setup, and self-hosted runners.
---

Kickstart can be run in GitHub Actions to process issues and create pull
requests. Two workflows are typically available in the repository:

- **`kickstart-opencode.yml`** — Uses the opencode agent harness
- **`kickstart-cursor.yml`** — Uses the Cursor CLI agent harness

## Workflow triggers

Both workflows support:

- **`workflow_dispatch`** — Manual run with an `issue_url` input
- **`issues.labeled`** — Runs when an issue is labeled with a workflow-specific
  label: **`cursor awp`** for the Cursor workflow, **`opencode awp`** for the
  opencode workflow

## Required setup

1. **Dependencies** — Workflows install:
   - Deno (e.g. `denoland/setup-deno@v1`)
   - opencode (for opencode workflow)
   - Cursor CLI (for Cursor workflow)

2. **Environment variables**
   - `GITHUB_TOKEN` — Usually set to `${{ secrets.GITHUB_TOKEN }}`
   - `CURSOR_API_KEY` — Required for the Cursor workflow (add to repository
     secrets)

3. **Permissions** — Workflows need:
   - `contents: write` (commits)
   - `pull-requests: write` (PR creation)
   - `issues: write` (commenting)

4. **PR creation permission** — Enable in repository settings:
   - Go to **Settings** → **Actions** → **General**
   - Scroll to **Workflow permissions**
   - Enable **Allow GitHub Actions to create and approve pull requests**

## Example usage

**Manual trigger (workflow_dispatch):**

1. Go to Actions → Kickstart (opencode) or Kickstart (Cursor)
2. Click "Run workflow"
3. Enter the issue URL or issue number (when the workflow runs in the same repo,
   a number is sufficient)
4. Click "Run workflow"

**Issue label trigger:** Add **`cursor awp`** to run the Cursor workflow, or
**`opencode awp`** to run the opencode workflow. The triggered workflow will
extract the issue URL, run kickstart in AWP mode, create a PR, and comment on
the issue with results.

## Workflow output

After execution, the workflow posts a comment on the issue with:

- Execution timestamp
- Trigger source (workflow_dispatch or issue_label)
- Status (success/failure)
- PR link (if created)
- Error details (if failed)

## Branch naming

Kickstart creates branches with a `kickstart/` prefix:

```
kickstart/issue_123_add-new-feature
```

This prefix identifies auto-generated branches where force push is expected
behavior. When retrying a failed workflow (e.g., after fixing PR permission
issues), kickstart uses `--force-with-lease` to safely overwrite the existing
branch.

## Self-hosted runners

For running kickstart on your own runners (e.g. Ubuntu), see
[Self-hosted runners](/operations/self-hosted-runners/) for setup, dependencies
(Deno, opencode, Cursor CLI, Git), and environment variables.

## Example workflow snippet

```yaml
- name: Run kickstart
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    cd dn
    deno run --allow-all cli/main.ts kickstart --awp "${{ github.event.inputs.issue_url }}"
```
