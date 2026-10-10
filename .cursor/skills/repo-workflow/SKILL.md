---
name: repo-workflow
description: >-
  denoise-docs repo workflow: detect Git vs Sapling checkout, run make/dn targets,
  and use the matching VCS CLI for commits. Use for make check, make sync, make
  deploy, creating commits, status/diff, or any sync or deploy task in this repo.
---

# denoise-docs repo workflow

Single skill for this repository: **detect VCS first**, then use **Make** /
**`dn`** for shared workflows and the **matching CLI** only for local commits
and history.

## 1. Ground truth (run before `git` or `sl`)

From the repository root (or any path inside it):

```bash
make repo_vcs
# or
./scripts/detect_vcs.sh --json
```

Example output:

```json
{"vcs":"git","root":"/path/to/denoise-docs"}
```

| `vcs` | Meaning |
| ----- | ------- |
| `sapling` | Repository root has a **`.sl`** directory (`dn` and this script choose Sapling). |
| `git` | No `.sl` at root; **`.git`** at root (plain Git checkout). |
| `unknown` | Not a recognized checkout; do not guess. |

Rules (same as [Task lists and sync — `dn sync`](/dn/task-list-and-sync/#dn-sync)):

- **`.sl` at root wins** over `.git` in dual-metadata trees.
- **`sl` on PATH does not imply Sapling** — only `.sl` metadata does.
- Re-run detection if the user switched checkouts or workspaces.

Do not run `git` and `sl` interchangeably in one task after detection; stick to
the reported `vcs`.

## 2. Shared commands (VCS-agnostic)

| Goal | Command |
| ---- | ------- |
| Lint, skill validation, production build | `make check` |
| Format tracked paths | `make fmt` or `make fix` |
| Sync local work to remote `main` | `make sync` (`dn sync`) |
| Verify SSH before Pi deploy | `make check_deploy` |
| Build and deploy docs to the Pi | `make deploy` |
| Sync then deploy | `make publish` |
| Deploy to Deno Deploy | `make deploy_deno` |
| Astro rebuild + Deno preview | `make dev_hot_reload` |
| Mirror `.cursor/skills` → `.codex/skills` | `make sync_codex_skills` |

Always use **`make sync`** to publish to `main`; do not hand-roll `git pull` /
`sl pull` for the standard path unless the user asks.

`scripts/repo_sync.sh` is legacy Sapling-only; prefer **`make sync`**.

## 3. Local VCS commands (after detection)

Use non-interactive commands. Pass explicit paths for focused commits.

### Sapling (`vcs` = `sapling`)

Run from the JSON `root` (or `sl root`).

| Task | Command |
| ---- | ------- |
| Status | `sl status` |
| Diff | `sl diff` |
| Stage adds/deletes | `sl addremove [paths…]` |
| Commit | `sl commit -m "Message" [paths…]` |
| Recent history | `sl log -r . -T "{node\|short} {desc\|firstline}\n"` |
| Show commit | `sl show` |

Avoid unless the user explicitly requests: `sl split`, `sl histedit`,
`sl rebase --interactive`, `sl fold`, `sl absorb`, `sl amend`.

### Git (`vcs` = `git`)

Run from the JSON `root` (`git rev-parse --show-toplevel` should match).

| Task | Command |
| ---- | ------- |
| Status | `git status` |
| Diff | `git diff` |
| Stage | `git add [paths…]` (include `-A` or explicit paths as needed) |
| Commit | `git commit -m "Message"` (stage first; or `git commit -m "…" -- paths` where supported) |
| Recent history | `git log -3 --oneline` |

Avoid unless the user explicitly requests: `git rebase -i`, `git commit --amend`
(except when user rules allow amend).

### User commit rules

When the user asks for commits, follow their Cursor/git safety rules (status,
diff, message style) but execute them with the **detected** CLI from section 3.

## 4. Docs guardrails

After sidebar or content path changes, run `make check`. Slug-only check:

```bash
node .cursor/skills/astro-starlight-playwright-guardrails/scripts/validate-sidebar-slugs.mjs
```

## Codex

Canonical: `.cursor/skills/repo-workflow/`. Mirrored under `.codex/skills/` via
`make sync_codex_skills` (runs in `make check`).
