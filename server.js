const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'effects.json');

async function readEffects() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeEffects(effects) {
  await fs.writeFile(DATA_FILE, JSON.stringify(effects, null, 2));
}

app.get('/api/effects', async (req, res) => {
  const effects = await readEffects();
  res.json(effects);
});

app.post('/api/effects', async (req, res) => {
  const effects = await readEffects();
  const effect = req.body;
  effects.unshift(effect);
  await writeEffects(effects);
  res.status(201).json(effect);
});

app.put('/api/effects', async (req, res) => {
  const effects = Array.isArray(req.body) ? req.body : [];
  await writeEffects(effects);
  res.json({ ok: true });
});

app.delete('/api/effects/:id', async (req, res) => {
  const id = req.params.id;
  const effects = await readEffects();
  const newEffects = effects.filter(e => e.id !== id);
  await writeEffects(newEffects);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
