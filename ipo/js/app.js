/* =====================================================================
   IPO TRACKER DASHBOARD
   ---------------------------------------------------------------------
   Aplikasi dashboard untuk memantau modal, jumlah akun, profit, gain,
   dan equity dari berbagai emiten IPO. Data disimpan di LocalStorage.

   Dibangun dengan: Vanilla JavaScript + Tailwind CSS + Chart.js + jsPDF.
   ===================================================================== */

(function () {
    'use strict';

    /* =====================================================================
       1. KONSTANTA & STATE APLIKASI
       ===================================================================== */

    const STORAGE_KEY    = 'ipo_tracker_data_v1';      // Kunci data emiten
    const THEME_KEY      = 'ipo_tracker_theme_v1';      // Kunci tema (light/dark)
    const SORT_DEFAULT   = { field: null, dir: null };  // Status sorting default

    // State utama aplikasi
    const state = {
        emitens: [],           // Daftar emiten tersimpan
        sort: { ...SORT_DEFAULT },
        search: '',            // Keyword pencarian
        filter: 'all',         // Filter aktif
        charts: {              // Instance Chart.js (untuk di-destroy/update)
            profit: null,
            modal: null,
            equity: null
        }
    };

    /* =====================================================================
       2. UTILITAS FORMAT RUPIAH & ANGKA
       ===================================================================== */

    /**
     * Format angka menjadi string Rupiah Indonesia.
     * Contoh: 1000000 -> "Rp 1.000.000"
     */
    function formatRupiah(angka, denganSimbol = true) {
        const num = Number(angka) || 0;
        const formatted = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
        return denganSimbol ? `Rp ${formatted}` : formatted;
    }

    /**
     * Format angka dengan 2 desimal untuk gain (%).
     */
    function formatPersen(angka) {
        const num = Number(angka) || 0;
        return `${num.toFixed(2)}%`;
    }

    /**
     * Parse string angka dari input form (mendukung format Indonesia).
     */
    function parseNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        // Menghapus semua karakter selain angka, minus, dan titik/koma desimal
        const cleaned = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
        const n = parseFloat(cleaned);
        return isNaN(n) ? 0 : n;
    }

    /**
     * Menghasilkan ID unik sederhana berbasis timestamp + random.
     */
    function generateId() {
        return `emiten_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    /* =====================================================================
       3. KALKULASI PER EMITEN
       ===================================================================== */

    /**
     * Menghitung nilai turunan untuk satu emiten berdasarkan field input.
     * Input: emiten (modalPerAkun, jumlahAkun, profitPerAkun)
     * Output: modalTotal, totalProfit, gain, equity
     */
    function hitungTurunan(emiten) {
        const modalPerAkun   = Number(emiten.modalPerAkun)   || 0;
        const jumlahAkun     = Number(emiten.jumlahAkun)     || 0;
        const profitPerAkun  = Number(emiten.profitPerAkun)  || 0;

        const modalTotal  = modalPerAkun * jumlahAkun;
        const totalProfit = profitPerAkun * jumlahAkun;
        const gain        = modalPerAkun > 0 ? (profitPerAkun / modalPerAkun) * 100 : 0;
        const equity      = modalTotal + totalProfit;

        return { modalTotal, totalProfit, gain, equity };
    }

    /**
     * Mengambil emiten dengan nilai turunan yang sudah dihitung.
     */
    function withDerived(emiten) {
        return { ...emiten, ...hitungTurunan(emiten) };
    }

    /* =====================================================================
       4. PENYIMPANAN (LOCAL STORAGE)
       ===================================================================== */

    /**
     * Memuat data emiten dari LocalStorage.
     */
    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Gagal membaca LocalStorage:', err);
            return [];
        }
    }

    /**
     * Menyimpan data emiten ke LocalStorage.
     */
    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.emitens));
        } catch (err) {
            console.error('Gagal menyimpan ke LocalStorage:', err);
            showToast('Gagal menyimpan data', 'error');
        }
    }

    /* =====================================================================
       4b. DARK MODE / THEME
       ===================================================================== */

    /**
     * Cek apakah mode gelap sedang aktif.
     * (Class .dark dipasang di <html> oleh script inisialisasi di <head>.)
     */
    function isDarkMode() {
        return document.documentElement.classList.contains('dark');
    }

    /**
     * Menerapkan tema (light/dark), menyimpan preferensi ke LocalStorage,
     * dan me-refresh chart agar warna sesuai.
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Update ikon & label tombol
        const iconSun  = document.getElementById('iconSun');
        const iconMoon = document.getElementById('iconMoon');
        const label    = document.getElementById('themeLabel');
        if (iconSun && iconMoon && label) {
            const dark = theme === 'dark';
            iconSun.classList.toggle('hidden', !dark);
            iconMoon.classList.toggle('hidden', dark);
            label.textContent = dark ? 'Light' : 'Dark';
        }
        // Simpan preferensi
        try { localStorage.setItem(THEME_KEY, theme); } catch (err) { /* abaikan */ }
        // Render ulang chart agar warna axis/legend sesuai tema
        if (typeof renderCharts === 'function') renderCharts();
    }

    /**
     * Toggle antara light dan dark, dipanggil saat tombol di-klik.
     */
    function toggleTheme() {
        applyTheme(isDarkMode() ? 'light' : 'dark');
    }

    /* =====================================================================
       5. RENDER: SUMMARY CARDS
       ===================================================================== */

    /**
     * Merender kartu ringkasan (Total Emiten, Total Akun, dll).
     */
    function renderSummary() {
        const data = state.emitens.map(withDerived);

        // Kalkulasi ringkasan
        const totalEmiten   = data.length;
        const totalAkun     = data.reduce((s, e) => s + (Number(e.jumlahAkun) || 0), 0);
        const totalModal    = data.reduce((s, e) => s + e.modalTotal, 0);
        const totalProfit   = data.reduce((s, e) => s + e.totalProfit, 0);
        const totalEquity   = data.reduce((s, e) => s + e.equity, 0);
        const averageGain   = totalEmiten > 0
            ? data.reduce((s, e) => s + e.gain, 0) / totalEmiten
            : 0;

        const cards = [
            { label: 'Total Emiten',   value: totalEmiten.toString(),           accent: '#3b82f6' },
            { label: 'Total Akun',     value: totalAkun.toLocaleString('id-ID'), accent: '#8b5cf6' },
            { label: 'Total Modal',    value: formatRupiah(totalModal),         accent: '#0ea5e9' },
            { label: 'Total Profit',   value: formatRupiah(totalProfit),        accent: totalProfit >= 0 ? '#10b981' : '#ef4444' },
            { label: 'Total Equity',   value: formatRupiah(totalEquity),        accent: '#a855f7' },
            { label: 'Avg Gain',       value: formatPersen(averageGain),        accent: averageGain >= 0 ? '#10b981' : '#ef4444' }
        ];

        const container = document.getElementById('summaryCards');
        container.innerHTML = cards.map(c => `
            <div class="summary-card" style="--accent: ${c.accent};">
                <div class="summary-label">${c.label}</div>
                <div class="summary-value">${c.value}</div>
            </div>
        `).join('');
    }

    /* =====================================================================
       6. RENDER: TABEL UTAMA
       ===================================================================== */

    /**
     * Mengambil data yang sudah difilter, dicari, dan diurut.
     */
    function getProcessedData() {
        let data = state.emitens.map(withDerived);

        // 1. Filter
        if (state.filter === 'profit-positive') {
            data = data.filter(e => e.totalProfit > 0);
        } else if (state.filter === 'profit-negative') {
            data = data.filter(e => e.totalProfit < 0);
        } else if (state.filter === 'gain-25') {
            data = data.filter(e => e.gain > 25);
        } else if (state.filter === 'gain-50') {
            data = data.filter(e => e.gain > 50);
        } else if (state.filter === 'gain-100') {
            data = data.filter(e => e.gain > 100);
        }

        // 2. Search realtime (case-insensitive substring match)
        if (state.search.trim()) {
            const q = state.search.trim().toLowerCase();
            data = data.filter(e => e.emiten.toLowerCase().includes(q));
        }

        // 3. Sorting
        if (state.sort.field && state.sort.dir) {
            const dir = state.sort.dir === 'asc' ? 1 : -1;
            data.sort((a, b) => {
                const va = a[state.sort.field];
                const vb = b[state.sort.field];
                if (typeof va === 'string') return va.localeCompare(vb) * dir;
                return ((Number(va) || 0) - (Number(vb) || 0)) * dir;
            });
        }

        return data;
    }

    /**
     * Render tabel emiten.
     */
    function renderTable() {
        const data = getProcessedData();
        const tbody = document.getElementById('emitenTableBody');
        const emptyState = document.getElementById('emptyState');
        const dataCount = document.getElementById('dataCount');

        // Tampilkan empty state bila tidak ada data
        if (state.emitens.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            dataCount.textContent = 'Menampilkan 0 emiten';
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="10" class="text-center py-8 text-slate-400">
                    Tidak ada emiten yang cocok dengan pencarian/filter.
                </td></tr>`;
            dataCount.textContent = `Menampilkan 0 dari ${state.emitens.length} emiten`;
            return;
        }

        tbody.innerHTML = data.map(e => {
            const gainClass = e.gain >= 0 ? 'badge-green' : 'badge-red';
            // Warna profit/rugi adaptif: lebih cerah di dark mode
            const profitClass = e.totalProfit >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400';
            const profitPerAkunClass = e.profitPerAkun >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400';

            return `
                <tr>
                    <td class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(e.emiten)}</td>
                    <td class="text-right">${formatRupiah(e.modalPerAkun)}</td>
                    <td class="text-center">${e.jumlahAkun}</td>
                    <td class="text-right font-medium text-slate-700 dark:text-slate-300">${formatRupiah(e.modalTotal)}</td>
                    <td class="text-right ${profitPerAkunClass}">
                        ${e.profitPerAkun >= 0 ? '+' : ''}${formatRupiah(e.profitPerAkun)}
                    </td>
                    <td class="text-right font-medium ${profitClass}">
                        ${e.totalProfit >= 0 ? '+' : ''}${formatRupiah(e.totalProfit)}
                    </td>
                    <td class="text-center">
                        <span class="badge ${gainClass}">${e.gain >= 0 ? '+' : ''}${formatPersen(e.gain)}</span>
                    </td>
                    <td class="text-center">${e.hari} hari</td>
                    <td class="text-right font-semibold text-purple-700 dark:text-purple-400">${formatRupiah(e.equity)}</td>
                    <td class="text-center">
                        <div class="inline-flex gap-1">
                            <button class="btn-icon btn-icon-edit" title="Edit"
                                onclick="window.IPOTracker.editEmiten('${e.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button class="btn-icon btn-icon-delete" title="Hapus"
                                onclick="window.IPOTracker.deleteEmiten('${e.id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        dataCount.textContent = `Menampilkan ${data.length} dari ${state.emitens.length} emiten`;
    }

    /**
     * Helper escape HTML untuk mencegah XSS.
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = String(str ?? '');
        return div.innerHTML;
    }

    /* =====================================================================
       7. RENDER: SORTING HEADER
       ===================================================================== */

    /**
     * Update visual icon sorting pada header tabel.
     */
    function updateSortIcons() {
        document.querySelectorAll('.th-sortable').forEach(th => {
            const icon = th.querySelector('.sort-icon');
            const field = th.dataset.sort;
            icon.classList.remove('active-asc', 'active-desc');
            if (state.sort.field === field) {
                icon.classList.add(state.sort.dir === 'asc' ? 'active-asc' : 'active-desc');
            }
        });
    }

    /**
     * Setup event handler untuk sortable header.
     */
    function setupSorting() {
        document.querySelectorAll('.th-sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (state.sort.field !== field) {
                    state.sort = { field, dir: 'asc' };
                } else if (state.sort.dir === 'asc') {
                    state.sort.dir = 'desc';
                } else {
                    state.sort = { ...SORT_DEFAULT };
                }
                updateSortIcons();
                renderTable();
            });
        });
    }

    /* =====================================================================
       8. RENDER: CHART (Chart.js)
       ===================================================================== */

    /**
     * Warna palet untuk chart.
     */
    function getPalette(n) {
        const base = [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
            '#06b6d4', '#a855f7', '#eab308', '#22c55e', '#0ea5e9'
        ];
        return base.slice(0, n);
    }

    /**
     * Merender/refresh ketiga chart (Top Profit, Modal, Equity).
     */
    function renderCharts() {
        if (typeof Chart === 'undefined') return; // Library belum siap

        const data = state.emitens.map(withDerived);

        // Palet warna chart adaptif terhadap tema
        const dark = isDarkMode();
        const textColor    = dark ? '#cbd5e1' : '#475569';
        const gridColor    = dark ? '#334155' : '#e2e8f0';
        const sliceBorder  = dark ? '#1e293b' : '#ffffff';
        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;

        // 1. Chart Top 10 Profit Emiten (horizontal bar)
        const top10 = [...data]
            .sort((a, b) => b.totalProfit - a.totalProfit)
            .slice(0, 10);

        const profitCtx = document.getElementById('chartTopProfit');
        const profitLabels = top10.map(d => d.emiten);
        const profitValues = top10.map(d => d.totalProfit);
        const profitColors = profitValues.map(v => v >= 0 ? '#10b981' : '#ef4444');

        if (state.charts.profit) state.charts.profit.destroy();
        state.charts.profit = new Chart(profitCtx, {
            type: 'bar',
            data: {
                labels: profitLabels,
                datasets: [{
                    label: 'Total Profit (Rp)',
                    data: profitValues,
                    backgroundColor: profitColors,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => formatRupiah(ctx.parsed.x)
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            callback: v => formatRupiah(v, false)
                        },
                        grid: { color: gridColor }
                    },
                    y: {
                        ticks: { color: textColor },
                        grid: { color: gridColor, display: false }
                    }
                }
            }
        });

        // 2. Chart Distribusi Modal per Emiten (doughnut)
        const modalCtx = document.getElementById('chartModal');
        const modalLabels = data.map(d => d.emiten);
        const modalValues = data.map(d => d.modalTotal);

        if (state.charts.modal) state.charts.modal.destroy();
        state.charts.modal = new Chart(modalCtx, {
            type: 'doughnut',
            data: {
                labels: modalLabels,
                datasets: [{
                    data: modalValues,
                    backgroundColor: getPalette(modalLabels.length),
                    borderWidth: 2,
                    borderColor: sliceBorder
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${formatRupiah(ctx.parsed)}`
                        }
                    }
                }
            }
        });

        // 3. Chart Distribusi Equity per Emiten (pie)
        const equityCtx = document.getElementById('chartEquity');
        const equityLabels = data.map(d => d.emiten);
        const equityValues = data.map(d => d.equity);

        if (state.charts.equity) state.charts.equity.destroy();
        state.charts.equity = new Chart(equityCtx, {
            type: 'pie',
            data: {
                labels: equityLabels,
                datasets: [{
                    data: equityValues,
                    backgroundColor: getPalette(equityLabels.length),
                    borderWidth: 2,
                    borderColor: sliceBorder
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${formatRupiah(ctx.parsed)}`
                        }
                    }
                }
            }
        });
    }

    /* =====================================================================
       9. RENDER UTAMA: refresh semua bagian
       ===================================================================== */

    function renderAll() {
        renderSummary();
        renderTable();
        updateSortIcons();
        renderCharts();
    }

    /* =====================================================================
       10. CRUD: TAMBAH & EDIT
       ===================================================================== */

    /**
     * Buka modal form. Mode 'add' atau 'edit'.
     */
    function openForm(mode, id = null) {
        const modal = document.getElementById('modalForm');
        const title = document.getElementById('modalTitle');
        const error = document.getElementById('formError');

        // Reset form
        document.getElementById('emitenForm').reset();
        document.getElementById('formId').value = '';
        error.classList.add('hidden');
        error.textContent = '';

        if (mode === 'edit' && id) {
            const emiten = state.emitens.find(e => e.id === id);
            if (!emiten) return;
            title.textContent = `Edit Emiten: ${emiten.emiten}`;
            document.getElementById('formId').value         = emiten.id;
            document.getElementById('formEmiten').value     = emiten.emiten;
            document.getElementById('formModalPerAkun').value = emiten.modalPerAkun;
            document.getElementById('formJumlahAkun').value   = emiten.jumlahAkun;
            document.getElementById('formProfitPerAkun').value= emiten.profitPerAkun;
            document.getElementById('formHari').value         = emiten.hari;
        } else {
            title.textContent = 'Tambah Emiten Baru';
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => document.getElementById('formEmiten').focus(), 50);
    }

    function closeForm() {
        const modal = document.getElementById('modalForm');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    /**
     * Validasi form. Return error message atau null jika valid.
     */
    function validateForm(data) {
        if (!data.emiten || !data.emiten.trim()) {
            return 'Nama emiten tidak boleh kosong.';
        }
        if (data.modalPerAkun < 0) {
            return 'Modal per Akun tidak boleh negatif.';
        }
        if (data.jumlahAkun < 1) {
            return 'Jumlah Akun minimal 1.';
        }
        if (data.hari < 0) {
            return 'Hari tidak boleh negatif.';
        }
        return null;
    }

    /**
     * Submit form (tambah atau update).
     */
    function submitForm(event) {
        event.preventDefault();
        const errorEl = document.getElementById('formError');

        const formData = {
            id: document.getElementById('formId').value || generateId(),
            // Nama emiten otomatis uppercase + trim.
            emiten: document.getElementById('formEmiten').value.trim().toUpperCase(),
            modalPerAkun: parseNumber(document.getElementById('formModalPerAkun').value),
            jumlahAkun: parseNumber(document.getElementById('formJumlahAkun').value),
            profitPerAkun: parseNumber(document.getElementById('formProfitPerAkun').value),
            hari: parseNumber(document.getElementById('formHari').value)
        };

        // Validasi
        const errMsg = validateForm(formData);
        if (errMsg) {
            errorEl.textContent = errMsg;
            errorEl.classList.remove('hidden');
            return;
        }

        // Cek duplikat nama emiten (kecuali id yang sama)
        const duplikat = state.emitens.find(
            e => e.emiten.toLowerCase() === formData.emiten.toLowerCase()
              && e.id !== formData.id
        );
        if (duplikat) {
            errorEl.textContent = `Emiten "${formData.emiten}" sudah ada.`;
            errorEl.classList.remove('hidden');
            return;
        }

        // Simpan (add atau update)
        const existingIndex = state.emitens.findIndex(e => e.id === formData.id);
        if (existingIndex >= 0) {
            state.emitens[existingIndex] = formData;
            showToast(`Emiten "${formData.emiten}" berhasil diperbarui`, 'success');
        } else {
            state.emitens.push(formData);
            showToast(`Emiten "${formData.emiten}" berhasil ditambahkan`, 'success');
        }

        saveData();
        renderAll();
        closeForm();
    }

    /**
     * Edit emiten berdasarkan ID.
     */
    function editEmiten(id) {
        openForm('edit', id);
    }

    /* =====================================================================
       11. CRUD: HAPUS DENGAN KONFIRMASI
       ===================================================================== */

    let pendingDeleteId = null;

    /**
     * Trigger konfirmasi hapus emiten.
     */
    function deleteEmiten(id) {
        const emiten = state.emitens.find(e => e.id === id);
        if (!emiten) return;
        pendingDeleteId = id;
        showConfirm(
            'Hapus Emiten?',
            `Apakah Anda yakin ingin menghapus emiten "${emiten.emiten}"? Tindakan ini tidak dapat dibatalkan.`,
            () => {
                state.emitens = state.emitens.filter(e => e.id !== id);
                saveData();
                renderAll();
                pendingDeleteId = null;
                showToast(`Emiten "${emiten.emiten}" telah dihapus`, 'success');
            }
        );
    }

    function showConfirm(title, message, onConfirm) {
        const modal = document.getElementById('modalConfirm');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const btnOk = document.getElementById('btnConfirmOk');
        const btnCancel = document.getElementById('btnConfirmCancel');

        const handlerOk = () => {
            cleanup();
            onConfirm();
        };
        const handlerCancel = () => cleanup();
        const cleanup = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            btnOk.removeEventListener('click', handlerOk);
            btnCancel.removeEventListener('click', handlerCancel);
        };

        btnOk.addEventListener('click', handlerOk);
        btnCancel.addEventListener('click', handlerCancel);
    }

    /* =====================================================================
       12. RESET DATA
       ===================================================================== */

    function resetAllData() {
        if (state.emitens.length === 0) {
            showToast('Tidak ada data untuk direset', 'info');
            return;
        }
        showConfirm(
            'Reset Semua Data?',
            'PERINGATAN: Semua data emiten akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
            () => {
                state.emitens = [];
                state.sort = { ...SORT_DEFAULT };
                state.search = '';
                state.filter = 'all';
                document.getElementById('searchInput').value = '';
                document.getElementById('filterSelect').value = 'all';

                // Hapus key dari LocalStorage. Setelah ini, refresh
                // TIDAK akan memunculkan sampel lagi.
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (err) {
                    console.error(err);
                }

                renderAll();
                showToast('Semua data telah direset', 'success');
            }
        );
    }

    /* =====================================================================
       13. EXPORT JSON & IMPORT JSON
       ===================================================================== */

    /**
     * Export seluruh data ke file .json.
     */
    function exportJSON() {
        if (state.emitens.length === 0) {
            showToast('Tidak ada data untuk diexport', 'info');
            return;
        }
        const data = {
            meta: {
                app: 'IPO Tracker Dashboard',
                version: '1.0',
                exportedAt: new Date().toISOString(),
                totalEmiten: state.emitens.length
            },
            data: state.emitens
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        triggerDownload(blob, `ipo-tracker-${getTimestampFilename()}.json`);
        showToast('Data berhasil diexport ke JSON', 'success');
    }

    /**
     * Import data dari file .json (replace data saat ini).
     */
    function importJSON(file) {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                const dataArray = Array.isArray(parsed) ? parsed : parsed.data;

                if (!Array.isArray(dataArray)) {
                    throw new Error('Format JSON tidak valid');
                }

                // Normalisasi: pastikan setiap item punya field yang diperlukan.
                // Nama emiten selalu di-uppercase agar konsisten.
                const normalized = dataArray.map(item => ({
                    id: item.id || generateId(),
                    emiten: String(item.emiten || '').trim().toUpperCase(),
                    modalPerAkun: Number(item.modalPerAkun) || 0,
                    jumlahAkun: Number(item.jumlahAkun) || 1,
                    profitPerAkun: Number(item.profitPerAkun) || 0,
                    hari: Number(item.hari) || 0
                })).filter(i => i.emiten); // Hanya yang punya nama

                if (normalized.length === 0) {
                    showToast('File JSON tidak berisi data valid', 'error');
                    return;
                }

                showConfirm(
                    'Import Data?',
                    `File berisi ${normalized.length} emiten. Data saat ini akan diganti. Lanjutkan?`,
                    () => {
                        state.emitens = normalized;
                        saveData();
                        renderAll();
                        showToast(`${normalized.length} emiten berhasil diimport`, 'success');
                    }
                );
            } catch (err) {
                console.error(err);
                showToast('Gagal membaca file JSON: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    function getTimestampFilename() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

    /**
     * Trigger download file (helper).
     */
    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /* =====================================================================
       14. EXPORT PDF (jsPDF + AutoTable)
       ===================================================================== */

    function exportPDF() {
        if (state.emitens.length === 0) {
            showToast('Tidak ada data untuk diexport', 'info');
            return;
        }
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
            showToast('Library PDF belum siap', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

        const data = state.emitens.map(withDerived);

        // ---- Judul Laporan ----
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('IPO Tracker Dashboard - Laporan', 40, 50);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Tanggal Export: ${new Date().toLocaleString('id-ID')}`, 40, 70);

        // ---- Ringkasan ----
        const totalEmiten = data.length;
        const totalAkun   = data.reduce((s, e) => s + (Number(e.jumlahAkun) || 0), 0);
        const totalModal  = data.reduce((s, e) => s + e.modalTotal, 0);
        const totalProfit = data.reduce((s, e) => s + e.totalProfit, 0);
        const totalEquity = data.reduce((s, e) => s + e.equity, 0);

        doc.setTextColor(30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Ringkasan Statistik', 40, 100);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const summaryY = 118;
        doc.text(`Total Emiten   : ${totalEmiten}`, 40,  summaryY);
        doc.text(`Total Akun     : ${totalAkun.toLocaleString('id-ID')}`, 200, summaryY);
        doc.text(`Total Modal    : ${formatRupiah(totalModal)}`, 360, summaryY);
        doc.text(`Total Profit   : ${formatRupiah(totalProfit)}`, 40,  summaryY + 15);
        doc.text(`Total Equity   : ${formatRupiah(totalEquity)}`, 200, summaryY + 15);

        // ---- Tabel Emiten ----
        const tableColumn = [
            'Emiten', 'Modal/Akun', 'Akun', 'Modal Total',
            'Profit/Akun', 'Total Profit', 'Gain (%)', 'Hari', 'Equity'
        ];
        const tableRows = data.map(e => [
            e.emiten,
            formatRupiah(e.modalPerAkun),
            e.jumlahAkun.toString(),
            formatRupiah(e.modalTotal),
            formatRupiah(e.profitPerAkun),
            formatRupiah(e.totalProfit),
            formatPersen(e.gain),
            `${e.hari} hari`,
            formatRupiah(e.equity)
        ]);

        // Baris total di footer
        tableRows.push([
            'TOTAL', '', totalAkun.toString(),
            formatRupiah(totalModal), '',
            formatRupiah(totalProfit), '', '',
            formatRupiah(totalEquity)
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: summaryY + 35,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 5 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            footStyles: { fillColor: [241, 245, 249], textColor: 30, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: function (data) {
                // Warnai sel profit negatif merah & positif hijau
                if (data.section === 'body') {
                    const col = data.column.index;
                    if ([4, 5].includes(col) && data.cell.raw) {
                        const raw = String(data.cell.raw);
                        if (raw.startsWith('-')) data.cell.styles.textColor = [220, 38, 38];
                    }
                    if (col === 6 && data.cell.raw) {
                        const raw = String(data.cell.raw);
                        if (raw.startsWith('-')) data.cell.styles.textColor = [220, 38, 38];
                        else data.cell.styles.textColor = [22, 101, 52];
                    }
                }
            }
        });

        // ---- Footer PDF ----
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Halaman ${i} dari ${pageCount} - IPO Tracker Dashboard By Sigit Berkarya`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 20,
                { align: 'center' }
            );
        }

        doc.save(`ipo-tracker-${getTimestampFilename()}.pdf`);
        showToast('PDF berhasil diunduh', 'success');
    }

    /* =====================================================================
       15. TOAST NOTIFICATION
       ===================================================================== */

    let toastTimeout;
    function showToast(message, type = 'info') {
        const toast  = document.getElementById('toast');
        const content= document.getElementById('toastContent');
        const icon   = document.getElementById('toastIcon');
        const msg    = document.getElementById('toastMessage');

        // Reset
        content.className = 'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm';

        // Tipe
        const icons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
            error:   '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
            info:    '<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };
        content.classList.add(`toast-${type}`);
        icon.innerHTML  = icons[type] || icons.info;
        msg.textContent = message;

        toast.classList.remove('hidden');
        requestAnimationFrame(() => toast.classList.add('show'));

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    }

    /* =====================================================================
       16. SETUP EVENT LISTENER
       ===================================================================== */

    function setupEventListeners() {
        // Header buttons
        document.getElementById('btnAddEmiten').addEventListener('click', () => openForm('add'));
        document.getElementById('btnExportPDF').addEventListener('click', exportPDF);
        document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
        document.getElementById('btnResetData').addEventListener('click', resetAllData);

        // Toggle Dark Mode
        document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);

        // Import JSON
        document.getElementById('btnImportJSON').addEventListener('click', () => {
            document.getElementById('fileImportJSON').click();
        });
        document.getElementById('fileImportJSON').addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) importJSON(file);
            e.target.value = ''; // Reset agar file sama bisa dipilih ulang
        });

        // Modal form
        document.getElementById('btnCloseModal').addEventListener('click', closeForm);
        document.getElementById('btnCancelForm').addEventListener('click', closeForm);
        document.getElementById('emitenForm').addEventListener('submit', submitForm);

        // Auto-uppercase realtime pada field Nama Emiten.
        // Mempertahankan posisi kursor agar UX tetap nyaman saat mengetik.
        const formEmiten = document.getElementById('formEmiten');
        formEmiten.addEventListener('input', e => {
            const start = e.target.selectionStart;
            const end   = e.target.selectionEnd;
            const upper = e.target.value.toUpperCase();
            if (e.target.value !== upper) {
                e.target.value = upper;
                // Kembalikan posisi kursor (workaround untuk input uppercase)
                try { e.target.setSelectionRange(start, end); } catch (err) {}
            }
        });

        // Tutup modal saat klik backdrop
        document.getElementById('modalForm').addEventListener('click', e => {
            if (e.target.id === 'modalForm') closeForm();
        });
        document.getElementById('modalConfirm').addEventListener('click', e => {
            if (e.target.id === 'modalConfirm') {
                document.getElementById('modalConfirm').classList.add('hidden');
                document.getElementById('modalConfirm').classList.remove('flex');
            }
        });

        // Search & Filter
        document.getElementById('searchInput').addEventListener('input', e => {
            state.search = e.target.value;
            renderTable();
        });
        document.getElementById('filterSelect').addEventListener('change', e => {
            state.filter = e.target.value;
            renderTable();
        });

        // Sorting
        setupSorting();

        // ESC menutup modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeForm();
                const confirmModal = document.getElementById('modalConfirm');
                if (!confirmModal.classList.contains('hidden')) {
                    confirmModal.classList.add('hidden');
                    confirmModal.classList.remove('flex');
                }
            }
        });
    }

    /* =====================================================================
       17. DATA SAMPLE (Opsional, untuk demo pertama kali)
       ===================================================================== */

    function seedSampleData() {
        // Daftar emiten sampel (silakan edit sesuai kebutuhan).
        // Rumus: Modal per Akun = (harga per lot) x 100 x (jumlah lot yang dibeli)
        //        karena 1 lot di Bursa Efek Indonesia = 100 lembar saham.
        //
        // DEFAULT: TIDAK dipanggil. Aktifkan dengan memanggil
        //          seedSampleData() di init() jika ingin demo data.
        const sample = [
            { emiten: 'JELI', modalPerAkun: 112000 * 100 * 1, jumlahAkun: 21, profitPerAkun: 0, hari: 0 }, // per lot 112.000, beli 1 lot
            { emiten: 'RANS', modalPerAkun:  17000 * 100 * 4, jumlahAkun: 21, profitPerAkun: 0, hari: 0 }, // per lot  17.000, beli 4 lot
            { emiten: 'JECX', modalPerAkun: 140000 * 100 * 1, jumlahAkun: 22, profitPerAkun: 0, hari: 0 }, // per lot 140.000, beli 1 lot
            { emiten: 'PRDL', modalPerAkun:  12000 * 100 * 2, jumlahAkun: 21, profitPerAkun: 0, hari: 0 }, // per lot  12.000, beli 2 lot
            { emiten: 'EMMI', modalPerAkun:  51500 * 100 * 2, jumlahAkun: 21, profitPerAkun: 0, hari: 0 }, // per lot  51.500, beli 2 lot
            { emiten: 'BACH', modalPerAkun:  50000 * 100 * 2, jumlahAkun:  1, profitPerAkun: 0, hari: 0 }  // per lot  50.000, beli 2 lot
        ];
        state.emitens = sample.map(s => ({ id: generateId(), ...s }));
        saveData();
    }

    /* =====================================================================
       18. INISIALISASI APLIKASI
       ===================================================================== */

    function init() {
        // Load data dari LocalStorage.
        // Catatan: TIDAK ada auto-seed. Aplikasi langsung menampilkan
        // empty state sampai user menambahkan emiten. Ini menjamin:
        //   - Reset Data + refresh = benar-benar kosong (tanpa sampel)
        //   - First-run (belum ada LocalStorage sama sekali) = kosong
        state.emitens = loadData();

        // Sinkronkan ikon & label tombol tema dengan state class .dark
        // yang dipasang oleh script inisialisasi di <head>.
        applyTheme(isDarkMode() ? 'dark' : 'light');

        // Tahun di footer
        const yearEl = document.getElementById('yearNow');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Setup event listeners & render awal
        setupEventListeners();
        renderAll();

        console.log('%cIPO Tracker Dashboard', 'color:#2563eb;font-weight:bold;font-size:14px');
        console.log(`Loaded ${state.emitens.length} emiten dari LocalStorage`);
    }

    /* =====================================================================
       19. EXPOSE KE GLOBAL (untuk inline onclick di tabel)
       ===================================================================== */

    window.IPOTracker = {
        editEmiten,
        deleteEmiten
    };

    // Jalankan saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
