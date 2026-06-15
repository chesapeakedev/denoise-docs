---
title: GitHub Automation
description: Dispatch workflows, manage issues, and inspect GitHub activity with dn.
---

These commands use the GitHub API. Authenticate with `gh auth login`, `dn auth`,
or `GITHUB_TOKEN`.

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

- `--repo`, `-R` - Target `owner/repo`.
- `--ref`, `-r` - Branch or tag containing the workflow file.
- `--dispatch` - Force `repository` or `workflow` when both triggers exist.
- `--wait` - Poll until a `repository_dispatch` run appears.
- `-f`, `--raw-field` - String workflow input.
- `-F`, `--field` - String input; `@path` reads file contents.
- `--json` - JSON object from stdin.

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
`--repo
owner/repo` sets the repository used for numeric refs and commands
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

Suggests next open issues with a fixed heuristic scoring model:

```bash
dn peek
dn peek --limit 5
dn peek --fetch 200
dn peek --verbose --no-urls
```

`peek` uses GitHub GraphQL issue paging only. It does not invoke the LLM-based
kickstart readiness scorer.

## Canonical workflow contracts

For installed dn workflow payloads, permissions, and Denoise integration, see
[GitHub workflow integration](/kickstart/github-actions-integration/).
