---
title: Cookbooks
description: Install dn as a skill in your agent harness and run an issue from prompt to pull request.
---

The cookbooks show the default way to use `dn`: install the CLI, add the `dn`
skill to your agent harness, then ask the harness to run the workflow. Choose
the guide for the harness you already use:

| Harness        | Installed project file       | Cookbook                                                 |
| -------------- | ---------------------------- | -------------------------------------------------------- |
| OpenCode       | `.agents/skills/dn/SKILL.md` | [Use dn with OpenCode](/cookbooks/opencode/)             |
| Claude Code    | `.claude/skills/dn/SKILL.md` | [Use dn with Claude Code](/cookbooks/claude-code/)       |
| Codex          | `.agents/skills/dn/SKILL.md` | [Use dn with Codex](/cookbooks/codex/)                   |
| Cursor         | `.cursor/rules/dn.mdc`       | [Use dn with Cursor](/cookbooks/cursor/)                 |
| GitHub Copilot | `.agents/skills/dn/SKILL.md` | [Use dn with GitHub Copilot](/cookbooks/github-copilot/) |

Each guide takes a GitHub issue through planning, implementation, verification,
and pull request creation with `kickstart`. The same setup also teaches the
harness about `meld`, `loop`, `fixup`, `sync`, and the other workflows included
in the generated skill.

## What you need

- A local clone of the repository you want to change
- Git or [Sapling](https://sapling-scm.com/)
- A GitHub issue in that repository
- The [GitHub CLI](https://cli.github.com/) authenticated with `gh auth login`
- An account for your chosen agent harness

The cookbooks install the skill in the current repository. Commit the generated
skill or rule so collaborators get the same workflow. To make the skill
available across repositories instead, add `--scope user` to the skill install
command.

## What the harness runs

When you ask the harness to complete issue `123`, the skill directs it toward a
command such as:

```bash
dn --agent <harness> kickstart --publish pr 123
```

`kickstart` reads the issue, creates a plan, implements it, runs the repository
checks available to the agent, and publishes the result according to the
selected publish mode. You stay in the harness conversation to review tool
calls, answer questions, and inspect the result.

For command-level details and alternate publish modes, see
[Completing GitHub issues](/dn-cli/completing-github-issues/).

## Operations cookbook

If your team publishes reviewed local commits directly to trunk, use
[Maintain linear main with Sapling](/cookbooks/linear-main-sapling/). It pairs
`dn` operations with a single CI/CD workflow that verifies the exact commit
before deployment.

To keep agent execution on hardware you control, use
[Run denoise jobs on a Raspberry Pi](/cookbooks/raspberry-pi-runner/). It
prepares a 64-bit Pi, pairs it as a denoise device runner, and registers trusted
repository checkouts.
