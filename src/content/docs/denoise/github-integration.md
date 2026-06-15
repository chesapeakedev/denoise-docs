---
title: GitHub integration
description: Link milestones to GitHub, sync issues, and trigger dn-backed workflows.
---

Denoise connects the app experience to GitHub issues, milestones, and installed
`dn` workflows. The app can sync task state with GitHub and, when a repository
has canonical dn workflows installed, trigger planning and kickstart automation
automation from the UI.

## Prepare the repository

Install the dn workflow templates in the target repository:

```bash
dn init workflows --agent opencode
dn workflows validate --json
```

Commit `.github/dn/config.json`, `.github/dn/install-agent.sh`, and the
generated `.github/workflows/dn-*.yml` files. Set the secret required by the
configured agent, such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or
`CURSOR_API_KEY`.

See [GitHub workflow integration](/kickstart/github-actions-integration/) for
dispatch payloads, permissions, and troubleshooting.

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

GitHub issues appear in the app as `#123: Issue Title`. Sync is disabled while
offline; local changes remain saved and sync again when connectivity returns.

## Triggering dn workflows

For repositories with installed templates, denoise can dispatch the same
workflow events exposed by `dn workflows run`:

- `dn.init_stack` - Generate milestone stack markdown and JSON files.
- `dn.prep_issue_plan` - Produce a plan for an issue.
- `dn.kickstart_issue` - Run plan plus implementation, optionally with AWP.

The repository chooses its agent in `.github/dn/config.json`; denoise dispatch
payloads do not choose the agent.

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
