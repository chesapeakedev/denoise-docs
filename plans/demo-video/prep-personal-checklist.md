# Personal workspace prep checklist

Use this checklist before recording the live demo segments. The personal workspace
milestone should be **clean**: not linked (or linked only after you record the
link wizard), workflows staged off-camera, and **init_stack not run**.

## Milestone and GitHub issues

- [ ] Create or pick a milestone in your **personal** workspace with a clear name
      (for example, `Demo — API polish`).
- [ ] In the target GitHub repo, create or use an **open** GitHub milestone with
      **3–5 open issues**.
- [ ] Each issue has a short, descriptive title and a body that gives the agent
      enough context to implement (acceptance criteria or a clear scope).
- [ ] Note the repo path and milestone name—you will select them in the link
      wizard on camera.
- [ ] Pick **one kickstart candidate** issue: open, not disqualified, not
      previously kickstarted. Write its issue number here: `___`

## Repository automation (off-camera)

Pre-stage the repo so the milestone view shows **Ready for dn kickstart and prep**
when you open it after linking. Do **not** run init_stack yet.

- [ ] Clone or open the target repo locally.
- [ ] Install dn workflows for your agent:

```bash
dn init workflows --agent opencode
# Or: --agent cursor | claude | codex
```

- [ ] Validate templates:

```bash
dn workflows validate --json
```

- [ ] Commit and push `.github/dn/config.json` and `.github/workflows/dn-*.yml`.
- [ ] Add the agent secret in GitHub Actions (repo → Settings → Secrets):
      - OpenCode: none required
      - Cursor: `CURSOR_API_KEY`
      - Claude Code: `ANTHROPIC_API_KEY`
      - Codex: `OPENAI_API_KEY`
- [ ] Confirm **Allow GitHub Actions to create and approve pull requests** is
      enabled (required for kickstart AWP).

## denoise app state

- [ ] Signed in with **GitHub** (not Google alone).
- [ ] Header shows **Online** sync badge.
- [ ] **Profile → Update repos & orgs** includes the target repository.
- [ ] Denoise Pro or an organization Pro seat is active.
- [ ] Personal workspace milestone is **not linked** to GitHub yet (reset if you
      linked it during testing).
- [ ] No prior `dn.init_stack` run on this milestone in denoise (no stack
      badges or kickstart order data).

## Optional time-saver

- [ ] Start a kickstart on a **second** issue in the org workspace before
      recording so you have a completed PR to cut to while the live kickstart
      runs.

## Verify before recording

1. Switch to **personal** workspace on the Roadmap.
2. Open the demo milestone (unlinked)—confirm it has local tasks only or is
   empty.
3. Link the milestone in a dry run (or use a test milestone), open the milestone
   view, and confirm:
   - DN setup row is visible.
   - Setup strip shows **Ready for dn kickstart and prep**.
   - **Run dn.init_stack** is enabled (amber if stale is fine; do not click).
4. Unlink or reset the milestone if the dry run linked it—save the link wizard
   for on-camera recording.

## Reset if you need to re-record the link wizard

1. Edit milestone → unlink from GitHub (or delete and recreate the denoise
   milestone).
2. Do **not** remove workflows from the repo—they stay staged.
3. Confirm init_stack has not been dispatched for this milestone in denoise.
