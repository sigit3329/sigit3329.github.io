



# Bedah Lengkap OSN-P Informatika 2025

Dokumen ini berisi enam studi kasus, mulai dari manipulasi string sampai dynamic programming pada grid 2 × N. Urutan kesulitannya cukup terasa: A–C masih ramah, D mulai butuh observasi greedy, E masuk DP serius, dan F punya jebakan struktur yang lumayan barbar. fileciteturn0file0

## Peta konsep cepat

| Soal | Inti materi | Algoritma utama |
|---|---|---|
| A | Subsequence dan pemisahan prefix–suffix | Scan linear |
| B | Packing persegi panjang | Binary search jawaban |
| C | Faktorisasi prima dan banyak pembagi | Trial division |
| D | Menggabungkan interval penghapusan | Greedy + sorting |
| E | Partisi array terurut | DP + segment tree |
| F | Jalur tidak boleh bersilangan | Invariant grid + DP dua baris |

## Kunci soal pemahaman

| Soal | Jawaban |
|---|---:|
| A1 | B |
| A2 | BENAR |
| A3 | `SONOSOPP` |
| B1 | 10 |
| B2 | BENAR |
| B3 | 11 |
| C1 | 777777 |
| C2 | B |
| C3 | 5 |
| D1 | B |
| D2 | 5 |
| D3 | 8 |
| E1 | D |
| E2 | BENAR |
| E3 | 5 |
| F1 | E |
| F2 | 499 |
| F3 | 99 |

---

# A. String Cantik OSN-P

## 1. Memahami aturan

String cantik harus:

1. Hanya menggunakan `O`, `S`, `N`, dan `P`.
2. Keempat huruf muncul minimal sekali.
3. Setelah `P` pertama yang dipilih, tidak boleh ada huruf selain `P`.

Bentuk akhirnya selalu seperti:

```text
gabungan O/S/N ... lalu P P P ...
```

Contoh valid:

```text
SSNOSOPP
```

Contoh tidak valid:

```text
OSNPOP
```

Karena setelah `P` muncul `O`.

Hal penting: kita boleh menghapus karakter, tetapi urutan karakter yang tersisa tidak boleh berubah. Ini disebut **subsequence**, bukan substring.

### Analogi sederhana

Bayangkan siswa berbaris. Kita boleh menyuruh beberapa siswa pulang, tetapi siswa yang tersisa tidak boleh bertukar posisi.

---

## 2. Pembahasan soal pemahaman

### A1

A. `OSN`

Tidak memiliki `P`.

B. `SSNOSOPP`

Semua karakter valid, ada O, S, N, P, dan semua P berada di belakang.

C. `OSNPOP`

Setelah P ada O. Tidak valid.

D. `NOWOSP`

Ada W. Tidak valid.

E. `OSOPP`

Tidak memiliki N.

**Jawaban: B**

---

### A2

```text
SOPRANOSATPOLPP
```

Posisi P:

```text
3, 11, 14, 15
```

Kita dapat memilih O, S, N sebelum posisi 11, kemudian mengambil P pada posisi:

```text
11, 14, 15
```

Contoh subsequence:

```text
SONOSPPP
```

Terdapat tepat tiga P.

**Jawaban: BENAR**

---

### A3

String:

```text
SOPRANOSATPOLPP
```

Coba jadikan setiap P sebagai P pertama.

#### P pertama di posisi 3

Sebelumnya hanya ada S dan O, belum ada N.

Tidak valid.

#### P pertama di posisi 11

Huruf O/S/N sebelum posisi 11:

```text
S O N O S
```

P dari posisi 11 dan seterusnya:

```text
P P P
```

Hasil:

```text
SONOSPPP
```

Panjang 8.

#### P pertama di posisi 14

Huruf O/S/N sebelum posisi 14:

```text
S O N O S O
```

P dari posisi 14:

```text
P P
```

Hasil:

```text
SONOSOPP
```

Panjang 8.

Keduanya sama panjang. Bandingkan secara leksikografis:

```text
SONOSOPP
SONOSPPP
     O
     P
```

Karena `O < P`, yang lebih kecil adalah:

```text
SONOSOPP
```

**Jawaban: `SONOSOPP`**

---

## 3. Ide solusi pemrograman

Setiap jawaban valid mempunyai sebuah titik pemisah:

```text
[semua O/S/N yang dipilih] [semua P yang dipilih]
```

Untuk setiap karakter P, anggap karakter tersebut sebagai P pertama.

Kita perlu mengetahui:

- Berapa banyak O, S, N sebelum posisi tersebut.
- Berapa banyak P mulai posisi tersebut sampai akhir.

Jika O, S, dan N sudah masing-masing muncul minimal sekali, panjang kandidat adalah:

```text
jumlah O/S/N di prefix + jumlah P di suffix
```

Tidak ada alasan membuang O, S, atau N yang berada sebelum P pertama, karena semuanya valid dan menambah panjang.

Tidak ada alasan membuang P setelah P pertama, karena semuanya juga valid.

---

## 4. Contoh scan

Misalnya:

```text
OSNNXPIPP
```

Ketika bertemu P pertama:

```text
prefix: OSNN
suffix P: PPP
```

Karakter X dan I diabaikan.

Hasil kandidat:

```text
OSNNPPP
```

---

## 5. Kompleksitas

```text
Waktu  : O(|S|)
Memori : O(1)
```

