/**
 * [Your_Name] — Data Titik Pemantauan
 * Koordinat GPS di-trace langsung dari OpenStreetMap
 * 
 * Sensor:
 * 1. pH — Tingkat keasaman/kebasaan
 * 2. Salinitas — Kadar garam terlarut (ppt)
 * 3. TDS — Total Dissolved Solids (ppm)
 * 4. Minyak — Kontaminasi minyak (mg/L)
 * 5. Partikel — Kekeruhan/turbiditas (NTU)
 * 6. Oksigen — Dissolved Oxygen (mg/L) [PLANNED]
 * 
 * Lokasi:
 * 1. Sungai Ciliwung — aliran sungai melalui Kota Depok (16 titik)
 * 2. Setu Babakan — keliling danau di Jagakarsa, Jakarta Selatan (10 titik)
 */

// ============================================
// IP (Indeks Pencemar) Bands
// Ref: Permen LHK No. 27 Tahun 2021
// ============================================
const IP_BANDS = [
  { key: 'good',   label: 'Memenuhi Bakumutu', color: '#10B981', bg: 'rgba(16,185,129,0.12)',  max: 1 },
  { key: 'light',  label: 'Cemar Ringan',      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  max: 5 },
  { key: 'medium', label: 'Cemar Sedang',      color: '#F97316', bg: 'rgba(249,115,22,0.12)',  max: 10 },
  { key: 'heavy',  label: 'Cemar Berat',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   max: Infinity },
];

function ipCategory(ip) {
  return IP_BANDS.find(b => ip < b.max) || IP_BANDS[IP_BANDS.length - 1];
}

// ============================================
// Data Generator
// Koordinat di-trace dari OpenStreetMap
// ============================================
function generateData(loc) {
  const points = [];

  if (loc === 'ciliwung') {
    // --------------------------------------------------------
    // Sungai Ciliwung — Kota Depok, Jawa Barat
    // 16 titik mengikuti aliran sungai dari utara ke selatan
    // Koordinat di-trace dari OpenStreetMap way data
    // --------------------------------------------------------
    const coords = [
      [-6.355723, 106.837771, 'Hulu Ciliwung Depok (dekat UI)'],
      [-6.358911, 106.836301, 'Jembatan Pondok Cina'],
      [-6.363934, 106.839284, 'Kelurahan Kukusan'],
      [-6.367665, 106.838887, 'Beji — Tanah Baru'],
      [-6.370320, 106.837417, 'Jembatan Kemiri Muka'],
      [-6.374052, 106.841065, 'Depok Jaya — GDC'],
      [-6.376174, 106.840131, 'Kelurahan Depok Jaya'],
      [-6.380983, 106.836998, 'Pancoran Mas Hulu'],
      [-6.382572, 106.832954, 'Jembatan Siliwangi'],
      [-6.386090, 106.832353, 'Pancoran Mas — Merdeka'],
      [-6.389278, 106.833254, 'Depok Lama'],
      [-6.392466, 106.830722, 'Sukmajaya Hulu'],
      [-6.396081, 106.830121, 'Kelurahan Mekarjaya'],
      [-6.399812, 106.831688, 'Sukmajaya — Tole Iskandar'],
      [-6.403000, 106.828619, 'Cilodong Hulu'],
      [-6.406412, 106.823566, 'Muara Cilodong'],
    ];

    coords.forEach((c, i) => {
      // Simulasi: titik 7-9 lebih tercemar (area padat penduduk)
      const bumpCenter = 8;
      const bump = Math.max(0, 1 - Math.abs(i - bumpCenter) / 3.5);

      const ph       = +(7.4 - bump * 1.8 + (Math.sin(i * 1.7) * 0.15)).toFixed(1);
      const salinity = +(0.2 + bump * 0.6 + Math.sin(i * 1.3) * 0.05).toFixed(2);
      const tds      = Math.round(120 + bump * 350 + Math.sin(i * 2.3) * 15);
      const oil      = +(0.01 + bump * 0.15 + Math.abs(Math.sin(i * 1.9)) * 0.02).toFixed(2);
      const particle = Math.round(8 + bump * 65 + Math.sin(i * 1.5) * 3);
      const oxygen   = null;  // Sensor belum dipasang
      const waterTemp = +(27.5 + bump * 2.5 + Math.sin(i * 0.9) * 0.4).toFixed(1);
      const ip       = +(0.4 + bump * 13 + Math.sin(i * 1.2) * 0.3).toFixed(1);

      points.push({
        idx: i,
        id: 'AQS-' + String(i + 1).padStart(2, '0'),
        lat: c[0],
        lng: c[1],
        name: c[2],
        locLabel: 'Sungai Ciliwung, Kota Depok, Jawa Barat',
        ph, salinity, tds, oil, particle, oxygen, waterTemp, ip
      });
    });

  } else {
    // --------------------------------------------------------
    // Setu Babakan — Jagakarsa, Jakarta Selatan
    // 10 titik mengelilingi danau (clockwise dari utara)
    // Center: -6.3417, 106.8239
    // Koordinat di-trace dari OpenStreetMap
    // --------------------------------------------------------
    const coords = [
      [-6.338738, 106.826567, 'Dermaga Utara'],
      [-6.339702, 106.825499, 'Gazebo Timur Laut'],
      [-6.341771, 106.821541, 'Pos Pantau Timur'],
      [-6.342404, 106.823447, 'Inlet Kali Krukut'],
      [-6.344340, 106.820071, 'Dermaga Tenggara'],
      [-6.345205, 106.820880, 'Area Rekreasi Selatan'],
      [-6.346301, 106.819193, 'Outlet Selatan'],
      [-6.347722, 106.817463, 'Warung Apung Barat'],
      [-6.348015, 106.819502, 'Area Budidaya Ikan'],
      [-6.349331, 106.816104, 'Inlet Barat Laut'],
    ];

    coords.forEach((c, i) => {
      // Simulasi: titik 3-4 (inlet) lebih tercemar
      const bumpCenter = 3;
      const bump = Math.max(0, 1 - Math.abs(i - bumpCenter) / 3);

      const ph       = +(7.2 - bump * 1.2 + (Math.sin(i * 2.1) * 0.1)).toFixed(1);
      const salinity = +(0.15 + bump * 0.35 + Math.sin(i * 1.6) * 0.03).toFixed(2);
      const tds      = Math.round(100 + bump * 200 + Math.sin(i * 1.8) * 10);
      const oil      = +(0.005 + bump * 0.08 + Math.abs(Math.sin(i * 2.2)) * 0.01).toFixed(3);
      const particle = Math.round(5 + bump * 40 + Math.sin(i * 1.3) * 2);
      const oxygen   = null;  // Sensor belum dipasang
      const waterTemp = +(28.0 + bump * 1.5 + Math.sin(i * 0.7) * 0.3).toFixed(1);
      const ip       = +(0.3 + bump * 8 + Math.sin(i * 1.5) * 0.2).toFixed(1);

      points.push({
        idx: i,
        id: 'AQS-' + String(i + 1).padStart(2, '0'),
        lat: c[0],
        lng: c[1],
        name: c[2],
        locLabel: 'Setu Babakan, Jagakarsa, DKI Jakarta',
        ph, salinity, tds, oil, particle, oxygen, waterTemp, ip
      });
    });
  }

  return points;
}
