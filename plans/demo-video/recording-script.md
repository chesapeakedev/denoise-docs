# Recording script and segment guide

Target length: **3–5 minutes** after edit. Record segments **out of narrative
order** (see [Recording order](#recording-order)) to avoid waiting on GitHub
Actions between takes.

Audience: PMs, designers, and team leads who plan in denoise; mention `dn` CLI
for developers in the close only.

Prerequisites: Complete [prep-personal-checklist.md](./prep-personal-checklist.md)
and [org-broll-shot-list.md](./org-broll-shot-list.md).

---

## Recording order

Record in this sequence (not the final video order):

| Order | Segment ID | Content | Est. raw length |
| ----- | ---------- | ------- | --------------- |
| 1 | `BROLL-ORG` | Org B-roll per shot list | 2–3 min total |
| 2 | `LINK` | Personal: link wizard + synced list | 45–60 sec |
| 3 | `INIT` | Personal: init_stack dispatch + result | 60–90 sec |
| 4 | `KS` | Personal: kickstart dispatch + status | 45–60 sec |
| 5 | `LOCAL` | Org: non-GitHub milestone clip | 15–20 sec |
| 6 | `INTRO` | Org Roadmap intro | 20–25 sec |
| 7 | `OUTRO` | Org results + Roadmap close | 25–30 sec |

---

## Segment `INTRO` — Hook and mental model

**Workspace:** Org  
**Route:** Roadmap (`/`)  
**Final timeline:** 0:00–0:25

### On screen

- **Online** badge visible in header.
- Pan across 2–3 milestone cards.
- Point at GitHub indicator on the linked org milestone card.

### Narration

> denoise is collaborative planning that connects to GitHub. You organize work
> in milestones on the Roadmap, sync issues from GitHub, and dispatch agent
> workflows—stack planning and kickstart—without leaving the app.

### Skip

Workbench, Focus timer, profile, full tour.

---

## Segment `LOCAL` — Planning without GitHub

**Workspace:** Org  
**Route:** Non-GitHub milestone → task list  
**Final timeline:** 0:25–0:45

### On screen

- Open the non-GitHub milestone.
- Show one or two task rows.
- Optional: **Add task** for up to 5 seconds.

### Narration

> You can plan locally first—milestones and tasks work offline. When you are
> ready to connect engineering work, link a milestone to GitHub.

### Skip

Tags, due dates, filters, task edit dialog.

---

## Segment `LINK` — GitHub connectivity

**Workspace:** Personal  
**Route:** Roadmap → workspace selector → demo milestone → Edit milestone →
GitHub Milestone Wizard  
**Final timeline:** 0:45–1:30

### On screen

1. **Workspace selector** → switch to Personal.
2. Open the clean demo milestone.
3. **Edit milestone** → start GitHub Milestone Wizard.
4. Select organization or user.
5. Select repository.
6. Select open milestone → **Link Milestone**.
7. Milestone view: synced issues as `#123: Title`.
8. Optional: click **GitHub refresh** once (3 seconds).

### Narration

> Linking is a one-time setup. Pick the org or user, repository, and open GitHub
> milestone—denoise syncs issues into tasks automatically.

### Optional beat (5 sec)

> You can also create GitHub issues from local tasks with **Create Issue**.

Skip if it adds friction.

### Skip

Import from GitHub, conflict resolution, label details.

---

## Segment `SETUP` — Repository setup (can combine with `INIT`)

**Workspace:** Personal  
**Route:** Linked milestone view  
**Final timeline:** 1:30–2:00

Record as part of `INIT` take or a short insert before clicking init_stack.

### On screen

1. **DN setup action row**: agent picker, **Install/Update workflows** (or point
   at existing install).
2. Setup strip: **Ready for dn kickstart and prep**.
3. Brief mention of overflow **Configure secrets** (do not walk through GitHub
   secrets UI).

### Narration

> For automation, the repo needs dn workflows and an agent configured. denoise
> installs the workflow templates and dispatches GitHub Actions for you. The
> agent API key lives in GitHub Actions secrets—we have that set up here.

### Skip

Full secrets walkthrough, `dn workflows validate`, every setup state in the table.

---

## Segment `INIT` — Dispatch init_stack

**Workspace:** Personal  
**Route:** Linked milestone view  
**Final timeline:** 2:00–2:45

### On screen

1. Click **Run dn.init_stack**.
2. Setup strip: **Dispatching dn.init_stack…**
3. Toast → **Watch on GitHub** (record the click; cut the wait in edit).
4. After workflow completes (record in a second take if needed):
   - Turn on **Kickstart order** chip.
   - Show complexity badges on task rows.
   - Expand **Repository & dn setup** for ~5 seconds.

### Narration

> init_stack scans the repo and builds milestone stack context—priority order
> and complexity for kickstart. denoise dispatches the workflow and tracks it
> in GitHub Actions.

After completion:

> Once stack context is loaded, you can sort by kickstart priority and see
> suggested targets for what to run next.

### Skip

Staleness pill, re-run init_stack, prep_issue_plan.

### Note for editor

Cut from dispatch click to completed state; insert org B-roll during the wait
(see [edit-guide.md](./edit-guide.md)).

---

## Segment `KS` — Dispatch kickstart

**Workspace:** Personal (live) + Org (cutaway)  
**Route:** Personal milestone → task detail → **Kickstart!**  
**Final timeline:** 2:45–3:45

### On screen

1. Sort by **Kickstart order** if not already on.
2. Open highest-priority **Open** task.
3. Click **Kickstart!** → confirm **Run kickstart for this task?**
4. Toast or dialog **Watch on GitHub**; task row chip **Running**.
5. Cut to org B-roll: completed tasks with **Complete** + **PR** (narrate over
   B-roll or record a separate voice line).
6. Return to personal task when chip shows **Complete** + PR link—or end on org
   results if live run is slow.

### Narration (live)

> Kickstart dispatches plan-and-implement with AWP—the agent opens a pull
> request. You track progress right on the task.

### Narration (over org B-roll, optional)

> On a milestone already in flight, you get the same flow—open issues queued by
> stack order, completed work with pull requests linked on each task.

### Skip

Task edit mode, disqualified issues, private-task rules, AWP internals.

---

## Segment `OUTRO` — Close

**Workspace:** Org  
**Route:** GitHub-linked milestone (kickstart order) → Roadmap  
**Final timeline:** 3:45–4:15

### On screen

- Org milestone with **Kickstart order** on: mix of open and completed tasks.
- Pull back to Roadmap.

### Narration

> denoise keeps planning and GitHub execution in one place—sync issues,
> initialize stack order, kickstart work to PRs. Developers can run the same
> workflows from the dn CLI and GitHub Actions. Automation requires Denoise Pro.

### Skip

Pro pricing detail, collaboration, workbench.

---

## Final narrative assembly (edit order)

| Timeline | Segment | Source |
| -------- | ------- | ------ |
| 0:00–0:25 | Intro | `INTRO` |
| 0:25–0:45 | Local planning | `LOCAL` |
| 0:45–1:30 | Link GitHub | `LINK` |
| 1:30–2:00 | DN setup | `SETUP` (or voice over `INIT` setup strip) |
| 2:00–2:45 | init_stack | `INIT` + B-roll during wait |
| 2:45–3:45 | Kickstart | `KS` + org B-roll during wait |
| 3:45–4:15 | Close | `OUTRO` |

---

## Environment checklist (day of record)

- [ ] Browser zoom and window size consistent across segments.
- [ ] Bookmarks bar hidden; notifications off.
- [ ] Second window: GitHub Actions tab for **Watch on GitHub**.
- [ ] Mic check; same seating for all narrated segments.
- [ ] Signed in, **Online**, correct workspaces verified.

---

## Doc references

- [GitHub integration](/denoise/github-integration/) — linking and sync
- [Milestone details](/denoise/milestone-details/) — DN setup, init_stack,
  kickstart
- [Authentication](/denoise/authentication/) — GitHub sign-in and repo access