Cocok untuk panjang string sampai 200.000.

---

## 6. C++ solusi A

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string S;
    cin >> S;

    long long suffixP = 0;
    for (char c : S) {
        if (c == 'P') {
            suffixP++;
        }
    }

    long long countO = 0;
    long long countS = 0;
    long long countN = 0;

    long long answer = -1;

    for (char c : S) {
        if (c == 'P') {
            // Anggap P ini sebagai P pertama pada string akhir.
            if (countO > 0 && countS > 0 && countN > 0) {
                long long candidate =
                    countO + countS + countN + suffixP;

                answer = max(answer, candidate);
            }

            // Setelah posisi ini dilewati,
            // P ini tidak lagi termasuk suffix.
            suffixP--;
        } else if (c == 'O') {
            countO++;
        } else if (c == 'S') {
            countS++;
        } else if (c == 'N') {
            countN++;
        }

        // Huruf lain diabaikan.
    }

    cout << answer << '\n';
    return 0;
}
```

### Jebakan A

Jangan mencari substring berurutan. Kita boleh melewati karakter lain.

---

# B. Gudang Penyimpanan Kardus

Pada gambar halaman 3, kardus harus mempunyai orientasi yang sama. Artinya semua kardus disusun seperti grid; tidak boleh sebagian diputar.

## 1. Berapa kardus yang muat?

Gudang berbentuk persegi dengan sisi `S`.

Ukuran kardus:

```text
panjang P
lebar   L
```

Jumlah kardus horizontal:

```text
floor(S / P)
```

Jumlah kardus vertikal:

```text
floor(S / L)
```

Jadi kapasitas:

```text
floor(S / P) × floor(S / L)
```

### Analogi

Seperti menyusun ubin pada lantai. Kalau lantai lebarnya 45 dan ubinnya panjang 17, yang muat hanya:

```text
17 + 17 = 34
```

Ubin ketiga tidak muat karena:

```text
17 × 3 = 51 > 45
```

---

## 2. Pembahasan pemahaman

### B1

```text
P = 17
L = 8
S = 45
```

Horizontal:

```text
floor(45 / 17) = 2
```

Vertikal:

```text
floor(45 / 8) = 5
```

Kapasitas:

```text
2 × 5 = 10
```

**Jawaban: 10**

---

### B2

Jika semua kardus muat di gudang sisi `S`, maka gudang sisi `S + 1` tentunya memuat susunan yang sama.

Kita tinggal menggunakan posisi yang lama dan membiarkan ruang tambahan kosong.

**Jawaban: BENAR**

Ini juga menunjukkan bahwa fungsi kelayakannya **monoton**:

```text
Tidak muat, tidak muat, ..., muat, muat, muat, ...
```

Sifat monoton inilah alasan kita dapat memakai binary search.

---

### B3

```text
N = 31
P = 3
L = 1
```

Coba beberapa nilai sisi.

#### S = 9

```text
floor(9 / 3) × floor(9 / 1)
= 3 × 9
= 27
```

Belum cukup.

#### S = 10

```text
floor(10 / 3) × 10
= 3 × 10
= 30
```

Masih kurang satu. Kardus ke-31 kena PHP.

#### S = 11

```text
floor(11 / 3) × 11
= 3 × 11
= 33
```

Cukup.

**Jawaban: 11**

---

## 3. Mengapa binary search?

Nilai sisi gudang dapat sangat besar.

```text
N ≤ 10^12
```

Mencoba:

```text
S = 1, 2, 3, 4, ...
```

akan terlalu lambat.

Kita mencari nilai minimum `S` yang memenuhi:

```text
floor(S / P) × floor(S / L) ≥ N
```

Karena kelayakannya monoton, kita lakukan binary search.

---

## 4. Batas atas

Nilai:

```text
N × P
```

pasti cukup.

Sebab:

```text
floor((N × P) / P) = N
```

Paling tidak ada N kardus dalam satu arah.

Nilai maksimum:

```text
10^12 × 2000 = 2 × 10^15
```

Masih muat di `long long`.

Tetapi hasil perkalian kapasitas dapat overflow, jadi gunakan `__int128`.

---

## 5. Kompleksitas

```text
Waktu  : O(log(N × P))
Memori : O(1)
```

---

## 6. C++ solusi B

```cpp
#include <bits/stdc++.h>
using namespace std;

