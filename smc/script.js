/* ======================================================
   GLOBAL STATE (SINGLE SOURCE OF TRUTH)
====================================================== */
let trades = [];        // "W" / "L"
let tradeTags = [];     // SMC Tag per trade
let equityCurve = [];  // Equity after each trade

let summaryData = {};  // Semua hasil kalkulasi disimpan di sini

let dailyStartEquity = null;
let isLocked = false;
let chart = null;

/* ======================================================
   CALCULATE SUMMARY & PROJECTION
====================================================== */
function calculate() {
  const equity = +document.getElementById("equity").value;
  const riskPct = +document.getElementById("risk").value;
  const risk = riskPct / 100;
  const rr = +document.getElementById("rr").value;
  const wr = +document.getElementById("wr").value / 100;
  const tradesMonth = +document.getElementById("trades").value;
  const split = +document.getElementById("split").value / 100;
  const accounts = +document.getElementById("accounts").value;

  if (dailyStartEquity === null) {
    dailyStartEquity = equity;
  }

  // --- Core Math ---
  const expectancy = (wr * rr) - ((1 - wr) * 1);
  const monthlyReturn = expectancy * tradesMonth * risk;
  const monthlyProfit = equity * monthlyReturn;
  const yearlyProfit = monthlyProfit * 12 * split;
  const totalEquity = equity * accounts;

  // --- SAVE SUMMARY (IMPORTANT) ---
  summaryData = {
    expectancy: expectancy.toFixed(2),
    monthlyReturnPct: (monthlyReturn * 100).toFixed(2),
    monthlyProfit: monthlyProfit.toFixed(2),
    yearlyProfit: yearlyProfit.toFixed(2),
    totalEquity: totalEquity.toFixed(2),
    riskStatus: document.getElementById("riskStatus").innerText
  };

  // --- UPDATE UI ---
  document.getElementById("expectancy").innerText = summaryData.expectancy;
  document.getElementById("monthlyReturn").innerText =
    summaryData.monthlyReturnPct + "%";
  document.getElementById("monthlyProfit").innerText =
    "$" + summaryData.monthlyProfit;
  document.getElementById("yearlyProfit").innerText =
    "$" + summaryData.yearlyProfit;
  document.getElementById("totalEquity").innerText =
    "$" + summaryData.totalEquity;
}

/* ======================================================
   ADD TRADE (WIN / LOSS)
====================================================== */
function addTrade(result) {
  if (isLocked) {
    alert("DAILY LOSS LIMIT HIT – TRADING LOCKED");
    return;
  }

  const risk = +document.getElementById("risk").value / 100;
  const rr = +document.getElementById("rr").value;
  const tag = document.getElementById("smcTag").value;

  let equity =
    equityCurve.length === 0
      ? +document.getElementById("equity").value
      : equityCurve[equityCurve.length - 1];

  const R = result === "W" ? rr : -1;
  const pnl = equity * risk * R;
  equity += pnl;

  trades.push(result);
  tradeTags.push(tag);
  equityCurve.push(equity);

  checkRisk(equity);
  renderLog();
  updateChart();
}

/* ======================================================
   RISK GUARD (DAILY LOSS & WARNING)
====================================================== */
function checkRisk(currentEquity) {
  const lossLimitPct = +document.getElementById("dailyLoss").value / 100;
  const warningPct = +document.getElementById("dailyWarning").value / 100;

  const drawdown =
    (dailyStartEquity - currentEquity) / dailyStartEquity;

  const status = document.getElementById("riskStatus");

  if (drawdown >= lossLimitPct) {
    status.innerText = "DAILY LOSS LIMIT HIT";
    status.className = "danger";
    isLocked = true;
  } else if (drawdown >= warningPct) {
    status.innerText = "WARNING – APPROACHING DAILY LIMIT";
    status.className = "warning";
  } else {
    status.innerText = "SAFE";
    status.className = "safe";
  }
}

/* ======================================================
   RENDER TEXT LOG
====================================================== */
function renderLog() {
  let log = "";
  equityCurve.forEach((e, i) => {
    log += `#${i + 1} | ${trades[i]} | ${tradeTags[i]} | Equity: $${e.toFixed(
      2
    )}\n`;
  });
  document.getElementById("equityLog").innerText = log;
}

/* ======================================================
   UPDATE EQUITY CURVE CHART
====================================================== */
function updateChart() {
  const ctx = document.getElementById("equityChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: equityCurve.map((_, i) => i + 1),
      datasets: [
        {
          label: "Equity Curve",
          data: equityCurve,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.1)",
          tension: 0.3,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* ======================================================
   RESET DAILY SESSION
====================================================== */
function resetTrades() {
  trades = [];
  tradeTags = [];
  equityCurve = [];
  isLocked = false;

  dailyStartEquity = +document.getElementById("equity").value;

  document.getElementById("equityLog").innerText = "";
  document.getElementById("riskStatus").innerText = "SAFE";
  document.getElementById("riskStatus").className = "safe";

  if (chart) chart.destroy();
}

/* ======================================================
   EXPORT FULL REPORT TO EXCEL
====================================================== */
function exportExcel() {
  const wb = XLSX.utils.book_new();

  /* -------- INPUTS -------- */
  const inputs = [
    ["Variable", "Value"],
    ["Starting Equity", document.getElementById("equity").value],
    ["Risk % / Trade", document.getElementById("risk").value],
    ["Risk Reward (RR)", document.getElementById("rr").value],
    ["Win Rate %", document.getElementById("wr").value],
    ["Trades / Month", document.getElementById("trades").value],
    ["Profit Split %", document.getElementById("split").value],
    ["Accounts", document.getElementById("accounts").value],
    ["Daily Loss Limit %", document.getElementById("dailyLoss").value],
    ["Daily Warning %", document.getElementById("dailyWarning").value]
  ];

  /* -------- SUMMARY -------- */
  const summary = [
    ["Metric", "Result"],
    ["Expectancy (R)", summaryData.expectancy],
    ["Monthly Return (%)", summaryData.monthlyReturnPct],
    ["Monthly Profit ($)", summaryData.monthlyProfit],
    ["Yearly Profit ($)", summaryData.yearlyProfit],
    ["Total Equity ($)", summaryData.totalEquity],
    ["Risk Status", summaryData.riskStatus]
  ];

  /* -------- TRADE JOURNAL -------- */
  const journal = [
    ["Trade #", "Result", "SMC Tag", "Equity After Trade ($)"]
  ];

  equityCurve.forEach((eq, i) => {
    journal.push([
      i + 1,
      trades[i],
      tradeTags[i],
      eq.toFixed(2)
    ]);
  });

  /* -------- APPEND SHEETS -------- */
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(inputs),
    "Inputs"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summary),
    "Summary"
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(journal),
    "Trade Journal"
  );

  XLSX.writeFile(wb, "SMC_Trading_FULL_Report.xlsx");
}
