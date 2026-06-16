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
            { label: "Command overview", slug: "dn-cli/subcommands" },
            { label: "Basic usage", slug: "dn-cli/workflows" },
            { label: "Kickstart usage", slug: "kickstart/overview" },
            {
              label: "The plans/ Directory",
              slug: "kickstart/plan-files",
            },
            { label: "GitHub commands", slug: "dn-cli/github-commands" },
            {
              label: "Task list & sync",
              slug: "dn-cli/task-list-and-sync",
            },
            {
              label: "Output & environment",
              slug: "dn-cli/output-and-environment",
            },
          ],
        },
        {
          label: "dn in github actions",
          items: [
            { label: "Repository setup", slug: "dn-cli/github-actions" },
            { label: "GitHub token setup", slug: "dn-cli/github-token-setup" },
            {
              label: "OpenCode configuration",
              slug: "kickstart/configuration",
            },
            {
              label: "OpenCode + DeepInfra Kimi K2.6",
              slug: "kickstart/opencode-deepinfra-kimi-k2-6",
            },
          ],
        },
        {
          label: "denoise",
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
          label: "denoise Infra",
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
