# 🤖 Panduan Integrasi Robot → Website
## [Your_Name] — Sistem Pemantauan Kualitas Air | ISIF 2026

> Dokumen ini adalah panduan teknis untuk temanmu yang akan mengerjakan koneksi antara robot monitoring kualitas air dengan website dashboard. Berisi arsitektur sistem, format data, contoh kode, dan langkah-langkah implementasi.

---

## 📐 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ROBOT (Di Air)                               │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Sensor   │  │ Sensor   │  │ Sensor   │  │ Sensor   │  ...       │
│  │ pH       │  │ Salinitas│  │ TDS      │  │ Minyak   │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │              │              │              │                │
│       └──────────────┴──────────────┴──────────────┘                │
│                          │                                          │
│                  ┌───────▼────────┐                                 │
│                  │  Microcontroller│                                 │
│                  │  (ESP32/Arduino)│                                 │
│                  └───────┬────────┘                                 │
│                          │                                          │
│                  ┌───────▼────────┐                                 │
│                  │  GPS Module    │  ← Koordinat setiap 1 meter     │
│                  │  (NEO-6M)     │                                  │
│                  └───────┬────────┘                                 │
│                          │                                          │
│                  ┌───────▼────────┐                                 │
│                  │  WiFi/4G       │  ← Kirim data ke server        │
│                  │  Module        │                                  │
│                  └───────┬────────┘                                 │
│                          │                                          │
│  ┌───────────────────────┼──────────────────────────────┐          │
│  │  BONUS: Sensor Jarak  │  (HC-SR04 Waterproof/JSN)    │          │
│  │  Deteksi objek → Aktuator ambil sampah               │          │
│  └───────────────────────────────────────────────────────┘          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    HTTP POST / WebSocket
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     SERVER (Backend)                                  │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  REST API        │    │  WebSocket       │    │  Database       │  │
│  │  /api/scan-data  │◄──►│  Server          │    │  (MongoDB /     │  │
│  │  /api/sessions   │    │  (real-time push)│    │   SQLite /      │  │
│  │  /api/robot-     │    │                  │    │   Firebase)     │  │
│  │    status        │    │                  │    │                 │  │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬────────┘ │
│           │                       │                        │         │
│           └───────────────────────┴────────────────────────┘         │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                    HTTP GET / WebSocket
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     WEBSITE (Frontend)                                │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Peta Leaflet │  │ Dashboard   │  │ Dataset     │                 │
│  │ (Markers)    │  │ (Grafik)    │  │ (Tabel)     │                 │
│  └──────────────┘  └─────────────┘  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Skema Data JSON

### 1. Data Per Titik Sampling (robot kirim ini setiap 1 meter)

```json
{
  "robot_id": "ROBOT-01",
  "session_id": "SES-20260823-001",
  "timestamp": "2026-08-23T14:30:15.000+07:00",
  "sequence": 14,
  "gps": {
    "latitude": -6.367665,
    "longitude": 106.838887,
    "altitude": 45.2,
    "accuracy_m": 1.5
  },
  "sensors": {
    "ph": {
      "value": 6.8,
      "unit": "pH",
      "status": "OK"
    },
    "salinity": {
      "value": 0.42,
      "unit": "ppt",
      "status": "OK"
    },
    "tds": {
      "value": 285,
      "unit": "ppm",
      "status": "OK"
    },
    "oil": {
      "value": 0.03,
      "unit": "mg/L",
      "status": "OK"
    },
    "particle": {
      "value": 18.5,
      "unit": "NTU",
      "status": "OK"
    },
    "oxygen": {
      "value": null,
      "unit": "mg/L",
      "status": "NOT_INSTALLED"
    }
  },
  "water_temp_c": 28.3,
  "battery_pct": 78,
  "trash_detector": {
    "distance_cm": 250,
    "object_detected": false,
    "action": "NONE"
  }
}
```

