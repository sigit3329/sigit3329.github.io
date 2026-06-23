# IPO Tracker Dashboard

Aplikasi dashboard untuk memantau modal, jumlah akun, profit, gain, dan equity dari berbagai emiten IPO. Berjalan sepenuhnya di **frontend** (HTML + CSS + Vanilla JS) tanpa backend, tanpa database server — cukup di-host di **GitHub Pages** secara gratis.

## ✨ Fitur

- 📊 Ringkasan statistik (Total Emiten, Modal, Profit, Equity, Avg Gain)
- 📋 Tabel emiten lengkap dengan sort semua kolom
- 🔍 Pencarian realtime berdasarkan nama emiten
- 🎯 Filter: Profit Positif/Negatif, Gain > 25/50/100%
- ➕ CRUD lengkap (Tambah, Edit, Hapus dengan konfirmasi)
- 💾 Penyimpanan otomatis di **LocalStorage** (data tetap ada setelah browser ditutup)
- 🌙 **Dark Mode** (toggle otomatis, mengikuti preferensi sistem, tersimpan di LocalStorage)
- 📈 3 Grafik Chart.js (Top 10 Profit, Distribusi Modal, Distribusi Equity)
- 📄 Export PDF (dengan jsPDF + AutoTable)
- 📦 Export & Import JSON
- 🇮🇩 Format Rupiah Indonesia (`Rp 1.000.000`)
- 📱 Responsif (mobile & desktop)

## 🚀 Cara Deploy ke GitHub Pages

1. Push semua file ke repository GitHub Anda.
2. Buka **Settings → Pages**.
3. Pada **Source**, pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**. Tunggu beberapa menit, dashboard siap diakses.

> File `.nojekyll` sudah disertakan agar GitHub Pages tidak memproses folder `_` sebagai Jekyll.

## 📁 Struktur File

```
/
├── index.html         # Halaman utama
├── css/
│   └── style.css      # Custom CSS (melengkapi Tailwind)
├── js/
│   └── app.js         # Semua logic aplikasi
└── .nojekyll          # Bypass Jekyll di GitHub Pages
```

## 🛠️ Library yang Digunakan (CDN)

| Library      | Versi  | Fungsi                       |
|--------------|--------|------------------------------|
| Tailwind CSS | 3.x    | Utility-first CSS            |
| Chart.js     | 4.4.0  | Grafik                       |
| jsPDF        | 2.5.1  | Export PDF                   |
| jsPDF-AutoTable | 3.8.0 | Tabel otomatis di PDF      |

## 📐 Rumus Perhitungan

- **Modal Total**   = Modal per Akun × Jumlah Akun
- **Total Profit**  = Profit per Akun × Jumlah Akun
- **Gain (%)**      = (Profit per Akun / Modal per Akun) × 100
- **Equity**        = Modal Total + Total Profit

## ✅ Validasi

- Modal per Akun tidak boleh negatif
- Jumlah Akun minimal 1
- Hari minimal 0
- Profit per Akun boleh negatif (rugi tetap diizinkan)

## 💻 Pengembangan Lokal

Cukup buka `index.html` di browser, atau jalankan:

```bash
# Python 3
python -m http.server 8000

# Node.js (dengan http-server)
npx http-server
```

Lalu buka `http://localhost:8000`.
