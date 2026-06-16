---
title: Github Integration
description: Prepare a repository for dn workflows and manage GitHub issues, dispatch, and project activity from the terminal.
---

`dn` can be deeply integrated into your github repo to bring kickstart and other
`dn` automations. Use these commands to prepare a GitHub repository for `dn`
workflows and to manage issues, dispatch automation, and inspect project
activity from the terminal. Authenticate with `gh auth login`, `dn auth`, or
`GITHUB_TOKEN` before running GitHub-backed commands — see
[Installation — GitHub authentication](/dn-cli/installation/#github-authentication) and
[GitHub Token Setup](/dn-cli/github-token-setup/) when you need token details.

## First-time repository setup

To wire a repository for local and CI-driven `dn` workflows:

1. Install canonical workflow files and agent configuration:
   `dn init workflows --agent opencode`
2. Set the secret for your configured agent, for example
   `gh secret set OPENAI_API_KEY`
3. Validate the repository: `dn workflows validate --json`
4. Commit `.github/workflows/dn-*.yml`, `.github/dn/config.json`, and
   `.github/dn/install-agent.sh`

For dispatch payloads, permissions, and denoise integration, continue with
[GitHub Workflow Integration](/kickstart/github-actions-integration/) after the
repository validates.

## `dn init workflows`

Installs canonical GitHub Actions workflows plus repository agent configuration:

- `.github/workflows/dn-*.yml` — dispatch workflows
- `.github/dn/config.json` — repo-wide agent preference
- `.github/dn/install-agent.sh` — installs the configured agent on the runner

```bash
dn init workflows --agent opencode
gh secret set OPENAI_API_KEY
dn workflows validate --json
```

Supported agents are `opencode` (default), `cursor`, `claude`, and `codex`.

```bash
dn init workflows --agent opencode --dry-run
dn init workflows --json
dn workflows install --agent cursor
dn workflows update
dn workflows validate --json
```

`install` writes missing workflow files. `update` refreshes missing or outdated
templates and the install script. Passing `--agent` creates or updates
`.github/dn/config.json`.

## `dn init agents`

Updates `AGENTS.md` with dn workflow instructions:

```bash
dn init agents
```

Pass `--skill` to install native skill or rule files for a selected agent:

```bash
dn init agents --skill --agent codex
dn init agents --skill --agent claude
dn init agents --skill --agent opencode
dn init agents --skill --agent cursor
dn init agents --skill --agent codex --scope user
dn init agents --skill --agent claude --dry-run --json
```

Repo-scope installs write:

- `codex`, `opencode`: `.agents/skills/dn/SKILL.md` and
  `.agents/skills/dn/agents/openai.yaml`
- `claude`: `.claude/skills/dn/SKILL.md`
- `cursor`: `.cursor/rules/dn.mdc`

User-scope installs write:

- `codex`, `opencode`: `~/.agents/skills/dn/SKILL.md` and
  `~/.agents/skills/dn/agents/openai.yaml`
- `claude`: `~/.claude/skills/dn/SKILL.md`

Managed files are idempotent. Existing unmanaged files are left untouched unless
`--force` is passed.

## `dn init stack`

Creates a prioritized task list from a GitHub milestone:

1. Fetches the milestone and its open issues from GitHub.
2. Scores each issue for kickstart readiness.
3. Writes `plans/{owner}_{repo}_{milestone-number}.stack.md` and `.stack.json`.
4. Prints instructions for committing the generated files.

```bash
dn init stack 42
dn init stack https://github.com/owner/repo/milestone/3
dn init stack 42 --refresh
```

The generated stack file includes prioritized tasks, disqualified issues, and
instructions for agents. `dn kickstart --milestone 42` uses the first unchecked
task as the next work item.

For stable machine-readable stack artifacts and UI integration guidance, see
[GitHub Workflow Integration](/kickstart/github-actions-integration/).

## `dn context`

Inspects the inherited `AGENTS.md` chain for a file or directory:

```bash
dn context check cli/main.ts
dn context check cli/main.ts --max-bytes 65536
dn context check cli/main.ts --json
dn context check cli/main.ts --claude-tokens
```

The command walks from global Codex context through the repository path,
preferring `AGENTS.override.md` over `AGENTS.md` in each directory, then reports
the full byte size and the subset that fits inside the configured byte budget.

`--claude-tokens` requires `ANTHROPIC_API_KEY` and estimates token usage for the
included context.

## `dn workflows`

Runs `workflow_dispatch` and `repository_dispatch` workflows and manages
canonical dn workflow templates.

```bash
dn workflows run release.yml
dn workflows run triage.yml --ref my-branch
dn workflows run triage.yml -f name=scully -f greeting=hello
echo '{"name":"scully"}' | dn workflows run triage.yml --json
dn workflows run smoke.yml --repo owner/repo

# repository_dispatch for canonical dn templates
echo '{"schema_version":"1.0","dispatch_id":"'"$(uuidgen)"'","milestone":"1"}' \
  | dn workflows run dn.init_stack --repo owner/repo --json
```

Common `run` options:

- `--repo`, `-R` — Target `owner/repo`.
- `--ref`, `-r` — Branch or tag containing the workflow file.
- `--dispatch` — Force `repository` or `workflow` when both triggers exist.
- `--wait` — Poll until a `repository_dispatch` run appears.
- `-f`, `--raw-field` — String workflow input.
- `-F`, `--field` — String input; `@path` reads file contents.
- `--json` — JSON object from stdin.

Manage installed templates:

```bash
dn workflows list
dn workflows install
dn workflows update
dn workflows validate
dn workflows validate --json
```

All template-management subcommands support `--json`; `install` and `update`
also support `--dry-run`.

## `dn issue`

Provides CRUD operations for GitHub issues from the terminal:

```bash
dn issue list
dn issue list --repo owner/repo
dn issue list --state closed --limit 10
dn issue list --label bug
dn issue show 123
dn issue show 123 --repo owner/repo
dn issue show 123 --no-comments
dn issue create --title "Bug" --body-file report.md
dn issue create --repo owner/repo --title "Bug" --body-file report.md
dn issue edit 123 --title "New title"
dn issue edit 123 --add-label bug
dn issue close 123
dn issue close 123 --reason not_planned
dn issue close 123 --comment "Fixed in #456"
dn issue reopen 123
dn issue comment 123 --body-file update.md
dn issue comment 123 --body-stdin
dn issue relationship list 123
dn issue relationship add blocked-by 123 456
dn issue relationship add sub-issue 123 789
dn issue relationship reprioritize sub-issue 123 789 --after 456
dn issue relationship mark-duplicate 123 456
```

Issue references accept a number (`123`), `#123`, or a full URL.
`--repo owner/repo` sets the repository used for numeric refs and commands
without an issue ref, such as `list` and `create`.

## `dn glance`

Summarizes project activity over a recent time window:

```bash
dn glance
dn glance --days 14
dn glance --compact --no-urls
```

`glance` compares issues and commits against the prior window of equal length
and reports rates, trends, net issue flow, label grouping, and contributor
share.

## `dn peek`

Suggests next open issues with a fixed heuristic scoring model. In conversation,
this gives an agent a concrete way to propose what it should work on next:

```bash
dn peek
dn peek --limit 5
dn peek --fetch 200
dn peek --verbose --no-urls
```

`peek` uses GitHub GraphQL issue paging only. It does not invoke the LLM-based
kickstart readiness scorer.
