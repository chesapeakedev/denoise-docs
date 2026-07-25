---
title: Use dn with OpenCode
description: Install dn for OpenCode, configure its agent phases, and run locally or in GitHub Actions.
---

OpenCode is the default agent harness for `dn`. Use this guide to install the
`dn` skill for an interactive OpenCode session or configure provider and model
settings for local and unattended runs.

Agent-backed commands such as `kickstart`, `meld`, `loop`, `fixup`, and scoring
in `tidy` invoke OpenCode unless you pass `--agent` or select another harness in
`.github/dn/config.json`.

## Use dn from OpenCode

Install OpenCode, then start it from your repository and connect an LLM
provider:

```bash
curl -fsSL https://opencode.ai/install | bash
cd /path/to/repository
opencode
```

Run `/connect` inside OpenCode and follow the provider prompts. See the
[OpenCode installation and provider setup](https://opencode.ai/docs/) for other
installation methods.

In a terminal, install `dn` and authenticate the GitHub operations that it
performs:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
gh auth login
dn --version
opencode --version
```

Install the repository skill:

```bash
dn init agents --skill --agent opencode
```

This writes `.agents/skills/dn/SKILL.md` and its metadata. OpenCode discovers
project skills under `.agents/skills` and loads them when a request matches the
skill description. Commit the generated files if the whole team should use the
skill.

Start a new OpenCode session from the repository root, then give it a specific
issue and outcome:

```text
Use the dn skill to complete GitHub issue 123. Run kickstart with OpenCode,
publish the result as a pull request, and report the plan file, checks, and PR
URL when finished.
```

OpenCode should run the equivalent of:

```bash
dn --agent opencode kickstart --publish pr 123
```

Stay in the OpenCode session to review command approvals and answer
implementation questions. To inspect the result, ask OpenCode for the final plan
status, checks, and pull request URL, or run:

```bash
gh pr view --web
```

The remaining sections configure how `dn` invokes OpenCode directly, including
unattended [Headless Use](/dn-cli/headless-use/) workflows.

## How dn uses OpenCode configs

`kickstart` runs plan and implementation phases; `meld` runs only the plan
phase. Each phase uses a separate config file in the **workspace root**
(`WORKSPACE_ROOT` or the current working directory):

| File                      | Phase                 | Role                                                  |
| ------------------------- | --------------------- | ----------------------------------------------------- |
| `opencode.plan.json`      | Plan                  | Restrict edits to plan files in `plans/`              |
| `opencode.implement.json` | Implement             | Allow workspace file edits                            |
| `opencode.json`           | Local runs (optional) | Default OpenCode config when not in a kickstart phase |

During each phase, `dn` temporarily copies the active phase file to
`opencode.json` before invoking OpenCode. Model, provider, and permission
settings must be present in **both** phase files when you run in CI.

Installed workflows pass `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}` to the
job. Map that secret in OpenCode config with `"apiKey": "{env:OPENAI_API_KEY}"`
so you do not need to fork workflow YAML.

## Install workflows for OpenCode

```bash
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY
dn workflows validate --json
```

Commit `.github/dn/config.json`, `.github/workflows/dn-*.yml`, and your
`opencode*.json` files. Confirm `.github/dn/config.json` contains
`"agent": "opencode"`.

## Default plan config template

If `opencode.plan.json` is missing, kickstart creates a template like:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": {
      "*": "deny",
      "/tmp/**": "allow",
      "plans/**/*.plan.md": "allow",
      "plans/*.plan.md": "allow",
      "**/*.plan.md": "allow"
    },
    "bash": {
      "*": "allow"
    },
    "external_directory": "allow"
  }
}
```

## Default implement config template

Create `opencode.implement.json` before the implement phase. kickstart does not
auto-create this file:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": {
      "*": "allow",
      "/tmp/**": "allow"
    },
    "bash": {
      "*": "allow"
    },
    "external_directory": "allow"
  }
}
```

Tighten `permission.edit` if the agent should touch only specific paths.

## OpenAI (default provider)

For OpenAI directly, add model and provider settings to both phase files. The
canonical workflows already export `OPENAI_API_KEY`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-4.1",
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{env:OPENAI_API_KEY}"
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

Use the model id your OpenCode version expects. Commit both `opencode.plan.json`
(with plan restrictions from the template above) and `opencode.implement.json`.

Store your OpenAI API key:

```bash
gh secret set OPENAI_API_KEY --repo owner/repo
```

## DeepInfra Kimi K2.7 Code

Use [DeepInfra](https://deepinfra.com/moonshotai/Kimi-K2.7-Code) to run
[moonshotai/Kimi-K2.7-Code](https://deepinfra.com/moonshotai/Kimi-K2.7-Code/api)
through OpenCode. DeepInfra exposes an
[OpenAI-compatible Chat Completions API](https://deepinfra.com/moonshotai/Kimi-K2.7-Code/api);
OpenCode calls it via a custom provider block in your `opencode*.json` files.

```text
repository_dispatch / denoise UI
        │
        ▼
