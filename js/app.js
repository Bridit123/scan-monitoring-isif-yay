/**
 * AQUASCAN — App Entry Point
 * Main application logic, event listeners, and state management
 */

// ============================================
// Application State
// ============================================
let currentData = [];
let selectedIdx = -1;

// ============================================
// Select Point (central handler)
// ============================================
function selectPoint(idx) {
  selectedIdx = idx;
  const p = currentData[idx];
  const cat = ipCategory(p.ip);

  // Update sidebar active state
  updateSidebarActiveState(idx);

  // Update marker styles (highlight selected)
  markers.forEach(function(m, i) {
    const markerCat = ipCategory(currentData[i].ip);
    const isLatest = i === currentData.length - 1;
    const isActive = i === idx;
    m.setIcon(createMarkerIcon(markerCat.color, i + 1, isLatest || isActive));
    m.setZIndexOffset(isActive ? 1000 : 0);
  });

  // Pan map to selected point
  mainMap.flyTo([p.lat, p.lng], 16, { duration: 0.8 });

  // Open popup
  markers[idx].openPopup();

  // Open detail panel
  openDetailPanel(p, idx);
}

// ============================================
// Render All
// ============================================
function renderAll(loc) {
  currentData = generateData(loc);
  selectedIdx = -1;

  // Close detail panel if open
  document.getElementById('detailPanel').classList.remove('open');

  // Update sidebar
  renderSidebarList(currentData);
  document.getElementById('pointCount').textContent = currentData.length;
  document.getElementById('infoLive').textContent = currentData.length;

  // Render markers on map
  renderMapMarkers(currentData);

  // Clear search
  document.getElementById('searchInput').value = '';

  // Update timestamp
  updateTimestamp();

  // Re-fit map after a short delay
  setTimeout(function() { mainMap.invalidateSize(); }, 100);
}

// ============================================
// Update Timestamp
// ============================================
function updateTimestamp() {
  const now = new Date();
  const opts = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const ts = now.toLocaleString('id-ID', opts) + ' WIB';
  document.getElementById('headerTimestamp').textContent = ts;
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize maps
  initMap();

  // Initial render
  renderAll('ciliwung');

  // Location dropdown change
  document.getElementById('locationSelect').addEventListener('change', function(e) {
    renderAll(e.target.value);
  });

  // Search input
  document.getElementById('searchInput').addEventListener('input', function(e) {
    renderSidebarList(currentData, e.target.value);
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Close sidebar when clicking on map (mobile)
  mainMap.on('click', function() {
    if (window.innerWidth <= 768) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    mainMap.invalidateSize();
  });
});
