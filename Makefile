SHELL := /bin/bash
DENO_ENTRYPOINT := src/app/serve.ts

.PHONY: dev_hot_reload dev_astro_watch dev_deno_serve clean clean_dev build fmt fmt_check lint sync deploy deploy_deno

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

# Format Deno server code (run from denoise-docs/; ci.mk invokes with explicit cd)
fmt:
	deno fmt src/app/

# Check Deno formatting (no writes)
fmt_check:
	deno fmt --check src/app/

# Lint Deno server code
lint:
	deno fmt --check src/app/
	deno lint src/app/
	deno check $(DENO_ENTRYPOINT)

# Delegate to repo root Makefile
sync: ; $(MAKE) -C .. sync

# Stop dev background processes
clean_dev:
	@echo "Stopping any existing dev processes..."
	@killall -q nodemon 2>/dev/null || true
	@killall -q deno 2>/dev/null || true
	@sleep 0.5
	@echo "Cleanup complete"

# Deploy to Raspberry Pi (default: nick@washington). Override: DEPLOY_HOST=user@host DEPLOY_DIR=~/denoise-docs make deploy
deploy:
	@./scripts/deploy.sh "${DEPLOY_HOST}" "${DEPLOY_DIR}"

# Deploy to Deno Deploy (cloud)
deploy_deno:
	npm run deno-deploy

clean: clean_dev
