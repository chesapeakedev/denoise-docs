# Edit guide — 3 to 5 minute cut

Assemble segments from [recording-script.md](./recording-script.md) and B-roll
from [org-broll-shot-list.md](./org-broll-shot-list.md). Target **3:30–4:30**
for the final render; hard cap **5:00**.

## Timeline

| Time | Visual | Audio | Source clips |
| ---- | ------ | ----- | ------------ |
| 0:00–0:25 | Org Roadmap, milestone cards | Intro narration | `INTRO` |
| 0:25–0:45 | Org non-GitHub milestone, task list | Local planning narration | `LOCAL` |
| 0:45–1:30 | Personal: workspace switch, link wizard, synced `#123` tasks | Link narration | `LINK` |
| 1:30–2:00 | Personal: DN setup row, Ready strip | Setup narration | `SETUP` or VO over `INIT` |
| 2:00–2:15 | Personal: click **Run dn.init_stack**, dispatch strip | init_stack narration (part 1) | `INIT` (head) |
| 2:15–2:35 | **Cutaway:** org kickstart order, badges, repo panel | Music or silence, or light VO | `BROLL-ORG` shots A, D, E |
| 2:35–2:45 | Personal: kickstart order on, badges visible | init_stack narration (part 2) | `INIT` (tail) |
| 2:45–3:00 | Personal: open task, **Kickstart!**, confirm | Kickstart narration (part 1) | `KS` (head) |
| 3:00–3:25 | **Cutaway:** org Complete + PR rows | Optional VO over B-roll | `BROLL-ORG` shots B, C |
| 3:25–3:45 | Personal: Running → Complete chip + PR, or end on org PR row | Kickstart narration (part 2) | `KS` (tail) or `BROLL-ORG` shot B |
| 3:45–4:15 | Org milestone overview → Roadmap | Outro narration | `OUTRO` |

Adjust segment lengths proportionally if the raw narration runs long. Trim
pauses before clicks, not mid-sentence.

## Cut rules

### GitHub Actions waits

| Action | Typical wait | Edit approach |
| ------ | ------------ | ------------- |
| `dn.init_stack` | 30–90 sec | Hard cut after **Watch on GitHub** click; insert 15–20 sec org B-roll; cut to completed UI |
| `dn.kickstart_issue` | 2–10+ min | Cut after **Running** chip appears; insert org Complete+PR B-roll; cut to Complete chip or stay on org PR |

Do not show real-time workflow logs unless a specific step fails in rehearsal—in
that case fix the setup before recording.

### Transitions

- **Workspace switch** (org → personal): use one clean take; avoid jump cuts
  mid-dropdown.
- **Wizard steps**: keep all three wizard screens; each can be 2–4 seconds.
- **B-roll**: prefer shots A, B, and E from the org shot list for init_stack
  wait; shots B and C for kickstart wait.

### Audio

- Record narration for `INTRO`, `LOCAL`, `LINK`, `SETUP`, `INIT`, `KS`, `OUTRO`
  in one session if possible for consistent tone.
- B-roll segments can use the optional org VO line from the recording script or
  stay silent with a subtle bed.

## What to leave out

| Include once | Omit entirely |
| ------------ | ------------- |
| Roadmap + milestone model | Every header button |
| Link wizard (3 steps) | OAuth / sign-in flow |
| Issue sync `#123: Title` | All filters and sort options |
| Ready setup strip | Secrets configuration screen |
| One init_stack click + result | Staleness re-run |
| One kickstart click + PR proof | Workbench, Focus, tours |
| Org results as proof | CLI demo (one line in outro only) |

## Export checklist

- [ ] Total duration 3:00–5:00.
- [ ] **Online** badge visible in intro.
- [ ] At least one **PR** link visible on a task row.
- [ ] **Kickstart order** visible at least once.
- [ ] No visible test data or internal repo names you do not want public (blur
      or use demo repo names if needed).
- [ ] Outro mentions Denoise Pro in one sentence.
- [ ] Captions generated and terms corrected: denoise, kickstart, init_stack, dn.

## File handoff

Suggested project structure in your editor:

```
demo-video/
  narration/
  screen/
    intro.mov
    local.mov
    link.mov
    init-head.mov
    init-tail.mov
    kickstart-head.mov
    kickstart-tail.mov
    outro.mov
  broll/
    (files from org-broll-shot-list naming)
  demo-video-v1.mp4
```
