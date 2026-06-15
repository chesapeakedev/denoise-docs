---
name: brand-voice
description: >-
  Apply the denoise-docs brand voice, editorial style, and documentation house
  style. Use when writing, rewriting, reviewing, or organizing English docs,
  wiki pages, Starlight content, headings, links, procedures, explanations,
  docs navigation, style consistency, voice and tone, or reader-burden reduction.
---

# Brand voice for denoise docs

Use this skill when changing prose in `src/content/docs/` or adjacent docs
metadata. Treat "brand voice" as the repo's editorial style: how pages sound,
how they are organized, and how much work they ask the reader to do.

## Core voice

Write like a practical technical teammate:

- Be direct, calm, and specific.
- Prefer useful context over persuasion.
- Use plain English without flattening important technical distinctions.
- Sound confident only where the docs have evidence.
- Keep the reader moving toward the next action.

Avoid:

- Sales copy, hype, jokes, cuteness, or personality-first phrasing.
- Over-apologizing, over-politeness, and filler such as "please note."
- Claims that a task is simple, easy, quick, or obvious.
- Metaphors and culturally specific references.
- Repeating the same sentence opening across a section.

## Reader model

Before editing a page, identify the reader's likely intent:

- **Developer using `dn`**: Wants commands, prerequisites, file locations, and
  behavior details with minimal preamble.
- **denoise app user**: Wants UI actions, sync/auth implications, and safe next
  steps without needing implementation details.
- **Operator/maintainer**: Wants diagnosis, commands, failure modes, and
  recovery steps.

If a page serves multiple audiences, separate those paths with headings, tables,
or short lead-in paragraphs. Do not make every reader parse every path.

## Page shape

Make each page answer these questions in order:

1. What is this page about?
2. When should the reader use it?
3. What should the reader do?
4. What should they expect next?

Use the existing Starlight conventions:

- Keep frontmatter `title` short and concrete.
- Make `description` summarize the page's practical value.
- Use sentence-case headings unless the surrounding file clearly differs.
- Prefer short paragraphs and lists over dense walls of text.
- Use numbered lists for ordered steps and bullets for unordered choices.
- Put prerequisites and conditions before instructions.
- Use code fences for commands and inline code for command names, file paths,
  flags, environment variables, and literal values.

## Reduce reader burden

Do the editorial work so the reader does not have to:

- Remove duplicate setup context when another page owns it; link instead.
- Keep related facts together, especially auth, sync, and GitHub behavior.
- Introduce terms before relying on them.
- Put the most distinguishing sentence of a paragraph first.
- Prefer descriptive links over "here," "this page," or bare URLs.
- Add a "Next steps" section only when the page naturally hands off to another
  page or workflow.
- Preserve commands, options, URLs, and product behavior unless verified in the
  repo or an authoritative source.

## Local naming and product rules

Use local product names consistently:

- `dn`: the CLI for developers and automation workflows.
- `denoise`: the app experience for tasks, milestones, focus, and GitHub-linked
  planning.
- `kickstart`: the `dn` workflow that turns a GitHub issue, milestone queue
  item, or local markdown spec into a plan and implementation.
- `AWP mode`: the automated branch/bookmark, commit, push, and PR workflow.

Do not capitalize `denoise` or `kickstart` in running text unless they start a
sentence, appear in UI text, or appear in a title that already uses that form.

## Editing workflow

When writing or revising docs:

1. Read the target page and nearby pages that own linked concepts.
2. Decide whether the work is a factual update, a clarity edit, a structural
   rewrite, or a navigation change.
3. Preserve the page's technical contract: commands, flags, data ownership,
   authentication behavior, sync behavior, and file paths.
4. Improve voice and structure in the smallest scope that solves the problem.
5. Check links, headings, and sidebar implications when adding or moving pages.

If facts are missing, leave a clear TODO only when the repo already uses TODOs
for docs. Otherwise, state the known behavior narrowly and avoid speculation.

## Review checklist

Before finishing a docs prose change, check:

- The first paragraph establishes the page's purpose.
- Headings match what a reader is trying to do or understand.
- Procedures are ordered and conditions come before actions.
- Links name the destination or reason to click.
- The page does not repeat another page's full explanation.
- Tone is practical and respectful, with no hype or unnecessary hedging.
- Frontmatter still matches the rendered page.
