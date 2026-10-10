#!/usr/bin/env bash
# Copyright 2026 Chesapeake Computing
# SPDX-License-Identifier: Apache-2.0
#
# Print whether a checkout uses Sapling or Git. Matches dn sync detection:
#   - Sapling when the repository root contains .sl metadata
#   - Git otherwise when .git exists at the root
# Installing `sl` in a plain Git checkout does not select Sapling.

set -euo pipefail

usage() {
  echo "Usage: detect_vcs.sh [--json] [directory]" >&2
  exit 1
}

json=0
start="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      json=1
      shift
      ;;
    -h | --help)
      usage
      ;;
    *)
      start="$1"
      shift
      ;;
  esac
done

if [[ ! -d "$start" ]]; then
  echo "detect_vcs.sh: not a directory: $start" >&2
  exit 1
fi

start="$(cd "$start" && pwd)"
dir="$start"

while true; do
  if [[ -d "$dir/.sl" ]]; then
    vcs="sapling"
    root="$dir"
    break
  fi
  if [[ -d "$dir/.git" ]]; then
    vcs="git"
    root="$dir"
    break
  fi
  if [[ "$dir" == "/" ]]; then
    if [[ $json -eq 1 ]]; then
      printf '%s\n' '{"vcs":"unknown","root":null}'
    else
      echo unknown
    fi
    exit 1
  fi
  dir="$(dirname "$dir")"
done

if [[ $json -eq 1 ]]; then
  printf '{"vcs":"%s","root":"%s"}\n' "$vcs" "$root"
else
  echo "$vcs"
fi
