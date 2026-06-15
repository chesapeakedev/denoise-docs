---
title: Repository Setup
description: Initialize dn workflows, agent guidance, milestone stacks, and inherited agent context.
---

These commands prepare a repository for local and CI-driven `dn` workflows.

## `dn init workflows`

Installs canonical GitHub Actions workflows plus repository agent configuration:

- `.github/workflows/dn-*.yml` - dispatch workflows
- `.github/dn/config.json` - repo-wide agent preference
- `.github/dn/install-agent.sh` - installs the configured agent on the runner

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
[GitHub workflow integration](/kickstart/github-actions-integration/).

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
