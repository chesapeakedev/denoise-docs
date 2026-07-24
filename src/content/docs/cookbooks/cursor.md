---
title: Use dn with Cursor
description: Install dn and its Cursor rule, then complete a GitHub issue from Cursor Agent.
---

This guide installs the `dn` workflow as a Cursor project rule and uses Cursor
Agent as the interface for an end-to-end `kickstart` run.

## 1. Install and sign in to Cursor Agent

Install Cursor CLI:

```bash
curl https://cursor.com/install -fsS | bash
```

Start it from your repository and sign in when prompted:

```bash
cd /path/to/repository
cursor-agent
```

See [Cursor CLI installation](https://cursor.com/docs/cli/installation) if the
installer asks you to update your `PATH`.

## 2. Install dn

In a terminal, install `dn` and verify both CLIs:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
cursor-agent --version
```

Authenticate GitHub-backed workflows:

```bash
gh auth login
```

## 3. Install the dn rule

Run this command from the repository root:

```bash
dn init agents --skill --agent cursor
```

It writes `.cursor/rules/dn.mdc`, Cursor's harness-native equivalent of the `dn`
skill. Cursor makes the rule available to Agent based on its description. Commit
it if the whole team should use the same workflow.

## 4. Run dn through Cursor

Start a new Cursor Agent session from the repository root and request the rule
by name:

```text
Use the dn project rule to complete GitHub issue 123. Run kickstart with
Cursor, publish the result as a pull request, and report the plan file, checks,
and PR URL when finished.
```

Cursor should run the equivalent of:

```bash
dn --agent cursor kickstart --publish pr 123
```

Review command approvals and answer any implementation questions in the Cursor
session. `dn` invokes Cursor for its plan and implementation phases.

## 5. Verify the result

Ask Cursor:

```text
Show me the final dn plan status, the checks that ran, and the pull request URL.
Do not make more changes.
```

You can also inspect the result directly:

```bash
gh pr view --web
```

For API-key use, unattended execution, and workspace trust, see
[Cursor configuration](/dn-cli/cursor-github-actions/).