**Catatan field:**
| Field | Tipe | Wajib? | Deskripsi |
|-------|------|--------|-----------|
| `robot_id` | string | Ya | ID unik robot |
| `session_id` | string | Ya | ID sesi scanning (1 sesi = 1 perjalanan penuh sungai) |
| `timestamp` | ISO 8601 | Ya | Waktu pengambilan data |
| `sequence` | integer | Ya | Urutan titik ke-berapa dalam sesi ini (1, 2, 3, ...) |
| `gps.latitude` | float | Ya | Koordinat lintang (desimal) |
| `gps.longitude` | float | Ya | Koordinat bujur (desimal) |
| `gps.accuracy_m` | float | Tidak | Akurasi GPS dalam meter |
| `sensors.*.value` | float/null | Ya | Nilai sensor, `null` jika sensor belum dipasang |
| `sensors.*.status` | string | Ya | `"OK"`, `"ERROR"`, `"CALIBRATING"`, `"NOT_INSTALLED"` |
| `battery_pct` | integer | Ya | Persentase baterai robot |
| `trash_detector.object_detected` | boolean | Ya | Apakah ada objek terdeteksi oleh sensor jarak |
| `trash_detector.action` | string | Ya | `"NONE"`, `"DETECTED"`, `"COLLECTING"`, `"COLLECTED"` |

### 2. Data Sesi Scanning

```json
{
  "session_id": "SES-20260823-001",
  "robot_id": "ROBOT-01",
  "location": {
    "name": "Sungai Ciliwung — Segmen Depok",
    "region": "Kota Depok, Jawa Barat",
    "start_coord": [-6.355723, 106.837771],
    "end_coord": [-6.406412, 106.823566]
  },
  "started_at": "2026-08-23T14:00:00.000+07:00",
  "ended_at": null,
  "status": "IN_PROGRESS",
  "total_points": 14,
  "distance_m": 14,
  "direction": "FORWARD",
  "trash_collected": 2
}
```

**Status sesi:**
- `"QUEUED"` — Sesi belum dimulai
- `"IN_PROGRESS"` — Robot sedang scanning
- `"RETURNING"` — Robot putar balik, scanning arah sebaliknya
- `"COMPLETED"` — Sesi selesai
- `"ERROR"` — Ada error, sesi terhenti

---

## 🔌 REST API Endpoints

### Base URL
```
https://[your-server-domain]/api/v1
```

Untuk development lokal:
```
http://localhost:3000/api/v1
```

### Endpoints

#### 1. `POST /scan-data` — Robot kirim data titik baru
**Dikirim oleh:** Robot (setiap 1 meter)

```http
POST /api/v1/scan-data
Content-Type: application/json
Authorization: Bearer ROBOT_API_KEY_123

{
  "robot_id": "ROBOT-01",
  "session_id": "SES-20260823-001",
  "sequence": 15,
  "gps": { "latitude": -6.370320, "longitude": 106.837417 },
  "sensors": {
    "ph": { "value": 6.5, "unit": "pH", "status": "OK" },
    "salinity": { "value": 0.55, "unit": "ppt", "status": "OK" },
    "tds": { "value": 340, "unit": "ppm", "status": "OK" },
    "oil": { "value": 0.08, "unit": "mg/L", "status": "OK" },
    "particle": { "value": 32.1, "unit": "NTU", "status": "OK" },
    "oxygen": { "value": null, "unit": "mg/L", "status": "NOT_INSTALLED" }
  },
  "water_temp_c": 29.1,
  "battery_pct": 75,
  "trash_detector": {
    "distance_cm": 45,
    "object_detected": true,
    "action": "COLLECTING"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "point_id": "PNT-20260823-001-015",
    "ip_score": 7.2,
    "ip_category": "Cemar Sedang",
    "received_at": "2026-08-23T14:30:16.123+07:00"
  }
}
```

#### 2. `POST /sessions` — Mulai sesi scanning baru
**Dikirim oleh:** Robot (saat mulai scanning)

```http
POST /api/v1/sessions
Content-Type: application/json
Authorization: Bearer ROBOT_API_KEY_123

{
  "robot_id": "ROBOT-01",
  "location": {
    "name": "Sungai Ciliwung — Segmen Depok",
    "region": "Kota Depok, Jawa Barat"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "session_id": "SES-20260823-001",
    "started_at": "2026-08-23T14:00:00.000+07:00"
  }
}
```

#### 3. `PATCH /sessions/:sessionId` — Update status sesi
**Dikirim oleh:** Robot (saat putar balik / selesai)

```http
PATCH /api/v1/sessions/SES-20260823-001
Content-Type: application/json
Authorization: Bearer ROBOT_API_KEY_123

{
  "status": "RETURNING",
  "direction": "BACKWARD"
}
```

