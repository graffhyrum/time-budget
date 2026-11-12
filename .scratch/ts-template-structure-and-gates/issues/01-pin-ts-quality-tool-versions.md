Type: research
Status: resolved

## Question

Which versions of the ts-quality tools and oxlint should be pinned for this project, matching the template's releases? The template pins specific GitHub release tgz URLs for rule-validator, stepdown, crap4ts, mutate4ts, plus oxlint/oxlint-tsgolint from npm. We need the current available versions and whether any have moved since the template's pins. Also confirm oxlint type-aware mode works with the hutch-extended tsconfig.

Blocked by:

## Answer

Pin the ts-quality tools at the template's current GitHub-release tgz URLs (rule-validator 1.2.1, stepdown 0.4.7, crap4ts 2.1.4, mutate4ts 1.0.1 — no newer releases exist) and bump oxlint to ^1.93.0 / oxlint-tsgolint to ^7.0.2007. oxlint type-aware does not run against the hutch-extended tsconfig as-is because hutch sets `baseUrl` (removed in TS 7); override it with `"baseUrl": null` in the project tsconfig. Full findings: `.scratch/ts-template-structure-and-gates/research/01-pin-ts-quality-tool-versions.md`.
