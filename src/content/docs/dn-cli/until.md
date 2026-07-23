---
title: Until (generator / verifier)
description: Keep an agent working a goal until an independent gate says stop, within a budget.
---

`dn until` runs a bounded **generator / verifier** loop from a JSON config
(gambit). Use it when you have a goal and an independent done check — not when
you already have a GitHub issue or plan file. For issue → plan → implement, use
[kickstart and loop](/dn-cli/overview/) instead.

# When to use until

Use `dn until` when:

- The merge bar (for example `make precommit`) is the definition of done
- You want repeated agent attempts until a shell gate passes
- You need a one-shot follow-up gambit after a feature loop (for example a CI
  fixer)

Prefer a **script verifier** whenever a command can decide done (exit code 0).
Reserve prompt verifiers for rubric-style goals that have no shell check.

## `dn until`

```bash
dn until validate .github/dn/gambit.json
dn until run .github/dn/gambit.json
dn until run .github/dn/gambit.json --once
dn until run .github/dn/gambit.json --strict-verdict
dn --agent claude until run .github/dn/gambit.json --sandbox docker
```

`validate` parses the config and prints the gambit count. `run` executes gambits
in order under one sandbox lifecycle. `--once` forces a single
generator → verifier tick (same as `one_shot: true` on a gambit).

## Gambit shape

Each gambit needs a `generator` and a `verifier`. Each action has exactly one of
`prompt` or `script`. Optional fields: `name`, `metadata`, `secrets` (env var
**names** only), `max_iterations` (default 10, minimum 1), `timeout_ms`,
interval delays, and `one_shot`.

`metadata` values are substituted into prompts as `{{key}}` and prepended as a
Context block so the field is never ignored.

## Recipe: make the merge bar green

Lead with your project's real merge gate — not a bare unit-test command — so the
loop stops when the change is actually landable.

```json
{
  "gambits": [
    {
      "name": "precommit-green",
      "metadata": {
        "goal": "Add until docs for the CLI and keep the repo gate green"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Prefer small, reviewable edits. Stop when make precommit would pass."
      },
      "verifier": { "script": "make precommit" },
      "max_iterations": 5,
      "timeout_ms": 3600000
    }
  ]
}
```

```bash
dn until run .github/dn/gambit.json
```

Replace `make precommit` with whatever your repo uses as the merge bar (`deno
task check`, `npm test && npm run lint`, and so on).

## Recipe: feature loop then one-shot CI fixer

Chain gambits when a focused feature gate should pass first, then a broader
cleanup pass should run once:

```json
{
  "gambits": [
    {
      "name": "feature",
      "metadata": {
        "goal": "Implement the until verifier verdict-file path in cli/until.ts"
      },
      "generator": {
        "prompt": "Implement {{goal}}. Keep changes in cli/ and matching tests."
      },
      "verifier": {
        "script": "deno test cli/test_until.ts --allow-all"
      },
      "max_iterations": 8
    },
    {
      "name": "ci-tail",
      "one_shot": true,
      "metadata": {
        "goal": "Resolve any type, lint, or format issues left by the feature gambit"
      },
      "generator": {
        "prompt": "{{goal}}. Do not expand scope beyond making the merge bar green."
      },
      "verifier": { "script": "make precommit" }
    }
  ]
}
```

## Prompt verifiers (when you need them)

If no script can decide done, use a prompt verifier. `dn until` checks done in
this order:

1. Verdict file (default `.dn/until-verdict.json`, or `verifier.verdict_path`)
   with `{"done": true}`
2. Extractable JSON in stdout with `"done": true`
3. Optional `verifier.done_when.stdout_contains` (weaker escape hatch)

`dn until` injects verdict-file instructions into the verifier prompt. Missing
or unparseable verdicts continue the loop unless you pass `--strict-verdict`.

```json
{
  "generator": { "prompt": "Improve the docs tone for {{audience}}" },
  "verifier": {
    "prompt": "Judge whether the docs meet the rubric for {{audience}}.",
    "verdict_path": ".dn/until-verdict.json"
  },
  "metadata": { "audience": "dn CLI users" },
  "max_iterations": 3
}
```

## Anti-patterns

- Using a generator that is only `fmt` or another non-goal command
- Relying on a prompt verifier to print *only* JSON on stdout without a verdict
  file
- Omitting `max_iterations` / `timeout_ms` on long-running agent loops
- Putting secret **values** in the gambit JSON — list env var names in `secrets`
  instead

## Related

- [Orchestrate Agents](/dn-cli/workflows/) — catalog of workflow commands
- [Kickstart & Looping](/dn-cli/overview/) — issue and plan shaped work
- [Filesystem Context](/dn-cli/filesystem-context/) — plans and continuation
  files