using int64 = long long;
using int128 = __int128_t;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int64 N, P, L;
    cin >> N >> P >> L;

    auto enough = [&](int64 side) -> bool {
        int64 horizontal = side / P;
        int64 vertical   = side / L;

        return (int128) horizontal * vertical >= N;
    };

    int64 left = 0;
    int64 right = N * P;

    while (left < right) {
        int64 mid = left + (right - left) / 2;

        if (enough(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    cout << left << '\n';
    return 0;
}
```

### Jebakan B

Jangan memakai luas saja:

```text
S² ≥ N × P × L
```

Belum tentu cukup.

Karena pembagian baris dan kolom harus bulat. Ruang sisa tidak dapat digabung seperti potongan puzzle.

---

# C. Balada Kemasan Telur

## 1. Mengubah cerita menjadi matematika

Pak Dengklek memilih bilangan prima `p` yang membagi `N`.

Harga satu kemasan:

```text
p rupiah
```

Jumlah kemasan yang dibeli:

```text
N / p
```

Isi setiap kemasan:

```text
p × p = p² telur
```

Total telur:

```text
(N / p) × p²
= N × p
```

Jadi setelah memilih tipe `p`, total telur selalu:

```text
T = Np
```

---

## 2. Banyak kemungkinan kemasan

Kemasan `s × t` harus memenuhi:

```text
s × t = T
```

Untuk setiap pembagi `s` dari `T`, nilai `t` otomatis:

```text
t = T / s
```

Jadi banyak ukuran kemasan sama dengan:

```text
jumlah pembagi positif T
```

Disebut fungsi:

```text
τ(T)
```

Misalnya:

```text
36 = 2² × 3²
```

Jumlah pembagi:

```text
(2 + 1)(2 + 1) = 9
```

---

## 3. Rumus jumlah pembagi

Jika:

```text
N = q₁^a₁ × q₂^a₂ × ... × qk^ak
```

Maka:

```text
τ(N) = (a₁ + 1)(a₂ + 1)...(ak + 1)
```

Ketika memilih `p = qj`, total telur menjadi:

```text
N × p
```

Eksponen `p` naik dari:

```text
aj menjadi aj + 1
```

Jumlah pembagi berubah dari faktor:

```text
aj + 1
```

menjadi:

```text
aj + 2
```

Perbandingan kenaikannya:

```text
(aj + 2) / (aj + 1)
```

Perbandingan ini semakin kecil jika `aj` semakin besar.

Contoh:

```text
a = 1 → 3/2
a = 2 → 4/3
a = 3 → 5/4
```

Jadi kita harus memilih faktor prima yang mempunyai **eksponen paling kecil** dalam faktorisasi N.

Jika eksponennya sama, pilih prima paling kecil.

### Analogi

Anggap setiap eksponen adalah tinggi gedung.

Menambahkan satu lantai paling terasa pada gedung pendek:

```text
1 lantai menjadi 2: naik 100%
10 lantai menjadi 11: naik 10%
```

---

## 4. Pembahasan pemahaman

### C1

```text
N = 111111
p = 7
```

Jumlah kemasan:

```text
111111 / 7 = 15873
```

Telur setiap kemasan:

```text
7² = 49
```

Total:

```text
15873 × 49 = 777777
```

Atau langsung:

```text
N × p = 111111 × 7 = 777777
```

**Jawaban: 777777**

---

### C2

Hitung jumlah pembagi.

#### A. `2¹ × 5¹ = 10`

```text
τ = (1 + 1)(1 + 1) = 4
```

#### B. `2² × 5² = 100`

```text
τ = 3 × 3 = 9
```

#### C. `2² × 5¹ = 20`

```text
τ = 3 × 2 = 6
```

#### D. `2³ × 5¹ = 40`

```text
τ = 4 × 2 = 8
```

#### E. `2⁶ = 64`

```text
τ = 6 + 1 = 7
```

Terbesar adalah 9.

**Jawaban: B**

---

### C3

```text
45 = 3² × 5¹
```

Eksponen:

```text
3 memiliki eksponen 2
5 memiliki eksponen 1
```

Pilih eksponen paling kecil, yaitu prima 5.

Cek manual:

#### Pilih p = 3

```text
45 × 3 = 135
135 = 3³ × 5
τ(135) = 4 × 2 = 8
```

#### Pilih p = 5

```text
45 × 5 = 225
225 = 3² × 5²
τ(225) = 3 × 3 = 9
```

**Jawaban: 5**

---

## 5. Algoritma

1. Faktorkan `N`.
2. Catat eksponen setiap faktor prima.
3. Pilih prima dengan eksponen terkecil.
4. Jika seri, pilih prima terkecil.

Dengan `N ≤ 10^12`, kita cukup mencoba pembagi sampai:

```text
sqrt(N) ≤ 10^6
```

Masih aman.

---

## 6. Kompleksitas

```text
Waktu  : O(√N)
Memori : O(1)
```

---

## 7. C++ solusi C

```cpp
#include <bits/stdc++.h>
using namespace std;

using int64 = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int64 N;
    cin >> N;

    int64 remaining = N;

    int bestExponent = INT_MAX;
    int64 bestPrime = -1;

    auto consider = [&](int64 prime, int exponent) {
        if (exponent < bestExponent ||
            (exponent == bestExponent && prime < bestPrime)) {
            bestExponent = exponent;
            bestPrime = prime;
        }
    };

    int exponentTwo = 0;
    while (remaining % 2 == 0) {
        remaining /= 2;
        exponentTwo++;
    }

    if (exponentTwo > 0) {
        consider(2, exponentTwo);
    }

    for (int64 p = 3; p <= remaining / p; p += 2) {
        int exponent = 0;

        while (remaining % p == 0) {
            remaining /= p;
            exponent++;
        }

        if (exponent > 0) {
            consider(p, exponent);
        }
    }

    // Jika masih tersisa > 1, sisanya adalah faktor prima
    // dengan eksponen 1.
    if (remaining > 1) {
        consider(remaining, 1);
    }

    cout << bestPrime << '\n';
    return 0;
}
```

---

# D. Telur Kemasan Balado

## 1. Menghilangkan semua A

String hanya berisi:

```text
A = telur Asli
B = telur Balado
```

Pada akhir proses, semua A harus hilang.

Satu operasi menghapus satu interval.

Misalnya:

```text
BB AAA BBB AA BB
```

Jika setiap kelompok A dihapus sendiri:

```text
AAA → 1 operasi
AA  → 1 operasi
```

Total dua operasi.

Tetapi kita dapat menggabungkan dua penghapusan dengan mengorbankan B di tengah:

```text
AAA BBB AA
```

dihapus sekaligus.

Biayanya: tiga B ikut hilang.

### Analogi

Kelompok A adalah pulau sampah yang harus dibersihkan.

Kelompok B di antara dua pulau adalah jembatan. Untuk membersihkan dua pulau dengan satu sapuan, jembatannya ikut dihancurkan.

Kita ingin menghancurkan jembatan yang paling pendek.

---

## 2. Struktur run

Pisahkan string menjadi kelompok karakter sama.

Contoh:

```text
B | AA | BBB | AAAA | BBBB | AAA | BB | A
```

Kelompok A ada empat.

Jika ingin mempertahankan semua B, dibutuhkan empat operasi.

Jika hanya tersedia dua operasi, kita harus mengurangi jumlah interval dari:

```text
4 menjadi 2
```

Berarti perlu melakukan dua penggabungan.

Setiap penggabungan dilakukan dengan menghapus satu kelompok B yang berada di antara dua kelompok A.

---

## 3. Algoritma greedy

Misalkan:

```text
R = banyak kelompok A
```

Jika:

```text
R ≤ K
```

Semua kelompok A dapat dihapus sendiri. Semua B selamat.

Jika:

```text
R > K
```

Kita perlu:

```text
R - K
```

penggabungan.

Setiap penggabungan mengorbankan satu kelompok B internal.

Agar B yang hilang minimal, pilih:

```text
R - K kelompok B internal terpendek
```

---

## 4. Pembahasan pemahaman

### D1, K = 1

#### A. `BBBBB`

Tidak ada A.

B tersisa:

```text
5
```

#### B. `BBAABBBB`

Hanya satu kelompok A.

Hapus `AA`.

B tersisa:

```text
2 + 4 = 6
```

#### C. `AAAAABBBB`

Hapus prefix A.

B tersisa:

```text
4
```

#### D. `BABBBBBBBBAB`

Ada dua kelompok A.

Untuk menghapusnya dalam satu operasi, delapan B di tengah ikut terhapus.

B yang tersisa hanya dua di ujung.

#### E. `AABBBBAABABBBABBB`

Kelompok A ada empat. Untuk menjadi satu operasi, tiga kelompok B internal harus dikorbankan.

Hasilnya lebih kecil dari 6.

**Jawaban: B**

---

### D2

```text
BAABBBAAAABBBBAAABBA
```

Kelompoknya:

```text
B | AA | BBB | AAAA | BBBB | AAA | BB | A
```

Banyak kelompok A:

```text
4
```

Panjang kelompok B internal:

```text
3, 4, 2
```

Total B:

```text
1 + 3 + 4 + 2 = 10
```

Dengan `K = 2`, perlu:

```text
4 - 2 = 2 penggabungan
```

Pilih dua kelompok B paling pendek:

```text
2 dan 3
```

B yang hilang:

```text
2 + 3 = 5
```

B tersisa:

```text
10 - 5 = 5
```

**Jawaban: 5**

---

### D3

String sama, tetapi:

```text
K = 3
```

Perlu:

```text
4 - 3 = 1 penggabungan
```

Korbankan kelompok B paling pendek:

```text
2
```

B tersisa:

```text
10 - 2 = 8
```

**Jawaban: 8**

---

## 5. Mengapa greedy benar?

Setiap kelompok B internal yang dihapus selalu:

- Mengurangi banyak interval A sebanyak tepat satu.
- Memberikan biaya sebesar panjang kelompok B tersebut.

Tidak ada efek samping lain.

Jadi kita mempunyai kumpulan biaya independen:

```text
3, 4, 2, ...
```

Untuk melakukan sejumlah penggabungan tertentu, pilihan termurah jelas mengambil biaya terkecil.

---

## 6. Kompleksitas

```text
Waktu  : O(N log N)
Memori : O(N)
```

Sorting dilakukan pada panjang kelompok B internal.

---

## 7. C++ solusi D

```cpp
#include <bits/stdc++.h>
using namespace std;

using int64 = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N;
    int64 K;
    cin >> N >> K;

    string S;
    cin >> S;

    int64 totalB = 0;
    int numberOfARuns = 0;

    vector<int> internalBRuns;

    int i = 0;

    while (i < N) {
        int j = i;

        while (j < N && S[j] == S[i]) {
            j++;
        }

        int length = j - i;

        if (S[i] == 'A') {
            numberOfARuns++;
        } else {
            totalB += length;

            // B-run internal:
            // ada A di sebelah kiri dan kanan.
            if (i > 0 && j < N) {
                internalBRuns.push_back(length);
            }
        }

        i = j;
    }

    if (numberOfARuns <= K) {
        cout << totalB << '\n';
        return 0;
    }

    int64 mergesNeeded = numberOfARuns - K;

    sort(internalBRuns.begin(), internalBRuns.end());

    int64 answer = totalB;

    for (int i = 0; i < mergesNeeded; i++) {
        answer -= internalBRuns[i];
    }

    cout << answer << '\n';
    return 0;
}
```

---

# E. Tebas Tebang Bambu

Ini mulai masuk DP serius.

## 1. Kapan sebuah kelompok bambu valid?

Misalkan satu kelompok mempunyai panjang:

```text
x₁, x₂, ..., xr
```

Semua harus dipangkas menjadi panjang yang sama.

Karena hanya boleh dipangkas maksimal K, kelompok valid jika:

```text
maksimum - minimum ≤ K
```

Mengapa?

Kita dapat memangkas semuanya menjadi panjang minimum.

Bambu terpanjang perlu dipotong:

```text
maksimum - minimum
```

Jika nilainya tidak lebih dari K, semuanya aman.

---

## 2. Mengapa bambu perlu diurutkan?

Urutkan:

```text
A₁ ≤ A₂ ≤ ... ≤ AN
```

Kelompok optimal dapat dianggap sebagai potongan-potongan berurutan pada array yang sudah diurutkan.

Secara intuitif, tidak masuk akal mengambil bambu pendek dan tinggi untuk kelompok pertama, tetapi meninggalkan bambu ukuran tengah ke kelompok lain. Kelompoknya akan saling silang dan dapat dirapikan tanpa memperburuk rentang.

### Analogi

Seperti membagi siswa berdasarkan tinggi badan. Setelah berbaris dari pendek ke tinggi, kelompok yang masuk akal adalah siswa-siswa yang bersebelahan.

---

## 3. Ukuran setiap kelompok optimal

Setiap kelompok minimal berisi:

```text
M bambu
```

Soal E2 mengatakan bahwa pada solusi maksimum, ukuran setiap kelompok pasti:

```text
kurang dari 2M
```

Ini benar.

Jika sebuah kelompok memiliki minimal `2M` bambu, kita dapat membaginya menjadi dua kelompok:

```text
M bambu dan sisanya
```

Keduanya masih memiliki minimal M bambu.

Karena semua bambu di kelompok awal sudah dapat dibuat sama panjang, kedua kelompok hasil pembagian juga valid.

Jumlah kelompok bertambah satu. Berarti solusi sebelumnya belum maksimum.

Jadi dalam solusi maksimum:

```text
M ≤ ukuran kelompok ≤ 2M - 1
```

---

## 4. Definisi DP

Setelah array diurutkan:

```text
dp[i] = jumlah kelompok maksimum
        untuk membagi A₁ sampai Ai
