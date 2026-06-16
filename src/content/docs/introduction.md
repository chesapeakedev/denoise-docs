---
title: Introduction
description: Documentation for the denoise ecosystem — complementary tools for developers (dn) and cross-functional stakeholders (denoise).
---

This documentation covers the **denoise ecosystem**: two complementary products
that share the same planning and implementation workflows for GitHub-backed
work.

**dn** and **denoise** expose mostly the same capabilities — issue workflows,
agent-backed planning, kickstart automation, and repository setup — but for
different audiences. **dn** is the CLI for developers who work from the
terminal. **denoise** is the app for product managers, designers, and other
non-developer stakeholders who prefer a visual, offline-first experience.

Together, they let engineering and cross-functional teams stay aligned on
milestones, issues, and automation without forcing everyone into the same tool:

- **dn** — The CLI for GitHub issue workflows, agent-backed planning and
  implementation, repository setup, and automation dispatch.
- **denoise** — An offline-first todo and planning app that uses the same
  dn-backed workflows for GitHub milestones, issues, and kickstart automation.

## dn (CLI)

Start with dn when you want to:

- Authenticate with GitHub and inspect repository issues from the terminal
- Run **kickstart** to turn a GitHub issue or local markdown spec into a plan
  and implementation
- Split work into **prep** and **loop** phases for reviewable planning
- Manage agent harnesses with `dn --agent opencode`, `cursor`, `claude`, or
  `codex`

**Next:** [Installation](/dn-cli/installation/)

## dn in GitHub Actions

Use dn in CI when you want to:

- Install canonical workflow templates with `dn init workflows`
- Dispatch kickstart, prep, and stack generation from the terminal or denoise
- Run kickstart on issues and open pull requests in GitHub Actions

**Next:** [Repository setup](/dn-cli/github-actions/)

## denoise (app)

Use denoise when you want the app experience around dn-powered work:

- Manage tasks and milestones offline-first
- Link milestones to GitHub and sync issues
- Trigger installed dn workflows from the UI
- Use focus tools while keeping planning and execution connected

**Next:** [denoise getting started](/denoise/getting-started/)

## Quick links

| Need                          | Start here                                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install and use dn            | [Installation](/dn-cli/installation/) -> [Command overview](/dn-cli/subcommands/)                                                                             |
| Authenticate GitHub access    | [Installation](/dn-cli/installation/#github-authentication) -> [GitHub Token Setup](/dn-cli/github-token-setup/)                                              |
| Run issue implementation      | [Basic usage](/dn-cli/workflows/) -> [Kickstart usage](/kickstart/overview/)                                                                                  |
| Automate in GitHub Actions    | [Repository setup](/dn-cli/github-actions/) -> [OpenCode configuration](/kickstart/configuration/)                                                            |
| Connect denoise to automation | [denoise GitHub integration](/denoise/github-integration/) -> [Repository setup — Denoise integrators](/dn-cli/github-actions/#denoise-and-other-integrators) |
