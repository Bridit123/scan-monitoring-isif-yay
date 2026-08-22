/**
 * AQUASCAN — Sidebar Module
 * Handles sidebar list rendering, search, and item selection
 */

// ============================================
// Render Sidebar List
// ============================================
function renderSidebarList(data, filter) {
  filter = filter || '';
  const list = document.getElementById('sidebarList');
  list.innerHTML = '';

  const filtered = filter
    ? data.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.id.toLowerCase().includes(filter.toLowerCase())
      )
    : data;

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>Tidak ada titik ditemukan</p>
      </div>
    `;
    return;
  }

  filtered.forEach(function(p) {
    const cat = ipCategory(p.ip);
    const isLatest = p.idx === data.length - 1;
    const item = document.createElement('div');
    item.className = 'point-item' + (p.idx === selectedIdx ? ' active' : '');
    item.setAttribute('data-idx', p.idx);
    item.innerHTML = `
      <span class="point-dot" style="background:${cat.color}"></span>
      <div class="point-info">
        <div class="point-id">${p.id}${isLatest ? ' · Terbaru' : ''}</div>
        <div class="point-name">${p.name}</div>
        <div class="point-coord">${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}</div>
      </div>
      <span class="point-ip" style="background:${cat.bg}; color:${cat.color}">IP ${p.ip}</span>
    `;
    item.addEventListener('click', function() {
      selectPoint(p.idx);
      // On mobile, close sidebar after selection
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
    list.appendChild(item);
  });
}

// ============================================
// Update Sidebar Active State
// ============================================
function updateSidebarActiveState(idx) {
  document.querySelectorAll('.point-item').forEach(function(el) {
    el.classList.toggle('active', parseInt(el.dataset.idx) === idx);
  });
}
