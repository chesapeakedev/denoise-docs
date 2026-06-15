SHELL := /bin/bash
DENO_ENTRYPOINT := src/app/serve.ts
DENO_FMT_PATHS := astro.config.mjs src/app scripts src/content/docs .cursor/skills
DENO_LINT_PATHS := src/app scripts
SKILL_DIRS := $(wildcard .cursor/skills/*)

.PHONY: dev_hot_reload dev_astro_watch dev_deno_serve clean clean_dev build fmt fmt_check lint check fix validate_skills sync check_deploy deploy deploy_deno

# Intelligent hot reload: Astro build watcher + Deno server (restarts on server file changes)
dev_hot_reload: clean_dev
	@echo "Initial build..."
	@npm run build
	@echo "Starting intelligent hot reload..."
	@echo "  astro: rebuilds dist/ when src/ or config change (nodemon + npm run build)"
	@echo "  server: Deno serves dist/ (restarts when src/app/ changes)"
	@echo "Press Ctrl+C to stop both"
	@$(MAKE) -j2 dev_astro_watch dev_deno_serve

# Watch Astro sources and rebuild dist/ on change
dev_astro_watch:
	@echo "[ASTRO] Starting build watcher..."
	@npx -y nodemon --watch src --watch astro.config.mjs --watch public \
		-e md,mdx,ts,mjs,json,astro,css \
		--exec "npm run build" \
		--delay 0.5

# Deno server with file watching (restarts when serve.ts changes)
dev_deno_serve:
	@echo "[DENO] Starting server with file watching..."
	@if [ -f .env ]; then \
		deno run -A --env-file=.env --watch=src/app $(DENO_ENTRYPOINT); \
	else \
		deno run -A --watch=src/app $(DENO_ENTRYPOINT); \
	fi

# One-off production build (static site to dist/)
build:
	npm run build

# Format code, scripts, docs markdown, and local skill files.
fmt:
	deno fmt $(DENO_FMT_PATHS)

# Check formatting without writing files.
fmt_check:
	deno fmt --check $(DENO_FMT_PATHS)

# Lint and type-check Deno code.
lint: fmt_check
	deno lint $(DENO_LINT_PATHS)
	deno check $(DENO_ENTRYPOINT)
	deno check scripts/quick_validate.ts

# Validate local skill packages.
validate_skills:
	@if [ -z "$(SKILL_DIRS)" ]; then \
		echo "No local skills found"; \
	else \
		for skill in $(SKILL_DIRS); do \
			echo "Validating $$skill"; \
			./scripts/quick_validate.ts "$$skill"; \
		done; \
	fi

# Fix easy formatting issues.
fix: fmt

# Public-repo quality gate for local use and CI.
check: lint validate_skills build

# Sapling: lint, pull --rebase main, restack if needed, push drafts (see scripts/repo_sync.sh)
sync:
	@$(SHELL) ./scripts/repo_sync.sh

# Stop dev background processes
clean_dev:
	@echo "Stopping any existing dev processes..."
	@killall -q nodemon 2>/dev/null || true
	@killall -q deno 2>/dev/null || true
	@sleep 0.5
	@echo "Cleanup complete"

BUILD_USER ?= denoise-docs
DEFAULT_DEPLOY_DIR ?= /opt/denoise-docs
DEPLOY_SSH_HOST ?= $(BUILD_USER)@washington

# Verify SSH to the Pi before building (same host as deploy; override DEPLOY_HOST=).
check_deploy:
	@host="$(or $(DEPLOY_HOST),$(DEPLOY_SSH_HOST))"; \
	echo "Checking SSH to $$host..."; \
	if ssh -o BatchMode=yes -o ConnectTimeout=10 "$$host" true 2>/dev/null; then \
	  echo "SSH OK — ready for make deploy"; \
	else \
	  echo ""; \
	  echo "SSH failed. The Pi is unchanged (deploy opens SSH before any build)."; \
	  echo ""; \
	  echo "Request access — send this public key to a Pi admin:"; \
	  found=0; \
	  for k in "$$HOME/.ssh/id_ed25519.pub" "$$HOME/.ssh/id_rsa.pub"; do \
	    if [ -f "$$k" ]; then cat "$$k"; found=1; break; fi; \
	  done; \
	  if [ "$$found" -eq 0 ]; then \
	    echo "  (no default key found — run: ssh-keygen -t ed25519)"; \
	  fi; \
	  echo ""; \
	  echo "See DEPLOY.md for admin steps."; \
	  exit 1; \
	fi

# Deploy to Raspberry Pi (default: denoise-docs@washington:/opt/denoise-docs).
# Override: DEPLOY_HOST=user@host DEPLOY_DIR=/path make deploy
deploy:
	@./scripts/deploy.sh "${DEPLOY_HOST}" "${DEPLOY_DIR}"

# Deploy to Deno Deploy (cloud)
deploy_deno:
	npm run deno-deploy

clean: clean_dev
