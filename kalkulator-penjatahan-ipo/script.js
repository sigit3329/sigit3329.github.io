// =========== FORMAT ANGKA ===========

function formatNumber(value, decimals) {
  if (value === null || value === undefined || isNaN(value)) return '';
  if (decimals === undefined) decimals = 0;

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;

  let str = decimals > 0 ? rounded.toFixed(decimals) : Math.round(rounded).toString();
  let parts = str.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals > 0 ? parts[0] + ',' + parts[1] : parts[0];
}

function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return '';
  return 'Rp' + formatNumber(value, 0);
}

// =========== PARSER INPUT ===========

// integer: titik = ribuan
function getInt(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  let raw = el.value.trim();
  if (raw === '') return NaN;

  raw = raw.replace(/\./g, '');
  raw = raw.split(',')[0];
  const num = parseInt(raw, 10);
  return isNaN(num) ? NaN : num;
}

// float: titik/koma = desimal (jangan pakai ribuan di persen)
function getFloat(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  let raw = el.value.trim();
  if (raw === '') return NaN;

  raw = raw.replace(',', '.');
  const num = parseFloat(raw);
  return isNaN(num) ? NaN : num;
}

// auto format tampilan
function autoInt(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    const n = getInt(id);
    if (!isNaN(n)) el.value = formatNumber(n, 0);
  });
}

function autoFloat(id, decimals) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    const n = getFloat(id);
    if (!isNaN(n)) el.value = formatNumber(n, decimals);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  autoInt('lot_offered');
  autoInt('price');
  autoInt('n_total');
  autoInt('alloc_fixed');

  autoFloat('non_ratio', 2);
  autoFloat('non_fund_ratio', 4);
  autoFloat('alloc_percent', 2);
});

// =========== HITUNG ===========

function hitung() {
  const lotOffered   = getInt('lot_offered');
  const price        = getInt('price');
  const nTotal       = getInt('n_total');
  const nonRatioPct  = getFloat('non_ratio');
  const nonFundPct   = getFloat('non_fund_ratio');
  const allocPercent = getFloat('alloc_percent');
  const allocFixed   = getInt('alloc_fixed');

  if (isNaN(lotOffered) || isNaN(price)) {
    alert('Isi dulu: Saham Ditawarkan (LOT) dan Harga Saham per Lembar.');
    return;
  }

  const dana = lotOffered * 100 * price;

  const nonRatio = isNaN(nonRatioPct) ? 0.25 : nonRatioPct / 100;
  const retRatio = 1 - nonRatio;

  const nNon = (isNaN(nTotal) ? 0 : nTotal) * nonRatio;
  const nRet = (isNaN(nTotal) ? 0 : nTotal) * retRatio;

  const nonFundRatio = isNaN(nonFundPct) ? 2/3 : nonFundPct / 100;
  const retFundRatio = 1 - nonFundRatio;

  // ---- MODE PERSEN ----
  if (!isNaN(allocPercent) && allocPercent > 0) {
    const allocT   = dana * (allocPercent / 100);
    const allocNon = allocT * nonFundRatio;
    const allocRet = allocT * retFundRatio;

    const jNonRp  = nNon > 0 ? allocNon / nNon : 0;
    const jRetRp  = nRet > 0 ? allocRet / nRet : 0;
    const jNonLot = price > 0 ? jNonRp / (price * 100) : 0;
    const jRetLot = price > 0 ? jRetRp / (price * 100) : 0;

    document.getElementById('p_dana').textContent = formatRupiah(dana);
    document.getElementById('p_alloc').textContent = formatRupiah(allocT);
    document.getElementById('p_alloc_pct').textContent = formatNumber(allocPercent, 2) + ' %';
    document.getElementById('p_alloc_non').textContent = formatRupiah(allocNon);
    document.getElementById('p_alloc_ret').textContent = formatRupiah(allocRet);
    document.getElementById('p_n_non').textContent = nNon ? formatNumber(nNon, 0) : '';
    document.getElementById('p_n_ret').textContent = nRet ? formatNumber(nRet, 0) : '';
    document.getElementById('p_jatah_non_rp').textContent = jNonRp ? formatRupiah(jNonRp) : '';
    document.getElementById('p_jatah_ret_rp').textContent = jRetRp ? formatRupiah(jRetRp) : '';
    document.getElementById('p_jatah_non_lot').textContent =
      jNonLot ? formatNumber(jNonLot, 6) + ' LOT' : '';
    document.getElementById('p_jatah_ret_lot').textContent =
      jRetLot ? formatNumber(jRetLot, 6) + ' LOT' : '';
  } else {
    document.getElementById('p_dana').textContent = formatRupiah(dana);
  }

  // ---- MODE NILAI PASTI ----
  if (!isNaN(allocFixed) && allocFixed > 0) {
    const fAllocT   = allocFixed;
    const fAllocNon = fAllocT * nonFundRatio;
    const fAllocRet = fAllocT * retFundRatio;

    const fJNonRp  = nNon > 0 ? fAllocNon / nNon : 0;
    const fJRetRp  = nRet > 0 ? fAllocRet / nRet : 0;
    const fJNonLot = price > 0 ? fJNonRp / (price * 100) : 0;
    const fJRetLot = price > 0 ? fJRetRp / (price * 100) : 0;

    document.getElementById('f_dana').textContent = formatRupiah(dana);
    document.getElementById('f_alloc').textContent = formatRupiah(fAllocT);
    document.getElementById('f_alloc_non').textContent = formatRupiah(fAllocNon);
    document.getElementById('f_alloc_ret').textContent = formatRupiah(fAllocRet);
    document.getElementById('f_n_non').textContent = nNon ? formatNumber(nNon, 0) : '';
    document.getElementById('f_n_ret').textContent = nRet ? formatNumber(nRet, 0) : '';
    document.getElementById('f_jatah_non_rp').textContent = fJNonRp ? formatRupiah(fJNonRp) : '';
    document.getElementById('f_jatah_ret_rp').textContent = fJRetRp ? formatRupiah(fJRetRp) : '';
    document.getElementById('f_jatah_non_lot').textContent =
      fJNonLot ? formatNumber(fJNonLot, 6) + ' LOT' : '';
    document.getElementById('f_jatah_ret_lot').textContent =
      fJRetLot ? formatNumber(fJRetLot, 6) + ' LOT' : '';
  } else {
    document.getElementById('f_dana').textContent = formatRupiah(dana);
  }
}