```

Jika tidak mungkin, nilainya dianggap minus tak hingga.

Dasar:

```text
dp[0] = 0
```

Misalkan kelompok terakhir adalah:

```text
A(j+1), A(j+2), ..., Ai
```

Ukuran kelompok:

```text
i - j
```

Harus memenuhi:

```text
M ≤ i - j ≤ 2M - 1
```

Rentang panjang:

```text
Ai - A(j+1) ≤ K
```

Transisi:

```text
dp[i] = 1 + maksimum dp[j]
```

untuk semua `j` yang memenuhi syarat.

---

## 5. Rentang indeks j

Dari syarat ukuran:

```text
M ≤ i - j ≤ 2M - 1
```

Didapat:

```text
i - (2M - 1) ≤ j ≤ i - M
```

Dari syarat panjang:

```text
Ai - A(j+1) ≤ K
```

atau:

```text
A(j+1) ≥ Ai - K
```

Cari posisi pertama dengan `lower_bound`.

Setelah itu kita perlu mencari nilai maksimum `dp[j]` pada sebuah rentang.

Inilah kegunaan **segment tree**.

---

## 6. Pembahasan pemahaman

### E1

`K = 0`, jadi bambu tidak dapat dipangkas.

Setiap kelompok harus mempunyai panjang yang benar-benar sama.

#### A

Setiap panjang 1–7 hanya muncul dua kali.

Karena M = 3, tidak ada yang dapat dibuat kelompok.

#### B

Frekuensi:

```text
2 muncul 5 kali
3 muncul 5 kali
4 muncul 4 kali
```

Dapat dibuat:

```text
1 kelompok panjang 2
1 kelompok panjang 3
1 kelompok panjang 4
```

Total 3 kelompok.

#### C

Panjang 8 hanya muncul dua kali. Tidak dapat menjual semuanya.

#### D

```text
7 muncul 7 kali
8 muncul 7 kali
```

Tujuh bambu dapat dibagi:

```text
3 + 4
```

Untuk panjang 7: dua kelompok.

Untuk panjang 8: dua kelompok.

Total:

```text
4 kelompok
```

#### E

Ada panjang 2 dan 4 yang masing-masing hanya muncul satu kali.

Tidak dapat menjual semuanya.

**Jawaban: D**

---

### E2

Jika satu kelompok berisi minimal `2M`, kelompok itu dapat dipecah menjadi dua kelompok valid.

Jadi solusi maksimum tidak mungkin memiliki kelompok berukuran minimal `2M`.

**Jawaban: BENAR**

---

### E3

Data terurut:

```text
1, 1, 3, 3, 4, 5, 6, 7, 8,
9, 9, 13, 13, 14, 14, 14, 15, 16
```

```text
M = 3
K = 2
```

Salah satu pembagian:

```text
[1, 1, 3, 3]
[4, 5, 6]
[7, 8, 9, 9]
[13, 13, 14]
[14, 14, 15, 16]
```

Periksa rentang:

```text
3 - 1   = 2
6 - 4   = 2
9 - 7   = 2
14 - 13 = 1
16 - 14 = 2
```

Semuanya valid.

Total:

```text
5 kelompok
```

Mengapa tidak bisa 6?

Ada 18 bambu. Enam kelompok berarti semua kelompok harus tepat berisi tiga bambu.

Ada celah:

```text
9 ke 13
```

Selisih 4, lebih besar dari K. Jadi kelompok tidak boleh mencampur sisi kiri dan kanan celah tersebut.

Di sisi `≤ 9` ada 11 bambu, sedangkan sisi `≥ 13` ada 7 bambu. Keduanya tidak dapat dibagi menjadi kelompok-kelompok berisi tepat tiga.

Jadi enam kelompok mustahil.

**Jawaban: 5**

---

## 7. Kompleksitas

Sorting:

```text
O(N log N)
```

Setiap DP melakukan:

- satu `lower_bound`,
- satu query segment tree,
- satu update.

Total:

```text
Waktu  : O(N log N)
Memori : O(N)
```

---

## 8. C++ solusi E

```cpp
#include <bits/stdc++.h>
using namespace std;

