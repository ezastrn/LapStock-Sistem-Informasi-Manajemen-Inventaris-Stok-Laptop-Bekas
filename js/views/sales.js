/* ==========================================================================
   Sales / Cashier Views: TR-01 Pencarian Stok, TR-02 Transaksi Baru (4-Step),
                          TR-03 Detail Transaksi & Nota, TR-04 Riwayat Transaksi
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.Sales = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  let searchFilter = { q: '', merek: '', ram: '', grade: '' };
  let wizardState = {
    step: 1,
    pembeliNama: '',
    pembeliKontak: '',
    metode: 'Tunai',
    dibayar: 0,
    alertMsg: ''
  };

  // ==================== TR-01: PENCARIAN STOK KASIR ====================
  function renderStockSearch(container) {
    const st = S().getState();
    const units = st.units.filter(u => u.status !== 'Nonaktif');

    const filtered = units.filter(u => {
      if (searchFilter.q) {
        const hay = `${u.kode} ${u.serialNumber} ${u.merek} ${u.model} ${u.cpu} ${u.ram}`.toLowerCase();
        if (!hay.includes(searchFilter.q.toLowerCase())) return false;
      }
      if (searchFilter.merek && u.merek !== searchFilter.merek) return false;
      if (searchFilter.ram && u.ram !== searchFilter.ram) return false;
      if (searchFilter.grade && u.grade !== searchFilter.grade) return false;
      return true;
    });

    filtered.sort((a, b) => (a.status === 'Tersedia' ? -1 : 1) - (b.status === 'Tersedia' ? -1 : 1));

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Pencarian Stok Kasir</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Pencarian Stok Cepat (Kasir)</h1>
          <p class="page-subtitle">Ketik nomor seri, model, atau spesifikasi untuk melayani pelanggan dalam hitungan detik.</p>
        </div>
        <div class="page-actions">
          <a href="#/transaksi/baru" class="btn btn-primary ${st.cart.length === 0 ? 'btn-soft' : ''}">
            ${SVG().icon('cart', 16)} Lanjut ke Transaksi (${st.cart.length})
          </a>
        </div>
      </div>

      <div class="card card-pad" style="margin-bottom:18px;">
        <div style="position:relative; margin-bottom:12px;">
          <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--text-muted);">${SVG().icon('search', 18)}</span>
          <input type="text" id="tr-search-input" class="form-control" style="height:48px; padding-left:44px; font-size:15px;" placeholder="Ketik atau pindai Nomor Seri, Kode Unit, Merek, CPU..." value="${S().escapeHtml(searchFilter.q)}" autofocus />
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <select id="tr-merek" class="form-control" style="width:auto; height:36px;">
            <option value="">Semua Merek</option>
            ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}" ${searchFilter.merek === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
          <select id="tr-ram" class="form-control" style="width:auto; height:36px;">
            <option value="">Semua RAM</option>
            ${['8 GB', '16 GB', '32 GB'].map(r => `<option value="${r}" ${searchFilter.ram === r ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
          <select id="tr-grade" class="form-control" style="width:auto; height:36px;">
            <option value="">Semua Grade</option>
            ${['Grade A', 'Grade B', 'Grade C'].map(g => `<option value="${g}" ${searchFilter.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
          <span style="margin-left:auto; font-size:12.5px; color:var(--text-muted);">Ditemukan <strong>${filtered.length}</strong> unit</span>
        </div>
      </div>

      ${filtered.length === 0 ? `
        <div class="card empty-state">
          <div class="empty-icon">${SVG().icon('search', 24)}</div>
          <h3>Unit tidak ditemukan</h3>
          <p>Coba kata kunci lain atau tawarkan unit alternatif yang tersedia kepada pelanggan.</p>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(310px, 1fr)); gap:16px;">
          ${filtered.map(u => {
            const inCart = st.cart.includes(u.id);
            const canAdd = u.status === 'Tersedia' && !inCart;
            return `
              <div class="card card-pad" style="display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                  <span class="mono" style="font-size:12px; color:var(--text-muted);">${u.kode} &bull; ${u.serialNumber}</span>
                  ${S().statusBadge(u.status)}
                </div>
                <div>
                  <h3 style="font-size:15.5px; font-weight:700;">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h3>
                  <div style="font-size:12.5px; color:var(--text-secondary);">${S().escapeHtml(u.cpu)} &bull; ${u.ram} &bull; ${S().escapeHtml(u.storage)}</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
                  <span class="grade-pill">${u.grade}</span>
                  <strong style="font-size:17px; color:var(--primary);">${S().formatRupiah(u.hargaJual)}</strong>
                </div>
                <div style="display:flex; gap:8px; margin-top:auto; padding-top:10px; border-top:1px solid var(--surface-subtle);">
                  <button type="button" class="btn btn-secondary btn-sm" data-quick-detail="${u.id}">Detail Cepat</button>
                  <button type="button" class="btn ${inCart ? 'btn-success' : 'btn-primary'} btn-sm" style="flex:1;" data-add-cart="${u.id}" ${!canAdd ? 'disabled' : ''} title="${u.status !== 'Tersedia' ? 'Unit berstatus ' + u.status : (inCart ? 'Sudah di keranjang' : '')}">
                    ${inCart ? `${SVG().icon('check', 14)} Di Keranjang` : (u.status === 'Tersedia' ? `${SVG().icon('plus', 14)} Tambah ke Transaksi` : `Tidak Tersedia (${u.status})`)}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    const inp = container.querySelector('#tr-search-input');
    let timer = null;
    inp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = inp.selectionStart;
        searchFilter.q = inp.value;
        renderStockSearch(container);
        const nxt = container.querySelector('#tr-search-input');
        if (nxt) { nxt.focus(); nxt.setSelectionRange(pos, pos); }
      }, 120);
    });

    ['merek', 'ram', 'grade'].forEach(k => {
      container.querySelector('#tr-' + k).addEventListener('change', (e) => {
        searchFilter[k] = e.target.value;
        renderStockSearch(container);
      });
    });

    container.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.addCart;
        const unit = S().getUnitById(uid);
        const res = S().addToCart(uid);
        if (res.ok) {
          window.LapApp.toast('Ditambahkan ke transaksi', `${unit.kode} (${unit.merek} ${unit.model}) masuk keranjang kasir.`, 'success');
          window.LapApp.refreshTopbarCart();
          renderStockSearch(container);
        } else {
          window.LapApp.toast('Tidak dapat ditambahkan', res.reason, 'warning');
        }
      });
    });

    // Quick-detail slide-over panel (Tabel 5.3 TR-01)
    container.querySelectorAll('[data-quick-detail]').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = S().getUnitById(btn.dataset.quickDetail);
        if (!u) return;
        const inCart = S().getState().cart.includes(u.id);
        window.LapApp.openDrawer({
          title: `Detail Cepat — ${u.kode}`,
          body: `
            <div style="text-align:center; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:16px;">
              ${SVG().laptopIllustration(u, 220)}
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              ${S().statusBadge(u.status)}
              <span class="grade-pill">${u.grade}</span>
              <span class="badge badge-info">Garansi ${u.garansi}</span>
            </div>
            <h3 style="font-size:18px; margin-bottom:4px;">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h3>
            <div class="mono" style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">SN: ${u.serialNumber}</div>
            <div style="font-size:22px; font-weight:800; color:var(--primary); margin-bottom:16px;">${S().formatRupiah(u.hargaJual)}</div>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; border-top:1px solid var(--border); padding-top:12px;">
              <div><strong>CPU:</strong> ${S().escapeHtml(u.cpu)}</div>
              <div><strong>RAM / Storage:</strong> ${u.ram} / ${S().escapeHtml(u.storage)}</div>
              <div><strong>Layar:</strong> ${S().escapeHtml(u.layar)}</div>
              <div><strong>Kelengkapan:</strong> ${(u.kelengkapan || []).join(', ')}</div>
              <div><strong>Catatan QC:</strong> ${S().escapeHtml(u.catatanInspeksi || '-')}</div>
            </div>
            <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">
              <div style="font-weight:700; margin-bottom:8px;">Riwayat Modifikasi (${u.modifikasi.length})</div>
              ${u.modifikasi.length === 0
                ? '<div style="font-size:12.5px; color:var(--text-muted);">Konfigurasi standar pabrikan.</div>'
                : u.modifikasi.map(m => `<div style="font-size:12.5px; padding:8px; background:var(--bg); border-radius:8px; margin-bottom:6px;"><strong>${S().escapeHtml(m.jenis)}</strong>: ${S().escapeHtml(m.komponenLama)} &rarr; ${S().escapeHtml(m.komponenBaru)}</div>`).join('')}
            </div>
          `,
          footer: u.status === 'Tersedia' && !inCart
            ? `<button type="button" id="drawer-add-cart" class="btn btn-primary" style="width:100%;">${SVG().icon('plus', 15)} Tambah ke Transaksi</button>`
            : `<a href="#/transaksi/baru" class="btn btn-secondary" style="width:100%;">Lihat Keranjang Transaksi</a>`
        });

        const addBtn = document.querySelector('#drawer-add-cart');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            S().addToCart(u.id);
            window.LapApp.closeDrawer();
            window.LapApp.refreshTopbarCart();
            window.LapApp.toast('Ditambahkan ke transaksi', `${u.kode} masuk keranjang.`, 'success');
            renderStockSearch(container);
          });
        }
      });
    });
  }

  // ==================== TR-02: TRANSAKSI BARU (4-STEP WIZARD) ====================
  function renderNewTransaction(container) {
    const st = S().getState();
    const cartUnits = st.cart.map(id => S().getUnitById(id)).filter(Boolean);
    const total = cartUnits.reduce((s, u) => s + u.hargaJual, 0);

    if (cartUnits.length === 0) {
      wizardState.step = 1;
      container.innerHTML = `
        <div class="breadcrumb">
          <a href="#/dashboard">Dashboard</a> <span>/</span>
          <a href="#/transaksi/pencarian">Pencarian Stok</a> <span>/</span>
          <span class="current">Transaksi Baru</span>
        </div>
        <div class="card empty-state" style="max-width:620px; margin:24px auto;">
          <div class="empty-icon">${SVG().icon('cart', 26)}</div>
          <h2 style="font-size:19px; margin-bottom:6px;">Belum Ada Unit pada Transaksi</h2>
          <p style="margin-bottom:18px;">Cari dan tambahkan minimal satu unit berstatus <strong>Tersedia</strong> melalui Pencarian Stok Kasir.</p>
          <a href="#/transaksi/pencarian" class="btn btn-primary">${SVG().icon('search', 15)} Buka Pencarian Stok</a>
        </div>
      `;
      return;
    }

    if (wizardState.dibayar < total) wizardState.dibayar = total;
    const kembalian = Math.max(0, wizardState.dibayar - total);

    const steps = [
      { n: 1, label: 'Unit' },
      { n: 2, label: 'Pembeli' },
      { n: 3, label: 'Pembayaran' },
      { n: 4, label: 'Konfirmasi' }
    ];

    let stepContent = '';
    if (wizardState.step === 1) {
      stepContent = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <div>
            <h2 class="card-title">Langkah 1: Daftar Unit Transaksi</h2>
            <p class="card-subtitle">Pastikan unit dan nomor seri sesuai dengan laptop fisik yang diperiksa pelanggan.</p>
          </div>
          <a href="#/transaksi/pencarian" class="btn btn-soft btn-sm">${SVG().icon('plus', 14)} Tambah Unit Lain</a>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Unit &amp; Nomor Seri</th><th>Grade &amp; Garansi</th><th>Harga</th><th style="width:90px;">Aksi</th></tr></thead>
            <tbody>
              ${cartUnits.map(u => `
                <tr>
                  <td>
                    <strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong>
                    <div class="mono" style="font-size:12px; color:var(--text-muted);">${u.kode} &bull; SN: ${u.serialNumber}</div>
                  </td>
                  <td><span class="grade-pill">${u.grade}</span> &bull; ${u.garansi}</td>
                  <td style="font-weight:700;">${S().formatRupiah(u.hargaJual)}</td>
                  <td><button type="button" class="btn btn-danger-outline btn-sm" data-rm-cart="${u.id}">Hapus</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:18px; padding-top:16px; border-top:1px solid var(--border);">
          <div>
            <div style="font-size:12px; color:var(--text-muted);">Total Sementara (${cartUnits.length} unit)</div>
            <div style="font-size:22px; font-weight:800; color:var(--primary);">${S().formatRupiah(total)}</div>
          </div>
          <button type="button" id="step-next-2" class="btn btn-primary">Lanjut ke Data Pembeli ${SVG().icon('arrowRight', 15)}</button>
        </div>
      `;
    } else if (wizardState.step === 2) {
      stepContent = `
        <h2 class="card-title">Langkah 2: Data Pembeli</h2>
        <p class="card-subtitle" style="margin-bottom:16px;">Data pembeli dicetak pada Nota Transaksi dan digunakan sebagai referensi klaim garansi.</p>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="tr-buyer-name">Nama Lengkap Pembeli <span class="req">*</span></label>
            <input type="text" id="tr-buyer-name" class="form-control" placeholder="Contoh: Rahmat Hidayat" value="${S().escapeHtml(wizardState.pembeliNama)}" />
            <div id="err-buyer-name" class="field-error hidden">Nama pembeli wajib diisi.</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="tr-buyer-phone">Nomor WhatsApp / Telepon <span class="req">*</span></label>
            <input type="text" id="tr-buyer-phone" class="form-control" placeholder="Contoh: 0812-3344-5566" value="${S().escapeHtml(wizardState.pembeliKontak)}" />
            <div id="err-buyer-phone" class="field-error hidden">Nomor kontak valid (min. 8 digit) wajib diisi.</div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
          <button type="button" id="step-back-1" class="btn btn-secondary">&larr; Kembali ke Unit</button>
          <button type="button" id="step-next-3" class="btn btn-primary">Lanjut ke Pembayaran ${SVG().icon('arrowRight', 15)}</button>
        </div>
      `;
    } else if (wizardState.step === 3) {
      stepContent = `
        <h2 class="card-title">Langkah 3: Metode &amp; Nominal Pembayaran</h2>
        <p class="card-subtitle" style="margin-bottom:16px;">Pilih metode pembayaran di kasir; kembalian dihitung otomatis secara real-time.</p>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="tr-method">Metode Pembayaran</label>
            <select id="tr-method" class="form-control">
              ${['Tunai', 'Transfer Bank', 'QRIS', 'Kartu Debit'].map(m => `<option value="${m}" ${wizardState.metode === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="tr-paid">Nominal Diterima <span class="req">*</span></label>
            <input type="text" id="tr-paid" class="form-control" value="${S().formatRupiah(wizardState.dibayar)}" />
            <div id="err-paid" class="field-error hidden">Nominal pembayaran tidak boleh kurang dari total transaksi.</div>
          </div>
        </div>
        <div style="margin-top:16px; padding:14px 16px; background:var(--bg); border:1px solid var(--border); border-radius:12px; display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div><div class="field-hint">Total Tagihan</div><strong style="font-size:17px;">${S().formatRupiah(total)}</strong></div>
          <div><div class="field-hint">Nominal Dibayar</div><strong id="live-paid" style="font-size:17px;">${S().formatRupiah(wizardState.dibayar)}</strong></div>
          <div><div class="field-hint">Kembalian</div><strong id="live-change" style="font-size:17px; color:var(--success);">${S().formatRupiah(kembalian)}</strong></div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:16px; border-top:1px solid var(--border);">
          <button type="button" id="step-back-2" class="btn btn-secondary">&larr; Ubah Pembeli</button>
          <button type="button" id="step-next-4" class="btn btn-primary">Lanjut ke Konfirmasi ${SVG().icon('arrowRight', 15)}</button>
        </div>
      `;
    } else {
      stepContent = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin-bottom:14px;">
          <div>
            <h2 class="card-title">Langkah 4: Konfirmasi Akhir &amp; Pengecekan Ketersediaan</h2>
            <p class="card-subtitle">Pastikan seluruh nomor seri unit dan nominal pembayaran sudah benar.</p>
          </div>
          <button type="button" id="btn-sim-conflict" class="btn btn-danger-outline btn-sm" title="Simulasikan unit berubah status saat transaksi disusun (Tabel 5.4)">
            ${SVG().icon('alert', 14)} Simulasikan Unit Terjual Kasir Lain
          </button>
        </div>

        <div class="form-grid" style="margin-bottom:16px;">
          <div style="padding:14px 16px; background:var(--bg); border:1px solid var(--border); border-radius:12px;">
            <div class="field-hint">Data Pembeli</div>
            <div style="font-weight:700; font-size:15px; margin-top:2px;">${S().escapeHtml(wizardState.pembeliNama)}</div>
            <div style="font-size:13px; color:var(--text-secondary);">${S().escapeHtml(wizardState.pembeliKontak)}</div>
          </div>
          <div style="padding:14px 16px; background:var(--bg); border:1px solid var(--border); border-radius:12px;">
            <div class="field-hint">Pembayaran (${wizardState.metode})</div>
            <div style="font-weight:800; font-size:16px; color:var(--primary); margin-top:2px;">Total: ${S().formatRupiah(total)}</div>
            <div style="font-size:12.5px; color:var(--text-secondary);">Dibayar: ${S().formatRupiah(wizardState.dibayar)} &bull; Kembalian: ${S().formatRupiah(kembalian)}</div>
          </div>
        </div>

        <div class="table-wrap" style="border:1px solid var(--border); border-radius:12px; overflow:hidden;">
          <table class="data-table">
            <thead><tr><th>Unit &amp; Nomor Seri</th><th>Ketersediaan</th><th style="text-align:right;">Harga</th></tr></thead>
            <tbody>
              ${cartUnits.map(u => `
                <tr>
                  <td>
                    <strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)} (${u.grade})</strong>
                    <div class="mono" style="font-size:12px; color:var(--text-muted);">${u.kode} &bull; SN: ${u.serialNumber}</div>
                  </td>
                  <td>${S().statusBadge(u.status)}</td>
                  <td style="text-align:right; font-weight:700;">${S().formatRupiah(u.hargaJual)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:space-between; margin-top:20px; padding-top:16px; border-top:1px solid var(--border); flex-wrap:wrap; gap:10px;">
          <button type="button" id="step-back-3" class="btn btn-secondary">&larr; Ubah Pembayaran</button>
          <button type="button" id="btn-process-pay" class="btn btn-primary btn-lg">
            ${SVG().icon('receipt', 16)} Proses Pembayaran
          </button>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/transaksi/pencarian">Pencarian Stok</a> <span>/</span>
        <span class="current">Transaksi Baru</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Transaksi Penjualan Baru</h1>
          <p class="page-subtitle">Selesaikan 4 langkah verifikasi transaksi; klik langkah selesai di bawah untuk koreksi cepat.</p>
        </div>
        <div class="page-actions">
          <button type="button" id="btn-cancel-trx" class="btn btn-danger-outline btn-sm">Batalkan Transaksi</button>
        </div>
      </div>

      <div class="stepper">
        ${steps.map(s => {
          const cls = s.n < wizardState.step ? 'done' : (s.n === wizardState.step ? 'active' : '');
          return `
            <div class="step-item ${cls}" ${s.n < wizardState.step ? `data-jump-step="${s.n}"` : ''}>
              <span class="step-num">${s.n < wizardState.step ? SVG().icon('check', 13) : s.n}</span>
              <span>${s.label}</span>
            </div>
          `;
        }).join('')}
      </div>

      ${wizardState.alertMsg ? `
        <div class="alert alert-danger" style="justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:flex-start;">
            ${SVG().icon('alert', 18)}
            <div>
              <strong>Perubahan Ketersediaan Stok Terdeteksi</strong><br/>
              <span>${S().escapeHtml(wizardState.alertMsg)}</span>
            </div>
          </div>
          <button type="button" id="dismiss-trx-alert" class="icon-btn">&times;</button>
        </div>
      ` : ''}

      <div class="card card-pad">
        ${stepContent}
      </div>
    `;

    // Step jump
    container.querySelectorAll('[data-jump-step]').forEach(el => {
      el.addEventListener('click', () => { wizardState.step = Number(el.dataset.jumpStep); renderNewTransaction(container); });
    });

    const dismissAlert = container.querySelector('#dismiss-trx-alert');
    if (dismissAlert) {
      dismissAlert.addEventListener('click', () => { wizardState.alertMsg = ''; renderNewTransaction(container); });
    }

    container.querySelector('#btn-cancel-trx').addEventListener('click', () => {
      window.LapApp.openModal({
        title: 'Batalkan Transaksi',
        confirmClass: 'btn-danger',
        confirmLabel: 'Ya, Batalkan',
        body: '<p style="margin:0;">Keranjang transaksi akan dikosongkan dan Anda dikembalikan ke Pencarian Stok.</p>',
        onConfirm: () => {
          S().clearCart();
          wizardState = { step: 1, pembeliNama: '', pembeliKontak: '', metode: 'Tunai', dibayar: 0, alertMsg: '' };
          window.LapApp.refreshTopbarCart();
          window.LapApp.toast('Transaksi dibatalkan', 'Keranjang kasir telah dikosongkan.', 'info');
          window.LapRouter.navigate('/transaksi/pencarian');
        }
      });
    });

    // Step 1 bindings
    container.querySelectorAll('[data-rm-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        S().removeFromCart(btn.dataset.rmCart);
        window.LapApp.refreshTopbarCart();
        renderNewTransaction(container);
      });
    });
    const next2 = container.querySelector('#step-next-2');
    if (next2) next2.addEventListener('click', () => { wizardState.step = 2; renderNewTransaction(container); });

    // Step 2 bindings
    const back1 = container.querySelector('#step-back-1');
    if (back1) back1.addEventListener('click', () => { wizardState.step = 1; renderNewTransaction(container); });
    const next3 = container.querySelector('#step-next-3');
    if (next3) {
      next3.addEventListener('click', () => {
        const nama = container.querySelector('#tr-buyer-name').value.trim();
        const phone = container.querySelector('#tr-buyer-phone').value.trim();
        const errN = container.querySelector('#err-buyer-name');
        const errP = container.querySelector('#err-buyer-phone');
        errN.classList.add('hidden');
        errP.classList.add('hidden');
        let ok = true;
        if (!nama) { errN.classList.remove('hidden'); ok = false; }
        if (phone.replace(/\D/g, '').length < 8) { errP.classList.remove('hidden'); ok = false; }
        if (!ok) return;
        wizardState.pembeliNama = nama;
        wizardState.pembeliKontak = phone;
        wizardState.step = 3;
        renderNewTransaction(container);
      });
    }

    // Step 3 bindings
    const back2 = container.querySelector('#step-back-2');
    if (back2) back2.addEventListener('click', () => { wizardState.step = 2; renderNewTransaction(container); });
    const paidInp = container.querySelector('#tr-paid');
    if (paidInp) {
      paidInp.addEventListener('input', () => {
        const val = S().parseRupiah(paidInp.value);
        wizardState.dibayar = val;
        paidInp.value = val > 0 ? S().formatRupiah(val) : '';
        container.querySelector('#live-paid').textContent = S().formatRupiah(val);
        container.querySelector('#live-change').textContent = S().formatRupiah(Math.max(0, val - total));
      });
    }
    const methodSel = container.querySelector('#tr-method');
    if (methodSel) {
      methodSel.addEventListener('change', () => {
        wizardState.metode = methodSel.value;
        if (wizardState.metode !== 'Tunai') {
          wizardState.dibayar = total;
          paidInp.value = S().formatRupiah(total);
          container.querySelector('#live-paid').textContent = S().formatRupiah(total);
          container.querySelector('#live-change').textContent = S().formatRupiah(0);
        }
      });
    }
    const next4 = container.querySelector('#step-next-4');
    if (next4) {
      next4.addEventListener('click', () => {
        const errPaid = container.querySelector('#err-paid');
        if (wizardState.dibayar < total) {
          errPaid.classList.remove('hidden');
          return;
        }
        wizardState.step = 4;
        renderNewTransaction(container);
      });
    }

    // Step 4 bindings
    const back3 = container.querySelector('#step-back-3');
    if (back3) back3.addEventListener('click', () => { wizardState.step = 3; renderNewTransaction(container); });

    const simBtn = container.querySelector('#btn-sim-conflict');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const first = cartUnits[0];
        if (!first) return;
        first.status = 'Terjual';
        S().removeFromCart(first.id);
        S().save();
        wizardState.alertMsg = `Peringatan Ketersediaan: Unit ${first.kode} (${first.merek} ${first.model}) baru saja terjual oleh kasir lain dan telah dikeluarkan otomatis dari transaksi ini.`;
        window.LapApp.refreshTopbarCart();
        window.LapApp.toast('Stok berubah', `${first.kode} dikeluarkan otomatis dari transaksi.`, 'warning');
        renderNewTransaction(container);
      });
    }

    const payBtn = container.querySelector('#btn-process-pay');
    if (payBtn) {
      payBtn.addEventListener('click', () => {
        window.LapApp.openModal({
          title: 'Konfirmasi Proses Pembayaran',
          confirmLabel: 'Ya, Selesaikan Transaksi',
          body: `
            <p style="margin:0 0 10px;">Tindakan ini bersifat final. Sistem akan:</p>
            <ul style="margin:0; padding-left:20px; color:var(--text-secondary);">
              <li>Menyimpan transaksi senilai <strong>${S().formatRupiah(total)}</strong> atas nama <strong>${S().escapeHtml(wizardState.pembeliNama)}</strong></li>
              <li>Mengubah status <strong>${cartUnits.length} unit</strong> menjadi <strong>Terjual</strong> dan mengurangi stok otomatis</li>
              <li>Membuka halaman Nota Transaksi siap cetak</li>
            </ul>
          `,
          onConfirm: () => {
            const res = S().createTransaction(wizardState);
            if (!res.ok) {
              if (res.unavailable && res.unavailable.length > 0) {
                wizardState.alertMsg = `Unit ${res.unavailable.map(u => u.kode).join(', ')} tidak lagi Tersedia dan telah dikeluarkan otomatis.`;
                window.LapApp.refreshTopbarCart();
                renderNewTransaction(container);
                return;
              }
              window.LapApp.toast('Gagal memproses', res.reason, 'danger');
              return;
            }
            wizardState = { step: 1, pembeliNama: '', pembeliKontak: '', metode: 'Tunai', dibayar: 0, alertMsg: '' };
            window.LapApp.refreshTopbarCart();
            window.LapApp.toast(`Pembayaran berhasil (${res.trx.id})`, 'Status unit berubah menjadi Terjual dan stok berkurang otomatis.', 'success');
            window.LapRouter.navigate('/transaksi/' + res.trx.id);
          }
        });
      });
    }
  }

  // ==================== TR-03: DETAIL TRANSAKSI DAN NOTA ====================
  function renderReceipt(container, trxId) {
    const trx = S().getState().transactions.find(t => t.id === trxId);
    const isKasir = S().getCurrentRole() === 'kasir';
    if (!trx) {
      container.innerHTML = `<div class="card empty-state"><h3>Transaksi tidak ditemukan</h3><a href="#/transaksi" class="btn btn-primary btn-sm">Ke Riwayat Transaksi</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="breadcrumb no-print">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/transaksi">Riwayat Transaksi</a> <span>/</span>
        <span class="current">${trx.id}</span>
      </div>
      <div class="page-header no-print">
        <div>
          <h1 class="page-title">Detail Transaksi &amp; Nota</h1>
          <p class="page-subtitle">Nota resmi penjualan unit beserta nomor seri dan ketentuan garansi toko.</p>
        </div>
        <div class="page-actions">
          <a href="#/transaksi" class="btn btn-secondary">Kembali ke Riwayat</a>
          ${isKasir ? `<a href="#/transaksi/pencarian" class="btn btn-soft">Transaksi Baru</a>` : ''}
          <button type="button" id="btn-print-nota" class="btn btn-primary">${SVG().icon('printer', 16)} Cetak Nota</button>
        </div>
      </div>

      <div class="invoice-sheet">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:2px solid var(--text); padding-bottom:18px; margin-bottom:20px; flex-wrap:wrap;">
          <div>
            <div style="font-family:var(--font-sans); font-size:22px; font-weight:800;">LapStock Indonesia</div>
            <div style="font-size:12.5px; color:var(--text-secondary);">Jl. Veteran No. 48, Lowokwaru, Kota Malang &bull; Telp. 0811-3600-2026</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); font-weight:700;">Nota Penjualan</div>
            <div class="mono" style="font-size:16px; font-weight:700;">${trx.id}</div>
            <div style="font-size:12.5px; color:var(--text-secondary);">${trx.tanggal} &bull; ${trx.waktu} WIB</div>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:20px; font-size:13.5px;">
          <div>
            <div class="field-hint">Pembeli</div>
            <div style="font-weight:700; font-size:15px;">${S().escapeHtml(trx.pembeliNama)}</div>
            <div style="color:var(--text-secondary);">${S().escapeHtml(trx.pembeliKontak)}</div>
          </div>
          <div style="text-align:right;">
            <div class="field-hint">Kasir Bertugas &amp; Metode</div>
            <div style="font-weight:700;">${S().escapeHtml(trx.kasir)}</div>
            <div style="color:var(--text-secondary);">Metode Pembayaran: <strong>${trx.metode}</strong></div>
          </div>
        </div>

        <div class="table-wrap" style="border:1px solid var(--border); border-radius:10px; margin-bottom:18px;">
          <table class="data-table">
            <thead>
              <tr><th>Unit &amp; Nomor Seri</th><th>Grade</th><th>Garansi</th><th style="text-align:right;">Harga</th></tr>
            </thead>
            <tbody>
              ${trx.items.map(it => `
                <tr>
                  <td>
                    <strong>${S().escapeHtml(it.nama)}</strong>
                    <div class="mono" style="font-size:12px; color:var(--text-muted);">${it.kode} &bull; SN: ${it.serialNumber}</div>
                  </td>
                  <td>${it.grade}</td>
                  <td>${it.garansi}</td>
                  <td style="text-align:right; font-weight:700;">${S().formatRupiah(it.harga)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <div style="width:280px; display:flex; flex-direction:column; gap:6px; font-size:13.5px;">
            <div style="display:flex; justify-content:space-between;"><span>Total Pembayaran</span><strong style="font-size:17px;">${S().formatRupiah(trx.total)}</strong></div>
            <div style="display:flex; justify-content:space-between; color:var(--text-secondary);"><span>Dibayar (${trx.metode})</span><span>${S().formatRupiah(trx.dibayar)}</span></div>
            <div style="display:flex; justify-content:space-between; color:var(--success); font-weight:600; border-top:1px solid var(--border); padding-top:6px;"><span>Kembalian</span><span>${S().formatRupiah(trx.kembalian)}</span></div>
          </div>
        </div>

        <div style="margin-top:26px; padding-top:14px; border-top:1px dashed var(--border-strong); font-size:12px; color:var(--text-muted);">
          <strong>Ketentuan Garansi:</strong> Simpan nota ini sebagai bukti sah klaim garansi sesuai durasi masing-masing unit. Nomor seri pada unit fisik wajib sesuai dengan yang tertera pada nota.
        </div>
      </div>
    `;

    container.querySelector('#btn-print-nota').addEventListener('click', () => window.print());
  }

  // ==================== TR-04: RIWAYAT TRANSAKSI ====================
  let histFilter = { q: '', from: '', to: '' };

  function renderHistory(container) {
    const trxs = S().getState().transactions;
    const isReadOnly = S().getCurrentRole() === 'pemilik';

    const filtered = trxs.filter(t => {
      if (histFilter.q) {
        const hay = `${t.id} ${t.pembeliNama} ${t.items.map(i => i.serialNumber + ' ' + i.nama).join(' ')}`.toLowerCase();
        if (!hay.includes(histFilter.q.toLowerCase())) return false;
      }
      if (histFilter.from && t.tanggal < histFilter.from) return false;
      if (histFilter.to && t.tanggal > histFilter.to) return false;
      return true;
    });

    const totalFiltered = filtered.reduce((s, t) => s + t.total, 0);

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Riwayat Transaksi</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Riwayat Transaksi Penjualan</h1>
          <p class="page-subtitle">Menampilkan <strong>${filtered.length}</strong> transaksi senilai <strong>${S().formatRupiah(totalFiltered)}</strong>${isReadOnly ? ' (baca saja)' : ''}.</p>
        </div>
        ${!isReadOnly ? `<div class="page-actions"><a href="#/transaksi/pencarian" class="btn btn-primary">${SVG().icon('plus', 15)} Transaksi Baru</a></div>` : ''}
      </div>

      <div class="filter-bar">
        <input type="text" id="ht-q" class="form-control search-grow" placeholder="Cari nomor nota, nama pembeli, atau nomor seri..." value="${S().escapeHtml(histFilter.q)}" />
        <input type="date" id="ht-from" class="form-control" value="${histFilter.from}" aria-label="Dari tanggal" />
        <input type="date" id="ht-to" class="form-control" value="${histFilter.to}" aria-label="Sampai tanggal" />
        <button type="button" id="ht-reset" class="btn btn-ghost btn-sm">Reset</button>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Nomor Nota</th><th>Tanggal</th><th>Pembeli</th><th>Unit &amp; SN</th><th>Metode</th><th>Total</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">Tidak ada transaksi yang sesuai filter tanggal atau pencarian.</td></tr>
              ` : filtered.map(t => `
                <tr class="clickable-row" data-open-trx="${t.id}">
                  <td class="mono" style="font-weight:600;">${t.id}</td>
                  <td>${t.tanggal}<div style="font-size:11.5px; color:var(--text-muted);">${t.waktu}</div></td>
                  <td><strong>${S().escapeHtml(t.pembeliNama)}</strong><div style="font-size:11.5px; color:var(--text-muted);">${S().escapeHtml(t.pembeliKontak)}</div></td>
                  <td>${t.items.map(i => `<div>${S().escapeHtml(i.nama)} <span class="mono" style="font-size:11px; color:var(--text-muted);">(${i.serialNumber})</span></div>`).join('')}</td>
                  <td><span class="badge badge-neutral">${t.metode}</span></td>
                  <td style="font-weight:700; color:var(--primary);">${S().formatRupiah(t.total)}</td>
                  <td><button type="button" class="btn btn-secondary btn-sm" data-reprint="${t.id}">${SVG().icon('printer', 13)} Nota</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const qEl = container.querySelector('#ht-q');
    let timer = null;
    qEl.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = qEl.selectionStart;
        histFilter.q = qEl.value;
        renderHistory(container);
        const nxt = container.querySelector('#ht-q');
        if (nxt) { nxt.focus(); nxt.setSelectionRange(pos, pos); }
      }, 150);
    });

    container.querySelector('#ht-from').addEventListener('change', (e) => { histFilter.from = e.target.value; renderHistory(container); });
    container.querySelector('#ht-to').addEventListener('change', (e) => { histFilter.to = e.target.value; renderHistory(container); });
    container.querySelector('#ht-reset').addEventListener('click', () => { histFilter = { q: '', from: '', to: '' }; renderHistory(container); });

    container.querySelectorAll('[data-open-trx], [data-reprint]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.openTrx || el.dataset.reprint;
        window.LapRouter.navigate('/transaksi/' + id);
      });
    });
  }

  return { renderStockSearch, renderNewTransaction, renderReceipt, renderHistory };
})();
