/* ==========================================================================
   Auth & General Views: AU-01 Login, AU-02 Adaptive Dashboard,
                         AU-03 Profil Saya, 403 Akses Ditolak
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.Auth = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  // ==================== AU-01: LOGIN ====================
  function renderLogin(root) {
    root.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div style="display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:24px;">
            <span class="brand-mark" style="width:46px; height:46px; border-radius:13px; margin-bottom:12px;">
              ${SVG().icon('laptop', 22)}
            </span>
            <h1 style="font-size:22px; font-weight:800;">Masuk ke LapStock</h1>
            <p style="margin:4px 0 0; font-size:13.5px; color:var(--text-secondary);">Portal staf internal berbasis peran</p>
          </div>

          <div id="login-error" class="alert alert-danger hidden"></div>

          <form id="login-form" novalidate style="display:flex; flex-direction:column; gap:15px;">
            <div class="form-group">
              <label class="form-label" for="login-email">Email Akun <span class="req">*</span></label>
              <input type="email" id="login-email" class="form-control" placeholder="nama@lapstock.id" autocomplete="username" />
              <div id="login-email-err" class="field-error hidden"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Kata Sandi <span class="req">*</span></label>
              <div style="position:relative;">
                <input type="password" id="login-password" class="form-control" style="padding-right:42px;" placeholder="Masukkan kata sandi" autocomplete="current-password" />
                <button type="button" id="toggle-pass-btn" class="icon-btn" style="position:absolute; right:4px; top:3px;" aria-label="Tampilkan kata sandi">
                  ${SVG().icon('eye', 16)}
                </button>
              </div>
              <div id="login-pass-err" class="field-error hidden"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:4px;">
              ${SVG().icon('login', 16)} Masuk ke Dashboard
            </button>
          </form>

          <div style="margin-top:18px; padding:12px 14px; background:var(--bg); border:1px solid var(--border); border-radius:10px; font-size:12px; color:var(--text-secondary);">
            <div style="font-weight:700; color:var(--text); margin-bottom:6px;">Akun Demo Cepat (sandi: <span class="mono">password123</span>):</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <button type="button" class="chip-btn" data-fill-email="rizky@lapstock.id">Admin Gudang</button>
              <button type="button" class="chip-btn" data-fill-email="rasyid@lapstock.id">Teknisi</button>
              <button type="button" class="chip-btn" data-fill-email="monica@lapstock.id">Kasir</button>
              <button type="button" class="chip-btn" data-fill-email="faeyza@lapstock.id">Pemilik Toko</button>
            </div>
          </div>

          <div style="margin-top:16px; text-align:center; font-size:12.5px; color:var(--text-muted); display:flex; flex-direction:column; gap:8px;">
            <span>Lupa kata sandi? Hubungi <strong>Pemilik Toko</strong> untuk reset akun.</span>
            <a href="#/" style="color:var(--primary); font-weight:600;">&larr; Kembali ke Beranda Pelanggan</a>
          </div>
        </div>
      </div>
    `;

    const emailEl = root.querySelector('#login-email');
    const passEl = root.querySelector('#login-password');
    const errBox = root.querySelector('#login-error');
    const emailErr = root.querySelector('#login-email-err');
    const passErr = root.querySelector('#login-pass-err');
    const toggleBtn = root.querySelector('#toggle-pass-btn');

    toggleBtn.addEventListener('click', () => {
      const isPass = passEl.type === 'password';
      passEl.type = isPass ? 'text' : 'password';
      toggleBtn.innerHTML = SVG().icon(isPass ? 'eyeOff' : 'eye', 16);
    });

    root.querySelectorAll('[data-fill-email]').forEach(btn => {
      btn.addEventListener('click', () => {
        emailEl.value = btn.dataset.fillEmail;
        passEl.value = 'password123';
        errBox.classList.add('hidden');
        emailErr.classList.add('hidden');
        passErr.classList.add('hidden');
      });
    });

    root.querySelector('#login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      errBox.classList.add('hidden');
      emailErr.classList.add('hidden');
      passErr.classList.add('hidden');
      emailEl.classList.remove('is-invalid');
      passEl.classList.remove('is-invalid');

      const email = emailEl.value.trim();
      const pass = passEl.value;
      let hasErr = false;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailEl.classList.add('is-invalid');
        emailErr.textContent = 'Masukkan alamat email yang valid.';
        emailErr.classList.remove('hidden');
        hasErr = true;
      }
      if (!pass) {
        passEl.classList.add('is-invalid');
        passErr.textContent = 'Kata sandi wajib diisi.';
        passErr.classList.remove('hidden');
        hasErr = true;
      }
      if (hasErr) return;

      const res = S().login(email, pass);
      if (!res.ok) {
        errBox.innerHTML = `${SVG().icon('alert', 17)} <span>${S().escapeHtml(res.message)}</span>`;
        errBox.classList.remove('hidden');
        passEl.value = '';
        passEl.focus();
        return;
      }
      window.LapApp.toast('Berhasil masuk', `Selamat datang kembali, ${res.user.nama}.`, 'success');
      window.LapRouter.navigate('/dashboard');
    });
  }

  // ==================== AU-02: ADAPTIVE DASHBOARD ====================
  function renderDashboard(container, period = 'harian') {
    const user = S().getCurrentUser();
    const role = S().getCurrentRole();
    const st = S().getState();
    const activeUnits = st.units.filter(u => u.status !== 'Nonaktif');
    const availableUnits = st.units.filter(u => u.status === 'Tersedia');
    const inTechUnits = st.units.filter(u => ['Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi'].includes(u.status));
    const soldUnits = st.units.filter(u => u.status === 'Terjual');
    const totalOmzet = st.transactions.reduce((sum, t) => sum + t.total, 0);
    const todayTrx = st.transactions.filter(t => t.tanggal === S().todayStr() || t.tanggal === '2026-11-25');

    const roleHeadings = {
      admin_gudang: { title: 'Dashboard Admin Gudang', ctaLabel: '+ Tambah Unit', ctaRoute: '/inventaris/tambah' },
      teknisi:      { title: 'Dashboard Teknisi', ctaLabel: 'Buka Antrean Teknis', ctaRoute: '/teknisi/antrean' },
      kasir:        { title: 'Dashboard Kasir', ctaLabel: '+ Transaksi Baru', ctaRoute: '/transaksi/pencarian' },
      pemilik:      { title: 'Dashboard Pemilik Toko', ctaLabel: 'Buka Laporan', ctaRoute: '/laporan/penjualan' }
    };
    const head = roleHeadings[role] || roleHeadings.pemilik;

    let bodyHtml = '';

    if (role === 'admin_gudang') {
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-card clickable" data-go="/inventaris">
            <div class="kpi-top"><span class="kpi-label">Total Stok Aktif</span><span class="kpi-icon" style="background:var(--primary-soft); color:var(--primary);">${SVG().icon('box', 18)}</span></div>
            <div class="kpi-value">${activeUnits.length} unit</div>
            <span class="kpi-link">Kelola daftar inventaris &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/inventaris">
            <div class="kpi-top"><span class="kpi-label">Unit Tersedia Siap Jual</span><span class="kpi-icon" style="background:var(--success-bg); color:var(--success);">${SVG().icon('checkCircle', 18)}</span></div>
            <div class="kpi-value text-success">${availableUnits.length} unit</div>
            <span class="kpi-link">Siap diproses kasir &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/teknisi/antrean">
            <div class="kpi-top"><span class="kpi-label">Sedang Proses Teknis</span><span class="kpi-icon" style="background:var(--warning-bg); color:var(--warning);">${SVG().icon('wrench', 18)}</span></div>
            <div class="kpi-value text-warning">${inTechUnits.length} unit</div>
            <span class="kpi-link">Pantau antrean teknis (baca) &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/inventaris/rekap">
            <div class="kpi-top"><span class="kpi-label">Rekap Stok Fisik</span><span class="kpi-icon" style="background:var(--info-bg); color:var(--info);">${SVG().icon('clipboard', 18)}</span></div>
            <div class="kpi-value">${st.rekapHistory.length} sesi</div>
            <span class="kpi-link">Mulai rekap stok harian &rarr;</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Unit Masuk &amp; Diperbarui Terbaru</div>
              <div class="card-subtitle">Klik baris unit untuk membuka detail inventaris dan riwayat status.</div>
            </div>
            <a href="#/inventaris" class="btn btn-secondary btn-sm">Semua Inventaris</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Kode</th><th>Unit</th><th>Nomor Seri</th><th>Grade</th><th>Status</th><th>Harga Jual</th></tr></thead>
              <tbody>
                ${activeUnits.slice(0, 6).map(u => `
                  <tr class="clickable-row" data-go="/inventaris/${u.id}">
                    <td class="mono" style="font-weight:600;">${u.kode}</td>
                    <td><strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong><div style="font-size:12px; color:var(--text-muted);">${S().escapeHtml(u.cpu)} &bull; ${u.ram}</div></td>
                    <td class="mono">${u.serialNumber}</td>
                    <td><span class="grade-pill">${u.grade}</span></td>
                    <td>${S().statusBadge(u.status)}</td>
                    <td style="font-weight:700;">${S().formatRupiah(u.hargaJual)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (role === 'teknisi') {
      const cInsp = st.units.filter(u => u.status === 'Dalam Inspeksi').length;
      const cComp = st.units.filter(u => u.status === 'Menunggu Komponen').length;
      const cInst = st.units.filter(u => u.status === 'Instalasi').length;
      const cDone = st.units.filter(u => u.statusTeknis === 'Selesai').length;
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-card clickable" data-go="/teknisi/antrean">
            <div class="kpi-top"><span class="kpi-label">Dalam Inspeksi</span><span class="kpi-icon" style="background:var(--info-bg); color:var(--info);">${SVG().icon('search', 18)}</span></div>
            <div class="kpi-value text-primary">${cInsp} unit</div>
            <span class="kpi-link">Buka antrean inspeksi &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/teknisi/antrean">
            <div class="kpi-top"><span class="kpi-label">Menunggu Komponen</span><span class="kpi-icon" style="background:var(--warning-bg); color:var(--warning);">${SVG().icon('clock', 18)}</span></div>
            <div class="kpi-value text-warning">${cComp} unit</div>
            <span class="kpi-link">Cek status komponen &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/teknisi/antrean">
            <div class="kpi-top"><span class="kpi-label">Tahap Instalasi</span><span class="kpi-icon" style="background:var(--purple-bg); color:var(--purple);">${SVG().icon('wrench', 18)}</span></div>
            <div class="kpi-value" style="color:var(--purple);">${cInst} unit</div>
            <span class="kpi-link">Selesaikan instalasi &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/teknisi/antrean">
            <div class="kpi-top"><span class="kpi-label">Selesai QC</span><span class="kpi-icon" style="background:var(--success-bg); color:var(--success);">${SVG().icon('checkCircle', 18)}</span></div>
            <div class="kpi-value text-success">${cDone} unit</div>
            <span class="kpi-link">Riwayat unit selesai &rarr;</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Prioritas Antrean Teknis Aktif</div>
              <div class="card-subtitle">Klik unit untuk memperbarui status pengerjaan atau mencatat modifikasi komponen.</div>
            </div>
            <a href="#/teknisi/antrean" class="btn btn-secondary btn-sm">Semua Antrean</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Kode</th><th>Model Laptop</th><th>Nomor Seri</th><th>Status Teknis</th><th>Tanggal Masuk</th><th>Aksi</th></tr></thead>
              <tbody>
                ${inTechUnits.length === 0
                  ? '<tr><td colspan="6" style="text-align:center; padding:28px; color:var(--text-muted);">Seluruh antrean teknis sudah selesai.</td></tr>'
                  : inTechUnits.map(u => `
                    <tr class="clickable-row" data-go="/teknisi/unit/${u.id}">
                      <td class="mono" style="font-weight:600;">${u.kode}</td>
                      <td><strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong></td>
                      <td class="mono">${u.serialNumber}</td>
                      <td>${S().statusBadge(u.statusTeknis)}</td>
                      <td>${u.tanggalMasuk}</td>
                      <td><span class="btn btn-soft btn-sm">Kerjakan</span></td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (role === 'kasir') {
      const todayTotal = todayTrx.reduce((s, t) => s + t.total, 0);
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-card clickable" data-go="/transaksi/pencarian">
            <div class="kpi-top"><span class="kpi-label">Unit Siap Jual</span><span class="kpi-icon" style="background:var(--success-bg); color:var(--success);">${SVG().icon('laptop', 18)}</span></div>
            <div class="kpi-value text-success">${availableUnits.length} unit</div>
            <span class="kpi-link">Cari stok cepat &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/transaksi/baru">
            <div class="kpi-top"><span class="kpi-label">Keranjang Aktif</span><span class="kpi-icon" style="background:var(--primary-soft); color:var(--primary);">${SVG().icon('cart', 18)}</span></div>
            <div class="kpi-value text-primary">${st.cart.length} unit</div>
            <span class="kpi-link">Lanjut ke transaksi baru &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/transaksi">
            <div class="kpi-top"><span class="kpi-label">Transaksi Terbaru</span><span class="kpi-icon" style="background:var(--info-bg); color:var(--info);">${SVG().icon('receipt', 18)}</span></div>
            <div class="kpi-value">${todayTrx.length} nota</div>
            <span class="kpi-link">Lihat riwayat transaksi &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/transaksi">
            <div class="kpi-top"><span class="kpi-label">Nominal Penjualan Terkini</span><span class="kpi-icon" style="background:var(--purple-bg); color:var(--purple);">${SVG().icon('chart', 18)}</span></div>
            <div class="kpi-value" style="font-size:21px;">${S().formatRupiah(todayTotal)}</div>
            <span class="kpi-link">Cetak ulang nota &rarr;</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Transaksi Penjualan Terakhir</div>
              <div class="card-subtitle">Klik baris untuk melihat detail nota atau mencetak ulang.</div>
            </div>
            <a href="#/transaksi/pencarian" class="btn btn-primary btn-sm">${SVG().icon('search', 14)} Cari Stok Kasir</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Nomor Nota</th><th>Tanggal</th><th>Pembeli</th><th>Metode</th><th>Total</th></tr></thead>
              <tbody>
                ${st.transactions.slice(0, 5).map(t => `
                  <tr class="clickable-row" data-go="/transaksi/${t.id}">
                    <td class="mono" style="font-weight:600;">${t.id}</td>
                    <td>${t.tanggal} ${t.waktu}</td>
                    <td><strong>${S().escapeHtml(t.pembeliNama)}</strong></td>
                    <td><span class="badge badge-neutral">${t.metode}</span></td>
                    <td style="font-weight:700; color:var(--primary);">${S().formatRupiah(t.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else {
      // Pemilik Toko
      const brandStats = {};
      ['Lenovo', 'Apple', 'Dell', 'HP', 'ASUS', 'Acer'].forEach(b => {
        brandStats[b] = { soldCount: 0, soldOmzet: 0, availCount: 0 };
      });
      st.units.forEach(u => {
        if (!brandStats[u.merek]) brandStats[u.merek] = { soldCount: 0, soldOmzet: 0, availCount: 0 };
        if (u.status === 'Tersedia') brandStats[u.merek].availCount++;
      });
      st.transactions.forEach(t => {
        t.items.forEach(it => {
          if (!brandStats[it.merek]) brandStats[it.merek] = { soldCount: 0, soldOmzet: 0, availCount: 0 };
          brandStats[it.merek].soldCount++;
          brandStats[it.merek].soldOmzet += it.harga;
        });
      });

      const topBrands = Object.entries(brandStats)
        .filter(([, v]) => v.soldCount > 0)
        .sort((a, b) => b[1].soldOmzet - a[1].soldOmzet);

      const slowBrands = Object.entries(brandStats)
        .sort((a, b) => a[1].soldCount - b[1].soldCount)
        .slice(0, 4);

      bodyHtml = `
        <div class="kpi-grid" style="grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));">
          <div class="kpi-card clickable" data-go="/inventaris">
            <div class="kpi-top"><span class="kpi-label">Total Stok Aktif</span><span class="kpi-icon" style="background:var(--primary-soft); color:var(--primary);">${SVG().icon('box', 18)}</span></div>
            <div class="kpi-value">${activeUnits.length} unit</div>
            <span class="kpi-link">Lihat Inventaris (baca saja) &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/laporan/stok">
            <div class="kpi-top"><span class="kpi-label">Unit Tersedia Siap Jual</span><span class="kpi-icon" style="background:var(--success-bg); color:var(--success);">${SVG().icon('checkCircle', 18)}</span></div>
            <div class="kpi-value text-success">${availableUnits.length} unit</div>
            <span class="kpi-link">Laporan stok &amp; nilai aset &rarr;</span>
          </div>
          <div class="kpi-card clickable" data-go="/laporan/keuangan">
            <div class="kpi-top"><span class="kpi-label">Total Omzet Tercatat</span><span class="kpi-icon" style="background:var(--info-bg); color:var(--info);">${SVG().icon('chart', 18)}</span></div>
            <div class="kpi-value text-primary">${S().formatRupiah(totalOmzet)}</div>
            <span class="kpi-link">Buka laporan keuangan &rarr;</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card card-pad">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
              <div>
                <h2 class="card-title">Grafik Penjualan</h2>
                <p class="card-subtitle">Arahkan kursor pada batang grafik untuk melihat nominal detail.</p>
              </div>
              <div class="segmented" id="dash-period-seg">
                <button type="button" data-period="harian" class="${period === 'harian' ? 'active' : ''}">Harian</button>
                <button type="button" data-period="bulanan" class="${period === 'bulanan' ? 'active' : ''}">Bulanan</button>
                <button type="button" data-period="tahunan" class="${period === 'tahunan' ? 'active' : ''}">Tahunan</button>
              </div>
            </div>
            <div id="owner-sales-chart"></div>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            <div class="card card-pad">
              <h3 class="card-title" style="margin-bottom:12px;">Merek Terlaris</h3>
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${topBrands.map(([brand, v]) => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid var(--surface-subtle);">
                    <div>
                      <div style="font-weight:700;">${brand}</div>
                      <div style="font-size:12px; color:var(--text-muted);">${v.soldCount} unit terjual</div>
                    </div>
                    <div style="font-weight:700; color:var(--text);">${S().formatRupiah(v.soldOmzet)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="card card-pad">
              <h3 class="card-title" style="margin-bottom:12px;">Stok Paling Sepi / Perlu Promosi</h3>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${slowBrands.map(([brand, v]) => `
                  <div style="display:flex; align-items:center; justify-content:space-between; font-size:13.5px;">
                    <span style="font-weight:600;">${brand}</span>
                    <span style="color:var(--text-muted);">${v.soldCount} terjual &bull; ${v.availCount} tersedia</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="breadcrumb"><span class="current">Dashboard</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">${head.title}</h1>
          <p class="page-subtitle">Selamat bertugas, <strong>${S().escapeHtml(user ? user.nama : '')}</strong>. Berikut ringkasan operasional LapStock hari ini.</p>
        </div>
        <div class="page-actions">
          <a href="#${head.ctaRoute}" class="btn btn-primary">${head.ctaLabel}</a>
        </div>
      </div>
      ${bodyHtml}
    `;

    container.querySelectorAll('[data-go]').forEach(el => {
      el.addEventListener('click', () => window.LapRouter.navigate(el.dataset.go));
    });

    if (role === 'pemilik') {
      const chartBox = container.querySelector('#owner-sales-chart');
      let chartItems = [];
      if (period === 'harian') {
        const days = ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24', '2026-11-25'];
        const today = S().todayStr();
        if (!days.includes(today) && st.transactions.some(t => t.tanggal === today)) {
          days.shift();
          days.push(today);
        }
        chartItems = days.map(d => {
          const val = st.transactions.filter(t => t.tanggal === d).reduce((s, t) => s + t.total, 0);
          const count = st.transactions.filter(t => t.tanggal === d).length;
          return { label: d.slice(8) + ' Nov', value: val, count };
        });
      } else if (period === 'bulanan') {
        chartItems = [
          { label: 'Jul', value: 22400000, count: 3 },
          { label: 'Agu', value: 28900000, count: 4 },
          { label: 'Sep', value: 34200000, count: 5 },
          { label: 'Okt', value: 31500000, count: 4 },
          { label: 'Nov', value: totalOmzet, count: st.transactions.length }
        ];
      } else {
        chartItems = [
          { label: '2024', value: 284000000, count: 38 },
          { label: '2025', value: 356000000, count: 47 },
          { label: '2026 (YTD)', value: 392000000 + totalOmzet, count: 52 + st.transactions.length }
        ];
      }

      SVG().renderBarChart(chartBox, chartItems, {
        height: 245,
        formatTip: (it) => `<strong>${it.label}</strong><br/>Omzet: ${S().formatRupiah(it.value)} (${it.count} transaksi)`
      });

      container.querySelectorAll('#dash-period-seg button').forEach(btn => {
        btn.addEventListener('click', () => renderDashboard(container, btn.dataset.period));
      });
    }
  }

  // ==================== AU-03: PROFIL SAYA ====================
  function renderProfile(container) {
    const user = S().getCurrentUser();
    const roleInfo = S().ROLE_INFO[user.role];

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Profil Saya</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Profil &amp; Keamanan Akun</h1>
          <p class="page-subtitle">Informasi identitas akun bersifat baca saja; hubungi Pemilik Toko untuk perubahan peran.</p>
        </div>
        <div class="page-actions">
          <button type="button" id="btn-profile-logout" class="btn btn-danger-outline">${SVG().icon('logout', 15)} Keluar dari Sistem</button>
        </div>
      </div>

      <div class="dashboard-grid" style="grid-template-columns:1fr 1.2fr; align-items:start;">
        <div class="card card-pad">
          <h2 class="card-title" style="margin-bottom:16px;">Informasi Akun</h2>
          <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
            <div class="avatar-circle" style="width:52px; height:52px; font-size:18px; border-radius:14px;">
              ${user.nama.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </div>
            <div>
              <div style="font-size:17px; font-weight:700;">${S().escapeHtml(user.nama)}</div>
              <span class="badge badge-info" style="margin-top:4px;">${roleInfo.label}</span>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-group">
              <label class="form-label">ID Pengguna</label>
              <input type="text" class="form-control mono" value="${user.id}" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Alamat Email</label>
              <input type="text" class="form-control" value="${S().escapeHtml(user.email)}" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Kewenangan Peran</label>
              <div style="padding:10px 12px; background:var(--bg); border:1px solid var(--border); border-radius:10px; font-size:12.5px; color:var(--text-secondary);">
                ${roleInfo.desc}
              </div>
            </div>
          </div>
        </div>

        <div class="card card-pad">
          <h2 class="card-title" style="margin-bottom:4px;">Ubah Kata Sandi</h2>
          <p class="card-subtitle" style="margin-bottom:16px;">Gunakan kombinasi minimal 6 karakter agar akun internal tetap aman.</p>
          <form id="change-pass-form" novalidate style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label class="form-label" for="cp-old">Kata Sandi Lama <span class="req">*</span></label>
              <input type="password" id="cp-old" class="form-control" placeholder="Masukkan kata sandi saat ini" />
              <div id="cp-old-err" class="field-error hidden"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="cp-new">Kata Sandi Baru <span class="req">*</span></label>
              <input type="password" id="cp-new" class="form-control" placeholder="Minimal 6 karakter" />
              <div id="cp-new-err" class="field-error hidden"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="cp-conf">Konfirmasi Kata Sandi Baru <span class="req">*</span></label>
              <input type="password" id="cp-conf" class="form-control" placeholder="Ulangi kata sandi baru" />
              <div id="cp-conf-err" class="field-error hidden"></div>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">Simpan Kata Sandi</button>
            </div>
          </form>
        </div>
      </div>
    `;

    container.querySelector('#btn-profile-logout').addEventListener('click', () => {
      S().logout();
      window.LapApp.toast('Sesi berakhir', 'Anda telah keluar dari sistem internal.', 'info');
      window.LapRouter.navigate('/login');
    });

    container.querySelector('#change-pass-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const oldEl = container.querySelector('#cp-old');
      const newEl = container.querySelector('#cp-new');
      const confEl = container.querySelector('#cp-conf');
      const errs = { old: container.querySelector('#cp-old-err'), new: container.querySelector('#cp-new-err'), conf: container.querySelector('#cp-conf-err') };
      Object.values(errs).forEach(el => el.classList.add('hidden'));
      [oldEl, newEl, confEl].forEach(el => el.classList.remove('is-invalid'));

      if (newEl.value !== confEl.value) {
        confEl.classList.add('is-invalid');
        errs.conf.textContent = 'Konfirmasi kata sandi baru tidak cocok.';
        errs.conf.classList.remove('hidden');
        return;
      }

      const res = S().changePassword(oldEl.value, newEl.value);
      if (!res.ok) {
        const target = res.field === 'old' ? oldEl : newEl;
        target.classList.add('is-invalid');
        errs[res.field].textContent = res.message;
        errs[res.field].classList.remove('hidden');
        return;
      }
      oldEl.value = '';
      newEl.value = '';
      confEl.value = '';
      window.LapApp.toast('Kata sandi diperbarui', 'Kata sandi akun Anda berhasil diubah.', 'success');
    });
  }

  // ==================== 403: AKSES DITOLAK ====================
  function renderAccessDenied(container, attemptedRoute, requiredRoles = []) {
    const role = S().getCurrentRole();
    const roleLabel = S().ROLE_INFO[role]?.label || role;
    const reqLabels = requiredRoles.map(r => S().ROLE_INFO[r]?.label || r).join(' / ');

    container.innerHTML = `
      <div class="card card-pad" style="max-width:600px; margin:36px auto; text-align:center; padding:42px 28px;">
        <div style="width:64px; height:64px; border-radius:18px; background:var(--danger-bg); color:var(--danger); border:1px solid var(--danger-border); display:inline-flex; align-items:center; justify-content:center; margin-bottom:16px;">
          ${SVG().icon('lock', 28)}
        </div>
        <span class="badge badge-danger" style="margin-bottom:10px;">HTTP 403 &bull; Akses Ditolak</span>
        <h1 style="font-size:24px; font-weight:800; margin-bottom:8px;">Anda Tidak Memiliki Kewenangan</h1>
        <p style="color:var(--text-secondary); margin:0 auto 20px; max-width:460px;">
          Halaman <span class="mono" style="font-weight:600; color:var(--text);">${S().escapeHtml(attemptedRoute)}</span> hanya dapat diakses oleh peran <strong>${S().escapeHtml(reqLabels || 'tertentu')}</strong>.
          Saat ini Anda masuk sebagai <strong>${S().escapeHtml(roleLabel)}</strong>.
        </p>
        <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
          ${role === 'pelanggan'
            ? `<a href="#/" class="btn btn-primary">Kembali ke Beranda</a><a href="#/login" class="btn btn-secondary">Masuk Staf Internal</a>`
            : `<a href="#/dashboard" class="btn btn-primary">Kembali ke Dashboard</a>`
          }
        </div>
      </div>
    `;
  }

  return { renderLogin, renderDashboard, renderProfile, renderAccessDenied };
})();
