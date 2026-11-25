/* ==========================================================================
   Public Views: PU-01 Beranda, PU-02 Katalog, PU-03 Detail Unit,
                 PU-04 Cek Status Unit, PU-05 Info Toko dan Garansi
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.Public = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  function renderPublicShell(activeNav, contentHtml) {
    const isInternal = S().getCurrentRole() !== 'pelanggan';
    return `
      <div class="public-shell">
        <header class="public-navbar no-print">
          <div class="public-navbar-inner">
            <a href="#/" class="brand-logo">
              <span class="brand-mark">${SVG().icon('laptop', 18)}</span>
              <span>LapStock</span>
            </a>
            <nav class="public-nav-links" aria-label="Navigasi Publik">
              <a href="#/" class="public-nav-link ${activeNav === 'beranda' ? 'active' : ''}">Beranda</a>
              <a href="#/katalog" class="public-nav-link ${activeNav === 'katalog' ? 'active' : ''}">Katalog</a>
              <a href="#/cek-status" class="public-nav-link ${activeNav === 'cek-status' ? 'active' : ''}">Cek Status</a>
              <a href="#/info-toko" class="public-nav-link ${activeNav === 'info-toko' ? 'active' : ''}">Info Toko &amp; Garansi</a>
            </nav>
            <div class="public-navbar-actions">
              ${isInternal
                ? `<a href="#/dashboard" class="btn btn-primary btn-sm">${SVG().icon('dashboard', 15)} Ke Dashboard</a>`
                : `<a href="#/login" class="btn btn-primary btn-sm">${SVG().icon('login', 15)} Masuk</a>`
              }
            </div>
            <button type="button" class="mobile-menu-btn" id="btn-public-mobile-menu" aria-label="Buka menu navigasi">
              ${SVG().icon('menu', 18)}
            </button>
          </div>
          <nav class="public-mobile-nav" id="public-mobile-nav" aria-label="Navigasi Publik Mobile">
            <a href="#/" class="public-nav-link ${activeNav === 'beranda' ? 'active' : ''}">Beranda</a>
            <a href="#/katalog" class="public-nav-link ${activeNav === 'katalog' ? 'active' : ''}">Katalog</a>
            <a href="#/cek-status" class="public-nav-link ${activeNav === 'cek-status' ? 'active' : ''}">Cek Status Unit</a>
            <a href="#/info-toko" class="public-nav-link ${activeNav === 'info-toko' ? 'active' : ''}">Info Toko &amp; Garansi</a>
            <div style="margin-top:8px;">
              <a href="${isInternal ? '#/dashboard' : '#/login'}" class="btn btn-primary" style="width:100%;">
                ${isInternal ? 'Buka Dashboard Internal' : 'Masuk Staf Internal'}
              </a>
            </div>
          </nav>
        </header>

        <main class="public-main">
          ${contentHtml}
        </main>

        <footer class="public-footer no-print">
          <div class="public-footer-inner">
            <div>
              <div class="brand-logo" style="margin-bottom:10px;">
                <span class="brand-mark">${SVG().icon('laptop', 17)}</span>
                <span>LapStock</span>
              </div>
              <p style="margin:0; font-size:13px; max-width:420px;">
                Sistem Informasi Manajemen Inventaris Stok Laptop Bekas dengan pencatatan nomor seri terverifikasi, klasifikasi grade transparan, dan riwayat modifikasi teknis tercatat.
              </p>
            </div>
            <div>
              <div style="font-weight:700; color:var(--text); margin-bottom:10px;">Area Pelanggan</div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:13px;">
                <a href="#/katalog">Katalog Laptop Tersedia</a>
                <a href="#/cek-status">Cek Status Teknis Unit</a>
                <a href="#/info-toko">Alamat Toko &amp; Ketentuan Garansi</a>
              </div>
            </div>
            <div>
              <div style="font-weight:700; color:var(--text); margin-bottom:10px;">Layanan Toko</div>
              <div style="font-size:13px; display:flex; flex-direction:column; gap:6px;">
                <span>Jl. Veteran No. 48, Klojen, Kota Malang</span>
                <span>Senin – Sabtu, 09.00 – 20.00 WIB</span>
                <span style="color:var(--primary); font-weight:600;">Transaksi langsung di kasir toko</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  function bindPublicHeaderEvents(root) {
    const btn = root.querySelector('#btn-public-mobile-menu');
    const nav = root.querySelector('#public-mobile-nav');
    if (btn && nav) {
      btn.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  function unitCardHtml(u) {
    return `
      <article class="product-card" data-open-unit="${u.id}" tabindex="0" role="button" aria-label="Lihat detail ${S().escapeHtml(u.merek + ' ' + u.model)}">
        <div class="product-thumb">
          ${u.foto
            ? `<img src="${u.foto}" alt="${S().escapeHtml(u.model)}" class="uploaded-photo" />`
            : SVG().laptopIllustration(u, 200)
          }
        </div>
        <div class="product-body">
          <div class="product-meta-top">
            <span class="product-code">${u.kode}</span>
            ${S().statusBadge(u.status)}
          </div>
          <h3 class="product-title">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h3>
          <div class="product-specs">${S().escapeHtml(u.cpu)} &bull; ${u.ram} &bull; ${S().escapeHtml(u.storage)}</div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span class="grade-pill">${u.grade}</span>
            <span style="font-size:11.5px; color:var(--text-muted);">Garansi ${u.garansi}</span>
            ${u.modifikasi.length > 0 ? `<span class="badge badge-info" style="font-size:10.5px;">+${u.modifikasi.length} Upgrade</span>` : ''}
          </div>
          <div class="product-price-row">
            <span class="product-price">${S().formatRupiah(u.hargaJual)}</span>
            <span style="font-size:12px; font-weight:600; color:var(--primary); display:inline-flex; align-items:center; gap:4px;">Detail ${SVG().icon('arrowRight', 13)}</span>
          </div>
        </div>
      </article>
    `;
  }

  // ==================== PU-01: BERANDA ====================
  function renderHome(root) {
    const units = S().getState().units;
    const available = units.filter(u => u.status === 'Tersedia');
    const featured = available.slice(0, 4);
    const heroUnit = available[0] || units[0];

    const html = `
      <section class="hero-card">
        <div>
          <div class="hero-eyebrow">
            ${SVG().icon('shield', 14)}
            Inventaris Transparan &bull; Garansi Toko Resmi hingga 90 Hari
          </div>
          <h1 class="hero-title">Temukan Laptop Bekas Berkualitas dengan Riwayat Teknis Terverifikasi</h1>
          <p class="hero-desc">
            Setiap unit di LapStock dilengkapi nomor seri tercatat, klasifikasi Grade kondisi fisik yang jujur, dan riwayat upgrade komponen langsung dari teknisi kami.
          </p>
          <form id="hero-search-form" class="hero-search-form">
            <div class="hero-search-input-wrap">
              ${SVG().icon('search', 17)}
              <input type="text" id="hero-search-input" placeholder="Cari merek, model, CPU (mis. ThinkPad, Core i7, M1)..." />
            </div>
            <button type="submit" class="btn btn-primary btn-lg">
              Cari Unit ${SVG().icon('arrowRight', 16)}
            </button>
          </form>
          <div class="chip-row">
            <span class="chip-label">Merek Populer:</span>
            ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<button type="button" class="chip-btn" data-quick-brand="${m}">${m}</button>`).join('')}
          </div>
          <div class="chip-row">
            <span class="chip-label">Rentang Harga:</span>
            <button type="button" class="chip-btn" data-quick-price="lt5">&lt; Rp 5 Juta</button>
            <button type="button" class="chip-btn" data-quick-price="5to8">Rp 5–8 Juta</button>
            <button type="button" class="chip-btn" data-quick-price="8to12">Rp 8–12 Juta</button>
            <button type="button" class="chip-btn" data-quick-price="gt12">&gt; Rp 12 Juta</button>
          </div>
        </div>
        <div class="hero-visual-card">
          <div class="hero-visual-stage">
            ${SVG().laptopIllustration(heroUnit, 260)}
          </div>
          <div class="hero-stats-strip">
            <div class="hero-stat">
              <div class="hero-stat-num">${available.length}</div>
              <div class="hero-stat-lbl">Unit Siap Jual</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">100%</div>
              <div class="hero-stat-lbl">Lolos Inspeksi QC</div>
            </div>
            <div class="hero-stat">
              <div class="hero-stat-num">90 Hari</div>
              <div class="hero-stat-lbl">Garansi Maksimal</div>
            </div>
          </div>
        </div>
      </section>

      <section style="margin-bottom:36px;">
        <div class="section-head">
          <div>
            <h2 style="font-size:21px; font-weight:800;">Unit Unggulan Tersedia</h2>
            <p style="margin:4px 0 0; color:var(--text-secondary); font-size:13.5px;">Pilihan unit bisnis dan produktivitas yang sudah lolos inspeksi teknis lengkap.</p>
          </div>
          <a href="#/katalog" class="btn btn-soft btn-sm">Lihat Semua Katalog ${SVG().icon('arrowRight', 14)}</a>
        </div>
        <div class="product-grid">
          ${featured.map(unitCardHtml).join('')}
        </div>
      </section>

      <section class="card card-pad" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <div class="kpi-icon" style="background:var(--primary-soft); color:var(--primary); flex-shrink:0;">${SVG().icon('barcode', 18)}</div>
          <div>
            <h3 style="font-size:15px; font-weight:700; margin-bottom:4px;">1 Unit = 1 Nomor Seri</h3>
            <p style="margin:0; font-size:13px; color:var(--text-secondary);">Setiap unit laptop bekas bersifat unik dengan identitas nomor seri dan status ketersediaan real-time.</p>
          </div>
        </div>
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <div class="kpi-icon" style="background:var(--success-bg); color:var(--success); flex-shrink:0;">${SVG().icon('wrench', 18)}</div>
          <div>
            <h3 style="font-size:15px; font-weight:700; margin-bottom:4px;">Riwayat Modifikasi Terbuka</h3>
            <p style="margin:0; font-size:13px; color:var(--text-secondary);">Upgrade RAM, SSD, atau penggantian thermal paste tercatat transparan dan dapat dicek sebelum membeli.</p>
          </div>
        </div>
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <div class="kpi-icon" style="background:var(--info-bg); color:var(--info); flex-shrink:0;">${SVG().icon('clock', 18)}</div>
          <div>
            <h3 style="font-size:15px; font-weight:700; margin-bottom:4px;">Lacak Status Teknis</h3>
            <p style="margin:0; font-size:13px; color:var(--text-secondary);">Unit masih dalam tahap inspeksi atau upgrade? Pantau progresnya langsung di menu <a href="#/cek-status" style="color:var(--primary); font-weight:600;">Cek Status</a>.</p>
          </div>
        </div>
      </section>
    `;

    root.innerHTML = renderPublicShell('beranda', html);
    bindPublicHeaderEvents(root);

    root.querySelector('#hero-search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = root.querySelector('#hero-search-input').value.trim();
      const f = S().getState().catalogFilters;
      Object.assign(f, { q, merek: '', harga: '', cpu: '', ram: '', grade: '', page: 1 });
      S().save();
      window.LapRouter.navigate('/katalog');
    });

    root.querySelectorAll('[data-quick-brand]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = S().getState().catalogFilters;
        Object.assign(f, { q: '', merek: btn.dataset.quickBrand, harga: '', cpu: '', ram: '', grade: '', page: 1 });
        S().save();
        window.LapRouter.navigate('/katalog');
      });
    });

    root.querySelectorAll('[data-quick-price]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = S().getState().catalogFilters;
        Object.assign(f, { q: '', merek: '', harga: btn.dataset.quickPrice, cpu: '', ram: '', grade: '', page: 1 });
        S().save();
        window.LapRouter.navigate('/katalog');
      });
    });

    root.querySelectorAll('[data-open-unit]').forEach(card => {
      const go = () => window.LapRouter.navigate('/katalog/' + card.dataset.openUnit);
      card.addEventListener('click', go);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    });
  }

  // ==================== PU-02: KATALOG ====================
  function renderCatalog(root) {
    const st = S().getState();
    const f = st.catalogFilters;
    const publicUnits = st.units.filter(u => u.status !== 'Nonaktif' && u.status !== 'Terjual');

    function matchPrice(price, range) {
      if (!range) return true;
      if (range === 'lt5') return price < 5000000;
      if (range === '5to8') return price >= 5000000 && price <= 8000000;
      if (range === '8to12') return price > 8000000 && price <= 12000000;
      if (range === 'gt12') return price > 12000000;
      return true;
    }

    const filtered = publicUnits.filter(u => {
      if (f.q) {
        const hay = `${u.kode} ${u.merek} ${u.model} ${u.cpu} ${u.ram} ${u.storage} ${u.grade}`.toLowerCase();
        if (!hay.includes(f.q.toLowerCase())) return false;
      }
      if (f.merek && u.merek !== f.merek) return false;
      if (!matchPrice(u.hargaJual, f.harga)) return false;
      if (f.cpu && !u.cpu.toLowerCase().includes(f.cpu.toLowerCase())) return false;
      if (f.ram && u.ram !== f.ram) return false;
      if (f.grade && u.grade !== f.grade) return false;
      return true;
    });

    if (f.sort === 'harga_asc') filtered.sort((a, b) => a.hargaJual - b.hargaJual);
    else if (f.sort === 'harga_desc') filtered.sort((a, b) => b.hargaJual - a.hargaJual);
    else filtered.sort((a, b) => (a.status === 'Tersedia' ? -1 : 1) - (b.status === 'Tersedia' ? -1 : 1));

    const perPage = 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (f.page > totalPages) f.page = 1;
    const slice = filtered.slice((f.page - 1) * perPage, f.page * perPage);

    const priceLabels = { lt5: '< Rp 5 Juta', '5to8': 'Rp 5–8 Juta', '8to12': 'Rp 8–12 Juta', gt12: '> Rp 12 Juta' };
    const activeTags = [];
    if (f.q) activeTags.push({ key: 'q', label: `Kata kunci: "${f.q}"` });
    if (f.merek) activeTags.push({ key: 'merek', label: `Merek: ${f.merek}` });
    if (f.harga) activeTags.push({ key: 'harga', label: `Harga: ${priceLabels[f.harga]}` });
    if (f.cpu) activeTags.push({ key: 'cpu', label: `CPU: ${f.cpu}` });
    if (f.ram) activeTags.push({ key: 'ram', label: `RAM: ${f.ram}` });
    if (f.grade) activeTags.push({ key: 'grade', label: `Kondisi: ${f.grade}` });

    const html = `
      <div class="breadcrumb">
        <a href="#/">Beranda</a> <span>/</span> <span class="current">Katalog Laptop</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Katalog Laptop Bekas</h1>
          <p class="page-subtitle">Menampilkan <strong>${filtered.length}</strong> unit aktif (termasuk unit dalam inspeksi teknis yang dapat dipantau).</p>
        </div>
        <div class="page-actions">
          <select id="cat-sort" class="form-control" style="width:auto;" aria-label="Urutkan katalog">
            <option value="terbaru" ${f.sort === 'terbaru' ? 'selected' : ''}>Urutkan: Tersedia Dahulu</option>
            <option value="harga_asc" ${f.sort === 'harga_asc' ? 'selected' : ''}>Harga: Termurah</option>
            <option value="harga_desc" ${f.sort === 'harga_desc' ? 'selected' : ''}>Harga: Termahal</option>
          </select>
        </div>
      </div>

      <div class="filter-bar">
        <input type="text" id="cat-q" class="form-control search-grow" placeholder="Cari model, kode unit, atau spesifikasi..." value="${S().escapeHtml(f.q)}" />
        <select id="cat-merek" class="form-control">
          <option value="">Semua Merek</option>
          ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}" ${f.merek === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
        <select id="cat-harga" class="form-control">
          <option value="">Semua Harga</option>
          <option value="lt5" ${f.harga === 'lt5' ? 'selected' : ''}>&lt; Rp 5 Juta</option>
          <option value="5to8" ${f.harga === '5to8' ? 'selected' : ''}>Rp 5 – 8 Juta</option>
          <option value="8to12" ${f.harga === '8to12' ? 'selected' : ''}>Rp 8 – 12 Juta</option>
          <option value="gt12" ${f.harga === 'gt12' ? 'selected' : ''}>&gt; Rp 12 Juta</option>
        </select>
        <select id="cat-cpu" class="form-control">
          <option value="">Semua CPU</option>
          ${['Core i5', 'Core i7', 'Apple M1', 'Ryzen 5'].map(c => `<option value="${c}" ${f.cpu === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select id="cat-ram" class="form-control">
          <option value="">Semua RAM</option>
          ${['8 GB', '16 GB', '32 GB'].map(r => `<option value="${r}" ${f.ram === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
        <select id="cat-grade" class="form-control">
          <option value="">Semua Grade</option>
          ${['Grade A', 'Grade B', 'Grade C'].map(g => `<option value="${g}" ${f.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
        ${activeTags.length > 0 ? `<button type="button" id="cat-reset" class="btn btn-secondary btn-sm">Reset Filter</button>` : ''}
      </div>

      ${activeTags.length > 0 ? `
        <div class="active-filters">
          <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Filter aktif:</span>
          ${activeTags.map(t => `<span class="filter-tag">${S().escapeHtml(t.label)} <button type="button" data-clear-filter="${t.key}" aria-label="Hapus filter">&times;</button></span>`).join('')}
        </div>
      ` : ''}

      ${slice.length === 0 ? `
        <div class="card empty-state">
          <div class="empty-icon">${SVG().icon('search', 24)}</div>
          <h3 style="font-size:17px; margin-bottom:6px;">Unit tidak ditemukan</h3>
          <p style="margin:0 0 16px;">Coba longgarkan pilihan filter harga, merek, atau kata kunci pencarian Anda.</p>
          <button type="button" id="cat-reset-empty" class="btn btn-primary btn-sm">Reset Semua Filter</button>
        </div>
      ` : `
        <div class="product-grid">
          ${slice.map(unitCardHtml).join('')}
        </div>
        ${totalPages > 1 ? `
          <div class="card" style="margin-top:20px;">
            <div class="pagination" style="border-top:none;">
              <span style="font-size:13px; color:var(--text-muted);">Halaman ${f.page} dari ${totalPages} (${filtered.length} unit)</span>
              <div class="pagination-btns">
                <button type="button" class="page-btn" data-page="${f.page - 1}" ${f.page <= 1 ? 'disabled' : ''}>Sebelumnya</button>
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `<button type="button" class="page-btn ${p === f.page ? 'active' : ''}" data-page="${p}">${p}</button>`).join('')}
                <button type="button" class="page-btn" data-page="${f.page + 1}" ${f.page >= totalPages ? 'disabled' : ''}>Berikutnya</button>
              </div>
            </div>
          </div>
        ` : ''}
      `}
    `;

    root.innerHTML = renderPublicShell('katalog', html);
    bindPublicHeaderEvents(root);

    const update = (patch) => {
      Object.assign(S().getState().catalogFilters, patch, { page: patch.page || 1 });
      S().save();
      renderCatalog(root);
    };

    const qInput = root.querySelector('#cat-q');
    let timer = null;
    qInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = qInput.selectionStart;
        update({ q: qInput.value });
        const nextInput = root.querySelector('#cat-q');
        if (nextInput) { nextInput.focus(); nextInput.setSelectionRange(pos, pos); }
      }, 180);
    });

    ['merek', 'harga', 'cpu', 'ram', 'grade', 'sort'].forEach(key => {
      const el = root.querySelector('#cat-' + key);
      if (el) el.addEventListener('change', () => update({ [key]: el.value }));
    });

    const resetAll = () => update({ q: '', merek: '', harga: '', cpu: '', ram: '', grade: '', sort: 'terbaru', page: 1 });
    const btnReset = root.querySelector('#cat-reset');
    const btnResetEmpty = root.querySelector('#cat-reset-empty');
    if (btnReset) btnReset.addEventListener('click', resetAll);
    if (btnResetEmpty) btnResetEmpty.addEventListener('click', resetAll);

    root.querySelectorAll('[data-clear-filter]').forEach(btn => {
      btn.addEventListener('click', () => update({ [btn.dataset.clearFilter]: '' }));
    });
    root.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => update({ page: Number(btn.dataset.page) }));
    });
    root.querySelectorAll('[data-open-unit]').forEach(card => {
      card.addEventListener('click', () => window.LapRouter.navigate('/katalog/' + card.dataset.openUnit));
    });
  }

  // ==================== PU-03: DETAIL UNIT ====================
  function renderUnitDetail(root, unitId, activeTab = 'spesifikasi') {
    const u = S().getUnitById(unitId);
    if (!u || u.status === 'Nonaktif') {
      root.innerHTML = renderPublicShell('katalog', `
        <div class="card empty-state">
          <div class="empty-icon">${SVG().icon('alert', 24)}</div>
          <h3>Unit tidak ditemukan</h3>
          <p>Kode unit <strong>${S().escapeHtml(unitId)}</strong> tidak tersedia pada katalog publik.</p>
          <a href="#/katalog" class="btn btn-primary btn-sm">Kembali ke Katalog</a>
        </div>
      `);
      bindPublicHeaderEvents(root);
      return;
    }

    const html = `
      <div class="breadcrumb">
        <a href="#/">Beranda</a> <span>/</span>
        <a href="#/katalog">Katalog</a> <span>/</span>
        <span class="current">${u.kode}</span>
      </div>

      <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <a href="#/katalog" class="btn btn-secondary btn-sm">${SVG().icon('arrowLeft', 15)} Kembali ke Katalog (Filter Terjaga)</a>
        <a href="#/cek-status?kode=${encodeURIComponent(u.kode)}" class="btn btn-soft btn-sm">${SVG().icon('clock', 15)} Cek Status Teknis Unit</a>
      </div>

      <div class="card card-pad" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:28px; margin-bottom:22px;">
        <div>
          <div style="background:linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%); border:1px solid var(--border); border-radius:16px; padding:32px 20px; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
            ${u.foto
              ? `<img src="${u.foto}" alt="${S().escapeHtml(u.model)}" style="max-width:100%; max-height:240px; border-radius:12px; object-fit:cover;" />`
              : SVG().laptopIllustration(u, 290)
            }
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:12.5px; color:var(--text-muted); padding:0 4px;">
            <span>Kode Unit: <strong class="mono" style="color:var(--text);">${u.kode}</strong></span>
            <span>Nomor Seri: <strong class="mono" style="color:var(--text);">${u.serialNumber}</strong></span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            ${S().statusBadge(u.status)}
            <span class="tooltip-wrap">
              <span class="grade-pill" tabindex="0" style="cursor:help;">${u.grade} ${SVG().icon('info', 12)}</span>
              <span class="tooltip-box">${S().GRADE_INFO[u.grade] || ''}</span>
            </span>
            <span class="badge badge-info">Garansi Toko ${u.garansi}</span>
          </div>

          <div>
            <h1 style="font-size:26px; font-weight:800;">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h1>
            <p style="margin:6px 0 0; color:var(--text-secondary);">${S().escapeHtml(u.cpu)} &bull; ${u.ram} &bull; ${S().escapeHtml(u.storage)} &bull; ${S().escapeHtml(u.layar)}</p>
          </div>

          <div style="padding:16px 18px; background:var(--primary-soft); border:1px solid var(--primary-border); border-radius:14px;">
            <div style="font-size:12px; font-weight:600; color:var(--primary); margin-bottom:2px;">Harga Jual Toko</div>
            <div style="font-family:var(--font-sans); font-size:28px; font-weight:800; color:var(--primary);">${S().formatRupiah(u.hargaJual)}</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Pembelian dan pengujian fisik dilakukan langsung di toko melalui Kasir (tanpa pembayaran daring).</div>
          </div>

          <div>
            <div style="font-size:12.5px; font-weight:700; margin-bottom:8px;">Kelengkapan Unit:</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${(u.kelengkapan || []).map(k => `<span class="badge badge-neutral">${SVG().icon('check', 12)} ${S().escapeHtml(k)}</span>`).join('')}
            </div>
          </div>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:auto;">
            <a href="#/info-toko" class="btn btn-primary">${SVG().icon('mapPin', 15)} Kunjungi Toko &amp; Info Garansi</a>
            <a href="#/cek-status?kode=${encodeURIComponent(u.kode)}" class="btn btn-secondary">Lacak Progres Teknis</a>
          </div>
        </div>
      </div>

      <div class="card card-pad">
        <div class="tabs-bar">
          <button type="button" class="tab-btn ${activeTab === 'spesifikasi' ? 'active' : ''}" data-pub-tab="spesifikasi">Spesifikasi &amp; Inspeksi</button>
          <button type="button" class="tab-btn ${activeTab === 'modifikasi' ? 'active' : ''}" data-pub-tab="modifikasi">
            Riwayat Modifikasi <span class="tab-count">${u.modifikasi.length}</span>
          </button>
        </div>

        ${activeTab === 'spesifikasi' ? `
          <div class="form-grid" style="gap:12px;">
            <div style="padding:12px 14px; background:var(--bg); border-radius:10px; border:1px solid var(--border);">
              <div style="font-size:11.5px; color:var(--text-muted);">Prosesor (CPU)</div>
              <div style="font-weight:600;">${S().escapeHtml(u.cpu)}</div>
            </div>
            <div style="padding:12px 14px; background:var(--bg); border-radius:10px; border:1px solid var(--border);">
              <div style="font-size:11.5px; color:var(--text-muted);">Memori (RAM)</div>
              <div style="font-weight:600;">${S().escapeHtml(u.ram)}</div>
            </div>
            <div style="padding:12px 14px; background:var(--bg); border-radius:10px; border:1px solid var(--border);">
              <div style="font-size:11.5px; color:var(--text-muted);">Penyimpanan</div>
              <div style="font-weight:600;">${S().escapeHtml(u.storage)}</div>
            </div>
            <div style="padding:12px 14px; background:var(--bg); border-radius:10px; border:1px solid var(--border);">
              <div style="font-size:11.5px; color:var(--text-muted);">Layar</div>
              <div style="font-weight:600;">${S().escapeHtml(u.layar)}</div>
            </div>
            <div style="padding:12px 14px; background:var(--bg); border-radius:10px; border:1px solid var(--border); grid-column:1 / -1;">
              <div style="font-size:11.5px; color:var(--text-muted);">Catatan Hasil Inspeksi Teknisi</div>
              <div style="font-weight:500; margin-top:4px;">${S().escapeHtml(u.catatanInspeksi || 'Unit sedang dalam antrean inspeksi awal oleh tim teknisi.')}</div>
            </div>
          </div>
        ` : `
          ${u.modifikasi.length === 0 ? `
            <div class="empty-state" style="padding:28px 16px;">
              <p style="margin:0;">Belum ada riwayat upgrade atau modifikasi komponen pada unit ini (konfigurasi bawaan pabrikan).</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Tanggal</th><th>Jenis</th><th>Komponen Lama</th><th>Komponen Baru</th><th>Catatan Teknisi</th></tr>
                </thead>
                <tbody>
                  ${u.modifikasi.map(m => `
                    <tr>
                      <td class="mono">${m.tanggal}</td>
                      <td><span class="badge badge-info">${S().escapeHtml(m.jenis)}</span></td>
                      <td>${S().escapeHtml(m.komponenLama)}</td>
                      <td><strong>${S().escapeHtml(m.komponenBaru)}</strong></td>
                      <td>${S().escapeHtml(m.catatan)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        `}
      </div>
    `;

    root.innerHTML = renderPublicShell('katalog', html);
    bindPublicHeaderEvents(root);

    root.querySelectorAll('[data-pub-tab]').forEach(btn => {
      btn.addEventListener('click', () => renderUnitDetail(root, unitId, btn.dataset.pubTab));
    });
  }

  // ==================== PU-04: CEK STATUS UNIT ====================
  function renderCheckStatus(root, initialCode = '') {
    const stages = ['Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi', 'Selesai'];
    const code = (initialCode || '').trim();
    let resultUnit = null;
    let notFound = false;

    if (code) {
      resultUnit = S().getState().units.find(
        u => u.kode.toLowerCase() === code.toLowerCase() || u.serialNumber.toLowerCase() === code.toLowerCase()
      );
      if (!resultUnit) notFound = true;
    }

    const stageIdx = resultUnit
      ? (resultUnit.status === 'Tersedia' || resultUnit.status === 'Terjual' ? 3 : Math.max(0, stages.indexOf(resultUnit.statusTeknis)))
      : -1;

    const sampleCodes = S().getState().units.filter(u => u.status !== 'Terjual' && u.status !== 'Nonaktif').slice(0, 5);

    const html = `
      <div class="breadcrumb">
        <a href="#/">Beranda</a> <span>/</span> <span class="current">Cek Status Unit</span>
      </div>
      <div style="max-width:860px; margin:0 auto;">
        <div class="page-header">
          <div>
            <h1 class="page-title">Cek Status Teknis Unit</h1>
            <p class="page-subtitle">Masukkan kode unit (mis. <span class="mono">LP-2026-007</span>) atau nomor seri untuk memantau tahapan inspeksi dan upgrade secara real-time.</p>
          </div>
        </div>

        <div class="card card-pad" style="margin-bottom:22px;">
          <form id="cek-status-form" style="display:flex; gap:10px; flex-wrap:wrap;">
            <input type="text" id="cek-kode-input" class="form-control" style="flex:1; min-width:240px;" placeholder="Masukkan kode unit atau nomor seri..." value="${S().escapeHtml(code)}" />
            <button type="submit" class="btn btn-primary">${SVG().icon('search', 16)} Cek Status</button>
          </form>
          <div class="chip-row" style="margin-top:12px;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Coba cepat:</span>
            ${sampleCodes.map(u => `<button type="button" class="chip-btn mono" data-sample-code="${u.kode}">${u.kode} (${u.status})</button>`).join('')}
          </div>
        </div>

        ${notFound ? `
          <div class="alert alert-danger">
            ${SVG().icon('alert', 18)}
            <div>
              <strong>Kode unit tidak ditemukan.</strong><br/>
              Pastikan kode unit (contoh: <span class="mono">LP-2026-008</span>) atau nomor seri yang Anda masukkan sudah benar.
            </div>
          </div>
        ` : ''}

        ${resultUnit ? `
          <div class="card card-pad">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; border-bottom:1px solid var(--border); padding-bottom:16px;">
              <div>
                <div class="mono" style="font-size:12px; color:var(--text-muted);">${resultUnit.kode} &bull; SN: ${resultUnit.serialNumber}</div>
                <h2 style="font-size:20px; font-weight:800; margin-top:2px;">${S().escapeHtml(resultUnit.merek)} ${S().escapeHtml(resultUnit.model)}</h2>
                <div style="font-size:12.5px; color:var(--text-muted); margin-top:4px;">Pembaruan terakhir: <strong>${resultUnit.updatedAt}</strong></div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                ${S().statusBadge(resultUnit.status)}
                ${resultUnit.status !== 'Nonaktif' ? `<a href="#/katalog/${resultUnit.id}" class="btn btn-soft btn-sm">Lihat Detail Unit</a>` : ''}
              </div>
            </div>

            <div class="timeline-horizontal">
              ${stages.map((st, idx) => {
                const cls = idx < stageIdx ? 'reached' : (idx === stageIdx ? 'current' : '');
                return `
                  <div class="timeline-step ${cls}">
                    <div class="timeline-dot">${idx < stageIdx ? SVG().icon('check', 15) : idx + 1}</div>
                    <div style="font-weight:700; font-size:13.5px;">${st}</div>
                    <div style="font-size:11.5px; color:var(--text-muted); margin-top:3px;">
                      ${idx < stageIdx ? 'Selesai dilewati' : (idx === stageIdx ? 'Tahap saat ini' : 'Menunggu')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="padding:14px 16px; background:var(--bg); border-radius:12px; border:1px solid var(--border);">
              <div style="font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">Catatan Teknisi Terkini</div>
              <div>${S().escapeHtml(resultUnit.catatanInspeksi || 'Sedang dalam pemeriksaan awal oleh tim teknisi LapStock.')}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    root.innerHTML = renderPublicShell('cek-status', html);
    bindPublicHeaderEvents(root);

    root.querySelector('#cek-status-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = root.querySelector('#cek-kode-input').value.trim();
      renderCheckStatus(root, val);
    });
    root.querySelectorAll('[data-sample-code]').forEach(btn => {
      btn.addEventListener('click', () => renderCheckStatus(root, btn.dataset.sampleCode));
    });
  }

  // ==================== PU-05: INFO TOKO DAN GARANSI ====================
  function renderStoreInfo(root) {
    const faqs = [
      {
        title: '1. Cakupan Garansi Resmi Toko LapStock (30 – 90 Hari)',
        body: 'Garansi mencakup kerusakan fungsi hardware utama seperti motherboard, RAM, SSD, keyboard, speaker, dan adaptor charger original yang bukan disebabkan oleh kelalaian pengguna. Durasi garansi tertera jelas pada halaman Detail Unit serta Nota Transaksi.'
      },
      {
        title: '2. Penjelasan Standar Klasifikasi Grade Fisik (A, B, C)',
        body: 'Grade A (Mulus seperti baru, baterai ≥85%), Grade B (Pemakaian wajar dengan goresan halus minor, baterai ≥75%, performa 100% normal), Grade C (Fungsional ekonomis dengan bekas pemakaian terlihat di bodi, seluruh fungsi lulus QC).'
      },
      {
        title: '3. Prosedur Klaim Garansi dan Syarat Nota',
        body: 'Bawa unit laptop beserta Nota Transaksi asli atau tunjukkan nomor seri unit di kasir LapStock. Tim teknisi akan melakukan diagnosa maksimal 2x24 jam untuk perbaikan atau penggantian komponen setara.'
      },
      {
        title: '4. Ketentuan Pengecualian Garansi',
        body: 'Garansi tidak berlaku apabila segel garansi rusak, unit terkena cairan, terjatuh/pecah layar, korsleting listrik eksternal, atau kerusakan akibat modifikasi di luar bengkel resmi LapStock.'
      },
      {
        title: '5. Mekanisme Pembelian & Pengujian di Toko',
        body: 'LapStock tidak melayani pembayaran daring untuk memastikan pembeli dapat memeriksa fisik, nomor seri, dan menguji performa unit secara langsung di toko sebelum transaksi diselesaikan di kasir.'
      }
    ];

    const html = `
      <div class="breadcrumb">
        <a href="#/">Beranda</a> <span>/</span> <span class="current">Info Toko &amp; Garansi</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Informasi Toko &amp; Ketentuan Garansi</h1>
          <p class="page-subtitle">Kunjungi gerai fisik kami untuk memeriksa kondisi unit secara langsung bersama staf ahli.</p>
        </div>
      </div>

      <div class="dashboard-grid" style="align-items:start;">
        <div>
          <h2 style="font-size:17px; font-weight:700; margin-bottom:12px;">Ketentuan Garansi &amp; Transaksi</h2>
          <div class="accordion" id="warranty-accordion">
            ${faqs.map((item, idx) => `
              <div class="accordion-item">
                <button type="button" class="accordion-trigger" data-acc-idx="${idx}" aria-expanded="${idx === 0 ? 'true' : 'false'}">
                  <span>${item.title}</span>
                  ${SVG().icon('chevronDown', 16)}
                </button>
                <div class="accordion-content ${idx === 0 ? '' : 'hidden'}">${item.body}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card card-pad" style="display:flex; flex-direction:column; gap:16px;">
          <h2 style="font-size:17px; font-weight:700;">Lokasi &amp; Jam Operasional</h2>
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div class="kpi-icon" style="background:var(--primary-soft); color:var(--primary); flex-shrink:0;">${SVG().icon('mapPin', 17)}</div>
            <div>
              <div style="font-weight:700;">Gerai Utama LapStock Malang</div>
              <div style="font-size:13px; color:var(--text-secondary);">Jl. Veteran No. 48, Ketawanggede, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145</div>
            </div>
          </div>
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div class="kpi-icon" style="background:var(--success-bg); color:var(--success); flex-shrink:0;">${SVG().icon('clock', 17)}</div>
            <div>
              <div style="font-weight:700;">Jam Operasional</div>
              <div style="font-size:13px; color:var(--text-secondary);">Senin – Sabtu: 09.00 – 20.00 WIB<br/>Minggu &amp; Hari Libur: 10.00 – 17.00 WIB</div>
            </div>
          </div>
          <div style="padding:14px; background:var(--bg); border-radius:12px; border:1px solid var(--border); font-size:13px;">
            <strong>Kontak Layanan Pelanggan:</strong><br/>
            WhatsApp / Telepon: 0811-3600-2026<br/>
            Email: halo@lapstock.id
          </div>
          <a href="#/katalog" class="btn btn-primary" style="width:100%;">Jelajahi Katalog Unit Tersedia</a>
        </div>
      </div>
    `;

    root.innerHTML = renderPublicShell('info-toko', html);
    bindPublicHeaderEvents(root);

    root.querySelectorAll('[data-acc-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.nextElementSibling;
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });
    });
  }

  return { renderHome, renderCatalog, renderUnitDetail, renderCheckStatus, renderStoreInfo };
})();
