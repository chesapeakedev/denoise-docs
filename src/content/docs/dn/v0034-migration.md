---
title: v0.0.34 migration
description: Update planning, execution, sandbox, verification, and close-out workflows for dn v0.0.34.
---

`dn` v0.0.34 makes plans durable across explicit lifecycle boundaries and adds
structured execution controls.

- Planning is now [`dn meld`](/dn/completing-github-issues/#plan-with-meld).
- The canonical lifecycle is `meld → loop → land`.
- [`dn until`](/dn/workflows/#dn-until) replaces health-check loops with
  bounded generator/verifier gambits.
- [`dn land`](/dn/workflows/#dn-land) replaces archive and standalone
  test-plan flows.
- [Sandbox schema 1.1](/dn/sandbox/) supports Docker and exe.dev.
- [Progress events](/dn/progress-reporting/) correlate dispatch, execution,
  and pull-request results.
- `dn --version` prints script-friendly version output for CI checks.

| Removed workflow | Replacement                |
| ---------------- | -------------------------- |
| `dn prep`        | `dn meld`                  |
| `dn archive`     | `dn land`                  |
| `dn hc`          | `dn until run`             |
| `dn testplan`    | `dn land --issue-testplan` |

Update repository workflows with `dn workflows update`, validate them with
`dn workflows validate`, and commit `.github/dn/config.json` plus generated
workflow changes. New integrations use `dn.meld_issue_plan`; the legacy prep
event and installed filename remain compatibility details.
