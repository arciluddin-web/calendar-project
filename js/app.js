/* ── State (localStorage) ── */
const STORAGE_KEY = 'calendar_events';

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function addEvent(obj) {
  const events = loadEvents();
  const event = { ...obj, id: crypto.randomUUID() };
  events.push(event);
  saveEvents(events);
  return event;
}

function updateEvent(id, patch) {
  const events = loadEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  events[idx] = { ...events[idx], ...patch };
  saveEvents(events);
  return events[idx];
}

function deleteEvent(id) {
  const events = loadEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  saveEvents(filtered);
  return true;
}

function getEventsForMonth(year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return loadEvents().filter(e => e.date && e.date.startsWith(prefix));
}

function getEventById(id) {
  return loadEvents().find(e => e.id === id) ?? null;
}

/* ── Validation ── */
function validateEvent({ title, date, time, description }) {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = 'Title is required';
  } else if (title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or fewer';
  }

  if (!date) {
    errors.date = 'Date is required';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.date = 'Invalid date format';
  } else {
    const parsed = new Date(date + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      errors.date = 'Invalid date';
    } else {
      const [y, m, d] = date.split('-').map(Number);
      if (parsed.getFullYear() !== y || parsed.getMonth() + 1 !== m || parsed.getDate() !== d) {
        errors.date = 'Invalid date';
      }
    }
  }

  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    errors.time = 'Invalid time format';
  }

  if (description && description.length > 500) {
    errors.description = 'Max 500 characters';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/* ── Calendar Rendering ── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildMonthGrid(year, month) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;
  const cells = [];

  for (let i = 0; i < totalCells; i++) {
    const cellDate = new Date(year, month - 1, 1 + (i - startOffset));
    const cellYear = cellDate.getFullYear();
    const cellMonth = cellDate.getMonth() + 1;
    const cellDay = cellDate.getDate();
    const dateStr = toDateStr(cellYear, cellMonth, cellDay);

    cells.push({
      date: dateStr,
      day: cellDay,
      isCurrentMonth: cellMonth === month && cellYear === year,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

function renderCalendar(year, month) {
  const events = getEventsForMonth(year, month);
  const cells = buildMonthGrid(year, month);

  const eventsByDate = {};
  for (const e of events) {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  }
  for (const arr of Object.values(eventsByDate)) {
    arr.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  }

  const headerHTML = DAY_NAMES.map(n => `<div class="day-header">${n}</div>`).join('');

  const cellsHTML = cells.map(cell => {
    const classes = ['day-cell'];
    if (!cell.isCurrentMonth) classes.push('day-cell--other-month');
    if (cell.isToday) classes.push('day-cell--today');

    const dayEvents = eventsByDate[cell.date] || [];
    const pillsHTML = dayEvents.map(e => {
      const label = escHtml((e.time ? e.time + ' ' : '') + e.title);
      return `<button class="event-pill" data-id="${escHtml(e.id)}" title="${escHtml(e.title)}">${label}</button>`;
    }).join('');

    const countAttr = dayEvents.length > 0 ? ` data-count="${dayEvents.length}"` : '';
    return `<div class="${classes.join(' ')}" data-date="${cell.date}"${countAttr}>` +
      `<span class="day-number">${cell.day}</span>` +
      `<div class="events-list">${pillsHTML}</div>` +
      `</div>`;
  }).join('');

  document.querySelector('.calendar-grid').innerHTML = headerHTML + cellsHTML;
  document.getElementById('current-month-label').textContent =
    new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
      .format(new Date(year, month - 1, 1));
}

/* ── Modal ── */
let editingId = null;

function openAddModal(prefillDate) {
  editingId = null;
  clearForm();
  document.getElementById('modal-title-text').textContent = 'Add Event';
  document.getElementById('btn-delete-event').classList.add('hidden');
  if (prefillDate) document.getElementById('field-date').value = prefillDate;
  document.getElementById('event-modal').classList.remove('hidden');
  document.getElementById('field-title').focus();
}

function openEditModal(event) {
  if (!event) return;
  editingId = event.id;
  clearForm();
  document.getElementById('modal-title-text').textContent = 'Edit Event';
  document.getElementById('field-title').value = event.title;
  document.getElementById('field-date').value = event.date;
  document.getElementById('field-time').value = event.time || '';
  document.getElementById('field-description').value = event.description || '';
  document.getElementById('btn-delete-event').classList.remove('hidden');
  document.getElementById('event-modal').classList.remove('hidden');
  document.getElementById('field-title').focus();
}

function closeModal() {
  document.getElementById('event-modal').classList.add('hidden');
  clearForm();
  editingId = null;
}

function clearForm() {
  document.getElementById('event-form').reset();
  ['error-title', 'error-date', 'error-time', 'error-description'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function getFormValues() {
  return {
    title: document.getElementById('field-title').value,
    date: document.getElementById('field-date').value,
    time: document.getElementById('field-time').value,
    description: document.getElementById('field-description').value,
  };
}

function showFieldErrors(errors) {
  ['title', 'date', 'time', 'description'].forEach(field => {
    const el = document.getElementById('error-' + field);
    if (el) el.textContent = errors[field] || '';
  });
}

/* ── Toast ── */
let toastTimer = null;

function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast-msg');
  toast.textContent = message;
  toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
    toastTimer = null;
  }, duration);
}

/* ── App Init ── */
let currentYear;
let currentMonth;

function handleFormSubmit(e) {
  e.preventDefault();
  const values = getFormValues();
  const { valid, errors } = validateEvent(values);
  if (!valid) {
    showFieldErrors(errors);
    return;
  }
  if (editingId) {
    updateEvent(editingId, values);
    closeModal();
    renderCalendar(currentYear, currentMonth);
    showToast('Event updated');
  } else {
    addEvent(values);
    closeModal();
    renderCalendar(currentYear, currentMonth);
    showToast('Event added');
  }
}

function handleDelete() {
  if (!editingId) return;
  if (!confirm('Delete this event?')) return;
  deleteEvent(editingId);
  closeModal();
  renderCalendar(currentYear, currentMonth);
  showToast('Event deleted');
}

function init() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth() + 1;

  renderCalendar(currentYear, currentMonth);

  document.getElementById('btn-prev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById('btn-add-event').addEventListener('click', () => openAddModal());
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-delete-event').addEventListener('click', handleDelete);
  document.getElementById('event-form').addEventListener('submit', handleFormSubmit);

  document.getElementById('event-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  document.querySelector('.calendar-grid-wrapper').addEventListener('click', e => {
    const pill = e.target.closest('.event-pill');
    if (pill) {
      e.stopPropagation();
      openEditModal(getEventById(pill.dataset.id));
      return;
    }
    const cell = e.target.closest('.day-cell');
    if (cell && cell.dataset.date) {
      openAddModal(cell.dataset.date);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
