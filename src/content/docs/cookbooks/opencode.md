---
title: Use dn with OpenCode
description: Install dn and its OpenCode skill, then complete a GitHub issue from an OpenCode session.
---

This guide installs `dn` and its repository skill, then uses OpenCode as the
interface for an end-to-end `kickstart` run.

## 1. Install and connect OpenCode

Install OpenCode:

```bash
curl -fsSL https://opencode.ai/install | bash
```

From your repository, start OpenCode and connect an LLM provider:

```bash
cd /path/to/repository
opencode
```

Run `/connect` inside OpenCode and follow the provider prompts. See the
[OpenCode installation and provider setup](https://opencode.ai/docs/) for other
installation methods.

## 2. Install dn

In a terminal, install `dn` and confirm that both CLIs are available:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
opencode --version
```

Authenticate GitHub-backed workflows:

```bash
gh auth login
```

## 3. Install the dn skill

Run this command from the repository root:

```bash
dn init agents --skill --agent opencode
```

It writes `.agents/skills/dn/SKILL.md` and skill metadata. OpenCode discovers
project skills under `.agents/skills` and loads them when the request matches
the skill description.

Commit the generated files if the whole team should use the skill.

## 4. Run dn through OpenCode

Start a new OpenCode session from the repository root. Give it a specific issue
and outcome:

```text
Use the dn skill to complete GitHub issue 123. Run kickstart with OpenCode,
publish the result as a pull request, and report the plan file, checks, and PR
URL when finished.
```

OpenCode should select the `dn` skill and run the equivalent of:

```bash
dn --agent opencode kickstart --publish pr 123
```

Review command approvals and answer any implementation questions in the OpenCode
session. `dn` uses OpenCode for its plan and implementation phases.

## 5. Verify the result

Ask OpenCode:

```text
Show me the final dn plan status, the checks that ran, and the pull request URL.
Do not make more changes.
```

You can also inspect the result directly:

```bash
gh pr view --web
```

For provider, model, and phase-specific configuration, see
[OpenCode configuration](/dn-cli/opencode/).
