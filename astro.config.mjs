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
              label: "Experimental",
              slug: "dn/task-list-and-sync",
            },
          ],
        },
        {
          label: "Headless Use",
          items: [
            {
              label: "Headless Use",
              slug: "dn/headless-use",
            },
            {
              label: "Scheduled Workflows",
              slug: "dn/scheduled-workflows",
            },
            { label: "GitHub token setup", slug: "dn/github-token-setup" },
            {
              label: "Progress reporting",
              slug: "dn/progress-reporting",
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
            {
              label: "Raspberry Pi runner",
              slug: "cookbooks/raspberry-pi-runner",
            },
          ],
        },
        {
          label: "denoise",
          items: [
            { label: "Getting started", slug: "denoise/getting-started" },
            { label: "Authentication", slug: "denoise/authentication" },
            { label: "Features", slug: "denoise/features" },
            { label: "Workbench", slug: "denoise/workbench" },
            {
              label: "Milestone details",
              slug: "denoise/milestone-details",
            },
            {
              label: "Kickstart runtimes",
              slug: "denoise/kickstart-runtimes",
            },
            {
              label: "Subscription & Pro",
              slug: "denoise/subscription-and-pro",
            },
            { label: "GitHub integration", slug: "denoise/github-integration" },
            {
              label: "Developer device runners",
              slug: "denoise/device-runners",
            },
            {
              label: "Tips & troubleshooting",
              slug: "denoise/tips-troubleshooting",
            },
          ],
        },
        {
          label: "denoise Infra",
          items: [
            {
              label: "Self-hosted runners",
              slug: "operations/self-hosted-runners",
            },
            {
              label: "Coming Soon",
              slug: "operations/coming-soon",
            },
            { label: "v0.0.34 migration", slug: "dn/v0034-migration" },
          ],
        },
      ],
    }),
  ],
});
