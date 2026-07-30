---
title: Use dn with Codex
description: Install dn for Codex CLI, then run interactively or configure unattended GitHub Actions.
---

Use the [OpenAI Codex CLI](https://developers.openai.com/codex) as the agent
harness for an interactive `dn` run or in installed GitHub Actions workflows.
`dn` invokes Codex non-interactively with `codex exec` and a combined prompt
file for each plan and implement phase. Unlike OpenCode, Codex does not require
provider or model JSON config in the repository.

## Use dn from Codex

Install Codex CLI, then start it from your repository and sign in:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
cd /path/to/repository
codex
```

See the [Codex CLI guide](https://developers.openai.com/codex/cli/) for other
platforms and installation methods.

In a terminal, install `dn`, authenticate GitHub, and add the repository skill:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
gh auth login
dn init agents --skill --agent codex
```

This writes `.agents/skills/dn/SKILL.md` and
`.agents/skills/dn/agents/openai.yaml`. Codex discovers repository skills under
`.agents/skills`. Start a new session if the current session does not show the
new skill, and commit the files if the whole team should use them.

`dn context check` also reads inherited guidance from `CODEX_HOME` (or
`~/.codex`) `AGENTS.md` when estimating context size. See
[Experimental — Context check](/dn/task-list-and-sync/).

Start Codex from the repository root and mention the skill explicitly:

```text
$dn Complete GitHub issue 123. Run kickstart with Codex, publish the result as
a pull request, and report the plan file, checks, and PR URL when finished.
```

Codex should run the equivalent of:

```bash
dn --agent codex kickstart --publish pr 123
```

Stay in the Codex session to review command approvals and answer implementation
questions. To inspect the result, ask Codex for the final plan status, checks,
and pull request URL, or run:

```bash
gh pr view --web
```

The remaining sections cover API-key use, sandbox behavior, and unattended
[Headless Use](/dn/headless-use/) workflows.

## Overview

```text
repository_dispatch / denoise UI
        │
        ▼
dn-kickstart-issue.yml (or meld / init-stack / daily kickstart)
        │
        ├── chesapeakedev/dn-action  →  dn CLI + Codex CLI
        └── OPENAI_API_KEY secret    →  OpenAI API authentication
                │
                ▼
        dn --agent codex kickstart / meld / init stack
                │
                ▼
        codex exec --sandbox workspace-write …
```

Canonical dn workflows pass `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}` to
every agent step — the same secret name OpenCode uses. Store your OpenAI API key
in that repository secret so you do not need to fork workflow YAML.

## Prerequisites

1. **OpenAI API key** — create one in the
   [OpenAI platform](https://platform.openai.com/). Local development can use
   `codex` login when you are already authenticated.
2. **Installed dn workflows** with `codex` as the agent:

   ```bash
   dn init workflows --agent codex
   gh secret set OPENAI_API_KEY
   ```

   Commit `.github/dn/config.json` and the generated workflow files. Confirm
   with `dn workflows validate --json`.

3. **Repository permissions** for kickstart with `--publish pr` — same as the
   general headless guide: `contents: write`, `pull-requests: write`,
   `issues: write`, and **Allow GitHub Actions to create and approve pull
   requests** under **Settings → Actions → General**.

## Install workflows for Codex

Set the agent in `.github/dn/config.json`:

```json
{
  "schema_version": "1.0",
  "agent": "codex"
}
```

Install or update canonical templates:

```bash
dn init workflows --agent codex
dn workflows validate --json
```

Commit `.github/dn/config.json` and `.github/workflows/dn-*.yml`.

When `chesapeakedev/dn-action` installs Codex in CI, it runs the official
install script from `https://chatgpt.com/codex/install.sh` and adds the CLI to
`PATH`.

## How dn invokes Codex

`dn kickstart` runs plan and implementation phases; `dn meld` runs only the plan
phase. For each phase, `dn` builds a combined prompt file and calls:

```text
codex exec --sandbox workspace-write --skip-git-repo-check -C <workspaceRoot> \
  "Read and execute the instructions in this file: <path>"
```

The `workspace-write` sandbox lets Codex edit files within the checkout without
interactive approval prompts — similar to Cursor's `agent --force` and
OpenCode's implement-phase permissions.

Codex does not use OpenCode-style `opencode.plan.json` /
`opencode.implement.json` swapping.

## Environment variables

| Variable           | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `OPENAI_API_KEY`   | API key for Codex when not already logged in; required in CI        |
| `CODEX_TIMEOUT_MS` | Phase timeout; falls back to `OPENCODE_TIMEOUT_MS`, then 10 minutes |
| `CODEX_HOME`       | Override Codex config directory (default `~/.codex`)                |

Legacy toggles still work: `--codex` on a subcommand or `CODEX_ENABLED=1`. Do
not combine conflicting agent selections.

## Store the API key

```bash
gh secret set OPENAI_API_KEY --repo owner/repo
```

If you already use OpenCode in another repository, the secret name is the same.
Only one agent is active per repository — set `"agent": "codex"` in
`.github/dn/config.json`.

Verify:

```bash
dn workflows validate --json
```

## Verify locally

Install and authenticate Codex:

```bash
# Install (if needed) — see OpenAI Codex CLI docs for your platform
curl -fsSL https://chatgpt.com/codex/install.sh | bash

# API key path (matches CI)
export OPENAI_API_KEY="your-openai-api-key"
codex exec --sandbox workspace-write --skip-git-repo-check -C . "Reply with exactly: ok"
```

Run the plan phase through `dn`:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export GITHUB_TOKEN="$(gh auth token)"
dn --agent codex meld https://github.com/owner/repo/issues/42
```

Fix auth errors locally before dispatching workflows.

## Run in GitHub Actions

Dispatch kickstart after workflows and secrets are committed:

```bash
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","issue_number":42,"publish":"pr"}' \
  | dn workflows dispatch dn.kickstart_issue --repo owner/repo --json --wait
```

The workflow:

1. Checks out the repository.
2. Uses `chesapeakedev/dn-action` to install `dn`, validate the event, and
   install the Codex CLI.
3. Runs `dn --agent codex kickstart --publish pr <issue>` with `OPENAI_API_KEY`
   set.
4. Codex executes plan and implement phases headlessly.

Monitor runs:

```bash
gh run list --repo owner/repo --event repository_dispatch
gh run view <run-id> --log
```

denoise and other integrators dispatch the same payload shapes from the UI.

## Troubleshooting

| Symptom                          | Likely cause                       | Fix                                                                                                            |
| -------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `codex command not found`        | CLI not installed or not on `PATH` | Run the [Codex install script](https://chatgpt.com/codex/install.sh); on CI `dn-action` installs automatically |
| `401` / unauthorized             | Missing or wrong API key           | Re-set `OPENAI_API_KEY` from the OpenAI platform                                                               |
| Works locally, fails in CI       | Secret not scoped to repo          | Confirm secret name is `OPENAI_API_KEY`                                                                        |
| Agent secret missing in validate | Secret not created yet             | `gh secret set OPENAI_API_KEY`; re-run `dn workflows validate --json`                                          |
| Sandbox or permission errors     | Codex sandbox restrictions         | Check run logs; confirm `workspace-write` sandbox can reach needed paths                                       |
| No PR created                    | Workflow permissions               | Enable `pull-requests: write` and **Allow GitHub Actions to create and approve pull requests**                 |
| Timeouts on long issues          | Large context / slow inference     | Increase `CODEX_TIMEOUT_MS`; consider [self-hosted runners](/operations/self-hosted-runners/)                  |

## Related

- [Headless Use](/dn/headless-use/) — templates, dispatch payloads, permissions
- [OpenCode](/cookbooks/opencode/) — alternative harness using the same
  `OPENAI_API_KEY` secret name
- [Completing GitHub Issues — Publish modes](/dn/completing-github-issues/#publish-modes)
