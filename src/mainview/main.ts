import "./style.css";

const app = document.getElementById("app")!;

// xkcd 1205: "Is It Worth the Time?"
// Columns = how often you do the task. Rows = how much time you shave off per occurrence.
// Cell = how long you can spend automating it (across 5 years).
const COL_LABELS = ["50/day", "5/day", "daily", "weekly", "monthly", "yearly"];
const COL_FREQ_PER_YEAR = [50 * 365, 5 * 365, 365, 52, 12, 1];

const ROW_LABELS = ["1 sec", "5 sec", "30 sec", "1 min", "5 min", "30 min", "1 hour", "6 hours", "1 day"];
const ROW_SECONDS = [1, 5, 30, 60, 300, 1800, 3600, 21600, 86400];

// null = greyed out (not worth it / impossible)
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

let colIndex = 3; // weekly
let rowIndex = 3; // 1 min

function humanTime(seconds: number): string {
	if (seconds < 60) return `${Math.round(seconds)} sec`;
	if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
	if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`.replace(".0 ", " ");
	if (seconds < 86400 * 7) return `${(seconds / 86400).toFixed(1)} days`.replace(".0 ", " ");
	if (seconds < 86400 * 30) return `${(seconds / (86400 * 7)).toFixed(1)} weeks`.replace(".0 ", " ");
	if (seconds < 86400 * 365) return `${(seconds / (86400 * 30)).toFixed(1)} months`.replace(".0 ", " ");
	return `${(seconds / (86400 * 365)).toFixed(1)} years`.replace(".0 ", " ");
}

function nearestIndex(arr: number[], value: number): number {
	let best = 0;
	let bestDist = Math.abs(arr[0] - value);
	for (let i = 1; i < arr.length; i++) {
		const d = Math.abs(arr[i] - value);
		if (d < bestDist) { bestDist = d; best = i; }
	}
	return best;
}

function render() {
	const cellValue = TABLE[rowIndex][colIndex];
	const freqPerYear = COL_FREQ_PER_YEAR[colIndex];
	const savedSec = ROW_SECONDS[rowIndex];
	// computed max spend = 5 years * freqPerYear * savedSec (in seconds)
	const maxSpendSec = 5 * freqPerYear * savedSec;
	const computed = humanTime(maxSpendSec);

	let gridHtml = `<div class="chart-grid">`;
	// header row
	gridHtml += `<div class="corner"></div>`;
	for (let c = 0; c < COL_LABELS.length; c++) {
		gridHtml += `<div class="col-header ${c === colIndex ? "active" : ""}">${COL_LABELS[c]}</div>`;
	}
	for (let r = 0; r < ROW_LABELS.length; r++) {
		gridHtml += `<div class="row-header ${r === rowIndex ? "active" : ""}">${ROW_LABELS[r]}</div>`;
		for (let c = 0; c < COL_LABELS.length; c++) {
			const val = TABLE[r][c];
			const isSel = r === rowIndex && c === colIndex;
			const isGrey = val === null;
			gridHtml += `<div class="cell ${isSel ? "selected" : ""} ${isGrey ? "grey" : ""}">${val ?? "—"}</div>`;
		}
	}
	gridHtml += `</div>`;

	app.innerHTML = `
		<main>
			<div class="container">
				<h1>Is it worth the time?</h1>
				<p class="subtitle">xkcd #1205 — how long can you spend making a routine task more efficient (across 5 years)</p>

				<div class="card inputs">
					<div class="field">
						<label for="freq">How often you do the task</label>
						<select id="freq">
							${COL_LABELS.map((l, i) => `<option value="${i}" ${i === colIndex ? "selected" : ""}>${l}</option>`).join("")}
						</select>
					</div>
					<div class="field">
						<label for="saved">How much time you shave off</label>
						<select id="saved">
							${ROW_LABELS.map((l, i) => `<option value="${i}" ${i === rowIndex ? "selected" : ""}>${l}</option>`).join("")}
						</select>
					</div>
					<div class="result">
						<span class="result-label">You can spend up to</span>
						<span class="result-value">${cellValue ?? "not worth it"}</span>
						<span class="result-sub">(≈ ${computed} computed)</span>
					</div>
				</div>

				<div class="card chart-card">
					<h2>Chart (selected cell highlighted)</h2>
					${gridHtml}
					<p class="legend">Grey cells = not worth it / impossible to save that much. Row = time saved per occurrence. Column = how often you do the task.</p>
				</div>

				<div class="card custom">
					<h2>Custom calculation</h2>
					<p class="hint">Enter your own numbers; the nearest cell is highlighted and the exact value shown.</p>
					<div class="custom-row">
						<div class="field">
							<label for="customFreq">Times per year</label>
							<input id="customFreq" type="number" min="1" value="52" />
						</div>
						<div class="field">
							<label for="customSaved">Seconds saved per occurrence</label>
							<input id="customSaved" type="number" min="1" value="60" />
						</div>
						<button id="applyBtn" class="primary">Apply</button>
					</div>
					<div class="custom-result" id="customResult"></div>
				</div>
			</div>
		</main>
	`;

	document.getElementById("freq")!.addEventListener("change", (e) => {
		colIndex = parseInt((e.target as HTMLSelectElement).value, 10);
		render();
	});
	document.getElementById("saved")!.addEventListener("change", (e) => {
		rowIndex = parseInt((e.target as HTMLSelectElement).value, 10);
		render();
	});
	document.getElementById("applyBtn")!.addEventListener("click", () => {
		const f = parseFloat((document.getElementById("customFreq") as HTMLInputElement).value);
		const s = parseFloat((document.getElementById("customSaved") as HTMLInputElement).value);
		if (!isFinite(f) || f <= 0 || !isFinite(s) || s <= 0) {
			(document.getElementById("customResult") as HTMLElement).textContent = "Enter valid positive numbers.";
			return;
		}
		const maxSpend = 5 * f * s;
		const ci = nearestIndex(COL_FREQ_PER_YEAR, f);
		const ri = nearestIndex(ROW_SECONDS, s);
		colIndex = ci;
		rowIndex = ri;
		render();
		const cr = document.getElementById("customResult") as HTMLElement;
		cr.innerHTML = `Exact max spend: <strong>${humanTime(maxSpend)}</strong> (nearest cell: ${ROW_LABELS[ri]} × ${COL_LABELS[ci]}).`;
	});
}

render();