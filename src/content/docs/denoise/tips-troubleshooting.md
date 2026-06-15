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
