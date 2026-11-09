---
title: Device runner protocol
description: Protocol v1 routes and guarantees for integrations that connect dn device runners.
---

This page describes the HTTP contract for integrations that pair and dispatch work to a `dn` device runner. Use the [runner setup guide](/runners/device-runners/) to pair and operate a device.

## Protocol v1

Protocol version `1.0` uses authenticated routes under `/api/runners`. Pairing creation, polling, and exchange use short-lived pairing secrets; the remaining routes require the runner credential or an owner session as appropriate.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/pairings` | Create a browser-approved pairing request |
| `POST` | `/pairings/:id/status` | Poll with the short-lived pairing token |
| `POST` | `/pairings/:id/exchange` | Exchange the pairing secret for a runner credential once |
| `POST` | `/heartbeat` | Report protocol version, capabilities, readiness, and registered repository slugs |
| `POST` | `/jobs/claim` | Atomically wait for and claim one job |
| `POST` | `/jobs/:id/lease` | Renew a lease and receive cancellation state |
| `POST` | `/jobs/:id/progress` | Submit a progress event |
| `POST` | `/jobs/:id/complete` | Record completion |
| `POST` | `/jobs/:id/fail` | Record failure, cancellation, or interruption |
| `POST` | `/jobs/:id/github-token` | Mint a short-lived GitHub token for an exe.dev VM |
| `GET` | `/status` | Read owner-visible device state |
| `GET` | `/jobs` | Read recent owner-visible jobs |
| `POST` | `/kickstart` | Queue a typed kickstart job |
| `POST` | `/pause`, `/resume`, `/disconnect` | Control an owned runner |
| `POST` | `/credential/rotate` | Rotate and revoke a runner credential |

## Contract guarantees

- Jobs are typed operations. Protocol v1 does not accept arbitrary commands, shell text, environment maps, or GitHub Actions workflows.
- Repository identity is `owner/repo`; heartbeats and jobs never carry local filesystem paths.
- Device runners execute against explicitly registered local checkouts. Land and sync jobs use that checkout; sync runs its configured preflight.
- A disconnected runner retains queued work for at most 24 hours. Reconnecting after lease loss marks the old job interrupted; retry requires a new dispatch.
- Runner credentials are scoped bearer values. Store them on-device with mode `0600`, store only hashes server-side, and revoke them immediately when rotated or disconnected.
- Gate runner endpoints and runtime choices behind the device-runner feature flag. Reject protocol versions below the configured minimum with HTTP `426`.

