# Research: bun audit with hutch deps

## Question
Will `bun audit` pass on this repo, or are there advisories in the dependency tree (including hutch/electrobun transitive deps)?

## Environment
- bun 1.4.4
- Repo: /home/graff/repos/time-budget (branch main, no git lockfile committed)
- `package.json` devDependencies only: `@types/bun` (latest), `concurrently ^9.2.5`, `typescript ~5.9.3`, `vite ^7.3.7`
- hutch-managed: electrobun 2.0.6, cottontail 0.7.3, hutch 0.29.0, bun toolchain 1.4.4 (native binaries under `.hutch/`, not npm packages)

## Method
1. `bun audit` on the repo as-is: failed with `error: missing lockfile, nothing to audit` (exit 1). The repo ships no `bun.lock`.
2. Generated a lockfile without touching node_modules/deps: `bun install --lockfile-only` (produced `bun.lock`, 95 packages resolved, 93 audited). This is a read-only resolution of the existing `package.json` ranges; no dependencies were changed.
3. Re-ran `bun audit`: `No vulnerabilities found (checked 93 packages)` (exit 0).
4. Removed the generated `bun.lock` afterwards to restore the original tree (no dep/lockfile changes committed).

## Audit output (summarized)
```
bun audit v1.4.4
No vulnerabilities found (checked 93 packages) [157.00ms]
exit code: 0
```
No advisories, no high/moderate/low findings, no skipped packages reported for the npm registry.

## Scope note (hutch / electrobun)
`bun audit` only reads `bun.lock` (npm packages). The hutch/electrobun stack (electrobun 2.0.6 devkit, cottontail 0.7.3, hutch 0.29.0 CLI, bun 1.4.4 toolchain) ships as native binaries and a local SDK under `.hutch/`; it is not represented in `package.json` or any npm lockfile, so it is **out of scope** for `bun audit`. Its transitive npm packages (if any) are cached globally under `~/.hutch/cache/npm` and are not part of this project's audit surface. Auditing those would require a separate tool/process (hutch's own integrity checks / `hutch install --verify`), not `bun audit`.

## Conclusion
- npm dependency audit: PASS (0 advisories, 93 packages).
- hutch/electrobun native deps: not auditable by `bun audit`; no advisories observable from this gate.

## Recommendations
- **Ignore vs fix:** Nothing to fix or ignore for the npm tree; no `--ignore` entries needed.
- **Gate blocker:** The template's `bun audit` gate cannot run as-is because the repo ships no `bun.lock` ("missing lockfile"). Recommend one of:
  1. Commit a generated `bun.lock` (via `bun install --lockfile-only`, which does not alter `node_modules` or `package.json`) so `bun audit` has input. This is a lockfile addition, not a dependency change.
  2. Or have the vet gate generate the lockfile first (`bun install --lockfile-only && bun audit`).
  3. Or scope the audit to a lockfile-producing step in CI.
- If hutch's native deps must be audited, use hutch's own verification (`hutch install --verify` / integrity checks on `.hutch/dependencies.lock`), not `bun audit`.
- Re-run `bun audit` after any dependency bump; keep `--audit-level` at default (all severities) since there is no noise to filter today.