// =========== EXPORT EXCEL (.XLS HTML) ===========

function downloadExcel() {
  // pastikan sudah dihitung
  hitung();

  const kode = (document.getElementById('kode').value || 'TANPAKODE').toUpperCase();

  const lotOffered = document.getElementById('lot_offered').value || '';
  const price      = document.getElementById('price').value || '';
  const nTotal     = document.getElementById('n_total').value || '';
  const nonRatio   = document.getElementById('non_ratio').value || '';
  const nonFund    = document.getElementById('non_fund_ratio').value || '';
  const allocPct   = document.getElementById('alloc_percent').value || '';
  const allocFix   = document.getElementById('alloc_fixed').value || '';

  const tPercent = document.getElementById('table-percent').outerHTML;
  const tFixed   = document.getElementById('table-fixed').outerHTML;

  // layout mirip screenshot: header + data prospektus + 2 tabel
  const html =
    '<html><head><meta charset="UTF-8"></head><body>' +
    '<table border="1" cellspacing="0" cellpadding="4">' +
      '<tr style="font-weight:bold;background:#ffd966">' +
        '<td>KODE SAHAM</td><td colspan="3" style="text-align:center;">' + kode + '</td>' +
      '</tr>' +
      '<tr><td></td><td></td><td></td><td></td></tr>' +
      '<tr><td>SAHAM DITAWARKAN</td><td>' + lotOffered + '</td><td colspan="2">LOT</td></tr>' +
      '<tr><td>HARGA SAHAM</td><td>' + price + '</td><td colspan="2"></td></tr>' +
      '</table>' +
      '<br/>' +
      '<h3>TABEL PERHITUNGAN PERSEN</h3>' +
      tPercent +
      '<br/><br/>' +
      '<h3>TABEL PERHITUNGAN NILAI PASTI</h3>' +
      tFixed +
    '</body></html>';

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Estimasi_Penjatahan_E-IPO_' + kode + '.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
