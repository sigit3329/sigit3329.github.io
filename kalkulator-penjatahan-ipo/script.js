// ============ UTIL FORMAT ANGKA ============

function formatNumber(value, decimals) {
  if (value === null || value === undefined || isNaN(value)) return '';
  if (decimals === undefined) decimals = 0;

  var factor = Math.pow(10, decimals);
  var rounded = Math.round(value * factor) / factor;

  var str = decimals > 0 ? rounded.toFixed(decimals) : Math.round(rounded).toString();
  var parts = str.split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals > 0 ? parts[0] + ',' + parts[1] : parts[0];
}

function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return '';
  return 'Rp' + formatNumber(value, 0);
}

// Parse string "1.234,56" -> number 1234.56
function parseLocalizedNumber(str) {
  if (!str) return NaN;
  var cleaned = str.replace(/\./g, '').replace(',', '.');
  return Number(cleaned);
}

function getNumber(id) {
  var el = document.getElementById(id);
  if (!el) return NaN;
  return parseLocalizedNumber(el.value.trim());
}

// ============ FORMAT INPUT SAAT LOAD & BLUR ============

function setupFormattedInputs() {
  var fields = document.querySelectorAll('[data-decimals]');
  fields.forEach(function (el) {
    var decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;

    // Format nilai awal kalau ada
    if (el.value) {
      var n = parseLocalizedNumber(el.value);
      if (!isNaN(n)) {
        el.value = formatNumber(n, decimals);
      }
    }

    // Saat blur -> reformat jadi pakai titik ribuan
    el.addEventListener('blur', function () {
      if (!el.value) return;
      var n = parseLocalizedNumber(el.value);
      if (isNaN(n)) return;
      el.value = formatNumber(n, decimals);
    });
  });
}

window.addEventListener('DOMContentLoaded', setupFormattedInputs);

// ============ LOGIKA HITUNG ============

function hitung() {
  var lotOffered   = getNumber('lot_offered');
  var price        = getNumber('price');
  var nTotal       = getNumber('n_total');
  var nonRatioPct  = getNumber('non_ratio');
  var nonFundRatioPct = getNumber('non_fund_ratio');
  var allocPercent = getNumber('alloc_percent');
  var allocFixed   = getNumber('alloc_fixed');

  if (isNaN(lotOffered) || isNaN(price)) {
    alert('Isi dulu: Saham Ditawarkan (LOT) dan Harga Saham per Lembar.');
    return;
  }

  var dana = lotOffered * 100 * price;

  // asumsi default kalau kosong
  var nonRatio = isNaN(nonRatioPct) ? 0.25 : nonRatioPct / 100;
  var retRatio = 1 - nonRatio;

  var nNon = (isNaN(nTotal) ? 0 : nTotal) * nonRatio;
  var nRet = (isNaN(nTotal) ? 0 : nTotal) * retRatio;

  var nonFundRatio = isNaN(nonFundRatioPct) ? (2 / 3) : nonFundRatioPct / 100;
  var retFundRatio = 1 - nonFundRatio;

  // ---------- MODE PERSEN ----------
  if (!isNaN(allocPercent) && allocPercent > 0) {
    var allocT = dana * (allocPercent / 100);
    var allocNon = allocT * nonFundRatio;
    var allocRet = allocT * retFundRatio;

    var jNonRp  = nNon > 0 ? allocNon / nNon : 0;
    var jRetRp  = nRet > 0 ? allocRet / nRet : 0;
    var jNonLot = price > 0 ? jNonRp / (price * 100) : 0;
    var jRetLot = price > 0 ? jRetRp / (price * 100) : 0;

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
    var idsP = [
      'p_dana','p_alloc','p_alloc_pct','p_alloc_non','p_alloc_ret',
      'p_n_non','p_n_ret','p_jatah_non_rp','p_jatah_ret_rp',
      'p_jatah_non_lot','p_jatah_ret_lot'
    ];
    idsP.forEach(function(id){ document.getElementById(id).textContent = ''; });
    document.getElementById('p_dana').textContent = formatRupiah(dana);
  }

  // ---------- MODE NILAI PASTI ----------
  if (!isNaN(allocFixed) && allocFixed > 0) {
    var fAllocT   = allocFixed;
    var fAllocNon = fAllocT * nonFundRatio;
    var fAllocRet = fAllocT * retFundRatio;

    var fJNonRp  = nNon > 0 ? fAllocNon / nNon : 0;
    var fJRetRp  = nRet > 0 ? fAllocRet / nRet : 0;
    var fJNonLot = price > 0 ? fJNonRp / (price * 100) : 0;
    var fJRetLot = price > 0 ? fJRetRp / (price * 100) : 0;

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
    var idsF = [
      'f_dana','f_alloc','f_alloc_non','f_alloc_ret',
      'f_n_non','f_n_ret','f_jatah_non_rp','f_jatah_ret_rp',
      'f_jatah_non_lot','f_jatah_ret_lot'
    ];
    idsF.forEach(function(id){ document.getElementById(id).textContent = ''; });
    document.getElementById('f_dana').textContent = formatRupiah(dana);
  }
}

// ============ DOWNLOAD XLSX ============

function downloadExcel() {
  if (typeof XLSX === 'undefined') {
    alert('Library XLSX belum ter-load.');
    return;
  }

  var kode = (document.getElementById('kode').value || 'TANPAKODE').toUpperCase();

  var wb = XLSX.utils.book_new();
  var ws1 = XLSX.utils.table_to_sheet(document.getElementById('table-percent'));
  XLSX.utils.book_append_sheet(wb, ws1, 'Perhitungan Persen');

  var ws2 = XLSX.utils.table_to_sheet(document.getElementById('table-fixed'));
  XLSX.utils.book_append_sheet(wb, ws2, 'Perhitungan Nilai Pasti');

  var filename = 'Estimasi_Penjatahan_E-IPO_' + kode + '.xlsx';
  XLSX.writeFile(wb, filename);
}
