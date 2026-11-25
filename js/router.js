/* ==========================================================================
   LapStock SPA Router & Role-Based Access Control (24 Sitemap Pages)
   ========================================================================== */

window.LapRouter = (function () {
  const S = () => window.LapStore;

  const ALL_INTERNAL = ['admin_gudang', 'teknisi', 'kasir', 'pemilik'];
  let dirtyGuardFn = null;

  const ROUTES = [
    // Area Publik (Pelanggan)
    { code: 'PU-01', pattern: /^\/$/, roles: null, shell: 'public', handler: (root) => window.LapViews.Public.renderHome(root) },
    { code: 'PU-02', pattern: /^\/katalog$/, roles: null, shell: 'public', handler: (root) => window.LapViews.Public.renderCatalog(root) },
    { code: 'PU-03', pattern: /^\/katalog\/([^/]+)$/, roles: null, shell: 'public', handler: (root, m) => window.LapViews.Public.renderUnitDetail(root, decodeURIComponent(m[1])) },
    { code: 'PU-04', pattern: /^\/cek-status$/, roles: null, shell: 'public', handler: (root, m, q) => window.LapViews.Public.renderCheckStatus(root, q.get('kode') || '') },
    { code: 'PU-05', pattern: /^\/info-toko$/, roles: null, shell: 'public', handler: (root) => window.LapViews.Public.renderStoreInfo(root) },

    // Autentikasi dan Umum
    { code: 'AU-01', pattern: /^\/login$/, roles: null, shell: 'bare', handler: (root) => window.LapViews.Auth.renderLogin(root) },
    { code: 'AU-02', pattern: /^\/dashboard$/, roles: ALL_INTERNAL, shell: 'internal', nav: 'dashboard', handler: (c) => window.LapViews.Auth.renderDashboard(c) },
    { code: 'AU-03', pattern: /^\/profil$/, roles: ALL_INTERNAL, shell: 'internal', nav: 'profil', handler: (c) => window.LapViews.Auth.renderProfile(c) },

    // Inventaris
    { code: 'IV-01', pattern: /^\/inventaris$/, roles: ['admin_gudang', 'pemilik'], shell: 'internal', nav: 'inventaris', handler: (c) => window.LapViews.Inventory.renderList(c) },
    { code: 'IV-02', pattern: /^\/inventaris\/tambah$/, roles: ['admin_gudang'], shell: 'internal', nav: 'inventaris', handler: (c) => window.LapViews.Inventory.renderAddUnit(c) },
    { code: 'IV-05', pattern: /^\/inventaris\/rekap$/, roles: ['admin_gudang'], shell: 'internal', nav: 'rekap', handler: (c) => window.LapViews.Inventory.renderRekap(c) },
    { code: 'IV-04', pattern: /^\/inventaris\/([^/]+)\/ubah$/, roles: ['admin_gudang'], shell: 'internal', nav: 'inventaris', handler: (c, m) => window.LapViews.Inventory.renderEditUnit(c, decodeURIComponent(m[1])) },
    { code: 'IV-03', pattern: /^\/inventaris\/([^/]+)$/, roles: ['admin_gudang', 'pemilik'], shell: 'internal', nav: 'inventaris', handler: (c, m) => window.LapViews.Inventory.renderDetail(c, decodeURIComponent(m[1])) },

    // Teknis
    { code: 'TK-01', pattern: /^\/teknisi\/antrean$/, roles: ['teknisi', 'admin_gudang'], shell: 'internal', nav: 'teknisi', handler: (c) => window.LapViews.Technician.renderQueue(c) },
    { code: 'TK-02', pattern: /^\/teknisi\/unit\/([^/]+)$/, roles: ['teknisi', 'admin_gudang'], shell: 'internal', nav: 'teknisi', handler: (c, m) => window.LapViews.Technician.renderJobDetail(c, decodeURIComponent(m[1])) },

    // Penjualan
    { code: 'TR-01', pattern: /^\/transaksi\/pencarian$/, roles: ['kasir'], shell: 'internal', nav: 'pencarian', handler: (c) => window.LapViews.Sales.renderStockSearch(c) },
    { code: 'TR-02', pattern: /^\/transaksi\/baru$/, roles: ['kasir'], shell: 'internal', nav: 'transaksi-baru', handler: (c) => window.LapViews.Sales.renderNewTransaction(c) },
    { code: 'TR-04', pattern: /^\/transaksi$/, roles: ['kasir', 'pemilik'], shell: 'internal', nav: 'riwayat', handler: (c) => window.LapViews.Sales.renderHistory(c) },
    { code: 'TR-03', pattern: /^\/transaksi\/([^/]+)$/, roles: ['kasir', 'pemilik'], shell: 'internal', nav: 'riwayat', handler: (c, m) => window.LapViews.Sales.renderReceipt(c, decodeURIComponent(m[1])) },

    // Laporan & Pengguna (Pemilik Toko)
    { code: 'LP-01', pattern: /^\/laporan\/penjualan$/, roles: ['pemilik'], shell: 'internal', nav: 'laporan', handler: (c) => window.LapViews.ReportsUsers.renderSalesReport(c) },
    { code: 'LP-02', pattern: /^\/laporan\/keuangan$/, roles: ['pemilik'], shell: 'internal', nav: 'laporan', handler: (c) => window.LapViews.ReportsUsers.renderFinanceReport(c) },
    { code: 'LP-03', pattern: /^\/laporan\/stok$/, roles: ['pemilik'], shell: 'internal', nav: 'laporan', handler: (c) => window.LapViews.ReportsUsers.renderStockReport(c) },
    { code: 'PG-01', pattern: /^\/pengguna$/, roles: ['pemilik'], shell: 'internal', nav: 'pengguna', handler: (c) => window.LapViews.ReportsUsers.renderUserList(c) },
    { code: 'PG-02', pattern: /^\/pengguna\/tambah$/, roles: ['pemilik'], shell: 'internal', nav: 'pengguna', handler: (c) => window.LapViews.ReportsUsers.renderUserForm(c, null) },
    { code: 'PG-02', pattern: /^\/pengguna\/([^/]+)\/ubah$/, roles: ['pemilik'], shell: 'internal', nav: 'pengguna', handler: (c, m) => window.LapViews.ReportsUsers.renderUserForm(c, decodeURIComponent(m[1])) }
  ];

  function parseHash() {
    const raw = (window.location.hash || '#/').replace(/^#/, '') || '/';
    const [pathPart, queryPart] = raw.split('?');
    const path = pathPart.startsWith('/') ? pathPart : '/' + pathPart;
    return { path, query: new URLSearchParams(queryPart || '') };
  }

  function setDirtyGuard(fn) {
    dirtyGuardFn = fn;
  }

  function navigate(targetPath, force = false) {
    if (!force && dirtyGuardFn && dirtyGuardFn()) {
      window.LapApp.openModal({
        title: 'Perubahan Belum Disimpan',
        confirmClass: 'btn-danger',
        confirmLabel: 'Tinggalkan Halaman',
        body: '<p style="margin:0;">Anda memiliki isian formulir yang belum disimpan. Yakin ingin keluar dan membuang perubahan tersebut?</p>',
        onConfirm: () => {
          dirtyGuardFn = null;
          window.location.hash = '#' + targetPath;
        }
      });
      return;
    }
    dirtyGuardFn = null;
    const nextHash = '#' + targetPath;
    if (window.location.hash === nextHash) {
      resolve();
    } else {
      window.location.hash = nextHash;
    }
  }

  function resolve() {
    dirtyGuardFn = null;
    const { path, query } = parseHash();
    const role = S().getCurrentRole();
    const root = document.getElementById('app');

    let matched = null;
    let params = null;
    for (const r of ROUTES) {
      const m = path.match(r.pattern);
      if (m) {
        matched = r;
        params = m;
        break;
      }
    }

    if (!matched) {
      window.LapApp.updateDemoBar('404');
      window.LapViews.Auth.renderAccessDenied(root, path, ALL_INTERNAL);
      return;
    }

    // RBAC Check (Tabel 5.2)
    if (matched.roles && !matched.roles.includes(role)) {
      window.LapApp.updateDemoBar('403');
      if (role === 'pelanggan') {
        root.innerHTML = `<div class="public-main"></div>`;
        window.LapViews.Auth.renderAccessDenied(root.firstElementChild, path, matched.roles);
      } else {
        const content = window.LapApp.mountInternalShell('');
        window.LapViews.Auth.renderAccessDenied(content, path, matched.roles);
      }
      window.scrollTo(0, 0);
      return;
    }

    window.LapApp.updateDemoBar(matched.code);

    if (matched.shell === 'internal') {
      const content = window.LapApp.mountInternalShell(matched.nav);
      matched.handler(content, params, query);
    } else {
      matched.handler(root, params, query);
    }
    window.scrollTo(0, 0);
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { init, navigate, resolve, setDirtyGuard };
})();
