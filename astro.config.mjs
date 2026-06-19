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
            { label: "Subcommands", slug: "dn-cli/subcommands" },
            { label: "Orchestrate Agents", slug: "dn-cli/workflows" },
            { label: "Kickstart & Looping", slug: "dn-cli/overview" },
            {
              label: "Filesystem Context",
              slug: "dn-cli/filesystem-context",
            },
            { label: "Working with Github", slug: "dn-cli/github-commands" },
            {
              label: "Experimental",
              slug: "dn-cli/task-list-and-sync",
            },
            {
              label: "Non-interactive Use",
              slug: "dn-cli/output-and-environment",
            },
          ],
        },
        {
          label: "dn in github actions",
          items: [
            {
              label: "GitHub Actions Integration",
              slug: "dn-cli/github-actions",
            },
            { label: "GitHub token setup", slug: "dn-cli/github-token-setup" },
            {
              label: "OpenCode configuration",
              slug: "dn-cli/configuration",
            },
            {
              label: "OpenCode + DeepInfra Kimi K2.7 Code",
              slug: "dn-cli/opencode-deepinfra-kimi-k2-7-code",
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
              label: "Coming Soon",
              slug: "operations/coming-soon",
            },
          ],
        },
      ],
    }),
  ],
});
