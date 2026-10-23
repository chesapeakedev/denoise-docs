---
title: When kickstart needs an engineer
description: Recognize failed or unsatisfying denoise kickstart runs and hand work to developers without assuming every publish path succeeds.
---

Kickstart can plan and implement from a milestone task, but it does not replace
engineering judgment. A run can fail before it opens a pull request, stop after
a weak plan, or produce a PR that still needs design, tests, or scope changes.
Product managers often kickstart first; software engineers routinely finish,
correct, or replace that work.

This page helps both roles agree on **when** to escalate and **what artifacts**
to pass along. It does not assume `--publish pr`, **Open a pull request**, or
GitHub Actions will succeed on every attempt.

## What “success” and “needs an engineer” look like

| Outcome                        | Typical signals in denoise                                                       | Usually enough for the product owner?                            |
| ------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Good enough to review**      | PR link on the task row, CI running or green on GitHub                           | Often yes — review the PR like any other                         |
| **Plan only, not implemented** | **Review plan** appeared; you did not approve, or the run stopped after planning | No — needs engineering or a revised issue                        |
| **Implementation incomplete**  | Row stuck in **Implementing**, timeout, or **Kickstart again** with no PR        | No                                                               |
| **Published but wrong**        | PR exists but scope, quality, or approach is off                                 | No — engineer takeover on branch or new plan                     |
| **Never started**              | Queued for a long time, **Cancel**, or runner **Offline** / **Needs setup**      | No — fix runner or hand issue to someone with a working checkout |

Treat **Kickstart again** as a retry, not proof the first run succeeded. Each
attempt should start from an updated issue, plan, or branch state — not from
hope that the next run will “just work.”

## For product managers: spot the handoff early

You do not need to read agent logs to decide whether engineers should step in.
Use the milestone task row, the GitHub issue, and (when it exists) the pull
request.

**Stop and involve engineering when any of these are true:**

