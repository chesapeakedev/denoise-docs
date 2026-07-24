---
title: Use dn with Codex
description: Install dn and its Codex skill, then complete a GitHub issue from Codex CLI.
---

This guide installs `dn` as a Codex skill and uses Codex CLI as the interface
for an end-to-end `kickstart` run.

## 1. Install and sign in to Codex

Install Codex CLI on macOS or Linux:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

Start it from your repository. On the first run, choose **Sign in with ChatGPT**
or another available sign-in method:

```bash
cd /path/to/repository
codex
```

See the [Codex CLI guide](https://developers.openai.com/codex/cli/) for other
platforms and installation methods.

## 2. Install dn

In a terminal, install `dn` and verify both CLIs:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
codex --version
```

Authenticate GitHub-backed workflows:

```bash
gh auth login
```

## 3. Install the dn skill

Run this command from the repository root:

```bash
dn init agents --skill --agent codex
```

It writes `.agents/skills/dn/SKILL.md` and
`.agents/skills/dn/agents/openai.yaml`. Codex discovers repository skills under
`.agents/skills`. Start a new session if the current session does not show the
new skill, and commit the files if the whole team should use them.

## 4. Run dn through Codex

Start Codex from the repository root and mention the skill explicitly:

```text
$dn Complete GitHub issue 123. Run kickstart with Codex, publish the result as
a pull request, and report the plan file, checks, and PR URL when finished.
```

Codex should run the equivalent of:

```bash
dn --agent codex kickstart --publish pr 123
```

Review command approvals and answer any implementation questions in the Codex
session. `dn` invokes Codex for its plan and implementation phases.

## 5. Verify the result

Ask Codex:

```text
Show me the final dn plan status, the checks that ran, and the pull request URL.
Do not make more changes.
```

You can also inspect the result directly:

```bash
gh pr view --web
```

For API-key use, unattended execution, and sandbox controls, see
[Codex configuration](/dn-cli/codex/).
