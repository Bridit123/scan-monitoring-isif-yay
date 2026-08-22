/**
 * AQUASCAN — Detail Panel Module
 * Handles the bottom detail panel with sensor data and mini map
 */

// ============================================
// Sparkline SVG Generator
// ============================================
function sparklineSVG(values, highlightIdx, color) {
  const w = 100, h = 26;
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const range = (max - min) || 1;
  const step = w / (values.length - 1);

  const pts = values.map(function(v, i) {
    return {
      x: i * step,
      y: h - 2 - ((v - min) / range) * (h - 4)
    };
  });

  const pathD = pts.map(function(p, i) {
    return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
  }).join(' ');

  const hp = pts[highlightIdx];

  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" style="display:block">' +
    '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="1.8" opacity="0.7"/>' +
    '<circle cx="' + hp.x.toFixed(1) + '" cy="' + hp.y.toFixed(1) + '" r="3" fill="' + color + '" stroke="#fff" stroke-width="1.5"/>' +
    '</svg>';
}

// ============================================
// Open Detail Panel
// ============================================
function openDetailPanel(p, idx) {
  const panel = document.getElementById('detailPanel');
  const info = document.getElementById('detailInfo');
  const cat = ipCategory(p.ip);
  const isLatest = idx === currentData.length - 1;

  info.innerHTML = `
    <div class="detail-header animate-in">
      <div class="detail-header-left">
        <div class="detail-id">${p.id}${isLatest ? ' · Titik Terbaru' : ''}</div>
        <div class="detail-name">${p.name}</div>
        <div class="detail-loc">${p.locLabel}</div>
        <div class="detail-coord">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
      </div>
      <button class="detail-close-btn" id="detailCloseBtn" aria-label="Tutup detail">✕</button>
    </div>

    <div class="detail-ip-row animate-in" style="animation-delay:0.05s">
      <div class="detail-ip-badge" style="background:${cat.bg}; color:${cat.color};">
        <span class="dot" style="background:${cat.color}"></span>
        ${cat.label}
      </div>
      <div class="detail-ip-info">
        Indeks Pencemar: <strong>${p.ip}</strong> · Titik ke-${idx + 1} dari ${currentData.length}
      </div>
    </div>

    <div class="detail-sensors-title animate-in" style="animation-delay:0.1s">Data Sensor</div>
    <div class="detail-sensors-grid animate-in" style="animation-delay:0.15s">
      <div class="sensor-card" style="border-left-color:${cat.color}">
        <div class="sensor-label">pH Air</div>
        <div class="sensor-value">${p.ph}</div>
        <div class="sensor-sparkline">${sparklineSVG(currentData.map(function(d) { return d.ph; }), idx, cat.color)}</div>
      </div>
      <div class="sensor-card" style="border-left-color:${cat.color}">
        <div class="sensor-label">TDS</div>
        <div class="sensor-value">${p.tds}<span class="sensor-unit">ppm</span></div>
        <div class="sensor-sparkline">${sparklineSVG(currentData.map(function(d) { return d.tds; }), idx, cat.color)}</div>
      </div>
      <div class="sensor-card" style="border-left-color:${cat.color}">
        <div class="sensor-label">Turbiditas</div>
        <div class="sensor-value">${p.turbidity}<span class="sensor-unit">NTU</span></div>
        <div class="sensor-sparkline">${sparklineSVG(currentData.map(function(d) { return d.turbidity; }), idx, cat.color)}</div>
      </div>
      <div class="sensor-card" style="border-left-color:${cat.color}">
        <div class="sensor-label">Suhu Air</div>
        <div class="sensor-value">${p.temp}<span class="sensor-unit">°C</span></div>
        <div class="sensor-sparkline">${sparklineSVG(currentData.map(function(d) { return d.temp; }), idx, cat.color)}</div>
      </div>
    </div>
  `;

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
