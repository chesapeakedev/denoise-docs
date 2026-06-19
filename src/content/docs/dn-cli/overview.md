---
title: Kickstart & Looping
description: In-depth usage of dn kickstart, prep, and loop for planning and implementing work from GitHub issues or plan files.
---

`dn kickstart` runs planning and implementation in one command. `dn prep` and
`dn loop` split that workflow: prep writes a plan for review, loop implements
from an existing plan. Use this page for in-depth usage of all three. For the
broader command map, see [Subcommands](/dn-cli/subcommands/) or
[Orchestrate Agents](/dn-cli/workflows/).

## Writing good GitHub issues

Kickstart and prep read the issue title, body, labels, and comments, then turn
that context into a plan. `dn loop` does not fetch issues — it reads a plan file
you (or prep/kickstart) already created. Issue quality still matters when you
use prep + loop, because the plan is built from the same context.

### State the outcome, not just the task

Open with what should be true when the work is done. A bug report should
describe expected behavior, actual behavior, and how to reproduce. A feature
request should describe the user-visible change and why it matters. Vague titles
like "Fix login" or "Improve performance" force the agent to guess intent.

### Write testable acceptance criteria

Use a checklist the agent can mark complete during implementation:

```markdown
- [ ] Unauthenticated requests to `/api/profile` return 401
- [ ] Authenticated requests return the user's profile JSON
- [ ] Existing session tests in `auth/session_test.ts` still pass
```

Prep and kickstart carry these criteria into the plan file. `dn loop` uses the
same checklist as the progress signal — completed items become `[x]`, remaining
items stay `[ ]`. See [Filesystem Context](/dn-cli/filesystem-context/) for how
that handoff works.

Concrete, observable criteria beat prose paragraphs. Prefer "returns 401" over
"handles errors correctly."

### Point to the code

Name files, modules, or directories when you know them:

- "Update validation in `src/auth/session.ts`"
- "Follow the pattern in `handlers/user.go`"
- "See `docs/rfc-auth.md` for the intended design"

The agent still explores the repo, but starting pointers reduce wrong-file edits
and speed up the plan phase.

### Define scope and non-goals

Say what is out of scope explicitly:

- "Do not change the public API"
- "No database migration in this issue"
- "Defer mobile layout to #456"

Without boundaries, agents tend to expand scope — especially in AWP mode where
changes land as a PR.

### Keep one issue to one deliverable

Large issues produce large plans and harder-to-review diffs. Split work when you
can:

- One issue for the data model, another for the API, another for the UI
- Use `dn prep` on each issue separately, then `dn loop` after review

For milestone-sized work, use `dn init stack` to queue issues in priority order
instead of cramming everything into one ticket.

### Link related context

Reference prior issues, PRs, design docs, or failing CI runs in the body.
Comments on the issue are fetched too — use them for clarifications that came up
in discussion rather than rewriting the whole description.

## dn kickstart

`dn kickstart` resolves issue context (or loads a local markdown file), plans,
implements, and checks acceptance criteria in one run.

```bash
# Full workflow
dn kickstart https://github.com/owner/repo/issues/123
dn kickstart 123

# Local markdown context, with no GitHub fetch and no AWP mode
dn kickstart docs/spec.md

# AWP: branch/bookmark, commit, push, and PR
dn kickstart --awp 123

# Select an agent harness
dn --agent codex kickstart 123
```

Issue arguments can be full GitHub issue URLs, issue numbers for the current
repository, or local markdown files. Cross-repository issue URLs require
`--allow-cross-repo`; AWP mode remains same-repository because branch, commit,
and PR operations need the current workspace repository.

### Kickstart modes

These modes apply to **`dn kickstart` only**. `dn loop` does not create branches
or PRs and does not use AWP.

- **Default mode** — Applies changes locally. You handle commits and PRs
  manually. Uses `plans/.last.plan.md` unless a specific plan is selected with
  `--saved-plan <name>` or a plan name is requested during continuation.
- **AWP mode** (`--awp`) — Creates a branch/bookmark, commits changes, pushes,
  and opens a PR. Uses named plan files in `plans/[name].plan.md` and requires
  Git or Sapling.

### How kickstart works

1. Resolve issue context from GitHub or load a local markdown file.
2. Select the plan path and run the plan phase.
3. Validate the plan file.
4. Run the implement phase.
5. Check acceptance-criteria completion.
6. Generate continuation prompts if work remains.
7. Run linting and generate agent artifacts where applicable.
8. In AWP mode, commit, push, and create a PR.

Steps 3–6 are the same work `dn loop` performs when you already have a plan.

### Milestone queues

Kickstart can consume milestone stack files created by `dn init stack`:

```bash
dn init stack 42
dn kickstart --milestone 42
dn kickstart --milestone 42 --complete
```

`--complete` runs remaining unchecked stack tasks without prompting between
queue items.

## dn prep

`dn prep` runs only the planning phase (kickstart steps 1–3). Use it when you
want to review or edit the plan before any code changes land.

```bash
dn prep https://github.com/owner/repo/issues/123
dn prep 123
dn prep docs/spec.md
dn prep --plan-name my-feature 123
```

The command prints the plan file path. Continue with `dn loop` when the plan
looks right.

## dn loop

`dn loop` runs only the implementation phase (kickstart steps 3–6). It does
**not** fetch GitHub issues, resolve milestone queues, or run AWP. You need an
existing plan file — typically from `dn prep`, a prior `dn kickstart` run, or a
hand-written spec in `plans/`.

### When to use loop

- After `dn prep` — review the plan, edit acceptance criteria, then implement.
- After a partial kickstart — work stopped with remaining checklist items; run
  loop again on the same plan or its continuation file.
- Human/agent handoff — someone planned, someone else (or another agent session)
  implements from the saved plan.
- Iteration without re-planning — adjust the plan file manually, then re-run
  loop.

### CLI usage

```bash
# Implement from a specific plan
dn loop --plan-file plans/my-feature.plan.md

# Or set PLAN for scripts
PLAN=plans/my-feature.plan.md dn loop

# Auto-discover the latest plan in plans/
dn loop

# Select an agent harness
dn --agent claude loop --plan-file plans/my-feature.plan.md
```

### How loop works

1. Load the plan file (`--plan-file`, `PLAN`, or auto-discovery).
2. Validate the plan structure and acceptance criteria.
3. Run the implement phase with the selected agent harness.
4. Update acceptance criteria in the plan as items complete.
5. Write a continuation prompt if work remains.

Loop reuses the plan's issue context and code pointers — it does not re-fetch
the GitHub issue. If the issue changed on GitHub after planning, edit the plan
or run `dn prep` again.

### Continuation and re-runs

When acceptance criteria are not fully checked, loop (like kickstart) can write
`plans/[name].continuation.plan.md` with remaining work. Re-run loop on the main
plan or merge the continuation file per
[Filesystem Context](/dn-cli/filesystem-context/).

If multiple plan files exist and you omit `--plan-file`, `dn loop` picks the
latest plan in `plans/`. For non-interactive runs, always pass `--plan-file` or
`PLAN`.

## Dependencies

- [Deno](https://deno.com/) and an agent harness in `PATH`
- GitHub authentication through `gh`, `dn auth`, or `GITHUB_TOKEN`
- Git or Sapling for kickstart AWP mode only (not required for `dn loop`)

See [Orchestrate Agents](/dn-cli/workflows/) for the command-family reference.

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

- `chmod +x dn`
- Check permissions: `ls -l dn`

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
