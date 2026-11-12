# Is It Worth the Time?

A small desktop app based on the xkcd #1205 chart "Is It Worth the Time?" —
enter how often you do a task and how much time you shave off per
occurrence, and it highlights the matching cell: the maximum time you
can spend automating it (across five years) before you stop saving.

Built with [Electrobun](https://electrobun.dev) (Bun + a native webview).

## Who it's for

Anyone deciding whether an automation, shortcut, or tool is worth building —
the chart answers "how much time can I spend on this and still come out
ahead?"

## Why this app

The original comic is a static grid. This app makes it interactive: pick
(or type) your two numbers and the cell lights up, with the exact value
computed for your inputs.

## Quickstart

Prerequisites: [Bun](https://bun.sh) (1.4+) and the Hutch toolchain
(installed automatically by Electrobun).

```sh
bun install
~/.hutch/bin/hutch run dev
```

The app window opens showing the chart. Choose values in the two dropdowns
(or use the custom calculation) to highlight a cell.

For hot module replacement while editing:

```sh
~/.hutch/bin/hutch run dev:hmr
```

## Usage (app)

- **How often you do the task** — dropdown: 50/day, 5/day, daily, weekly,
  monthly, yearly.
- **How much time you shave off** — dropdown: 1 sec … 1 day.
- The highlighted cell shows the maximum time you can spend automating.
- **Custom calculation** — enter times per year and seconds saved; the app
  computes the exact value and highlights the nearest cell.

## CLI

A command-line version of the same calculation:

```sh
bun run cli --freq weekly --saved 1m
bun run cli 5/day 30s
bun run cli --freq 10 --saved 120
```

Frequency accepts a label (`50/day`, `5/day`, `daily`, `weekly`,
`monthly`, `yearly`) or a number (times per year). Time saved accepts a
label (`1s`, `5s`, `30s`, `1m`, `5m`, `30m`, `1h`, `6h`, `1d`) or a
number (seconds).

## Project layout

- `src/bun/index.ts` — main process (opens the window).
- `src/mainview/` — webview UI (HTML/CSS/TypeScript): chart, inputs, styling.
- `src/cli.ts` — command-line version of the calculation.
- `plugins/is-it-worth-the-time/` — agent plugin: MCP server (`scripts/mcp.ts`) +
  skill, plus per-harness config in `.mcp.json`, `.opencode/`, `.cursor/`,
  `.claude/`.
- `electrobun.config.ts` — app name, identifier, build config.
- `hutch.config.ts` — scripts and Electrobun version pin.

## Agent integration (MCP)

The repo ships an MCP server that exposes a `gauge_task` tool, wired for
Claude Code, OpenCode, and Cursor via project-level config (`.mcp.json`,
`.opencode/opencode.jsonc`, `.cursor/mcp.json`). Open the repo in any of
those harnesses and the tool is available automatically; otherwise run:

```sh
bun run plugins/is-it-worth-the-time/scripts/mcp.ts
```

## Build a release

```sh
~/.hutch/bin/hutch run build
```

Produces a signed build under `build/`.

## License

No license specified yet. (Add one before distributing.)