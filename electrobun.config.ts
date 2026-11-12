import type { ElectrobunConfig } from "electrobun";
import { readFileSync } from "node:fs";

// Single source of truth for the app version: package.json.
// Keep package.json in sync with the git tag (e.g. v1.1.0).
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8")) as { version: string };

export default {
	app: {
		name: "Is It Worth The Time",
		identifier: "isitworththetime.electrobun.dev",
		version: pkg.version,
	},
	build: {
		mainProcess: "bun",
		bun: {
			entrypoint: "src/bun/index.ts",
		},
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
		},
		watchIgnore: ["dist/**"],
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;