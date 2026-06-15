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
            { label: "Command Overview", slug: "dn-cli/subcommands" },
            { label: "Basic Usage", slug: "dn-cli/workflows" },
            { label: "Repository Setup", slug: "dn-cli/repository-setup" },
            { label: "GitHub Automation", slug: "dn-cli/github-automation" },
            {
              label: "Task List & Sync",
              slug: "dn-cli/task-list-and-sync",
            },
            { label: "Authentication", slug: "dn-cli/authentication" },
            {
              label: "Output & Environment",
              slug: "dn-cli/output-and-environment",
            },
            { label: "GitHub Token Setup", slug: "dn-cli/github-token-setup" },
            { label: "Kickstart Usage", slug: "kickstart/overview" },
            {
              label: "Plan Files & Continuation",
              slug: "kickstart/plan-files",
            },
            {
              label: "OpenCode Configuration",
              slug: "kickstart/configuration",
            },
            { label: "GitHub Actions", slug: "kickstart/github-actions" },
            {
              label: "GitHub Workflow Integration",
              slug: "kickstart/github-actions-integration",
            },
            {
              label: "OpenCode + DeepInfra Kimi K2.6",
              slug: "kickstart/opencode-deepinfra-kimi-k2-6",
            },
            {
              label: "Kickstart Troubleshooting",
              slug: "kickstart/troubleshooting",
            },
          ],
        },
        {
          label: "Denoise",
          items: [
            { label: "Getting started", slug: "denoise/getting-started" },
            { label: "Authentication", slug: "denoise/authentication" },
            { label: "Features", slug: "denoise/features" },
            { label: "GitHub integration", slug: "denoise/github-integration" },
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
