# AQUASCAN — Sistem Pemantauan Kualitas Air 

![AQUASCAN](https://img.shields.io/badge/AQUASCAN-v1.0.0-0D9488?style=for-the-badge)
![ISIF 2026](https://img.shields.io/badge/ISIF-2026-0A2E4D?style=for-the-badge)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Leaflet.js-7CB342?style=for-the-badge)

Sistem pemantauan kualitas air berbasis robot otomatis dengan peta interaktif **OpenStreetMap**. Dashboard ini menampilkan data sensor (pH, TDS, Turbiditas, Suhu) dari titik-titik pemantauan di sepanjang badan air.

## Fitur

- **Peta OpenStreetMap Interaktif** — Zoom, pan, dan navigasi menggunakan Leaflet.js
- **Marker GPS Akurat** — Koordinat di-trace langsung dari OpenStreetMap
- **Sidebar Daftar Titik** — Daftar semua titik pemantauan dengan search/filter (terinspirasi SiDanau)
- **Panel Detail + Mini Map** — Data sensor lengkap + mini map zoom-in saat klik titik
- **Indikator Kualitas Air** — Warna marker sesuai kategori Indeks Pencemar (IP)
- **Sparkline Trend** — Grafik tren per parameter sensor
- **Responsive Design** — Desktop, tablet, dan mobile

##  Lokasi Pemantauan

| Lokasi | Jumlah Titik | Deskripsi |
|--------|-------------|-----------|
| Sungai Ciliwung, Depok | 16 titik | Aliran sungai dari area UI/Pondok Cina hingga Cilodong |
| Setu Babakan, Jakarta Selatan | 10 titik | Keliling danau di Perkampungan Budaya Betawi |

## Teknologi

- **HTML5** + **CSS3** + **JavaScript** (Vanilla)
- **[Leaflet.js](https://leafletjs.com/)** v1.9.4 — Library peta interaktif
- **[OpenStreetMap](https://www.openstreetmap.org/)** — Tile provider
- **Google Fonts** — Inter, Plus Jakarta Sans, IBM Plex Mono

## Struktur Proyek

```
AQUASCAN/
├── index.html          # Halaman utama dashboard
├── css/
│   └── style.css       # Stylesheet utama
├── js/
│   ├── app.js          # Entry point & event listeners
│   ├── data.js         # Data titik pemantauan (koordinat GPS)
│   ├── map.js          # Logika peta Leaflet & marker
│   ├── sidebar.js      # Sidebar daftar titik & search
│   └── detail.js       # Panel detail & mini map
├── .gitignore
├── LICENSE
└── README.md
```

## Cara Menjalankan

1. Clone repository:
   ```bash
   git clone https://github.com/username/aquascan-monitoring.git
   cd aquascan-monitoring
   ```

2. Buka `index.html` di browser:
   - Double-klik file `index.html`, atau
   - Gunakan Live Server extension di VS Code

3. Tidak perlu instalasi dependensi — semua library di-load via CDN.

## Kategori Indeks Pencemar (IP)

| Kategori | Range IP | Warna |
|----------|----------|-------|
| Memenuhi Bakumutu | 0 – 1 | 🟢 Hijau |
| Cemar Ringan | 1 – 5 | 🟡 Kuning |
| Cemar Sedang | 5 – 10 | 🟠 Oranye |
| Cemar Berat | ≥ 10 | 🔴 Merah |

> Kategori mutu air merujuk pada skala Indeks Pencemar (IP) sesuai **Peraturan Menteri LHK No. 27 Tahun 2021**.

## Lisensi

MIT License — lihat [LICENSE](LICENSE)

## Tentang

Prototipe ini dikembangkan sebagai bagian dari proyek **ISIF 2026** — Inovasi Sistem Informasi untuk pemantauan kualitas air secara otomatis menggunakan robot.

---

*AQUASCAN © 2026 — Modul Frontend & GPS · ISIF 2026*
