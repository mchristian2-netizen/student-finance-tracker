import { search } from './search.js';

export const ui = {
  renderStats: (records, settings) => {
    const total = records.length;
    const sum = records.reduce((acc, r) => acc + parseFloat(r.amount), 0);
    const categories = records.reduce((acc, r) => { acc[r.category] = (acc[r.category] || 0) + 1; return acc; }, {});
    const topCat = Object.keys(categories).sort((a,b) => categories[b] - categories[a])[0] || 'N/A';

    document.getElementById('stats').innerHTML = `
      <div class="stat-card"><strong>Total Records</strong><span>${total}</span></div>
      <div class="stat-card"><strong>Total Spend (${settings.baseCurrency})</strong><span>${sum.toFixed(2)}</span></div>
      <div class="stat-card"><strong>Top Category</strong><span>${topCat}</span></div>
    `;

    const capVal = parseFloat(settings.cap);
    const capStatus = document.getElementById('cap-status');
    const capAlert = document.getElementById('cap-alert');
    const capBar = document.getElementById('cap-bar');

    if (capVal > 0) {
      const remaining = capVal - sum;
      capBar.style.width = `${Math.min((sum / capVal) * 100, 100)}%`;
      if (remaining < 0) {
        capStatus.textContent = `Over budget by ${Math.abs(remaining).toFixed(2)} ${settings.baseCurrency}`;
        capBar.dataset.over = "true";
        capAlert.hidden = false; capAlert.textContent = "Warning: Over budget!";
      } else {
        capStatus.textContent = `Remaining: ${remaining.toFixed(2)} ${settings.baseCurrency}`;
        capBar.dataset.over = "false";
        capAlert.hidden = true;
      }
    } else {
      capStatus.textContent = 'No cap set.'; capBar.style.width = '0%'; capAlert.hidden = true;
    }

    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0,10);
      const dayTotal = records.filter(r => r.date === dateStr).reduce((a, r) => a + parseFloat(r.amount), 0);
      const max = Math.max(...records.map(r => parseFloat(r.amount)), 1);
      chart.innerHTML += `<li style="height: ${(dayTotal/max)*100}%;" title="${dateStr}: ${dayTotal.toFixed(2)}"><span>${d.getDate()}</span></li>`;
    }
  },

  renderRecords: (records, regex) => {
    const tbody = document.getElementById('records-body');
    const cards = document.getElementById('records-cards');
    tbody.innerHTML = ''; cards.innerHTML = '';

    records.forEach(r => {
      const highlightedDesc = regex ? search.highlight(r.description, regex) : r.description;
      const highlightedCat = regex ? search.highlight(r.category, regex) : r.category;

      tbody.innerHTML += `
        <tr>
          <td>${r.date}</td><td>${highlightedDesc}</td><td>${highlightedCat}</td>
          <td class="num">${parseFloat(r.amount).toFixed(2)}</td>
          <td>
            <button class="btn btn-ghost edit-btn" data-id="${r.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${r.id}">Delete</button>
          </td>
        </tr>`;
      cards.innerHTML += `
        <li class="card">
          <div class="card-header"><span>${highlightedDesc}</span><span>${parseFloat(r.amount).toFixed(2)}</span></div>
          <div>${r.date} · <em>${highlightedCat}</em></div>
          <div class="card-actions">
            <button class="btn btn-ghost edit-btn" data-id="${r.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${r.id}">Delete</button>
          </div>
        </li>`;
    });
    document.getElementById('empty-state').hidden = records.length > 0;
  }
};