#### 4. `GET /sessions/:sessionId/points` — Ambil semua titik data dari sesi
**Dipakai oleh:** Website (untuk render markers di peta)

```http
GET /api/v1/sessions/SES-20260823-001/points
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": { "session_id": "SES-20260823-001", "status": "IN_PROGRESS" },
    "points": [
      { "sequence": 1, "gps": {}, "sensors": {}, "ip_score": 0.8 },
      { "sequence": 2, "gps": {}, "sensors": {}, "ip_score": 1.2 }
    ],
    "total": 14
  }
}
```

#### 5. `GET /sessions` — List semua sesi scanning
**Dipakai oleh:** Website (untuk dropdown lokasi)

```http
GET /api/v1/sessions?status=COMPLETED&limit=20
```

#### 6. `GET /robot-status` — Cek status robot real-time
**Dipakai oleh:** Website (untuk indikator online/offline)

```http
GET /api/v1/robot-status/ROBOT-01
```

**Response:**
```json
{
  "success": true,
  "data": {
    "robot_id": "ROBOT-01",
    "online": true,
    "battery_pct": 75,
    "current_session": "SES-20260823-001",
    "last_seen": "2026-08-23T14:30:16.000+07:00",
    "gps": { "latitude": -6.370320, "longitude": 106.837417 }
  }
}
```

---

## ⚡ WebSocket (Opsional — Untuk Real-Time)

Jika mau data muncul di peta secara real-time tanpa refresh:

### Koneksi
```javascript
// Di website (frontend)
const ws = new WebSocket('wss://[your-server]/ws');

ws.onmessage = function(event) {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case 'NEW_POINT':
      // Data titik baru masuk — tambahkan marker di peta
      addMarkerToMap(msg.data);
      break;

    case 'ROBOT_STATUS':
      // Update indikator status robot
      updateRobotIndicator(msg.data);
      break;

    case 'TRASH_DETECTED':
      // Notifikasi sampah terdeteksi
      showTrashNotification(msg.data);
      break;

    case 'SESSION_UPDATE':
      // Update status sesi (putar balik, selesai, dll)
      updateSessionStatus(msg.data);
      break;
  }
};
```

### Format Pesan WebSocket

```json
{
  "type": "NEW_POINT",
  "data": {
    "session_id": "SES-20260823-001",
    "sequence": 15,
    "gps": { "latitude": -6.370320, "longitude": 106.837417 },
    "sensors": {},
    "ip_score": 7.2,
    "ip_category": "Cemar Sedang",
    "timestamp": "2026-08-23T14:30:15.000+07:00"
  }
}
```

```json
{
  "type": "TRASH_DETECTED",
  "data": {
    "session_id": "SES-20260823-001",
    "gps": { "latitude": -6.370320, "longitude": 106.837417 },
    "distance_cm": 45,
    "action": "COLLECTING",
    "timestamp": "2026-08-23T14:30:15.000+07:00"
  }
}
```

---

## 🔧 Contoh Kode Robot (ESP32 / Arduino)

### Kirim Data via HTTP (WiFi)

