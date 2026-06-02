# denoise-docs

Documentation site for denoise and the `dn` CLI. Built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

## Project Structure

```
src/
├── content/docs/       # Markdown documentation pages
├── components/         # Custom Astro components (theme, footer)
├── styles/theme.css    # Custom Starlight theme
└── app/
    └── serve.ts        # Deno file server (serves static build for preview/deploy)
astro.config.mjs        # Starlight sidebar and component configuration
Makefile                # Build, lint, deploy, hot reload
DEPLOY.md               # Pi deploy guide (developers only)
```

Documentation pages live in `src/content/docs/`. Each `.md` file is a route
based on its file name. The sidebar is configured in `astro.config.mjs`.

## Commands

All commands are run from the `denoise-docs/` directory:

| Command                   | Action                                                |
| :------------------------ | :---------------------------------------------------- |
| `npm install`             | Installs dependencies                                 |
| `npm run dev`             | Starts local dev server at `localhost:4321`           |
| `npm run build`           | Build your production site to `./dist/`               |
| `npm run preview`         | Serve the built site locally (Deno server)            |
| `make dev_hot_reload`     | Astro build watcher + Deno server (restart on change) |
| `make sync`               | Lint, `sl pull --rebase`, restack if needed, push drafts |
| `make check_deploy`       | Verify SSH to the Pi before deploying                 |
| `make deploy`             | Build and deploy the docs site to washington (see [DEPLOY.md](DEPLOY.md)) |
| `npm run deno-deploy`     | Build and deploy to Deno Deploy (CLI)                 |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`      |
| `npm run astro -- --help` | Get help using the Astro CLI                          |

## Architecture

The site is built as a **static** Astro/Starlight site. A small **Deno server**
serves `dist/` for local preview and Deno Deploy (SPA fallback to `index.html`).
Local preview: run `npm run build` then `npm run preview` (`deno run -A src/app/serve.ts`).

## Deploy to Deno Deploy

The app builds with Node (static Astro) and deploys via the deployctl GitHub
Action. The Deno server entrypoint is `src/app/serve.ts`.

1. In [Deno Deploy](https://dash.deno.com), create a project and link this repo.
   Choose **GitHub Action** mode (build runs in the workflow, not on Deno).
2. Set the repo variable **`DENO_DEPLOY_PROJECT`** to your project name (or edit
   `.github/workflows/deploy-denoise-docs.yml`).
3. Push to `main` — the workflow builds the static site and deploys the Deno
   server.

## 👀 Want to learn more?

Check out [Starlight’s docs](https://starlight.astro.build/), read
[the Astro documentation](https://docs.astro.build), or jump into the
[Astro Discord server](https://astro.build/chat).
