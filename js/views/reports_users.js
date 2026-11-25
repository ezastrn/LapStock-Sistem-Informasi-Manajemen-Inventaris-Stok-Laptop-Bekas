/* ==========================================================================
   Owner Views: LP-01 Laporan Penjualan, LP-02 Laporan Keuangan,
                LP-03 Laporan Stok & Aset, PG-01 Daftar Pengguna,
                PG-02 Formulir Akun Pengguna
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.ReportsUsers = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  function reportTabsHtml(active) {
    return `
      <div class="tabs-bar no-print">
        <a href="#/laporan/penjualan" class="tab-btn ${active === 'penjualan' ? 'active' : ''}">LP-01 Laporan Penjualan</a>
        <a href="#/laporan/keuangan" class="tab-btn ${active === 'keuangan' ? 'active' : ''}">LP-02 Laporan Keuangan</a>
        <a href="#/laporan/stok" class="tab-btn ${active === 'stok' ? 'active' : ''}">LP-03 Laporan Stok &amp; Aset</a>
      </div>
    `;
  }

  function downloadCsv(filename, rows) {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    window.LapApp.toast('Laporan diekspor', `Berkas ${filename} berhasil diunduh.`, 'success');
  }

  // ==================== LP-01: LAPORAN PENJUALAN ====================
  function renderSalesReport(container, period = 'bulanan') {
    const trxs = S().getState().transactions;
    const totalUnitSold = trxs.reduce((s, t) => s + t.items.length, 0);
    const totalOmzet = trxs.reduce((s, t) => s + t.total, 0);

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Laporan Penjualan</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Laporan Penjualan</h1>
          <p class="page-subtitle">Ringkasan pergerakan transaksi, unit terlaris, dan rincian nota per periode.</p>
        </div>
        <div class="page-actions no-print">
          <div class="segmented" id="lp1-period">
            <button type="button" data-p="harian" class="${period === 'harian' ? 'active' : ''}">Harian</button>
            <button type="button" data-p="bulanan" class="${period === 'bulanan' ? 'active' : ''}">Bulanan</button>
          </div>
          <button type="button" id="lp1-export" class="btn btn-secondary btn-sm">${SVG().icon('download', 14)} Ekspor CSV</button>
          <button type="button" id="lp1-print" class="btn btn-primary btn-sm">${SVG().icon('printer', 14)} Cetak</button>
        </div>
      </div>

      ${reportTabsHtml('penjualan')}

      <div class="kpi-grid" style="grid-template-columns:repeat(3, 1fr);">
        <div class="kpi-card"><span class="kpi-label">Total Transaksi</span><div class="kpi-value">${trxs.length} nota</div></div>
        <div class="kpi-card"><span class="kpi-label">Total Unit Terjual</span><div class="kpi-value text-success">${totalUnitSold} unit</div></div>
        <div class="kpi-card"><span class="kpi-label">Total Omzet Penjualan</span><div class="kpi-value text-primary">${S().formatRupiah(totalOmzet)}</div></div>
      </div>

      <div class="card card-pad" style="margin-bottom:20px;">
        <h2 class="card-title" style="margin-bottom:12px;">Tren Omzet Penjualan (${period === 'harian' ? '7 Hari Terakhir' : 'Per Tanggal Transaksi'})</h2>
        <div id="lp1-chart"></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Rincian Transaksi (Klik baris untuk membuka Nota TR-03)</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Nomor Nota</th><th>Tanggal</th><th>Pembeli</th><th>Kasir</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>
              ${trxs.map(t => `
                <tr class="clickable-row" data-go-trx="${t.id}">
                  <td class="mono" style="font-weight:600;">${t.id}</td>
                  <td>${t.tanggal}</td>
                  <td><strong>${S().escapeHtml(t.pembeliNama)}</strong></td>
                  <td>${S().escapeHtml(t.kasir)}</td>
                  <td>${t.items.map(i => S().escapeHtml(i.nama)).join(', ')}</td>
                  <td style="font-weight:700; color:var(--primary);">${S().formatRupiah(t.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const grouped = {};
    trxs.forEach(t => { grouped[t.tanggal] = (grouped[t.tanggal] || 0) + t.total; });
    const chartData = Object.entries(grouped).sort().map(([d, v]) => ({ label: d.slice(5), value: v }));
    SVG().renderBarChart(container.querySelector('#lp1-chart'), chartData, {
      height: 220,
      formatTip: it => `<strong>${it.label}</strong><br/>Omzet: ${S().formatRupiah(it.value)}`
    });

    container.querySelectorAll('#lp1-period button').forEach(b => b.addEventListener('click', () => renderSalesReport(container, b.dataset.p)));
    container.querySelector('#lp1-print').addEventListener('click', () => window.print());
    container.querySelector('#lp1-export').addEventListener('click', () => {
      downloadCsv('laporan-penjualan-lapstock.csv', [
        ['Nomor Nota', 'Tanggal', 'Pembeli', 'Kasir', 'Metode', 'Total'],
        ...trxs.map(t => [t.id, t.tanggal, t.pembeliNama, t.kasir, t.metode, t.total])
      ]);
    });
    container.querySelectorAll('[data-go-trx]').forEach(tr => tr.addEventListener('click', () => window.LapRouter.navigate('/transaksi/' + tr.dataset.goTrx)));
  }

  // ==================== LP-02: LAPORAN KEUANGAN ====================
  function renderFinanceReport(container) {
    const trxs = S().getState().transactions;
    const pendapatan = trxs.reduce((s, t) => s + t.total, 0);
    const modal = trxs.reduce((s, t) => s + (t.totalModal || 0), 0);
    const laba = pendapatan - modal;
    const margin = pendapatan > 0 ? ((laba / pendapatan) * 100).toFixed(1) : '0.0';

    const byDate = {};
    trxs.forEach(t => {
      if (!byDate[t.tanggal]) byDate[t.tanggal] = { tanggal: t.tanggal, pendapatan: 0, modal: 0, laba: 0, count: 0, ids: [] };
      byDate[t.tanggal].pendapatan += t.total;
      byDate[t.tanggal].modal += (t.totalModal || 0);
      byDate[t.tanggal].laba += (t.total - (t.totalModal || 0));
      byDate[t.tanggal].count++;
      byDate[t.tanggal].ids.push(t.id);
    });
    const dailyRows = Object.values(byDate).sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Laporan Keuangan</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Laporan Keuangan Ringkas</h1>
          <p class="page-subtitle">Perbandingan pendapatan penjualan, modal unit terjual, dan laba kotor toko.</p>
        </div>
        <div class="page-actions no-print">
          <button type="button" id="lp2-export" class="btn btn-secondary btn-sm">${SVG().icon('download', 14)} Ekspor CSV</button>
          <button type="button" id="lp2-print" class="btn btn-primary btn-sm">${SVG().icon('printer', 14)} Cetak</button>
        </div>
      </div>

      ${reportTabsHtml('keuangan')}

      <div class="kpi-grid" style="grid-template-columns:repeat(3, 1fr);">
        <div class="kpi-card"><span class="kpi-label">Pendapatan Kotor</span><div class="kpi-value text-primary">${S().formatRupiah(pendapatan)}</div></div>
        <div class="kpi-card"><span class="kpi-label">Modal Unit Terjual (HPP)</span><div class="kpi-value">${S().formatRupiah(modal)}</div></div>
        <div class="kpi-card"><span class="kpi-label">Laba Kotor (Margin ${margin}%)</span><div class="kpi-value text-success">${S().formatRupiah(laba)}</div></div>
      </div>

      <div class="card card-pad" style="margin-bottom:20px;">
        <h2 class="card-title" style="margin-bottom:12px;">Grafik Laba Kotor Harian</h2>
        <div id="lp2-chart"></div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Ringkasan Keuangan per Hari</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Pendapatan</th><th>Modal</th><th>Laba Kotor</th><th>Tautan Nota</th></tr></thead>
            <tbody>
              ${dailyRows.map(r => `
                <tr>
                  <td class="mono" style="font-weight:600;">${r.tanggal}</td>
                  <td>${r.count} nota</td>
                  <td>${S().formatRupiah(r.pendapatan)}</td>
                  <td>${S().formatRupiah(r.modal)}</td>
                  <td style="font-weight:700; color:var(--success);">${S().formatRupiah(r.laba)}</td>
                  <td>${r.ids.map(id => `<a href="#/transaksi/${id}" class="chip-btn mono">${id}</a>`).join(' ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    SVG().renderBarChart(
      container.querySelector('#lp2-chart'),
      dailyRows.slice().reverse().map(r => ({ label: r.tanggal.slice(5), value: r.laba, color: '#059669', pendapatan: r.pendapatan })),
      { height: 220, formatTip: it => `<strong>${it.label}</strong><br/>Laba Kotor: ${S().formatRupiah(it.value)}<br/>Omzet: ${S().formatRupiah(it.pendapatan)}` }
    );

    container.querySelector('#lp2-print').addEventListener('click', () => window.print());
    container.querySelector('#lp2-export').addEventListener('click', () => {
      downloadCsv('laporan-keuangan-lapstock.csv', [
        ['Tanggal', 'Jumlah Nota', 'Pendapatan', 'Modal', 'Laba Kotor'],
        ...dailyRows.map(r => [r.tanggal, r.count, r.pendapatan, r.modal, r.laba])
      ]);
    });
  }

  // ==================== LP-03: LAPORAN STOK DAN ASET ====================
  let stockFilter = { merek: '', status: '' };

  function renderStockReport(container) {
    const st = S().getState();
    const active = st.units.filter(u => u.status !== 'Nonaktif' && u.status !== 'Terjual');
    const nilaiAsetModal = active.reduce((s, u) => s + u.hargaBeli, 0);
    const nilaiAsetJual = active.reduce((s, u) => s + u.hargaJual, 0);

    const filtered = active.filter(u => {
      if (stockFilter.merek && u.merek !== stockFilter.merek) return false;
      if (stockFilter.status && u.status !== stockFilter.status) return false;
      return true;
    });

    const brandCounts = {};
    active.forEach(u => { brandCounts[u.merek] = (brandCounts[u.merek] || 0) + 1; });

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Laporan Stok &amp; Aset</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Laporan Stok &amp; Nilai Aset</h1>
          <p class="page-subtitle">Valuasi inventaris aktif berdasarkan harga modal, estimasi jual, komposisi merek, dan hasil rekap fisik.</p>
        </div>
        <div class="page-actions no-print">
          <button type="button" id="lp3-export" class="btn btn-secondary btn-sm">${SVG().icon('download', 14)} Ekspor CSV</button>
          <button type="button" id="lp3-print" class="btn btn-primary btn-sm">${SVG().icon('printer', 14)} Cetak</button>
        </div>
      </div>

      ${reportTabsHtml('stok')}

      <div class="kpi-grid" style="grid-template-columns:repeat(3, 1fr);">
        <div class="kpi-card"><span class="kpi-label">Total Unit Aktif di Toko</span><div class="kpi-value">${active.length} unit</div></div>
        <div class="kpi-card"><span class="kpi-label">Nilai Aset (Harga Modal)</span><div class="kpi-value text-primary">${S().formatRupiah(nilaiAsetModal)}</div></div>
        <div class="kpi-card"><span class="kpi-label">Potensi Nilai Jual</span><div class="kpi-value text-success">${S().formatRupiah(nilaiAsetJual)}</div></div>
      </div>

      <div class="dashboard-grid" style="margin-bottom:20px;">
        <div class="card card-pad">
          <h2 class="card-title" style="margin-bottom:12px;">Komposisi Stok Aktif per Merek</h2>
          <div id="lp3-chart"></div>
        </div>
        <div class="card card-pad">
          <h2 class="card-title" style="margin-bottom:12px;">Riwayat Rekap Stok Fisik</h2>
          ${st.rekapHistory.map(r => `
            <div style="padding:12px; background:var(--bg); border:1px solid var(--border); border-radius:10px; margin-bottom:10px; font-size:13px;">
              <div style="display:flex; justify-content:space-between;"><strong>${r.tanggal}</strong><span class="badge ${r.selisih === 0 ? 'badge-success' : 'badge-danger'}">Selisih: ${r.selisih}</span></div>
              <div style="color:var(--text-secondary); margin-top:4px;">Sistem: ${r.stokSistem} &bull; Fisik: ${r.hitunganFisik} &bull; Oleh: ${S().escapeHtml(r.pelaku)}</div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${S().escapeHtml(r.catatan)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="filter-bar no-print">
        <select id="lp3-merek" class="form-control">
          <option value="">Semua Merek</option>
          ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}" ${stockFilter.merek === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
        <select id="lp3-status" class="form-control">
          <option value="">Semua Status</option>
          ${['Tersedia', 'Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi'].map(s => `<option value="${s}" ${stockFilter.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Daftar Unit Aset (Klik baris untuk melihat detail baca saja IV-03)</div></div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Unit</th><th>Grade</th><th>Status</th><th>Harga Modal</th><th>Harga Jual</th></tr></thead>
            <tbody>
              ${filtered.map(u => `
                <tr class="clickable-row" data-go-unit="${u.id}">
                  <td class="mono" style="font-weight:600;">${u.kode}</td>
                  <td><strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong></td>
                  <td><span class="grade-pill">${u.grade}</span></td>
                  <td>${S().statusBadge(u.status)}</td>
                  <td>${S().formatRupiah(u.hargaBeli)}</td>
                  <td style="font-weight:700;">${S().formatRupiah(u.hargaJual)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    SVG().renderBarChart(
      container.querySelector('#lp3-chart'),
      Object.entries(brandCounts).map(([label, value]) => ({ label, value })),
      { height: 210, formatY: v => Math.round(v) + ' unit', formatTip: it => `<strong>${it.label}</strong>: ${it.value} unit aktif` }
    );

    container.querySelector('#lp3-merek').addEventListener('change', (e) => { stockFilter.merek = e.target.value; renderStockReport(container); });
    container.querySelector('#lp3-status').addEventListener('change', (e) => { stockFilter.status = e.target.value; renderStockReport(container); });
    container.querySelector('#lp3-print').addEventListener('click', () => window.print());
    container.querySelector('#lp3-export').addEventListener('click', () => {
      downloadCsv('laporan-stok-aset-lapstock.csv', [
        ['Kode', 'Merek', 'Model', 'Nomor Seri', 'Grade', 'Status', 'Harga Modal', 'Harga Jual'],
        ...filtered.map(u => [u.kode, u.merek, u.model, u.serialNumber, u.grade, u.status, u.hargaBeli, u.hargaJual])
      ]);
    });
    container.querySelectorAll('[data-go-unit]').forEach(tr => tr.addEventListener('click', () => window.LapRouter.navigate('/inventaris/' + tr.dataset.goUnit)));
  }

  // ==================== PG-01: DAFTAR PENGGUNA ====================
  let userFilter = { q: '', role: '' };

  function renderUserList(container) {
    const users = S().getState().users;
    const current = S().getCurrentUser();

    const filtered = users.filter(u => {
      if (userFilter.q) {
        const hay = `${u.nama} ${u.email} ${u.id}`.toLowerCase();
        if (!hay.includes(userFilter.q.toLowerCase())) return false;
      }
      if (userFilter.role && u.role !== userFilter.role) return false;
      return true;
    });

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Kelola Pengguna</span></div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Daftar Akun Pengguna Internal</h1>
          <p class="page-subtitle">Atur peran dan status aktif akun staf untuk menjaga pembatasan hak akses sistem.</p>
        </div>
        <div class="page-actions">
          <a href="#/pengguna/tambah" class="btn btn-primary">${SVG().icon('plus', 15)} Tambah Pengguna</a>
        </div>
      </div>

      <div class="filter-bar">
        <input type="text" id="pg-q" class="form-control search-grow" placeholder="Cari nama atau email staf..." value="${S().escapeHtml(userFilter.q)}" />
        <select id="pg-role" class="form-control">
          <option value="">Semua Peran</option>
          <option value="admin_gudang" ${userFilter.role === 'admin_gudang' ? 'selected' : ''}>Admin Gudang</option>
          <option value="teknisi" ${userFilter.role === 'teknisi' ? 'selected' : ''}>Teknisi</option>
          <option value="kasir" ${userFilter.role === 'kasir' ? 'selected' : ''}>Kasir</option>
          <option value="pemilik" ${userFilter.role === 'pemilik' ? 'selected' : ''}>Pemilik Toko</option>
        </select>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Nama Staf</th><th>Email</th><th>Peran</th><th>Status Aktif</th><th>Aksi</th></tr></thead>
            <tbody>
              ${filtered.map(u => {
                const isSelf = current && current.id === u.id;
                return `
                  <tr>
                    <td class="mono">${u.id}</td>
                    <td><strong>${S().escapeHtml(u.nama)}</strong> ${isSelf ? '<span class="badge badge-info">Anda</span>' : ''}</td>
                    <td>${S().escapeHtml(u.email)}</td>
                    <td><span class="badge badge-neutral">${S().ROLE_INFO[u.role]?.label || u.role}</span></td>
                    <td>
                      <label class="switch" title="${isSelf ? 'Akun milik sendiri tidak dapat dinonaktifkan' : 'Aktifkan / Nonaktifkan akun'}">
                        <input type="checkbox" data-toggle-user="${u.id}" ${u.aktif ? 'checked' : ''} ${isSelf ? 'disabled' : ''} />
                        <span class="switch-slider"></span>
                      </label>
                      <span style="font-size:12px; margin-left:8px; color:${u.aktif ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${u.aktif ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td>
                      <a href="#/pengguna/${u.id}/ubah" class="btn btn-secondary btn-sm">${SVG().icon('edit', 13)} Ubah</a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const qEl = container.querySelector('#pg-q');
    let timer = null;
    qEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = qEl.selectionStart;
        userFilter.q = qEl.value;
        renderUserList(container);
        const nxt = container.querySelector('#pg-q');
        if (nxt) { nxt.focus(); nxt.setSelectionRange(pos, pos); }
      }, 150);
    });
    container.querySelector('#pg-role').addEventListener('change', (e) => { userFilter.role = e.target.value; renderUserList(container); });

    container.querySelectorAll('[data-toggle-user]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.preventDefault();
        const uid = cb.dataset.toggleUser;
        const target = S().getState().users.find(u => u.id === uid);
        cb.checked = target.aktif; // wait for modal confirm
        window.LapApp.openModal({
          title: target.aktif ? 'Nonaktifkan Akun Pengguna' : 'Aktifkan Akun Pengguna',
          confirmClass: target.aktif ? 'btn-danger' : 'btn-success',
          confirmLabel: target.aktif ? 'Nonaktifkan' : 'Aktifkan',
          body: `<p style="margin:0;">Akun <strong>${S().escapeHtml(target.nama)}</strong> (${target.email}) akan ${target.aktif ? 'dinonaktifkan sehingga tidak dapat login ke sistem' : 'diaktifkan kembali'}.</p>`,
          onConfirm: () => {
            const res = S().toggleUserActive(uid);
            if (res.ok) {
              window.LapApp.toast('Status akun diperbarui', `${target.nama} kini ${res.user.aktif ? 'Aktif' : 'Nonaktif'}.`, 'success');
              renderUserList(container);
            }
          }
        });
      });
    });
  }

  // ==================== PG-02: FORMULIR AKUN PENGGUNA ====================
  function renderUserForm(container, editId = null) {
    const existing = editId ? S().getState().users.find(u => u.id === editId) : null;
    let isDirty = false;
    window.LapRouter.setDirtyGuard(() => isDirty);

    const roleKey = existing ? existing.role : 'admin_gudang';

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/pengguna">Kelola Pengguna</a> <span>/</span>
        <span class="current">${existing ? 'Ubah Akun ' + existing.id : 'Tambah Pengguna'}</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">${existing ? 'Ubah Akun Pengguna' : 'Tambah Akun Pengguna Baru'}</h1>
          <p class="page-subtitle">Hak akses peran baru akan berlaku pada sesi login berikutnya.</p>
        </div>
      </div>

      <form id="user-form" class="card card-pad" style="max-width:680px;" novalidate>
        <div class="form-grid">
          <div class="form-group full">
            <label class="form-label" for="uf-nama">Nama Lengkap <span class="req">*</span></label>
            <input type="text" id="uf-nama" class="form-control" value="${S().escapeHtml(existing ? existing.nama : '')}" placeholder="Nama lengkap staf" />
            <div id="uf-nama-err" class="field-error hidden">Nama wajib diisi.</div>
          </div>
          <div class="form-group full">
            <label class="form-label" for="uf-email">Email Unik <span class="req">*</span></label>
            <input type="email" id="uf-email" class="form-control" value="${S().escapeHtml(existing ? existing.email : '')}" placeholder="nama@lapstock.id" />
            <div id="uf-email-err" class="field-error hidden"></div>
          </div>
          <div class="form-group full">
            <label class="form-label" for="uf-role">Peran / Hak Akses <span class="req">*</span></label>
            <select id="uf-role" class="form-control">
              <option value="admin_gudang" ${roleKey === 'admin_gudang' ? 'selected' : ''}>Admin Gudang</option>
              <option value="teknisi" ${roleKey === 'teknisi' ? 'selected' : ''}>Teknisi</option>
              <option value="kasir" ${roleKey === 'kasir' ? 'selected' : ''}>Kasir</option>
              <option value="pemilik" ${roleKey === 'pemilik' ? 'selected' : ''}>Pemilik Toko</option>
            </select>
            <div id="uf-role-desc" style="margin-top:6px; padding:10px 12px; border-radius:9px; background:var(--bg); border:1px solid var(--border); font-size:12.5px; color:var(--text-secondary);">
              ${S().ROLE_INFO[roleKey].desc}
            </div>
          </div>
          <div class="form-group full">
            <label class="form-label" for="uf-pass">
              <span>Kata Sandi Sementara ${existing ? '(kosongkan bila tidak diubah)' : '<span class="req">*</span>'}</span>
              <button type="button" id="btn-gen-pass" class="btn btn-soft btn-sm" style="height:26px; font-size:11.5px;">Buat Otomatis</button>
            </label>
            <input type="text" id="uf-pass" class="form-control mono" placeholder="${existing ? 'Biarkan kosong untuk tetap memakai sandi lama' : 'Minimal 6 karakter'}" />
            <div id="uf-pass-err" class="field-error hidden">Kata sandi sementara minimal 6 karakter.</div>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
          <button type="button" id="btn-uf-cancel" class="btn btn-secondary">Batal</button>
          <button type="submit" class="btn btn-primary">${SVG().icon('check', 15)} Simpan Akun</button>
        </div>
      </form>
    `;

    container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', () => { isDirty = true; }));
    container.querySelector('#uf-role').addEventListener('change', (e) => {
      isDirty = true;
      container.querySelector('#uf-role-desc').textContent = S().ROLE_INFO[e.target.value].desc;
    });
    container.querySelector('#btn-gen-pass').addEventListener('click', () => {
      const rand = 'LS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      container.querySelector('#uf-pass').value = rand;
      isDirty = true;
    });
    container.querySelector('#btn-uf-cancel').addEventListener('click', () => window.LapRouter.navigate('/pengguna'));

    container.querySelector('#user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = container.querySelector('#uf-nama').value.trim();
      const email = container.querySelector('#uf-email').value.trim();
      const role = container.querySelector('#uf-role').value;
      const pass = container.querySelector('#uf-pass').value.trim();

      const errN = container.querySelector('#uf-nama-err');
      const errE = container.querySelector('#uf-email-err');
      const errP = container.querySelector('#uf-pass-err');
      [errN, errE, errP].forEach(el => el.classList.add('hidden'));

      let ok = true;
      if (!nama) { errN.classList.remove('hidden'); ok = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errE.textContent = 'Format email tidak valid.';
        errE.classList.remove('hidden');
        ok = false;
      }
      if ((!existing && pass.length < 6) || (existing && pass && pass.length < 6)) {
        errP.classList.remove('hidden');
        ok = false;
      }
      if (!ok) return;

      const res = S().saveUser({ nama, email, role, password: pass }, editId);
      if (!res.ok) {
        errE.textContent = res.message;
        errE.classList.remove('hidden');
        return;
      }
      isDirty = false;
      window.LapRouter.setDirtyGuard(null);
      window.LapApp.toast('Akun tersimpan', `Data akun ${res.user.nama} berhasil disimpan.`, 'success');
      window.LapRouter.navigate('/pengguna');
    });
  }

  return { renderSalesReport, renderFinanceReport, renderStockReport, renderUserList, renderUserForm };
})();
