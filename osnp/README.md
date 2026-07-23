# OSN Algorithm Atlas

Website pembelajaran statis untuk menerjemahkan soal cerita OSN Informatika menjadi:

1. objek dan variabel,
2. model matematika,
3. pola algoritma,
4. struktur data,
5. implementasi C++.

## Isi

- 41 modul algoritma dan struktur data.
- Penerjemah soal berbasis rule/keyword yang transparan.
- Roadmap belajar dengan progress tersimpan di browser.
- Mini visualisasi Bubble Sort.
- Search dan filter materi.
- 12 bedah studi kasus OSN-P Informatika 2024–2025.
- Solusi C++ lengkap untuk seluruh studi kasus tersebut.
- Tema terang/gelap.
- Tidak memakai database, framework, CDN, atau API.

## Menjalankan

### Cara paling cepat

Buka `index-standalone.html` langsung melalui browser.

### Versi terpisah

Jalankan folder ini dengan Live Server VS Code atau:

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Deploy GitHub Pages

Unggah minimal:

```text
index.html
styles.css
app.js
```

Di repository GitHub, buka **Settings → Pages**, pilih branch utama dan folder root.

## Deploy ZimaOS / server lokal

Salin folder ke document root Nginx/Apache, atau jalankan container static web server. Tidak ada build step.

## Catatan materi

Bubble Sort, Selection Sort, dan Insertion Sort disertakan untuk membangun pemahaman mekanisme. Untuk input besar, solusi lomba umumnya menggunakan `std::sort` atau algoritma yang lebih tepat.

Solusi studi kasus diuji kompilasi menggunakan C++17 dan diverifikasi terhadap contoh masukan pada dokumen OSN-P 2024 dan 2025.
