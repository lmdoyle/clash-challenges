const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3456;
const DATA_FILE = path.join(__dirname, 'data', 'challenges.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function load() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { weekLabel: 'Weekly Challenges', challenges: [] }; }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => res.json(load()));

app.post('/api/week', (req, res) => {
  const d = load();
  d.weekLabel = req.body.label;
  save(d);
  res.json(d);
});

app.post('/api/challenges', (req, res) => {
  const d = load();
  const c = {
    id: crypto.randomUUID(),
    name: req.body.name || 'New Challenge',
    current: Number(req.body.current) || 0,
    total: Number(req.body.total) || 1,
    points: Number(req.body.points) || 0,
    hidden: !!req.body.hidden
  };
  d.challenges.push(c);
  save(d);
  res.json(c);
});

app.patch('/api/challenges/:id', (req, res) => {
  const d = load();
  const c = d.challenges.find(x => x.id === req.params.id);
  if (!c) return res.status(404).end();
  Object.assign(c, req.body);
  save(d);
  res.json(c);
});

app.delete('/api/challenges/:id', (req, res) => {
  const d = load();
  d.challenges = d.challenges.filter(x => x.id !== req.params.id);
  save(d);
  res.json({ ok: true });
});

app.post('/api/new-week', (req, res) => {
  const d = load();
  if (req.body.label) d.weekLabel = req.body.label;
  d.challenges.forEach(c => { c.current = 0; });
  save(d);
  res.json(d);
});

app.listen(PORT, () => {
  console.log('\n⚔️  CoC Challenge Tracker\n');
  console.log(`   Admin:   http://localhost:${PORT}/admin.html`);
  console.log(`   Overlay: http://localhost:${PORT}/overlay.html\n`);
});
