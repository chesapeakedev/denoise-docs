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
# All deploys SSH as the shared "denoise-docs" build user to guarantee the same
# deploy directory and Docker Compose project (and therefore the same
# named volumes) regardless of who runs the deploy.
#
# Override via environment variables:
#   DEPLOY_HOST=user@hostname DEPLOY_DIR=/opt/denoise-docs make deploy

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DOCKER_IMAGE_NAME="denoise-docs"
DOCKER_IMAGE_TAG="latest"
TARGET_PLATFORM="linux/arm64/v8"
COMPOSE_FILE="compose.yml"
COMPOSE_PROJECT_NAME="denoise-docs"

SSH_HOST_ARG="${1:-}"
DEPLOY_DIR_ARG="${2:-}"

BUILD_USER="denoise-docs"
DEFAULT_DEPLOY_DIR="/opt/denoise-docs"

if [ -n "$SSH_HOST_ARG" ]; then
  SSH_HOST="$SSH_HOST_ARG"
elif [ -n "${DEPLOY_HOST:-}" ]; then
  SSH_HOST="$DEPLOY_HOST"
else
  SSH_HOST="${BUILD_USER}@washington"
fi

if [ -n "$DEPLOY_DIR_ARG" ]; then
  DEPLOY_DIR="$DEPLOY_DIR_ARG"
elif [ -n "${DEPLOY_DIR:-}" ]; then
  : # already set via env
else
  DEPLOY_DIR="$DEFAULT_DEPLOY_DIR"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$DOCS_DIR/.." && pwd)"

# SSH multiplexing — authenticate once, reuse for all ssh/scp calls
SSH_CONTROL_DIR="${HOME}/.ssh/sockets"
SSH_CONTROL_PATH="${SSH_CONTROL_DIR}/%r@%h-%p"
SSH_OPTS="-o ControlMaster=auto -o ControlPath=${SSH_CONTROL_PATH} -o ControlPersist=60"
export SSH_OPTS

mkdir -p "$SSH_CONTROL_DIR"

cleanup_ssh() {
  ssh -o ControlPath="${SSH_CONTROL_PATH}" -O exit "${SSH_HOST}" 2>/dev/null || true
}
trap cleanup_ssh EXIT

# Open the master connection (single password prompt happens here)
ssh $SSH_OPTS -o ControlMaster=yes -fN "${SSH_HOST}"

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

# Prod .env lives on the Pi — ensure compose has a file without overwriting from laptops
ssh $SSH_OPTS "${SSH_HOST}" "test -f ${DEPLOY_DIR}/.env || touch ${DEPLOY_DIR}/.env"

ssh $SSH_OPTS "${SSH_HOST}" \
  "cd ${DEPLOY_DIR} && COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME} docker compose up -d --force-recreate"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Successfully deployed to ${SSH_HOST}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
