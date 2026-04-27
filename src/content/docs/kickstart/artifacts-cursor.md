---
title: Artifacts & Cursor
description: AGENTS.md generation and Cursor IDE integration.
---

After a successful implementation, kickstart generates workspace artifacts.
Failures in these steps are logged as warnings and do not stop the workflow.

## 1. Plan file updates

The implement phase updates the **Acceptance Criteria** checklist in the plan
file. The plan file stays in `plans/` for reference. For incomplete plans,
continuation prompts are generated (see
[Plan files & continuation](/kickstart/plan-files/)).

## 2. Linting (non-blocking)

Kickstart runs project linting when possible:

- **Deno** — `deno task check` or `deno fmt && deno lint`
- **Node.js** — `npm run lint`
- Other projects — Detects and runs appropriate lint commands

Lint errors are reported as warnings only.

## 3. AGENTS.md generation

Kickstart generates or updates `AGENTS.md` with:

- **Project type** — Detects Deno, Node.js, Python, Rust, Go
- **Build commands** — From `deno.json`, `package.json`, etc.
- **Lint/test commands** — Project-specific commands
- **Custom sections** — Existing custom sections in `AGENTS.md` are preserved

This helps agents follow project conventions and improves promptability.

## 4. Cursor IDE integration (optional)

If you use **`--cursor`** or set **`CURSOR_ENABLED=1`**:

- Kickstart creates **`.cursor/rules/kickstart.mdc`** with `alwaysApply: true`
- The rule documents how to use kickstart as a subagent in Cursor
- Includes usage examples and workflow information
- Enables Cursor agents to use kickstart for implementing GitHub issues

Example:

```bash
dn kickstart --cursor https://github.com/owner/repo/issues/123

# Or
CURSOR_ENABLED=1 dn kickstart https://github.com/owner/repo/issues/123
```

Plan files work with Cursor: checklists, context for agents, and progress are
visible in the plan file; plan files can be committed for history.