dn-kickstart-issue.yml (or meld / init-stack / daily kickstart)
        │
        ├── chesapeakedev/dn-action  →  dn CLI + OpenCode CLI
        └── OPENAI_API_KEY secret    →  DeepInfra API token (via opencode config)
                │
                ▼
        opencode.plan.json / opencode.implement.json
        (model: deepinfra/moonshotai/Kimi-K2.7-Code)
                │
                ▼
        https://api.deepinfra.com/v1/openai/chat/completions
```

### Prerequisites

1. DeepInfra account and API token from the
   [DeepInfra dashboard](https://deepinfra.com/dash).
2. Installed dn workflows with `opencode` as the agent (see above).
3. Provider and model blocks in **both** `opencode.plan.json` and
   `opencode.implement.json`.

### Provider block

Merge this with the `permission` sections in each phase file:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "deepinfra/moonshotai/Kimi-K2.7-Code",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.7-Code": {
          "name": "Kimi K2.7 Code",
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
  "model": "deepinfra/moonshotai/Kimi-K2.7-Code",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.7-Code": {
          "name": "Kimi K2.7 Code",
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
  "model": "deepinfra/moonshotai/Kimi-K2.7-Code",
  "provider": {
    "deepinfra": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepInfra",
      "options": {
        "baseURL": "https://api.deepinfra.com/v1/openai",
        "apiKey": "{env:OPENAI_API_KEY}"
      },
      "models": {
        "moonshotai/Kimi-K2.7-Code": {
          "name": "Kimi K2.7 Code",
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

Store your DeepInfra token in the `OPENAI_API_KEY` repository secret — canonical
workflows already pass that name. For a dedicated secret, add it to the workflow
`env` block and use `"apiKey": "{env:DEEPINFRA_TOKEN}"` instead.

### DeepInfra API reference

| Item        | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| Model ID    | `moonshotai/Kimi-K2.7-Code`                                 |
| Endpoint    | `POST https://api.deepinfra.com/v1/openai/chat/completions` |
| Auth header | `Authorization: Bearer <token>`                             |
| Context     | 262,144 tokens (per DeepInfra model page)                   |

```bash
curl "https://api.deepinfra.com/v1/openai/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "moonshotai/Kimi-K2.7-Code",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

OpenCode also lists Deep Infra as a built-in provider (`/connect` in the TUI).
That path stores credentials interactively for local development. For unattended
CI, use the explicit `provider` block with `{env:OPENAI_API_KEY}`.

## Verify locally

Before relying on CI, confirm OpenCode reaches your provider:

```bash
export OPENAI_API_KEY="your-api-token"
opencode run "Reply with exactly: ok"
```

Or run the plan phase:

```bash
export OPENAI_API_KEY="your-api-token"
export GITHUB_TOKEN="$(gh auth token)"
dn meld https://github.com/owner/repo/issues/42
```

Fix provider or auth errors locally before dispatching workflows.

## Run in GitHub Actions

Dispatch kickstart after workflows and configs are committed:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

The workflow:

1. Checks out the repo (including your `opencode*.json` configs)
2. Uses `chesapeakedev/dn-action` to install `dn`, validate the event, and
   install OpenCode
3. Runs `dn --agent opencode kickstart --publish pr <issue>` with
   `OPENAI_API_KEY` set
4. OpenCode plan phase uses `opencode.plan.json`; implement phase uses
   `opencode.implement.json`

Monitor runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
gh run view <run-id> --log
```

denoise and other integrators dispatch the same payload shapes from the UI.

## Troubleshooting

| Symptom                      | Likely cause                       | Fix                                                                              |
| ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| `401` / unauthorized         | Missing or wrong token             | Re-set `OPENAI_API_KEY`                                                          |
| Model not found (DeepInfra)  | Wrong model string                 | Use `deepinfra/moonshotai/Kimi-K2.7-Code` in config                              |
| Works locally, fails in CI   | Provider missing from phase config | Add provider to **both** `opencode.plan.json` and `opencode.implement.json`      |
| OpenCode uses wrong model    | Stale root `opencode.json`         | Align `model` across all opencode config files                                   |
| Plan phase edits wrong files | Plan permissions too open          | Restore deny `*` with allow only under `plans/`                                  |
| Timeouts on long issues      | Large context / slow inference     | Check run logs; consider [self-hosted runners](/operations/self-hosted-runners/) |

## Related

- [Headless Use](/dn-cli/headless-use/) — workflow installation and dispatch
- [Claude Code](/cookbooks/claude-code/) — alternative agent harness
- [Codex](/cookbooks/codex/) — alternative agent harness (same `OPENAI_API_KEY`
  secret)
- [Cursor](/cookbooks/cursor/) — alternative agent harness
- [Completing GitHub Issues — Publish modes](/dn-cli/completing-github-issues/#publish-modes)
