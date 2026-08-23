/**
 * [Your_Name] — App Entry Point
 * Main application logic, event listeners, routing, and state management
 */

// ============================================
// Application State
// ============================================
let currentData = [];
let selectedIdx = -1;
let mapInitialized = false;
let currentPage = 'Home';

// ============================================
// Page Navigation / SPA Routing
// ============================================
function navigateTo(page) {
  currentPage = page;

  // Hide all pages
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  // Show target page
  var pageId = page === 'Home' ? 'pageHome' : 'pageApp';
  document.getElementById(pageId).classList.add('active');

  // Update nav active state
  document.querySelectorAll('.topnav a').forEach(function(a) {
    a.classList.remove('active');
  });

  if (page === 'Home') {
    document.getElementById('navBeranda').classList.add('active');
    document.body.classList.add('page-scrollable');
    window.scrollTo(0, 0);
  } else {
    document.getElementById('navPeta').classList.add('active');
    document.body.classList.remove('page-scrollable');

    // Initialize map only on first visit
    if (!mapInitialized) {
      initMap();
      renderAll('ciliwung');
      mapInitialized = true;
    } else {
      // Resize map in case it was hidden
      setTimeout(function() { mainMap.invalidateSize(); }, 100);
    }
  }
}

// ============================================
// Select Point (central handler)
// ============================================
function selectPoint(idx) {
  selectedIdx = idx;
  var p = currentData[idx];
  var cat = ipCategory(p.ip);

  // Update sidebar active state
  updateSidebarActiveState(idx);

  // Update marker styles (highlight selected)
  markers.forEach(function(m, i) {
    var markerCat = ipCategory(currentData[i].ip);
    var isLatest = i === currentData.length - 1;
    var isActive = i === idx;
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
  var now = new Date();
  var opts = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  var ts = now.toLocaleString('id-ID', opts) + ' WIB';
  document.getElementById('headerTimestamp').textContent = ts;
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', function() {

  // Initialize homepage
  initHomepage();

  // Update timestamp
  updateTimestamp();

  // ---- Navigation ----
  document.getElementById('navBeranda').addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('Home');
  });

  document.getElementById('navPeta').addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo('App');
  });

  // Dashboard & Dataset — not yet implemented
  document.getElementById('navDashboard').addEventListener('click', function(e) {
    e.preventDefault();
  });
  document.getElementById('navData').addEventListener('click', function(e) {
    e.preventDefault();
  });

  // Hero CTA button → navigate to map
  document.getElementById('ctaPeta').addEventListener('click', function() {
    navigateTo('App');
  });

  // Footer navigation
  var footerBeranda = document.getElementById('footerNavBeranda');
  if (footerBeranda) {
    footerBeranda.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo('Home');
    });
  }
  var footerPeta = document.getElementById('footerNavPeta');
  if (footerPeta) {
    footerPeta.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo('App');
    });
  }

  // ---- Map Page Events (deferred, set up once map exists) ----
  document.getElementById('locationSelect').addEventListener('change', function(e) {
    if (mapInitialized) {
      renderAll(e.target.value);
    }
  });

  document.getElementById('searchInput').addEventListener('input', function(e) {
    renderSidebarList(currentData, e.target.value);
  });

  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (mapInitialized && mainMap) {
      mainMap.invalidateSize();
    }
  });
});
