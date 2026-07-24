---
title: Use dn with Claude Code
description: Install dn and its Claude Code skill, then complete a GitHub issue from Claude Code.
---

This guide installs `dn` as a Claude Code skill and uses Claude Code as the
interface for an end-to-end `kickstart` run.

## 1. Install and sign in to Claude Code

Install Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
```

Start it from your repository and choose the sign-in option for your Anthropic
account:

```bash
cd /path/to/repository
claude
```

See
[Set up Claude Code](https://docs.anthropic.com/en/docs/claude-code/getting-started)
for alternate installation and authentication options.

## 2. Install dn

In a terminal, install `dn` and verify both CLIs:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
claude --version
```

Authenticate GitHub-backed workflows:

```bash
gh auth login
```

## 3. Install the dn skill

Run this command from the repository root:

```bash
dn init agents --skill --agent claude
```

It writes `.claude/skills/dn/SKILL.md`. Restart Claude Code if the current
session does not list the new `dn` skill. Commit the skill if the whole team
should use it.

## 4. Run dn through Claude Code

Start Claude Code from the repository root and invoke the skill:

```text
/dn Complete GitHub issue 123. Run kickstart with Claude Code, publish the
result as a pull request, and report the plan file, checks, and PR URL when
finished.
```

Claude Code should run the equivalent of:

```bash
dn --agent claude kickstart --publish pr 123
```

Review command approvals and answer any implementation questions in the Claude
Code session. `dn` invokes Claude Code for its plan and implementation phases.

## 5. Verify the result

Ask Claude Code:

```text
Show me the final dn plan status, the checks that ran, and the pull request URL.
Do not make more changes.
```

You can also inspect the result directly:

```bash
gh pr view --web
```

For API-key use, unattended execution, and permission controls, see
[Claude Code configuration](/dn-cli/claude/).
