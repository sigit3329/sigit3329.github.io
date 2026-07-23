const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const cpp = (code) => code.trim();

const pipeline = [
  ["Buang dekorasi", "Pisahkan nama tokoh dan cerita dari aturan yang benar-benar mengubah jawaban."],
  ["Definisikan objek", "Tentukan apa yang diberikan, apa yang boleh diubah, dan apa yang harus dicari."],
  ["Buat variabel", "Ganti kata-kata menjadi N, M, A[i], graf, string, interval, atau state."],
  ["Tulis syarat", "Ubah ‘setidaknya’, ‘tepat’, ‘sisa’, dan ‘urutan tetap’ menjadi persamaan atau predikat."],
  ["Cari sifat", "Apakah monoton, lokal, berulang, terhubung, dapat dipecah, atau memiliki submasalah sama?"],
  ["Cek batasan", "N=20 mengizinkan bitmask. N=2×10⁵ menolak O(N²). Batasan adalah spoiler resmi."],
  ["Implementasi", "Pilih struktur data, tulis invariant, tes edge case, lalu baru optimasi sintaks."],
];

const roadmap = [
  {level:"Level 0", title:"Fondasi C++", items:["Input/output dan tipe data", "if, loop, fungsi", "array, vector, string", "debugging dan dry run"]},
  {level:"Level 1", title:"Pola dasar", items:["Big-O", "sorting dan searching", "prefix sum", "two pointers", "greedy dasar"]},
  {level:"Level 2", title:"Inti OSN-P", items:["binary search on answer", "number theory", "stack/queue/deque", "BFS/DFS", "dynamic programming"]},
  {level:"Level 3", title:"Struktur kuat", items:["DSU", "Dijkstra", "Fenwick tree", "segment tree", "string matching"]},
  {level:"Level 4", title:"Lanjut", items:["bitmask DP", "MST/topological sort", "constructive & invariant", "state compression", "proof of correctness"]},
];

