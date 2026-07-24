---
title: Project base images
description: Build and pin a golden Docker image that satisfies the dn sandbox contract.
---

A project base image is a reproducible environment for `dn` Docker sandbox runs.
Use a golden image when agents need a stable language toolchain or VCS setup
beyond the canonical images.

## Install the base-image skill

```bash
dn init agents --skill base-image --agent opencode
```

Replace `opencode` with the repository's harness. The installed skill guides an
agent through image customization and safe pinning.

## Image contract

The image must include Deno 2.6.3 or newer, `dn`, Git, Bash, and exactly one
supported harness: OpenCode, Cursor, Claude Code, Codex, or Copilot.

```dockerfile
FROM denoland/deno:debian-2.6.3

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends bash git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install a pinned dn release and one pinned agent harness here.
WORKDIR /workspace
ENTRYPOINT ["sleep", "infinity"]
```

Build and publish the image before using it. `dn` pulls `sandbox.docker.image`;
it never builds `sandbox.docker.dockerfile` during provisioning.

```json
{
  "schema_version": "1.1",
  "agent": "opencode",
  "sandbox": {
    "provider": "docker",
    "docker": {
      "image": "ghcr.io/owner/project@sha256:...",
      "dockerfile": "Dockerfile.dn",
      "network": "none",
      "read_only_root": true,
      "env_pass_through": ["OPENAI_API_KEY"]
    }
  }
}
```

## Operate the image

- Pin the base image by digest and pin Deno, `dn`, harness, and project
  toolchain versions.
- Publish a new immutable tag or digest for every golden-image update, validate
  it, then update repository config.
- Pass short-lived credentials at runtime by environment name. Never use `ARG`,
  `ENV`, copied credential files, or image layers for secrets.
- Keep networking disabled unless the harness needs outbound APIs.
- Prefer `read_only_root: true` with a writable workspace mount.
- Use a non-root final user when the repository mount remains writable.
- Do not mount the host Docker socket or an entire SSH directory.

Canonical images and their release workflow live in
[`chesapeakedev/dn-images`](https://github.com/chesapeakedev/dn-images) and are
published as `ghcr.io/chesapeakedev/dn:<harness>`. Production consumers should
pin a `:sha-*` tag or digest, not a moving harness tag.
