(() => {
  'use strict';
  const api = window.FitPathTracking;
  const rows = api.read().filter(x => api.validDate(x.date) && Number.isFinite(Number(x.weight)) && Number.isFinite(Number(x.reps)));
  document.getElementById('totalSets').textContent = api.number(rows.length);
  document.getElementById('workoutDays').textContent = api.number(new Set(rows.map(x => x.date)).size);
  document.getElementById('totalVolume').textContent = `${api.number(rows.reduce((s,x) => s + Number(x.weight)*Number(x.reps), 0))} lb`;
  const exerciseSelect = document.getElementById('progressExercise');
  const names = [...new Set(rows.map(x => x.exercise))].sort();
  if (!names.length) api.option(exerciseSelect, '', 'No exercises logged');
  else names.forEach(name => api.option(exerciseSelect, name, name));
  const metric = document.getElementById('metric');
  const chart = document.getElementById('chart');
  const summary = document.getElementById('chartSummary');
  function draw() {
    chart.replaceChildren();
    const selected = rows.filter(x => x.exercise === exerciseSelect.value);
    const sessions = new Map();
    selected.forEach(x => {
      if (!sessions.has(x.date)) sessions.set(x.date, []);
      sessions.get(x.date).push(x);
    });
    const points = [...sessions].sort(([a],[b]) => a.localeCompare(b)).map(([date, items]) => ({ date, value: metric.value === 'weight' ? Math.max(...items.map(x => Number(x.weight))) : items.reduce((s,x) => s + (metric.value === 'volume' ? Number(x.weight)*Number(x.reps) : Number(x.reps)),0) }));
    if (!points.length) { chart.textContent = 'Log a workout to see your progress chart.'; summary.textContent = ''; return; }
    const max = Math.max(1, ...points.map(p => p.value));
    const width = 760, height = 290, left = 54, right = 20, top = 28, bottom = 58;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('role','img'); svg.setAttribute('aria-label', `${metric.options[metric.selectedIndex].text} by date for ${exerciseSelect.value}`);
    const make = (tag, attrs, content) => { const el = document.createElementNS(ns,tag); Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v)); if (content !== undefined) el.textContent = content; svg.appendChild(el); return el; };
    for (let i=0;i<=4;i++) { const y = top+(height-top-bottom)*i/4; make('line',{x1:left,y1:y,x2:width-right,y2:y,stroke:'#dce8e2'}); make('text',{x:left-8,y:y+4,'text-anchor':'end',fill:'#536c70','font-size':'12'},api.number(max*(4-i)/4)); }
    const xAt = i => left + (points.length === 1 ? (width-left-right)/2 : i*(width-left-right)/(points.length-1));
    const yAt = v => top + (height-top-bottom)*(1-v/max);
    make('polyline',{points:points.map((p,i)=>`${xAt(i)},${yAt(p.value)}`).join(' '),fill:'none',stroke:'#2f917b','stroke-width':'3','stroke-linecap':'round','stroke-linejoin':'round'});
    points.forEach((p,i) => { make('circle',{cx:xAt(i),cy:yAt(p.value),r:5,fill:'#2f917b'}); if (points.length <= 8 || i===0 || i===points.length-1 || i%Math.ceil(points.length/6)===0) make('text',{x:xAt(i),y:height-24,'text-anchor':'middle',fill:'#536c70','font-size':'11'},p.date.slice(5)); });
    chart.appendChild(svg);
    summary.textContent = `${points.length} logged workout date(s). Latest: ${api.number(points[points.length-1].value)} ${metric.value === 'reps' ? 'reps' : 'lb'}.`;
  }
  exerciseSelect.addEventListener('change',draw); metric.addEventListener('change',draw); draw();
  const records = document.getElementById('records');
  if (!names.length) records.textContent = 'No personal records yet. Start logging sets to build your history.';
  else names.forEach(name => { const items = rows.filter(x=>x.exercise===name); const maxWeight = Math.max(...items.map(x=>Number(x.weight))); const p = document.createElement('p'); p.className='track-record'; p.textContent = `${name}: ${api.number(maxWeight)} lb heaviest logged weight`; records.appendChild(p); });
})();
