---
title: Kickstart usage
description: How dn kickstart plans and implements GitHub issues or local markdown specs, with troubleshooting.
---

Kickstart is one `dn` workflow for turning a GitHub issue, issue number,
milestone queue item, or local markdown spec into a plan and implementation. For
the broader command map, start with [Command overview](/dn-cli/subcommands/) or
[Basic Usage](/dn-cli/workflows/).

## CLI usage

```bash
# Full workflow
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123

# Local markdown context, with no GitHub fetch and no AWP mode
dn kickstart docs/spec.md

# Plan phase only
dn prep 123

# Loop phase only; auto-discovers the latest plan if omitted
dn loop --plan-file plans/<name>.plan.md

# Select an agent harness
dn --agent codex kickstart 123
dn --agent claude prep 123
```

Issue arguments can be full GitHub issue URLs, issue numbers for the current
repository, or local markdown files. Cross-repository issue URLs require
`--allow-cross-repo`; AWP mode remains same-repository because branch, commit,
and PR operations need the current workspace repository.

## Two modes

- **Default mode** - Applies changes locally. You handle commits and PRs
  manually. It uses `plans/.last.plan.md` unless a specific plan is selected
  with `--saved-plan <name>` or a plan name is requested during continuation.
- **AWP mode** - Creates a branch/bookmark, commits changes, pushes, and opens a
  PR. It uses named plan files in `plans/[name].plan.md` and requires Git or
  Sapling.

## How it works

1. Resolve issue context from GitHub or load a local markdown file.
2. Select the plan path and run the plan phase.
3. Validate the plan file.
4. Run the implement phase.
5. Check acceptance-criteria completion.
6. Generate continuation prompts if work remains.
7. Run linting and generate agent artifacts where applicable.
8. In AWP mode, commit, push, and create a PR.

Kickstart can also work from milestone stack files created by `dn init stack`:

```bash
dn init stack 42
dn kickstart --milestone 42
dn kickstart --milestone 42 --complete
```

`--complete` runs remaining unchecked stack tasks without prompting between
queue items. Plan naming and agent prompts can still occur unless separately
configured.

## Dependencies

- [Deno](https://deno.com/) and an agent harness in `PATH`
- GitHub authentication through `gh`, `dn auth`, or `GITHUB_TOKEN`
- Git or Sapling for AWP mode

See [Basic Usage](/dn-cli/workflows/) for the command-family reference.

## Troubleshooting

### Debug files

On failure (or when `SAVE_CTX=1`), debug files are kept in
`/tmp/geo-opencode-{pid}/`:

- **`combined_prompt.txt`** — Full combined prompt sent to opencode
- **`opencode_stdout.txt`** — Standard output from opencode
- **`opencode_stderr.txt`** — Standard error from opencode
- **`issue-context.md`** — Formatted issue context (if fetched from GitHub)

Set `SAVE_CTX=1` to preserve these on success as well.

### Common issues

#### "opencode not found"

**Symptom:** Script exits because opencode is not in PATH.

**Solutions:**

- Install opencode: [opencode.dev](https://opencode.dev/)
- Verify: `opencode --version`
- Ensure the directory containing `opencode` is in your `PATH`

#### "No GitHub token found"

**Symptom:** Error when fetching issues or creating PRs.

**Solutions:**

- **Preferred:** Install [GitHub CLI](https://cli.github.com/) and run
  `gh auth login`; dn uses it automatically
- **Alternative:** Run `dn auth` to sign in in the browser; token is cached
- **CI/scripts:** Set `GITHUB_TOKEN` with a
  [Personal Access Token](https://github.com/settings/tokens) (fine-grained PAT
  recommended)
- In GitHub Actions: use `${{ secrets.GITHUB_TOKEN }}`

See
[Installation — GitHub authentication](/dn-cli/installation/#github-authentication)
for details.

#### "Issue URL points to a different repository"

**Symptom:** Kickstart or prep exits with an error like: _Issue URL points to a
different repository (owner/repo) than the current workspace
(currentOwner/currentRepo)._

**Cause:** The issue URL you passed refers to a repository that is not the one
in your current workspace. Kickstart only implements issues from the repository
you are working in.

**Solutions:**

- Use an issue URL from the current repository (the one your Git/Sapling remote
  points to).
- Or pass only the issue number (e.g. `dn kickstart 123`) when you are inside
  the repo; kickstart infers the full URL from the workspace remote.

#### Workspace root detection

**Symptom:** Script uses the wrong directory or can't find files.

**Solutions:**

- Set **`WORKSPACE_ROOT`** when running from another directory:
  ```bash
  WORKSPACE_ROOT=/path/to/workspace dn kickstart <issue_url_or_number>
  ```
- Or run from the workspace root: `cd /path/to/workspace` then run kickstart
- Check console output for the workspace root kickstart is using

#### Binary not executable

**Symptom:** Permission denied when running a compiled binary.

**Solutions:**

- `chmod +x kickstart` (or the binary you're running)
- Check permissions: `ls -l kickstart`

#### "GitHub Actions is not permitted to create or approve pull requests"

**Symptom:** Workflow fails when trying to create a PR in CI.

**Solution:** Enable PR creation in repository settings:

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Enable **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

#### "non-fast-forward" push rejected

**Symptom:** Push fails with
`Updates were rejected because the tip of your
current branch is behind its remote counterpart`.

**Cause:** A previous workflow run created the branch but failed before
completing (e.g., PR creation failed).

**Solution:** Kickstart uses `--force-with-lease` to handle this automatically.
If you still see this error, the remote branch may have been modified by someone
else since the last fetch. Delete the remote branch manually and retry:

```bash
git push origin --delete kickstart/issue_123_feature-name
```

### Getting help

If issues aren't covered here:

1. **Inspect debug files** — Set `SAVE_CTX=1` and look in
   `/tmp/geo-opencode-{pid}/`
2. **Check prerequisites** — Deno, opencode, GitHub auth, and (for AWP) Git or
   Sapling
3. **Read error messages** — They often include paths and next steps
