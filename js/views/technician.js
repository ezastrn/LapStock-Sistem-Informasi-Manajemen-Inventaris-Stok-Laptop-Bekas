/* ==========================================================================
   Technician Views: TK-01 Antrean Teknis, TK-02 Detail Pekerjaan Teknis
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.Technician = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  let activeStatusTab = 'Semua';
  let searchQ = '';

  // ==================== TK-01: ANTREAN TEKNIS ====================
  function renderQueue(container) {
    const role = S().getCurrentRole();
    const isReadOnly = role === 'admin_gudang';
    const units = S().getState().units.filter(u => u.status !== 'Nonaktif' && u.status !== 'Terjual');

    const tabs = ['Semua', 'Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi', 'Selesai'];
    const countOf = (st) => st === 'Semua' ? units.length : units.filter(u => u.statusTeknis === st).length;

    const filtered = units.filter(u => {
      if (activeStatusTab !== 'Semua' && u.statusTeknis !== activeStatusTab) return false;
      if (searchQ) {
        const hay = `${u.kode} ${u.serialNumber} ${u.merek} ${u.model}`.toLowerCase();
        if (!hay.includes(searchQ.toLowerCase())) return false;
      }
      return true;
    });

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Antrean Teknis</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Antrean Inspeksi &amp; Modifikasi Teknis</h1>
          <p class="page-subtitle">
            Kelola progres pengecekan unit sebelum masuk etalase siap jual${isReadOnly ? ' (mode baca saja untuk Admin Gudang)' : ''}.
          </p>
        </div>
      </div>

      <div class="tabs-bar">
        ${tabs.map(t => `
          <button type="button" class="tab-btn ${activeStatusTab === t ? 'active' : ''}" data-tk-tab="${t}">
            ${t} <span class="tab-count">${countOf(t)}</span>
          </button>
        `).join('')}
      </div>

      <div class="filter-bar">
        <input type="text" id="tk-search" class="form-control search-grow" placeholder="Cari kode unit, nomor seri, atau model laptop..." value="${S().escapeHtml(searchQ)}" />
      </div>

      ${filtered.length === 0 ? `
        <div class="card empty-state">
          <div class="empty-icon">${SVG().icon('wrench', 24)}</div>
          <h3>Tidak ada unit di antrean ini</h3>
          <p>Coba pilih tab status teknis lainnya atau ubah kata kunci pencarian.</p>
        </div>
      ` : `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(330px, 1fr)); gap:16px;">
          ${filtered.map(u => {
            const daysInQueue = Math.max(1, Math.round((new Date('2026-11-26') - new Date(u.tanggalMasuk)) / 86400000));
            return `
              <div class="card card-pad" style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                  <span class="mono" style="font-size:12px; font-weight:600; color:var(--text-muted);">${u.kode} &bull; ${u.serialNumber}</span>
                  ${S().statusBadge(u.statusTeknis)}
                </div>
                <div style="cursor:pointer;" data-open-tk="${u.id}">
                  <h3 style="font-size:16px; font-weight:700;">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h3>
                  <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">${S().escapeHtml(u.cpu)} &bull; ${u.ram} &bull; ${S().escapeHtml(u.storage)}</div>
                </div>
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--text-muted); padding-top:8px; border-top:1px solid var(--surface-subtle);">
                  <span>${SVG().icon('clock', 12)} Masuk ${daysInQueue} hari lalu</span>
                  <span>${u.modifikasi.length} modifikasi tercatat</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-top:auto;">
                  ${!isReadOnly && u.statusTeknis !== 'Selesai' ? `
                    <select class="form-control" style="height:34px; font-size:12.5px; flex:1;" data-quick-status="${u.id}" aria-label="Ubah status cepat">
                      ${['Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi'].map(opt => `<option value="${opt}" ${u.statusTeknis === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                  ` : ''}
                  <a href="#/teknisi/unit/${u.id}" class="btn btn-soft btn-sm" style="${isReadOnly || u.statusTeknis === 'Selesai' ? 'width:100%;' : ''}">Detail Pekerjaan</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;

    container.querySelectorAll('[data-tk-tab]').forEach(btn => {
      btn.addEventListener('click', () => { activeStatusTab = btn.dataset.tkTab; renderQueue(container); });
    });

    const sInp = container.querySelector('#tk-search');
    let timer = null;
    sInp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const pos = sInp.selectionStart;
        searchQ = sInp.value;
        renderQueue(container);
        const nxt = container.querySelector('#tk-search');
        if (nxt) { nxt.focus(); nxt.setSelectionRange(pos, pos); }
      }, 150);
    });

    container.querySelectorAll('[data-open-tk]').forEach(el => {
      el.addEventListener('click', () => window.LapRouter.navigate('/teknisi/unit/' + el.dataset.openTk));
    });

    container.querySelectorAll('[data-quick-status]').forEach(sel => {
      sel.addEventListener('change', () => {
        S().updateTechStatus(sel.dataset.quickStatus, sel.value);
        window.LapApp.toast('Status teknis diperbarui', `Unit ${sel.dataset.quickStatus} kini berstatus ${sel.value} dan tersinkron ke Cek Status Pelanggan.`, 'success');
        renderQueue(container);
      });
    });
  }

  // ==================== TK-02: DETAIL PEKERJAAN TEKNIS ====================
  function renderJobDetail(container, unitId) {
    const u = S().getUnitById(unitId);
    const isReadOnly = S().getCurrentRole() === 'admin_gudang';
    if (!u) {
      container.innerHTML = `<div class="card empty-state"><h3>Unit tidak ditemukan</h3><a href="#/teknisi/antrean" class="btn btn-primary btn-sm">Kembali ke Antrean</a></div>`;
      return;
    }

    const canComplete = !isReadOnly && u.statusTeknis !== 'Selesai' && (u.catatanInspeksi || '').trim().length > 0;

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/teknisi/antrean">Antrean Teknis</a> <span>/</span>
        <span class="current">${u.kode}</span>
      </div>
      <div class="page-header">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
            <span class="mono" style="font-size:13px; color:var(--text-muted);">${u.kode} &bull; SN: ${u.serialNumber}</span>
            ${S().statusBadge(u.statusTeknis)}
          </div>
          <h1 class="page-title">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h1>
          <p class="page-subtitle">Perubahan status langsung terlihat oleh pelanggan pada halaman Cek Status Unit (PU-04).</p>
        </div>
        <div class="page-actions">
          <a href="#/teknisi/antrean" class="btn btn-secondary">Kembali ke Antrean</a>
          ${!isReadOnly && u.statusTeknis !== 'Selesai' ? `
            <button type="button" id="btn-mark-done" class="btn btn-success" ${canComplete ? '' : 'disabled title="Isi dan simpan catatan inspeksi terlebih dahulu"'}>
              ${SVG().icon('checkCircle', 16)} Tandai Selesai &amp; Tersedia
            </button>
          ` : ''}
        </div>
      </div>

      <div class="dashboard-grid" style="grid-template-columns:1fr 1.25fr; align-items:start;">
        <div class="card card-pad">
          <h2 class="card-title" style="margin-bottom:14px;">Status &amp; Catatan Inspeksi</h2>
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="form-group">
              <label class="form-label" for="tk-status-sel">Status Teknis Saat Ini</label>
              <select id="tk-status-sel" class="form-control" ${isReadOnly || u.statusTeknis === 'Selesai' ? 'disabled' : ''}>
                ${['Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi', 'Selesai'].map(st => `<option value="${st}" ${u.statusTeknis === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="tk-notes">Catatan Hasil Inspeksi <span class="req">*</span></label>
              <textarea id="tk-notes" class="form-control" rows="4" placeholder="Catat hasil uji baterai, suhu, layar, port, dan keyboard..." ${isReadOnly ? 'readonly' : ''}>${S().escapeHtml(u.catatanInspeksi || '')}</textarea>
              <div class="field-hint">Tombol "Tandai Selesai" aktif setelah catatan inspeksi terisi.</div>
            </div>
            ${!isReadOnly ? `
              <button type="button" id="btn-save-inspection" class="btn btn-primary">Simpan Status &amp; Catatan</button>
            ` : ''}
          </div>
        </div>

        <div class="card card-pad">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px;">
            <div>
              <h2 class="card-title">Riwayat Modifikasi Komponen</h2>
              <p class="card-subtitle">Tersinkron langsung ke Detail Unit Inventaris (IV-03) dan Katalog Publik (PU-03).</p>
            </div>
            ${!isReadOnly ? `<button type="button" id="btn-add-mod" class="btn btn-soft btn-sm">${SVG().icon('plus', 14)} Tambah Modifikasi</button>` : ''}
          </div>

          ${u.modifikasi.length === 0 ? `
            <div class="empty-state" style="padding:28px 16px;">
              <p style="margin:0;">Belum ada riwayat upgrade atau perbaikan komponen tercatat.</p>
            </div>
          ` : `
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Tanggal</th><th>Jenis</th><th>Lama &rarr; Baru</th><th>Catatan</th></tr></thead>
                <tbody>
                  ${u.modifikasi.map(m => `
                    <tr>
                      <td class="mono">${m.tanggal}</td>
                      <td><span class="badge badge-info">${S().escapeHtml(m.jenis)}</span></td>
                      <td>
                        <div style="font-size:12px; color:var(--text-muted); text-decoration:line-through;">${S().escapeHtml(m.komponenLama)}</div>
                        <strong>${S().escapeHtml(m.komponenBaru)}</strong>
                      </td>
                      <td>${S().escapeHtml(m.catatan)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    const notesEl = container.querySelector('#tk-notes');
    const doneBtn = container.querySelector('#btn-mark-done');
    if (notesEl && doneBtn) {
      notesEl.addEventListener('input', () => {
        doneBtn.disabled = notesEl.value.trim().length === 0;
      });
    }

    const saveBtn = container.querySelector('#btn-save-inspection');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const st = container.querySelector('#tk-status-sel').value;
        const notes = notesEl.value.trim();
        if (st === 'Selesai' && !notes) {
          window.LapApp.toast('Catatan inspeksi diperlukan', 'Isi catatan inspeksi sebelum menandai unit Selesai.', 'warning');
          return;
        }
        S().updateTechStatus(u.id, st, notes);
        window.LapApp.toast('Inspeksi diperbarui', `Status ${u.kode} kini "${st}" dan catatan tersimpan.`, 'success');
        renderJobDetail(container, unitId);
      });
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        const notes = notesEl.value.trim();
        if (!notes) return;
        window.LapApp.openModal({
          title: 'Tandai Pekerjaan Teknis Selesai',
          confirmClass: 'btn-success',
          confirmLabel: 'Konfirmasi Selesai',
          body: `
            <p style="margin:0;">Apakah Anda yakin seluruh inspeksi pada unit <strong>${u.kode} (${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)})</strong> telah lulus uji? Unit akan otomatis berubah menjadi status <strong>Tersedia</strong> dan dapat langsung dijual oleh Kasir.</p>
          `,
          onConfirm: () => {
            S().updateTechStatus(u.id, 'Selesai', notes);
            window.LapApp.toast('Pekerjaan teknis selesai', 'Unit otomatis berstatus Tersedia dan dapat langsung dijual oleh Kasir.', 'success');
            window.LapRouter.navigate('/teknisi/antrean');
          }
        });
      });
    }

    const addModBtn = container.querySelector('#btn-add-mod');
    if (addModBtn) {
      addModBtn.addEventListener('click', () => {
        window.LapApp.openModal({
          title: 'Tambah Riwayat Modifikasi Komponen',
          confirmLabel: 'Simpan Modifikasi',
          body: `
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="mod-jenis">Jenis Modifikasi <span class="req">*</span></label>
                <select id="mod-jenis" class="form-control">
                  <option value="Upgrade RAM">Upgrade RAM</option>
                  <option value="Upgrade Storage">Upgrade Storage (SSD)</option>
                  <option value="Ganti Baterai">Penggantian Baterai</option>
                  <option value="Ganti Layar">Penggantian Panel Layar</option>
                  <option value="Maintenance">Maintenance / Repaste</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="mod-tgl">Tanggal</label>
                <input type="date" id="mod-tgl" class="form-control" value="${S().todayStr()}" />
              </div>
              <div class="form-group full">
                <label class="form-label" for="mod-lama">Komponen Lama <span class="req">*</span></label>
                <input type="text" id="mod-lama" class="form-control" placeholder="Mis. 8 GB DDR4 3200MHz" />
              </div>
              <div class="form-group full">
                <label class="form-label" for="mod-baru">Komponen Baru <span class="req">*</span></label>
                <input type="text" id="mod-baru" class="form-control" placeholder="Mis. 16 GB DDR4 Dual-Channel" />
              </div>
              <div class="form-group full">
                <label class="form-label" for="mod-catatan">Catatan Teknis</label>
                <textarea id="mod-catatan" class="form-control" rows="2" placeholder="Hasil pengujian pasca pemasangan..."></textarea>
              </div>
            </div>
            <div id="mod-err" class="field-error hidden" style="margin-top:8px;">Komponen lama dan baru wajib diisi.</div>
          `,
          onConfirm: () => {
            const lama = document.querySelector('#mod-lama').value.trim();
            const baru = document.querySelector('#mod-baru').value.trim();
            if (!lama || !baru) {
              document.querySelector('#mod-err').classList.remove('hidden');
              return false;
            }
            S().addModification(u.id, {
              jenis: document.querySelector('#mod-jenis').value,
              tanggal: document.querySelector('#mod-tgl').value,
              komponenLama: lama,
              komponenBaru: baru,
              catatan: document.querySelector('#mod-catatan').value.trim()
            });
            window.LapApp.toast('Riwayat modifikasi ditambahkan', 'Perubahan komponen langsung tampil di Detail Unit & Katalog Pelanggan.', 'success');
            renderJobDetail(container, unitId);
          }
        });
      });
    }
  }

  return { renderQueue, renderJobDetail };
})();
