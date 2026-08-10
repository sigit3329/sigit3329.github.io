// PurityFlow demo simulator: meniru alur kerja controller ESP32 di browser
(function () {
  const STORAGE_KEY = "purityflow_state_v1";
  const DURATION_MIN = 10, DURATION_MAX = 300, DURATION_STEP = 5;
  const TARGET_MIN = 1, TARGET_MAX = 60;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === "object") return Object.assign(defaultState(), saved);
    } catch (e) {}
    return defaultState();
  }
  function defaultState() {
    return {
      gallonToday: 0,
      durationSec: 45,
      targetGallon: 20,
      tdsHistory: [],
      fillHistory: []
    };
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();
  let currentTds = 120;
  let filling = false;
  let fillRemaining = 0;
  let fillTimer = null;
  let tdsTimer = null;
  let chart = null;

  function quality(tds) {
    if (tds <= 150) return { label: "Terbaik", color: "#16a34a" };
    if (tds <= 250) return { label: "Baik", color: "#0891b2" };
    if (tds <= 300) return { label: "Cukup", color: "#d97706" };
    if (tds <= 500) return { label: "Buruk", color: "#ea580c" };
    return { label: "Warning", color: "#dc2626" };
  }

  // ===== TABS =====
  document.querySelectorAll(".demo-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".demo-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".demo-panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector('.demo-panel[data-panel="' + tab.dataset.tab + '"]').classList.add("active");
    });
  });

  // ===== RENDER =====
  const el = id => document.getElementById(id);

  function renderReadouts() {
    const q = quality(currentTds);
    el("tdsValue").innerHTML = Math.round(currentTds) + "<small>ppm</small>";
    const qb = el("qualityBadge");
    qb.textContent = q.label;
    qb.style.background = q.color + "22";
    qb.style.color = q.color;

    el("gallonToday").innerHTML = state.gallonToday + "<small>galon</small>";
    el("gallonTarget").innerHTML = state.targetGallon + "<small>galon</small>";
    const pct = Math.min(100, Math.round((state.gallonToday / state.targetGallon) * 100));
    el("gallonProgress").style.width = pct + "%";

    el("lcdLine1").textContent = "TDS: " + Math.round(currentTds) + " ppm (" + q.label + ")";
    el("lcdLine2").textContent = filling
      ? "Isi galon #" + (state.gallonToday + 1) + "  " + fmtTime(fillRemaining)
      : "Galon: " + state.gallonToday + " / " + state.targetGallon;

    const badge = el("statusBadge");
    if (filling) {
      badge.classList.add("filling");
      el("statusText").textContent = "Mengisi";
    } else {
      badge.classList.remove("filling");
      el("statusText").textContent = "Standby";
    }

    const btnStart = el("btnStart");
    if (filling) {
      btnStart.disabled = true;
      btnStart.textContent = "Sedang Mengisi...";
    } else if (state.gallonToday >= state.targetGallon) {
      btnStart.disabled = true;
      btnStart.textContent = "Target Tercapai";
    } else {
      btnStart.disabled = false;
      btnStart.textContent = "Start Pengisian";
    }

    el("wifiStatus").textContent = filling ? "Nonaktif sementara (mode mengisi)" : "Terhubung, siap OTA";
    el("relayStatus").textContent = filling ? "Aktif, katup terbuka" : "Nonaktif";
    el("sensorStatus").textContent = currentTds > 500 ? "Warning, TDS di atas batas" : "Normal";

    el("durationVal").textContent = state.durationSec + " s";
    el("targetVal").textContent = state.targetGallon;
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function renderHistory() {
    const list = el("fillHistory");
    list.innerHTML = "";
    if (state.fillHistory.length === 0) {
      const li = document.createElement("li");
      li.innerHTML = '<span>Belum ada riwayat pengisian.</span>';
      list.appendChild(li);
      return;
    }
    state.fillHistory.slice().reverse().forEach(entry => {
      const li = document.createElement("li");
      li.innerHTML = '<span>Galon #' + entry.no + ' selesai diisi</span><span class="t">' + entry.time + '</span>';
      list.appendChild(li);
    });
  }

  // ===== TDS SIMULATION =====
  function stepTds() {
    const drift = (Math.random() - 0.5) * 14;
    currentTds = Math.max(40, Math.min(560, currentTds + drift));
    state.tdsHistory.push(Math.round(currentTds));
    if (state.tdsHistory.length > 24) state.tdsHistory.shift();
    updateChart();
    renderReadouts();
  }

  function updateChart() {
    if (!chart) return;
    chart.data.labels = state.tdsHistory.map((_, i) => i + 1);
    chart.data.datasets[0].data = state.tdsHistory;
    chart.update("none");
  }

  function initChart() {
    const ctx = document.getElementById("tdsChart");
    if (!ctx || typeof Chart === "undefined") return;
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: state.tdsHistory.map((_, i) => i + 1),
        datasets: [{
          label: "TDS (ppm)",
          data: state.tdsHistory,
          borderColor: "#0284c7",
          backgroundColor: "rgba(2,132,199,.12)",
          fill: true,
          tension: .35,
          pointRadius: 0,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { suggestedMin: 0, suggestedMax: 400, grid: { color: "#e6f0f6" } },
          x: { display: false }
        }
      }
    });
  }

  // ===== START PENGISIAN =====
  el("btnStart").addEventListener("click", () => {
    if (filling || state.gallonToday >= state.targetGallon) return;
    filling = true;
    fillRemaining = state.durationSec;
    renderReadouts();
    fillTimer = setInterval(() => {
      fillRemaining--;
      if (fillRemaining <= 0) {
        clearInterval(fillTimer);
        filling = false;
        state.gallonToday++;
        state.fillHistory.push({
          no: state.gallonToday,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        });
        saveState();
        renderHistory();
      }
      renderReadouts();
    }, 1000);
  });

  // ===== HOLD TO CONFIRM (reset & save) =====
  function bindHold(buttonId, fillId, durationMs, onComplete) {
    const btn = el(buttonId), fill = el(fillId);
    let raf = null, start = null;

    function step(ts) {
      if (!start) start = ts;
      const pct = Math.min(100, ((ts - start) / durationMs) * 100);
      fill.style.width = pct + "%";
      if (pct >= 100) {
        cancel();
        onComplete();
        return;
      }
      raf = requestAnimationFrame(step);
    }
    function begin(e) {
      e.preventDefault();
      start = null;
      raf = requestAnimationFrame(step);
    }
    function cancel() {
      if (raf) cancelAnimationFrame(raf);
      raf = null; start = null;
      fill.style.width = "0%";
    }
    btn.addEventListener("pointerdown", begin);
    btn.addEventListener("pointerup", cancel);
    btn.addEventListener("pointerleave", cancel);
  }

  bindHold("btnReset", "resetFill", 2600, () => {
    if (filling) return;
    state.gallonToday = 0;
    state.fillHistory = [];
    saveState();
    renderReadouts();
    renderHistory();
  });

  bindHold("btnSaveSetting", "saveFill", 3000, () => {
    saveState();
    const btn = el("btnSaveSetting");
    const label = btn.querySelector("span:last-child");
    const old = label.textContent;
    label.textContent = "Tersimpan";
    setTimeout(() => { label.textContent = old; }, 1200);
  });

  // ===== CONTROL PANEL STEPPERS =====
  document.querySelectorAll("[data-adjust]").forEach(btn => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.adjust;
      const dir = parseInt(btn.dataset.dir, 10);
      if (field === "duration") {
        state.durationSec = Math.min(DURATION_MAX, Math.max(DURATION_MIN, state.durationSec + dir * DURATION_STEP));
      } else if (field === "target") {
        state.targetGallon = Math.min(TARGET_MAX, Math.max(TARGET_MIN, state.targetGallon + dir));
      }
      renderReadouts();
    });
  });

  // ===== INIT =====
  if (state.tdsHistory.length === 0) {
    for (let i = 0; i < 10; i++) state.tdsHistory.push(Math.round(90 + Math.random() * 80));
  }
  initChart();
  renderReadouts();
  renderHistory();
  tdsTimer = setInterval(stepTds, 2200);
})();
