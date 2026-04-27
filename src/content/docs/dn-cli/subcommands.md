---
title: Subcommands
description: dn kickstart, auth, issue, prep, loop, fixup, meld, and archive.
---

## dn kickstart — full workflow

Runs the complete kickstart workflow (plan + implement phases):

```bash
# Default mode: Apply changes locally
dn kickstart https://github.com/owner/repo/issues/123

# Issue number shorthand (infers URL from current repo remote)
dn kickstart 123

# AWP mode: Full workflow with branches and PR
dn kickstart --awp https://github.com/owner/repo/issues/123

# With Cursor integration
dn kickstart --cursor https://github.com/owner/repo/issues/123

# Save a named plan file
dn kickstart --save-plan 123

# Use a specific plan name
dn kickstart --saved-plan my-feature 123

# Via environment variable
ISSUE=https://github.com/owner/repo/issues/123 dn kickstart
```

The issue argument may be a full GitHub issue URL or an issue number for the
current repository. If the URL points to a different repository than the current
workspace, kickstart exits with an error. See `dn kickstart --help` for all
options. For full kickstart documentation, see
[Kickstart overview](/kickstart/overview/).

**Options:**

| Option                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `--awp`                   | Enable AWP mode (branches, commits, PRs) |
| `--cursor, -c`            | Enable Cursor IDE integration            |
| `--save-plan`             | Force a named plan to be saved           |
| `--saved-plan <name>`     | Use a specific plan name                 |
| `--workspace-root <path>` | Workspace root directory                 |

## dn auth — sign in to GitHub

Sign in to GitHub in the browser (device flow). The token is cached so
`dn kickstart`, `glance`, etc. can use it without re-prompting:

```bash
dn auth
```

Requires `DN_GITHUB_DEVICE_CLIENT_ID` (or `GITHUB_DEVICE_CLIENT_ID`) set to your
GitHub OAuth App client ID. See [Authentication](/dn-cli/authentication/).

## dn issue — manage GitHub issues

Manage GitHub issues from the command line. Supports listing, viewing, creating,
editing, closing, reopening, and commenting on issues.

### dn issue list

List issues in the current repository:

```bash
# List open issues (default)
dn issue list

# List closed issues
dn issue list --state closed

# List all issues (open and closed)
dn issue list --state all

# Limit results
dn issue list --limit 10

# Filter by label (repeatable)
dn issue list --label bug
dn issue list --label bug --label "help wanted"

# Output as JSON
dn issue list --json
```

### dn issue show

Show details for a specific issue:

```bash
# By issue number
dn issue show 123

# By full URL
dn issue show https://github.com/owner/repo/issues/123

# Output as JSON
dn issue show 123 --json

# Hide comments
dn issue show 123 --no-comments
```

### dn issue create

Create a new issue:

```bash
# Basic issue
dn issue create --title "Bug report"

# With body text
dn issue create --title "Feature request" --body "Please add..."

# Read body from file
dn issue create --title "RFC: New Feature" --body-file rfc.md

# With labels (repeatable)
dn issue create --title "Fix needed" --label bug --label urgent

# Output as JSON
dn issue create --title "Bug" --json
```

### dn issue edit

Edit an existing issue:

```bash
# Update title
dn issue edit 123 --title "Updated title"

# Update body
dn issue edit 123 --body "New description"

# Read body from file
dn issue edit 123 --body-file updated.md

# Add labels (repeatable)
dn issue edit 123 --add-label bug
```

### dn issue close

Close an issue:

```bash
# Close an issue
dn issue close 123

# Close with a comment
dn issue close 123 --comment "Fixed in #456"

# Close as not planned
dn issue close 123 --reason not_planned

# Close as completed (default)
dn issue close 123 --reason completed
```

### dn issue reopen

Reopen a closed issue:

```bash
# Reopen an issue
dn issue reopen 123

# Reopen with a comment
dn issue reopen 123 --comment "Reopening for further discussion"
```

### dn issue comment

Add a comment to an issue:

```bash
# Add a comment
dn issue comment 123 --body "Thanks for the report!"

# Read comment from file
dn issue comment 123 --body-file response.md
```

