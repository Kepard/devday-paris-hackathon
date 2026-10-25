import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createChatMiddleware, createLocalDatabase } from '../server/local.mjs';
import { reserveRequest } from '../server/budget.mjs';

test('the local budget ledger initializes itself and survives a server restart', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fyd-ledger-'));
  const filename = path.join(directory, 'budget.sqlite');
  let database = createLocalDatabase(filename);
  try {
    const now = Date.parse('2026-10-25T12:00:00Z');
    assert.equal((await reserveRequest(database, randomUUID(), now, 2)).ok, true);
    database.close();
    database = createLocalDatabase(filename);
    assert.equal((await reserveRequest(database, randomUUID(), now, 2)).reason, 'budget');
  } finally {
    database.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test('the local HTTP route serves chat, rejects cross-origin and oversized input, and preserves the provider boundary', async () => {
  const DB = createLocalDatabase(':memory:');
  let providerCalls = 0;
  const middleware = createChatMiddleware({ DB, OPENAI_API_KEY: 'test-only-never-a-real-key', AI_DEMO_EXPIRES_AT: '2027-01-01T00:00:00Z', AI_DAILY_BUDGET_USD: '5' }, {
    now: Date.parse('2026-10-25T12:00:00Z'),
    fetch: async () => {
      providerCalls++;
      return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'okay, i like that\nwhat are you building?' }] }] }));
    },
  });
  const server = createServer((req, res) => middleware(req, res, () => { res.writeHead(404); res.end(); }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const payload = () => ({ sessionId: randomUUID(), personaId: 'maya', profile: { name: 'Alex', interests: ['Coffee'] }, messages: [{ role: 'user', content: 'hey, what are you building?' }] });
  const post = (body, origin = base) => fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
  try {
    const response = await post(payload());
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.mode, 'ai');
    assert.equal(body.bubbles.length, 2);
    assert.equal(providerCalls, 1);
    assert.equal((await post(payload(), 'https://other.example')).status, 403);
    assert.equal((await post({ ...payload(), extra: 'x'.repeat(20000) })).status, 413);
    assert.equal((await fetch(`${base}/api/chat`)).status, 405);
    assert.equal((await fetch(`${base}/elsewhere`)).status, 404);
    assert.equal(providerCalls, 1);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    DB.close();
  }
});
