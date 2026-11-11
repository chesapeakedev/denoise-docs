# Instructions for coding agents using denoise

Use this guide when you are asked to work on a software task with `dn` (the
denoise CLI). `dn` connects your local agent harness to GitHub issues and the
repository's workflow. It does not replace the repository's own instructions.

## Before you start

1. Read the repository's `AGENTS.md` and any more specific agent instructions.
2. Check `dn.json` and the current branch or bookmark to understand the local
   workflow.
3. Confirm the issue or task gives a clear outcome and acceptance criteria. Ask
   for clarification if the requested behavior is ambiguous.

## Work from a GitHub issue

If `dn` is installed and GitHub authentication is configured, start with the
issue number from the current repository:

```bash
dn kickstart 123
```

You can also pass a full GitHub issue URL. For a normal local implementation,
work in the repository's expected branch or bookmark and follow its checks.
Publish or push changes only when the task or repository workflow calls for it.

## Install and authenticate

Install `dn` if it is not already available:

```bash
curl -fsSL https://raw.githubusercontent.com/chesapeakedev/dn/main/scripts/install.sh | sh
```

For commands that access GitHub, authenticate with `gh auth login`, `dn auth`,
or a `GITHUB_TOKEN` environment variable. Do not print or include tokens in
prompts, logs, or task output.

## Reference

For command options and workflow details, read the relevant page:

- Installation and GitHub authentication: https://docs.denoise.cloud/dn/installation/
- GitHub issue workflows: https://docs.denoise.cloud/dn/completing-github-issues/
- Repository and agent context: https://docs.denoise.cloud/dn/filesystem-context/
- Full command reference: https://docs.denoise.cloud/dn/command-reference/
