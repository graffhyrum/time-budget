# Research: rule-validator and stepdown-rule configuration

## Summary

- `rule-validator` takes **one** glob pattern (default `**/*.{ts,tsx,js,jsx}`) and walks up from CWD for an optional `rule-validator.config.json`. It does **not** read `tsconfig.json`; it parses files with `ts.createSourceFile` directly.
- `stepdown-rule` takes **many** glob patterns (default `src/**/*.ts`), walks up-ish via a default `.stepdownrc.json` path (missing file is OK), and ignores `node_modules`, `dist`, `coverage`, `*.d.ts` plus any `ignore` entries. It also does **not** read `tsconfig.json`.
- Neither tool needs a config file to run. Both are safe to invoke with no config in this repo.

## rule-validator

Source: `/home/graff/.agents/node_modules/@graff/rule-validator` (v1.1.3); template `/tmp/opencode/tsq/templates/ts-template` (v0.3.0).

Invocation:
- CLI: `rule-validator [pattern] [--json]` (`src/cli.ts` `buildProgram`). Pattern defaults to `**/*.{ts,tsx,js,jsx}`.
- Template script: `"rule-validator": "rule-validator"` (`package.json`), invoked in `scripts/vet.ts` as `bun run rule-validator`.
- For electrobun, running with **no args** scans `src/bun`, `src/cli`, `src/mainview`, `scripts`, and top-level `*.ts`/`*.tsx`/`*.js`/`*.jsx` automatically. If a narrower scope is wanted, a single brace glob such as `"{src,scripts}/**/*.{ts,tsx}"` works because the CLI accepts one pattern; multiple patterns are not supported.

Config:
- File name: `rule-validator.config.json`, discovered by `findConfigFile` walking from `process.cwd()` (or `startDir`) toward the filesystem root (`src/config.ts` `loadProjectConfig`).
- Schema (arktype, `ProjectConfigSchema`): `{ "exclude"?: string[], "rules"?: { [ruleName]: { "exclude"?: string[] } } }`. Undeclared keys rejected. Malformed config errors out with non-zero exit.
- Global `exclude` appends to built-in defaults (`ALWAYS_EXCLUDE`: `node_modules/**`, `**/node_modules/**`, `dist/**`, `build/**`); `REGEX_SCAN_DEFAULT_EXCLUDES` additionally excludes `scripts/**`, `src/rules/**`, test files, and fixtures. `AST_SCAN_DEFAULT_EXCLUDES` excludes only test files/fixtures.
- No `tsconfig` lookup anywhere in `src/` (verified: no references to `tsconfig`/`createProgram`/`readConfigFile`).

tsconfig dependence: **none**. Files are parsed via `ts.createSourceFile` directly (`src/typescript/compiler.ts` `parseSourceFiles`), so type-aware rules are not provided by this tool (oxlint covers type-aware linting separately).

## stepdown-rule (@stepdown/analyzer)

Source: `/home/graff/.agents/node_modules/@stepdown/analyzer` (v0.4.5); template same invocation.

Invocation:
- CLI: `stepdown-rule [patterns...]` (default `src/**/*.ts`). Subcommands `analyze` (default) and `fix`; options `--ignore`, `--config`, `--json`/`--format`, `--verbose`, `--rules`, `--dry-run`.
- Template script: `"stepdown": "stepdown-rule \"src/**/*.ts\" \"scripts/**/*.ts\" \"config.ts\""` (`package.json`), invoked in `scripts/vet.ts` as `bun run stepdown`.
- For electrobun, the patterns `"src/**/*.ts" "scripts/**/*.ts"` already cover `src/bun`, `src/cli` (including `src/cli.ts`), `src/mainview`, and `scripts`. Add top-level TS config files if desired, mirroring the template's `"config.ts"`: e.g. `"electrobun.config.ts" "hutch.config.ts" "vite.config.ts"` or a single `"*.config.ts"` glob. Note `normalizePattern` in `FileService` treats a directory argument as `dir/**/*.ts`, so file and directory patterns both work.

Config:
- File name: `.stepdownrc.json`, path from `--config` (default `.stepdownrc.json` in CWD). `loadConfig` returns the default `{ ignore: [] }` when the file is missing (`isMissingFileError`), so absence is not an error.
- Schema (`FileConfigSchema`): `{ "ignore"?: string[] }` only. CLI flags (`--ignore`) override file values; `buildConfigFromCli` uses `options.ignore ?? fileConfig.ignore`.
- Built-in ignores (`FileService` `buildIgnore`): `node_modules`, `dist`, `coverage` trees and `**/*.d.ts`. User `ignore` entries are added on top via minimatch.
- No `tsconfig` lookup (verified: no references in `src/`).

tsconfig dependence: **none**. It resolves files via `glob` and parses with the TypeScript AST directly.

## Electrobun recommended exact invocation

```json
{
  "scripts": {
    "rule-validator": "rule-validator",
    "stepdown": "stepdown-rule \"src/**/*.ts\" \"scripts/**/*.ts\" \"*.config.ts\""
  }
}
```

- `rule-validator` runs with no args (default glob covers all TS/JS under the repo, including `src/bun`, `src/cli`, `src/mainview`, `scripts`, and top-level configs).
- `stepdown` uses `"src/**/*.ts"` (covers all of `src/`) plus `"scripts/**/*.ts"` and `"*.config.ts"` (top-level config files, mirroring the template's `"config.ts"`). Adjust the config glob to list specific files if the repo adds non-config top-level TS files that should be excluded.

## Config files needed

None required. Optional:
- `rule-validator.config.json` — only if exclusions or per-rule exclusions are needed. Walks up from CWD, so placing it at the repo root suffices.
- `.stepdownrc.json` — only if extra ignore patterns are needed; missing file is treated as empty config.

## Sources

- `/home/graff/.agents/node_modules/@graff/rule-validator/src/cli.ts` (`buildProgram`, default pattern)
- `/home/graff/.agents/node_modules/@graff/rule-validator/src/config.ts` (`loadProjectConfig`, `findConfigFile`, `ProjectConfigSchema`)
- `/home/graff/.agents/node_modules/@graff/rule-validator/src/typescript/compiler.ts` (`createAnalyzer`, `parseSourceFiles`)
- `/home/graff/.agents/node_modules/@graff/rule-validator/src/exclude-patterns.ts`
- `/home/graff/.agents/node_modules/@graff/rule-validator/README.md` (config section)
- `/home/graff/.agents/node_modules/@stepdown/analyzer/src/cli-options.ts` (patterns default, `--config`)
- `/home/graff/.agents/node_modules/@stepdown/analyzer/src/cli-runners.ts` (`buildConfigFromCli`, `resolvePatterns`)
- `/home/graff/.agents/node_modules/@stepdown/analyzer/src/config/loader.ts` (`loadConfig`, missing-file handling)
- `/home/graff/.agents/node_modules/@stepdown/analyzer/src/config/schema.ts` (`FileConfigSchema`)
- `/home/graff/.agents/node_modules/@stepdown/analyzer/src/services/FileService.ts` (built-in ignores, `normalizePattern`)
- Template: `/tmp/opencode/tsq/templates/ts-template/package.json` (`rule-validator`, `stepdown` scripts) and `/tmp/opencode/tsq/templates/ts-template/scripts/vet.ts`
- Older template: `/home/graff/projects/ts-template.swe-personal/main/package.json` and `scripts/vet.ts`
- Repo: `/home/graff/repos/time-budget/package.json`, `tsconfig.json`, `src/` layout