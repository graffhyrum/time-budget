# Research: Browser test runner for mainview

## Question

Which browser/DOM test runner fits the mainview (vite-built web app, DOM code in
`src/mainview/main.ts`) so it integrates with `bun test`/CI/vet without heavy setup
and supports the vite build output? Candidates considered: vitest+jsdom/happy-dom,
playwright, and bun's built-in DOM environment.

## Sources checked

- Bun DOM testing docs — https://bun.com/docs/test/dom
- Vitest Browser Mode guide — https://vitest.dev/guide/browser/
- Vitest config: browser.provider / browser.enabled — https://vitest.dev/config/browser/
- Playwright (via Vitest provider docs) — https://vitest.dev/config/browser/playwright
- ts-template `scripts/vet.ts`, `scripts/coverage-threshold.ts` (single-runner coverage pipeline)
- Repo: `vite.config.ts` (root `src/mainview`, outDir `../../dist`), `src/mainview/main.ts` (imports `./style.css`, uses `document` at module load)

## Findings

### 1. bun test already supports DOM (happy-dom / jsdom) natively

Bun's test runner sets up happy-dom or jsdom for you and provides the same globals as
Vitest (`window`, `document`, `HTMLElement`, …). Install the package as a dev
dependency and enable it per file or globally:

- Global: `bunfig.toml` `[test] environment = "happy-dom"` (or `"jsdom"`).
- Per file: `// @vitest-environment happy-dom` anywhere in the file.
- Options via `@vitest-environment-options` (JSON, passed to the `Window`/`JSDOM`
  constructor). Default URL `http://localhost:3000`.

Source: https://bun.com/docs/test/dom

In this repo's pinned Bun (1.4.4) the `--environment` CLI flag is not available, but
the documented preload approach works and is minimal:

```toml
# bunfig.toml
[test]
preload = ["./test-setup.ts"]
```

```ts
// test-setup.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
```

Verified locally in a scratch project: `main.ts` (which does
`document.getElementById("app")!` at module load and `import "./style.css"`) loads
and runs under `bun test` with the happy-dom preload; the CSS import does not break
the run (Bun resolves it as an empty module). TS types are handled with
`/// <reference lib="dom" />` in test files.

### 2. vitest is vite-native but adds a second runner

Vitest uses Vite's dev server/transform pipeline, so it understands `vite.config.ts`
(aliases, root, CSS, assets) with no extra config, and offers `environment:
"happy-dom"` plus an optional real-browser mode (`@vitest/browser-playwright`).

Source: https://vitest.dev/guide/browser/, https://vitest.dev/config/browser/

Cost for this repo: a separate test command and a separate coverage report. The vet
pipeline (`scripts/vet.ts`, `scripts/coverage-threshold.ts`) is built on
`bun test --coverage` + lcov and gates every source file in one pass. A second
runner would need its own coverage merge step before the 100% threshold can apply to
`src/mainview/**`. Playwright browser binaries (`@vitest/browser-playwright`) are
not cached in this environment, so real-browser mode needs a network install.

### 3. playwright is an E2E tool, not a unit runner

Playwright drives a real browser and is the right tool for end-to-end smoke tests
against the built `dist/index.html`, but it requires browser binaries, a separate
config, and heavier CI setup. It does not fit "unit coverage under vet" and is not
needed to reach 100% on `main.ts` (pure DOM logic, no layout/render fidelity
requirement).

Source: https://vitest.dev/config/browser/playwright (playwright as provider),
https://playwright.dev

### 4. mainview has no vite-specific transform needs

`src/mainview/main.ts` imports only `./style.css` (side-effect, no assertions) and
standard DOM APIs. It uses no Vite env vars, asset imports, or path aliases, so it
does not require Vite's transform pipeline to be testable. The vite config
(`root: src/mainview`, `outDir: ../../dist`) is a build concern, not a test
concern.

## Recommendation

Use **bun test + happy-dom (preload)** as the browser/DOM runner for `src/mainview/**`.
It is the lightest option, keeps a single test runner and a single coverage/lcov
pipeline for vet, and needs no browser binaries or second config.

Between the two ticket candidates, **vitest + happy-dom is the better fit than
playwright** for DOM unit tests (vite-native transforms), but it is still
unnecessary here because bun test covers the same ground natively. Reserve
Playwright for optional manual/E2E smoke tests against the built `dist/`.

### Minimal config

`bunfig.toml` (repo root):

```toml
[test]
preload = ["./test-setup.ts"]
```

`test-setup.ts` (repo root):

```ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
```

Dev deps: `bun add -d happy-dom @happy-dom/global-registrator`.

Per test file (`src/mainview/*.test.ts`):

```ts
/// <reference lib="dom" />
import { test, expect } from "bun:test";
```

Set up the DOM (e.g. `document.body.innerHTML = '<div id="app"></div>'`) before
dynamically importing `./main`, since `main.ts` reads `document` at module load.

### CI / vet integration

- `bun test` / `bun test --coverage --coverage-reporter=lcov` already covers
  `src/mainview/**/*.ts`; no new vet step required. The existing
  `coverage-threshold.ts` gates it at 100% functions + lines alongside the rest.
- Add `src/mainview/**/*.test.ts` test files; keep `*.test.ts` excluded from the
  gated source glob (already handled by `isGatedFile`).
- If real-browser fidelity is ever required, add a separate `bunx vitest run`
  (happy-dom) or Playwright smoke job outside vet; do not block the gate on it.

## Answer

Use bun test + happy-dom (preload) as the DOM runner for `src/mainview/**` — it
keeps the single coverage pipeline and needs no browser binaries. Vitest+happy-dom
is the better of the two ticket candidates if vite-transform fidelity is needed;
Playwright is reserved for E2E smoke against the built dist. Minimal setup is a
`bunfig.toml` preload of a one-line `test-setup.ts` plus `happy-dom` +
`@happy-dom/global-registrator` dev deps.