```cpp
// =============================================
// [Your_Name] Robot — Kirim Data ke Server
// Board: ESP32 DevKit V1
// =============================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>

// --- Konfigurasi WiFi ---
const char* WIFI_SSID     = "NAMA_WIFI";
const char* WIFI_PASSWORD  = "PASSWORD_WIFI";

// --- Konfigurasi Server ---
const char* SERVER_URL     = "http://192.168.1.100:3000/api/v1/scan-data";
const char* API_KEY        = "ROBOT_API_KEY_123";
const char* ROBOT_ID       = "ROBOT-01";

// --- Variabel Global ---
String sessionId = "";
int sequence = 0;
TinyGPSPlus gps;

// --- Pin Sensor ---
#define PH_PIN          34    // Analog
#define TDS_PIN         35    // Analog
#define SALINITY_PIN    32    // Analog
#define OIL_PIN         33    // Analog (sensor minyak)
#define PARTICLE_PIN    25    // Analog (sensor partikel/turbidity)
#define TEMP_PIN        26    // DS18B20 / analog
#define SONAR_TRIG      27    // Sensor jarak (pengambil sampah)
#define SONAR_ECHO      14

// ============================================
// SETUP
// ============================================
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600);  // GPS module di Serial2

  // Koneksi WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  // Mulai sesi baru
  startNewSession();

  // Setup pin sensor
  pinMode(SONAR_TRIG, OUTPUT);
  pinMode(SONAR_ECHO, INPUT);
}

// ============================================
// MAIN LOOP — Jalan 1 meter, ambil data, kirim
// ============================================
void loop() {
  // 1. Update GPS
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  // 2. Cek apakah sudah jalan 1 meter dari titik sebelumnya
  if (hasMovedOneMeter()) {
    sequence++;

    // 3. Baca semua sensor
    float phValue       = readPH();
    float salinityValue = readSalinity();
    int   tdsValue      = readTDS();
    float oilValue      = readOil();
    float particleValue = readParticle();
    float waterTemp     = readWaterTemp();
    int   batteryPct    = readBattery();

    // 4. Baca sensor jarak (untuk pengambil sampah)
    float distanceCm    = readSonarDistance();
    bool  objectDetected = (distanceCm < 50.0);

    // 5. Kalau ada objek, aktifkan pengambil sampah
    String trashAction = "NONE";
    if (objectDetected) {
      trashAction = "DETECTED";
      activateTrashCollector();
      trashAction = "COLLECTED";
    }

    // 6. Kirim data ke server
    sendDataToServer(
      phValue, salinityValue, tdsValue, oilValue,
      particleValue, waterTemp, batteryPct,
      distanceCm, objectDetected, trashAction
    );

    delay(500);
  }
}

// ============================================
// Fungsi: Mulai Sesi Baru
// ============================================
void startNewSession() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin("http://192.168.1.100:3000/api/v1/sessions");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(API_KEY));

  StaticJsonDocument<256> doc;
  doc["robot_id"] = ROBOT_ID;
  JsonObject location = doc.createNestedObject("location");
  location["name"] = "Sungai Ciliwung — Segmen Depok";
  location["region"] = "Kota Depok, Jawa Barat";

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  if (httpCode == 201) {
    String response = http.getString();
    StaticJsonDocument<256> resDoc;
    deserializeJson(resDoc, response);
    sessionId = resDoc["data"]["session_id"].as<String>();
    Serial.println("Session started: " + sessionId);
  }
  http.end();
}

// ============================================
// Fungsi: Kirim Data Titik ke Server
// ============================================
void sendDataToServer(
  float ph, float salinity, int tds, float oil,
  float particle, float waterTemp, int battery,
  float sonarDist, bool objectDetected, String trashAction
) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + String(API_KEY));

  StaticJsonDocument<768> doc;
  doc["robot_id"]   = ROBOT_ID;
  doc["session_id"] = sessionId;
  doc["sequence"]   = sequence;

  JsonObject gpsObj = doc.createNestedObject("gps");
  gpsObj["latitude"]  = gps.location.lat();
  gpsObj["longitude"] = gps.location.lng();
  gpsObj["altitude"]  = gps.altitude.meters();

  JsonObject sensors = doc.createNestedObject("sensors");

  JsonObject phObj = sensors.createNestedObject("ph");
  phObj["value"] = ph; phObj["unit"] = "pH"; phObj["status"] = "OK";

  JsonObject salObj = sensors.createNestedObject("salinity");
  salObj["value"] = salinity; salObj["unit"] = "ppt"; salObj["status"] = "OK";

  JsonObject tdsObj = sensors.createNestedObject("tds");
  tdsObj["value"] = tds; tdsObj["unit"] = "ppm"; tdsObj["status"] = "OK";

  JsonObject oilObj = sensors.createNestedObject("oil");
  oilObj["value"] = oil; oilObj["unit"] = "mg/L"; oilObj["status"] = "OK";

  JsonObject partObj = sensors.createNestedObject("particle");
  partObj["value"] = particle; partObj["unit"] = "NTU"; partObj["status"] = "OK";

  JsonObject o2Obj = sensors.createNestedObject("oxygen");
  o2Obj["value"]  = (char*)0;  // null
  o2Obj["unit"]   = "mg/L";
  o2Obj["status"] = "NOT_INSTALLED";

  doc["water_temp_c"]  = waterTemp;
  doc["battery_pct"]   = battery;

  JsonObject trash = doc.createNestedObject("trash_detector");
  trash["distance_cm"]     = sonarDist;
  trash["object_detected"] = objectDetected;
  trash["action"]          = trashAction;

  String body;
  serializeJson(doc, body);

  int httpCode = http.POST(body);
  if (httpCode == 201) {
    Serial.println("Point " + String(sequence) + " sent OK");
  } else {
    Serial.println("Send failed: " + String(httpCode));
    // TODO: Simpan ke buffer lokal dan retry nanti
  }
  http.end();
}

// ============================================
// Fungsi: Baca Sensor (placeholder — sesuaikan dengan hardware)
// ============================================
float readPH() {
  int raw = analogRead(PH_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float ph = 3.5 * voltage + 0.00;  // ← Sesuaikan koefisien kalibrasi
  return ph;
}

float readSalinity() {
  int raw = analogRead(SALINITY_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float salinity = voltage * 10.0;  // ← Sesuaikan kalibrasi
  return salinity;
}

int readTDS() {
  int raw = analogRead(TDS_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float compensationCoefficient = 1.0 + 0.02 * (readWaterTemp() - 25.0);
  float compensationVoltage = voltage / compensationCoefficient;
  float tds = (133.42 * compensationVoltage * compensationVoltage * compensationVoltage
              - 255.86 * compensationVoltage * compensationVoltage
              + 857.39 * compensationVoltage) * 0.5;
  return (int)tds;
}

float readOil() {
  int raw = analogRead(OIL_PIN);
  float voltage = raw * (3.3 / 4095.0);
  return voltage * 0.1;  // ← Sesuaikan kalibrasi sensor minyak
}

float readParticle() {
  int raw = analogRead(PARTICLE_PIN);
  float voltage = raw * (3.3 / 4095.0);
  float ntu = voltage * 100.0;  // ← Sesuaikan kalibrasi turbidity
  return ntu;
}

float readWaterTemp() {
  return 28.0;  // ← Ganti dengan pembacaan sensor sebenarnya
}

int readBattery() {
  int raw = analogRead(36);
  float voltage = raw * (3.3 / 4095.0) * 2;
  int pct = map(voltage * 100, 300, 420, 0, 100);
  return constrain(pct, 0, 100);
}

// ============================================
// Fungsi: Sensor Jarak (Sonar) — Untuk Pengambil Sampah
// ============================================
float readSonarDistance() {
  digitalWrite(SONAR_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(SONAR_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(SONAR_TRIG, LOW);

  long duration = pulseIn(SONAR_ECHO, HIGH, 30000);
  float distance = duration * 0.034 / 2;
  return distance;
}

// ============================================
// Fungsi: Cek Apakah Sudah Jalan 1 Meter
// ============================================
bool hasMovedOneMeter() {
  static double lastLat = 0, lastLng = 0;

  if (!gps.location.isValid()) return false;

  double currentLat = gps.location.lat();
  double currentLng = gps.location.lng();

  if (lastLat == 0 && lastLng == 0) {
    lastLat = currentLat;
    lastLng = currentLng;
    return true;  // Titik pertama
  }

  double dist = TinyGPSPlus::distanceBetween(lastLat, lastLng, currentLat, currentLng);

  if (dist >= 1.0) {
    lastLat = currentLat;
    lastLng = currentLng;
    return true;
  }

  return false;
}

// ============================================
// Fungsi: Aktifkan Pengambil Sampah
// ============================================
void activateTrashCollector() {
  Serial.println("TRASH: Collecting object...");
  // servo.write(90);  // Buka capit
  delay(2000);
  // servo.write(0);   // Tutup capit
  Serial.println("TRASH: Object collected!");
}
```

