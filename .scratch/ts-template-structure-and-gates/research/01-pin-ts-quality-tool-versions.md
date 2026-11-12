# Research: Pin TS quality tool versions

Ticket: `.scratch/ts-template-structure-and-gates/issues/01-pin-ts-quality-tool-versions.md`

## Summary

The template's pins are still the current published releases of the ts-quality tools; nothing newer has shipped. For oxlint, both `oxlint` and `oxlint-tsgolint` have moved slightly past the template's caret ranges (1.90.0 → 1.93.0 and 7.0.2005 → 7.0.2007). oxlint's type-aware mode does **not** work against the time-budget tsconfig as-is, because the hutch devkit tsconfig sets `baseUrl`, which TypeScript 7 (the compiler tsgolint embeds) removed; overriding `"baseUrl": null` in the project tsconfig makes type-aware linting run.

## ts-quality tool versions (GitHub releases)

Source repo: https://github.com/graffhyrum/ts-quality (releases: https://github.com/graffhyrum/ts-quality/releases)

| Tool | Template pin (package.json) | Latest release | Release tag / date |
|---|---|---|---|
| `@graff/rule-validator` | `rule-validator-v1.2.1/...-1.2.1.tgz` | 1.2.1 | `rule-validator-v1.2.1` (2026-11-07) |
| `@stepdown/analyzer` | `stepdown-rule-v0.4.7/...-0.4.7.tgz` | 0.4.7 | `stepdown-rule-v0.4.7` (2026-11-07) |
| `@graffhyrum/crap4ts` | `crap4ts-v2.1.4/...-2.1.4.tgz` | 2.1.4 | `crap4ts-v2.1.4` (2026-11-07) |
| `mutate4ts` | `mutate4ts-v1.0.1/...-1.0.1.tgz` | 1.0.1 | `mutate4ts-v1.0.1` (2026-11-07) |

Verified: `gh release list --repo graffhyrum/ts-quality` shows only those four releases (no drafts/newer tags), and the `.changeset/` directory in the repo contains no pending changesets. Each release tarball URL returns HTTP 302 (redirect to asset). Package versions in `packages/*/package.json` match the release tags (rule-validator 1.2.1, stepdown 0.4.7, crap4ts 2.1.4, mutate4ts 1.0.1).

Recommendation: pin exactly the template's GitHub-release tgz URLs (no version bump available).

## oxlint / oxlint-tsgolint (npm)

- npm registry (latest): https://registry.npmjs.org/oxlint/latest → `1.93.0`; tarball https://registry.npmjs.org/oxlint/-/oxlint-1.93.0.tgz
- npm registry (latest): https://registry.npmjs.org/oxlint-tsgolint/latest → `7.0.2007`

Template pins: `oxlint ^1.90.0`, `oxlint-tsgolint ^7.0.2005`.

Recommendation: bump to `oxlint ^1.93.0` and `oxlint-tsgolint ^7.0.2007` to pick up the latest type-aware fixes; both were verified to run type-aware linting against this repo's tsconfig (with the baseUrl override below). oxlint-tsgolint 7.0.2007 embeds TypeScript 7.0.2 (see https://github.com/oxc-project/tsgolint README), which is why legacy tsconfig options such as `baseUrl` are now hard errors.

## oxlint type-aware vs. hutch-extended tsconfig

Reproduction in this repo:

```
$ oxlint --type-aware
tsconfig.json:3:2: error typescript(tsconfig-error): Invalid tsconfig
  Option 'baseUrl' has been removed. Please remove it from your configuration.
  See https://github.com/oxc-project/tsgolint/issues/351
```

Root cause: the hutch devkit tsconfig (`./.hutch/devkit/tsconfig.json`) uses `"baseUrl": "."` for its `paths` mapping. tsgolint is built on typescript-go (TypeScript 7), where `baseUrl` was removed (https://github.com/oxc-project/tsgolint/issues/351; https://oxc.rs/docs/guide/usage/linter/type-aware).

Workarounds verified:
1. Override the inherited option in the project `tsconfig.json` with `"baseUrl": null` inside `compilerOptions`. This makes oxlint type-aware run and still resolves the electrobun path mappings (verified with both oxlint 1.90.0 + tsgolint 7.0.2005 and oxlint 1.93.0 + tsgolint 7.0.2007).
2. Alternatively, remove `baseUrl` from the hutch devkit tsconfig and prefix its `paths` entries with `./.hutch/devkit/...` (more invasive; hutch regenerates this file, so prefer option 1).

Note: `bun check` (TypeScript 5.9) still accepts `baseUrl`, and the override with `null` is accepted by tsc 5.9 in this repo's verification, so the single tsconfig can serve both tools. Plan: layer `"baseUrl": null` into the project tsconfig's `compilerOptions` when wiring the lint gate, keeping the hutch extension (per map.md decision: "layer template strict tsconfig flags onto the existing hutch devkit extension").

## Sources

- Template pins: `/home/graff/projects/ts-template/package.json` (lines 37-42).
- ts-quality releases: `gh release list --repo graffhyrum/ts-quality`; https://github.com/graffhyrum/ts-quality/releases
- oxlint npm: https://registry.npmjs.org/oxlint/latest ; https://registry.npmjs.org/oxlint-tsgolint/latest
- tsgolint baseUrl removal: https://github.com/oxc-project/tsgolint/issues/351 ; https://oxc.rs/docs/guide/usage/linter/type-aware
- oxlint type-aware docs: https://oxc.rs/docs/guide/usage/linter/type-aware
- Verified locally: oxlint 1.90.0/1.93.0 with tsgolint 7.0.2005/7.0.2007 against this repo's tsconfig (with and without `baseUrl: null`).
path: /home/graff/repos/time-budget/.scratch/ts-template-structure-and-gates/research/01-pin-ts-quality-tool-versions.md