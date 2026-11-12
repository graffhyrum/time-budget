Type: research
Status: resolved

## Question

Which browser test runner fits the mainview (vite-built web app, DOM code in src/mainview/main.ts)? Candidates: vitest with jsdom/happy-dom, or playwright. Need one that integrates with `bun test`/CI without heavy setup, and supports the vite build output. Determine the recommended runner and minimal config.

Blocked by:

## Answer

Use bun test + happy-dom (preload) as the DOM runner for `src/mainview/**` — it
keeps the single coverage/lcov pipeline that vet already uses and needs no browser
binaries or second runner. Between the two candidates, vitest+happy-dom is the
better fit than playwright for DOM unit tests (vite-native transforms), but it is
unnecessary here because bun test supports happy-dom/jsdom natively. Reserve
Playwright for optional E2E smoke tests against the built `dist/`.

Minimal config: `bunfig.toml` with `[test] preload = ["./test-setup.ts"]` and a
`test-setup.ts` that calls `GlobalRegistrator.register()` from
`@happy-dom/global-registrator`, plus dev deps `happy-dom` and
`@happy-dom/global-registrator`. Test files use `/// <reference lib="dom" />` and
set up `#app` before dynamically importing `./main`. CI/vet needs no new step —
`bun test --coverage` already covers `src/mainview/**/*.ts` and the existing
threshold script gates it at 100%. See findings file for details and sources.
