---
title: Introduction
description: Start with dn, then connect denoise as the app experience built around it.
---

This documentation covers two products that work together:

- **dn** - The CLI for GitHub issue workflows, agent-backed planning and implementation, repository setup, and automation dispatch.
- **denoise** - An offline-first todo and planning app that uses dn-backed workflows for GitHub milestones, issues, and kickstart automation.

## dn (CLI)

Start with dn when you want to:

- Authenticate with GitHub and inspect repository issues from the terminal
- Run **kickstart** to turn a GitHub issue or local markdown spec into a plan and implementation
- Split work into **prep** and **loop** phases for reviewable planning
- Install canonical GitHub Actions workflows with `dn init workflows`
- Dispatch and validate automation with `dn workflows`
- Manage agent harnesses with `dn --agent opencode`, `cursor`, `claude`, or `codex`

**Next:** [dn CLI - Installation & prerequisites](/dn-cli/installation/)

## denoise (app)

Use denoise when you want the app experience around dn-powered work:

- Manage tasks and milestones offline-first
- Link milestones to GitHub and sync issues
- Trigger installed dn workflows from the UI
- Use focus tools while keeping planning and execution connected

**Next:** [Denoise - Getting started](/denoise/getting-started/)

## Quick links

| Need | Start here |
| ---- | ---------- |
| Install and use dn | [Installation](/dn-cli/installation/) -> [Command overview](/dn-cli/subcommands/) |
| Authenticate GitHub access | [Authentication](/dn-cli/authentication/) -> [GitHub token setup](/dn-cli/github-token-setup/) |
| Run issue implementation | [Workflows](/dn-cli/workflows/) -> [Kickstart details](/kickstart/overview/) |
| Connect denoise to automation | [GitHub integration](/denoise/github-integration/) -> [GitHub workflow integration](/kickstart/github-actions-integration/) |
