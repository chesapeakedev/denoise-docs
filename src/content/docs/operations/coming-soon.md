---
title: Coming Soon
description: On-premises and regulated-environment deployment for the denoise ecosystem.
---

We are building a deployment system for running the full denoise ecosystem
**on-premises** and in **regulated environments** — organizations that cannot
rely on SaaS defaults for data residency, network boundaries, or compliance
controls.

## What to expect

The goal is a cohesive install path for teams that need denoise and **dn**
running inside their own perimeter, with configuration suited to stricter
environments:

- **On-prem hosting** — Run denoise, agent orchestration, and supporting
  services on infrastructure you control rather than shared cloud tenants.
- **Regulated workflows** — Patterns for auditability, access control, and
  keeping issue context, plans, and agent artifacts within approved boundaries.
- **Integrated stack** — Align self-hosted runners, GitHub (or GitHub
  Enterprise), authentication, and repository agent context into one documented
  topology.
- **Unified LLM interface** — A single integration surface for agent harnesses
  to reach approved models on-prem or through your gateway, without locking
  workflows to one vendor or API shape.

Today, pieces of this story already exist — for example
[Self-hosted runners](/operations/self-hosted-runners/) for GitHub Actions and
local **dn** usage against your repositories. The coming system ties those
pieces into a single on-prem and compliance-oriented deployment guide.

## Status

This page is a placeholder. Documentation, reference architectures, and install
artifacts will land here as the deployment system matures. If you are evaluating
denoise for a regulated or air-gapped environment, reach out through your
denoise contact channel with your constraints — that feedback shapes what ships
first.
