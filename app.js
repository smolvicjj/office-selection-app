const STORAGE_KEY = 'office-selection-app-v1';
const COMPARE_KEY = 'office-selection-compare-v1';

const STATUS_LABELS = {
  new: 'Новый',
  called: 'Позвонил',
  view: 'Просмотр',
  rejected: 'Отказ',
  finalist: 'Финалист'
};

const DEFAULT_SETTINGS = {
  rentWeight: 0.26,
  sqmWeight: 0.18,
  centerWeight: 0.2,
  separateOfficeWeight: 0.14,
  floorWeight: 0.1,
  conditionWeight: 0.12
};

const appState = {
  settings: { ...DEFAULT_SETTINGS },
  offices: []
};

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    settings: appState.settings,
    offices: appState.offices
  }));
}

function normalizeOffice(item) {
  const normalized = {
    ...item,
    status: item.status || 'new',
    comments: Array.isArray(item.comments) ? item.comments : [],
    photos: Array.isArray(item.photos) ? item.photos : [],
    hasSeparateOffices: item.hasSeparateOffices === true || item.hasSeparateOffices === 'true',
    location: item.location || { x: 0.5, y: 0.5 }
  };

  if (!normalized.pricePerSqm && normalized.rent && normalized.area) {
    normalized.pricePerSqm = Number((normalized.rent / normalized.area).toFixed(2));
  }

  return normalized;
}

function getDefaultOfficeData() {
  return [
    {
      id: 'demo-1',
      name: 'Офис в центре на улице Абовяна',
      address: 'Абовян 15, Ереван',
      district: 'Kentron',
      area: 82,
      floor: 5,
      rent: 1800,
      pricePerSqm: 21.95,
      contacts: '+374 91 123 456',
      status: 'finalist',
      condition: 'Good',
      hasSeparateOffices: true,
      separateOfficeArea: 42,
      originalUrl: 'https://example.com/listing/1',
      photos: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80'
      ],
      comments: [
        { id: makeId('c1'), author: 'Иван', text: 'Звонил, готовы уступить до 1700$.', createdAt: new Date().toISOString() },
        { id: makeId('c2'), author: 'Марина', text: 'Требуется осмотр входа.', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ],
      isDemo: true,
      location: { x: 0.52, y: 0.42 }
    },
    {
      id: 'demo-2',
      name: 'Коммерческое помещение рядом с Музеем истории',
      address: 'Мариам Арутюнян 8, Ереван',
      district: 'Arabkir',
      area: 64,
      floor: 7,
      rent: 1500,
      pricePerSqm: 23.44,
      contacts: '+374 77 111 222',
      status: 'view',
      condition: 'Excellent',
      hasSeparateOffices: true,
      separateOfficeArea: 36,
      originalUrl: 'https://example.com/listing/2',
      photos: [
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
      ],
      comments: [{ id: makeId('c3'), author: 'Анна', text: 'Нужно повторно посмотреть помещение.', createdAt: new Date().toISOString() }],
      isDemo: true,
      location: { x: 0.46, y: 0.36 }
    },
    {
      id: 'demo-3',
      name: 'Офисный блок в бизнес-районе',
      address: 'Рузвельт 24, Ереван',
      district: 'Ajapnyak',
      area: 96,
      floor: 3,
      rent: 2100,
      pricePerSqm: 21.88,
      contacts: '+374 93 444 555',
      status: 'called',
      condition: 'Average',
      hasSeparateOffices: false,
      separateOfficeArea: 0,
      originalUrl: 'https://example.com/listing/3',
      photos: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'
      ],
      comments: [{ id: makeId('c4'), author: 'Максим', text: 'Подходящий вариант по цене, но нужен ремонт.', createdAt: new Date().toISOString() }],
      isDemo: true,
      location: { x: 0.58, y: 0.52 }
    },
    {
      id: 'demo-4',
      name: 'Небольшой офис в районе Нор Норк',
      address: 'Туманян 12, Ереван',
      district: 'Nor Nork',
      area: 52,
      floor: 11,
      rent: 1200,
      pricePerSqm: 23.08,
      contacts: '+374 95 678 901',
      status: 'new',
      condition: 'Good',
      hasSeparateOffices: true,
      separateOfficeArea: 31,
      originalUrl: 'https://example.com/listing/4',
      photos: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'],
      comments: [{ id: makeId('c5'), author: 'Сергей', text: 'Хороший вариант, но этаж высокий.', createdAt: new Date().toISOString() }],
      isDemo: true,
      location: { x: 0.66, y: 0.46 }
    },
    {
      id: 'demo-5',
      name: 'Классическое помещение с отдельными кабинетами',
      address: 'Гарегин Нжде 33, Ереван',
      district: 'Shengavit',
      area: 118,
      floor: 4,
      rent: 1950,
      pricePerSqm: 16.53,
      contacts: '+374 98 555 222',
      status: 'new',
      condition: 'Excellent',
      hasSeparateOffices: true,
      separateOfficeArea: 48,
      originalUrl: 'https://example.com/listing/5',
      photos: [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80'
      ],
      comments: [{ id: makeId('c6'), author: 'Лена', text: 'Выгодно по метражу, но нужен уточняющий звонок.', createdAt: new Date().toISOString() }],
      isDemo: true,
      location: { x: 0.39, y: 0.58 }
    }
  ].map(normalizeOffice);
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function ensureInitialData() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!stored.offices || !stored.offices.length) {
    appState.offices = getDefaultOfficeData();
    saveState();
  } else {
    appState.offices = (stored.offices || []).map(normalizeOffice);
  }
  appState.settings = loadSettings();
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Новый';
}

