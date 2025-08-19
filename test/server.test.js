import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';
import app from '../server.js';
import { writeEffects } from '../models/effectsModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'effects.json');
const originalData = [{ id: '1', title: 'Test Effect' }];

async function withServer(t, testFn) {
  const server = http.createServer(app);
  server.listen(0);
  await once(server, 'listening');
  const port = server.address().port;
  try {
    await testFn(port);
  } finally {
    server.close();
  }
}

test.beforeEach(async () => {
  await writeEffects(originalData);
});

await test('GET /api/effects returns JSON array', async (t) => {
  await withServer(t, async (port) => {
    const res = await fetch(`http://localhost:${port}/api/effects`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.equal(data.length, 1);
    assert.equal(data[0].title, 'Test Effect');
  });
});

await test('POST /api/effects adds a new effect', async (t) => {
  await withServer(t, async (port) => {
    const newEffect = { id: '2', title: 'New Effect' };
    const res = await fetch(`http://localhost:${port}/api/effects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEffect),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.deepEqual(data, newEffect);

    const effects = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    assert.equal(effects.length, 2);
    assert.equal(effects[0].title, 'New Effect');
  });
});

await test('DELETE /api/effects/:id removes an effect', async (t) => {
  await withServer(t, async (port) => {
    const res = await fetch(`http://localhost:${port}/api/effects/1`, {
      method: 'DELETE',
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.deepEqual(data, { ok: true });
  });
});

await test('PUT /api/effects overwrites all effects', async (t) => {
  await withServer(t, async (port) => {
    const newEffects = [{ id: '3', title: 'Overwritten Effect' }];
    const res = await fetch(`http://localhost:${port}/api/effects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEffects),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.deepEqual(data, { ok: true });

    const effects = JSON.parse(await fs.readFile(DATA_FILE, 'utf-8'));
    assert.equal(effects.length, 1);
    assert.equal(effects[0].title, 'Overwritten Effect');
  });
});