using int64 = long long;

const int NEGATIVE_INFINITY = -1000000000;

class SegmentTree {
private:
    int size;
    vector<int> tree;

public:
    SegmentTree(int n) {
        size = 1;

        while (size < n) {
            size *= 2;
        }

        tree.assign(2 * size, NEGATIVE_INFINITY);
    }

    void update(int position, int value) {
        position += size;
        tree[position] = value;

        position /= 2;

        while (position >= 1) {
            tree[position] =
                max(tree[2 * position], tree[2 * position + 1]);

            position /= 2;
        }
    }

    int query(int left, int right) {
        if (left > right) {
            return NEGATIVE_INFINITY;
        }

        left += size;
        right += size;

        int result = NEGATIVE_INFINITY;

        while (left <= right) {
            if (left % 2 == 1) {
                result = max(result, tree[left]);
                left++;
            }

            if (right % 2 == 0) {
                result = max(result, tree[right]);
                right--;
            }

            left /= 2;
            right /= 2;
        }

        return result;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N, M;
    int64 K;

    cin >> N >> M >> K;

    vector<int64> A(N + 1);

    for (int i = 1; i <= N; i++) {
        cin >> A[i];
    }

    sort(A.begin() + 1, A.end());

    vector<int> dp(N + 1, NEGATIVE_INFINITY);
    dp[0] = 0;

    SegmentTree segmentTree(N + 1);
    segmentTree.update(0, dp[0]);

    for (int i = 1; i <= N; i++) {
        // Posisi pertama yang panjangnya >= A[i] - K.
        int firstValidStart =
            lower_bound(
                A.begin() + 1,
                A.begin() + i + 1,
                A[i] - K
            ) - A.begin();

        // j adalah banyak elemen sebelum kelompok terakhir.
        int left =
            max({
                0,
                i - (2 * M - 1),
                firstValidStart - 1
            });

        int right = i - M;

        if (left <= right) {
            int bestPrevious = segmentTree.query(left, right);

            if (bestPrevious != NEGATIVE_INFINITY) {
                dp[i] = bestPrevious + 1;
            }
        }

        segmentTree.update(i, dp[i]);
    }

    if (dp[N] == NEGATIVE_INFINITY) {
        cout << -1 << '\n';
    } else {
        cout << dp[N] << '\n';
    }

    return 0;
}
```

### Jebakan E

Greedy mengambil M bambu paling kiri belum tentu benar. Kadang kelompok pertama perlu berisi lebih dari M supaya sisa bambu masih bisa dikelompokkan.

---

# F. Kandang Ayam Kandang Bebek

Ini soal paling penting untuk dijelaskan dari **struktur**, bukan langsung kode. Langsung menembak DP di sini biasanya membuat siswa melihat matrix lalu jiwanya logout.

Grid hanya mempunyai dua baris.

```text
baris atas  → kandang ayam
baris bawah → kandang bebek
```

Rute ayam dan bebek tidak boleh memakai petak yang sama.

---

## 1. Kolom aktif

Definisikan:

```text
RA = kolom paling kanan yang memiliki ayam
RB = kolom paling kanan yang memiliki bebek
```

Kemudian:

```text
overlap = min(RA, RB)
```

Untuk setiap kolom:

```text
1 sampai overlap
```

pasti ada:

- setidaknya satu ayam di kolom tersebut atau di sebelah kanannya,
- setidaknya satu bebek di kolom tersebut atau di sebelah kanannya.

Jadi kedua spesies harus melewati kolom tersebut untuk mencapai kandang.

---

## 2. Analogi gerbang dua jalur

Bayangkan setiap kolom adalah gerbang dengan dua jalur:

```text
jalur atas
jalur bawah
```

Di wilayah overlap, ayam dan bebek sama-sama harus melewati gerbang.

Karena hanya ada dua petak dan mereka tidak boleh bertemu:

```text
satu spesies harus memakai atas,
satu spesies harus memakai bawah.
```

Di kolom 1:

```text
ayam harus berakhir di atas
bebek harus berakhir di bawah
```

Maka sepanjang wilayah overlap:

```text
jalur atas  wajib milik ayam
jalur bawah wajib milik bebek
```

Mereka tidak bisa bertukar jalur di tengah overlap. Untuk bertukar baris, seekor hewan harus melewati kedua petak dalam satu kolom. Petak lainnya sedang dibutuhkan spesies lawan. Auto ribut.

---

## 3. Kondisi mustahil

Untuk setiap kolom `1..overlap`:

- Tidak boleh ada ayam di baris bawah.
- Tidak boleh ada bebek di baris atas.

Jika ada salah satunya, jawabannya:

```text
-1
```

---

## 4. Wilayah setelah overlap

Setelah kolom overlap, hanya satu spesies yang masih memiliki hewan lebih jauh di kanan.

Misalnya:

```text
RA > RB
```

Maka di sebelah kanan `RB` hanya ayam yang masih membutuhkan jalur.

Ayam bebas memakai baris atas maupun bawah di wilayah tersebut, lalu harus masuk ke jalur atas saat mencapai wilayah overlap.

Karena hanya satu spesies, tiap hewan dapat mencari rute termurah secara independen.

---

## 5. DP jarak pada grid dua baris

Misalkan:

```text
top[i]    = nilai kebecekan baris atas kolom i
bottom[i] = nilai kebecekan baris bawah kolom i
```

Untuk suatu spesies:

```text
dTop[i]    = biaya minimum dari petak atas kolom i ke kandang
dBottom[i] = biaya minimum dari petak bawah kolom i ke kandang
```

Di wilayah bebas, dari atas kolom i ada dua pilihan.

### Tetap di baris atas

```text
top[i] + dTop[i-1]
```

### Pindah ke bawah di kolom i

Kita melewati:

```text
atas i → bawah i → bawah i-1
```

Biaya:

```text
top[i] + bottom[i] + dBottom[i-1]
```

Maka:

```text
dTop[i]
= top[i] + min(
    dTop[i-1],
    bottom[i] + dBottom[i-1]
  )
```

Serupa:

```text
dBottom[i]
= bottom[i] + min(
    dBottom[i-1],
    top[i] + dTop[i-1]
  )
```

Untuk ayam, basisnya di atas:

```text
dAyamTop[1] = top[1]
```

Untuk bebek, basisnya di bawah:

```text
dBebekBottom[1] = bottom[1]
```

Di wilayah overlap:

```text
ayam hanya boleh atas
bebek hanya boleh bawah
```

---

## 6. Pembahasan pemahaman

### F1

#### A

Ayam `(1,5)`, bebek `(2,1)`.

Overlap hanya sampai kolom 1. Keduanya berada di jalur benar.

Bisa.

#### B

Ayam `(1,2)`, bebek `(1,4)`.

Overlap sampai kolom 2.

Bebek berada di atas kolom 4, yaitu di luar overlap. Bebek masih dapat pindah ke bawah sebelum memasuki overlap.

Bisa.

#### C

Ayam `(2,5)`, bebek `(2,4)`.

Overlap sampai kolom 4.

Ayam berada di bawah kolom 5, di luar overlap. Ayam dapat pindah ke atas pada kolom 5.

Bisa.

#### D

Ayam `(1,2)`, bebek `(2,4)`.

Sudah di jalur masing-masing.

Bisa.

#### E

Ayam `(1,4)`, bebek `(1,2)`.

Overlap sampai kolom 2.

Bebek berada di baris atas pada kolom 2, padahal wilayah overlap baris atas wajib milik ayam.

Pasti terjadi perselisihan.

**Jawaban: E**

---

### F2

Ayam berada pada:

```text
(2,500)
```

Ayam berada di baris bawah.

Agar posisi ini tidak masuk wilayah overlap, bebek harus berada di kolom:

```text
kurang dari 500
```

Jika bebek berada di kolom 500 atau lebih, overlap mencapai kolom 500. Ayam berada di jalur yang salah.

Untuk bebek dengan kolom kurang dari 500, bebek harus berada di baris bawah agar benar di wilayah overlap.

Posisi valid:

```text
(2,1), (2,2), ..., (2,499)
```

Jumlah:

```text
499
```

**Jawaban: 499**

---

### F3

Matriks:

```text
Atas  : 6 3 2 1 3 7
Bawah : 8 5 1 9 1 4
```

Ayam:

```text
(1,1)
```

Bebek:

```text
(1,5), (1,6), (2,5), (2,6)
```

Kolom ayam paling kanan:

```text
RA = 1
```

Kolom bebek paling kanan:

```text
RB = 6
```

Overlap:

```text
1
```

Ayam hanya melewati `(1,1)`:

```text
biaya ayam = 6
```

Hitung jarak bebek menuju kandang bawah.

| Kolom | Jarak dari atas | Jarak dari bawah |
|---:|---:|---:|
| 1 | ∞ | 8 |
| 2 | 16 | 13 |
| 3 | 16 | 14 |
| 4 | 17 | 23 |
| 5 | 20 | 21 |
| 6 | 27 | 25 |

Empat bebek:

```text
(1,5) → 20
(1,6) → 27
(2,5) → 21
(2,6) → 25
```

Total bebek:

```text
20 + 27 + 21 + 25 = 93
```

Tambah ayam:

```text
93 + 6 = 99
```

**Jawaban: 99**

---

## 7. Mengapa jumlah jarak individual boleh dijumlahkan?

Hewan dengan spesies sama boleh melewati petak yang sama.

Artinya:

- Ayam tidak mengganggu ayam.
- Bebek tidak mengganggu bebek.
- Konflik hanya antara ayam dan bebek.

Setelah wilayah untuk masing-masing spesies dipisahkan, setiap hewan bebas mengambil jalur termurahnya sendiri.

---

## 8. Kompleksitas

Kita hanya melakukan scan beberapa kali.

```text
Waktu  : O(N)
Memori : O(N)
```

Dengan sedikit optimasi, memorinya sebenarnya dapat dibuat O(N) atau O(1) untuk jarak, tetapi array membuat kode lebih mudah dijelaskan.

---

## 9. C++ solusi F

```cpp
#include <bits/stdc++.h>
using namespace std;

using int64 = long long;

const int64 INF = 4000000000000000000LL;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int N;
    cin >> N;

