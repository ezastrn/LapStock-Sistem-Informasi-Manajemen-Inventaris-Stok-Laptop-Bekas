/* ==========================================================================
   LapStock SVG Icon Set, Branded Laptop Illustrations & Interactive Charts
   ========================================================================== */

window.LapSVG = (function () {
  const icons = {
    laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>',
    barcode: '<path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/>',
    panelLeft: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'
  };

  function icon(name, size = 16, cls = '') {
    const body = icons[name] || icons.info;
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  // Brand-specific refined laptop vector illustration
  function laptopIllustration(unit, width = 220) {
    const themes = {
      Lenovo: { body: '#1E293B', bezel: '#0F172A', accent1: '#EF4444', accent2: '#991B1B', label: 'ThinkPad', dot: true },
      Dell:   { body: '#334155', bezel: '#0F172A', accent1: '#3B82F6', accent2: '#1D4ED8', label: 'DELL Latitude', dot: false },
      HP:     { body: '#64748B', bezel: '#1E293B', accent1: '#06B6D4', accent2: '#0E7490', label: 'HP EliteBook', dot: false },
      Apple:  { body: '#94A3B8', bezel: '#090D16', accent1: '#8B5CF6', accent2: '#4338CA', label: 'MacBook', notch: true },
      ASUS:   { body: '#312E81', bezel: '#0F172A', accent1: '#38BDF8', accent2: '#2563EB', label: 'ASUS ZenBook', dot: false },
      Acer:   { body: '#475569', bezel: '#0F172A', accent1: '#10B981', accent2: '#047857', label: 'Acer Swift', dot: false }
    };
    const t = themes[unit?.merek] || themes.Dell;
    const code = (unit && unit.kode) ? unit.kode : 'LP-2026';
    const uid = 'grad_' + (code.replace(/[^a-zA-Z0-9]/g, '')) + '_' + Math.floor(Math.random() * 9999);

    return `
      <svg width="${width}" viewBox="0 0 260 156" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi ${unit?.merek || 'Laptop'} ${unit?.model || ''}">
        <defs>
          <linearGradient id="${uid}" x1="38" y1="18" x2="222" y2="122" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${t.accent1}" stop-opacity="0.72"/>
            <stop offset="100%" stop-color="${t.accent2}" stop-opacity="0.22"/>
          </linearGradient>
          <linearGradient id="${uid}_base" x1="12" y1="128" x2="248" y2="142" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${t.body}"/>
            <stop offset="50%" stop-color="#334155"/>
            <stop offset="100%" stop-color="${t.body}"/>
          </linearGradient>
        </defs>
        <!-- Soft drop shadow -->
        <ellipse cx="130" cy="144" rx="108" ry="6" fill="#0F172A" fill-opacity="0.12"/>
        <!-- Lid outer frame -->
        <rect x="34" y="12" width="192" height="118" rx="11" fill="${t.bezel}" stroke="${t.body}" stroke-width="2"/>
        <!-- Screen panel -->
        <rect x="42" y="20" width="176" height="102" rx="5" fill="#0B1221"/>
        <!-- Stylized wallpaper wave -->
        <path d="M42 86 Q 92 52 140 78 T 218 68 L 218 122 L 42 122 Z" fill="url(#${uid})"/>
        <path d="M42 102 Q 108 76 164 96 T 218 88 L 218 122 L 42 122 Z" fill="${t.accent1}" fill-opacity="0.24"/>
        <!-- Top camera / notch -->
        ${t.notch
          ? '<rect x="114" y="20" width="32" height="6" rx="3" fill="#090D16"/>'
          : '<circle cx="130" cy="16" r="1.8" fill="#475569"/>'
        }
        <!-- Floating UI window inside screen -->
        <rect x="58" y="38" width="144" height="58" rx="6" fill="#0F172A" fill-opacity="0.72" stroke="#FFFFFF" stroke-opacity="0.12"/>
        <circle cx="67" cy="46" r="2" fill="#EF4444"/>
        <circle cx="74" cy="46" r="2" fill="#F59E0B"/>
        <circle cx="81" cy="46" r="2" fill="#10B981"/>
        <text x="66" y="64" fill="#F8FAFC" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="10.5" font-weight="700">${t.label}</text>
        <text x="66" y="78" fill="#94A3B8" font-family="JetBrains Mono, monospace" font-size="8.5">${code}</text>
        ${t.dot ? '<circle cx="188" cy="84" r="3.2" fill="#EF4444"/>' : ''}
        <!-- Base deck -->
        <path d="M16 130 H244 L236 140 C234 142 231 143 227 143 H33 C29 143 26 142 24 140 Z" fill="url(#${uid}_base)"/>
        <!-- Thumb notch -->
        <rect x="108" y="130" width="44" height="3.5" rx="1.75" fill="#94A3B8" fill-opacity="0.5"/>
      </svg>
    `;
  }

  // Interactive SVG Bar Chart with Hover Tooltip
  function renderBarChart(container, items, options = {}) {
    if (!container) return;
    const height = options.height || 230;
    const maxVal = Math.max(...items.map(i => i.value), 1);
    const padL = 56, padR = 16, padT = 18, padB = 34;
    const width = 560;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;
    const barGap = items.length > 0 ? plotW / items.length : plotW;
    const barW = Math.min(40, Math.max(16, barGap * 0.48));
    const color = options.color || '#2563EB';
    const formatY = options.formatY || (v => v >= 1000000 ? (v / 1000000).toFixed(1).replace('.0', '') + ' jt' : v);
    const formatTip = options.formatTip || (item => `${item.label}: ${item.value}`);

    const gridLines = [0, 0.5, 1].map(ratio => {
      const y = padT + plotH * (1 - ratio);
      const val = maxVal * ratio;
      return `
        <line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#E2E8F0" stroke-dasharray="3 3"/>
        <text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#64748B" font-size="11" font-family="Inter, sans-serif">${ratio === 0 ? '0' : formatY(val)}</text>
      `;
    }).join('');

    const bars = items.map((item, idx) => {
      const h = item.value > 0 ? Math.max(6, (item.value / maxVal) * plotH) : 3;
      const x = padL + idx * barGap + (barGap - barW) / 2;
      const y = padT + plotH - h;
      const barFill = item.value > 0 ? (item.color || color) : '#E2E8F0';
      return `
        <g class="chart-bar-group" data-idx="${idx}" style="cursor:pointer;">
          <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="${barFill}" class="chart-bar-rect"/>
          <text x="${x + barW / 2}" y="${height - 10}" text-anchor="middle" fill="#64748B" font-size="11" font-family="Inter, sans-serif">${item.label}</text>
        </g>
      `;
    }).join('');

    container.innerHTML = `
      <div class="chart-wrap">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible;">
          ${gridLines}
          ${bars}
        </svg>
        <div class="chart-tooltip hidden"></div>
      </div>
    `;

    const wrap = container.querySelector('.chart-wrap');
    const tip = container.querySelector('.chart-tooltip');
    wrap.querySelectorAll('.chart-bar-group').forEach(g => {
      const idx = Number(g.dataset.idx);
      const item = items[idx];
      const rect = g.querySelector('.chart-bar-rect');
      g.addEventListener('mouseenter', () => {
        rect.setAttribute('opacity', '0.84');
        tip.innerHTML = formatTip(item);
        tip.classList.remove('hidden');
      });
      g.addEventListener('mousemove', (e) => {
        const bounds = wrap.getBoundingClientRect();
        tip.style.left = (e.clientX - bounds.left) + 'px';
        tip.style.top = (e.clientY - bounds.top - 8) + 'px';
      });
      g.addEventListener('mouseleave', () => {
        rect.setAttribute('opacity', '1');
        tip.classList.add('hidden');
      });
    });
  }

  return { icon, laptopIllustration, renderBarChart };
})();
