/**
 * [Your_Name] — Detail Panel Module
 * Handles the bottom detail panel with sensor data and mini map
 */

// ============================================
// Sparkline SVG Generator
// ============================================
function sparklineSVG(values, highlightIdx, color) {
  var w = 100, h = 26;
  var min = Math.min.apply(null, values.filter(function(v) { return v !== null; }));
  var max = Math.max.apply(null, values.filter(function(v) { return v !== null; }));
  var range = (max - min) || 1;
  var step = w / (values.length - 1);

  var pts = values.map(function(v, i) {
    var val = v !== null ? v : 0;
    return {
      x: i * step,
      y: h - 2 - ((val - min) / range) * (h - 4)
    };
  });

  var pathD = pts.map(function(p, i) {
    return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
  }).join(' ');

  var hp = pts[highlightIdx];

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="display:block">' +
    '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="1.8" opacity="0.7"/>' +
    '<circle cx="' + hp.x.toFixed(1) + '" cy="' + hp.y.toFixed(1) + '" r="3" fill="' + color + '" stroke="#fff" stroke-width="1.5"/>' +
    '</svg>';
}

// ============================================
// Open Detail Panel
// ============================================
function openDetailPanel(p, idx) {
  var panel = document.getElementById('detailPanel');
  var info = document.getElementById('detailInfo');
  var cat = ipCategory(p.ip);
  var isLatest = idx === currentData.length - 1;

  // Build sensor cards — 6 sensors
  var sensorCards = '';

  // 1. pH
  sensorCards += '<div class="sensor-card" style="border-left-color:' + cat.color + '">' +
    '<div class="sensor-label">pH Air</div>' +
    '<div class="sensor-value">' + p.ph + '</div>' +
    '<div class="sensor-sparkline">' + sparklineSVG(currentData.map(function(d) { return d.ph; }), idx, cat.color) + '</div>' +
    '</div>';

  // 2. Salinitas
  sensorCards += '<div class="sensor-card" style="border-left-color:#06B6D4">' +
    '<div class="sensor-label">Salinitas</div>' +
    '<div class="sensor-value">' + p.salinity + '<span class="sensor-unit">ppt</span></div>' +
    '<div class="sensor-sparkline">' + sparklineSVG(currentData.map(function(d) { return d.salinity; }), idx, '#06B6D4') + '</div>' +
    '</div>';

  // 3. TDS
  sensorCards += '<div class="sensor-card" style="border-left-color:' + cat.color + '">' +
    '<div class="sensor-label">TDS</div>' +
    '<div class="sensor-value">' + p.tds + '<span class="sensor-unit">ppm</span></div>' +
    '<div class="sensor-sparkline">' + sparklineSVG(currentData.map(function(d) { return d.tds; }), idx, cat.color) + '</div>' +
    '</div>';

  // 4. Minyak
  sensorCards += '<div class="sensor-card" style="border-left-color:#F59E0B">' +
    '<div class="sensor-label">Minyak</div>' +
    '<div class="sensor-value">' + p.oil + '<span class="sensor-unit">mg/L</span></div>' +
    '<div class="sensor-sparkline">' + sparklineSVG(currentData.map(function(d) { return d.oil; }), idx, '#F59E0B') + '</div>' +
    '</div>';

  // 5. Partikel
  sensorCards += '<div class="sensor-card" style="border-left-color:#F97316">' +
    '<div class="sensor-label">Partikel</div>' +
    '<div class="sensor-value">' + p.particle + '<span class="sensor-unit">NTU</span></div>' +
    '<div class="sensor-sparkline">' + sparklineSVG(currentData.map(function(d) { return d.particle; }), idx, '#F97316') + '</div>' +
    '</div>';

  // 6. Oksigen (planned — show N/A)
  sensorCards += '<div class="sensor-card" style="border-left-color:#10B981; opacity:0.5;">' +
    '<div class="sensor-label">Oksigen <span style="font-size:8px;color:#10B981;background:rgba(16,185,129,0.1);padding:1px 5px;border-radius:99px;">SEGERA</span></div>' +
    '<div class="sensor-value" style="color:var(--muted)">—</div>' +
    '</div>';

  info.innerHTML =
    '<div class="detail-header animate-in">' +
      '<div class="detail-header-left">' +
        '<div class="detail-id">' + p.id + (isLatest ? ' · Titik Terbaru' : '') + '</div>' +
        '<div class="detail-name">' + p.name + '</div>' +
        '<div class="detail-loc">' + p.locLabel + '</div>' +
        '<div class="detail-coord">' + p.lat.toFixed(4) + ', ' + p.lng.toFixed(4) + '</div>' +
      '</div>' +
      '<button class="detail-close-btn" id="detailCloseBtn" aria-label="Tutup detail">✕</button>' +
    '</div>' +
    '<div class="detail-ip-row animate-in" style="animation-delay:0.05s">' +
      '<div class="detail-ip-badge" style="background:' + cat.bg + '; color:' + cat.color + ';">' +
        '<span class="dot" style="background:' + cat.color + '"></span>' +
        cat.label +
      '</div>' +
      '<div class="detail-ip-info">' +
        'Indeks Pencemar: <strong>' + p.ip + '</strong> · Titik ke-' + (idx + 1) + ' dari ' + currentData.length +
        ' · Suhu: <strong>' + p.waterTemp + '°C</strong>' +
      '</div>' +
    '</div>' +
    '<div class="detail-sensors-title animate-in" style="animation-delay:0.1s">Data Sensor</div>' +
    '<div class="detail-sensors-grid detail-sensors-grid-6 animate-in" style="animation-delay:0.15s">' +
      sensorCards +
    '</div>';

  // Close button
  document.getElementById('detailCloseBtn').addEventListener('click', closeDetailPanel);

  // Update mini map title & view
  document.getElementById('detailMinimapTitle').textContent = 'Map Lokasi ' + p.name;
  updateMiniMap(p, idx, cat);

  // Open panel
  panel.classList.add('open');

  // Resize main map after panel opens
  setTimeout(function() { mainMap.invalidateSize(); }, 450);
}

// ============================================
// Close Detail Panel
// ============================================
function closeDetailPanel() {
  var panel = document.getElementById('detailPanel');
  panel.classList.remove('open');
  selectedIdx = -1;
  document.querySelectorAll('.point-item').forEach(function(el) {
    el.classList.remove('active');
  });
  markers.forEach(function(m) { m.closePopup(); });
  setTimeout(function() { mainMap.invalidateSize(); }, 450);
}
