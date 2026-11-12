Type: research
Status: resolved

## Question

What configuration do rule-validator and stepdown-rule require in this repo? The template runs them with no args (rule-validator) and a glob (stepdown-rule "src/**/*.ts" "scripts/**/*.ts" "config.ts"). For electrobun, the globs must cover src/bun, src/cli, src/mainview, scripts. Determine the exact invocation and any config file needed, and whether rule-validator reads tsconfig or its own config.

Blocked by:

## Answer

rule-validator and stepdown-rule need **no config file** in this repo. rule-validator reads an optional `rule-validator.config.json` (walks up from CWD) for `exclude`/per-rule `exclude`; stepdown reads an optional `.stepdownrc.json` (missing file treated as empty). Neither reads `tsconfig.json`.

Exact invocations for electrobun:

- `rule-validator` — run with **no args**; default glob `**/*.{ts,tsx,js,jsx}` covers `src/bun`, `src/cli`, `src/mainview`, `scripts`, and top-level configs.
- `stepdown-rule "src/**/*.ts" "scripts/**/*.ts" "*.config.ts"` — `"src/**/*.ts"` covers all of `src/` (including `src/bun`, `src/cli.ts`, `src/mainview`); add `"*.config.ts"` to mirror the template's `"config.ts"` for top-level config files.

See `.scratch/ts-template-structure-and-gates/research/05-rule-validator-and-stepdown-config.md` for details and sources.
