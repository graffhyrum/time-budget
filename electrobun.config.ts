import type { ElectrobunConfig } from "electrobun";

// Single source of truth for the app version: package.json.
// Bun loads JSON modules directly, no file IO needed.
import pkg from "./package.json";

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