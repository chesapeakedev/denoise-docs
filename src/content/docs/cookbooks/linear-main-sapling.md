---
title: Maintain linear main with Sapling
description: Rebase and push a linear Sapling stack to main with dn, then verify and deploy the exact commit through one hardened CI/CD workflow.
---

This cookbook is for teams that intentionally push reviewed local commits
directly to `main`. Sapling keeps the local stack linear, `dn` validates and
publishes it, and one `.github/workflows/cicd.yaml` verifies the pushed commit
before deployment.

Direct-to-main publication removes the pull request as a safety boundary. Use
this model only when the repository has a small trusted push group, fast
recovery, and a protected production environment.

## 1. Define the repository contract

Keep the developer and CI entry points in the repository instead of embedding
tool-specific commands throughout the workflow:

| Command                         | Contract                                                                |
| ------------------------------- | ----------------------------------------------------------------------- |
| `make lint`                     | Fast local gate run automatically by `dn sync`                          |
| `make ci`                       | Clean, deterministic lint, type, unit, integration, and security checks |
| `make build`                    | Produce the deployable artifact in `dist/`                              |
| `make deploy ARTIFACT_DIR=dist` | Deploy the supplied artifact without rebuilding it                      |

`make ci` must fail on any result that should prevent deployment. Keep
deployment out of `make ci` and keep compilation out of `make deploy`; the
pipeline should build once and deploy that exact output.

Pin application dependencies and toolchain versions in the repository. The
workflow below also pins third-party GitHub Actions to full commit SHAs.

## 2. Prepare a Sapling checkout

Install [Sapling](https://sapling-scm.com/docs/introduction/installation) and
clone or convert the repository so its root contains `.sl` metadata. Merely
installing `sl` in a Git checkout does not make `dn sync` select Sapling.

Confirm the checkout and remote:

```bash
sl root
sl paths
sl status
```

Configure remote authentication before using `dn sync`. `dn` uses Sapling's
remote credentials for fetch and push; `dn auth` and `gh auth` do not replace
them.

## 3. Complete and review work locally

Use a local publish mode so no command pushes before you inspect the result:

```bash
dn kickstart --publish none 123
dn until run .github/dn/gambit.json
dn land --issue-testplan plans/issue-123.plan.md
```

Configure the `dn until` verifier to run the same `make ci` command used by the
pipeline:

```json
{
  "gambits": [
    {
      "name": "main-ready",
      "metadata": {
        "goal": "Complete issue 123 and leave the repository ready for main"
      },
      "generator": {
        "prompt": "Finish {{goal}}. Resolve verifier failures without expanding scope."
      },
      "verifier": {
        "script": "make ci"
      }
    }
  ],
  "iterations": 5,
  "timeout_ms": 3600000
}
```

Review the resulting stack before publication:

```bash
sl status
sl diff
sl log -r 'draft()'
```

Each commit should be independently understandable. Fold fixup commits before
publication, but do not rewrite commits after they reach shared `main`.

## 4. Rebase and push with dn

Publish only after the local diff, commit stack, and `make ci` result are
acceptable:

```bash
dn sync
```

For a Sapling checkout, `dn sync`:

1. Runs `make lint`.
2. Runs `sl pull --rebase -d main`.
3. Runs `sl restack` when obsolete descendants need restacking.
4. Runs `sl push --to main` only when draft commits remain on the main-line
   stack.

This rebase-before-push path avoids merge commits. If another developer updates
`main` first, review the rebased stack and rerun `dn sync`. Never force-push
shared `main`.

`dn kickstart --publish direct` can also commit and push to the default branch.
Prefer the explicit local `kickstart` → `until` → `land` → `dn sync` sequence
when direct publication requires a human review boundary.

## 5. Add one hardened CI/CD workflow

Define build, verification, artifact transfer, and deployment in one
`.github/workflows/cicd.yaml`. A separate deployment workflow can accidentally
rebuild different source or deploy without inheriting the verification result.

Use this baseline and adapt only the repository-owned `make` targets:

```yaml
name: CI/CD

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: cicd-${{ github.ref }}
  cancel-in-progress: false

env:
  CI: "true"

jobs:
  verify:
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    steps:
      - name: Check out the triggering commit
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.sha }}
          persist-credentials: false

      - name: Run the complete CI gate
        run: make ci

      - name: Build once
        run: make build

      - name: Store the artifact for this commit
        uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
        with:
          name: app-${{ github.sha }}
          path: dist/
          if-no-files-found: error
          retention-days: 7

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: verify
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    environment: production
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Check out the verified commit
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.sha }}
          persist-credentials: false

      - name: Download the verified artifact
        uses: actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c # v8.0.1
        with:
          name: app-${{ github.sha }}
          path: dist/

      - name: Confirm artifact and source identity
        run: |
          test "$(git rev-parse HEAD)" = "$GITHUB_SHA"
          test -d dist
          test -n "$(find dist -type f -print -quit)"

      - name: Deploy the verified artifact
        run: make deploy ARTIFACT_DIR=dist
```

The `deploy` job cannot start unless `verify` succeeds. Both jobs use
`github.sha`, and the artifact name includes that SHA, so deployment consumes
the build produced from the pushed `main` commit instead of rebuilding mutable
source.

## 6. Protect the deployment boundary

Complete the repository-specific hardening before relying on the pipeline:

- Restrict direct pushes to `main` to the trusted release group.
- Protect the `production` environment with required reviewers when a manual
  release decision is appropriate.
- Prefer short-lived OIDC credentials in the `deploy` job. Keep static cloud
  credentials out of repository and workflow files.
- Allow deployment credentials only in the `deploy` job; verification of pull
  requests should not receive them.
- Keep `permissions` read-only by default and add the narrowest job-level
  permission required by the deployment provider.
- Use Dependabot or another reviewed process to update pinned action SHAs.
- Configure deployment health checks and a rollback command for the last known
  good artifact.

After `dn sync`, follow the run for the pushed commit:

```bash
gh run list --workflow cicd.yaml --branch main
gh run watch
```

Treat a green `verify` job as evidence for only that commit. If a later push
fails, fix it with a new Sapling commit and rerun `dn sync`; do not rewrite the
published history.