### Library yang Dibutuhkan (Arduino IDE)

1. **ArduinoJson** (v6+) — Untuk serialize/deserialize JSON
2. **TinyGPSPlus** — Untuk parsing data GPS dari modul NEO-6M
3. **WiFi** (built-in ESP32) — Koneksi internet
4. **HTTPClient** (built-in ESP32) — HTTP request

Install via Arduino IDE: `Sketch → Include Library → Manage Libraries`

---

## 🖥️ Contoh Kode Backend (Node.js + Express)

### Setup Awal

```bash
mkdir aquascan-server
cd aquascan-server
npm init -y
npm install express cors body-parser ws
```

### Server Code (`server.js`)

```javascript
// =============================================
// [Your_Name] — Backend Server
// Menerima data dari robot dan serve ke website
// =============================================

const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// --- In-Memory Storage (ganti dengan database untuk production) ---
const sessions = {};
const points = {};
const robotStatus = {};

// --- API Key Validation ---
function validateApiKey(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer ROBOT_API_KEY_123') {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

// POST /api/v1/sessions — Mulai sesi baru
app.post('/api/v1/sessions', validateApiKey, (req, res) => {
  const { robot_id, location } = req.body;
  const sessionId = 'SES-' + Date.now();
  const session = {
    session_id: sessionId, robot_id, location,
    started_at: new Date().toISOString(), ended_at: null,
    status: 'IN_PROGRESS', total_points: 0,
    direction: 'FORWARD', trash_collected: 0,
  };
  sessions[sessionId] = session;
  points[sessionId] = [];
  broadcast({ type: 'SESSION_UPDATE', data: session });
  res.status(201).json({ success: true, data: { session_id: sessionId, started_at: session.started_at } });
});

// POST /api/v1/scan-data — Robot kirim data titik baru
app.post('/api/v1/scan-data', validateApiKey, (req, res) => {
  const data = req.body;
  const { session_id } = data;
  if (!sessions[session_id]) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const ipScore = calculateIP(data.sensors);
  const ipCategory = getIPCategory(ipScore);

  const point = {
    ...data,
    point_id: 'PNT-' + session_id + '-' + String(data.sequence).padStart(3, '0'),
    ip_score: ipScore, ip_category: ipCategory,
    received_at: new Date().toISOString(),
  };

  points[session_id].push(point);
  sessions[session_id].total_points = points[session_id].length;

  robotStatus[data.robot_id] = {
    robot_id: data.robot_id, online: true,
    battery_pct: data.battery_pct, current_session: session_id,
    last_seen: new Date().toISOString(), gps: data.gps,
  };

  if (data.trash_detector && data.trash_detector.action === 'COLLECTED') {
    sessions[session_id].trash_collected++;
  }

  broadcast({ type: 'NEW_POINT', data: point });

  res.status(201).json({
    success: true,
    data: { point_id: point.point_id, ip_score: ipScore, ip_category: ipCategory, received_at: point.received_at },
  });
});

// PATCH /api/v1/sessions/:sessionId
app.patch('/api/v1/sessions/:sessionId', validateApiKey, (req, res) => {
  const { sessionId } = req.params;
  if (!sessions[sessionId]) return res.status(404).json({ success: false, error: 'Session not found' });
  Object.assign(sessions[sessionId], req.body);
  if (req.body.status === 'COMPLETED') sessions[sessionId].ended_at = new Date().toISOString();
  broadcast({ type: 'SESSION_UPDATE', data: sessions[sessionId] });
  res.json({ success: true, data: sessions[sessionId] });
});

// GET /api/v1/sessions
app.get('/api/v1/sessions', (req, res) => {
  const list = Object.values(sessions).sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  res.json({ success: true, data: list });
});

// GET /api/v1/sessions/:sessionId/points
app.get('/api/v1/sessions/:sessionId/points', (req, res) => {
  const { sessionId } = req.params;
  if (!sessions[sessionId]) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({
    success: true,
    data: { session: sessions[sessionId], points: points[sessionId] || [], total: (points[sessionId] || []).length },
  });
});

// GET /api/v1/robot-status/:robotId
app.get('/api/v1/robot-status/:robotId', (req, res) => {
  const status = robotStatus[req.params.robotId];
  if (!status) return res.json({ success: true, data: { robot_id: req.params.robotId, online: false } });
  res.json({ success: true, data: status });
});

// --- IP Calculation ---
function calculateIP(sensors) {
  let scores = [];
  if (sensors.ph && sensors.ph.value != null) scores.push(Math.abs(sensors.ph.value - 7.0) / 2.0);
  if (sensors.tds && sensors.tds.value != null) scores.push(sensors.tds.value / 500);
  if (sensors.particle && sensors.particle.value != null) scores.push(sensors.particle.value / 50);
  if (sensors.oil && sensors.oil.value != null) scores.push(sensors.oil.value / 1.0);
  if (scores.length === 0) return 0;
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(Math.sqrt((maxScore * maxScore + avgScore * avgScore) / 2) * 10) / 10;
}

function getIPCategory(ip) {
  if (ip <= 1) return 'Memenuhi Bakumutu';
  if (ip <= 5) return 'Cemar Ringan';
  if (ip <= 10) return 'Cemar Sedang';
  return 'Cemar Berat';
}

// --- WebSocket ---
const wss = new WebSocketServer({ server });
const wsClients = new Set();
wss.on('connection', (ws) => {
  wsClients.add(ws);
  ws.on('close', () => wsClients.delete(ws));
});
function broadcast(message) {
  const msg = JSON.stringify(message);
  wsClients.forEach((client) => { if (client.readyState === 1) client.send(msg); });
}

// --- Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('[Your_Name] Server running on http://localhost:' + PORT);
});
```

