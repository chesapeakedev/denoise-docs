---
title: GitHub integration
description: Link milestones to GitHub, sync issues, and convert tasks to issues.
---

The app provides powerful integration with GitHub milestones and issues,
allowing you to manage your development workflow directly from denoise.

## Linking a milestone to GitHub

To connect a milestone in the app to a GitHub milestone:

1. **Create or select a milestone** in the app
2. When creating a new milestone, you'll be prompted: "Would you like to link a
   GitHub milestone?"
   - Click **OK** to link a GitHub milestone
   - Click **Cancel** to create a regular (non-GitHub) milestone
3. If you choose to link, the **GitHub Milestone Wizard** will open

### GitHub Milestone Wizard

**Step 1: Select Organization or User** — Choose from your GitHub organizations
or your personal account.

**Step 2: Select Repository** — Choose the repository that contains the
milestone you want to link (repositories are sorted by most recently updated).

**Step 3: Select Milestone** — Choose the specific GitHub milestone to link
(only open milestones are shown by default).

4. Click **Link Milestone** to complete the connection.

Once linked, you'll see a GitHub icon next to the milestone name, and the
milestone will automatically sync issues from GitHub.

## Automatic issue sync

When a milestone is linked to GitHub, the app automatically:

- Fetches all issues from the linked GitHub milestone
- Creates tasks in the app for each GitHub issue
- Updates tasks when issues change on GitHub
- Syncs completion status (closed issues appear as completed tasks)

**Sync behavior:** Initial sync happens when you link; the app syncs from GitHub
every 5 minutes and when you view a GitHub-linked milestone.

GitHub issues appear in the app as `#123: Issue Title`.

## Converting tasks to GitHub issues

1. Ensure your task is in a **GitHub-linked milestone** (GitHub icon next to the
   milestone).
2. Find the **"Create Issue"** button on tasks that are not already GitHub
   issues.
3. Click **Create Issue** — a dialog shows milestone info, title, description,
   and labels (task tags become GitHub labels).
4. Review and edit, then click **Create Issue**. The task becomes a GitHub issue
   and syncs bidirectionally.

## Bidirectional sync

**App → GitHub:** Updating task text updates the issue title; description and
tags sync to the issue body and labels; marking a task complete closes the
issue.

**GitHub → App:** Issue updates appear in the app within about 5 minutes;
closure/reopening and label changes sync to task completion and tags.

**Notes:** GitHub sync is disabled offline. If sync fails, local changes are
still saved. The most recent change wins.
