(() => {
  'use strict';
  const api = window.FitPathTracking;
  const form = document.getElementById('logForm');
  const date = document.getElementById('date');
  const exercise = document.getElementById('exercise');
  const filter = document.getElementById('historyFilter');
  const message = document.getElementById('logMessage');
  const history = document.getElementById('historyList');
  date.value = api.dateToday();
  api.exercises().forEach(name => { api.option(exercise, name, name); api.option(filter, name, name); });
  function render() {
    history.replaceChildren();
    const rows = api.read().filter(x => !filter.value || x.exercise === filter.value)
      .sort((a,b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (!rows.length) { const p = document.createElement('p'); p.textContent = 'No sets logged yet. Add your first set above!'; history.appendChild(p); return; }
    rows.forEach(row => {
      const card = document.createElement('article'); card.className = 'track-entry';
      const info = document.createElement('div');
      const heading = document.createElement('strong'); heading.textContent = row.exercise;
      const details = document.createElement('p'); details.textContent = `${row.date} · Set ${row.set} · ${row.reps} reps · ${api.number(row.weight)} lb`;
      info.append(heading, details);
      const del = document.createElement('button'); del.type = 'button'; del.className = 'track-button track-danger'; del.textContent = 'Delete'; del.setAttribute('aria-label', `Delete ${row.exercise} set from ${row.date}`);
      del.addEventListener('click', () => {
        if (!window.confirm(`Delete this ${row.exercise} set? This cannot be undone.`)) return;
        api.save(api.read().filter(item => item.id !== row.id));
        message.textContent = 'Set deleted.'; render();
      });
      card.append(info, del); history.appendChild(card);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const set = Number(document.getElementById('setNumber').value);
    const reps = Number(document.getElementById('reps').value);
    const weight = Number(document.getElementById('weight').value);
    if (!api.validDate(date.value) || !exercise.value || !Number.isInteger(set) || set < 1 || set > 50 || !Number.isInteger(reps) || reps < 1 || reps > 1000 || !Number.isFinite(weight) || weight < 0 || weight > 10000) {
      message.textContent = 'Check the date, exercise, set number, repetitions, and weight.'; return;
    }
    const rows = api.read();
    rows.push({ id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`), date: date.value, exercise: exercise.value, set, reps, weight, createdAt: new Date().toISOString() });
    try { api.save(rows); } catch { message.textContent = 'Could not save. Check your browser storage settings.'; return; }
    message.textContent = `${exercise.value} set saved!`;
    document.getElementById('setNumber').value = String(set + 1);
    document.getElementById('reps').value = '';
    render();
  });
  form.addEventListener('reset', () => { setTimeout(() => { date.value = api.dateToday(); message.textContent = 'Form cleared.'; }, 0); });
  filter.addEventListener('change', render);
  render();
})();
