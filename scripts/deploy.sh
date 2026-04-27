#!/usr/bin/env bash
# Copyright 2026 Chesapeake Computing
# SPDX-License-Identifier: Apache-2.0
#
# Cross-compile deployment script for denoise-docs to Raspberry Pi
#
# Builds the Docker image for linux/arm64 on the dev machine, transfers it
# to the Pi, and restarts the service via docker compose.
#
# Usage: ./scripts/deploy.sh [ssh_host] [deploy_dir]
#
# Default: nick@washington, ~/denoise-docs
#
# Override via environment variables:
#   DEPLOY_HOST=user@hostname DEPLOY_DIR=~/denoise-docs make deploy

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DOCKER_IMAGE_NAME="denoise-docs"
DOCKER_IMAGE_TAG="latest"
TARGET_PLATFORM="linux/arm64/v8"
COMPOSE_FILE="compose.yml"

SSH_HOST_ARG="${1:-}"
DEPLOY_DIR_ARG="${2:-}"

if [ -n "$SSH_HOST_ARG" ]; then
  SSH_HOST="$SSH_HOST_ARG"
elif [ -n "${DEPLOY_HOST:-}" ]; then
  SSH_HOST="$DEPLOY_HOST"
else
  SSH_HOST="nick@washington"
fi

if [ -n "$DEPLOY_DIR_ARG" ]; then
  DEPLOY_DIR="$DEPLOY_DIR_ARG"
elif [ -n "${DEPLOY_DIR:-}" ]; then
  : # already set via env
else
  DEPLOY_DIR="~/denoise-docs"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$DOCS_DIR/.." && pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Cross-compile deploy to ${SSH_HOST}:${DEPLOY_DIR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Build Astro static site locally
# ---------------------------------------------------------------------------
echo "📦 Step 1/4: Building Astro static site..."
make -C "$DOCS_DIR" build
echo ""

# ---------------------------------------------------------------------------
# Step 2: Cross-compile Docker image for ARM64
# ---------------------------------------------------------------------------
echo "🐳 Step 2/4: Cross-compiling Docker image for ${TARGET_PLATFORM}..."

docker buildx build \
  --platform "$TARGET_PLATFORM" \
  --file "$DOCS_DIR/Dockerfile" \
  --tag "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
  --load \
  "$REPO_ROOT"

echo ""

# ---------------------------------------------------------------------------
# Step 3: Transfer image to the Pi
# ---------------------------------------------------------------------------
echo "📤 Step 3/4: Transferring image to ${SSH_HOST}..."

# Reuse one SSH connection to avoid multiple password prompts
SSH_OPTS="-o ControlMaster=auto -o ControlPath=/tmp/ssh-dd-%r@%h:%p -o ControlPersist=60"

IMAGE_SIZE=$(docker image inspect "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
  --format '{{.Size}}' | awk '{printf "%.0f MB", $1/1024/1024}')
echo "   Image size: ~${IMAGE_SIZE} (will be compressed for transfer)"

docker save "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}" \
  | gzip \
  | ssh $SSH_OPTS "${SSH_HOST}" "docker load"

echo ""

# ---------------------------------------------------------------------------
# Step 4: Deploy on the Pi
# ---------------------------------------------------------------------------
echo "🔄 Step 4/4: Restarting service on ${SSH_HOST}..."

ssh $SSH_OPTS "${SSH_HOST}" "mkdir -p ${DEPLOY_DIR}"
scp $SSH_OPTS "$DOCS_DIR/${COMPOSE_FILE}" "${SSH_HOST}:${DEPLOY_DIR}/${COMPOSE_FILE}"

# Copy .env if it exists locally; otherwise ensure empty .env on Pi so compose does not fail
if [ -f "$DOCS_DIR/.env" ]; then
  scp $SSH_OPTS "$DOCS_DIR/.env" "${SSH_HOST}:${DEPLOY_DIR}/.env"
else
  ssh $SSH_OPTS "${SSH_HOST}" "touch ${DEPLOY_DIR}/.env"
fi

ssh $SSH_OPTS "${SSH_HOST}" "cd ${DEPLOY_DIR} && docker compose up -d --force-recreate"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Successfully deployed to ${SSH_HOST}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
