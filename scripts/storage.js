const STORAGE_KEY = 'finance_tracker_records';
const SETTINGS_KEY = 'finance_tracker_settings';

const defaultSettings = {
  baseCurrency: 'USD',
  alt1Code: 'EUR',
  categories: 'Food, Books, Transport, Entertainment, Fees, Other',
  cap: ''
};

export const storage = {
  getRecords: () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  },
  saveRecords: (records) => localStorage.setItem(STORAGE_KEY, JSON.stringify(records)),
  getSettings: () => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch (e) { return defaultSettings; }
  },
  saveSettings: (settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),
  exportData: () => {
    const data = { records: storage.getRecords(), settings: storage.getSettings() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `finance-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  },
  importData: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.records || !Array.isArray(data.records)) throw new Error("Invalid records array.");
      storage.saveRecords(data.records);
      if (data.settings) storage.saveSettings(data.settings);
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }
};