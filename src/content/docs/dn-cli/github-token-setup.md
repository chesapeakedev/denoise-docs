---
title: GitHub token setup
description: Create and configure a GitHub Personal Access Token for dn.
---

This supplemental guide explains how to create a GitHub Personal Access Token
(PAT) for `dn` when you cannot use GitHub CLI or browser auth. For the normal
token resolution order, see [Authentication](/dn-cli/authentication/).

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

`dn` commands such as `kickstart`, `prep`, `glance`, `peek`, `fixup`, `issue`, and `meld` with issue URLs interact with the GitHub API to:

- Fetch repository information
- Retrieve issues and commits
- Create or update issues, comments, pull requests, releases, and workflow dispatches when requested

These operations require authentication. Personal Access Tokens are supported for CI, scripts, and other headless environments where GitHub CLI or browser auth are not available.

## Creating a Personal Access Token

**Fine-grained PATs (recommended):** Scoped to specific repos and permissions.
[Create a fine-grained token](https://github.com/settings/personal-access-tokens/new)
→ choose **Repository access** (only the repos you need) → under
**Permissions**, set **Contents** (Read and write), **Pull requests** (Read and
write), **Metadata** (Read-only). For org repos, add **Organization permissions
→ Members** (Read-only) if needed.

**Classic PATs:** Broader access. Use only when fine-grained tokens don't fit
(e.g. some CI setups).

### Step 1: Navigate to GitHub Settings

1. Go to [GitHub.com](https://github.com) and sign in
2. Click your profile picture in the top right corner
3. Select **Settings** from the dropdown menu

### Step 2: Access Developer Settings

1. In the left sidebar, scroll down and click **Developer settings**
2. Click **Personal access tokens** in the left sidebar
3. Prefer **Fine-grained tokens** (recommended); or **Tokens (classic)** if
   needed

### Step 3: Generate New Token

**Fine-grained:** Use **Generate new token** → **Generate new token
(fine-grained)**. Set resource owner, repository access, and permissions
(Contents, Pull requests, Metadata; add org Members read if needed).

**Classic:** Use **Generate new token** → **Generate new token (classic)**. Set:

- Name (e.g. "dn-kickstart")
- Expiration (e.g. 90 days)
- Scopes: **`repo`** (or **`public_repo`**) and **`read:org`** for organization
  repos

### Step 4: Copy and Save Token

**IMPORTANT**: GitHub will only show the token once. Copy it immediately and
store it securely.

1. Copy the generated token (it starts with `ghp_`)
2. Store it securely (password manager, encrypted file, etc.)
3. **Never commit this token to version control**

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

**Recommendation:** Prefer fine-grained PATs; for classic, minimum is `repo` (or
`public_repo`) and `read:org` for org repos.

## Security best practices

**Best practices:**

1. **Never commit tokens to version control** — Use environment variables; add
   `GITHUB_TOKEN` to `.gitignore` if storing in a file.
2. **Use token expiration** — Set tokens to expire (30–90 days); rotate
   regularly.
3. **Limit scope** — Prefer fine-grained PATs scoped to specific repositories.
4. **Revoke unused tokens** — Review and revoke in GitHub Settings.
5. **Use separate tokens** — Different tokens for different tools/environments.
6. **Monitor usage** — Check GitHub's security log for unexpected API usage.

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
