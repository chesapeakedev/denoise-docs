// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  output: "static",
  redirects: {
    "/dn-cli/usage": "/dn-cli/completing-github-issues/",
    "/dn-cli/overview": "/dn-cli/completing-github-issues/",
    "/dn-cli/plan-lifecycle": "/dn-cli/completing-github-issues/",
    "/dn-cli/until": "/dn-cli/workflows/#dn-until",
    "/dn-cli/land": "/dn-cli/workflows/#dn-land",
  },
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: "denoise",
      customCss: ["./src/styles/theme.css"],
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        Footer: "./src/components/Footer.astro",
      },
      sidebar: [
        { label: "Introduction", slug: "introduction" },
        {
          label: "dn",
          items: [
            {
              label: "Installation",
              slug: "dn-cli/installation",
            },
            {
              label: "Completing GitHub Issues",
              slug: "dn-cli/completing-github-issues",
            },
            { label: "Command reference", slug: "dn-cli/workflows" },
            { label: "Sandbox execution", slug: "dn-cli/sandbox" },
            {
              label: "Filesystem Context",
              slug: "dn-cli/filesystem-context",
            },
            { label: "Working with GitHub", slug: "dn-cli/github-commands" },
            {
              label: "Experimental",
              slug: "dn-cli/task-list-and-sync",
            },
          ],
        },
        {
          label: "Headless Use",
          items: [
            {
              label: "Headless Use",
              slug: "dn-cli/headless-use",
            },
            {
              label: "Scheduled Workflows",
              slug: "dn-cli/scheduled-workflows",
            },
            { label: "GitHub token setup", slug: "dn-cli/github-token-setup" },
            {
              label: "Progress reporting",
              slug: "dn-cli/progress-reporting",
            },
            {
              label: "Agent Configuration",
              items: [
                { label: "OpenCode", slug: "dn-cli/opencode" },
                { label: "Claude", slug: "dn-cli/claude" },
                { label: "Codex", slug: "dn-cli/codex" },
                { label: "Cursor", slug: "dn-cli/cursor-github-actions" },
              ],
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
            { label: "v0.0.34 migration", slug: "dn-cli/v0034-migration" },
          ],
        },
      ],
    }),
  ],
});