---

## 🧪 Testing Tanpa Robot (Simulasi)

```bash
# 1. Mulai sesi baru
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROBOT_API_KEY_123" \
  -d '{"robot_id":"ROBOT-01","location":{"name":"Test Sungai","region":"Jakarta"}}'

# 2. Kirim data titik
curl -X POST http://localhost:3000/api/v1/scan-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ROBOT_API_KEY_123" \
  -d '{"robot_id":"ROBOT-01","session_id":"SES-xxx","sequence":1,"gps":{"latitude":-6.3557,"longitude":106.8378},"sensors":{"ph":{"value":7.2,"unit":"pH","status":"OK"},"salinity":{"value":0.3,"unit":"ppt","status":"OK"},"tds":{"value":150,"unit":"ppm","status":"OK"},"oil":{"value":0.01,"unit":"mg/L","status":"OK"},"particle":{"value":12,"unit":"NTU","status":"OK"},"oxygen":{"value":null,"unit":"mg/L","status":"NOT_INSTALLED"}},"water_temp_c":28.5,"battery_pct":95,"trash_detector":{"distance_cm":200,"object_detected":false,"action":"NONE"}}'

# 3. Ambil data dari sesi
curl http://localhost:3000/api/v1/sessions/SES-xxx/points
```

---

