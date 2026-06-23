---
title: Claude
description: Configure Claude Code for dn locally and in GitHub Actions — API key, headless mode, and permission settings.
---

Use [Claude Code](https://docs.anthropic.com/en/docs/claude-code/quickstart) as
the agent harness in **installed dn GitHub Actions workflows** and for local
`kickstart`, `prep`, `loop`, and `fixup` runs. `dn` invokes the Claude Code CLI
in print mode (`claude -p`) with a combined prompt file for each plan and
implement phase. Unlike OpenCode, Claude does not require provider or model JSON
config in the repository.

General workflow installation and dispatch reference:
[Headless Use](/dn-cli/headless-use/).

## Overview

```text
repository_dispatch / denoise UI
        │
        ▼
dn-kickstart-issue.yml (or prep / init-stack / daily kickstart)
        │
        ├── chesapeakedev/dn-action  →  dn CLI + Claude Code CLI
        └── ANTHROPIC_API_KEY secret →  Claude API authentication
                │
                ▼
        dn --agent claude kickstart / prep / init stack
                │
                ▼
        claude -p (print mode, headless in CI)
```

Canonical dn workflows pass
`ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` to every agent step. Store
your Anthropic API key in that repository secret so you do not need to fork
workflow YAML.

## Prerequisites

1. **Anthropic API key** for headless and CI runs — create one in the
   [Anthropic Console](https://console.anthropic.com/). Local development can
   use an interactive `claude` login instead when `CLAUDE_CODE_BARE` is unset.
2. **Installed dn workflows** with `claude` as the agent:

   ```bash
   dn init workflows --agent claude
   gh secret set ANTHROPIC_API_KEY
   ```

   Commit `.github/dn/config.json` and the generated workflow files. Confirm
   with `dn workflows validate --json`.

3. **Repository permissions** for kickstart with `--publish pr` — same as the
   general headless guide: `contents: write`, `pull-requests: write`,
   `issues: write`, and **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**.

## Install workflows for Claude

Set the agent in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "claude"
}
```

Install or update canonical templates:

```bash
dn init workflows --agent claude
dn workflows validate --json
```

Commit `.github/dn/config.json` and `.github/workflows/dn-*.yml`.

When `chesapeakedev/dn-action` installs Claude in CI, it runs the official
install script and sets `CLAUDE_CODE_BARE=1` so kickstart uses API-key-oriented
headless mode. You do not need to add that variable to workflow YAML yourself.

## How dn invokes Claude

`dn` runs two phases during kickstart and prep. For each phase it builds a
combined prompt file and calls:

```text
claude -p "Read and execute the instructions in this file: <path>"
```

With `CLAUDE_CODE_BARE=1` (set automatically in CI), `dn` adds `--bare` for
deterministic, API-key-oriented runs.

Default flags `dn` passes:

| Flag                | Default          | Purpose                                                                                             |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| `--permission-mode` | `acceptEdits`    | Lets plan and implement phases write `plans/*.plan.md` and other edits without interactive approval |
| `--allowedTools`    | `Bash,Read,Edit` | Pre-approves common tools for unattended runs                                                       |

Override behavior with environment variables (see below). Claude does not use
OpenCode-style `opencode.plan.json` / `opencode.implement.json` swapping.

## Environment variables

| Variable                              | Purpose                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`                   | API key for headless and bare runs; required in CI                                                      |
| `CLAUDE_CODE_BARE`                    | Set to `1` for `--bare` mode (CI sets this during agent install)                                        |
| `CLAUDE_PERMISSION_MODE`              | Override `--permission-mode` (`acceptEdits`, `default`, `bypassPermissions`, `plan`, `auto`, `dontAsk`) |
| `CLAUDE_ALLOWED_TOOLS`                | Override default `Bash,Read,Edit` passed to `--allowedTools`                                            |
| `CLAUDE_DANGEROUSLY_SKIP_PERMISSIONS` | Set to `1` to add `--dangerously-skip-permissions` — only in isolated sandboxes                         |
| `CLAUDE_TIMEOUT_MS`                   | Phase timeout; falls back to `OPENCODE_TIMEOUT_MS`, then 10 minutes                                     |

Legacy toggles still work: `--claude` on a subcommand, `CLAUDE_ENABLED=1`, or
`dn meld a.md b.md --claude` for meld-only runs. Do not combine conflicting
agent selections.

## Store the API key

```bash
gh secret set ANTHROPIC_API_KEY --repo owner/repo
```

Verify:

```bash
dn workflows validate --json
```

## Verify locally

**Interactive (default).** If you already ran `claude` login on your machine,
`dn` uses your saved session and project `CLAUDE.md` — no API key required:

```bash
export GITHUB_TOKEN="$(gh auth token)"
dn --agent claude prep https://github.com/owner/repo/issues/42
```

**Headless / API key.** Match CI behavior:

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export CLAUDE_CODE_BARE=1
claude --bare -p "Reply with exactly: ok" --permission-mode acceptEdits
```

Then run kickstart through `dn`:

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export CLAUDE_CODE_BARE=1
export GITHUB_TOKEN="$(gh auth token)"
dn --agent claude prep https://github.com/owner/repo/issues/42
```

Fix auth and permission errors locally before dispatching workflows.

## Run in GitHub Actions

Dispatch kickstart after workflows and secrets are committed:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42,"publish":"pr"}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

The workflow:

1. Checks out the repository.
2. Uses `chesapeakedev/dn-action` to install `dn`, validate the event, install
   Claude Code, and set `CLAUDE_CODE_BARE=1`.
3. Runs `dn --agent claude kickstart --publish pr <issue>` with
   `ANTHROPIC_API_KEY` set.
4. Claude Code executes plan and implement phases headlessly.

Monitor runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
gh run view <run-id> --log
```

denoise and other integrators dispatch the same payload shapes from the UI.

## Optional repository context

Claude auth does not depend on repo-local config files. For better agent
context, install the dn skill:

```bash
dn init agents --skill --agent claude
```

This writes `.claude/skills/dn/SKILL.md`. See
[Installation — Install dn as an agent skill](/dn-cli/installation/#install-dn-as-an-agent-skill).
Optional for CI — kickstart works once `ANTHROPIC_API_KEY` is set.

## Troubleshooting

| Symptom                                       | Likely cause                       | Fix                                                                                                                                              |
| --------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `claude command not found`                    | CLI not installed or not on `PATH` | Install from [Claude Code CLI usage](https://docs.anthropic.com/en/docs/claude-code/cli-usage); on CI the install script adds `$HOME/.local/bin` |
| "Not logged in · Please run /login"           | Non-bare run without saved session | Run `claude` login locally, or set `CLAUDE_CODE_BARE=1` with `ANTHROPIC_API_KEY`                                                                 |
| `401` / authentication errors in CI           | Missing or wrong API key           | Re-set `ANTHROPIC_API_KEY` from the Anthropic Console                                                                                            |
| Plan phase completes but no `plans/*.plan.md` | Edit approval blocked              | Confirm `CLAUDE_PERMISSION_MODE` is not `default`; try `acceptEdits` or `bypassPermissions`                                                      |
| Works locally, fails in CI                    | Secret not scoped to repo          | Confirm secret name is `ANTHROPIC_API_KEY`                                                                                                       |
| Timeouts on long issues                       | Large context / slow inference     | Increase `CLAUDE_TIMEOUT_MS`; consider [self-hosted runners](/operations/self-hosted-runners/)                                                   |

For Anthropic's managed GitHub app and action, see
[Claude Code GitHub Actions](https://docs.anthropic.com/en/docs/claude-code/github-actions).

## Related

- [Headless Use](/dn-cli/headless-use/) — templates, dispatch payloads,
  permissions
- [Kickstart & Looping — Publish modes](/dn-cli/overview/#publish-modes)
- [Claude Code headless mode](https://docs.anthropic.com/en/docs/claude-code/headless)
