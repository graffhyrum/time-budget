// MCP stdio server exposing gauge_task for xkcd #1205 "Is it worth the time?"
// Self-contained: resolves the project CLI relative to this file.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const CLI_PATH = resolve(import.meta.dir, "..", "..", "..", "src", "cli.ts");
const PKG_VERSION = JSON.parse(readFileSync(resolve(import.meta.dir, "..", "..", "..", "package.json"), "utf-8")).version as string;

type Req = { jsonrpc: "2.0"; id?: number | string; method: string; params?: Record<string, unknown> };

const METHODS: Record<string, (p: Record<string, unknown>) => unknown> = {
	initialize: (p) => ({
		protocolVersion: typeof p.protocolVersion === "string" ? p.protocolVersion : "2025-06-18",
		capabilities: { tools: {} },
		serverInfo: { name: "worth-the-time", version: PKG_VERSION },
	}),
	ping: () => ({}),
	"tools/list": () => ({
		tools: [
			{
				name: "gauge_task",
				description:
					"Given how often a task is done and how much time is saved per occurrence, returns the maximum time you can spend automating it (xkcd #1205).",
				inputSchema: {
					type: "object",
					properties: {
						frequency: {
							type: "string",
							description: "How often the task is done: a label (50/day, 5/day, daily, weekly, monthly, yearly) or a number (times per year).",
						},
						time_saved: {
							type: "string",
							description: "Time saved per occurrence: a label (1s, 5s, 30s, 1m, 5m, 30m, 1h, 6h, 1d) or a number (seconds).",
						},
					},
					required: ["frequency", "time_saved"],
				},
			},
		],
	}),
	"tools/call": (p) => {
		const args = p.arguments as { frequency?: unknown; time_saved?: unknown } | undefined;
		const freq = String(args?.frequency ?? "");
		const saved = String(args?.time_saved ?? "");
		let out: string;
		try {
			out = execFileSync("bun", ["run", CLI_PATH, "--freq", freq, "--saved", saved], {
				encoding: "utf-8",
				timeout: 15000,
			});
		} catch (e) {
			out = `Error: ${e instanceof Error ? e.message : String(e)}`;
		}
		return { content: [{ type: "text", text: out.trim() }] };
	},
};

export async function serve(input: AsyncIterable<Uint8Array>, write: (line: string) => void) {
	const decoder = new TextDecoder();
	let buf = "";
	for await (const chunk of input) {
		buf += decoder.decode(chunk, { stream: true });
		const lines = buf.split("\n");
		buf = lines.pop() ?? "";
		for (const line of lines.map((l) => l.trim()).filter(Boolean)) {
			const out = respond(JSON.parse(line) as Req);
			if (out) write(`${JSON.stringify(out)}\n`);
		}
	}
}

export function respond(req: Req): object | null {
	if (req.id === undefined) return null;
	const result = METHODS[req.method]?.(req.params ?? {});
	if (result === undefined) {
		return { jsonrpc: "2.0", id: req.id, error: { code: -32601, message: `no method ${req.method}` } };
	}
	return { jsonrpc: "2.0", id: req.id, result };
}

if (import.meta.main) await serve(Bun.stdin.stream(), (line) => process.stdout.write(line));