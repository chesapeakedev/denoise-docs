#!/usr/bin/env node
/**
 * Validates Starlight sidebar slugs in astro.config.mjs against docs collection IDs.
 * Uses github-slugger (same default as docsLoader) so dotted filenames are caught early.
 * Exit 1 on mismatch. Copy to scripts/ when adopting permanently.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..", "..", "..");
const configPath = resolve(repoRoot, "astro.config.mjs");
const docsDir = resolve(repoRoot, "src/content/docs");

/** Default Starlight docsLoader id: slugify each path segment, strip extension. */
function collectionIdFromPath(relativePath) {
  const slugger = new GithubSlugger();
  const withoutExt = relativePath.replace(/\.(md|mdx)$/, "");
  return withoutExt
    .split("/")
    .map((segment) => slugger.slug(segment))
    .join("/");
}

function walkDocs(dir, prefix = "") {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_")) continue;
    const full = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) {
      files.push(...walkDocs(full, rel));
    } else if (/\.(md|mdx)$/.test(name)) {
      files.push(rel);
    }
  }
  return files;
}

const config = readFileSync(configPath, "utf8");
const sidebarSlugs = [...config.matchAll(/slug:\s*["']([^"']+)["']/g)].map((
  m,
) => m[1]);
const uniqueSidebarSlugs = [...new Set(sidebarSlugs)];

const docFiles = walkDocs(docsDir);
const collectionIds = new Set(docFiles.map(collectionIdFromPath));

const missing = uniqueSidebarSlugs.filter((slug) => !collectionIds.has(slug));

if (missing.length) {
  console.error("Sidebar slug(s) do not match any docs collection id:\n");
  for (const slug of missing) {
    console.error(`  - sidebar: ${slug}`);
    const dir = slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")) : "";
    const base = slug.slice(slug.lastIndexOf("/") + 1);
    const prefix = base.split(".")[0];
    const guess = docFiles.find(
      (f) =>
        (dir ? f.startsWith(`${dir}/`) : true) &&
        f.replace(/\.(md|mdx)$/, "").includes(prefix),
    );
    if (guess) {
      console.error(`    file on disk: src/content/docs/${guess}`);
      console.error(`    use sidebar slug: ${collectionIdFromPath(guess)}`);
    } else {
      console.error(`    add: src/content/docs/${slug}.md (or .mdx)`);
    }
    console.error("");
  }
  console.error(
    "Tip: dots in filenames are slugified (e.g. kimi-k2.6.md → …-kimi-k26). Use generateId in content.config.ts or rename the file.\n",
  );
  process.exit(1);
}

console.log(
  `OK: ${uniqueSidebarSlugs.length} sidebar slug(s) match docs collection ids.`,
);
