---
title: Tips & troubleshooting
description: Best practices and fixing common denoise issues.
---

Use this page when denoise is connected to GitHub but sync, issue creation, or
milestone linking does not behave as expected. The tips keep app data, GitHub
issues, and collaborator visibility predictable.

## Tips and best practices

### GitHub integration

1. **Link milestones early** — Link your milestone to GitHub before adding many
   tasks, so you can convert them to issues as you go.
2. **Use tags for GitHub labels** — Tags in the app become GitHub labels.
3. **Keep descriptions detailed** — When converting tasks to issues, add
   detailed descriptions (they become the GitHub issue body).
4. **Monitor sync status** — The connection indicator shows when you're online
   and syncing with GitHub.
5. **GitHub-linked tasks** — You can't move GitHub-linked tasks to different
   milestones; the issue number prefix is managed automatically.
6. **Initialize the repo before build mode** — Install workflows, configure
   secrets, and run `dn.init_stack` from the milestone Initialize panel before
   starting build mode on tasks.

### General

1. Use milestones for projects to group related tasks.
2. Use tags to categorize tasks across milestones.
3. Set due dates to track deadlines.
4. Mark urgent tasks for high-priority items.
5. Use **Publish** to make tasks visible to collaborators (default is private).

## Troubleshooting

### "Create Issue" button doesn't appear

- Ensure the task is in a milestone
- Ensure the milestone is linked to GitHub (look for the GitHub icon)
- Ensure the task isn't already a GitHub issue

### Initialize or build actions are disabled

- **Not signed in with GitHub** — GitHub integration requires GitHub auth, not
  Google alone. See [Authentication](/denoise/authentication/).
- **Offline mode** — Switch to **Online** in the header. Initialize and dispatch
  require a server connection.
- **Milestone not linked to GitHub** — Link the milestone to a GitHub repository
  and milestone first.
- **Repository not initialized** — Open the milestone and complete the
  **Initialize this repository for dn** panel: install workflows, add Actions
  secrets, then **Run dn.init_stack**.
- **Pro required** — Install/update workflows, `dn.init_stack`, kickstart
  ordering, and **Start Building!** require
  [Denoise Pro](/denoise/subscription-and-pro/) (or an organization Pro seat).
- **Private task** — Build mode on a private task is limited to the owner and
  milestone collaborators.
- **Missing repository access** — In Settings, use **Update repos & orgs** to
  grant denoise access to the linked repository.

### Changes aren't syncing to GitHub

- Check your internet connection
- Verify you're authenticated with GitHub
- Check the browser console for errors
- Ensure you have write permissions to the GitHub repository

### GitHub issues aren't appearing in the app

- Wait a few minutes for automatic sync
- Try refreshing the page
- Verify the milestone is correctly linked to GitHub
- Check that you have read access to the repository

### Can't link a milestone to GitHub

- Ensure you're authenticated with GitHub (not just Google)
- Verify you have access to the repository and milestone
- Check that the milestone exists on GitHub
- Use **Update repos & orgs** in Settings if the repository is not listed