const algorithms = [
  {
    id:"complexity", icon:"O()", title:"Kompleksitas Waktu & Memori", category:"Fondasi", level:"Dasar",
    tagline:"Menentukan solusi mana yang sempat selesai sebelum time limit menertawakan kita.",
    signals:["batasan N", "time limit", "N sampai 200000", "overflow", "efisiensi"],
    when:"Selalu. Sebelum memilih algoritma, cocokkan ukuran input dengan perkiraan jumlah operasi.",
    math:"N ≈ 10³ → O(N²) sering aman; N ≈ 2×10⁵ → target O(N log N); N ≈ 10¹² → cari rumus, logaritma, atau √N.",
    story:"Jika ada 200.000 bambu, mencoba semua pasangan berarti sekitar 40 miliar pemeriksaan. Laptop bukan dukun.",
    code:cpp(`long long n; cin >> n;
// Hindari loop sampai n jika n bisa 1e12.
// Cari pola O(log n), O(sqrt(n)), atau rumus O(1).`),
    complexity:"Bukan satu algoritma; ini alat memilih algoritma.",
    pitfalls:["Mengira kode pendek pasti cepat.","Menggunakan int saat hasil bisa melewati 2.147.483.647.","Mengabaikan kompleksitas operasi container."],
    osn:"Semua soal numerik 2024–2025; terutama 2024 B/C dan 2025 B/C/E/F."
  },
  {
    id:"array-string", icon:"[]", title:"Array, Vector, dan String", category:"Fondasi", level:"Dasar",
    tagline:"Bentuk data paling sering muncul: urutan angka, karakter, dan indeks.",
    signals:["N elemen", "urutan", "karakter ke-i", "tinggi ke-i", "string sepanjang N"],
    when:"Saat input berupa daftar atau teks dan operasi utamanya membaca, menghitung, atau memperbarui berdasarkan indeks.",
    math:"A = [A₀, A₁, …, Aₙ₋₁]. Pastikan konsisten memakai indeks 0 atau 1.",
    story:"Tinggi pohon, panjang bambu, susunan telur, dan posisi hewan semuanya jatuh ke array/string.",
    code:cpp(`int n; cin >> n;
vector<long long> a(n);
for (auto &x : a) cin >> x;

string s; cin >> s;
for (int i = 0; i < (int)s.size(); ++i) {
    // proses s[i]
}`),
    complexity:"Akses indeks O(1), scan penuh O(N).",
    pitfalls:["Out-of-bounds.","Mencampur signed dan unsigned.","Lupa bahwa string C++ berindeks mulai 0."],
    osn:"2024 A/C/D; 2025 A/D/E/F."
  },
  {
    id:"bubble-sort", icon:"↕", title:"Bubble Sort", category:"Sorting & Searching", level:"Dasar",
    tagline:"Membandingkan tetangga dan menukar; bagus untuk belajar, buruk untuk N besar.",
    signals:["urutkan", "data sangat kecil", "jelaskan proses swap", "adjacent swap"],
    when:"Untuk pengajaran mekanisme sorting, simulasi adjacent swap, atau N sangat kecil. Bukan pilihan default lomba.",
    math:"Setelah satu pass, elemen terbesar pada bagian belum terurut berpindah ke ujung kanan.",
    story:"Mengurutkan 8 nilai sensor di papan tulis sambil memperlihatkan setiap pertukaran.",
    code:cpp(`for (int end = n - 1; end > 0; --end) {
    bool changed = false;
    for (int i = 0; i < end; ++i) {
        if (a[i] > a[i + 1]) {
            swap(a[i], a[i + 1]);
            changed = true;
        }
    }
    if (!changed) break;
}`),
    complexity:"Worst O(N²), best O(N) dengan early stop, memori O(1).",
    pitfalls:["Dipakai untuk N=100.000.","Menghafal loop tanpa memahami invariant sorted suffix."],
    osn:"Tidak menjadi inti 12 soal. Dipakai sebagai jembatan memahami sorting sebelum std::sort."
  },
  {
    id:"selection-sort", icon:"min", title:"Selection Sort", category:"Sorting & Searching", level:"Dasar",
    tagline:"Cari minimum, taruh di depan, ulangi.",
    signals:["pilih nilai terkecil berulang", "N kecil", "swap sedikit"],
    when:"Untuk memahami pemilihan minimum dan invariant sorted prefix. Praktis hanya pada input kecil.",
    math:"Pada iterasi i, cari argmin A[j] untuk j ∈ [i,n), lalu swap ke A[i].",
    story:"Memilih siswa dengan waktu tercepat satu per satu dari daftar yang belum dipilih.",
    code:cpp(`for (int i = 0; i < n; ++i) {
    int mn = i;
    for (int j = i + 1; j < n; ++j)
        if (a[j] < a[mn]) mn = j;
    swap(a[i], a[mn]);
}`),
    complexity:"O(N²), memori O(1).",
    pitfalls:["Tetap O(N²) walau data hampir terurut.","Salah mengira pencarian minimum lokal sebagai greedy universal."],
    osn:"Materi dasar, bukan inti soal resmi yang dipetakan."
  },
  {
    id:"insertion-sort", icon:"→|", title:"Insertion Sort", category:"Sorting & Searching", level:"Dasar",
    tagline:"Menyisipkan satu elemen ke prefix yang sudah terurut.",
    signals:["data hampir terurut", "N kecil", "online insertion"],
    when:"Input kecil atau hampir terurut; juga bagus untuk memahami maintaining sorted prefix.",
    math:"Elemen A[i] digeser ke kiri sampai posisi yang mempertahankan urutan prefix [0..i].",
    story:"Kartu baru dimasukkan ke tangan yang sudah terurut.",
    code:cpp(`for (int i = 1; i < n; ++i) {
    int key = a[i], j = i - 1;
    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        --j;
    }
    a[j + 1] = key;
}`),
    complexity:"Worst O(N²), best O(N), memori O(1).",
    pitfalls:["Tetap lambat pada urutan terbalik besar.","Salah batas j saat bergeser ke indeks -1."],
    osn:"Konsep sorted prefix membantu memahami DP dan greedy, tetapi gunakan std::sort untuk solusi umum."
  },
  {
    id:"std-sort", icon:"sort", title:"std::sort dan Custom Comparator", category:"Sorting & Searching", level:"Dasar",
    tagline:"Default sorting OSN: cepat, teruji, dan tidak perlu sok bikin quicksort sendiri.",
    signals:["urutkan nilai", "kelompok kontigu setelah sort", "median", "pasangan berdasarkan kunci"],
    when:"Saat urutan awal tidak penting atau sorting membuka struktur masalah: median, grouping, two pointers, interval.",
    math:"Mengubah data menjadi A₁ ≤ A₂ ≤ … ≤ Aₙ sehingga relasi tetangga dan rentang menjadi mudah.",
    story:"Panjang bambu diurutkan agar setiap ikat optimal dapat dipandang sebagai segmen kontigu.",
    code:cpp(`sort(a.begin(), a.end());

sort(items.begin(), items.end(), [](const auto& x, const auto& y) {
    if (x.score != y.score) return x.score > y.score;
    return x.id < y.id;
});`),
    complexity:"O(N log N), memori implementasi internal.",
    pitfalls:["Comparator tidak strict weak ordering.","Sorting saat urutan asli sebenarnya wajib dipertahankan."],
    osn:"2024 E; 2025 C/D/E."
  },
  {
    id:"linear-search", icon:"⌕", title:"Linear Search", category:"Sorting & Searching", level:"Dasar",
    tagline:"Scan dari awal sampai ketemu. Sederhana dan sering sudah cukup.",
    signals:["cari satu karakter", "cek keberadaan", "ambil maksimum minimum sekali"],
    when:"Data belum terurut, pencarian hanya sekali, atau kita memang perlu memproses semua elemen.",
    math:"Temukan indeks pertama i sehingga P(Aᵢ) benar.",
    story:"Mencari P pertama pada string atau pohon tertinggi dalam satu kali scan.",
    code:cpp(`int pos = -1;
for (int i = 0; i < n; ++i) {
    if (a[i] == target) { pos = i; break; }
}`),
    complexity:"O(N).",
    pitfalls:["Memaksa binary search pada data tidak terurut.","Melakukan linear search berulang M kali sehingga jadi O(NM)."],
    osn:"2024 A/C; 2025 A/F."
  },
  {
    id:"binary-search", icon:"½", title:"Binary Search pada Data Terurut", category:"Sorting & Searching", level:"Dasar",
    tagline:"Membuang separuh ruang pencarian setiap langkah.",
    signals:["array terurut", "nilai pertama ≥ X", "posisi terakhir ≤ X", "lower_bound"],
    when:"Saat data sudah terurut dan kita mencari posisi atau nilai tertentu.",
    math:"Pertahankan invariant bahwa jawaban berada dalam interval [L,R], lalu potong menjadi setengah.",
    story:"Mencari jenis gulali pertama yang tingkat manisnya tidak kurang dari median.",
    code:cpp(`auto it = lower_bound(a.begin(), a.end(), x); // pertama >= x
auto jt = upper_bound(a.begin(), a.end(), x); // pertama > x

int idx = int(it - a.begin());`),
    complexity:"O(log N) per pencarian; sorting awal O(N log N).",
    pitfalls:["Off-by-one.","Mencampur lower_bound dengan binary search on answer."],
    osn:"2024 E."
  },
  {
    id:"binary-answer", icon:"✓?", title:"Binary Search on Answer", category:"Sorting & Searching", level:"Menengah",
    tagline:"Bukan mencari angka di array, tetapi mencari batas terakhir dari predikat monoton.",
    signals:["nilai maksimum yang masih memenuhi", "nilai minimum sehingga", "setidaknya", "jika X bisa maka X-1 juga bisa"],
    when:"Ada jawaban numerik dan fungsi check(x) berubah hanya sekali: false→true atau true→false.",
    math:"Cari max X dengan P(X)=true, atau min X dengan P(X)=true. Syarat wajib: P monoton.",
    story:"Semakin rendah tinggi potong pohon, kayu tidak berkurang. Maka kelayakan membentuk prefix nilai X.",
    code:cpp(`long long lo = 0, hi = upper, ans = -1;
while (lo <= hi) {
    long long mid = lo + (hi - lo) / 2;
    if (check(mid)) {
        ans = mid;
        lo = mid + 1; // cari yang lebih besar
    } else {
        hi = mid - 1;
    }
}`),
    complexity:"O(Tcheck × log rentang jawaban).",
    pitfalls:["Predikat tidak monoton.","Arah lo/hi terbalik.","Overflow pada mid atau check."],
    osn:"2024 C Tebas Tebang Pohon; 2025 B Gudang Kardus."
  },
  {
    id:"prefix-sum", icon:"Σ", title:"Prefix Sum", category:"Range & Sequence", level:"Dasar",
    tagline:"Bayar O(N) sekali, jawab jumlah rentang dalam O(1).",
    signals:["jumlah dari l sampai r", "banyak query rentang", "akumulasi kiri ke kanan", "suffix count"],
    when:"Data statis dan banyak pertanyaan jumlah/frekuensi pada prefix atau interval.",
    math:"pref[i] = A₁+…+Aᵢ; sum(l,r)=pref[r]−pref[l−1].",
    story:"Menghitung jumlah P pada suffix atau total biaya jalur lurus dari kolom j ke kandang.",
    code:cpp(`vector<long long> pref(n + 1, 0);
for (int i = 1; i <= n; ++i) pref[i] = pref[i - 1] + a[i];

auto range_sum = [&](int l, int r) {
    return pref[r] - pref[l - 1];
};`),
    complexity:"Preprocess O(N), query O(1), memori O(N).",
    pitfalls:["Salah indeks l-1.","Menggunakan int untuk total besar."],
    osn:"2025 A dan 2025 F; juga berguna pada 2024 E."
  },
  {
    id:"difference-array", icon:"Δ", title:"Difference Array", category:"Range & Sequence", level:"Menengah",
    tagline:"Update satu rentang cukup menyentuh dua titik.",
    signals:["tambah X pada semua elemen l..r", "banyak update rentang", "hasil akhir saja"],
    when:"Banyak range update dan tidak perlu query online di tengah proses.",
    math:"diff[l]+=x, diff[r+1]−=x; nilai akhir didapat dari prefix sum diff.",
    story:"Menambah penalti atau aktivitas pada seluruh hari di antara dua tanggal.",
    code:cpp(`vector<long long> diff(n + 2);
for (auto [l, r, x] : updates) {
    diff[l] += x;
    diff[r + 1] -= x;
}
for (int i = 1; i <= n; ++i) {
    diff[i] += diff[i - 1];
    a[i] += diff[i];
}`),
    complexity:"O(Q+N).",
    pitfalls:["Dipakai saat butuh query online.","Lupa ukuran n+2 untuk r+1."],
    osn:"Tidak langsung muncul pada 12 soal, tetapi sangat umum di seleksi dan latihan range."
  },
  {
    id:"two-pointers", icon:"⇥⇤", title:"Two Pointers", category:"Range & Sequence", level:"Menengah",
    tagline:"Dua indeks bergerak monoton, menghindari mencoba semua pasangan.",
    signals:["subarray terpanjang", "pasangan pada array terurut", "rentang valid", "jendela bergerak"],
    when:"Kelayakan interval berubah monoton saat ujung kiri/kanan digeser.",
    math:"Setiap pointer bergerak paling banyak N kali, sehingga total O(N), bukan O(N²).",
    story:"Cari kelompok panjang bambu terbesar yang selisih maksimum-minimumnya ≤ K.",
    code:cpp(`int l = 0;
for (int r = 0; r < n; ++r) {
    add(a[r]);
    while (!valid()) remove(a[l++]);
    answer = max(answer, r - l + 1);
}`),
    complexity:"Biasanya O(N), setelah sorting bisa O(N log N).",
    pitfalls:["Pointer bergerak mundur sehingga kompleksitas meledak.","Kondisi valid tidak monoton."],
    osn:"Mendukung pemahaman 2025 E dan banyak soal subarray."
  },
  {
    id:"sliding-window", icon:"[↔]", title:"Sliding Window", category:"Range & Sequence", level:"Menengah",
    tagline:"Two pointers khusus rentang kontigu dengan state yang bisa ditambah dan dibuang.",
    signals:["substring/subarray", "paling panjang", "maksimal K pelanggaran", "rentang kontigu"],
    when:"Objek solusi harus kontigu dan state window dapat diperbarui inkremental.",
    math:"Jendela [l,r] dipertahankan valid; ketika tidak valid, geser l sampai valid kembali.",
    story:"Cari rentang hari terpanjang dengan jumlah error sensor tidak lebih dari K.",
    code:cpp(`int l = 0, bad = 0, best = 0;
for (int r = 0; r < n; ++r) {
    bad += isBad(a[r]);
    while (bad > k) bad -= isBad(a[l++]);
    best = max(best, r - l + 1);
}`),
    complexity:"O(N).",
    pitfalls:["Menyamakan subsequence dengan substring.","State remove tidak simetris dengan add."],
    osn:"Tidak langsung menjadi solusi 12 kasus, tetapi pola wajib OSN."
  },
  {
    id:"rle", icon:"AAA", title:"Run-Length Encoding", category:"Range & Sequence", level:"Dasar",
    tagline:"Kompres blok karakter sama menjadi (karakter, panjang).",
    signals:["blok berurutan", "kelompok A dan B", "pergantian karakter", "hapus segmen"],
    when:"Yang penting bukan tiap karakter, tetapi panjang maximal run.",
    math:"S = c₁^{len₁} c₂^{len₂} … dengan cᵢ ≠ cᵢ₊₁.",
    story:"Pada telur A/B, operasi dipengaruhi jumlah blok A dan panjang gap B di antaranya.",
    code:cpp(`vector<pair<char,int>> runs;
for (char c : s) {
    if (runs.empty() || runs.back().first != c)
        runs.push_back({c, 1});
    else
        runs.back().second++;
}`),
    complexity:"O(N).",
    pitfalls:["Memasukkan blok B di tepi sebagai gap internal.","Lupa kasus string satu jenis."],
    osn:"2025 D Telur Kemasan Balado."
  },
  {
    id:"greedy", icon:"★", title:"Greedy", category:"Paradigma", level:"Menengah",
    tagline:"Ambil keputusan lokal yang bisa dibuktikan tidak merusak optimum global.",
    signals:["pilih yang terkecil dulu", "maksimalkan jumlah", "urutan keputusan", "exchange argument"],
    when:"Ada pilihan lokal dan kita bisa membuktikan solusi optimal dapat diubah mengikuti pilihan itu tanpa memburuk.",
    math:"Bukti umum: exchange argument, staying ahead, atau invariant.",
    story:"Untuk menggabungkan blok A dengan kerugian B minimum, korbankan gap B internal paling pendek.",
    code:cpp(`sort(cost.begin(), cost.end());
long long loss = 0;
for (int i = 0; i < need; ++i) loss += cost[i];`),
    complexity:"Tergantung sorting/struktur data; sering O(N log N).",
    pitfalls:["‘Kelihatannya masuk akal’ bukan bukti.","Memilih lokal tanpa mengecek kontra-contoh."],
    osn:"2024 A; 2025 C/D; juga constructive 2024 F."
  },
  {
    id:"stack", icon:"▤", title:"Stack", category:"Struktur Data", level:"Dasar",
    tagline:"Last in, first out. Cocok untuk struktur bersarang dan membatalkan langkah terakhir.",
    signals:["kurung", "undo", "next greater", "DFS iteratif", "monotonic stack"],
    when:"Elemen terakhir yang masuk harus diproses lebih dulu.",
    math:"push/pop/top semuanya O(1).",
    story:"Validasi tanda kurung atau mencari gedung pertama yang lebih tinggi di kanan.",
    code:cpp(`stack<int> st;
st.push(x);
int top = st.top();
st.pop();`),
    complexity:"O(1) per operasi.",
    pitfalls:["Memanggil top pada stack kosong.","Menggunakan stack padahal butuh FIFO."],
    osn:"Materi umum; tidak langsung inti 12 studi kasus."
  },
  {
    id:"queue-bfs", icon:"Q", title:"Queue dan BFS", category:"Graf", level:"Menengah",
    tagline:"Menjelajah per lapisan; jarak minimum pada graf tanpa bobot.",
    signals:["langkah minimum", "graf tanpa bobot", "menyebar", "jarak terdekat"],
    when:"Semua edge bernilai sama dan kita mencari shortest path atau komponen secara level-order.",
    math:"dist[v] = dist[u] + 1 saat v pertama kali ditemukan dari u.",
    story:"Mencari jumlah langkah minimum robot pada grid tanpa bobot.",
    code:cpp(`queue<int> q;
vector<int> dist(n, -1);
dist[s] = 0; q.push(s);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) if (dist[v] == -1) {
        dist[v] = dist[u] + 1;
        q.push(v);
    }
}`),
    complexity:"O(V+E).",
    pitfalls:["Menggunakan BFS pada bobot berbeda.","Menandai visited saat pop sehingga node masuk berkali-kali."],
    osn:"Konsep graf dasar sebelum 2024 E dan 2025 F."
  },
  {
    id:"deque", icon:"⇄", title:"Deque & Monotonic Queue", category:"Struktur Data", level:"Lanjut",
    tagline:"Antrian dua ujung untuk minimum/maksimum jendela dan optimasi DP.",
    signals:["maksimum pada rentang bergerak", "DP transisi range", "sliding window minimum"],
    when:"Kandidat masuk dan keluar secara monoton, dan kita hanya butuh kandidat terbaik.",
    math:"Buang belakang yang tidak mungkin optimal; buang depan yang keluar window.",
    story:"DP bambu membutuhkan max dp[j] pada interval j yang ujungnya terus bergeser.",
    code:cpp(`deque<int> dq;
for (int i = 0; i < n; ++i) {
    while (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
    while (!dq.empty() && a[dq.back()] <= a[i]) dq.pop_back();
    dq.push_back(i);
    if (i >= k - 1) answer.push_back(a[dq.front()]);
}`),
    complexity:"O(N), karena tiap indeks masuk dan keluar sekali.",
    pitfalls:["Salah membedakan indeks dan nilai.","Arah monotonic terbalik untuk min/max."],
    osn:"Alternatif optimal untuk 2025 E."
  },
  {
    id:"priority-queue", icon:"PQ", title:"Priority Queue / Heap", category:"Struktur Data", level:"Menengah",
    tagline:"Selalu mengambil elemen terbaik saat ini dalam O(log N).",
    signals:["ambil minimum berulang", "top K", "event berikutnya", "Dijkstra"],
    when:"Data berubah dinamis dan kita berkali-kali membutuhkan minimum/maksimum global.",
    math:"Heap mempertahankan parent lebih baik daripada child.",
    story:"Memproses node dengan jarak sementara paling kecil pada Dijkstra.",
    code:cpp(`priority_queue<int> maxHeap;
priority_queue<int, vector<int>, greater<int>> minHeap;
minHeap.push(x);
int smallest = minHeap.top();`),
    complexity:"push/pop O(log N), top O(1).",
    pitfalls:["Lupa default priority_queue adalah max-heap.","Menghapus elemen arbitrary yang tidak didukung langsung."],
    osn:"Landasan shortest path dan greedy lanjutan."
  },
  {
    id:"recursion-backtracking", icon:"↩", title:"Recursion & Backtracking", category:"Paradigma", level:"Menengah",
    tagline:"Coba pilihan, turun, batalkan. Cocok saat ruang solusi kecil.",
    signals:["semua susunan", "pilih atau tidak", "N ≤ 20", "permutasi", "constraint satisfaction"],
    when:"Jumlah kombinasi masih masuk akal atau pruning dapat memangkas besar-besaran.",
    math:"Pohon keputusan; kompleksitas sering O(2ᴺ), O(N!), atau bercabang b^depth.",
    story:"Mencoba semua subset pada subsoal kecil untuk menemukan pola sebelum solusi penuh.",
    code:cpp(`void dfs(int i) {
    if (i == n) { evaluate(); return; }
    choose(i); dfs(i + 1); undo(i);
    dfs(i + 1);
}`),
    complexity:"Eksponensial; hanya aman untuk batas kecil.",
    pitfalls:["Tidak mengembalikan state saat backtrack.","Menggunakan brute force untuk N besar tanpa pruning."],
    osn:"Berguna untuk subsoal mudah 2025 D (N≤16) dan validasi solusi."
  },
  {
    id:"dfs-components", icon:"DFS", title:"DFS & Connected Components", category:"Graf", level:"Menengah",
    tagline:"Menjelajah semua node yang terhubung dari satu titik.",
    signals:["hubungan teman", "dapat mencapai", "kelompok terhubung", "menyebar transitif"],
    when:"Graf statis dan kita perlu komponen, cycle, traversal, atau subtree.",
    math:"Relasi transitif membentuk connected component; semua node di komponen dapat saling mencapai.",
    story:"Jika gosip menyebar melalui teman-teman, semua bebek dalam komponen harus mendapat jenis gulali sama.",
    code:cpp(`void dfs(int u) {
    vis[u] = true;
    component.push_back(u);
    for (int v : adj[u]) if (!vis[v]) dfs(v);
}`),
    complexity:"O(V+E).",
    pitfalls:["Stack overflow pada graf rantai besar; gunakan iterative DFS.","Graf tak berarah perlu menghindari parent saat deteksi cycle."],
    osn:"2024 E dapat diselesaikan dengan DFS component atau DSU."
  },
  {
    id:"dsu", icon:"∪", title:"DSU / Union-Find", category:"Graf", level:"Menengah",
    tagline:"Menggabungkan komponen dan menjawab apakah dua node satu kelompok.",
    signals:["hubungan ditambahkan", "kelompok", "komponen", "union", "connectivity"],
    when:"Kita hanya butuh informasi komponen, bukan jalur detail.",
    math:"parent[root]=root; union by size + path compression membuat operasi nyaris O(1).",
    story:"Setiap pasangan gosip menggabungkan dua kelompok bebek.",
    code:cpp(`struct DSU {
    vector<int> p, sz;
    DSU(int n): p(n), sz(n,1) { iota(p.begin(), p.end(), 0); }
    int find(int x){ return p[x]==x ? x : p[x]=find(p[x]); }
    void unite(int a,int b){
        a=find(a); b=find(b); if(a==b) return;
        if(sz[a]<sz[b]) swap(a,b);
        p[b]=a; sz[a]+=sz[b];
    }
};`),
    complexity:"Amortized O(α(N)) per operasi.",
    pitfalls:["Tidak memanggil find sebelum memakai root.","Mengira DSU bisa menjawab shortest path."],
    osn:"2024 E Gosip Gulali."
  },
  {
    id:"dijkstra", icon:"d+", title:"Dijkstra", category:"Graf", level:"Lanjut",
    tagline:"Shortest path pada graf berbobot non-negatif.",
    signals:["biaya minimum", "bobot positif", "jarak terpendek", "rute termurah"],
    when:"Graf memiliki bobot berbeda tetapi semuanya ≥ 0.",
    math:"Saat node u keluar dari min-heap dengan jarak terkecil, dist[u] sudah final.",
    story:"Mencari jalur paling tidak becek pada grid umum berbobot.",
    code:cpp(`using P = pair<long long,int>;
priority_queue<P, vector<P>, greater<P>> pq;
vector<long long> dist(n, INF);
dist[s]=0; pq.push({0,s});
while(!pq.empty()){
    auto [du,u]=pq.top(); pq.pop();
    if(du!=dist[u]) continue;
    for(auto [v,w]:adj[u]) if(dist[v]>du+w){
        dist[v]=du+w; pq.push({dist[v],v});
    }
}`),
    complexity:"O((V+E) log V).",
    pitfalls:["Ada bobot negatif.","Lupa stale entry check.","Menggunakan BFS padahal bobot tidak sama."],
    osn:"Konsep umum; 2025 F memakai shortest path khusus strip lebar 2 yang bisa dipercepat menjadi DP O(N)."
  },
  {
    id:"topological", icon:"DAG", title:"Topological Sort", category:"Graf", level:"Lanjut",
    tagline:"Urutan kerja pada graf berarah tanpa siklus.",
    signals:["prasyarat", "sebelum sesudah", "dependency", "DAG"],
    when:"Setiap tugas memiliki dependency dan kita perlu urutan valid atau DP pada DAG.",
    math:"Node indegree 0 dapat diproses; hapus efeknya dan ulangi.",
    story:"Modul belajar tertentu harus diselesaikan sebelum modul lanjutan.",
    code:cpp(`queue<int> q;
for(int i=0;i<n;++i) if(indeg[i]==0) q.push(i);
while(!q.empty()){
    int u=q.front(); q.pop(); order.push_back(u);
    for(int v:adj[u]) if(--indeg[v]==0) q.push(v);
}
if((int)order.size()!=n) cout << "cycle";`),
    complexity:"O(V+E).",
    pitfalls:["Graf memiliki siklus.","Mencampur indegree asli setelah dimodifikasi."],
    osn:"Materi graf lanjutan; belum muncul langsung pada 12 studi kasus."
  },
  {
    id:"mst", icon:"MST", title:"Minimum Spanning Tree", category:"Graf", level:"Lanjut",
    tagline:"Menghubungkan semua node dengan total biaya edge minimum.",
    signals:["hubungkan semua kota", "biaya kabel minimum", "tanpa harus mempertahankan semua jalan"],
    when:"Yang dicari jaringan penghubung semua node, bukan jalur satu sumber ke tujuan.",
    math:"Kruskal memilih edge termurah yang tidak membentuk siklus, dibantu DSU.",
    story:"Menghubungkan semua sekolah dengan kabel total minimum.",
    code:cpp(`sort(edges.begin(), edges.end());
DSU dsu(n); long long ans=0;
for(auto [w,u,v]:edges){
    if(dsu.find(u)!=dsu.find(v)){
        dsu.unite(u,v); ans+=w;
    }
}`),
    complexity:"O(E log E).",
    pitfalls:["Salah memakai MST untuk shortest path.","Graf tidak terhubung menghasilkan forest."],
    osn:"Materi lanjutan setelah DSU."
  },
  {
    id:"dp-intro", icon:"dp", title:"Dynamic Programming 1D", category:"Dynamic Programming", level:"Menengah",
    tagline:"Simpan jawaban submasalah agar tidak dihitung ulang.",
    signals:["banyak cara", "nilai optimal prefix", "pilihan berulang", "state", "transisi"],
    when:"Solusi dapat dipecah menjadi submasalah tumpang tindih dan memiliki optimal substructure.",
    math:"dp[state] = kombinasi terbaik dari state sebelumnya yang valid.",
    story:"Banyak cara memotong string menjadi token valid atau maksimum jumlah grup pada prefix.",
    code:cpp(`vector<long long> dp(n + 1, INF);
dp[0] = 0;
for (int i = 1; i <= n; ++i) {
    for (int choice : choices(i)) {
        dp[i] = min(dp[i], dp[previous(i, choice)] + cost(choice));
    }
}`),
    complexity:"Jumlah state × jumlah transisi per state.",
    pitfalls:["State tidak cukup informasi.","Urutan perhitungan tidak memenuhi dependency.","Tidak mendefinisikan base case."],
    osn:"2024 D; 2025 E; konsep inti 2025 F."
  },
  {
    id:"grid-dp", icon:"▦", title:"Grid DP & State Compression", category:"Dynamic Programming", level:"Lanjut",
    tagline:"Saat salah satu dimensi kecil, simpan keadaan per kolom/baris.",
    signals:["grid 2×N", "bergerak antar sel", "state per kolom", "lebar kecil"],
    when:"Grid sangat panjang tetapi lebarnya kecil, sehingga konfigurasi lokal dapat diringkas.",
    math:"State kolom j menyimpan biaya minimum untuk setiap konfigurasi boundary.",
    story:"Pekarangan hanya 2 baris; shortest path di suffix cukup menyimpan jarak top dan bottom.",
    code:cpp(`long long top = baseTop, bottom = INF;
for (int j = start + 1; j <= n; ++j) {
    long long nt = min(top + w[0][j], bottom + w[1][j] + w[0][j]);
    long long nb = min(bottom + w[1][j], top + w[0][j] + w[1][j]);
    top = nt; bottom = nb;
}`),
    complexity:"Sering O(N × jumlah_state²); untuk 2 state menjadi O(N).",
    pitfalls:["Update in-place memakai nilai yang sudah berubah.","State boundary tidak menangkap larangan global."],
    osn:"2025 F Kandang Ayam Kandang Bebek."
  },
  {
    id:"knapsack", icon:"🎒", title:"Knapsack DP", category:"Dynamic Programming", level:"Menengah",
    tagline:"Pilih item di bawah batas kapasitas untuk memaksimalkan nilai.",
    signals:["kapasitas", "pilih barang", "setiap item sekali", "maksimum nilai"],
    when:"Ada pilihan take/skip dengan resource diskret yang terbatas.",
    math:"dp[w] = nilai maksimum dengan kapasitas w; iterasi w mundur untuk 0/1 knapsack.",
    story:"Memilih komponen robot dengan batas anggaran dan skor manfaat.",
    code:cpp(`vector<long long> dp(W + 1, 0);
for (auto [weight, value] : items)
    for (int w = W; w >= weight; --w)
        dp[w] = max(dp[w], dp[w - weight] + value);`),
    complexity:"O(NW).",
    pitfalls:["W terlalu besar.","Iterasi maju mengubah 0/1 menjadi unbounded knapsack."],
    osn:"Materi DP klasik untuk membangun intuisi state dan transisi."
  },
  {
    id:"lis", icon:"↗", title:"Longest Increasing Subsequence", category:"Dynamic Programming", level:"Lanjut",
    tagline:"Subsequence naik terpanjang dalam O(N log N).",
    signals:["urutan dipertahankan", "subsequence naik", "hapus elemen minimum agar terurut"],
    when:"Objek tidak harus kontigu dan syaratnya monoton naik/turun.",
    math:"tails[len] menyimpan nilai akhir terkecil untuk subsequence panjang len+1.",
    story:"Pilih sebanyak mungkin nilai sensor dengan urutan waktu tetap dan nilai terus meningkat.",
    code:cpp(`vector<int> tails;
for (int x : a) {
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) tails.push_back(x);
    else *it = x;
}
cout << tails.size();`),
    complexity:"O(N log N).",
    pitfalls:["tails bukan subsequence aktual.","lower_bound vs upper_bound untuk strictly/non-decreasing."],
    osn:"Memperluas konsep subsequence pada 2024 A dan 2025 A."
  },
  {
    id:"string-segmentation", icon:"a|bc", title:"String Segmentation DP", category:"Dynamic Programming", level:"Menengah",
    tagline:"Hitung cara memotong string menjadi token valid.",
    signals:["banyak cara membaca string", "gabungan token", "parse", "tanpa leading zero"],
    when:"Setiap prefix dapat dibentuk dari pilihan token yang berakhir pada posisi tertentu.",
    math:"dp[i] = jumlah cara membentuk prefix panjang i; untuk token valid Y[i..j], dp[j+1]+=dp[i].",
    story:"Output kalkulator adalah gabungan representasi desimal digit basis B.",
    code:cpp(`dp[0] = 1;
for (int i = 0; i < n; ++i) if (dp[i]) {
    long long value = 0;
    for (int j = i; j < n && j - i < maxLen; ++j) {
        if (j > i && s[i] == '0') break;
        value = value * 10 + (s[j] - '0');
        if (value >= B) break;
        dp[j + 1] = (dp[j + 1] + dp[i]) % MOD;
    }
}`),
    complexity:"O(N × panjang token maksimum).",
    pitfalls:["Leading zero.","Token 0 harus tetap valid.","Menghasilkan nilai ≥ B."],
    osn:"2024 D Kalkulator Pengubah Basis."
  },
  {
    id:"bitmask", icon:"101", title:"Bitmask & Bitmask DP", category:"Dynamic Programming", level:"Lanjut",
    tagline:"Representasikan subset dengan bit ketika N kecil.",
    signals:["N ≤ 20", "subset", "semua kombinasi", "state pilihan elemen"],
    when:"Jumlah objek kecil, tetapi relasi antar subset kompleks.",
    math:"mask memiliki bit i=1 jika objek i dipilih; total state 2ᴺ.",
    story:"Mencoba subset titik yang sudah dikunjungi pada Traveling Salesman kecil.",
    code:cpp(`int total = 1 << n;
vector<long long> dp(total, INF);
dp[0] = 0;
for (int mask = 0; mask < total; ++mask) {
    for (int i = 0; i < n; ++i) if (!(mask >> i & 1)) {
        int next = mask | (1 << i);
        dp[next] = min(dp[next], dp[mask] + cost(mask, i));
    }
}`),
    complexity:"O(2ᴺ × N) atau lebih.",
    pitfalls:["Shift overflow.","Memakai untuk N=50.","State terlalu besar di memori."],
    osn:"Pola umum untuk subsoal kecil dan soal nasional lanjutan."
  },
  {
    id:"modulo-divisor", icon:"%", title:"Modulo & Enumerasi Divisor", category:"Teori Bilangan", level:"Menengah",
    tagline:"Sisa pembagian sering berubah menjadi hubungan divisibility.",
    signals:["sisa pembagian", "dibagi rata", "habis membagi", "berapa banyak faktor"],
    when:"Cerita membagikan objek sama rata atau mencari semua pembagi yang memenuhi syarat.",
    math:"C mod n = D ⇔ C = qn + D, D < n, sehingga n | (C−D).",
    story:"Jumlah bebek adalah pembagi C−D yang lebih besar daripada sisa D.",
    code:cpp(`for (long long d = 1; d * d <= x; ++d) {
    if (x % d != 0) continue;
    check(d);
    if (d * d != x) check(x / d);
}`),
    complexity:"O(√X).",
    pitfalls:["Lupa syarat remainder < divisor.","Menghitung akar kuadrat dua kali.","d*d overflow."],
    osn:"2024 B Berbagi Banyak Candil."
  },
  {
    id:"gcd-lcm", icon:"gcd", title:"GCD, LCM, dan Euclid", category:"Teori Bilangan", level:"Dasar",
    tagline:"Fondasi pembagian, periode, dan sinkronisasi.",
    signals:["faktor persekutuan", "periode bertemu", "rasio disederhanakan", "kelipatan minimum"],
    when:"Masalah melibatkan pembagi bersama atau perulangan periodik.",
    math:"gcd(a,b)=gcd(b,a mod b); lcm(a,b)=a/gcd(a,b)×b.",
    story:"Dua lampu berkedip tiap a dan b detik; bertemu lagi setelah lcm(a,b).",
    code:cpp(`long long g = std::gcd(a, b);
long long l = a / g * b; // bagi dulu agar lebih aman dari overflow`),
    complexity:"O(log min(a,b)).",
    pitfalls:["Mengalikan a*b sebelum membagi.","Tidak menangani nol sesuai definisi masalah."],
    osn:"Materi dasar teori bilangan sebelum faktor dan modulo."
  },
  {
    id:"sieve", icon:"prime", title:"Sieve of Eratosthenes", category:"Teori Bilangan", level:"Menengah",
    tagline:"Menandai semua bilangan prima sampai batas N.",
    signals:["banyak query prima", "semua prima sampai N", "faktor terkecil"],
    when:"Batas maksimum cukup kecil dan kita butuh informasi prima berulang kali.",
    math:"Kelipatan p mulai p² ditandai komposit.",
    story:"Menyiapkan daftar tipe telur prima untuk banyak kasus uji kecil.",
    code:cpp(`vector<bool> prime(n + 1, true);
prime[0] = prime[1] = false;
for (int p = 2; p * p <= n; ++p)
    if (prime[p])
        for (int x = p * p; x <= n; x += p)
            prime[x] = false;`),
    complexity:"O(N log log N), memori O(N).",
    pitfalls:["p*p overflow untuk batas sangat besar.","Sieve sampai 10¹² jelas tidak masuk akal."],
    osn:"Pelengkap 2025 C; untuk satu N sampai 10¹² lebih cocok trial division."
  },
  {
    id:"factorization", icon:"pᵃ", title:"Prime Factorization & Fungsi Divisor", category:"Teori Bilangan", level:"Menengah",
    tagline:"Ubah bilangan menjadi produk prima untuk membaca struktur pembaginya.",
    signals:["faktor prima", "jumlah pembagi", "N sampai 10^12", "kemasan s×t"],
    when:"Jawaban tergantung eksponen faktor prima atau jumlah divisor.",
    math:"N=∏pᵢ^{aᵢ}; τ(N)=∏(aᵢ+1).",
    story:"Jumlah pasangan (s,t) dengan s×t=T sama dengan jumlah divisor T.",
    code:cpp(`vector<pair<long long,int>> fac;
for (long long p = 2; p * p <= n; ++p) {
    if (n % p) continue;
    int e = 0;
    while (n % p == 0) n /= p, ++e;
    fac.push_back({p, e});
}
if (n > 1) fac.push_back({n, 1});`),
    complexity:"O(√N) trial division.",
    pitfalls:["Lupa sisa prima >1.","Memodifikasi N lalu masih membutuhkan nilai aslinya."],
    osn:"2025 C Balada Kemasan Telur."
  },
  {
    id:"fast-power", icon:"aⁿ", title:"Fast Exponentiation & Modulo", category:"Teori Bilangan", level:"Menengah",
    tagline:"Menghitung a^b dalam log b langkah.",
    signals:["pangkat besar", "modulo 1e9+7", "eksponen sampai 10^18"],
    when:"Perkalian berulang terlalu banyak dan operasi bersifat asosiatif.",
    math:"Jika b genap: a^b=(a²)^{b/2}; jika ganjil kalikan satu a.",
    story:"Menghitung jumlah kombinasi atau transisi matriks berulang dalam modulo.",
    code:cpp(`long long modpow(long long a, long long e, long long mod) {
    long long r = 1;
    while (e) {
        if (e & 1) r = (__int128)r * a % mod;
        a = (__int128)a * a % mod;
        e >>= 1;
    }
    return r;
}`),
    complexity:"O(log e).",
    pitfalls:["Overflow sebelum modulo.","Modular division tidak sama dengan pembagian biasa."],
    osn:"2024 D menggunakan modulo, walau tidak memerlukan exponentiation."
  },
  {
    id:"fenwick", icon:"BIT", title:"Fenwick Tree", category:"Struktur Data", level:"Lanjut",
    tagline:"Prefix sum dinamis dengan kode ringkas.",
    signals:["update titik", "query jumlah prefix", "banyak operasi online"],
    when:"Butuh point update dan range sum berulang dengan data berubah.",
    math:"Indeks bergerak memakai lowbit i&−i.",
    story:"Skor siswa diperbarui dan ditanya jumlah skor per rentang berkali-kali.",
    code:cpp(`struct BIT {
    int n; vector<long long> bit;
    BIT(int n): n(n), bit(n+1) {}
    void add(int i,long long v){ for(;i<=n;i+=i&-i) bit[i]+=v; }
    long long sum(int i){ long long r=0; for(;i;i-=i&-i) r+=bit[i]; return r; }
    long long range(int l,int r){ return sum(r)-sum(l-1); }
};`),
    complexity:"O(log N) update/query, memori O(N).",
    pitfalls:["Indeks 0 menyebabkan loop macet.","Sulit untuk operasi selain yang punya invers."],
    osn:"Materi struktur data lanjut; alternatif untuk query dinamis."
  },
  {
    id:"segment-tree", icon:"SEG", title:"Segment Tree", category:"Struktur Data", level:"Lanjut",
    tagline:"Query dan update rentang untuk operasi seperti min, max, sum.",
    signals:["range maximum", "data berubah", "DP butuh maksimum interval", "lazy propagation"],
    when:"Fenwick tidak cukup atau operasi range lebih umum.",
    math:"Setiap node menyimpan agregat interval; gabungan dua anak membentuk parent.",
    story:"DP bambu meminta max dp[j] pada rentang kandidat yang berubah untuk setiap i.",
    code:cpp(`struct SegTree {
    int n; vector<int> t;
    SegTree(int n): n(n), t(4*n, -1e9) {}
    void upd(int p,int v,int x,int l,int r){
        if(l==r){ t[x]=v; return; }
        int m=(l+r)/2;
        if(p<=m) upd(p,v,2*x,l,m); else upd(p,v,2*x+1,m+1,r);
        t[x]=max(t[2*x],t[2*x+1]);
    }
    int query(int ql,int qr,int x,int l,int r){
        if(qr<l||r<ql) return -1e9;
        if(ql<=l&&r<=qr) return t[x];
        int m=(l+r)/2;
        return max(query(ql,qr,2*x,l,m),query(ql,qr,2*x+1,m+1,r));
    }
};`),
    complexity:"O(log N) query/update, memori O(N).",
    pitfalls:["Identity value salah.","Range inklusif tidak konsisten.","Lazy propagation diterapkan tanpa memahami invariant."],
    osn:"2025 E Tebas Tebang Bambu."
  },
  {
    id:"string-pattern", icon:"KMP", title:"Subsequence, KMP, dan String Pattern", category:"String", level:"Menengah",
    tagline:"Bedakan subsequence, substring, dan pattern matching—tiga hal yang sering dicampur.",
    signals:["urutan dipertahankan", "hapus beberapa karakter", "substring", "cari pola"],
    when:"Subsequence: boleh loncat, urutan tetap. Substring: harus kontigu. KMP: cari pola kontigu dengan efisien.",
    math:"Subsequence memakai indeks i₁<i₂<…; KMP memakai prefix-function untuk menghindari ulang perbandingan.",
    story:"String Cantik menghapus karakter tetapi mempertahankan urutan, sehingga greedy subsequence cocok—bukan KMP.",
    code:cpp(`// Cek apakah pattern adalah subsequence dari s
int j = 0;
for (char c : s)
    if (j < (int)pattern.size() && c == pattern[j]) ++j;
bool ok = (j == (int)pattern.size());`),
    complexity:"Subsequence scan O(N); KMP O(N+M).",
    pitfalls:["Menggunakan sliding window untuk subsequence.","Menggunakan KMP saat pola boleh loncat."],
    osn:"2024 A dan 2025 A."
  },
  {
    id:"coordinate-compression", icon:"zip", title:"Coordinate Compression", category:"Range & Sequence", level:"Menengah",
    tagline:"Nilai besar dipetakan menjadi rank kecil tanpa mengubah urutan relatif.",
    signals:["nilai sampai 1e9", "hanya urutan penting", "Fenwick/segment tree pada koordinat besar"],
    when:"Domain nilai besar tetapi jumlah nilai unik terbatas.",
    math:"rank(x)=posisi x pada daftar nilai unik terurut.",
    story:"Tingkat kemanisan sampai 1e9 tetapi hanya ada N+M nilai yang relevan.",
    code:cpp(`vector<long long> vals = a;
sort(vals.begin(), vals.end());
vals.erase(unique(vals.begin(), vals.end()), vals.end());
int rank = lower_bound(vals.begin(), vals.end(), x) - vals.begin();`),
    complexity:"O(N log N).",
    pitfalls:["Mengira jarak numerik tetap sama setelah kompresi.","Lupa unique setelah sort."],
    osn:"Pendukung banyak solusi query; 2024 E memakai sorting nilai tanpa wajib kompresi."
  },
  {
    id:"constructive", icon:"∴", title:"Constructive, Invariant, dan Rumus Tertutup", category:"Paradigma", level:"Lanjut",
    tagline:"Kadang solusi terbaik bukan simulasi, melainkan membuktikan susunan optimal lalu menulis rumus.",
    signals:["isi susunan secara optimal", "minimum mungkin", "semua angka dipakai sekali", "buktikan batas bawah"],
    when:"Kita bisa menunjukkan lower bound dan membangun contoh yang mencapai bound tersebut.",
    math:"Optimum = lower bound yang dapat dicapai konstruksi.",
    story:"Pada papan robot, jumlah jalur minimum dan sel pembanding memaksa himpunan angka tertentu; hasil menjadi jumlah bilangan segitiga.",
    code:cpp(`long long triangular(long long x) { return x * (x + 1) / 2; }
long long path = n + m - 1;
long long comparisons = min(n, m) - 1;
cout << triangular(path) + triangular(comparisons);`),
    complexity:"Sering O(1) setelah pembuktian.",
    pitfalls:["Menebak rumus dari sample tanpa bukti.","Membuktikan lower bound tetapi tidak memberi konstruksi pencapaiannya."],
    osn:"2024 F Maju Tak Papan."
  },
];