function getDistrictCenterDistance(district) {
  const coords = {
    Kentron: 1.4,
    Arabkir: 4.5,
    Ajapnyak: 5.8,
    'Nor Nork': 7.1,
    Shengavit: 6.3,
    'Malatia-Sebastia': 6.7,
    Erebuni: 10.2,
    Davtashen: 10.8,
    'Nork-Marash': 8.5,
    Masis: 16.6
  };
  return coords[district] ?? 8;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getScoreBreakdown(office, settings) {
  const centerKm = getDistrictCenterDistance(office.district);
  const rentScore = clamp(10 - (office.rent - 1200) / 250, 0, 10);
  const sqmScore = clamp(10 - (office.pricePerSqm - 18) / 7, 0, 10);
  const centerScore = clamp(10 - centerKm * 1.5, 0, 10);
  const separateScore = office.hasSeparateOffices && office.separateOfficeArea >= 30 ? 10 : (office.hasSeparateOffices ? 6 : 2);
  const floorScore = (() => {
    const f = Number(office.floor || 1);
    if (f <= 0) return 2;
    if (f >= 2 && f <= 6) return 9;
    if (f >= 7 && f <= 10) return 6;
    return 4;
  })();

  const conditionMap = { Excellent: 10, Good: 8, Average: 5, Poor: 2 };
  const conditionScore = conditionMap[office.condition] ?? 6;

  const values = {
    rent: rentScore,
    sqm: sqmScore,
    center: centerScore,
    separate: separateScore,
    floor: floorScore,
    condition: conditionScore
  };

  const total = (
    values.rent * (settings.rentWeight || 0) +
    values.sqm * (settings.sqmWeight || 0) +
    values.center * (settings.centerWeight || 0) +
    values.separate * (settings.separateOfficeWeight || 0) +
    values.floor * (settings.floorWeight || 0) +
    values.condition * (settings.conditionWeight || 0)
  );

  const explanationParts = [];
  if (rentScore >= 7) explanationParts.push('Рента выгоднее рынка');
  if (centerScore >= 7) explanationParts.push('Близость к центру сильная');
  if (separateScore >= 8) explanationParts.push('Есть отдельные кабинеты');
  if (floorScore >= 7) explanationParts.push('Этаж комфортный');
  if (conditionScore >= 8) explanationParts.push('Состояние хорошее');

  return {
    values,
    total: Number(total.toFixed(1)),
    explanation: explanationParts.length ? explanationParts.slice(0, 3).join(' • ') : 'Комбинация параметров средняя'
  };
}

function getScoreClass(score) {
  if (score >= 7.5) return 'good';
  if (score >= 5.5) return 'mid';
  return 'low';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  const total = appState.offices.length;
  const avgScore = total
    ? appState.offices.reduce((sum, office) => sum + getScoreBreakdown(office, appState.settings).total, 0) / total
    : 0;
  const finalists = appState.offices.filter((o) => o.status === 'finalist').length;
  const avgRent = total
    ? appState.offices.reduce((sum, office) => sum + Number(office.rent || 0), 0) / total
    : 0;
  const top = [...appState.offices].sort((a, b) => getScoreBreakdown(b, appState.settings).total - getScoreBreakdown(a, appState.settings).total)[0];

  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Всего помещений</div>
      <div class="stat-value">${total}</div>
      <div class="stat-meta">Проверенные варианты</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Средняя оценка</div>
      <div class="stat-value">${avgScore.toFixed(1)}</div>
      <div class="stat-meta">По текущим критериям</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Финалисты</div>
      <div class="stat-value">${finalists}</div>
      <div class="stat-meta">В статусе финалист</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ср. аренда</div>
      <div class="stat-value">${formatCurrency(avgRent)}</div>
      <div class="stat-meta">${top ? `Лидер: ${top.name}` : 'Нет данных'}</div>
    </div>
  `;
}

function renderTopOffices() {
  const topGrid = document.getElementById('topOfficesGrid');
  const ranked = [...appState.offices]
    .map((item) => ({ item, score: getScoreBreakdown(item, appState.settings).total }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!ranked.length) {
    topGrid.innerHTML = '<div class="empty-state">Пока нет помещений.</div>';
    return;
  }

  topGrid.innerHTML = ranked.map(({ item, score }) => {
    const scoreClass = getScoreClass(score);
    const scoreBadgeClass = scoreClass === 'good' ? '' : scoreClass === 'mid' ? 'mid' : 'low';
    const firstPhoto = item.photos?.[0] || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80';

    return `
      <article class="card office-card">
        <div class="office-image">
          <img src="${firstPhoto}" alt="${escapeHtml(item.name)}" />
          ${item.isDemo ? '<span class="demo-pill">Демо</span>' : ''}
        </div>
        <div class="office-content">
          <div class="office-top">
            <div class="office-name">${escapeHtml(item.name)}</div>
            <div class="score-badge ${scoreBadgeClass}">${score.toFixed(1)}</div>
          </div>

          <div class="meta-row">
            <span class="meta-pill">${escapeHtml(item.district)}</span>
            <span class="meta-pill">${item.area} м²</span>
            <span class="meta-pill">${escapeHtml(getStatusLabel(item.status))}</span>
          </div>

          <div class="office-summary">
            ${escapeHtml(item.address)}<br />
            ${formatCurrency(item.rent)} / ${formatCurrency(item.pricePerSqm || (item.rent / item.area || 0))} м²
          </div>

          <div class="office-actions">
            <button class="mini-btn" data-action="view-office" data-id="${item.id}">Открыть</button>
            <button class="mini-btn" data-action="compare-toggle" data-id="${item.id}">Сравнить</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderMap() {
  const mapContainer = document.getElementById('mapPanelContainer');
  const markers = appState.offices.filter((office) => office.location && typeof office.location.x === 'number' && typeof office.location.y === 'number');

  if (!markers.length) {
    mapContainer.innerHTML = '<div class="empty-state">Нет помещений для карты.</div>';
    return;
  }

  mapContainer.innerHTML = `
    <div class="map-shell">
      ${markers.map((office) => `
        <button
          class="map-marker"
          data-action="view-office"
          data-id="${office.id}"
          title="${escapeHtml(office.name)}"
          style="left:${Math.min(100, Math.max(0, office.location.x * 100))}%; top:${Math.min(100, Math.max(0, office.location.y * 100))}%"
        ></button>
      `).join('')}
    </div>
  `;
}

function renderOfficeGrid() {
  const grid = document.getElementById('officesGrid');
  const statusFilter = document.getElementById('statusFilter').value;
  const sortFilter = document.getElementById('sortFilter').value;

  let list = [...appState.offices];
  if (statusFilter !== 'all') {
    list = list.filter((item) => item.status === statusFilter);
  }

  list.sort((a, b) => {
    const aScore = getScoreBreakdown(a, appState.settings).total;
    const bScore = getScoreBreakdown(b, appState.settings).total;

    switch (sortFilter) {
      case 'score-asc':
        return aScore - bScore;
      case 'rent-asc':
        return (a.rent || 0) - (b.rent || 0);
      case 'rent-desc':
        return (b.rent || 0) - (a.rent || 0);
      case 'area-asc':
        return (a.area || 0) - (b.area || 0);
      case 'area-desc':
        return (b.area || 0) - (a.area || 0);
      default:
        return bScore - aScore;
    }
  });

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">По выбранным фильтрам ничего не найдено.</div>';
    return;
  }

  grid.innerHTML = list.map((office) => {
    const score = getScoreBreakdown(office, appState.settings).total;
    const scoreClass = getScoreClass(score);
    const scoreBadgeClass = scoreClass === 'good' ? '' : scoreClass === 'mid' ? 'mid' : 'low';
    const firstPhoto = office.photos?.[0] || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80';
    const commentsCount = office.comments?.length || 0;

    return `
      <article class="card office-card">
        <div class="office-image">
          <img src="${firstPhoto}" alt="${escapeHtml(office.name)}" />
          ${office.isDemo ? '<span class="demo-pill">Демо</span>' : ''}
        </div>

        <div class="office-content">
          <div class="office-top">
            <div class="office-name">${escapeHtml(office.name)}</div>
            <div class="score-badge ${scoreBadgeClass}">${score.toFixed(1)}</div>
          </div>

          <div class="meta-row">
            <span class="meta-pill">${escapeHtml(office.address)}</span>
            <span class="meta-pill">${office.area} м²</span>
            <span class="meta-pill">${formatCurrency(office.rent)}</span>
          </div>

          <div class="office-summary">
            ${escapeHtml(office.district)} • ${office.floor} этаж • ${escapeHtml(office.condition)}
          </div>

          <div class="office-actions">
            <button class="mini-btn" data-action="view-office" data-id="${office.id}">Карточка</button>
            <button class="mini-btn" data-action="compare-toggle" data-id="${office.id}">В сравнение</button>
            <button class="mini-btn" data-action="delete-office" data-id="${office.id}">Удалить</button>
          </div>

          <select class="status-select" data-action="change-status" data-id="${office.id}">
            ${Object.entries(STATUS_LABELS).map(([value, label]) => `
              <option value="${value}" ${value === office.status ? 'selected' : ''}>${label}</option>
            `).join('')}
          </select>

          <div class="office-actions" style="margin-top: 12px">
            <button class="mini-btn" data-action="new-comment" data-id="${office.id}">Добавить комментарий</button>
            <span class="muted" style="display:flex;align-items:center;">${commentsCount} коммент.</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderSettings() {
  const container = document.getElementById('settingsContainer');
  const entries = [
    { key: 'rentWeight', label: 'Аренда' },
    { key: 'sqmWeight', label: 'Цена за м²' },
    { key: 'centerWeight', label: 'Близость к центру' },
    { key: 'separateOfficeWeight', label: 'Отдельные кабинеты' },
    { key: 'floorWeight', label: 'Этаж' },
    { key: 'conditionWeight', label: 'Состояние' }
  ];

  const total = entries.reduce((sum, item) => sum + Number(appState.settings[item.key] || 0), 0);

  const rows = entries.map((item) => `
    <div class="settings-row">
      <label>${item.label}</label>
      <input type="range" min="0" max="1" step="0.01" data-setting="${item.key}" value="${Number(appState.settings[item.key] || 0).toFixed(2)}" />
      <div class="weight-val">${Number(appState.settings[item.key] || 0).toFixed(2)}</div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="helper" style="margin-bottom: 16px;">
      Вес критерия влияет на итоговую оценку. Сумма всех критериев помогает настроить подход под ваш способ принятия решений.
    </div>
    ${rows}
    <div class="helper">Сумма текущих весов: <strong>${total.toFixed(2)}</strong></div>
  `;
}

function renderCompareSelection() {
  const selection = document.getElementById('compareSelection');
  const selectedIds = getCompareSelections();

  selection.innerHTML = appState.offices.map((office) => {
    const checked = selectedIds.includes(office.id);
    return `
      <label class="compare-option">
        <input type="checkbox" value="${office.id}" ${checked ? 'checked' : ''} />
        <span>${escapeHtml(office.name)}</span>
      </label>
    `;
  }).join('');
}

function getCompareSelections() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    return raw.filter((id) => appState.offices.some((office) => office.id === id));
  } catch {
    return [];
  }
}

function setCompareSelections(ids) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, 3)));
}

function renderCompareTable() {
  const container = document.getElementById('compareTableContainer');
  const selectedIds = getCompareSelections();
  const selectedOffices = appState.offices.filter((office) => selectedIds.includes(office.id));

  if (selectedOffices.length < 2) {
    container.innerHTML = '<div class="empty-state">Выберите от 2 до 3 помещений для сравнения.</div>';
    return;
  }

  const rows = [
    ['Адрес / район', ...selectedOffices.map((o) => `${o.address} • ${o.district}`)],
    ['Площадь', ...selectedOffices.map((o) => `${o.area} м²`)],
    ['Этаж', ...selectedOffices.map((o) => `${o.floor}`)],
    ['Стоимость аренды', ...selectedOffices.map((o) => formatCurrency(o.rent))],
    ['Цена за м²', ...selectedOffices.map((o) => formatCurrency(o.pricePerSqm))],
    ['Состояние', ...selectedOffices.map((o) => o.condition)],
    ['Отдельные кабинеты от 30 м²', ...selectedOffices.map((o) => (o.hasSeparateOffices && o.separateOfficeArea >= 30 ? 'Да' : 'Нет'))],
    ['Итоговый балл', ...selectedOffices.map((o) => getScoreBreakdown(o, appState.settings).total.toFixed(1))],
    ['Комментарии', ...selectedOffices.map((o) => {
      const comments = o.comments || [];
      return comments.length ? comments.map((c) => `${c.author}: ${c.text}`).join(' | ') : 'Нет';
    })]
  ];

  const best = selectedOffices.reduce((previous, current) => {
    return getScoreBreakdown(current, appState.settings).total > getScoreBreakdown(previous, appState.settings).total ? current : previous;
  });

  const recommendation = `
    Лучший вариант — ${best.name}. Он выигрывает по сочетанию ${best.district} + ${best.area} м² + ${formatCurrency(best.rent)} + ${best.hasSeparateOffices && best.separateOfficeArea >= 30 ? 'есть отдельные кабинеты' : 'менее выраженные рабочие зоны'}.
    Эта рекомендация построена на фактических параметрах: цене, центральности, этажности, площади кабинетов и состоянии помещения, а не на случайном выборе.
  `;

  container.innerHTML = `
    <div class="compare-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Параметр</th>
            ${selectedOffices.map((office) => `<th>${escapeHtml(office.name)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(([label, ...values]) => `
            <tr>
              <td><strong>${escapeHtml(label)}</strong></td>
              ${values.map((value) => `<td>${escapeHtml(String(value))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="panel" style="margin-top: 20px;">
      <h3>Рекомендация</h3>
      <div class="helper">${escapeHtml(recommendation)}</div>
    </div>
  `;
}

function renderDirectorView() {
  const container = document.getElementById('directorView');
  const hash = window.location.hash || '';
  const match = hash.match(/^#\/director\/(.+)$/);

  if (!match) {
    container.classList.add('hidden');
    return;
  }

  const id = decodeURIComponent(match[1]);
  const office = appState.offices.find((item) => item.id === id);
  if (!office) {
    container.classList.add('hidden');
    return;
  }

  const score = getScoreBreakdown(office, appState.settings);
  const firstPhoto = office.photos?.[0] || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80';

  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="container">
      <div class="director-card">
        <div class="director-head">
          <h2>${escapeHtml(office.name)}</h2>
          <div class="section-actions">
            <span class="meta-pill">${escapeHtml(getStatusLabel(office.status))}</span>
            <span class="meta-pill">Оценка ${score.total.toFixed(1)}</span>
          </div>
        </div>

        <div class="director-body">
          <div class="director-photo">
            <img src="${firstPhoto}" alt="${escapeHtml(office.name)}" />
          </div>

          <div class="director-info">
            <div class="spec-grid">
              <div class="spec-item"><strong>Адрес</strong><span>${escapeHtml(office.address)}</span></div>
              <div class="spec-item"><strong>Район</strong><span>${escapeHtml(office.district)}</span></div>
              <div class="spec-item"><strong>Площадь</strong><span>${office.area} м²</span></div>
              <div class="spec-item"><strong>Этаж</strong><span>${office.floor}</span></div>
              <div class="spec-item"><strong>Стоимость</strong><span>${formatCurrency(office.rent)}</span></div>
              <div class="spec-item"><strong>Цена/м²</strong><span>${formatCurrency(office.pricePerSqm)}</span></div>
              <div class="spec-item"><strong>Состояние</strong><span>${escapeHtml(office.condition)}</span></div>
              <div class="spec-item"><strong>Контакты</strong><span>${escapeHtml(office.contacts || 'Не указаны')}</span></div>
            </div>

            <div class="score-breakdown">
              ${Object.entries(score.values).map(([key, value]) => {
                const labels = { rent: 'Рента', sqm: 'Цена/м²', center: 'Центр', separate: 'Кабинеты', floor: 'Этаж', condition: 'Состояние' };
                return `
                  <div class="score-line">
                    <div class="label">${labels[key] || key}</div>
                    <div class="bar"><span style="width:${Math.max(5, value)}%"></span></div>
                    <div class="value">${value.toFixed(1)}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="helper" style="margin-top: 16px;">${escapeHtml(score.explanation)}</div>

            <div class="gallery-grid" style="margin-top: 18px;">
              ${(office.photos && office.photos.length ? office.photos : [firstPhoto]).slice(0, 6).map((src) => `<img src="${src}" alt="${escapeHtml(office.name)}" />`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('mainShell').classList.add('hidden');
}

function renderAll() {
  renderStats();
  renderTopOffices();
  renderMap();
  renderOfficeGrid();
  renderSettings();
  renderCompareSelection();
  renderCompareTable();
  syncNavHighlight();
}

function syncNavHighlight() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const target = btn.dataset.target;
    const page = document.getElementById(`${target}-page`);
    btn.classList.toggle('active', page && page.classList.contains('active'));
  });
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((el) => {
    el.classList.toggle('active', el.id === `${pageId}-page`);
  });
  syncNavHighlight();
  if (pageId === 'compare') renderCompareTable();
}

function parseListingData(url = '', text = '') {
  const source = `${url || ''} ${text || ''}`.replace(/\s+/g, ' ');
  const result = {
    name: '',
    address: '',
    district: '',
    area: '',
    floor: '',
    rent: '',
    pricePerSqm: '',
    contacts: '',
    condition: 'Good',
    hasSeparateOffices: 'false',
    separateOfficeArea: 0,
    originalUrl: url || '',
    photos: [],
    notes: ''
  };

  if (!source.trim()) return result;

  const fieldMap = [
    ['name', /(Название|title|Объект|офис|кабинет)[^\n:]{0,80}[:\-]?[\s]*([^\n]+?)(?=(?:\s*(?:Адрес|Address|Район|District|Площадь|Area|стоимость|Цена|Стоимость|этаж|floor|Контакты|contacts))|$)/i],
    ['address', /(Адрес|Address|Улица|Street)[^\n:]{0,80}[:\-]?[\s]*([^\n]+?)(?=(?:\s*(?:Район|District|Площадь|Area|стоимость|Цена|Стоимость|этаж|floor|Контакты|contacts))|$)/i],
    ['district', /(Район|District|Microdistrict|Микрорайон)[^\n:]{0,80}[:\-]?[\s]*([^\n]+?)(?=(?:\s*(?:Площадь|Area|стоимость|Цена|Стоимость|этаж|floor|Контакты|contacts|Адрес|Address))|$)/i],
    ['area', /(Площадь|Area|Общая площадь|кв\.м|кв м|m²|sqm)[^\d]{0,20}([0-9]+(?:[.,][0-9]+)?)/i],
    ['floor', /(Этаж|Floor|этажей)[^\d]{0,20}([0-9]{1,2})/i],
    ['rent', /(Стоимость аренды|Rent|Цена|аренда|за месяц|USD|\$)[^\d]{0,25}([0-9]{3,7}(?:[.,][0-9]{1,2})?)/i],
    ['contacts', /(Контакты|Phone|Телефон|Тел|WhatsApp|Telegram|email|Email)[^\n:]{0,80}[:\-]?[\s]*([^\n]+?)(?=(?:\s*(?:Район|District|Площадь|Area|стоимость|Цена|Стоимость|этаж|floor|Адрес|Address))|$)/i]
  ];

  fieldMap.forEach(([key, regex]) => {
    const parsed = source.match(regex);
    if (parsed && parsed[1]) result[key] = parsed[1].trim();
  });

  if (!result.name) {
    const fallback = source.match(/(?:^|\s)([A-ZА-Я][^\n]{0,80})(?=\s{2,}|\s(?:Адрес|Address|Площадь|Area|Стоимость|Price|Этаж|Floor))/i);
    if (fallback) result.name = fallback[1].trim();
  }

  if (!result.rent && result.pricePerSqm) {
    result.rent = String((Number(result.pricePerSqm) * Number(result.area || 1)).toFixed(0));
  }

  if (!result.pricePerSqm && result.rent && result.area) {
    result.pricePerSqm = String((Number(result.rent) / Number(result.area)).toFixed(2));
  }

  const photos = [...source.matchAll(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)/gi)];
  if (photos.length) result.photos = photos.map((match) => match[0]);

  const districtMatch = source.match(/(Kentron|Arabkir|Ajapnyak|Nor Nork|Shengavit|Malatia|Erebuni|Davtashen|Nork-Marash|Masis|Давташен|Кентрон|Арабкир|Шенгавит|Еребуни)/i);
  if (districtMatch) result.district = districtMatch[1];

  if (result.area) result.area = String(Number(result.area.replace(/,/g, '.')));
  if (result.floor) result.floor = String(Math.round(Number(result.floor)));
  if (result.rent) result.rent = String(Math.round(Number(result.rent.replace(/,/g, '.'))));
  if (result.pricePerSqm) result.pricePerSqm = String(Number(result.pricePerSqm.replace(/,/g, '.')).toFixed(2));

  return result;
}

function handlePhotoUploads(files) {
  return new Promise((resolve, reject) => {
    const results = [];
    const list = Array.from(files || []).slice(0, 6);
    if (!list.length) return resolve([]);

    let done = 0;
    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        results.push(reader.result);
        done += 1;
        if (done === list.length) resolve(results);
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  });
}

function addOfficeFromForm(formData) {
  const newOffice = {
    id: `office-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: formData.name || 'Офис без названия',
    address: formData.address || 'Адрес не указан',
    district: formData.district || 'Kentron',
    area: Number(formData.area) || 0,
    floor: Number(formData.floor) || 1,
    rent: Number(formData.rent) || 0,
    pricePerSqm: Number(formData.pricePerSqm) || Number(((Number(formData.rent || 0) / (Number(formData.area) || 1)).toFixed(2))),
    contacts: formData.contacts || 'Не указаны',
    originalUrl: formData.originalUrl || '',
    photos: formData.photos || [],
    condition: formData.condition || 'Good',
    hasSeparateOffices: formData.hasSeparateOffices === true || formData.hasSeparateOffices === 'true',
    separateOfficeArea: Number(formData.separateOfficeArea || 0),
    status: 'new',
    comments: [],
    isDemo: false,
    location: { x: 0.5 + (Math.random() * 0.14 - 0.07), y: 0.35 + (Math.random() * 0.25) }
  };

  appState.offices.unshift(newOffice);
  saveState();
  renderAll();
  document.getElementById('addOfficeModal').classList.add('hidden');
  showPage('spaces');
}

function deleteOffice(id) {
  const shouldDelete = window.confirm('Удалить помещение?');
  if (!shouldDelete) return;
  appState.offices = appState.offices.filter((office) => office.id !== id);
  saveState();
  renderAll();
}

function openCommentDialog(officeId) {
  const office = appState.offices.find((item) => item.id === officeId);
  if (!office) return;

  const author = window.prompt('Имя автора комментария:', 'Вы');
  if (author === null) return;

  const text = window.prompt('Текст комментария:', '');
  if (text === null || !text.trim()) return;

  office.comments = office.comments || [];
  office.comments.unshift({
    id: makeId('comment'),
    author: author.trim() || 'Неизвестно',
    text: text.trim(),
    createdAt: new Date().toISOString()
  });

  saveState();
  renderAll();
}

function changeOfficeStatus(id, status) {
  const office = appState.offices.find((item) => item.id === id);
  if (!office) return;
  office.status = status;
  saveState();
  renderAll();
}

function handleCompareToggle(id) {
  let selected = getCompareSelections();
  if (selected.includes(id)) {
    selected = selected.filter((item) => item !== id);
  } else {
    if (selected.length >= 3) selected = selected.slice(1);
    selected.push(id);
  }
  setCompareSelections(selected);
  renderCompareSelection();
  renderCompareTable();
}

function openDirectorOffice(id) {
  window.location.hash = `#/director/${encodeURIComponent(id)}`;
  renderDirectorView();
}

function bindEvents() {
  document.getElementById('quickAddBtn').addEventListener('click', () => showPage('spaces'));
  document.getElementById('showAddModalBtn').addEventListener('click', () => {
    document.getElementById('addOfficeModal').classList.remove('hidden');
  });
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('addOfficeModal').classList.add('hidden');
  });

  document.getElementById('statusFilter').addEventListener('change', renderOfficeGrid);
  document.getElementById('sortFilter').addEventListener('change', renderOfficeGrid);
  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('sortFilter').value = 'score-desc';
    renderOfficeGrid();
  });

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      showPage(button.dataset.target);
    });
  });

  document.getElementById('parseListingBtn').addEventListener('click', () => {
    const statusEl = document.getElementById('parseStatus');
    const parsed = parseListingData(
      document.getElementById('listingUrl').value.trim(),
      document.getElementById('listingText').value.trim()
    );

    const hasData = parsed.name || parsed.address || parsed.rent || parsed.area;
    if (!hasData) {
      statusEl.textContent = 'Данные не распознаны. Заполните поля вручную.';
      statusEl.style.color = '#b91c1c';
      return;
    }

    statusEl.style.color = '#166534';
    statusEl.textContent = 'Данные успешно распознаны. Проверьте поля и сохраните помещение.';

    document.getElementById('name').value = parsed.name || '';
    document.getElementById('address').value = parsed.address || '';
    document.getElementById('district').value = parsed.district || '';
    document.getElementById('area').value = parsed.area || '';
    document.getElementById('floor').value = parsed.floor || '';
    document.getElementById('rent').value = parsed.rent || '';
    document.getElementById('pricePerSqm').value = parsed.pricePerSqm || '';
    document.getElementById('contacts').value = parsed.contacts || '';
    document.getElementById('originalUrl').value = parsed.originalUrl || '';
  });

  document.getElementById('useManualFieldsBtn').addEventListener('click', () => {
    document.getElementById('name').focus();
  });

  document.getElementById('manualOfficeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const files = document.getElementById('photoUpload').files;
    let photos = [];
    try {
      photos = await handlePhotoUploads(files);
    } catch {
      photos = [];
    }

    addOfficeFromForm({
      name: document.getElementById('name').value.trim(),
      address: document.getElementById('address').value.trim(),
      district: document.getElementById('district').value.trim(),
      area: document.getElementById('area').value,
      floor: document.getElementById('floor').value,
      rent: document.getElementById('rent').value,
      pricePerSqm: document.getElementById('pricePerSqm').value,
      contacts: document.getElementById('contacts').value.trim(),
      condition: document.getElementById('condition').value,
      hasSeparateOffices: document.getElementById('hasSeparateOffices').value,
      separateOfficeArea: document.getElementById('separateOfficeArea').value,
      originalUrl: document.getElementById('originalUrl').value.trim(),
      photos
    });
  });

  document.getElementById('settingsContainer').addEventListener('input', (event) => {
    const target = event.target;
    if (!target.matches('input[type="range"]')) return;
    const key = target.dataset.setting;
    const value = Number(target.value);
    appState.settings[key] = value;
    const weightValue = target.parentElement.querySelector('.weight-val');
    if (weightValue) weightValue.textContent = value.toFixed(2);
    saveState();
    renderAll();
  });

  document.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const { action, id } = actionEl.dataset;

    if (action === 'view-office') openDirectorOffice(id);
    if (action === 'delete-office') deleteOffice(id);
    if (action === 'compare-toggle') handleCompareToggle(id);
    if (action === 'new-comment') openCommentDialog(id);
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches('[data-action="change-status"]')) {
      changeOfficeStatus(target.dataset.id, target.value);
    }
    if (target.matches('.compare-option input')) {
      const selected = [...document.querySelectorAll('.compare-option input:checked')].map((el) => el.value);
      setCompareSelections(selected);
      renderCompareTable();
    }
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '';
    if (hash.match(/^#\/director\//)) {
      renderDirectorView();
    } else {
      document.getElementById('mainShell').classList.remove('hidden');
      document.getElementById('directorView').classList.add('hidden');
      document.getElementById('directorView').innerHTML = '';
      showPage('home');
    }
  });
}

function init() {
  ensureInitialData();
  appState.settings = loadSettings();
  bindEvents();
  renderAll();
  showPage('home');
  if (window.location.hash.match(/^#\/director\//)) renderDirectorView();
}

init();
