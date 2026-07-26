---
title: Use dn with GitHub Copilot
description: Install dn as a portable Copilot skill, then complete a GitHub issue from Copilot CLI.
---

This guide installs the portable `dn` skill and uses GitHub Copilot CLI as the
interface for an end-to-end `kickstart` run.

## 1. Install and sign in to Copilot CLI

Copilot CLI requires an active GitHub Copilot plan. Install it with npm:

```bash
npm install -g @github/copilot
```

Start it from your repository:

```bash
cd /path/to/repository
copilot
```

Run `/login` and follow the browser flow if Copilot does not reuse an existing
GitHub CLI login. See
[Installing GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli)
for other installation methods.

## 2. Install dn

In a terminal, install `dn` and verify both CLIs:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
dn --version
copilot --version
```

Authenticate the GitHub operations that `dn` performs:

```bash
gh auth login
```

## 3. Install the portable dn skill

Current `dn` releases can run agent-backed commands with `--agent copilot`, but
`dn init agents --skill` does not yet expose a `copilot` install target.
Generate the portable Agent Skills layout instead:

```bash
dn init agents --skill --agent codex
```

This command only selects the portable skill layout; it does not make Codex the
runtime harness. It writes `.agents/skills/dn/SKILL.md`, which Copilot supports
as a project skill. Commit the generated files if the whole team should use
them.

Start a new Copilot session, or run these commands in the current session:

```text
/skills reload
/skills info dn
```

## 4. Run dn through Copilot

Invoke the skill and name Copilot as the runtime harness:

```text
/dn Complete GitHub issue 123. Run kickstart with --agent copilot, publish the
result as a pull request, and report the plan file, checks, and PR URL when
finished.
```

Copilot should run:

```bash
dn --agent copilot kickstart --publish pr 123
```

Review command approvals and answer any implementation questions in the Copilot
session. `dn` invokes Copilot for its plan and implementation phases.

## 5. Verify the result

Ask Copilot:

```text
Show me the final dn plan status, the checks that ran, and the pull request URL.
Do not make more changes.
```

You can also inspect the result directly:

```bash
gh pr view --web
```

For `dn` workflow and publish-mode details, see
[Completing GitHub issues](/dn/completing-github-issues/).
