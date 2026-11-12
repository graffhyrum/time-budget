---
name: is-it-worth-the-time
description: Gauge whether automating a task is worth the time (xkcd #1205). Use the gauge_task MCP tool or run the CLI: `bun run <repo>/src/cli.ts --freq <frequency> --saved <time>`. Frequency: 50/day, 5/day, daily, weekly, monthly, yearly (or times/year). Time saved: 1s, 5s, 30s, 1m, 5m, 30m, 1h, 6h, 1d (or seconds). Returns the max time you can spend automating and the nearest comic cell.
---

# Is It Worth The Time

When a user asks whether to automate/optimize a task, or how much time they
can spend on it, use the `gauge_task` tool (or the CLI) with the task's
frequency and per-occurrence time saved. Report the maximum spend time and
the nearest comic cell. Greyed-out cells mean "not worth it / impossible".