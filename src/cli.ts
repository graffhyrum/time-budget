// CLI for "Is it worth the time?" (xkcd 1205)
// Usage:
//   bun run cli --freq <label|number> --saved <label|number>
//   bun run cli <frequency-label> <time-saved-label>
// Examples:
//   bun run cli --freq weekly --saved 1m
//   bun run cli 5/day 30s
//   bun run cli --freq 10 --saved 120

const FREQ_LABELS: Record<string, number> = {
	"50/day": 50 * 365,
	"5/day": 5 * 365,
	daily: 365,
	weekly: 52,
	monthly: 12,
	yearly: 1,
};

const SAVED_LABELS: Record<string, number> = {
	"1s": 1,
	"1sec": 1,
	"5s": 5,
	"5sec": 5,
	"30s": 30,
	"30sec": 30,
	"1m": 60,
	"1min": 60,
	"5m": 300,
	"5min": 300,
	"30m": 1800,
	"30min": 1800,
	"1h": 3600,
	"1hour": 3600,
	"6h": 21600,
	"6hours": 21600,
	"1d": 86400,
	"1day": 86400,
};

const COL_LABELS = ["50/day", "5/day", "daily", "weekly", "monthly", "yearly"];
const COL_FREQ_PER_YEAR = [50 * 365, 5 * 365, 365, 52, 12, 1];
const ROW_LABELS = ["1 sec", "5 sec", "30 sec", "1 min", "5 min", "30 min", "1 hour", "6 hours", "1 day"];
const ROW_SECONDS = [1, 5, 30, 60, 300, 1800, 3600, 21600, 86400];
const TABLE: (string | null)[][] = [
	["1 day", "2 hours", "30 minutes", "4 minutes", "1 minute", "5 seconds"],
	["5 days", "12 hours", "2 hours", "21 minutes", "5 minutes", "25 seconds"],
	["4 weeks", "3 days", "12 hours", "2 hours", "30 minutes", "2 minutes"],
	["8 weeks", "6 days", "1 day", "4 hours", "1 hour", "5 minutes"],
	["9 months", "4 weeks", "6 days", "21 hours", "5 hours", "25 minutes"],
	[null, "6 months", "5 weeks", "5 days", "1 day", "2 hours"],
	[null, "10 months", "2 months", "10 days", "2 days", "5 hours"],
	[null, null, null, "2 months", "2 weeks", "1 day"],
	[null, null, null, null, "8 weeks", "5 days"],
];

function humanTime(seconds: number): string {
	if (seconds < 60) return `${Math.round(seconds)} sec`;
	if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
	if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`.replace(/\.00 /, " ");
	if (seconds < 86400 * 7) return `${(seconds / 86400).toFixed(2)} days`.replace(/\.00 /, " ");
	if (seconds < 86400 * 30) return `${(seconds / (86400 * 7)).toFixed(2)} weeks`.replace(/\.00 /, " ");
	if (seconds < 86400 * 365) return `${(seconds / (86400 * 30)).toFixed(2)} months`.replace(/\.00 /, " ");
	return `${(seconds / (86400 * 365)).toFixed(2)} years`.replace(/\.00 /, " ");
}

function nearestIndex(arr: number[], value: number): number {
	let best = 0;
	let bestDist = Math.abs(arr[0] - value);
	for (let i = 1; i < arr.length; i++) {
		const d = Math.abs(arr[i] - value);
		if (d < bestDist) {
			bestDist = d;
			best = i;
		}
	}
	return best;
}

function parseFreq(input: string): number {
	const key = input.toLowerCase();
	if (FREQ_LABELS[key] !== undefined) return FREQ_LABELS[key];
	const n = Number(input);
	if (!isFinite(n) || n <= 0) throw new Error(`Unknown frequency: ${input}`);
	return n;
}

function parseSaved(input: string): number {
	const key = input.toLowerCase();
	if (SAVED_LABELS[key] !== undefined) return SAVED_LABELS[key];
	const n = Number(input);
	if (!isFinite(n) || n <= 0) throw new Error(`Unknown time-saved value: ${input}`);
	return n;
}

function main(): void {
	const args = process.argv.slice(2);
	let freqInput: string | undefined;
	let savedInput: string | undefined;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--freq" || a === "-f") {
			freqInput = args[++i];
		} else if (a === "--saved" || a === "-s") {
			savedInput = args[++i];
		} else if (a === "--help" || a === "-h") {
			printHelp();
			return;
		} else if (!a.startsWith("-")) {
			if (freqInput === undefined) freqInput = a;
			else if (savedInput === undefined) savedInput = a;
		}
	}

	if (freqInput === undefined || savedInput === undefined) {
		printHelp();
		process.exit(1);
	}

	const freq = parseFreq(freqInput);
	const saved = parseSaved(savedInput);
	const maxSpend = 5 * freq * saved;
	const ci = nearestIndex(COL_FREQ_PER_YEAR, freq);
	const ri = nearestIndex(ROW_SECONDS, saved);
	const cell = TABLE[ri][ci];

	console.log(`Frequency: ${freq} times/year (nearest: ${COL_LABELS[ci]})`);
	console.log(`Time saved per occurrence: ${saved}s (nearest: ${ROW_LABELS[ri]})`);
	console.log(`Max time you can spend (5 years): ${humanTime(maxSpend)}`);
	console.log(`Comic cell value: ${cell ?? "not worth it / impossible"}`);
}

function printHelp(): void {
	console.log(`is-it-worth-the-time CLI (xkcd 1205)

Usage:
  cli --freq <label|number> --saved <label|number>
  cli <frequency-label> <time-saved-label>

Frequency labels: 50/day, 5/day, daily, weekly, monthly, yearly (or a number = times/year)
Time-saved labels: 1s, 5s, 30s, 1m, 5m, 30m, 1h, 6h, 1d (or a number = seconds)

Examples:
  cli --freq weekly --saved 1m
  cli 5/day 30s
  cli --freq 10 --saved 120`);
}

main();