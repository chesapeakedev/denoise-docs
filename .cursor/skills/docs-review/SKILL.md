---
name: docs-review
description: >-
  Review denoise-docs pages for audience fit (dn user, denoise user, IT/devops),
  necessity, and tone. Use when the user asks for a docs review, editorial pass,
  tone audit, or single-page scrutiny—not while drafting (use brand-voice).
disable-model-invocation: true
---

# Docs review (denoise-docs)

Use this skill for a **review pass** on one page (or one section) in
`src/content/docs/`. Do not load it for routine writing; use
[brand-voice](../brand-voice/SKILL.md) while authoring.

## Codex and Cursor

- **Canonical files:** `.cursor/skills/docs-review/` in this repository.
- **Codex project skills:** mirrored at `.codex/skills/docs-review/`. After
  editing the skill, run `make sync_codex_skills` (also runs in `make check`).
- **Invoke in Codex:** ask for a docs review and name this skill (`docs-review`)
  or the page path (for example `runners/progress-reporting.md`).

Default scope: **review and recommend**. Rewrite prose only when the user asks
to apply fixes.

## What this review catches

Pages that sound like **implementation confirmation** (specs for denoise UI,
event mapping, integrator rules) instead of guidance for people **using** `dn`
or **denoise**. Symptoms:

- Imperatives aimed at the product ("render…", "show…", "reject…", "prefer
  `field.path`").
- Event/schema names the reader never needs to act on.
- Acceptance-criteria tone ("do not invent…") with no user action attached.

## Readers (tag every `##` section)

Use exactly one primary reader per section—not all three in the same block.

| Tag | Who | Docs should answer |
| --- | --- | --- |
| **dn user** | Software developers using `dn` locally or in automation | Commands, flags, repos, harness setup, CLI behavior, what to run and what output means |
| **denoise user** | Product managers using denoise in the browser | Milestones, tasks, Kickstart, Runners UI, what you see, safe next steps in the app |
| **IT/devops** | Infra and platform (often both of the above) | Runners, GitHub Actions, secrets, self-hosted hardware, schedules, logs, availability, cost |

When a section serves **IT/devops** and **dn users** equally, pick the reader who
**acts first** in that workflow (usually IT/devops for enroll/hosting, dn user for
day-to-day CLI). Split with headings if both need full detail.

**Not a reader:** contributor or implementer guidance (event schemas, UI
rendering rules, dedupe). Verdict **move to repo**, not a fourth tag.

Mixed audiences need separate headings or links—not blended paragraphs.

## Core principles

Apply to each section and sentence:

1. **Necessity** — For a given section or sentence, scrutinize whether it is
   vital for the user to understand in order to use `dn` or denoise. If removing
   it does not block a workflow the page owns, cut, shorten, or link out.
2. **Contributor boundary** — Avoid contributor guidance; open source repos
   should contain contracts, event matrices, rendering rules, and dedupe logic.
3. **Emphasis** — Avoid overuse of bold and italics. Bold: UI labels the reader
   must recognize. Inline code: commands, paths, env vars the reader sets or
   copies—not internal event types unless IT/devops grep logs for them.
4. **Brevity** — Brevity is a good quality as long as we review whether the user
   has the info they need to act (when to use this, what to do, what to expect,
   where to go if it fails).

**Observable vs implementable** — Describe outcomes in the product ("the task
panel shows phases") not instructions to build denoise ("map
`invocation.failed` to failure state").

## Single-page workflow

1. **State the page contract** — One sentence: "After reading this, a [dn user |
   denoise user | IT/devops] can ___." (Name a secondary reader only if the page
   explicitly hands off.)
2. **Section audit** — For each `##` heading: reader tag + verdict
   **keep** | **trim** | **move to repo** | **merge elsewhere**.
3. **Voice scan** — Flag contributor/spec imperatives and suggest rewrites for
   the tagged reader or deletion.
4. **Emphasis scan** — List bold/code that does not change the next action.
5. **Handoffs** — Every failure mode should link to an action page (e.g. runner
   logs, enroll), not more event theory.
6. **Factual guardrail** — Do not invent product behavior. When unsure, say so
   and narrow the claim. Applying edits still follows brand-voice naming rules.

Optional after content review: if the page moved or nav changed, run
[astro-starlight-playwright-guardrails](../astro-starlight-playwright-guardrails/SKILL.md)
build/slug checks.

## Report format

Deliver findings in this shape (adjust depth to page size):

```markdown
## Page contract
[one sentence]

## Summary
[2–4 bullets: overall audience fit]

## Findings

### [Section heading]
- **Reader:** dn user | denoise user | IT/devops | misplaced (contributor spec)
- **Verdict:** keep | trim | move | merge
- **Issue:** [tone / necessity / emphasis]
- **Suggestion:** [concrete rewrite direction or "delete; link to X"]

## Quick wins
[ordered list of highest-impact edits]

## Deferred
[topics that need repo verification or a separate pass]
```

Severity when prioritizing:

- **Must fix** — Wrong audience blocks understanding or misleads action.
- **Should fix** — Noise, spec voice, or duplicate of another page.
- **Nice** — Emphasis, brevity, link text.

## Voice contrast (reference)

**Contributor spec (move to open source):**

> With detailed fidelity, render queued and running events as active states,
> `invocation.failed` as a failure… Prefer `publish.completed.data.pr_url`…

**denoise user (keep on a progress page):**

> On device and exe.dev runners (and GitHub Actions when progress URL is
> configured), the task panel streams phases as the run proceeds. Without that
> setup, you usually see queued, running, and finished—not step-by-step phases.

**IT/devops (same page, different section):**

> Set `KICKSTART_PROGRESS_BASE_URL` and confirm the workflow exports
> `DN_DISPATCH_ID` and HTTP progress env vars before `dn kickstart` runs.

More examples: [examples.md](examples.md).

## Relationship to other skills

| Skill | When |
| --- | --- |
| **brand-voice** | Writing or rewriting prose during normal edits |
| **docs-review** | Explicit review pass on audience, tone, necessity |
| **astro-starlight-playwright-guardrails** | Sidebar, links, build after structural changes |