    string S1, S2;
    cin >> S1 >> S2;

    vector<int64> top(N + 1);
    vector<int64> bottom(N + 1);

    for (int i = 1; i <= N; i++) {
        cin >> top[i];
    }

    for (int i = 1; i <= N; i++) {
        cin >> bottom[i];
    }

    int rightmostChicken = 0;
    int rightmostDuck = 0;

    for (int i = 1; i <= N; i++) {
        if (S1[i - 1] == 'A' || S2[i - 1] == 'A') {
            rightmostChicken = i;
        }

        if (S1[i - 1] == 'B' || S2[i - 1] == 'B') {
            rightmostDuck = i;
        }
    }

    int overlap = min(rightmostChicken, rightmostDuck);

    // Di wilayah overlap:
    // atas wajib ayam, bawah wajib bebek.
    for (int i = 1; i <= overlap; i++) {
        bool chickenOnBottom = (S2[i - 1] == 'A');
        bool duckOnTop = (S1[i - 1] == 'B');

        if (chickenOnBottom || duckOnTop) {
            cout << -1 << '\n';
            return 0;
        }
    }

    vector<int64> chickenTop(N + 1, INF);
    vector<int64> chickenBottom(N + 1, INF);

    vector<int64> duckTop(N + 1, INF);
    vector<int64> duckBottom(N + 1, INF);