const cases = [
  {
    year:2024, code:"A", title:"String Cantik OSN", level:"Greedy + subsequence",
    signal:"Boleh menghapus karakter dan urutan karakter yang tersisa wajib dipertahankan.",
    math:"String valid periodik setiap 3 posisi: T[i] = T[i+3]. Cukup coba 6 permutasi pola O,S,N.",
    algorithm:"Untuk tiap permutasi, scan S dan ambil karakter yang sama dengan pola[cnt mod 3]. Ambil count terbesar.",
    complexity:"O(|S|)",
    source:"OSN-P 2024 halaman 1–2",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin >> s;
    string p = "NOS";
    int best = 0;
    sort(p.begin(), p.end());
    do {
        int cnt = 0;
        for(char c : s)
            if(c == p[cnt % 3]) ++cnt;
        best = max(best, cnt);
    } while(next_permutation(p.begin(), p.end()));
    cout << (best >= 3 ? best : -1) << '\n';
}`)
  },
  {
    year:2024, code:"B", title:"Berbagi Banyak Candil", level:"Modulo + divisor",
    signal:"D adalah sisa setelah C dibagi rata kepada n bebek.",
    math:"C mod n = D ⇒ n | (C−D) dan D<n. Jika D=C, semua n>C valid.",
    algorithm:"Kasus D<C: enumerasi faktor C−D sampai akar. Kasus D=C: jawab max(0,B−C).",
    complexity:"O(√C)", source:"OSN-P 2024 halaman 3–4",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
using int64 = long long;

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int64 B,C,D; cin >> B >> C >> D;
    if(D == C){ cout << max<int64>(0, B-C) << '\n'; return 0; }
    int64 x = C-D, ans = 0;
    auto valid = [&](int64 n){ return n > D && n <= B; };
    for(int64 d=1; d<=x/d; ++d){
        if(x%d) continue;
        if(valid(d)) ++ans;
        int64 e=x/d;
        if(e!=d && valid(e)) ++ans;
    }
    cout << ans << '\n';
}`)
  },
  {
    year:2024, code:"C", title:"Tebas Tebang Pohon", level:"Binary search on answer",
    signal:"Cari X paling tinggi, sedangkan menurunkan X tidak pernah mengurangi kayu.",
    math:"wood(X)=Σmax(Aᵢ−X,0). Cari max X dengan wood(X)≥M.",
    algorithm:"Check satu X dalam O(N), lalu binary search nilai X.",
    complexity:"O(N log maxA)", source:"OSN-P 2024 halaman 5–7",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
using int64 = long long;

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; int64 m; cin >> n >> m;
    vector<int64>a(n); for(auto&x:a)cin>>x;
    auto ok = [&](int64 h){
        int64 got=0;
        for(int64 x:a){
            if(x>h){ got += x-h; if(got>=m) return true; }
        }
        return false;
    };
    if(!ok(0)){ cout << -1 << '\n'; return 0; }
    int64 lo=0, hi=*max_element(a.begin(),a.end()), ans=0;
    while(lo<=hi){
        int64 mid=lo+(hi-lo)/2;
        if(ok(mid)) ans=mid, lo=mid+1;
        else hi=mid-1;
    }
    cout << ans << '\n';
}`)
  },
  {
    year:2024, code:"D", title:"Kalkulator Pengubah Basis", level:"String segmentation DP",
    signal:"Satu output string dapat dipotong menjadi beberapa digit basis dengan cara berbeda.",
    math:"Hitung segmentasi Y menjadi token d, 0≤d<B, token nonzero tanpa leading zero.",
    algorithm:"dp[i] = banyak cara membentuk prefix i. Coba token pendek dari posisi i.",
    complexity:"O(|Y| log B)", source:"OSN-P 2024 halaman 8–10",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
const int MOD=1'000'000'007;

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long B; string y; cin >> B >> y;
    int n=y.size(); vector<int> dp(n+1); dp[0]=1;
    int maxLen=to_string(B-1).size();
    for(int i=0;i<n;++i){
        if(!dp[i]) continue;
        if(y[i]=='0'){
            dp[i+1]=(dp[i+1]+dp[i])%MOD;
            continue;
        }
        long long val=0;
        for(int j=i;j<n && j-i<maxLen;++j){
            val=val*10+(y[j]-'0');
            if(val>=B) break;
            dp[j+1]=(dp[j+1]+dp[i])%MOD;
        }
    }
    cout << dp[n] << '\n';
}`)
  },
  {
    year:2024, code:"E", title:"Gosip Gulali", level:"DSU + median",
    signal:"Gosip menyebar transitif, sehingga kelompok terhubung wajib memilih nilai yang sama.",
    math:"Untuk komponen C, minimalkan Σ|Bᵢ−g| dengan g dari daftar G. Optimum dekat median.",
    algorithm:"DSU untuk komponen, sort nilai komponen dan G, cek lower_bound median dan kandidat sebelumnya.",
    complexity:"O((N+K)α(N)+N log N+M log M)", source:"OSN-P 2024 halaman 11–13",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std; using int64=long long;
struct DSU{ vector<int>p,s; DSU(int n):p(n),s(n,1){iota(p.begin(),p.end(),0);} int f(int x){return p[x]==x?x:p[x]=f(p[x]);} void u(int a,int b){a=f(a);b=f(b);if(a==b)return;if(s[a]<s[b])swap(a,b);p[b]=a;s[a]+=s[b];}};
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int N,M,K; cin>>N>>M>>K;
    vector<int64>B(N),G(M); for(auto&x:B)cin>>x; for(auto&x:G)cin>>x;
    DSU d(N); while(K--){int p,q;cin>>p>>q;d.u(--p,--q);} sort(G.begin(),G.end());
    unordered_map<int,vector<int64>> group;
    for(int i=0;i<N;++i) group[d.f(i)].push_back(B[i]);
    int64 answer=0;
    for(auto &[root,v]:group){
        sort(v.begin(),v.end()); int64 med=v[v.size()/2], best=LLONG_MAX;
        auto it=lower_bound(G.begin(),G.end(),med);
        vector<int64> cand; if(it!=G.end())cand.push_back(*it); if(it!=G.begin())cand.push_back(*prev(it));
        for(int64 g:cand){ int64 cost=0; for(int64 x:v) cost+=llabs(x-g); best=min(best,cost); }
        answer+=best;
    }
    cout<<answer<<'\n';
}`)
  },
  {
    year:2024, code:"F", title:"Maju Tak Papan", level:"Constructive + rumus",
    signal:"Semua angka 1..NM dipakai sekali dan susunan harus meminimalkan jumlah jalur robot.",
    math:"Panjang jalur L=N+M−1. Minimum perbandingan internal c=min(N,M)−1. Jawaban tri(L)+tri(c).",
    algorithm:"Buktikan lower bound, berikan konstruksi yang mencapainya, implementasi rumus O(1).",
    complexity:"O(1)", source:"OSN-P 2024 halaman 14–16",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std; using int64=long long;
int64 tri(int64 x){ return x*(x+1)/2; }
int main(){
    int64 N,M; cin>>N>>M;
    cout << tri(N+M-1) + tri(min(N,M)-1) << '\n';
}`)
  },
  {
    year:2025, code:"A", title:"String Cantik OSN-P", level:"Prefix/suffix + subsequence",
    signal:"O,S,N harus dipilih sebelum blok P; karakter lain boleh dihapus.",
    math:"Pilih split i: ambil semua O/S/N pada prefix dan semua P pada suffix, dengan ketiga OSN dan P wajib ada.",
    algorithm:"Suffix count P, scan prefix sambil menghitung O/S/N dan maksimum total valid.",
    complexity:"O(|S|)", source:"OSN-P 2025 halaman 1–2",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s; cin>>s; int n=s.size();
    vector<int>sufP(n+1); for(int i=n-1;i>=0;--i)sufP[i]=sufP[i+1]+(s[i]=='P');
    int o=0,ss=0,nn=0,osn=0,best=-1;
    for(int i=0;i<=n;++i){
        if(o&&ss&&nn&&sufP[i]) best=max(best,osn+sufP[i]);
        if(i==n)break;
        if(s[i]=='O')++o,++osn; if(s[i]=='S')++ss,++osn; if(s[i]=='N')++nn,++osn;
    }
    cout<<best<<'\n';
}`)
  },
  {
    year:2025, code:"B", title:"Gudang Penyimpanan Kardus", level:"Binary search on answer",
    signal:"Cari sisi persegi minimum yang kapasitasnya cukup; gudang lebih besar tidak pernah lebih buruk.",
    math:"capacity(S)=⌊S/P⌋×⌊S/L⌋. Cari min S dengan capacity(S)≥N.",
    algorithm:"Binary search nilai sisi; gunakan __int128 saat mengalikan kapasitas.",
    complexity:"O(log jawaban)", source:"OSN-P 2025 halaman 3–5",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std; using int64=long long;
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int64 N,P,L; cin>>N>>P>>L;
    auto ok=[&](int64 s){ return (__int128)(s/P)*(s/L)>=N; };
    int64 hi=1; while(!ok(hi)) hi*=2;
    int64 lo=0;
    while(lo<hi){ int64 mid=lo+(hi-lo)/2; if(ok(mid))hi=mid;else lo=mid+1; }
    cout<<lo<<'\n';
}`)
  },
  {
    year:2025, code:"C", title:"Balada Kemasan Telur", level:"Prime factorization",
    signal:"Tipe p harus prima dan membagi N; jumlah kemasan adalah jumlah divisor dari N×p.",
    math:"Jika N=∏pᵢ^{aᵢ}, memilih pⱼ memberi faktor kenaikan (aⱼ+2)/(aⱼ+1), terbesar saat aⱼ minimum.",
    algorithm:"Faktorkan N, pilih faktor prima dengan eksponen terkecil; tie pilih prima terkecil.",
    complexity:"O(√N)", source:"OSN-P 2025 halaman 6–8",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std; using int64=long long;
int main(){
    int64 N; cin>>N; int64 x=N, ans=-1; int bestExp=INT_MAX;
    for(int64 p=2;p<=x/p;++p){
        if(x%p)continue; int e=0; while(x%p==0)x/=p,++e;
        if(e<bestExp || (e==bestExp && p<ans)) bestExp=e,ans=p;
    }
    if(x>1){ int e=1; if(e<bestExp || (e==bestExp && x<ans)) ans=x; }
    cout<<ans<<'\n';
}`)
  },
  {
    year:2025, code:"D", title:"Telur Kemasan Balado", level:"RLE + greedy",
    signal:"Semua A harus ditutup oleh paling banyak K interval; interval boleh mengorbankan B di antara blok A.",
    math:"Ada R blok A. Untuk turun menjadi K interval, gabungkan R−K pasangan blok dengan biaya panjang gap B internal.",
    algorithm:"Kompres run, sort gap B internal, kurangi total B dengan gap terkecil yang harus dikorbankan.",
    complexity:"O(N log N)", source:"OSN-P 2025 halaman 9–11",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int N; long long K; string s; cin>>N>>K>>s;
    int totalB=count(s.begin(),s.end(),'B');
    vector<pair<char,int>> runs;
    for(char c:s){ if(runs.empty()||runs.back().first!=c)runs.push_back({c,1});else runs.back().second++; }
    int blocksA=0; for(auto [c,len]:runs)blocksA+=(c=='A');
    if(K>=blocksA){cout<<totalB<<'\n';return 0;}
    vector<int> gaps;
    for(int i=1;i+1<(int)runs.size();++i)
        if(runs[i].first=='B'&&runs[i-1].first=='A'&&runs[i+1].first=='A')gaps.push_back(runs[i].second);
    sort(gaps.begin(),gaps.end()); int lose=0, need=blocksA-(int)K;
    for(int i=0;i<need;++i)lose+=gaps[i];
    cout<<totalB-lose<<'\n';
}`)
  },
  {
    year:2025, code:"E", title:"Tebas Tebang Bambu", level:"Sort + partition DP + segment tree",
    signal:"Semua bambu harus dipartisi menjadi grup valid; ukuran grup minimal M dan ingin jumlah grup maksimum.",
    math:"Setelah sort, grup [l,r] valid jika A[r]−A[l]≤K dan M≤size≤2M−1. dp[i]=1+max dp[j] pada rentang valid.",
    algorithm:"Sort, cari batas nilai dengan lower_bound, query maksimum dp[j] memakai segment tree.",
    complexity:"O(N log N)", source:"OSN-P 2025 halaman 12–14",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std;
const int NEG=-1e9;
struct Seg{int n;vector<int>t;Seg(int n):n(n),t(4*(n+1),NEG){} void up(int p,int v,int x,int l,int r){if(l==r){t[x]=v;return;}int m=(l+r)/2;if(p<=m)up(p,v,2*x,l,m);else up(p,v,2*x+1,m+1,r);t[x]=max(t[2*x],t[2*x+1]);} int qu(int ql,int qr,int x,int l,int r){if(qr<l||r<ql)return NEG;if(ql<=l&&r<=qr)return t[x];int m=(l+r)/2;return max(qu(ql,qr,2*x,l,m),qu(ql,qr,2*x+1,m+1,r));}};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int N,M; long long K; cin>>N>>M>>K; vector<long long>a(N+1);for(int i=1;i<=N;++i)cin>>a[i];sort(a.begin()+1,a.end());
    vector<int>dp(N+1,NEG);dp[0]=0;Seg st(N);st.up(0,0,1,0,N);
    for(int i=1;i<=N;++i){
        int pos=lower_bound(a.begin()+1,a.begin()+i+1,a[i]-K)-a.begin();
        int L=max({0,i-(2*M-1),pos-1}), R=i-M;
        if(L<=R){int best=st.qu(L,R,1,0,N);if(best>NEG)dp[i]=best+1;}
        st.up(i,dp[i],1,0,N);
    }
    cout<<(dp[N]<0?-1:dp[N])<<'\n';
}`)
  },
  {
    year:2025, code:"F", title:"Kandang Ayam Kandang Bebek", level:"Non-crossing + 2-state shortest path",
    signal:"Dua spesies menuju dua pintu pada grid 2×N dan tidak boleh memakai petak yang sama.",
    math:"Sampai R=min(lastA,lastB), ayam wajib di baris atas dan bebek di bawah. Setelah R, hanya spesies yang lebih jauh memakai suffix dua baris.",
    algorithm:"Cek feasibility prefix, hitung prefix cost, lalu DP shortest path top/bottom pada suffix untuk spesies yang memanjang lebih jauh.",
    complexity:"O(N)", source:"OSN-P 2025 halaman 15–19",
    solution:cpp(`#include <bits/stdc++.h>
