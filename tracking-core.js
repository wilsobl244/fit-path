(function () {
  'use strict';
  const KEY = 'fitpath-workout-sets-v1';
  const DEFAULT_EXERCISES = ['Goblet Squat', 'Leg Press', 'Reverse Lunge', 'Glute Bridge', 'Hip Thrust', 'Romanian Deadlift', 'Bulgarian Split Squat', 'Cable Kickback', 'Lat Pulldown', 'Seated Cable Row', 'Dumbbell Shoulder Press', 'Dumbbell Row', 'Push-up', 'Plank'];
  const clean = value => String(value ?? '').trim();
  function read() {
    try { const parsed = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(parsed) ? parsed.filter(x => x && typeof x === 'object') : []; }
    catch { return []; }
  }
  function save(rows) { localStorage.setItem(KEY, JSON.stringify(rows)); }
  function exercises() {
    const names = new Set(DEFAULT_EXERCISES);
    // Existing exercise data may use different structures. Keep these optional and safe.
    for (const item of (Array.isArray(window.EXERCISES) ? window.EXERCISES : [])) {
      const name = typeof item === 'string' ? item : item?.name;
      if (clean(name)) names.add(clean(name));
    }
    read().forEach(x => { if (clean(x.exercise)) names.add(clean(x.exercise)); });
    return [...names].sort((a, b) => a.localeCompare(b));
  }
  function option(select, value, label) { const el = document.createElement('option'); el.value = value; el.textContent = label; select.appendChild(el); }
  function dateToday() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function validDate(s) { if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const d = new Date(`${s}T12:00:00`); return !Number.isNaN(d.valueOf()) && `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` === s; }
  function number(n) { return Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 }); }
  window.FitPathTracking = { read, save, exercises, option, dateToday, validDate, number };
})();
