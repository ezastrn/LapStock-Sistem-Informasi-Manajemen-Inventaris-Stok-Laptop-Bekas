/* ==========================================================================
   Inventory Views: IV-01 Daftar Inventaris, IV-02 Tambah Unit,
                    IV-03 Detail Unit, IV-04 Ubah Unit, IV-05 Rekap Stok Fisik
   ========================================================================== */

window.LapViews = window.LapViews || {};

window.LapViews.Inventory = (function () {
  const S = () => window.LapStore;
  const SVG = () => window.LapSVG;

  let listState = { q: '', merek: '', cpu: '', ram: '', grade: '', status: '', sortKey: 'kode', sortDir: 'desc', page: 1 };

  // ==================== IV-01: DAFTAR INVENTARIS ====================
  function renderList(container) {
    const role = S().getCurrentRole();
    const isReadOnly = role === 'pemilik';
    const units = S().getState().units;

    const filtered = units.filter(u => {
      if (listState.q) {
        const hay = `${u.kode} ${u.serialNumber} ${u.merek} ${u.model} ${u.cpu}`.toLowerCase();
        if (!hay.includes(listState.q.toLowerCase())) return false;
      }
      if (listState.merek && u.merek !== listState.merek) return false;
      if (listState.cpu && !u.cpu.toLowerCase().includes(listState.cpu.toLowerCase())) return false;
      if (listState.ram && u.ram !== listState.ram) return false;
      if (listState.grade && u.grade !== listState.grade) return false;
      if (listState.status && u.status !== listState.status) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const av = a[listState.sortKey];
      const bv = b[listState.sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return listState.sortDir === 'asc' ? cmp : -cmp;
    });

    const perPage = 8;
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (listState.page > totalPages) listState.page = 1;
    const rows = filtered.slice((listState.page - 1) * perPage, listState.page * perPage);

    const arrow = (k) => listState.sortKey === k ? (listState.sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span> <span class="current">Inventaris</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Daftar Inventaris Unit</h1>
          <p class="page-subtitle">
            Total <strong>${filtered.length}</strong> unit ditampilkan${isReadOnly ? ' (mode baca saja untuk Pemilik Toko)' : ''}.
          </p>
        </div>
        <div class="page-actions">
          ${!isReadOnly ? `
            <a href="#/inventaris/rekap" class="btn btn-secondary">${SVG().icon('clipboard', 15)} Rekap Stok Fisik</a>
            <a href="#/inventaris/tambah" class="btn btn-primary">${SVG().icon('plus', 16)} Tambah Unit</a>
          ` : ''}
        </div>
      </div>

      <div class="filter-bar">
        <input type="text" id="iv-q" class="form-control search-grow" placeholder="Cari nomor seri, kode unit, merek, model..." value="${S().escapeHtml(listState.q)}" />
        <select id="iv-merek" class="form-control">
          <option value="">Semua Merek</option>
          ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}" ${listState.merek === m ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
        <select id="iv-ram" class="form-control">
          <option value="">Semua RAM</option>
          ${['8 GB', '16 GB', '32 GB'].map(r => `<option value="${r}" ${listState.ram === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
        <select id="iv-grade" class="form-control">
          <option value="">Semua Grade</option>
          ${['Grade A', 'Grade B', 'Grade C'].map(g => `<option value="${g}" ${listState.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
        <select id="iv-status" class="form-control">
          <option value="">Semua Status</option>
          ${['Tersedia', 'Dalam Inspeksi', 'Menunggu Komponen', 'Instalasi', 'Terjual', 'Nonaktif'].map(st => `<option value="${st}" ${listState.status === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
        <button type="button" id="iv-reset" class="btn btn-ghost btn-sm">Reset</button>
      </div>

      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" data-sort="kode">Kode${arrow('kode')}</th>
                <th class="sortable" data-sort="model">Identitas Unit${arrow('model')}</th>
                <th>Nomor Seri</th>
                <th class="sortable" data-sort="grade">Grade${arrow('grade')}</th>
                <th class="sortable" data-sort="status">Status${arrow('status')}</th>
                <th class="sortable" data-sort="hargaJual">Harga Jual${arrow('hargaJual')}</th>
                ${!isReadOnly ? '<th>Aksi</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${rows.length === 0 ? `
                <tr><td colspan="${isReadOnly ? 6 : 7}" style="text-align:center; padding:36px; color:var(--text-muted);">
                  Tidak ada unit yang cocok dengan filter. Coba ubah kata kunci atau reset filter.
                </td></tr>
              ` : rows.map(u => `
                <tr class="clickable-row" data-row-unit="${u.id}">
                  <td class="mono" style="font-weight:600;">${u.kode}</td>
                  <td>
                    <strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong>
                    <div style="font-size:12px; color:var(--text-muted);">${S().escapeHtml(u.cpu)} &bull; ${u.ram} &bull; ${S().escapeHtml(u.storage)}</div>
                  </td>
                  <td class="mono">${u.serialNumber}</td>
                  <td><span class="grade-pill">${u.grade}</span></td>
                  <td>${S().statusBadge(u.status)}</td>
                  <td style="font-weight:700;">${S().formatRupiah(u.hargaJual)}</td>
                  ${!isReadOnly ? `
                    <td>
                      <button type="button" class="btn btn-secondary btn-sm" data-edit-unit="${u.id}" ${u.status === 'Terjual' ? 'disabled title="Unit terjual terkunci"' : ''}>
                        ${SVG().icon('edit', 13)} Ubah
                      </button>
                    </td>
                  ` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span style="font-size:12.5px; color:var(--text-muted);">Menampilkan ${rows.length} dari ${filtered.length} unit</span>
          <div class="pagination-btns">
            <button type="button" class="page-btn" data-iv-page="${listState.page - 1}" ${listState.page <= 1 ? 'disabled' : ''}>Prev</button>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `<button type="button" class="page-btn ${p === listState.page ? 'active' : ''}" data-iv-page="${p}">${p}</button>`).join('')}
            <button type="button" class="page-btn" data-iv-page="${listState.page + 1}" ${listState.page >= totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      </div>
    `;

    const qInput = container.querySelector('#iv-q');
    let t = null;
    qInput.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const pos = qInput.selectionStart;
        listState.q = qInput.value;
        listState.page = 1;
        renderList(container);
        const nxt = container.querySelector('#iv-q');
        if (nxt) { nxt.focus(); nxt.setSelectionRange(pos, pos); }
      }, 150);
    });

    ['merek', 'ram', 'grade', 'status'].forEach(k => {
      container.querySelector('#iv-' + k).addEventListener('change', (e) => {
        listState[k] = e.target.value;
        listState.page = 1;
        renderList(container);
      });
    });

    container.querySelector('#iv-reset').addEventListener('click', () => {
      listState = { q: '', merek: '', cpu: '', ram: '', grade: '', status: '', sortKey: 'kode', sortDir: 'desc', page: 1 };
      renderList(container);
    });

    container.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const k = th.dataset.sort;
        if (listState.sortKey === k) listState.sortDir = listState.sortDir === 'asc' ? 'desc' : 'asc';
        else { listState.sortKey = k; listState.sortDir = 'asc'; }
        renderList(container);
      });
    });

    container.querySelectorAll('[data-iv-page]').forEach(btn => {
      btn.addEventListener('click', () => { listState.page = Number(btn.dataset.ivPage); renderList(container); });
    });

    container.querySelectorAll('[data-row-unit]').forEach(tr => {
      tr.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit-unit]')) return;
        window.LapRouter.navigate('/inventaris/' + tr.dataset.rowUnit);
      });
    });

    container.querySelectorAll('[data-edit-unit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.LapRouter.navigate('/inventaris/' + btn.dataset.editUnit + '/ubah');
      });
    });
  }

  // ==================== IV-02: TAMBAH UNIT ====================
  function renderAddUnit(container) {
    let uploadedFoto = '';
    let isDirty = false;
    window.LapRouter.setDirtyGuard(() => isDirty);

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/inventaris">Inventaris</a> <span>/</span>
        <span class="current">Tambah Unit</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Tambah Unit Laptop Masuk</h1>
          <p class="page-subtitle">Unit baru yang disimpan otomatis berstatus <strong>Dalam Inspeksi</strong> dan langsung masuk ke Antrean Teknis.</p>
        </div>
      </div>

      <form id="add-unit-form" novalidate>
        <!-- Dual Serial Number Verification Box -->
        <div class="sn-verify-box" id="sn-verify-box">
          <div class="sn-verify-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="brand-mark" style="width:36px; height:36px;">${SVG().icon('barcode', 18)}</div>
              <div>
                <div style="font-weight:700; font-size:14.5px;">Verifikasi Nomor Seri (Wajib Ganda)</div>
                <div style="font-size:12.5px; color:var(--text-secondary);">Ketik atau pindai nomor seri dua kali untuk mencegah salah input dan duplikasi stok.</div>
              </div>
            </div>
            <div id="sn-status-pill" class="badge badge-neutral">Menunggu input SN</div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="add-sn1">Nomor Seri <span class="req">*</span></label>
              <input type="text" id="add-sn1" class="form-control mono" placeholder="Contoh: SN-ULTRA-2026" autocomplete="off" />
            </div>
            <div class="form-group">
              <label class="form-label" for="add-sn2">Konfirmasi Nomor Seri <span class="req">*</span></label>
              <input type="text" id="add-sn2" class="form-control mono" placeholder="Ketik ulang nomor seri" autocomplete="off" />
            </div>
          </div>
          <div id="sn-error-msg" class="field-error hidden" style="margin-top:8px;"></div>
        </div>

        <div class="form-grid" style="align-items:start;">
          <div class="card card-pad">
            <h2 class="card-title" style="margin-bottom:16px;">Identitas &amp; Spesifikasi Unit</h2>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="add-merek">Merek <span class="req">*</span></label>
                <select id="add-merek" class="form-control">
                  ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="add-model">Model / Seri Laptop <span class="req">*</span></label>
                <input type="text" id="add-model" class="form-control" placeholder="Mis. ThinkPad T14s Gen 4" />
                <div id="err-model" class="field-error hidden"></div>
              </div>
              <div class="form-group full">
                <label class="form-label" for="add-cpu">Prosesor (CPU) <span class="req">*</span></label>
                <input type="text" id="add-cpu" class="form-control" placeholder="Mis. Intel Core i7-1355U" />
                <div id="err-cpu" class="field-error hidden"></div>
              </div>
              <div class="form-group">
                <label class="form-label" for="add-ram">RAM <span class="req">*</span></label>
                <select id="add-ram" class="form-control">
                  <option value="8 GB">8 GB</option>
                  <option value="16 GB" selected>16 GB</option>
                  <option value="32 GB">32 GB</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="add-storage">Storage <span class="req">*</span></label>
                <input type="text" id="add-storage" class="form-control" placeholder="Mis. 512GB NVMe SSD" value="512GB NVMe SSD" />
                <div id="err-storage" class="field-error hidden"></div>
              </div>
              <div class="form-group full">
                <label class="form-label" for="add-layar">Ukuran &amp; Panel Layar</label>
                <input type="text" id="add-layar" class="form-control" placeholder='Mis. 14" FHD IPS' value='14" FHD IPS' />
              </div>
              <div class="form-group full">
                <label class="form-label" for="add-grade">Grade Kondisi Fisik <span class="req">*</span></label>
                <select id="add-grade" class="form-control">
                  <option value="Grade A">Grade A — Mulus Seperti Baru</option>
                  <option value="Grade B">Grade B — Pemakaian Wajar</option>
                  <option value="Grade C">Grade C — Fungsional Ekonomis</option>
                </select>
                <div id="grade-desc-box" style="margin-top:6px; padding:10px 12px; border-radius:9px; background:var(--bg); border:1px solid var(--border); font-size:12.5px; color:var(--text-secondary);">
                  ${S().GRADE_INFO['Grade A']}
                </div>
              </div>
            </div>
          </div>

          <div class="card card-pad">
            <h2 class="card-title" style="margin-bottom:16px;">Harga, Kelengkapan &amp; Foto Unit</h2>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="add-beli">Harga Beli (Modal) <span class="req">*</span></label>
                <input type="text" id="add-beli" class="form-control" placeholder="Rp 0" />
                <div id="err-beli" class="field-error hidden"></div>
              </div>
              <div class="form-group">
                <label class="form-label" for="add-jual">Harga Jual <span class="req">*</span></label>
                <input type="text" id="add-jual" class="form-control" placeholder="Rp 0" />
                <div id="err-jual" class="field-error hidden"></div>
              </div>
              <div class="form-group full">
                <label class="form-label" for="add-garansi">Durasi Garansi Toko</label>
                <select id="add-garansi" class="form-control">
                  <option value="30 Hari">30 Hari</option>
                  <option value="60 Hari">60 Hari</option>
                  <option value="90 Hari" selected>90 Hari</option>
                </select>
              </div>
              <div class="form-group full">
                <label class="form-label">Checklist Kelengkapan</label>
                <div class="checkbox-grid">
                  ${['Charger Original', 'Tas Laptop', 'Kabel Power', 'Dus / Box', 'Kartu Garansi Toko'].map((item, i) => `
                    <label class="checkbox-card">
                      <input type="checkbox" name="kelengkapan" value="${item}" ${i === 0 || i === 4 ? 'checked' : ''} />
                      <span>${item}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group full">
                <label class="form-label" for="add-foto">Foto Unit (Opsional, JPG/PNG/WEBP maks. 2 MB)</label>
                <label for="add-foto" style="border:1.5px dashed var(--border-strong); border-radius:12px; padding:18px; text-align:center; cursor:pointer; background:var(--bg); display:block;">
                  <div style="color:var(--text-muted); margin-bottom:6px;">${SVG().icon('upload', 20)}</div>
                  <div style="font-size:13px; font-weight:600; color:var(--text);">Pilih berkas foto unit dari perangkat</div>
                  <div id="foto-name" style="font-size:12px; color:var(--text-muted); margin-top:3px;">Belum ada berkas dipilih (akan menggunakan ilustrasi bawaan)</div>
                  <input type="file" id="add-foto" accept="image/jpeg,image/png,image/webp" class="hidden" />
                </label>
                <div id="err-foto" class="field-error hidden"></div>
                <div id="foto-preview-wrap" class="hidden" style="margin-top:8px;">
                  <img id="foto-preview" src="" alt="Pratinjau foto unit" style="max-height:130px; border-radius:10px; border:1px solid var(--border);" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
          <button type="button" id="btn-cancel-add" class="btn btn-secondary">Batal</button>
          <button type="submit" id="btn-save-add" class="btn btn-primary" disabled>
            ${SVG().icon('check', 16)} Simpan Unit Baru
          </button>
        </div>
      </form>
    `;

    const sn1 = container.querySelector('#add-sn1');
    const sn2 = container.querySelector('#add-sn2');
    const snBox = container.querySelector('#sn-verify-box');
    const snPill = container.querySelector('#sn-status-pill');
    const snErr = container.querySelector('#sn-error-msg');
    const btnSave = container.querySelector('#btn-save-add');

    function validateSN() {
      const v1 = sn1.value.trim().toUpperCase();
      const v2 = sn2.value.trim().toUpperCase();
      snBox.classList.remove('state-valid', 'state-error');
      sn1.classList.remove('is-valid', 'is-invalid');
      sn2.classList.remove('is-valid', 'is-invalid');
      snErr.classList.add('hidden');

      if (!v1 && !v2) {
        snPill.className = 'badge badge-neutral';
        snPill.textContent = 'Menunggu input SN';
        btnSave.disabled = true;
        return false;
      }
      if (S().isSerialDuplicate(v1)) {
        snBox.classList.add('state-error');
        sn1.classList.add('is-invalid');
        snPill.className = 'badge badge-danger';
        snPill.textContent = 'Nomor Seri Duplikat';
        snErr.textContent = `Nomor seri "${v1}" sudah terdaftar di sistem. Gunakan nomor seri unik.`;
        snErr.classList.remove('hidden');
        btnSave.disabled = true;
        return false;
      }
      if (v1 && v2 && v1 !== v2) {
        snBox.classList.add('state-error');
        sn2.classList.add('is-invalid');
        snPill.className = 'badge badge-danger';
        snPill.textContent = 'Tidak Cocok';
        snErr.textContent = 'Konfirmasi nomor seri tidak cocok dengan input pertama.';
        snErr.classList.remove('hidden');
        btnSave.disabled = true;
        return false;
      }
      if (v1.length >= 4 && v1 === v2) {
        snBox.classList.add('state-valid');
        sn1.classList.add('is-valid');
        sn2.classList.add('is-valid');
        snPill.className = 'badge badge-success';
        snPill.innerHTML = `${SVG().icon('checkCircle', 13)} Cocok &amp; Unik`;
        btnSave.disabled = false;
        return true;
      }
      snPill.className = 'badge badge-warning';
      snPill.textContent = 'Lengkapi kedua kolom SN (min. 4 karakter)';
      btnSave.disabled = true;
      return false;
    }

    sn1.addEventListener('input', () => { isDirty = true; validateSN(); });
    sn2.addEventListener('input', () => { isDirty = true; validateSN(); });

    container.querySelector('#add-grade').addEventListener('change', (e) => {
      isDirty = true;
      container.querySelector('#grade-desc-box').textContent = S().GRADE_INFO[e.target.value];
    });

    // Live Rupiah formatter
    ['#add-beli', '#add-jual'].forEach(sel => {
      const inp = container.querySelector(sel);
      inp.addEventListener('input', () => {
        isDirty = true;
        const num = S().parseRupiah(inp.value);
        inp.value = num > 0 ? S().formatRupiah(num) : '';
      });
    });

    // Blur validation for required text fields
    const reqFields = [
      { id: '#add-model', err: '#err-model', msg: 'Model / seri laptop wajib diisi.' },
      { id: '#add-cpu', err: '#err-cpu', msg: 'Prosesor (CPU) wajib diisi.' },
      { id: '#add-storage', err: '#err-storage', msg: 'Kapasitas storage wajib diisi.' }
    ];
    reqFields.forEach(f => {
      const el = container.querySelector(f.id);
      el.addEventListener('input', () => { isDirty = true; });
      el.addEventListener('blur', () => {
        const errEl = container.querySelector(f.err);
        if (!el.value.trim()) {
          el.classList.add('is-invalid');
          errEl.textContent = f.msg;
          errEl.classList.remove('hidden');
        } else {
          el.classList.remove('is-invalid');
          errEl.classList.add('hidden');
        }
      });
    });

    // File upload validation (format & max 2MB)
    container.querySelector('#add-foto').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const errFoto = container.querySelector('#err-foto');
      errFoto.classList.add('hidden');
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errFoto.textContent = 'Format berkas ditolak. Hanya JPG, PNG, atau WEBP yang diperbolehkan.';
        errFoto.classList.remove('hidden');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        errFoto.textContent = 'Ukuran foto melebihi batas maksimal 2 MB.';
        errFoto.classList.remove('hidden');
        return;
      }
      isDirty = true;
      container.querySelector('#foto-name').textContent = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        uploadedFoto = reader.result;
        container.querySelector('#foto-preview').src = uploadedFoto;
        container.querySelector('#foto-preview-wrap').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });

    container.querySelector('#btn-cancel-add').addEventListener('click', () => {
      window.LapRouter.navigate('/inventaris');
    });

    container.querySelector('#add-unit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateSN()) return;

      let valid = true;
      reqFields.forEach(f => {
        const el = container.querySelector(f.id);
        const errEl = container.querySelector(f.err);
        if (!el.value.trim()) {
          el.classList.add('is-invalid');
          errEl.textContent = f.msg;
          errEl.classList.remove('hidden');
          valid = false;
        }
      });

      const beli = S().parseRupiah(container.querySelector('#add-beli').value);
      const jual = S().parseRupiah(container.querySelector('#add-jual').value);
      const errBeli = container.querySelector('#err-beli');
      const errJual = container.querySelector('#err-jual');
      errBeli.classList.add('hidden');
      errJual.classList.add('hidden');
      if (beli <= 0) {
        errBeli.textContent = 'Harga beli wajib lebih dari Rp 0.';
        errBeli.classList.remove('hidden');
        valid = false;
      }
      if (jual <= 0) {
        errJual.textContent = 'Harga jual wajib lebih dari Rp 0.';
        errJual.classList.remove('hidden');
        valid = false;
      }
      if (!valid) return;

      const payload = {
        serialNumber: sn1.value.trim().toUpperCase(),
        merek: container.querySelector('#add-merek').value,
        model: container.querySelector('#add-model').value.trim(),
        cpu: container.querySelector('#add-cpu').value.trim(),
        ram: container.querySelector('#add-ram').value,
        storage: container.querySelector('#add-storage').value.trim(),
        layar: container.querySelector('#add-layar').value.trim() || '14" FHD IPS',
        grade: container.querySelector('#add-grade').value,
        hargaBeli: beli,
        hargaJual: jual,
        garansi: container.querySelector('#add-garansi').value,
        kelengkapan: Array.from(container.querySelectorAll('input[name="kelengkapan"]:checked')).map(c => c.value),
        foto: uploadedFoto
      };

      // Summary confirmation modal (Task 2.1.6)
      window.LapApp.openModal({
        title: 'Ringkasan Unit Baru',
        body: `
          <p style="margin:0 0 12px; color:var(--text-secondary);">Periksa kembali data sebelum disimpan. Unit akan langsung berstatus <strong>Dalam Inspeksi</strong> dan masuk ke Antrean Teknis.</p>
          <div style="background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:8px; font-size:13px;">
            <div style="display:flex; justify-content:space-between;"><span>Unit</span><strong>${S().escapeHtml(payload.merek)} ${S().escapeHtml(payload.model)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Nomor Seri</span><strong class="mono">${payload.serialNumber}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Spesifikasi</span><span>${S().escapeHtml(payload.cpu)}, ${payload.ram}, ${S().escapeHtml(payload.storage)}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Grade / Garansi</span><span>${payload.grade} &bull; ${payload.garansi}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Harga Modal / Jual</span><strong>${S().formatRupiah(payload.hargaBeli)} / ${S().formatRupiah(payload.hargaJual)}</strong></div>
          </div>
        `,
        confirmLabel: 'Konfirmasi & Simpan Unit',
        onConfirm: () => {
          const created = S().addUnit(payload);
          isDirty = false;
          window.LapRouter.setDirtyGuard(null);
          window.LapApp.toast('Unit berhasil dicatat', `${created.kode} (${created.serialNumber}) masuk ke Antrean Teknis.`, 'success');
          window.LapRouter.navigate('/inventaris/' + created.id);
        }
      });
    });
  }

  // ==================== IV-03: DETAIL UNIT INVENTARIS ====================
  function renderDetail(container, unitId, activeTab = 'spesifikasi') {
    const u = S().getUnitById(unitId);
    const isAdmin = S().getCurrentRole() === 'admin_gudang';
    if (!u) {
      container.innerHTML = `<div class="card empty-state"><h3>Unit tidak ditemukan</h3><a href="#/inventaris" class="btn btn-primary btn-sm">Kembali ke Inventaris</a></div>`;
      return;
    }

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/inventaris">Inventaris</a> <span>/</span>
        <span class="current">${u.kode}</span>
      </div>
      <div class="page-header">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <span class="mono" style="font-size:13px; color:var(--text-muted);">${u.kode} &bull; SN: ${u.serialNumber}</span>
            ${S().statusBadge(u.status)}
            <span class="grade-pill">${u.grade}</span>
          </div>
          <h1 class="page-title">${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</h1>
        </div>
        <div class="page-actions">
          ${isAdmin && u.status !== 'Terjual' && u.status !== 'Nonaktif' ? `
            <a href="#/inventaris/${u.id}/ubah" class="btn btn-secondary">${SVG().icon('edit', 15)} Ubah Data</a>
            <button type="button" id="btn-deactivate" class="btn btn-danger-outline">${SVG().icon('trash', 15)} Nonaktifkan Unit</button>
          ` : ''}
        </div>
      </div>

      <div class="card card-pad">
        <div class="tabs-bar">
          <button type="button" class="tab-btn ${activeTab === 'spesifikasi' ? 'active' : ''}" data-iv-tab="spesifikasi">Spesifikasi</button>
          <button type="button" class="tab-btn ${activeTab === 'modifikasi' ? 'active' : ''}" data-iv-tab="modifikasi">Riwayat Modifikasi <span class="tab-count">${u.modifikasi.length}</span></button>
          <button type="button" class="tab-btn ${activeTab === 'log' ? 'active' : ''}" data-iv-tab="log">Log Status &amp; Transaksi <span class="tab-count">${u.logs.length}</span></button>
        </div>

        ${activeTab === 'spesifikasi' ? `
          <div style="display:grid; grid-template-columns:260px 1fr; gap:24px; align-items:start;">
            <div style="background:var(--bg); border:1px solid var(--border); border-radius:14px; padding:20px; text-align:center;">
              ${u.foto ? `<img src="${u.foto}" style="width:100%; border-radius:10px;" />` : SVG().laptopIllustration(u, 210)}
              <div style="margin-top:12px; font-size:12.5px; color:var(--text-muted);">Masuk: ${u.tanggalMasuk}</div>
            </div>
            <div class="form-grid">
              <div><div class="field-hint">Prosesor (CPU)</div><strong>${S().escapeHtml(u.cpu)}</strong></div>
              <div><div class="field-hint">RAM &amp; Storage</div><strong>${u.ram} &bull; ${S().escapeHtml(u.storage)}</strong></div>
              <div><div class="field-hint">Layar</div><strong>${S().escapeHtml(u.layar)}</strong></div>
              <div><div class="field-hint">Garansi Toko</div><strong>${u.garansi}</strong></div>
              <div><div class="field-hint">Harga Modal (Beli)</div><strong>${S().formatRupiah(u.hargaBeli)}</strong></div>
              <div><div class="field-hint">Harga Jual</div><strong style="color:var(--primary); font-size:16px;">${S().formatRupiah(u.hargaJual)}</strong></div>
              <div class="form-group full">
                <div class="field-hint">Kelengkapan</div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                  ${(u.kelengkapan || []).map(k => `<span class="badge badge-neutral">${S().escapeHtml(k)}</span>`).join('')}
                </div>
              </div>
              <div class="form-group full">
                <div class="field-hint">Catatan Inspeksi Teknisi</div>
                <div style="padding:10px 12px; background:var(--bg); border-radius:10px; border:1px solid var(--border); margin-top:4px;">${S().escapeHtml(u.catatanInspeksi || 'Belum ada catatan inspeksi.')}</div>
              </div>
            </div>
          </div>
        ` : activeTab === 'modifikasi' ? `
          ${u.modifikasi.length === 0
            ? '<div class="empty-state" style="padding:28px;">Belum ada riwayat modifikasi teknis untuk unit ini.</div>'
            : `<div class="table-wrap"><table class="data-table"><thead><tr><th>Tanggal</th><th>Jenis</th><th>Lama</th><th>Baru</th><th>Teknisi</th><th>Catatan</th></tr></thead><tbody>
                ${u.modifikasi.map(m => `<tr><td class="mono">${m.tanggal}</td><td><span class="badge badge-info">${S().escapeHtml(m.jenis)}</span></td><td>${S().escapeHtml(m.komponenLama)}</td><td><strong>${S().escapeHtml(m.komponenBaru)}</strong></td><td>${S().escapeHtml(m.teknisi)}</td><td>${S().escapeHtml(m.catatan)}</td></tr>`).join('')}
              </tbody></table></div>`
          }
        ` : `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Waktu</th><th>Status</th><th>Pelaku</th><th>Keterangan</th></tr></thead>
              <tbody>
                ${u.logs.map(l => `<tr><td class="mono">${l.waktu}</td><td>${S().statusBadge(l.status)}</td><td><strong>${S().escapeHtml(l.pelaku)}</strong></td><td>${S().escapeHtml(l.catatan)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-iv-tab]').forEach(btn => {
      btn.addEventListener('click', () => renderDetail(container, unitId, btn.dataset.ivTab));
    });

    const btnDeact = container.querySelector('#btn-deactivate');
    if (btnDeact) {
      btnDeact.addEventListener('click', () => {
        window.LapApp.openModal({
          title: 'Nonaktifkan Unit Inventaris',
          confirmClass: 'btn-danger',
          confirmLabel: 'Konfirmasi Nonaktifkan',
          body: `
            <div class="alert alert-warning" style="margin-bottom:14px;">
              ${SVG().icon('alert', 17)}
              <span>Tindakan ini akan mengubah status unit <strong>${u.kode}</strong> menjadi <strong>Nonaktif</strong> dan mengeluarkannya dari katalog publik serta stok aktif.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="deact-reason">Alasan Penonaktifan <span class="req">*</span></label>
              <textarea id="deact-reason" class="form-control" placeholder="Contoh: Salah input ganda, unit rusak berat sebelum inspeksi..."></textarea>
              <div id="deact-err" class="field-error hidden">Alasan penonaktifan wajib diisi.</div>
            </div>
          `,
          onConfirm: () => {
            const reasonEl = document.querySelector('#deact-reason');
            const errEl = document.querySelector('#deact-err');
            if (!reasonEl.value.trim()) {
              errEl.classList.remove('hidden');
              reasonEl.classList.add('is-invalid');
              return false;
            }
            S().deactivateUnit(u.id, reasonEl.value.trim());
            window.LapApp.toast('Unit dinonaktifkan', `${u.kode} kini berstatus Nonaktif dan stok telah diperbarui.`, 'warning');
            window.LapRouter.navigate('/inventaris');
          }
        });
      });
    }
  }

  // ==================== IV-04: UBAH UNIT ====================
  function renderEditUnit(container, unitId) {
    const u = S().getUnitById(unitId);
    if (!u) {
      container.innerHTML = `<div class="card empty-state"><h3>Unit tidak ditemukan</h3></div>`;
      return;
    }
    if (u.status === 'Terjual') {
      container.innerHTML = `
        <div class="alert alert-warning">${SVG().icon('lock', 18)} <span>Unit <strong>${u.kode}</strong> sudah berstatus <strong>Terjual</strong> sehingga data terkunci untuk menjaga integritas audit transaksi.</span></div>
        <a href="#/inventaris/${u.id}" class="btn btn-secondary">Kembali ke Detail Unit</a>
      `;
      return;
    }

    let isDirty = false;
    window.LapRouter.setDirtyGuard(() => isDirty);

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/dashboard">Dashboard</a> <span>/</span>
        <a href="#/inventaris">Inventaris</a> <span>/</span>
        <a href="#/inventaris/${u.id}">${u.kode}</a> <span>/</span>
        <span class="current">Ubah Unit</span>
      </div>
      <div class="page-header">
        <div>
          <h1 class="page-title">Ubah Data Unit ${u.kode}</h1>
          <p class="page-subtitle">Kolom yang mengalami perubahan akan ditandai otomatis. Perubahan nomor seri memerlukan konfirmasi ulang.</p>
        </div>
      </div>

      <form id="edit-unit-form" class="card card-pad" novalidate>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="ed-sn">Nomor Seri</label>
            <input type="text" id="ed-sn" class="form-control mono" value="${S().escapeHtml(u.serialNumber)}" data-orig="${S().escapeHtml(u.serialNumber)}" />
          </div>
          <div class="form-group hidden" id="ed-sn-confirm-wrap">
            <label class="form-label" for="ed-sn2">Konfirmasi Nomor Seri Baru <span class="req">*</span></label>
            <input type="text" id="ed-sn2" class="form-control mono" placeholder="Ketik ulang nomor seri baru" />
            <div id="ed-sn-err" class="field-error hidden"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-merek">Merek</label>
            <select id="ed-merek" class="form-control" data-orig="${u.merek}">
              ${['Lenovo', 'Dell', 'HP', 'Apple', 'ASUS', 'Acer'].map(m => `<option value="${m}" ${u.merek === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-model">Model</label>
            <input type="text" id="ed-model" class="form-control" value="${S().escapeHtml(u.model)}" data-orig="${S().escapeHtml(u.model)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-cpu">CPU</label>
            <input type="text" id="ed-cpu" class="form-control" value="${S().escapeHtml(u.cpu)}" data-orig="${S().escapeHtml(u.cpu)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-ram">RAM</label>
            <select id="ed-ram" class="form-control" data-orig="${u.ram}">
              ${['8 GB', '16 GB', '32 GB'].map(r => `<option value="${r}" ${u.ram === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-storage">Storage</label>
            <input type="text" id="ed-storage" class="form-control" value="${S().escapeHtml(u.storage)}" data-orig="${S().escapeHtml(u.storage)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-grade">Grade Kondisi Fisik</label>
            <select id="ed-grade" class="form-control" data-orig="${u.grade}">
              ${['Grade A', 'Grade B', 'Grade C'].map(g => `<option value="${g}" ${u.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-beli">Harga Beli</label>
            <input type="text" id="ed-beli" class="form-control" value="${S().formatRupiah(u.hargaBeli)}" data-orig="${u.hargaBeli}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-jual">Harga Jual</label>
            <input type="text" id="ed-jual" class="form-control" value="${S().formatRupiah(u.hargaJual)}" data-orig="${u.hargaJual}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ed-garansi">Garansi</label>
            <select id="ed-garansi" class="form-control" data-orig="${u.garansi}">
              ${['30 Hari', '60 Hari', '90 Hari'].map(g => `<option value="${g}" ${u.garansi === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:22px; padding-top:16px; border-top:1px solid var(--border);">
          <button type="button" id="btn-cancel-ed" class="btn btn-secondary">Batal</button>
          <button type="submit" class="btn btn-primary">${SVG().icon('check', 15)} Simpan Perubahan</button>
        </div>
      </form>
    `;

    const snEl = container.querySelector('#ed-sn');
    const snWrap = container.querySelector('#ed-sn-confirm-wrap');
    const sn2El = container.querySelector('#ed-sn2');
    const snErr = container.querySelector('#ed-sn-err');

    container.querySelectorAll('[data-orig]').forEach(el => {
      const checkDiff = () => {
        const current = (el.id === 'ed-beli' || el.id === 'ed-jual') ? String(S().parseRupiah(el.value)) : el.value.trim();
        const changed = current !== el.dataset.orig;
        el.classList.toggle('is-changed', changed);
        if (changed) isDirty = true;
        if (el.id === 'ed-sn') {
          snWrap.classList.toggle('hidden', current.toUpperCase() === u.serialNumber.toUpperCase());
        }
      };
      el.addEventListener('input', () => {
        if (el.id === 'ed-beli' || el.id === 'ed-jual') {
          const n = S().parseRupiah(el.value);
          el.value = n > 0 ? S().formatRupiah(n) : '';
        }
        checkDiff();
      });
      el.addEventListener('change', checkDiff);
    });

    container.querySelector('#btn-cancel-ed').addEventListener('click', () => {
      window.LapRouter.navigate('/inventaris/' + u.id);
    });

    container.querySelector('#edit-unit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      snErr.classList.add('hidden');
      const newSN = snEl.value.trim().toUpperCase();
      if (newSN !== u.serialNumber.toUpperCase()) {
        if (S().isSerialDuplicate(newSN, u.id)) {
          snErr.textContent = 'Nomor seri baru sudah digunakan oleh unit lain.';
          snErr.classList.remove('hidden');
          return;
        }
        if (sn2El.value.trim().toUpperCase() !== newSN) {
          snErr.textContent = 'Konfirmasi nomor seri baru tidak cocok.';
          snErr.classList.remove('hidden');
          return;
        }
      }

      const patch = {
        serialNumber: newSN,
        merek: container.querySelector('#ed-merek').value,
        model: container.querySelector('#ed-model').value.trim(),
        cpu: container.querySelector('#ed-cpu').value.trim(),
        ram: container.querySelector('#ed-ram').value,
        storage: container.querySelector('#ed-storage').value.trim(),
        grade: container.querySelector('#ed-grade').value,
        hargaBeli: S().parseRupiah(container.querySelector('#ed-beli').value),
        hargaJual: S().parseRupiah(container.querySelector('#ed-jual').value),
        garansi: container.querySelector('#ed-garansi').value
      };

      const changedNames = [];
      if (patch.serialNumber !== u.serialNumber) changedNames.push('Nomor Seri');
      if (patch.model !== u.model) changedNames.push('Model');
      if (patch.grade !== u.grade) changedNames.push('Grade');
      if (patch.hargaJual !== u.hargaJual) changedNames.push('Harga Jual');

      S().updateUnit(u.id, patch, changedNames);
      isDirty = false;
      window.LapRouter.setDirtyGuard(null);
      window.LapApp.toast('Perubahan disimpan', `Data unit ${u.kode} berhasil diperbarui.`, 'success');
      window.LapRouter.navigate('/inventaris/' + u.id);
    });
  }

  // ==================== IV-05: REKAP STOK FISIK ====================
  function renderRekap(container) {
    const availUnits = S().getState().units.filter(u => u.status === 'Tersedia');
    const checkedMap = {};
    const notesMap = {};
    let selectedDate = S().todayStr();

    function draw() {
      const verifiedCount = availUnits.filter(u => checkedMap[u.id]).length;
      const diff = availUnits.length - verifiedCount;

      container.innerHTML = `
        <div class="breadcrumb">
          <a href="#/dashboard">Dashboard</a> <span>/</span>
          <a href="#/inventaris">Inventaris</a> <span>/</span>
          <span class="current">Rekap Stok Fisik</span>
        </div>
        <div class="page-header">
          <div>
            <h1 class="page-title">Rekapitulasi Stok Fisik Harian</h1>
            <p class="page-subtitle">Cocokkan stok fisik di rak gudang dengan unit berstatus <strong>Tersedia</strong> pada sistem.</p>
          </div>
          <div class="page-actions">
            <input type="date" id="rekap-date" class="form-control" value="${selectedDate}" />
            <button type="button" id="btn-save-rekap" class="btn btn-primary">${SVG().icon('check', 15)} Simpan Rekap</button>
          </div>
        </div>

        <div class="kpi-grid" style="grid-template-columns:repeat(3, 1fr);">
          <div class="kpi-card">
            <span class="kpi-label">Stok Sistem (Tersedia)</span>
            <div class="kpi-value">${availUnits.length} unit</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Terverifikasi Fisik</span>
            <div class="kpi-value text-success">${verifiedCount} unit</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Selisih Belum Ditemukan</span>
            <div class="kpi-value ${diff === 0 ? 'text-success' : 'text-danger'}">${diff} unit</div>
          </div>
        </div>

        <div class="card card-pad" style="margin-bottom:18px;">
          <form id="scan-rekap-form" style="display:flex; gap:10px; flex-wrap:wrap;">
            <input type="text" id="rekap-scan-input" class="form-control mono" style="flex:1; min-width:240px;" placeholder="Pindai atau ketik Nomor Seri / Kode Unit lalu tekan Enter untuk centang otomatis..." />
            <button type="submit" class="btn btn-soft">${SVG().icon('barcode', 15)} Verifikasi SN</button>
          </form>
        </div>

        <div class="card">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th style="width:56px;">Fisik</th><th>Kode Unit</th><th>Model</th><th>Nomor Seri</th><th>Grade</th><th>Catatan Selisih (Wajib jika tidak ditemukan)</th></tr>
              </thead>
              <tbody>
                ${availUnits.map(u => {
                  const isOk = !!checkedMap[u.id];
                  return `
                    <tr class="${isOk ? 'row-verified' : ''}">
                      <td>
                        <input type="checkbox" data-rekap-check="${u.id}" ${isOk ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--success);" />
                      </td>
                      <td class="mono" style="font-weight:600;">${u.kode}</td>
                      <td><strong>${S().escapeHtml(u.merek)} ${S().escapeHtml(u.model)}</strong></td>
                      <td class="mono">${u.serialNumber}</td>
                      <td><span class="grade-pill">${u.grade}</span></td>
                      <td>
                        <input type="text" class="form-control" style="height:34px;" data-rekap-note="${u.id}" value="${S().escapeHtml(notesMap[u.id] || '')}" placeholder="${isOk ? 'Cocok di rak' : 'Wajib isi catatan jika tidak ditemukan...'}" ${isOk ? 'disabled' : ''} />
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.querySelector('#rekap-date').addEventListener('change', (e) => { selectedDate = e.target.value; });

      container.querySelectorAll('[data-rekap-check]').forEach(cb => {
        cb.addEventListener('change', () => {
          checkedMap[cb.dataset.rekapCheck] = cb.checked;
          draw();
        });
      });

      container.querySelectorAll('[data-rekap-note]').forEach(inp => {
        inp.addEventListener('input', () => { notesMap[inp.dataset.rekapNote] = inp.value; });
      });

      container.querySelector('#scan-rekap-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = container.querySelector('#rekap-scan-input').value.trim().toLowerCase();
        const found = availUnits.find(u => u.serialNumber.toLowerCase() === val || u.kode.toLowerCase() === val);
        if (!found) {
          window.LapApp.toast('SN tidak ditemukan', 'Nomor seri tidak terdaftar pada daftar unit Tersedia.', 'danger');
          return;
        }
        checkedMap[found.id] = true;
        window.LapApp.toast('Unit terverifikasi', `${found.kode} (${found.serialNumber}) ditandai cocok secara fisik.`, 'success');
        draw();
      });

      container.querySelector('#btn-save-rekap').addEventListener('click', () => {
        const missingWithoutNote = availUnits.filter(u => !checkedMap[u.id] && !(notesMap[u.id] || '').trim());
        if (missingWithoutNote.length > 0) {
          window.LapApp.toast('Catatan selisih wajib diisi', `${missingWithoutNote.length} unit belum terverifikasi belum memiliki catatan alasan.`, 'warning');
          missingWithoutNote.forEach(u => {
            const inp = container.querySelector(`[data-rekap-note="${u.id}"]`);
            if (inp) inp.classList.add('is-invalid');
          });
          return;
        }
        const summaryNotes = availUnits
          .filter(u => !checkedMap[u.id])
          .map(u => `${u.kode}: ${notesMap[u.id]}`)
          .join('; ');
        S().saveRekap({
          tanggal: selectedDate,
          stokSistem: availUnits.length,
          hitunganFisik: verifiedCount,
          selisih: diff,
          catatan: summaryNotes || 'Seluruh stok fisik cocok 100% dengan stok sistem.'
        });
        window.LapApp.toast('Rekap tersimpan', `Rekap tanggal ${selectedDate} tersimpan (selisih: ${diff} unit).`, 'success');
        window.LapRouter.navigate('/inventaris');
      });
    }

    draw();
  }

  return { renderList, renderAddUnit, renderDetail, renderEditUnit, renderRekap };
})();