## 📋 Checklist Implementasi

### Tahap 1: Setup Server
- [ ] Install Node.js di komputer/server
- [ ] Clone repo dan setup backend
- [ ] Test API pakai Postman/curl
- [ ] (Opsional) Ganti in-memory storage ke MongoDB/Firebase

### Tahap 2: Setup Robot
- [ ] Pasang semua sensor ke ESP32
- [ ] Kalibrasi setiap sensor (pH, TDS, salinitas, dll)
- [ ] Pasang modul GPS (NEO-6M)
- [ ] Test koneksi WiFi ESP32 ke server
- [ ] Implementasi `hasMovedOneMeter()` (GPS atau encoder)
- [ ] Test kirim 1 data point ke server

### Tahap 3: Integrasi
- [ ] Robot bisa mulai sesi scanning
- [ ] Robot kirim data otomatis setiap 1 meter
- [ ] Website tampilkan marker baru secara real-time
- [ ] Robot bisa putar balik dan lanjut scanning
- [ ] Robot bisa update status sesi (COMPLETED)

### Tahap 4: Pengambil Sampah
- [ ] Sensor sonar berfungsi di air
- [ ] Threshold deteksi objek di-tune (< 50cm? 30cm?)
- [ ] Aktuator pengambil berfungsi
- [ ] Data sampah terkirim ke server

---

## ❓ FAQ

**Q: Pakai WiFi atau 4G?**
A: Untuk test di lab/dekat hotspot WiFi, pakai WiFi. Di lapangan (sungai), perlu modul 4G (SIM800L/SIM7600).

**Q: Kalau WiFi putus di tengah scanning?**
A: Implementasi buffer lokal — simpan data ke SD card/SPIFFS, lalu kirim ulang saat koneksi kembali.

**Q: Berapa ukuran JSON per titik?**
A: Sekitar 500–700 bytes. Untuk 1000 titik = ~700KB. Sangat ringan.

**Q: Apakah harus pakai WebSocket?**
A: Tidak wajib. Untuk MVP, bisa pakai HTTP polling (website request data setiap 5 detik).

**Q: Bagaimana handle multiple robot?**
A: Sudah di-support via `robot_id`. Tinggal tambah robot baru dengan ID berbeda.
