---
title: GitHub integration
description: Link milestones to GitHub, sync issues, and trigger dn-backed workflows.
---

Denoise connects the app experience to GitHub issues, milestones, and installed
`dn` workflows. The app can sync task state with GitHub and, when a repository
has canonical `dn` workflows installed, trigger planning and kickstart
automation from the UI.

Most automation features require [Denoise Pro](/denoise/subscription-and-pro/)
and **Online** mode. GitHub sign-in and repository access are required; see
[Authentication](/denoise/authentication/).

## Prepare the repository

You can set up workflows from the app (see **Initialize this repository for dn**
below) or from the terminal:

```bash
dn init workflows --agent opencode
dn workflows validate --json
```

Commit `.github/dn/config.json` and the generated `.github/workflows/dn-*.yml`
files. Set the secret required by the configured agent, such as
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `CURSOR_API_KEY`.

See
[GitHub Actions Integration — Dispatch payloads](/dn-cli/github-actions/#dispatch-payloads)
for dispatch payloads, permissions, and troubleshooting.

## Linking a milestone to GitHub

To connect a milestone in the app to a GitHub milestone:

1. Create or select a milestone in the app.
2. Choose to link a GitHub milestone when prompted.
3. Select the organization or user, repository, and open milestone in the GitHub
   Milestone Wizard.
4. Click **Link Milestone** to complete the connection.

Once linked, denoise shows a GitHub indicator next to the milestone and syncs
issues from GitHub.

## Automatic issue sync

When a milestone is linked to GitHub, the app can:

- Fetch issues from the linked GitHub milestone
- Create app tasks for GitHub issues
- Update tasks when issues change on GitHub
- Reflect closed issues as completed tasks

GitHub issues appear in the app as `#123: Issue Title`. Linked tasks show the
issue title and markdown description in the task card. Sync is disabled while
offline; local changes remain saved and sync again when connectivity returns.

## Initialize this repository for dn

When you open a GitHub-linked milestone, denoise checks whether the linked
repository is ready for dn automation. Pro users see an **Initialize this
repository for dn** panel when setup still needs attention.

The panel shows:

- **Setup state** — Whether workflows, secrets, and stack initialization are
  complete.
- **Template status** — Which dn workflow templates are installed, need updates,
  or are missing required secrets.

Actions in the panel:

| Action                       | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| **Install/Update workflows** | Install or refresh `.github/workflows/dn-*.yml` templates in the repo. |
| **Open Actions**             | Open the repository’s GitHub Actions tab.                              |
| **Configure secrets**        | Open repository Actions secrets settings.                              |
| **Run dn.init_stack**        | Dispatch stack initialization for the linked GitHub milestone.         |

Required secrets depend on the configured agent (commonly `CURSOR_API_KEY`,
`ANTHROPIC_API_KEY`, or `OPENAI_API_KEY`). Settings also lists a repo setup
checklist under **Update repos & orgs** when GitHub is connected and you have
Pro.

Initialize actions require **Online** mode and write access to the repository.

## Repository context and kickstart ordering

After initialization, Pro users may see a **Repository context** section on the
milestone. It summarizes detected signals (stack files, `AGENTS.md`, dn
workflows) and suggested kickstart targets.

Use the milestone sort control to switch to kickstart priority order. Tasks with
a kickstart complexity score show a numeric badge; disqualified tasks show a
reason when kickstart cannot run on them.

## Triggering dn workflows

For repositories with installed templates, denoise can dispatch the same
workflow events exposed by `dn workflows dispatch`:

- `dn.init_stack` — Generate milestone stack markdown and JSON files.
- `dn.prep_issue_plan` — Produce a plan for an issue.
- `dn.kickstart_issue` — Run plan plus implementation, optionally with AWP.

The repository chooses its agent in `.github/dn/config.json`; denoise dispatch
payloads do not choose the agent.

Workflow dispatch from the milestone Initialize panel and per-task actions
requires Pro.

## Task build mode

Open a task in a GitHub-linked milestone to view its description and actions.

1. Click a task to open the task detail dialog.
2. Click **Start Building!** to enter build mode (Pro required).
3. Plan work, align with collaborators, and dispatch builds from the task.

Build mode is available when:

- You have Pro (or an organization Pro seat).
- The task is in a GitHub-linked milestone with a linked issue (or eligible for
  conversion).
- The repository setup is complete (Initialize panel shows a ready state).
- You are the task owner or a collaborator on a shared task. Private tasks
  restrict build mode to the owner and collaborators.

For CLI-oriented planning and implementation, see
[Kickstart & Looping](/dn-cli/overview/) and
[Orchestrate Agents](/dn-cli/workflows/).

## Converting tasks to GitHub issues

1. Ensure the task is in a GitHub-linked milestone.
2. Use **Create Issue** on a task that is not already a GitHub issue.
3. Review the title, description, milestone, and labels.
4. Create the issue; denoise links the task and syncs future changes.

## Bidirectional sync

**App to GitHub:** task title, description, tags, and completion state can
update the linked issue.

**GitHub to app:** issue title, body, labels, closed/reopened state, and
milestone changes sync back into denoise.

If sync conflicts occur, the most recent change wins.
