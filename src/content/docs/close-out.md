---
title: Kickstart, land, sync, and done
description: The four close-out verbs mean the same thing in the dn CLI and in the denoise task dialog.
---

The `dn` CLI and the denoise task dialog use the same four verbs in the same
order. Use this page when you need to know what each control does, when quality
checks run, and what to do next. Command flags live on
[Command reference](/dn/workflows/).

## When to use this loop

Use **Kickstart → Land → Sync → Done** when work stays on a paired device
(`dn kickstart --publish none`, the device-runner default in denoise). Use
**Kickstart → CI → Done** when kickstart opens a pull request (GitHub Actions,
cloud, or device `pr`).

Do not auto-land, auto-sync, or auto-close. Confirm Land and Sync the same way
you confirm Kickstart.

## The four verbs

| Verb          | `dn` command    | Denoise control                      | What it does                                                                                                            |
| ------------- | --------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Kickstart** | `dn kickstart`  | **Kickstart**                       | Plan, implement, then `dn ensure lint` so a fixer agent can clear fmt/lint. Does not run tests. Does not push to trunk. |
| **Land**      | `dn land`       | **Land** (device runner)             | Local commits. Does not push.                                                                                           |
| **Sync**      | `dn sync`       | **Sync** (device runner, after Land) | Fail-fast lint + tests from `sync.preflight`, then rebase and push. No fixer agent.                                     |
| **Done**      | close the issue | Status control (complete / reopen)   | Closes the GitHub issue. Not trunk publish.                                                                             |

Leave-local kickstart in denoise shows **Resolve → Plan → Implement → Lint**.
Lint is `dn ensure lint` (fixer). **Publish** is not part of that job; Land then
Sync own commit and trunk.

## Two paths

**Leave local** (device default, CLI `--publish none`):

1. **Kickstart** — implement, then ensure lint.
2. Review the checkout.
3. **Land** — commit locally. Denoise asks you to confirm.
4. **Sync** — lint again (fail-fast), run tests, rebase onto trunk, push.
   Denoise asks you to confirm. If preflight fails, the work stays landed; retry
   **Sync**. The UI never skips quality checks.
5. **Done** — mark the GitHub issue complete.

**Open a pull request** (GitHub Actions, cloud, or device `pr`):

1. **Kickstart** — implement, then ensure lint, then open the PR.
2. Host **CI** is the quality gate.
3. **Done** — mark the GitHub issue complete.

There is no Land or Sync button on the PR path. GHA and cloud stay PR-only.

## Where quality runs

| Step      | Lint / fmt                      | Tests                  | Fixer agent | Role                            |
| --------- | ------------------------------- | ---------------------- | ----------- | ------------------------------- |
| Kickstart | Yes — `dn ensure lint`          | No                     | Yes         | Useful code before Land or a PR |
| Land      | No                              | No                     | No          | Local commits                   |
| Sync      | Yes — same lint argv, fail-fast | Yes — `sync.preflight` | No          | Trunk gate after review         |
| PR / CI   | Host CI                         | Host CI                | No          | Gate for the PR path            |
| Done      | No                              | No                     | No          | Close the GitHub issue          |

Kickstart lints so the agent can fix fmt/lint. Sync (or CI on the PR path) is
the publish gate and re-runs lint plus tests. Duplicate lint is expected: it is
cheap and catches edits during review. Kickstart never runs tests.

Repositories declare the commands in `dn.json` (`ensure.lint` and
`sync.preflight`), not in the denoise UI. Keep `ensure.lint.argv` aligned with
the lint entry of `sync.preflight`. If `ensure.lint` is missing, kickstart skips
lint and says so. If `sync.preflight` is missing, Sync still rebases and pushes
and says quality checks are absent.

`--skip-preflight` is a CLI escape hatch only. Denoise never sends it. Do not
start a fixer agent at Sync time; that would dirty a tree that already has
commits.

## Name collision: this Sync is not Void task-sync

**Sync** in this loop is trunk publish (`dn sync` / **Sync** on a landed issue).
Runner **task-sync** is the Void relay into `~/.dn/tasks/` on a paired laptop.
See [Runners](/runners/device-runners/) for the Void relay.

## Next steps

- [Completing GitHub Issues](/dn/completing-github-issues/) — CLI variants (PR,
  meld, fixup, until)
- [Milestone details](/denoise/milestone-details/) — task dialog controls
- [Command reference](/dn/workflows/) — `dn land` and `dn sync` flags
- [Kickstart runtimes](/runners/kickstart-runtimes/) — where Kickstart runs
- [Runners](/runners/device-runners/) — pairing, Land, and Sync on a laptop
