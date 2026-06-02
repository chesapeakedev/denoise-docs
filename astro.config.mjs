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
          label: "dn CLI",
          items: [
            {
              label: "Installation & prerequisites",
              slug: "dn-cli/installation",
            },
            { label: "Subcommands", slug: "dn-cli/subcommands" },
            { label: "Authentication", slug: "dn-cli/authentication" },
            { label: "GitHub token setup", slug: "dn-cli/github-token-setup" },
          ],
        },
        {
          label: "Kickstart",
          items: [
            { label: "Overview", slug: "kickstart/overview" },
            { label: "Usage", slug: "kickstart/usage" },
            {
              label: "Plan files & continuation",
              slug: "kickstart/plan-files",
            },
            { label: "Configuration", slug: "kickstart/configuration" },
            { label: "Artifacts & Cursor", slug: "kickstart/artifacts-cursor" },
            { label: "GitHub Actions", slug: "kickstart/github-actions" },
            { label: "Troubleshooting", slug: "kickstart/troubleshooting" },
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
