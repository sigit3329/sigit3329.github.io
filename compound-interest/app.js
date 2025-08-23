// app.js — Compound Interest (IDR) PLUS — PATCHED + LIVE GROUPING
(function(){
  const html = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') html.setAttribute('data-theme', stored);
  else html.setAttribute('data-theme', 'system');

  function setTheme(mode){
    html.setAttribute('data-theme', mode);
    if (mode === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', mode);
    if (chart) chart.update();
  }
  function resolvedTheme(){
    const curr = html.getAttribute('data-theme') || 'system';
    if (curr === 'light') return 'light';
    if (curr === 'dark') return 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.getElementById('themeToggle').addEventListener('click', () => {
    const cycle = ['system','light','dark'];
    const curr = html.getAttribute('data-theme') || 'system';
    const next = cycle[(cycle.indexOf(curr)+1)%cycle.length];
    setTheme(next);
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== Currency helpers (ROBUST + LIVE GROUPING) =====
  const idr = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });
  const fmt = (v) => idr.format(v).replace('IDR','Rp').replace(/\s/g,'');
  const toNumber = (str) => Number(String(str).replace(/\D/g,'')) || 0;

  // format number string (digits only) -> '1.234.567'
  function groupThousand(digits){
    if (!digits) return '0';
    digits = String(digits).replace(/^0+(?=\d)/,'');
    if (digits === '') digits = '0';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function caretFromDigitsPosition(formatted, digitsPos){
    let pos = 0, count = 0;
    while (pos < formatted.length && count < digitsPos){
      if (/\d/.test(formatted[pos])) count++;
      pos++;
    }
    return pos;
  }

  function onCurrencyInput(e){
    const inp = e.target;
    const prev = inp.value;
    const start = inp.selectionStart || 0;
    const digitsLeft = prev.slice(0, start).replace(/\D/g,'').length;
    const rawDigits = prev.replace(/\D/g,'');
    const formatted = groupThousand(rawDigits);
    inp.value = formatted;
    inp.dataset.raw = String(toNumber(formatted));
    const newPos = caretFromDigitsPosition(formatted, digitsLeft);
    inp.setSelectionRange(newPos, newPos);
  }

  function formatCurrencyInput(inp){
    const n = toNumber(inp.value);
    const formatted = groupThousand(n);
    inp.value = formatted;
    inp.dataset.raw = String(n);
  }

  document.querySelectorAll('input[data-currency]').forEach(inp => {
    formatCurrencyInput(inp);
    inp.addEventListener('input', onCurrencyInput);
    inp.addEventListener('blur', () => formatCurrencyInput(inp));
    inp.addEventListener('focus', () => { setTimeout(()=>inp.select(),0); });
  });

  const el = (id) => document.getElementById(id);

  function monthlyRate(rateAnnualPct, compPerYear){
    const r = Math.max(0, Number(rateAnnualPct) || 0) / 100;
    const f = Math.max(1, Number(compPerYear) || 12);
    return Math.pow(1 + r / f, f / 12) - 1;
  }
  function inflMonthly(inflPct){
    const i = Math.max(0, Number(inflPct) || 0) / 100;
    return Math.pow(1 + i, 1/12) - 1;
  }

  function simulateForward({ principal, monthly, rateAnnual, compPerYear, years, timing, inflationAnnual }){
    const months = Math.max(1, Math.round(years*12));
    const im = monthlyRate(rateAnnual, compPerYear);
    const inflm = inflMonthly(inflationAnnual);
    let balance = principal, invested = principal;
    const rows = [], labels=[], series=[];
    let totalInterest = 0;

    for (let m=1; m<=months; m++){
      if (timing === 'start'){ balance += monthly; invested += monthly; }
      const interest = balance * im;
      balance += interest;
      if (timing === 'end'){ balance += monthly; invested += monthly; }
      totalInterest += interest;
      rows.push({ month:m, contrib: monthly, interest, total: balance });
      labels.push('Bulan ' + m); series.push(balance);
    }
    const future = balance;
    const futureReal = inflm>0 ? future / Math.pow(1+inflm, months) : future;
    return { months, invested, totalInterest, future, futureReal, rows, labels, series };
  }

  function solveMonthlyForTarget({ target, principal, rateAnnual, compPerYear, years, timing }){
    const n = Math.max(1, Math.round(years*12));
    const i = monthlyRate(rateAnnual, compPerYear);
    const factor = (i === 0) ? n : ((Math.pow(1+i, n) - 1) / i);
    const due = (timing === 'start') ? (1 + i) : 1;
    let needed;
    if (i === 0){ needed = (target - principal) / n; }
    else { needed = (target - principal * Math.pow(1+i, n)) / (factor * due); }
    return Math.max(0, needed);
  }

  let chart;
  function renderChart(labels, data){
    const ctx = document.getElementById('chart').getContext('2d');
    const dark = resolvedTheme() === 'dark';
    const grid = dark ? 'rgba(148,163,184,.18)' : 'rgba(2,6,23,.12)';
    const tick = dark ? '#cbd5e1' : '#475569';

    if (chart){ chart.data.labels = labels; chart.data.datasets[0].data = data; chart.update(); return; }
    chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label:'Saldo', data, fill:true, tension:0.25,
        borderColor:'#0ea5e9',
        backgroundColor:(ctx)=>{ const {chart} = ctx; const {ctx:ct, chartArea} = chart;
          if (!chartArea) return 'rgba(14,165,233,.2)';
          const g = ct.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0,'rgba(14,165,233,.35)'); g.addColorStop(1,'rgba(14,165,233,.02)'); return g; },
        pointRadius:0 }]},
      options: { responsive:true, maintainAspectRatio:false,
        scales:{ x:{ grid:{color:grid}, ticks:{color:tick,maxTicksLimit:10} },
                y:{ grid:{color:grid}, ticks:{color:tick, callback:(v)=>fmt(v)} } },
        plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false,callbacks:{label:(c)=>' '+fmt(c.parsed.y)}} } }
    });
  }

  function updateModeUI(){
    const isTarget = el('mode').value === 'target';
    el('targetWrap').classList.toggle('hidden', !isTarget);
    el('needWrap').classList.toggle('hidden', !isTarget);
    el('monthly').parentElement.classList.toggle('hidden', isTarget);
    el('labelFuture').textContent = isTarget ? 'Nilai akhir (hasil simulasi)' : 'Nilai akhir (nominal)';
    el('chartTitle').textContent = isTarget ? 'Grafik Pertumbuhan (dengan setoran yang dibutuhkan)' : 'Grafik Pertumbuhan';
  }
  el('mode').addEventListener('change', ()=>{ updateModeUI(); run(); });
  updateModeUI();

  function run(ev){
    if (ev) ev.preventDefault();
    const mode = el('mode').value;
    const compPerYear = Number(el('compound').value);
    const rate = Number(el('rate').value) || 0;
    const years = Number(el('years').value) || 0;
    const timing = el('timing').value;
    const principal = toNumber(el('principal').value);
    let monthly = toNumber(el('monthly').value);
    const infl = Number(el('inflation').value) || 0;

    if (mode === 'target'){
      const target = toNumber(el('target').value);
      const needed = solveMonthlyForTarget({ target, principal, rateAnnual:rate, compPerYear, years, timing });
      el('needMonthly').textContent = fmt(needed);
      monthly = needed;
    }

    const sim = simulateForward({ principal, monthly, rateAnnual:rate, compPerYear, years, timing, inflationAnnual:infl });
    el('invested').textContent = fmt(sim.invested);
    el('interest').textContent = fmt(sim.totalInterest);
    el('future').textContent   = fmt(sim.future);
    el('futureReal').textContent = fmt(sim.futureReal);

    renderChart(sim.labels, sim.series);

    const tbody = el('schedule').querySelector('tbody');
    const onlyYears = el('showOnlyYears').checked;
    tbody.innerHTML = sim.rows.map(row => {
      if (onlyYears && row.month % 12 !== 0) return '';
      return `<tr><td>${row.month}</td><td>${fmt(row.contrib)}</td><td>${fmt(row.interest)}</td><td>${fmt(row.total)}</td></tr>`;
    }).join('');

    document.querySelectorAll('input[data-currency]').forEach(i => i.dispatchEvent(new Event('blur')));
  }

  document.getElementById('form').addEventListener('submit', run);
  document.getElementById('reset').addEventListener('click', () => {
    ['principal','monthly','target'].forEach(id => { const i = el(id); if (!i) return; i.value = i.id==='target'?'500000000':'10000000'; });
    el('monthly').value = '1000000';
    el('rate').value = '10'; el('years').value = '10'; el('inflation').value = '3.0';
    el('timing').value = 'end'; el('compound').value = '12'; el('mode').value = 'forward';
    document.querySelectorAll('input[data-currency]').forEach(i => i.dispatchEvent(new Event('blur')));
    updateModeUI();
    run();
  });
  document.getElementById('showOnlyYears').addEventListener('change', run);
  document.getElementById('compound').addEventListener('change', run);

  
// CSV Download — aman, tidak ganggu kalkulator/grafik
document.getElementById('csv').addEventListener('click', () => {
  // pastikan data terbaru
  run();

  const rows = document.querySelectorAll('#schedule tbody tr');

  // Pakai ';' biar Excel Indonesia langsung kepisah kolom.
  // Ubah ke ',' kalau mau delimiter koma.
  const SEP = ';';

  let csv = `Bulan${SEP}Setoran${SEP}Bunga${SEP}Total\n`;

  rows.forEach(r => {
    const tds = r.querySelectorAll('td');
    if (tds.length === 4) {
      const vals = [
        tds[0].textContent.trim(),
        tds[1].textContent.trim(),
        tds[2].textContent.trim(),
        tds[3].textContent.trim()
      ];
      csv += vals.join(SEP) + '\n';
    }
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'schedule.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
});


  run();
})();