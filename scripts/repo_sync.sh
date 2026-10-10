#!/usr/bin/env bash
# Copyright 2026 Chesapeake Computing
# SPDX-License-Identifier: Apache-2.0
#
# Legacy Sapling stack sync (lint, pull --rebase, restack, push drafts).
# Prefer: make sync  (dn sync — Git or Sapling).

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SYNC_BRANCH="${SYNC_BRANCH:-main}"

make lint

sl pull --rebase -d "$SYNC_BRANCH"

# Restack only when draft commits have obsolete parents (amend/absorb left orphans).
needs_restack=$(sl log --rev "children(obsolete()) - obsolete()" -T "{node}\n" 2>/dev/null | head -1)
if [ -n "$needs_restack" ]; then
  sl restack
fi

# Push when there are draft commits on the stack above main.
draft_on_main=$(sl log --rev "draft() & ancestors(.) & descendants($SYNC_BRANCH)" -T "{node}\n" 2>/dev/null | head -1)
if [ -n "$draft_on_main" ]; then
  sl push --to "$SYNC_BRANCH"
fi
