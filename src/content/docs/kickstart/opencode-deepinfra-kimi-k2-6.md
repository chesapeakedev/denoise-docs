---
title: OpenCode with DeepInfra Kimi K2.6
description: Configure Kimi K2.6 via DeepInfra for opencode in installed dn GitHub Actions workflows.
---

Use [DeepInfra](https://deepinfra.com/moonshotai/Kimi-K2.6) to run
[moonshotai/Kimi-K2.6](https://deepinfra.com/moonshotai/Kimi-K2.6/api) through OpenCode in
**installed dn GitHub Actions workflows**. DeepInfra exposes an
[OpenAI-compatible Chat Completions API](https://deepinfra.com/moonshotai/Kimi-K2.6/api);
OpenCode calls it via a custom provider block in your repo's `opencode*.json` files.

General workflow installation and dispatch reference:
[GitHub workflow integration](/kickstart/github-actions-integration/).

## Overview

```text
repository_dispatch / Denoise UI
        │
        ▼
dn-kickstart-issue.yml (or prep / init-stack)
        │
        ├── chesapeakedev/dn-action  →  dn CLI
        ├── install-agent.sh         →  OpenCode CLI
        └── OPENAI_API_KEY secret    →  DeepInfra API token (via opencode config)
                │
                ▼
        opencode.plan.json / opencode.implement.json
        (model: deepinfra/moonshotai/Kimi-K2.6)
                │
                ▼
        https://api.deepinfra.com/v1/openai/chat/completions
```

Canonical dn workflows already export `OPENAI_API_KEY` to the job environment.
Store your **DeepInfra API token** in the `OPENAI_API_KEY` repository secret so
you do not need to fork workflow YAML.

## Prerequisites

1. **DeepInfra account and API token**
   - Create an account at the [DeepInfra dashboard](https://deepinfra.com/dash).
   - Generate an API token (used as `Authorization: Bearer …` on API requests).
   - Model page and API reference:
     [moonshotai/Kimi-K2.6](https://deepinfra.com/moonshotai/Kimi-K2.6/api).

2. **Installed dn workflows** with `opencode` as the agent:

   ```bash
   dn init workflows --agent opencode
   gh secret set OPENAI_API_KEY   # paste your DeepInfra token when prompted
   ```

   Commit `.github/dn/config.json`, `.github/dn/install-agent.sh`, and the three
   workflow files. Confirm with `dn workflows validate --json`.

3. **OpenCode phase configs** in the repository root (see
   [Configuration](/kickstart/configuration/)). Both plan and implement configs
   need the model and provider settings below.

## Step 1 — Configure OpenCode for DeepInfra

Add a DeepInfra provider and select Kimi K2.6 in **`opencode.plan.json`** and
**`opencode.implement.json`**. Kickstart copies the active phase file to
`opencode.json` during each phase, so settings must live in both files.

Shared provider block (merge with your existing `permission` sections):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepinfra/moonshotai/Kimi-K2.6",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.6": {
          "name": "Kimi K2.6",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
      }
    }
  }
}
```

Example **`opencode.plan.json`** (plan phase — restricted edits):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepinfra/moonshotai/Kimi-K2.6",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.6": {
          "name": "Kimi K2.6",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
      }
    }
  },
  "permission": {
    "edit": {
      "*": "deny",
      "/tmp/**": "allow",
      "plans/**/*.plan.md": "allow",
      "plans/*.plan.md": "allow",
      "**/*.plan.md": "allow"
    },
    "bash": { "*": "allow" },
    "external_directory": "allow"
  }
}
```

Example **`opencode.implement.json`** (implement phase — allow workspace edits):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepinfra/moonshotai/Kimi-K2.6",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.6": {
          "name": "Kimi K2.6",
          "limit": {
            "context": 262144,
            "output": 32768
          }
        }
      }
    }
  },
  "permission": {
    "edit": { "*": "allow", "/tmp/**": "allow" },
    "bash": { "*": "allow" },
    "external_directory": "allow"
  }
}
```

Optional: mirror the same `model` and `provider` in root **`opencode.json`** for
local `dn kickstart` runs.

### Why `OPENAI_API_KEY`?

Installed dn workflows pass `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}` to
every agent step. Mapping `{env:OPENAI_API_KEY}` in OpenCode config reuses that
secret name for the DeepInfra token — no workflow edits required.

If you prefer a dedicated secret (for example `DEEPINFRA_TOKEN`), add it to the
workflow `env` block and change the config to `"apiKey": "{env:DEEPINFRA_TOKEN}"`.

## Step 2 — Store the DeepInfra token

```bash
gh secret set OPENAI_API_KEY --repo owner/repo
# Paste the token from https://deepinfra.com/dash when prompted
```

Verify:

```bash
dn workflows validate --json
```

With `opencode`, secret validation is best-effort; confirm the secret exists in
**Settings → Secrets and variables → Actions**.

## Step 3 — Verify locally (recommended)

Before relying on CI, confirm OpenCode reaches DeepInfra from your machine:

```bash
export OPENAI_API_KEY="your-deepinfra-token"
opencode run "Reply with exactly: ok"
```

Or run a plan-only kickstart:

```bash
export OPENAI_API_KEY="your-deepinfra-token"
export GITHUB_TOKEN="$(gh auth token)"
dn prep https://github.com/owner/repo/issues/42
```

Fix provider or auth errors locally before dispatching workflows.

## Step 4 — Run in GitHub Actions

### Dispatch from the CLI

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_url":"https://github.com/owner/repo/issues/42","awp":true}' \
  | dn workflows run dn.kickstart_issue --repo owner/repo --json --wait
```