## dn prep — plan phase only

Runs only the plan phase (Steps 1–3: resolve issue, VCS prep, plan phase):

```bash
# Create a plan file
dn prep https://github.com/owner/repo/issues/123

# Issue number shorthand (infers URL from current repo remote)
dn prep 123

# With a specific plan name
dn prep --plan-name my-feature 123

# Force save a named plan
dn prep --save-plan 123

# Via environment variable
ISSUE=https://github.com/owner/repo/issues/123 dn prep
```

The issue argument may be a full GitHub issue URL or an issue number for the
current repository. If the URL points to a different repository than the current
workspace, prep exits with an error. The plan file path is output for use with
`dn loop`.

## dn loop — loop phase only

Runs only the loop phase (Steps 4–7: implement, completion, lint, artifacts,
validate):

```bash
# Requires plan file from prep
dn loop --plan-file plans/my-feature.plan.md

# With Cursor integration
dn loop --plan-file plans/my-feature.plan.md --cursor

# Via environment variable
PLAN=plans/my-feature.plan.md dn loop
```

**Note:** `dn loop` requires a plan file created by `dn prep`.

## dn fixup — address PR feedback

Fetches PR comments and implements requested changes locally. Useful for
addressing reviewer feedback without leaving your terminal:

```bash
# Fetch PR comments and implement fixes
dn fixup https://github.com/owner/repo/pull/123

# With Cursor integration
dn fixup --cursor https://github.com/owner/repo/pull/123

# Via environment variable
PR_URL=https://github.com/owner/repo/pull/123 dn fixup
```

**Behavior:**

- If already on the correct branch, no git/sl commands are executed
- If on a different branch, the PR branch will be checked out
- After fixup, changes remain uncommitted for your review

## dn meld — merge and trim markdown sources

Merges multiple markdown sources (local files and/or GitHub issue URLs) into a
single DRY document with an Acceptance Criteria section:

```bash
# Merge files to stdout
dn meld a.md b.md

# From a newline-separated list, write to file
dn meld -l sources.txt -o plans/merged.plan.md

# Cursor mode: add YAML frontmatter (name, overview, todos, isProject)
dn meld a.md https://github.com/owner/repo/issues/123 --cursor

# Mix local files and GitHub issues
dn meld spec.md https://github.com/owner/repo/issues/45

# Opencode mode (default): no frontmatter
dn meld a.md b.md --opencode
```

**Options:**

| Option                | Description                                     |
| --------------------- | ----------------------------------------------- |
| `--list, -l <path>`   | Newline-separated list of sources               |
| `--output, -o <path>` | Write merged markdown to file (default: stdout) |
| `--cursor, -c`        | Cursor mode: add YAML frontmatter               |
| `--opencode`          | Opencode mode (default): no frontmatter         |

## dn archive — derive commit message from a plan file

Reads a plan file and prints a commit message (summary + body). With `--yolo`,
commits staged files with that message and deletes the plan file:

```bash
# Print derived commit message
dn archive plans/my-feature.plan.md

# Commit staged files with derived message, then delete the plan file
dn archive plans/my-feature.plan.md --yolo
```

## Usage examples

```bash
# Full workflow: implement a GitHub issue end-to-end
dn kickstart --awp https://github.com/owner/repo/issues/123

# Quick issue triage from the terminal
dn issue list --label bug --limit 5
dn issue show 123

# Sequential workflow: plan first, then implement
dn prep --plan-name my-feature 123
# Review the plan file, then continue
dn loop --plan-file plans/my-feature.plan.md

# Address PR feedback
dn fixup https://github.com/owner/repo/pull/456

# Create an issue and immediately start work
dn issue create --title "Fix login bug" --label bug
dn kickstart 124  # assuming 124 is the new issue number

# Merge specs and issues into a unified plan
dn meld spec.md https://github.com/owner/repo/issues/123 -o plans/unified.plan.md

# After completing work, commit with derived message
git add -A
dn archive plans/my-feature.plan.md --yolo

# Close issue with comment after merging PR
dn issue close 123 --comment "Fixed in #456"
```
