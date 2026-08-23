/**
 * [Your_Name] — Map Module
 * Handles Leaflet map initialization, markers, and routing
 */

let mainMap = null;
let miniMap = null;
let markers = [];
let routeLine = null;
let miniMarker = null;

// ============================================
// Initialize Maps
// ============================================
function initMap() {
  mainMap = L.map('mainMap', {
    center: [-6.38, 106.835],
    zoom: 14,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mainMap);

  // Mini map for detail panel
  miniMap = L.map('detailMiniMap', {
    center: [-6.38, 106.835],
    zoom: 17,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(miniMap);
}

// ============================================
// Create Custom Marker Icon
// ============================================
function createMarkerIcon(color, label, isLatest) {
  const size = isLatest ? 34 : 28;
  const cls = 'custom-marker' + (isLatest ? ' custom-marker-latest' : '');
  return L.divIcon({
    className: '',
    html: `<div class="${cls}" style="background:${color};">
             <div class="custom-marker-inner">${label}</div>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

// ============================================
// Render Map Markers & Route
// ============================================
function renderMapMarkers(data) {
  // Clear old markers
  markers.forEach(m => mainMap.removeLayer(m));
  markers = [];
  if (routeLine) mainMap.removeLayer(routeLine);

  // Route line (dashed teal)
  const latLngs = data.map(p => [p.lat, p.lng]);
  routeLine = L.polyline(latLngs, {
    color: '#0D9488',
    weight: 3,
    opacity: 0.5,
    dashArray: '8 6',
    lineCap: 'round',
  }).addTo(mainMap);

  // Create markers
  data.forEach((p, idx) => {
    const cat = ipCategory(p.ip);
    const isLatest = idx === data.length - 1;
    const icon = createMarkerIcon(cat.color, idx + 1, isLatest);

    const marker = L.marker([p.lat, p.lng], { icon })
      .addTo(mainMap);

    // Popup content
    const popupHTML = `
      <div class="popup-content">
        <div class="popup-id">${p.id}</div>
        <div class="popup-name">${p.name}</div>
        <div class="popup-coord">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
        <div class="popup-grid popup-grid-3">
          <div><div class="popup-param">pH</div><div class="popup-val">${p.ph}</div></div>
          <div><div class="popup-param">Salinitas</div><div class="popup-val">${p.salinity} <small>ppt</small></div></div>
          <div><div class="popup-param">TDS</div><div class="popup-val">${p.tds} <small>ppm</small></div></div>
          <div><div class="popup-param">Minyak</div><div class="popup-val">${p.oil} <small>mg/L</small></div></div>
          <div><div class="popup-param">Partikel</div><div class="popup-val">${p.particle} <small>NTU</small></div></div>
          <div><div class="popup-param">Suhu</div><div class="popup-val">${p.waterTemp} <small>°C</small></div></div>
        </div>
        <div class="popup-badge" style="background:${cat.bg}; color:${cat.color};">
          <span class="popup-badge-dot" style="background:${cat.color}"></span>
          ${cat.label} · IP ${p.ip}
        </div>
      </div>
    `;

    marker.bindPopup(popupHTML, { maxWidth: 280 });

    marker.on('click', () => {
      selectPoint(idx);
    });

    markers.push(marker);
  });

  // Fit map bounds to show all markers
  mainMap.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
}

// ============================================
// Update Mini Map
// ============================================
function updateMiniMap(p, idx, cat) {
  setTimeout(() => {
    miniMap.invalidateSize();
    miniMap.setView([p.lat, p.lng], 17);
    if (miniMarker) miniMap.removeLayer(miniMarker);

    const miniIcon = L.divIcon({
      className: '',
      html: `<div class="custom-marker" style="background:${cat.color}; width:30px !important; height:30px !important;">
               <div class="custom-marker-inner" style="font-size:10px">${idx + 1}</div>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
    miniMarker = L.marker([p.lat, p.lng], { icon: miniIcon }).addTo(miniMap);
  }, 100);
}
