import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import app from '../server.js';

test('GET /api/effects returns JSON array', async () => {
  const server = http.createServer(app);
  server.listen(0);
  await once(server, 'listening');
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/effects`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  server.close();
});
