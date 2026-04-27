---
title: Authentication
description: GitHub authentication for dn — GitHub CLI, dn auth, or GITHUB_TOKEN.
---

`glance` and `kickstart` need a GitHub token to call the GitHub API. You can
authenticate in three ways.

## Preferred: GitHub CLI

Install [GitHub CLI](https://cli.github.com/) and sign in once:

```bash
gh auth login
```

After that, dn uses `gh`'s token automatically. No PAT or env var is required.

- [Install GitHub CLI](https://cli.github.com/)

## Alternative: Browser login

Run:

```bash
dn auth
```

Your browser opens; complete sign-in there. The token is stored (e.g.
`~/.config/dn/github_token`) and reused by `dn kickstart`, `glance`, etc. You
only need to run this once, or again when the cached token expires.

**Note:** Device flow requires a GitHub OAuth App client ID. Set
`DN_GITHUB_DEVICE_CLIENT_ID` (or `GITHUB_DEVICE_CLIENT_ID`) to your app's client
ID. Create an OAuth App at
[GitHub Developer Settings](https://github.com/settings/developers), enable
**Device flow** in the app settings, and use the **Client ID** as the env value.

- [GitHub OAuth Device flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)

## Advanced / CI: Personal Access Token

For scripts and CI (e.g. GitHub Actions), set the `GITHUB_TOKEN` environment
variable with a [Personal Access Token](https://github.com/settings/tokens).
**Fine-grained PATs** are recommended: they are scoped to specific repositories
and permissions.

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Prefer **GitHub CLI** or **browser auth** for normal use; use a PAT only when
needed (CI, scripts, headless). See
[GitHub token setup](/dn-cli/github-token-setup/) for detailed PAT instructions
and security notes.

## Summary

| Method                  | Use case          | Setup                                           |
| ----------------------- | ----------------- | ----------------------------------------------- |
| **GitHub CLI**          | Normal use        | `gh auth login`                                 |
| **Browser (`dn auth`)** | No `gh` installed | `dn auth` (once) + client ID                    |
| **GITHUB_TOKEN**        | CI / scripts      | Set env var with PAT (fine-grained recommended) |