using namespace std; using int64=long long; const int64 INF=4'000'000'000'000'000'000LL;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int N;cin>>N;string s[2];cin>>s[0]>>s[1];vector<vector<int64>>w(2,vector<int64>(N+1));
    for(int r=0;r<2;++r)for(int j=1;j<=N;++j)cin>>w[r][j];
    int lastA=0,lastB=0;for(int r=0;r<2;++r)for(int j=1;j<=N;++j){if(s[r][j-1]=='A')lastA=max(lastA,j);if(s[r][j-1]=='B')lastB=max(lastB,j);} int R=min(lastA,lastB);
    for(int j=1;j<=R;++j)if(s[0][j-1]=='B'||s[1][j-1]=='A'){cout<<-1<<'\n';return 0;}
    vector<int64>pt(N+1),pb(N+1);for(int j=1;j<=N;++j)pt[j]=pt[j-1]+w[0][j],pb[j]=pb[j-1]+w[1][j];
    vector<int64>a0(N+1,INF),a1(N+1,INF),b0(N+1,INF),b1(N+1,INF);
    if(lastA>R){a0[R]=pt[R];for(int j=R+1;j<=N;++j){int64 p0=a0[j-1],p1=a1[j-1];a0[j]=min(p0+w[0][j],p1+w[1][j]+w[0][j]);a1[j]=min(p1+w[1][j],p0+w[0][j]+w[1][j]);}}
    if(lastB>R){b1[R]=pb[R];for(int j=R+1;j<=N;++j){int64 p0=b0[j-1],p1=b1[j-1];b0[j]=min(p0+w[0][j],p1+w[1][j]+w[0][j]);b1[j]=min(p1+w[1][j],p0+w[0][j]+w[1][j]);}}
    int64 ans=0;for(int r=0;r<2;++r)for(int j=1;j<=N;++j){char c=s[r][j-1];if(c=='A')ans+=(j<=R?pt[j]:(r?a1[j]:a0[j]));if(c=='B')ans+=(j<=R?pb[j]:(r?b1[j]:b0[j]));}
    cout<<ans<<'\n';
}`)
  },
];

const signals = [
  ["‘urutan tetap’, ‘hapus beberapa elemen’", "Subsequence / greedy / DP", "Bedakan dari substring yang wajib kontigu."],
  ["‘rentang berurutan’, ‘subarray terpanjang’", "Sliding window / two pointers", "Cek apakah validitas monoton saat pointer digeser."],
  ["‘nilai maksimum yang masih memenuhi’", "Binary search on answer", "Buktikan predikat monoton dahulu."],
  ["‘banyak cara’, ‘jumlah kemungkinan’", "Counting DP / kombinatorika", "Tentukan state prefix dan hindari hitung ganda."],
  ["‘hubungan menyebar melalui teman’", "Connected components / DSU", "Relasi transitif adalah clue besar."],
  ["‘sisa pembagian’, ‘dibagi rata’", "Modulo / divisor", "Tulis C = qn + D dan syarat D<n."],
  ["‘nilai sama setelah dipangkas’", "Sort + interval/grouping", "Cari irisan rentang nilai yang mungkin."],
  ["‘biaya minimum pada graf berbobot positif’", "Dijkstra / DP khusus", "Manfaatkan bentuk graf kecil jika ada."],
  ["‘N ≤ 20’, ‘semua subset’", "Bitmask / backtracking", "2^N mungkin; N² belum tentu isu utama."],
  ["‘update rentang’, ‘query banyak kali’", "Difference/Fenwick/segment tree", "Pilih berdasarkan online/offline dan jenis operasi."],
  ["‘semua angka 1..K dipakai tepat sekali’", "Constructive / invariant", "Cari lower bound lalu bangun konstruksi."],
  ["‘jumlah pembagi’, ‘kemasan s×t’", "Prime factorization", "Gunakan τ(N)=∏(aᵢ+1)."],
];

const keywordMap = {
  "binary-answer": ["maksimum", "minimum", "setidaknya", "paling tinggi", "paling kecil", "masih memenuhi", "monoton", "jika x", "batas"],
  "dsu": ["hubungan", "teman", "gosip", "terhubung", "kelompok", "transitif", "komponen"],
  "dp-intro": ["banyak cara", "jumlah kemungkinan", "optimal", "prefix", "pilihan", "state", "transisi"],
  "string-segmentation": ["string", "potong", "token", "digit", "leading zero", "parse", "gabungan"],
  "string-pattern": ["urutan tetap", "hapus beberapa", "subsequence", "karakter", "string"],
  "modulo-divisor": ["sisa", "dibagi rata", "modulo", "habis membagi", "faktor", "pembagi"],
  "factorization": ["prima", "jumlah pembagi", "faktor prima", "kemasan", "s kali t"],
  "greedy": ["pilih terkecil", "pilih terbesar", "sebanyak mungkin", "korbankan", "lokal"],
  "prefix-sum": ["jumlah rentang", "prefix", "suffix", "dari l sampai r", "akumulasi"],
  "two-pointers": ["subarray", "rentang terpanjang", "selisih maksimum minimum", "jendela"],
  "rle": ["blok", "berurutan", "rentang dihapus", "a dan b", "pergantian"],
  "dfs-components": ["graf", "mencapai", "menyebar", "jalan", "connected"],
  "dijkstra": ["biaya minimum", "jarak terpendek", "bobot", "rute termurah", "positif"],
  "grid-dp": ["grid 2", "dua baris", "per kolom", "atas bawah", "petak"],
  "segment-tree": ["range maximum", "maksimum rentang", "update dan query", "segment tree"],
  "constructive": ["isi semua angka", "tepat satu kali", "susunan optimal", "minimum mungkin", "konstruksi"],
  "std-sort": ["urutkan", "median", "nilai berdekatan", "setelah diurutkan"],
  "sliding-window": ["substring", "subarray", "paling panjang", "maksimal k"],
};

const samples = {
  binary:"Pak Dengklek ingin memilih tinggi maksimum X. Jika X dipakai, total kayu harus setidaknya M. Ketika X diperkecil, jumlah kayu tidak pernah berkurang.",
  graph:"Ada K hubungan pertemanan. Jika A berteman dengan B dan B dengan C, informasi akan menyebar sehingga A dan C masuk kelompok yang sama.",
  dp:"Diberikan string angka. Hitung banyak cara memotong string tersebut menjadi token valid, dan keluarkan jawabannya modulo 1.000.000.007.",
  string:"Boleh menghapus beberapa karakter, tetapi urutan karakter yang tidak dihapus harus tetap sama. Cari subsequence terpanjang yang mengikuti pola tertentu."
};

function renderPipeline(){
  $("#pipelineCards").innerHTML = pipeline.map((x,i)=>`<article class="pipeline-step"><b>${i+1}</b><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></article>`).join("");
}

function renderRoadmap(){
  const saved = JSON.parse(localStorage.getItem("osn-roadmap") || "{}");
  $("#roadmapGrid").innerHTML = roadmap.map((r,ri)=>`<article class="roadmap-level"><small>${r.level}</small><h3>${r.title}</h3>${r.items.map((it,ii)=>{
    const key=`${ri}-${ii}`; return `<label class="roadmap-item"><input type="checkbox" data-roadmap="${key}" ${saved[key]?"checked":""}><span>${esc(it)}</span></label>`;
  }).join("")}</article>`).join("");
  $$('[data-roadmap]').forEach(el=>el.addEventListener('change',()=>{
    const state={}; $$('[data-roadmap]').forEach(x=>state[x.dataset.roadmap]=x.checked); localStorage.setItem('osn-roadmap',JSON.stringify(state));
  }));
}

function algoCard(a){
  const done = JSON.parse(localStorage.getItem("osn-done") || "{}")[a.id];
  return `<details class="algorithm-card" data-id="${a.id}" data-category="${esc(a.category)}" data-level="${a.level}">
    <summary class="algorithm-summary"><span class="algo-icon">${esc(a.icon)}</span><div class="algo-title"><h3>${esc(a.title)}</h3><p>${esc(a.tagline)}</p><div class="algo-meta"><span class="badge">${esc(a.category)}</span><span class="badge level-${a.level}">${a.level}</span><span class="badge">${esc(a.complexity)}</span></div></div></summary>
    <div class="algorithm-body">
      <section class="algo-section"><h4>Dipakai kapan</h4><p>${esc(a.when)}</p></section>
      <section class="algo-section"><h4>Ciri bahasa soal</h4><div class="reason-tags">${a.signals.map(x=>`<span>${esc(x)}</span>`).join("")}</div></section>
      <section class="algo-section"><h4>Bahasa matematika</h4><div class="math-box">${esc(a.math)}</div></section>
      <section class="algo-section"><h4>Studi kasus sederhana</h4><p>${esc(a.story)}</p></section>
      <section class="algo-section"><h4>Template C++</h4><div class="code-wrap"><button class="copy-code" type="button">Salin</button><pre class="code-block">${esc(a.code)}</pre></div></section>
      <section class="algo-section"><h4>Kompleksitas</h4><p>${esc(a.complexity)}</p></section>
      <section class="algo-section"><h4>Jebakan umum</h4><ul>${a.pitfalls.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>
      <section class="algo-section"><h4>Hubungan ke OSN-P</h4><p>${esc(a.osn)}</p></section>
      <label class="complete-row"><input type="checkbox" class="done-check" data-done="${a.id}" ${done?"checked":""}> Tandai materi ini sudah dipahami</label>
    </div>
  </details>`;
}

function renderAlgorithms(){
  const query=$("#librarySearch").value.trim().toLowerCase();
  const category=$("#categoryFilter").value;
  const level=$("#levelFilter").value;
  const filtered=algorithms.filter(a=>{
    const hay=[a.title,a.category,a.level,a.tagline,a.when,a.math,a.story,...a.signals,a.osn].join(' ').toLowerCase();
    return (!query||hay.includes(query))&&(category==='all'||a.category===category)&&(level==='all'||a.level===level);
  });
  $("#algorithmGrid").innerHTML=filtered.map(algoCard).join('') || `<div class="card" style="padding:28px">Materi tidak ditemukan. Coba kata kunci yang lebih umum.</div>`;
  $("#libraryStats").innerHTML=`<span>${filtered.length} materi tampil</span><span>${algorithms.length} total modul</span><span>Filter: ${esc(category==='all'?'semua kategori':category)}</span>`;
  bindCopyButtons(); bindDone();
}

function bindDone(){
  $$('.done-check').forEach(el=>el.addEventListener('change',()=>{
    const state=JSON.parse(localStorage.getItem('osn-done')||'{}'); state[el.dataset.done]=el.checked; localStorage.setItem('osn-done',JSON.stringify(state)); toast(el.checked?'Materi ditandai selesai':'Tanda selesai dihapus');
  }));
}

function bindCopyButtons(){
  $$('.copy-code').forEach(btn=>btn.addEventListener('click', async e=>{
    e.preventDefault(); e.stopPropagation();
    const text=btn.nextElementSibling.textContent;
    try{await navigator.clipboard.writeText(text);toast('Kode disalin');}catch{toast('Browser menolak clipboard');}
  }));
}

function populateFilters(){
  const categories=[...new Set(algorithms.map(x=>x.category))].sort();
  $("#categoryFilter").innerHTML='<option value="all">Semua kategori</option>'+categories.map(x=>`<option>${esc(x)}</option>`).join('');
}

function renderCases(year='all'){
  const selected=cases.filter(c=>year==='all'||String(c.year)===String(year));
  $("#caseGrid").innerHTML=selected.map(c=>`<article class="case-card">
    <div class="case-head"><div class="case-kicker"><span>${c.year} · Soal ${c.code}</span><span>${esc(c.level)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.source)}</p></div>
    <div class="case-body"><div class="translation-flow">
      <div class="flow-step"><b>Kalimat kunci</b><span>${esc(c.signal)}</span></div>
      <div class="flow-step"><b>Bahasa matematika</b><span>${esc(c.math)}</span></div>
      <div class="flow-step"><b>Algoritma</b><span>${esc(c.algorithm)}</span></div>
      <div class="flow-step"><b>Kompleksitas</b><span>${esc(c.complexity)}</span></div>
    </div>
    <details class="case-code"><summary class="secondary-button">Lihat solusi C++</summary><div class="code-wrap" style="margin-top:10px"><button class="copy-code" type="button">Salin</button><pre class="code-block">${esc(c.solution)}</pre></div></details></div>
  </article>`).join('');
  bindCopyButtons();
}

function renderSignals(){
  $("#signalTable").innerHTML=`<div class="signal-row head"><span>Kalimat soal</span><span>Kandidat algoritma</span><span>Pertanyaan verifikasi</span></div>`+signals.map(r=>`<div class="signal-row"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span><span>${esc(r[2])}</span></div>`).join('');
}

function analyzeProblem(){
  const text=$("#problemText").value.trim().toLowerCase();
  if(!text){toast('Masukkan potongan soal dulu');return;}
  const scored=[];
  for(const [id,words] of Object.entries(keywordMap)){
    const found=words.filter(w=>text.includes(w));
    if(found.length){
      const a=algorithms.find(x=>x.id===id); if(a) scored.push({a,found,score:found.reduce((s,w)=>s+(w.split(' ').length+1),0)});
    }
  }
  scored.sort((x,y)=>y.score-x.score);
  const output=$("#recommendationList");
  if(!scored.length){
    output.className='recommendation-list empty-state';
    output.innerHTML='<div><div class="empty-icon">?</div><p>Sinyalnya belum kuat. Mulai dari objek, target optimasi, dan batasan N. Tambahkan kalimat aturan yang paling penting.</p></div>';
    $("#analysisStatus").textContent='Belum yakin'; return;
  }
  output.className='recommendation-list';
  output.innerHTML=scored.slice(0,4).map(({a,found,score},i)=>`<article class="recommendation"><div class="recommendation-top"><strong>${i+1}. ${esc(a.title)}</strong><span class="score">skor ${score}</span></div><p>${esc(a.when)}</p><div class="reason-tags">${found.map(x=>`<span>ketemu: ${esc(x)}</span>`).join('')}</div><div class="math-box" style="margin-top:10px">Langkah matematika: ${esc(a.math)}</div><a href="#library" class="secondary-button" style="margin-top:10px" data-open-algo="${a.id}">Buka materi</a></article>`).join('');
  $("#analysisStatus").textContent=`${scored.length} pola ditemukan`;
  $$('[data-open-algo]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(()=>{
    $("#librarySearch").value=''; $("#categoryFilter").value='all'; $("#levelFilter").value='all'; renderAlgorithms();
    const card=$(`.algorithm-card[data-id="${btn.dataset.openAlgo}"]`); if(card){card.open=true;card.scrollIntoView({behavior:'smooth',block:'center'});}
  },100)));
}

let sortState={arr:[],i:0,end:0,done:false,timer:null};
function parseSort(){
  const arr=$("#sortInput").value.split(',').map(x=>Number(x.trim())).filter(Number.isFinite).slice(0,12);
  if(!arr.length){toast('Masukkan angka dipisahkan koma');return;}
  sortState={arr,i:0,end:arr.length-1,done:false,timer:null}; renderSort();
}
function renderSort(active=[]){
  const max=Math.max(...sortState.arr,1);
  $("#sortBars").innerHTML=sortState.arr.map((v,i)=>`<div class="sort-bar ${active.includes(i)?'active':''} ${i>sortState.end?'sorted':''}" style="height:${40+170*v/max}px">${v}</div>`).join('');
}
function sortStep(){
  if(sortState.done){$("#sortNarration").textContent='Sudah terurut. Tekan Muat ulang untuk mengulang.';return;}
  if(sortState.end<=0){sortState.done=true;renderSort();$("#sortNarration").textContent='Selesai. Semua elemen berada pada posisi terurut.';return;}
  const i=sortState.i; const a=sortState.arr;
  renderSort([i,i+1]);
  if(a[i]>a[i+1]){
    const left=a[i],right=a[i+1]; [a[i],a[i+1]]=[a[i+1],a[i]];
    $("#sortNarration").textContent=`${left} > ${right}, jadi ditukar. Nilai besar bergerak ke kanan.`;
  }else $("#sortNarration").textContent=`${a[i]} ≤ ${a[i+1]}, urutan pasangan ini sudah benar.`;
  sortState.i++;
  if(sortState.i>=sortState.end){sortState.end--;sortState.i=0;$("#sortNarration").textContent+=' Satu pass selesai; suffix kanan sudah final.';}
  setTimeout(()=>renderSort(),180);
}
function autoSort(){
  if(sortState.timer){clearInterval(sortState.timer);sortState.timer=null;$("#sortAuto").textContent='Auto';return;}
  $("#sortAuto").textContent='Stop'; sortState.timer=setInterval(()=>{
    sortStep(); if(sortState.done){clearInterval(sortState.timer);sortState.timer=null;$("#sortAuto").textContent='Auto';}
  },500);
}

function toast(msg){
  const el=$("#toast"); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),1600);
}

function initTheme(){
  const saved=localStorage.getItem('osn-theme');
  if(saved)document.documentElement.dataset.theme=saved;
  $("#themeToggle").addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark'; document.documentElement.dataset.theme=next; localStorage.setItem('osn-theme',next);
  });
}

function init(){
  $("#metricModules").textContent=algorithms.length;
  renderPipeline(); renderRoadmap(); populateFilters(); renderAlgorithms(); renderCases(); renderSignals(); parseSort(); initTheme();
  $("#librarySearch").addEventListener('input',renderAlgorithms);
  $("#categoryFilter").addEventListener('change',renderAlgorithms);
  $("#levelFilter").addEventListener('change',renderAlgorithms);
  $("#expandAll").addEventListener('click',()=>{
    const cards=$$('.algorithm-card'); const shouldOpen=cards.some(x=>!x.open); cards.forEach(x=>x.open=shouldOpen); $("#expandAll").textContent=shouldOpen?'Tutup semua':'Buka semua';
  });
  $("#analyzeButton").addEventListener('click',analyzeProblem);
  $$('.sample-problem').forEach(x=>x.addEventListener('click',()=>{$("#problemText").value=samples[x.dataset.sample];analyzeProblem();}));
  $$('.case-tab').forEach(x=>x.addEventListener('click',()=>{$$('.case-tab').forEach(y=>y.classList.remove('active'));x.classList.add('active');renderCases(x.dataset.year);}));
  $("#sortReset").addEventListener('click',parseSort); $("#sortStep").addEventListener('click',sortStep); $("#sortAuto").addEventListener('click',autoSort);
  $("#resetProgress").addEventListener('click',()=>{localStorage.removeItem('osn-roadmap');localStorage.removeItem('osn-done');renderRoadmap();renderAlgorithms();toast('Progres direset');});
}

document.addEventListener('DOMContentLoaded',init);