- The kickstart row shows **failed**, **Cancel**d, or no progress for longer
  than your phase time limits (see
  [Milestone details — Kickstart a task](/denoise/milestone-details/#kickstart-a-task)).
- **Review plan** shows an approach you would not approve for production (wrong
  files, missing constraints, unsafe shortcuts). Do not approve implementation
  just to “see what happens.”
- A PR opened but CI is red, the diff touches unrelated areas, or acceptance
  criteria in the issue are still unmet.
- You chose **Review locally before publishing** and the changes live on a
  **paired device** you do not use yourself — only someone with that checkout
  can **Land**, **Sync**, and **Done** from the task dialog (see
  [Kickstart](/kickstart/)).
- The issue was vague and kickstart exposed ambiguity (multiple valid designs,
  missing API contracts, unclear permissions).

**Before you ping engineering, add to the GitHub issue:**

1. Link to the denoise task (milestone + issue number).
2. What you wanted versus what kickstart produced (one short paragraph).
3. Links: GitHub PR (if any), failed Actions run (if GitHub Actions), or note
   that work is leave-local on a device runner.
4. Whether you want **fix the PR**, **replan and re-implement**, or **abandon
   this attempt** and reset the branch.

Denoise does not today offer a dedicated **Assign to engineer** or **Request
takeover** control. Handoff is the issue, the PR, and explicit team process.
That gap is intentional to call out: if your org needs in-app assignment or
takeover state, track it as product feedback.

## For software engineers: pick up the work

Assume the PM already kickstarted once. Your job is to make the next step
**durable** — correct plan, correct branch, reviewable PR — not to rerun the
same kickstart blindly.

### 1. Locate artifacts

| Source                   | What to open                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Task row **PR** link     | Branch and diff on GitHub                                                                                                                      |
| GitHub issue             | Original intent, PM comments, test plan sections                                                                                               |
| GitHub Actions           | Workflow run for `dn.kickstart_issue` when the app used Actions — see [Headless use — Troubleshooting](/runners/headless-use/#troubleshooting) |
| Device or exe.dev runner | Registered checkout; `plans/*.plan.md` and continuation files after leave-local runs                                                           |
| No PR, failed publish    | Issue body and labels only — you may need a fresh branch from `main`                                                                           |

For queued jobs with no phases, start with [Runner logs](/runners/runner-logs/).

### 2. Choose a recovery path

| Situation                              | Practical next step                                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PR exists, feedback is review-shaped   | Check out the branch; use [`dn fixup`](/dn/command-reference/#dn-fixup) or normal PR review                                           |
| Plan is wrong but issue is fixable     | [`dn meld`](/dn/command-reference/#plan-with-meld) → edit `plans/*.plan.md` → [`dn loop`](/dn/command-reference/#implement-with-loop) |
| Kickstart left partial checklist items | Same plan file or `*.continuation.plan.md`; `dn loop` on the plan                                                                     |
| No trustworthy plan                    | Re-meld from the issue; or narrow the issue and kickstart locally with `--publish none` before a new PR                               |
| Publish failed after push              | Inspect remote branch and GitHub permissions; see Headless troubleshooting (**No PR created**)                                        |
| You own quality gates                  | [`dn until`](/dn/command-reference/#dn-until) or repo CI, then [`dn land`](/dn/command-reference/#dn-land) for leave-local work       |

The split workflow (plan review separate from implementation) is documented in
[Completing GitHub Issues — Choose the right handoff](/dn/completing-github-issues/#choose-the-right-handoff).
That path is the default when PM kickstart is exploratory and engineering owns
the merge bar.

### 3. Reset expectations with the PM

After takeover, comment on the issue with:

- Branch or PR you are using going forward.
- Whether the kickstart PR will be closed in favor of a new branch.
- What “done” means for this issue (tests, design sign-off, feature flag, etc.).

Kickstart does not run your full test suite as the final publish gate. Host CI
and human review still define merge readiness — see
[Kickstart — What kickstart does](/kickstart/#what-kickstart-does).

## Common failure modes (by phase)

### Runner or dispatch never completes

Symptoms: **Queued**, **Offline** runner, or kickstart disabled on the setup
page. Follow
[Tips & troubleshooting — Runners or kickstart actions are disabled](/denoise/tips-troubleshooting/#runners-or-kickstart-actions-are-disabled)
and [Runner logs](/runners/runner-logs/). GitHub Actions paths need installed
workflows and secrets — not only a green milestone in denoise.

### Plan phase produces the wrong shape

Symptoms: **Review plan** with content you would not ship. Prefer **not**
approving implementation. Update the issue (acceptance criteria, links, out of
scope notes), then either ask an engineer to **meld** a new plan or kickstart
again with clearer **Additional guidance** on the setup page.

**Product gap:** denoise does not keep a durable “rejected plan” audit trail
separate from the issue; rejection rationale should live in GitHub comments.

### Implementation or publish fails

Symptoms: run ends without a PR, **Kickstart again** with no link, or Actions
failure. Engineers should read the workflow summary and logs. Publish modes
(`pr`, `direct`, leave-local) change where files land — they do not guarantee
GitHub accepts the push or that CI passes.

### PR exists but is not mergeable

Symptoms: red CI, large unrelated diff, missing tests. This is normal
post-kickstart work. Engineers use review, `dn fixup`, or manual commits; PMs
should not treat “PR opened” as “feature shipped.”

## Reducing bad handoffs before kickstart

- Write implementation-ready issues — see
  [Completing GitHub Issues — Prepare the issue](/dn/completing-github-issues/#prepare-the-issue).
- Initialize stack and runners before the first kickstart on a milestone —
  [Milestone details](/denoise/milestone-details/).
- For high-risk work, skip one-shot app kickstart to PR; have engineering run
  `meld` → `loop` → land locally first, or kickstart with **Review locally
  before publishing** on a device checkout engineers control.

## Related pages

- [Milestone details](/denoise/milestone-details/) — Kickstart UI, plan review,
  publish choices
- [Kickstart](/kickstart/) — Publish modes and leave-local Land / Sync / Done
- [Command reference](/dn/command-reference/) — `meld`, `loop`, `land`, `fixup`,
  `until`
- [Completing GitHub Issues](/dn/completing-github-issues/) — CLI handoff
  patterns
- [Runner logs](/runners/runner-logs/) — Device and exe.dev diagnosis
- [Headless use](/runners/headless-use/) — GitHub Actions kickstart failures