    // Basis kandang:
    // ayam masuk dari atas kolom 1,
    // bebek masuk dari bawah kolom 1.
    chickenTop[1] = top[1];
    duckBottom[1] = bottom[1];

    for (int i = 2; i <= N; i++) {
        if (i <= overlap) {
            // Di overlap, ayam hanya boleh atas.
            chickenTop[i] =
                chickenTop[i - 1] + top[i];

            // Bebek hanya boleh bawah.
            duckBottom[i] =
                duckBottom[i - 1] + bottom[i];
        } else {
            // Wilayah bebas untuk spesies yang masih berada di kanan.

            chickenTop[i] =
                top[i] +
                min(
                    chickenTop[i - 1],
                    bottom[i] + chickenBottom[i - 1]
                );

            chickenBottom[i] =
                bottom[i] +
                min(
                    chickenBottom[i - 1],
                    top[i] + chickenTop[i - 1]
                );

            duckTop[i] =
                top[i] +
                min(
                    duckTop[i - 1],
                    bottom[i] + duckBottom[i - 1]
                );

            duckBottom[i] =
                bottom[i] +
                min(
                    duckBottom[i - 1],
                    top[i] + duckTop[i - 1]
                );
        }
    }

    int64 answer = 0;

    for (int i = 1; i <= N; i++) {
        if (S1[i - 1] == 'A') {
            answer += chickenTop[i];
        } else if (S1[i - 1] == 'B') {
            answer += duckTop[i];
        }

        if (S2[i - 1] == 'A') {
            answer += chickenBottom[i];
        } else if (S2[i - 1] == 'B') {
            answer += duckBottom[i];
        }
    }

