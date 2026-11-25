/* ==========================================================================
   LapStock Application Shell, Navigation, Modal, Drawer & Toast Manager
   ========================================================================== */

window.LapApp = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  let sidebarCollapsed = false;

  // Role-based sidebar menu items (strictly matching Tabel 5.2)
  function getSidebarItems(role) {
    const items = [{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard', route: '/dashboard' }];
    if (role === 'admin_gudang') {
      items.push(
        { id: 'inventaris', label: 'Inventaris', icon: 'box', route: '/inventaris' },
        { id: 'rekap', label: 'Rekap Stok Fisik', icon: 'clipboard', route: '/inventaris/rekap' },
        { id: 'teknisi', label: 'Antrean Teknis', icon: 'wrench', route: '/teknisi/antrean', readOnly: true }
      );
    } else if (role === 'teknisi') {
      items.push(
        { id: 'teknisi', label: 'Antrean Teknis', icon: 'wrench', route: '/teknisi/antrean' }
      );
    } else if (role === 'kasir') {
      items.push(
        { id: 'pencarian', label: 'Pencarian Stok', icon: 'search', route: '/transaksi/pencarian' },
        { id: 'transaksi-baru', label: 'Transaksi Baru', icon: 'cart', route: '/transaksi/baru' },
        { id: 'riwayat', label: 'Riwayat Transaksi', icon: 'history', route: '/transaksi' }
      );
    } else if (role === 'pemilik') {
      items.push(
        { id: 'inventaris', label: 'Inventaris', icon: 'box', route: '/inventaris', readOnly: true },
        { id: 'riwayat', label: 'Riwayat Transaksi', icon: 'history', route: '/transaksi', readOnly: true },
        { id: 'laporan', label: 'Laporan', icon: 'chart', route: '/laporan/penjualan' },
        { id: 'pengguna', label: 'Kelola Pengguna', icon: 'users', route: '/pengguna' }
      );
    }
    return items;
  }

  function mountInternalShell(activeNavId) {
    const root = document.getElementById('app');
    const user = S().getCurrentUser() || { nama: 'Pengguna', role: S().getCurrentRole() };
    const role = S().getCurrentRole();
    const roleLabel = S().ROLE_INFO[role]?.label || role;
    const initials = user.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const menuItems = getSidebarItems(role);
    const cartCount = S().getState().cart.length;

    root.innerHTML = `
      <div class="internal-shell">
        <aside id="app-sidebar" class="sidebar no-print ${sidebarCollapsed ? 'collapsed' : ''}" aria-label="Menu Samping Internal">
          <div class="sidebar-header">
            <a href="#/dashboard" class="brand-logo">
              <span class="brand-mark">${SVG().icon('laptop', 17)}</span>
              <span class="brand-text">LapStock</span>
            </a>
            <button type="button" id="btn-collapse-sidebar" class="icon-btn" title="Ciutkan / lebarkan sidebar" aria-label="Toggle sidebar">
              ${SVG().icon('panelLeft', 17)}
            </button>
          </div>
          <nav class="sidebar-nav">
            ${menuItems.map(item => `
              <a href="#${item.route}" class="sidebar-item ${activeNavId === item.id ? 'active' : ''}" title="${item.label}">
                <span class="sidebar-item-left">
                  ${SVG().icon(item.icon, 17)}
                  <span class="sidebar-label">${item.label}</span>
                </span>
                ${item.readOnly ? '<span class="sidebar-ro-pill">Baca</span>' : ''}
              </a>
            `).join('')}
          </nav>
          <div class="sidebar-footer">
            <a href="#/" class="sidebar-item" title="Lihat Katalog Publik">
              <span class="sidebar-item-left">
                ${SVG().icon('eye', 16)}
                <span class="sidebar-label">Area Publik</span>
              </span>
            </a>
          </div>
        </aside>

        <div class="internal-main-wrap">
          <header class="topbar no-print">
            <div class="topbar-left">
              <button type="button" id="btn-mobile-sidebar" class="mobile-menu-btn" aria-label="Buka menu">
                ${SVG().icon('menu', 18)}
              </button>
              <form id="topbar-sn-form" class="topbar-search">
                <span class="search-icon">${SVG().icon('search', 16)}</span>
                <input type="text" id="topbar-sn-input" placeholder="Cari cepat nomor seri / kode unit lalu tekan Enter..." />
              </form>
            </div>

            <div class="topbar-right">
              ${role === 'kasir' ? `
                <a href="#/transaksi/baru" class="cart-chip" id="topbar-cart-chip">
                  ${SVG().icon('cart', 16)}
                  <span>Keranjang</span>
                  <span class="cart-count" id="topbar-cart-count">${cartCount}</span>
                </a>
              ` : ''}

              <div class="user-menu-wrap">
                <button type="button" id="user-menu-trigger" class="user-menu-btn" aria-expanded="false">
                  <span class="avatar-circle">${initials}</span>
                  <span class="user-meta">
                    <span class="user-meta-name">${S().escapeHtml(user.nama)}</span><br/>
                    <span class="user-meta-role">${roleLabel}</span>
                  </span>
                  ${SVG().icon('chevronDown', 14)}
                </button>
                <div id="user-dropdown" class="user-dropdown hidden">
                  <a href="#/profil" class="user-dropdown-item">${SVG().icon('user', 15)} Profil Saya</a>
                  <button type="button" id="topbar-logout-btn" class="user-dropdown-item danger">${SVG().icon('logout', 15)} Keluar</button>
                </div>
              </div>
            </div>
          </header>

          <main id="internal-content" class="internal-content"></main>
        </div>
      </div>
    `;

    // Sidebar collapse
    const sidebar = root.querySelector('#app-sidebar');
    root.querySelector('#btn-collapse-sidebar').addEventListener('click', () => {
      sidebarCollapsed = !sidebarCollapsed;
      sidebar.classList.toggle('collapsed', sidebarCollapsed);
    });

    // Mobile sidebar drawer
    const mobBtn = root.querySelector('#btn-mobile-sidebar');
    if (mobBtn) {
      mobBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }

    // Quick SN search in Topbar (Tabel 5.3 AU-02: routes to IV-03, TK-02, or TR-01 based on role)
    root.querySelector('#topbar-sn-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = root.querySelector('#topbar-sn-input').value.trim();
      if (!q) return;
      const found = S().getState().units.find(
        u => u.serialNumber.toLowerCase() === q.toLowerCase() || u.kode.toLowerCase() === q.toLowerCase() || u.model.toLowerCase().includes(q.toLowerCase())
      );
      if (!found) {
        toast('Unit tidak ditemukan', `Tidak ada unit yang cocok dengan "${q}".`, 'warning');
        return;
      }
      if (role === 'admin_gudang' || role === 'pemilik') {
        window.LapRouter.navigate('/inventaris/' + found.id);
      } else if (role === 'teknisi') {
        window.LapRouter.navigate('/teknisi/unit/' + found.id);
      } else if (role === 'kasir') {
        window.LapRouter.navigate('/transaksi/pencarian');
      }
    });

    // User dropdown
    const trigger = root.querySelector('#user-menu-trigger');
    const dd = root.querySelector('#user-dropdown');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dd.classList.toggle('hidden');
      trigger.setAttribute('aria-expanded', dd.classList.contains('hidden') ? 'false' : 'true');
    });
    document.addEventListener('click', () => dd.classList.add('hidden'), { once: true });

    root.querySelector('#topbar-logout-btn').addEventListener('click', () => {
      S().logout();
      toast('Keluar berhasil', 'Sesi internal telah diakhiri.', 'info');
      window.LapRouter.navigate('/login');
    });

    return root.querySelector('#internal-content');
  }

  function refreshTopbarCart() {
    const el = document.getElementById('topbar-cart-count');
    if (el) el.textContent = S().getState().cart.length;
  }

  // ==================== DEMO ROLE SWITCHER BAR ====================
  function updateDemoBar(pageCode) {
    const codeEl = document.getElementById('demo-page-code');
    const restoreCode = document.getElementById('demo-restore-code');
    if (codeEl) codeEl.textContent = `[${pageCode}]`;
    if (restoreCode) restoreCode.textContent = `[${pageCode}]`;

    const role = S().getCurrentRole();
    document.querySelectorAll('#demo-role-pills [data-switch-role]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.switchRole === role);
    });
  }

  function bindDemoBar() {
    document.querySelectorAll('#demo-role-pills [data-switch-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextRole = btn.dataset.switchRole;
        const user = S().switchRoleDemo(nextRole);
        if (nextRole === 'pelanggan') {
          toast('Mode Pelanggan (Publik)', 'Menampilkan area publik LapStock tanpa login.', 'info');
          window.LapRouter.navigate('/', true);
        } else {
          toast(`Beralih ke peran ${S().ROLE_INFO[nextRole].label}`, `Masuk sebagai ${user.nama}.`, 'info');
          window.LapRouter.navigate('/dashboard', true);
        }
      });
    });

    document.getElementById('btn-test-403').addEventListener('click', () => {
      const role = S().getCurrentRole();
      // Navigate to a route explicitly outside the current role's authority
      const forbiddenRoute = role === 'pemilik' ? '/inventaris/tambah' : '/pengguna';
      window.LapRouter.navigate(forbiddenRoute, true);
    });

    document.getElementById('btn-reset-demo').addEventListener('click', () => {
      openModal({
        title: 'Reset Data Demo',
        confirmClass: 'btn-danger',
        confirmLabel: 'Ya, Reset Data',
        body: '<p style="margin:0;">Seluruh unit, transaksi, riwayat modifikasi, dan akun pengguna akan dikembalikan ke data awal demo.</p>',
        onConfirm: () => {
          S().reset();
          toast('Data demo direset', 'Seluruh data kembali ke kondisi awal.', 'info');
          window.LapRouter.navigate('/', true);
        }
      });
    });

    const demoBar = document.getElementById('demo-bar');
    const restoreBtn = document.getElementById('demo-bar-restore');
    document.getElementById('btn-toggle-demo').addEventListener('click', () => {
      demoBar.classList.add('hidden');
      restoreBtn.classList.remove('hidden');
      document.body.classList.add('demo-collapsed');
    });
    restoreBtn.addEventListener('click', () => {
      demoBar.classList.remove('hidden');
      restoreBtn.classList.add('hidden');
      document.body.classList.remove('demo-collapsed');
    });
  }

  // ==================== MODAL MANAGER ====================
  let currentOnConfirm = null;

  function openModal({ title, body, confirmLabel = 'Konfirmasi', cancelLabel = 'Batal', confirmClass = 'btn-primary', onConfirm }) {
    const backdrop = document.getElementById('modal-backdrop');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    const footer = document.getElementById('modal-footer');
    footer.innerHTML = `
      <button type="button" id="modal-btn-cancel" class="btn btn-secondary">${cancelLabel}</button>
      <button type="button" id="modal-btn-confirm" class="btn ${confirmClass}">${confirmLabel}</button>
    `;
    currentOnConfirm = onConfirm;
    backdrop.classList.remove('hidden');

    document.getElementById('modal-btn-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-btn-confirm').addEventListener('click', () => {
      if (currentOnConfirm) {
        const res = currentOnConfirm();
        if (res === false) return;
      }
      closeModal();
    });
  }

  function closeModal() {
    document.getElementById('modal-backdrop').classList.add('hidden');
    currentOnConfirm = null;
  }

  // ==================== DRAWER MANAGER ====================
  function openDrawer({ title, body, footer = '' }) {
    document.getElementById('drawer-title').textContent = title;
    document.getElementById('drawer-body').innerHTML = body;
    const f = document.getElementById('drawer-footer');
    if (footer) {
      f.innerHTML = footer;
      f.classList.remove('hidden');
    } else {
      f.classList.add('hidden');
    }
    document.getElementById('drawer-backdrop').classList.remove('hidden');
    document.getElementById('drawer-panel').classList.remove('hidden');
  }

  function closeDrawer() {
    document.getElementById('drawer-backdrop').classList.add('hidden');
    document.getElementById('drawer-panel').classList.add('hidden');
  }

  // ==================== TOAST MANAGER (Max 3, Bottom-Right) ====================
  function toast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    while (container.children.length >= 3) {
      container.firstElementChild.remove();
    }
    const iconName = type === 'success' ? 'checkCircle' : (type === 'danger' ? 'alert' : (type === 'warning' ? 'alert' : 'info'));
    const colorMap = { success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span style="color:${colorMap[type]}; flex-shrink:0; margin-top:2px;">${SVG().icon(iconName, 17)}</span>
      <div style="flex:1; min-width:0;">
        <div class="toast-title">${S().escapeHtml(title)}</div>
        ${message ? `<div class="toast-msg">${S().escapeHtml(message)}</div>` : ''}
      </div>
      <button type="button" class="icon-btn" style="width:24px; height:24px;" aria-label="Tutup notifikasi">&times;</button>
    `;
    const remove = () => { if (el.parentNode) el.remove(); };
    el.querySelector('button').addEventListener('click', remove);
    container.appendChild(el);
    setTimeout(remove, 4200);
  }

  function init() {
    bindDemoBar();
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') closeModal();
    });
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('drawer-backdrop').addEventListener('click', closeDrawer);
    window.LapRouter.init();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    mountInternalShell,
    refreshTopbarCart,
    updateDemoBar,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
    toast
  };
})();