### Dispatch from Denoise

Link the repository milestone in Denoise and trigger kickstart from the UI. The
backend sends the same `dn.kickstart_issue` payload shape.

### What the workflow does

1. Checks out the repo (including your `opencode*.json` configs).
2. Installs `dn` and OpenCode (`.github/dn/install-agent.sh`).
3. Runs `dn --agent opencode kickstart --awp <issue>` with `OPENAI_API_KEY` set.
4. OpenCode plan phase uses `opencode.plan.json`; implement phase uses
   `opencode.implement.json`.

Monitor the run:

```bash
gh run list --repo owner/repo --event repository_dispatch
gh run view <run-id> --log
```

## API reference (DeepInfra)

| Item | Value |
| ---- | ----- |
| Model ID | `moonshotai/Kimi-K2.6` |
| Endpoint | `POST https://api.deepinfra.com/v1/openai/chat/completions` |
| Auth header | `Authorization: Bearer <token>` |
| Context | 262,144 tokens (per DeepInfra model page) |
| Pricing | Listed on [DeepInfra model page](https://deepinfra.com/moonshotai/Kimi-K2.6) |

Minimal curl check:

```bash
curl "https://api.deepinfra.com/v1/openai/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "moonshotai/Kimi-K2.6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| `401` / unauthorized from OpenCode | Missing or wrong token | Re-set `OPENAI_API_KEY` with the DeepInfra dashboard token |
| Model not found | Wrong model string | Use `deepinfra/moonshotai/Kimi-K2.6` in config and `moonshotai/Kimi-K2.6` under `models` |
| Works locally, fails in CI | Phase config missing provider | Add provider block to **both** `opencode.plan.json` and `opencode.implement.json` |
| OpenCode uses wrong model | Stale root `opencode.json` | Align `model` across all opencode config files |
| Timeouts on long issues | Large context / slow inference | Check run logs; consider self-hosted runners for long jobs |

OpenCode also lists Deep Infra as a built-in provider (`/connect` in the TUI). That
path stores credentials interactively and is suited to local development. For
unattended CI, the explicit `provider` block with `{env:OPENAI_API_KEY}` above is
the supported approach.

## Related

- [GitHub workflow integration](/kickstart/github-actions-integration/) — templates, dispatch payloads, permissions
- [Configuration](/kickstart/configuration/) — OpenCode plan/implement files
- [Self-hosted runners](/operations/self-hosted-runners/) — longer-running kickstart jobs
