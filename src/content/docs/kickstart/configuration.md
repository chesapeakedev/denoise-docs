---
title: Configuration
description: OpenCode config files required for kickstart (plan and implement phases).
---

Kickstart requires OpenCode configuration files in the **workspace root**. The
workspace root is `WORKSPACE_ROOT` (if set) or the current working directory.

## Required files

- **`opencode.plan.json`** — Used during the **plan phase** to restrict file
  edits (only plan files in `plans/` are writable). Auto-created with a default
  template if missing.
- **`opencode.implement.json`** — Used during the **implement phase** to allow
  file edits. Must be created manually (see template below).

## Default plan config template

If `opencode.plan.json` is missing, kickstart creates something like:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": {
      "*": "deny",
      "/tmp/**": "allow",
      "plans/**/*.plan.md": "allow",
      "plans/*.plan.md": "allow",
      "**/*.plan.md": "allow"
    },
    "bash": {
      "*": "allow"
    },
    "external_directory": "allow"
  }
}
```

For the implement phase, you need an `opencode.implement.json` (or equivalent)
that allows the edits your implementation phase requires. Create it in the
workspace root according to [opencode](https://opencode.dev/) documentation.

## Config file location

Config files must be in the workspace root. The root is determined by:

1. `WORKSPACE_ROOT` environment variable (if set)
2. Current working directory as fallback
