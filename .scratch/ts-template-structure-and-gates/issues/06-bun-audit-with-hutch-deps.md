Type: research
Status: resolved

## Question

The template's vet runs `bun audit`. This repo depends on hutch/electrobun (local devkit) plus npm deps. Will `bun audit` pass, or are there advisories in the dependency tree (including hutch's transitive deps)? Determine the audit result and whether advisories need ignoring or fixing before the audit gate can land.

Blocked by:

## Answer

`bun audit` passes with zero advisories for the npm dependency tree (93 packages checked) once a lockfile exists. The repo ships no `bun.lock`, so the gate currently fails with "missing lockfile"; recommend committing a `bun.lock` generated via `bun install --lockfile-only` (no dep changes) or generating it in the vet step. hutch/electrobun native deps are out of scope for `bun audit` (native binaries under `.hutch/`); audit those via hutch's own integrity verification. No `--ignore` entries needed. Full details: `.scratch/ts-template-structure-and-gates/research/06-bun-audit-with-hutch-deps.md`.
