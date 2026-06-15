// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  output: "static",
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    starlight({
      title: "denoise & dn",
      customCss: ["./src/styles/theme.css"],
      components: {
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        Footer: "./src/components/Footer.astro",
      },
      sidebar: [
        { label: "Introduction", slug: "introduction" },
        {
          label: "dn CLI",
          items: [
            {
              label: "Installation & prerequisites",
              slug: "dn-cli/installation",
            },
            { label: "Command overview", slug: "dn-cli/subcommands" },
            { label: "Workflows", slug: "dn-cli/workflows" },
            { label: "Repository setup", slug: "dn-cli/repository-setup" },
            { label: "GitHub automation", slug: "dn-cli/github-automation" },
            {
              label: "Task list & sync",
              slug: "dn-cli/task-list-and-sync",
            },
            { label: "Authentication", slug: "dn-cli/authentication" },
            {
              label: "Output & environment",
              slug: "dn-cli/output-and-environment",
            },
            { label: "GitHub token setup", slug: "dn-cli/github-token-setup" },
            { label: "Kickstart details", slug: "kickstart/overview" },
            {
              label: "Plan files & continuation",
              slug: "kickstart/plan-files",
            },
            { label: "OpenCode configuration", slug: "kickstart/configuration" },
            { label: "GitHub Actions", slug: "kickstart/github-actions" },
            {
              label: "GitHub workflow integration",
              slug: "kickstart/github-actions-integration",
            },
            {
              label: "OpenCode + DeepInfra Kimi K2.6",
              slug: "kickstart/opencode-deepinfra-kimi-k2-6",
            },
            { label: "Kickstart troubleshooting", slug: "kickstart/troubleshooting" },
          ],
        },
        {
          label: "Denoise",
          items: [
            { label: "Getting started", slug: "denoise/getting-started" },
            { label: "Authentication", slug: "denoise/authentication" },
            { label: "Features", slug: "denoise/features" },
            { label: "GitHub integration", slug: "denoise/github-integration" },
            { label: "Deployment", slug: "denoise/deployment" },
            {
              label: "Tips & troubleshooting",
              slug: "denoise/tips-troubleshooting",
            },
          ],
        },
        {
          label: "Operations",
          items: [
            {
              label: "Self-hosted runners",
              slug: "operations/self-hosted-runners",
            },
            {
              label: "Hung process triage",
              slug: "operations/hung-process-triage",
            },
          ],
        },
      ],
    }),
  ],
});
