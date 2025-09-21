// app.js — Perencana Dana Pendidikan (Rupiah)
(function(){
  const html = document.documentElement;
  html.setAttribute('data-theme','dark'); // default dark
  document.getElementById('year').textContent = new Date().getFullYear();

  document.getElementById('themeToggle').addEventListener('click', () => {
    html.setAttribute('data-theme', html.getAttribute('data-theme')==='light' ? 'dark' : 'light');
  });

  const rupiah = new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 });
  const fmt = (n)=> rupiah.format(Math.round(n||0));
  const parseRupiah = (s)=> Number(String(s||'0').replace(/[^\d]/g,''))||0;

  // format live: 1.000.000
  function attachCurrencyInput(input){
    function formatLive(){
      const raw = input.value || '';
      const caret = input.selectionStart || raw.length;
      const before = raw.slice(0, caret);
      const digitsBefore = (before.match(/\d/g)||[]).length;
      const clean = raw.replace(/[^\d]/g,'');
      const withDots = clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      input.value = withDots || '0';
      // set caret
      let pos=0, seen=0;
      for(let i=0;i<input.value.length;i++){
        if(/\d/.test(input.value[i])) seen++;
        if(seen>=digitsBefore){ pos=i+1; break; }
      }
      input.setSelectionRange(pos,pos);
    }
    input.addEventListener('input', formatLive);
    input.addEventListener('blur', ()=>{ if(!input.value) input.value='0'; });
  }
  document.querySelectorAll('input[data-currency]').forEach(attachCurrencyInput);

  function readStages(){
    const rows = Array.from(document.querySelectorAll('#stageTable tbody tr'));
    const conf = { TK:{years:2}, SD:{years:6}, SMP:{years:3}, SMA:{years:3}, S1:{years:4}, S2:{years:2} };
    return rows.map(tr => {
      const key = tr.getAttribute('data-key');
      const startAge = Number((tr.querySelector('[data-field=\"startAge\"]').textContent||'0').replace(',','.'));
      const costNow = parseRupiah(tr.querySelector('input[data-field=\"costNow\"]').value);
      const years = conf[key].years;
      return {key, startAge, costNow, years};
    });
  }

  function calc(){
    const ageNow = Number(document.getElementById('ageNow').value)||0;
    const inflation = (Number(document.getElementById('inflation').value)||0)/100;
    const ret = (Number(document.getElementById('returnRate').value)||0)/100;

    const stages = readStages();
    const today = new Date();
    const thisYear = today.getFullYear();

    const sched = [];
    let idx = 1;
    let maxT = 0;
    let sumNominal = 0;
    let sumPV = 0;

    for (const st of stages){
      const startIn = Math.max(0, st.startAge - ageNow);
      for (let y=0; y<st.years; y++){
        const t = startIn + y;
        const calYear = thisYear + Math.round(t);
        const cost = st.costNow * Math.pow(1+inflation, t);
        const pv = cost / Math.pow(1+ret, t);
        sched.push({i: idx++, stage: st.key, t, year: calYear, cost, pv});
        sumNominal += cost;
        sumPV += pv;
        if (t > maxT) maxT = t;
      }
    }

    const months = Math.max(1, Math.round(maxT*12));
    const r = ret/12;
    let perMonth = 0;
    if (r === 0){
      perMonth = sumPV / months;
    } else {
      perMonth = sumPV * r / (1 - Math.pow(1+r, -months));
    }

    document.getElementById('sumNominal').textContent = fmt(sumNominal);
    document.getElementById('sumPV').textContent = fmt(sumPV);
    document.getElementById('perMonth').textContent = fmt(perMonth);
    document.getElementById('lastYear').textContent = (thisYear + Math.round(maxT)).toString();

    const tbody = document.querySelector('#schedule tbody');
    tbody.innerHTML='';
    for (const rrow of sched){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${rrow.i}</td><td>${rrow.stage}</td><td>${rrow.t.toFixed(1)}</td><td>${rrow.year}</td><td>${fmt(rrow.cost)}</td><td>${fmt(rrow.pv)}</td>`;
      tbody.appendChild(tr);
    }

    window._eduSched = sched;
  }

  document.getElementById('calc').addEventListener('click', calc);
  calc();

  document.getElementById('csv').addEventListener('click', () => {
    if (!window._eduSched) calc();
    const SEP = ';';
    let csv = `sep=${SEP}\nNo${SEP}Jenjang${SEP}TahunKe${SEP}TahunKalender${SEP}BiayaProyeksi${SEP}PV\n`;
    window._eduSched.forEach(r => {
      csv += [r.i, r.stage, r.t.toFixed(1), r.year, Math.round(r.cost), Math.round(r.pv)].join(SEP) + '\\n';
    });
    const blob = new Blob(['\\ufeff'+csv], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jadwal_dana_pendidikan.csv';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),0);
  });

  document.querySelectorAll('#stageTable [data-field=\"startAge\"]').forEach(td => {
    td.addEventListener('blur', calc);
    td.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); td.blur(); }});
  });
  document.querySelectorAll('#stageTable input[data-field=\"costNow\"]').forEach(inp => {
    inp.addEventListener('blur', calc);
  });

})();