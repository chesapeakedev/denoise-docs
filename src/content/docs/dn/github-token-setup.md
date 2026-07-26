---
title: GitHub token setup
description: Create and configure a GitHub personal access token for dn.
---

This supplemental guide explains how to create a GitHub personal access token
(PAT) for `dn` when you cannot use GitHub CLI or browser auth. For the normal
token resolution order, see
[Installation — GitHub authentication](/dn/installation/#github-authentication).

**Recommendation:** Prefer **fine-grained PATs** over classic tokens: they are
scoped to specific repositories and permissions, reducing risk if the token is
exposed.

## When to use a PAT

For **normal use**, prefer **GitHub CLI** (`gh auth login`) or **browser auth**
(`dn auth`); no PAT or env var needed. Use a PAT when:

- Running in CI (e.g. GitHub Actions: `GITHUB_TOKEN` is provided automatically)
- Running in scripts or headless environments
- You cannot use `gh` or browser login

## Why a GitHub token is needed

`dn` commands such as `kickstart`, `meld`, `glance`, `peek`, `fixup`, `issue`,
and `meld` with issue URLs interact with the GitHub API to:

- Fetch repository information
- Retrieve issues and commits
- Create or update issues, comments, pull requests, releases, and workflow
  dispatches when requested

These operations require authentication. Personal Access Tokens are supported
for CI, scripts, and other headless environments where GitHub CLI or browser
auth are not available.

## Create a personal access token

Prefer a fine-grained PAT. It can be scoped to the repositories and permissions
`dn` needs, which limits the impact if the token is exposed.

1. Open
   [GitHub's fine-grained token page](https://github.com/settings/personal-access-tokens/new).
2. Set **Repository access** to only the repositories `dn` should use.
3. Under **Permissions**, set **Contents** and **Pull requests** to **Read and
   write**, and keep **Metadata** at **Read-only**.
4. For organization repositories, add **Organization permissions → Members**
   with **Read-only** access when needed.
5. Copy the token when GitHub shows it and store it in a password manager or
   another secure store. GitHub only shows the token value once.

Use a classic PAT only when a fine-grained token does not fit the environment,
such as a CI setup that still requires classic scopes. For classic PATs, use
`repo` for private repositories or `public_repo` for public repositories, and
add `read:org` for organization repositories.

## Setting the environment variable

Set `GITHUB_TOKEN` with your token. (dn also accepts the legacy
`DANGEROUS_GITHUB_TOKEN` for backward compatibility.)

### macOS/Linux (bash/zsh)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

Then reload your shell:

```bash
source ~/.zshrc  # or ~/.bashrc
```

### Windows (PowerShell)

```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
```

To make it persistent, add to your PowerShell profile:

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
```

### Verify the variable is set

```bash
test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN is set"
```

In PowerShell:

```powershell
if ($env:GITHUB_TOKEN) { "GITHUB_TOKEN is set" }
```

Do not print the token value in shared terminals, shell history, screenshots, or
CI logs.

## Required scopes / permissions

**Fine-grained PATs:** Repository permissions: **Contents** (Read and write),
**Pull requests** (Read and write), **Metadata** (Read-only). For org repos, add
**Organization permissions → Members** (Read-only) if needed.

**Classic PATs:**

| Scope         | Description                          | Required for                       |
| ------------- | ------------------------------------ | ---------------------------------- |
| `repo`        | Full control of private repositories | Private repositories, creating PRs |
| `public_repo` | Access public repositories           | Public repositories only           |
| `read:org`    | Read org and team membership         | Organization repositories          |

Prefer fine-grained PATs. For classic tokens, the minimum is `repo` or
`public_repo`, plus `read:org` for organization repositories.

## Security best practices

1. Use environment variables; never commit tokens to version control.
2. Set tokens to expire and rotate them regularly.
3. Scope each token to the repositories and permissions it needs.
4. Use separate tokens for separate tools or environments.
5. Revoke unused tokens in GitHub settings.
6. Check GitHub's security log for unexpected API usage.

## Troubleshooting

### "No GitHub token found" or token not used

- Verify the token variable is set without printing it:
  `test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN is set"` (or
  `if ($env:GITHUB_TOKEN) { "GITHUB_TOKEN is set" }` in PowerShell)
- Make sure you've reloaded your shell after setting the variable
- dn accepts `GITHUB_TOKEN` (preferred) or the legacy `DANGEROUS_GITHUB_TOKEN`

### "Repository not found or access denied"

- Verify your token has the correct scopes (`repo` for private repos)
- Check that you have access to the repository
- Ensure the token hasn't expired

### "Failed to verify repository"

- Verify the remote URL is correct: `git remote get-url origin` or
  `sl paths default`
- Ensure the repository exists and you have access
- Check that your token has the necessary permissions

## Additional resources

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API Authentication](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)
- [Fine-grained Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#fine-grained-personal-access-tokens)
