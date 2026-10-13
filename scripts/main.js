import { storage } from './storage.js';
import { validators } from './validators.js';
import { search } from './search.js';
import { ui } from './ui.js';

let records = storage.getRecords();
let settings = storage.getSettings();
let currentRegex = null;

const form = document.getElementById('record-form');
const statusEl = document.getElementById('global-status');

function announce(msg, assertive = false) {
  statusEl.textContent = msg;
  statusEl.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
}

function refreshUI() {
  let filtered = [...records];
  const sortKey = document.getElementById('sort-key').value;
  const sortDir = document.getElementById('sort-dir').textContent.includes('↓') ? -1 : 1;
  
  filtered.sort((a, b) => {
    let valA = a[sortKey], valB = b[sortKey];
    if (sortKey === 'amount') { valA = parseFloat(valA); valB = parseFloat(valB); }
    return valA < valB ? -1 * sortDir : valA > valB ? 1 * sortDir : 0;
  });

  if (currentRegex) filtered = search.filter(filtered, currentRegex);
  ui.renderRecords(filtered, currentRegex);
  ui.renderStats(records, settings);
  document.getElementById('search-status').textContent = `Showing ${filtered.length} of ${records.length} records.`;
}

document.addEventListener('DOMContentLoaded', () => {
  const catDatalist = document.getElementById('category-options');
  settings.categories.split(',').forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.trim(); catDatalist.appendChild(opt);
  });
  document.getElementById('categories').value = settings.categories;
  document.querySelectorAll('[data-currency-label]').forEach(el => el.textContent = settings.baseCurrency);
  document.getElementById('base-currency').value = settings.baseCurrency;
  document.getElementById('alt1-code').value = settings.alt1Code;
  document.getElementById('cap').value = settings.cap;
  refreshUI();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('record-id').value;
  const desc = document.getElementById('description').value.trim();
  const amount = document.getElementById('amount').value.trim();
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;

  let hasError = false;
  const check = (field, fn, errId) => {
    const err = fn(field);
    const errEl = document.getElementById(errId);
    if (err) { errEl.textContent = err; errEl.hidden = false; hasError = true; }
    else { errEl.hidden = true; }
  };
  check(desc, validators.description, 'description-error');
  check(amount, validators.amount, 'amount-error');
  check(category, validators.category, 'category-error');
  check(date, validators.date, 'date-error');

  if (hasError) { announce("Please fix the errors in the form.", true); return; }

  const now = new Date().toISOString();
  if (id) {
    const idx = records.findIndex(r => r.id === id);
    records[idx] = { ...records[idx], description: desc, amount, category, date, updatedAt: now };
    announce("Record updated.");
  } else {
    records.push({ id: `rec_${Date.now()}`, description: desc, amount, category, date, createdAt: now, updatedAt: now });
    announce("Record added.");
  }

  storage.saveRecords(records);
  form.reset(); document.getElementById('record-id').value = '';
  document.getElementById('submit-btn').textContent = 'Add record';
  document.getElementById('cancel-edit').hidden = true;
  refreshUI();
});

document.getElementById('records').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this record?')) {
      records = records.filter(r => r.id !== e.target.dataset.id);
      storage.saveRecords(records); refreshUI(); announce("Record deleted.");
    }
  }
  if (e.target.classList.contains('edit-btn')) {
    const r = records.find(x => x.id === e.target.dataset.id);
    document.getElementById('record-id').value = r.id;
    document.getElementById('description').value = r.description;
    document.getElementById('amount').value = r.amount;
    document.getElementById('category').value = r.category;
    document.getElementById('date').value = r.date;
    document.getElementById('submit-btn').textContent = 'Update record';
    document.getElementById('cancel-edit').hidden = false;
    document.getElementById('editor').scrollIntoView({ behavior: 'smooth' });
  }
});

document.getElementById('cancel-edit').addEventListener('click', () => {
  form.reset(); document.getElementById('record-id').value = '';
  document.getElementById('submit-btn').textContent = 'Add record';
  document.getElementById('cancel-edit').hidden = true;
});

document.getElementById('q').addEventListener('input', (e) => {
  const pattern = e.target.value;
  const errEl = document.getElementById('search-error');
  if (!pattern) { currentRegex = null; errEl.hidden = true; refreshUI(); return; }
  try {
    const escaped = document.getElementById('regex-mode').checked ? pattern : pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    currentRegex = search.compile(escaped, document.getElementById('case-insensitive').checked);
    errEl.hidden = true;
  } catch (err) { errEl.textContent = err.message; errEl.hidden = false; currentRegex = null; }
  refreshUI();
});

document.getElementById('reset-search').addEventListener('click', () => {
  document.getElementById('q').value = ''; currentRegex = null; refreshUI();
});
document.getElementById('sort-dir').addEventListener('click', (e) => {
  e.target.textContent = e.target.textContent.includes('↓') ? 'Ascending ↑' : 'Descending ↓'; refreshUI();
});
document.getElementById('sort-key').addEventListener('change', refreshUI);

document.getElementById('settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const base = document.getElementById('base-currency').value.trim().toUpperCase();
  const err = validators.currency(base);
  if (err) { document.getElementById('base-currency-error').textContent = err; document.getElementById('base-currency-error').hidden = false; return; }
  document.getElementById('base-currency-error').hidden = true;

  settings = {
    baseCurrency: base,
    alt1Code: document.getElementById('alt1-code').value.trim().toUpperCase(),
    categories: document.getElementById('categories').value.trim(),
    cap: document.getElementById('cap').value.trim()
  };
  storage.saveSettings(settings);
  document.querySelectorAll('[data-currency-label]').forEach(el => el.textContent = base);
  document.getElementById('settings-status').textContent = 'Settings saved.';
  refreshUI();
});

document.getElementById('export-btn').addEventListener('click', () => { storage.exportData(); announce("Data exported."); });
document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const res = storage.importData(ev.target.result);
    if (res.success) { records = storage.getRecords(); settings = storage.getSettings(); refreshUI(); announce("Data imported."); }
    else { announce(`Import failed: ${res.error}`, true); }
  };
  reader.readAsText(file);
});
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Delete ALL records?')) { records = []; storage.saveRecords(records); refreshUI(); announce("All deleted."); }
});