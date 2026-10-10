// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  output: "static",
  redirects: {
    "/dn/usage": "/dn/completing-github-issues/",
    "/dn/overview": "/dn/completing-github-issues/",
    "/dn/plan-lifecycle": "/dn/completing-github-issues/",
    "/dn/until": "/dn/workflows/#dn-until",
    "/dn/land": "/dn/workflows/#dn-land",
    "/dn/opencode": "/cookbooks/opencode/",
    "/dn/claude": "/cookbooks/claude-code/",
    "/dn/codex": "/cookbooks/codex/",
    "/dn/cursor-github-actions": "/cookbooks/cursor/",
    "/denoise/workbench": "/denoise/void/",
    "/operations/coming-soon": "/roadmap/",
    "/whats-new/dn-0-0-34": "/whats-new/dn-0-0-37/",
    "/denoise/device-runners": "/runners/device-runners/",
    "/denoise/kickstart-runtimes": "/runners/kickstart-runtimes/",
    "/denoise/runners/overview": "/runners/overview/",
    "/denoise/runners/device-runners": "/runners/device-runners/",
    "/denoise/runners/kickstart-runtimes": "/runners/kickstart-runtimes/",
    "/denoise/runners/runner-logs": "/runners/runner-logs/",
    "/denoise/runners/self-hosted-runners": "/runners/self-hosted-runners/",
    "/operations/self-hosted-runners": "/runners/self-hosted-runners/",
    "/operations/runner-logs": "/runners/runner-logs/",
    "/dn/progress-reporting": "/runners/progress-reporting/",
    "/dn/headless-use": "/runners/headless-use/",
    "/dn/scheduled-workflows": "/runners/scheduled-workflows/",
    "/dn/github-token-setup": "/runners/github-token-setup/",
    "/cookbooks/raspberry-pi-runner": "/runners/raspberry-pi-runner/",
  },
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: "denoise",
      favicon: "/favicon.png",
      logo: {
        src: "./src/assets/denoise-logo.png",
        alt: "denoise",
      },
      customCss: ["./src/styles/theme.css"],
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        Footer: "./src/components/Footer.astro",
        Hero: "./src/components/Hero.astro",
      },
      sidebar: [
        { label: "Introduction", slug: "introduction" },
        {
          label: "Kickstart, land, sync, and done",
          slug: "close-out",
        },
        {
          label: "dn",
          items: [
            {
              label: "Installation",
              slug: "dn/installation",
            },
            {
              label: "Completing GitHub Issues",
              slug: "dn/completing-github-issues",
            },
            { label: "Command reference", slug: "dn/workflows" },
            { label: "Sandbox execution", slug: "dn/sandbox" },
            {
              label: "Filesystem Context",
              slug: "dn/filesystem-context",
            },
            { label: "Working with GitHub", slug: "dn/github-commands" },
            {
              label: "Artifacts and Cursor",
              slug: "dn/artifacts-cursor",
            },
            {
              label: "Task lists and sync",
              slug: "dn/task-list-and-sync",
            },
          ],
        },
        {
          label: "denoise",
          items: [
            { label: "Getting started", slug: "denoise/getting-started" },
            { label: "Authentication", slug: "denoise/authentication" },
            { label: "Features", slug: "denoise/features" },
            { label: "The Void", slug: "denoise/void" },
            {
              label: "Milestone details",
              slug: "denoise/milestone-details",
            },
            {
              label: "Subscription & Pro",
              slug: "denoise/subscription-and-pro",
            },
            { label: "GitHub integration", slug: "denoise/github-integration" },
            {
              label: "Tips & troubleshooting",
              slug: "denoise/tips-troubleshooting",
            },
          ],
        },
        {
          label: "Runners",
          items: [
            { label: "Overview", slug: "runners/overview" },
            { label: "Enroll runners", slug: "runners/device-runners" },
            {
              label: "Kickstart runtimes",
              slug: "runners/kickstart-runtimes",
            },
            {
              label: "Headless setup",
              slug: "runners/headless-use",
            },
            {
              label: "GitHub token setup",
              slug: "runners/github-token-setup",
            },
            {
              label: "Scheduled workflows",
              slug: "runners/scheduled-workflows",
            },
            {
              label: "Progress reporting",
              slug: "runners/progress-reporting",
            },
            { label: "Runner logs", slug: "runners/runner-logs" },
            {
              label: "Self-hosted runners",
              slug: "runners/self-hosted-runners",
            },
            {
              label: "Raspberry Pi",
              slug: "runners/raspberry-pi-runner",
            },
          ],
        },
        {
          label: "Cookbooks",
          items: [
            { label: "Overview", slug: "cookbooks/overview" },
            { label: "OpenCode", slug: "cookbooks/opencode" },
            { label: "Claude Code", slug: "cookbooks/claude-code" },
            { label: "Codex", slug: "cookbooks/codex" },
            { label: "Cursor", slug: "cookbooks/cursor" },
            { label: "GitHub Copilot", slug: "cookbooks/github-copilot" },
            {
              label: "Linear main with Sapling",
              slug: "cookbooks/linear-main-sapling",
            },
          ],
        },
        {
          label: "Operations",
          items: [
            {
              label: "Hung process triage",
              slug: "operations/hung-process-triage",
            },
          ],
        },
        {
          label: "What's new",
          items: [
            {
              label: "dn 0.0.37 and device runners",
              slug: "whats-new/dn-0-0-37",
            },
            { label: "v0.0.34 migration", slug: "dn/v0034-migration" },
          ],
        },
        { label: "Roadmap", slug: "roadmap" },
        {
          label: "Blog",
          items: [
            {
              label: "Working Above Syntax",
              slug: "blog/working-above-syntax",
            },
          ],
        },
      ],
    }),
  ],
});
