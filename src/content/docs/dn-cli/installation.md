---
title: Installation & prerequisites
description: Install dn and ensure Deno, opencode, and GitHub auth are ready.
---

## Product vision

`dn` targets software engineers, filling the space between other tools they use.
It complements editors like VS Code and Cursor and is positioned closer to a
tool like [Gerrit](https://www.gerritcodereview.com/) than a code editor. The
purpose of dn is to create a muscle for your team where you identify tasks that
an LLM can do and have it execute them.

## Prerequisites

- [Deno](https://deno.com/) installed and available in PATH
- [opencode](https://opencode.dev/) installed and available in PATH (for
  kickstart)
- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated (for
  fetching issues)
- Git or [Sapling](https://sapling-scm.com/) available in PATH (for AWP mode)

### GitHub authentication

`glance` and `kickstart` need a GitHub token. Preferred options:

- **GitHub CLI:** Install [GitHub CLI](https://cli.github.com/) and run
  `gh auth login`; no token or env var needed.
- **Browser:** Run `dn auth` once; sign in in the browser; the token is cached
  for future runs.

For CI and scripts, set `GITHUB_TOKEN` with a Personal Access Token
(fine-grained PAT recommended). See [Authentication](/dn-cli/authentication/)
for details.

## Installation

Compile and install the `dn` binary with `make install_dn` or use directly with
Deno:

```bash
deno run --allow-all main.ts <subcommand> [options]
```

Run from the `dn` directory in the repository. For detailed subcommands and
usage, see [Subcommands](/dn-cli/subcommands/) and
[Kickstart overview](/kickstart/overview/).
