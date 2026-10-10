# Docs review examples

## Progress reporting — misplaced contributor section

**Section:** `## Render progress in denoise` in `runners/progress-reporting.md`

| Check | Result |
| --- | --- |
| Reader | Misplaced contributor spec (not dn / denoise / IT/devops) |
| Necessity | Low for all three; denoise users do not "render" events |
| Verdict | Trim to denoise-user observable behavior; move contract to open source |

**Suggested denoise user replacement (illustration):**

> **What you see in denoise**  
> When detailed progress is enabled, the task panel updates through kickstart
> phases. On GitHub Actions without a public progress base URL, expect
> queued/running/finished only—not a phase timeline.  
> If progress never appears, ask whoever manages runners to check serve logs;
> see [Runner logs](/runners/runner-logs/).

Keep HTTP bootstrap and `DN_*` env sections as **IT/devops** (or **dn user**
where they run workflows locally) on the same page—in separate sections.

## One section, one reader

| Section topic | Primary reader |
| --- | --- |
| Kickstart confirm dialog, runner badges | denoise user |
| `dn runner connect`, systemd service | IT/devops |
| `dn workflows dispatch` JSON payload | dn user |
| Self-hosted runner RAM and disk | IT/devops |

## Headings that invite spec voice

| Weak (sounds internal) | Stronger by reader |
| --- | --- |
| Render progress in denoise | What you see during kickstart (denoise user) |
| Event handling requirements | When progress is missing (IT/devops) |
| Integrator notes | (delete; move to repo) |

## Emphasis

**Before:** With **detailed** fidelity, render…

**After:** When detailed progress is enabled, the task panel…

Reserve bold for UI strings the reader must match in the app (**Kickstart**,
**Runners**).

## Necessity — keep vs cut

**Keep (dn user / IT/devops):** "GitHub's dispatch API returns no run ID; match
runs by dispatch ID in the workflow name."

**Cut for all doc readers:** "Order events by `seq` and deduplicate by dispatch ID."

**Link instead:** Point to the `dn` repository for event shapes when operators
need them.