    cout << answer << '\n';
    return 0;
}
```

---

# Cara menjelaskan besok sebagai mentor

Gunakan pola yang sama untuk seluruh soal:

## 1. Buang ceritanya terlebih dahulu

Ubah cerita menjadi model:

- A: memilih subsequence.
- B: mencari S minimum dengan kapasitas tertentu.
- C: memaksimalkan banyak pembagi.
- D: menutup semua A dengan maksimal K interval.
- E: membagi array terurut menjadi segmen valid.
- F: memisahkan dua jenis jalur pada grid dua baris.

## 2. Tunjukkan observasi sebelum algoritma

Jangan langsung berkata:

> “Kita gunakan segment tree.”

Siswa belum tahu masalah apa yang diselesaikan segment tree.

Urutannya:

```text
observasi → rumus → transisi → struktur data
```

## 3. Hubungkan batasan dengan kompleksitas

Contoh:

```text
N = 200.000
```

Maka:

- `O(N²)` hampir pasti mati.
- `O(N log N)` aman.
- `O(N)` lebih mantap.

## 4. Tekankan invariant

Invariant terpenting:

- A: setelah P, hanya boleh P.
- B: jika sisi S muat, sisi lebih besar juga muat.
- C: memilih p hanya menaikkan satu eksponen.
- D: setiap B internal yang dibuang mengurangi satu operasi.
- E: kelompok optimal berukuran kurang dari 2M.
- F: di wilayah overlap, atas pasti ayam dan bawah pasti bebek.

Untuk kelas, habiskan waktu paling banyak di **D, E, dan F**. A–C dapat dipakai sebagai pemanasan; F adalah final boss-nya.