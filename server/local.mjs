import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { handleChat, MAX_BODY_BYTES } from './chat.mjs';

/** The same prepared-statement contract used by the hosted D1 budget ledger. */
export function createLocalDatabase(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const sqlite = new DatabaseSync(filename);
  sqlite.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS ai_daily_budget (
      day TEXT PRIMARY KEY,
      reserved_cents INTEGER NOT NULL DEFAULT 0,
      request_count INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ai_demo_sessions (
      session_key TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      request_count INTEGER NOT NULL DEFAULT 0,
      last_request_at INTEGER NOT NULL
    );
  `);
  return {
    prepare(sql) {
      return { bind(...args) { return { async first() { return sqlite.prepare(sql).get(...args) ?? null; } }; } };
    },
    close() { sqlite.close(); },
  };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    const error = (message, status) => Object.assign(new Error(message), { status });
    const timer = setTimeout(() => finish(error('Request timed out.', 408)), 15_000);
    timer.unref();
    function finish(failure) {
      clearTimeout(timer);
      request.off('data', onData);
      request.off('end', onEnd);
      request.off('error', onError);
      request.off('aborted', onAborted);
      if (failure) { request.resume(); reject(failure); }
      else resolve(Buffer.concat(chunks));
    }
    function onData(chunk) {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) finish(error('Request too large.', 413));
      else chunks.push(chunk);
    }
    function onEnd() { finish(); }
    function onError() { finish(error('Could not read message.', 400)); }
    function onAborted() { finish(error('Request interrupted.', 400)); }
    request.on('data', onData);
    request.once('end', onEnd);
    request.once('error', onError);
    request.once('aborted', onAborted);
    if (Number(request.headers['content-length']) > MAX_BODY_BYTES) finish(error('Request too large.', 413));
  });
}

/** Connect-compatible API middleware, shared by Vite dev and local preview. */
export function createChatMiddleware(env, dependencies = {}) {
  return async (incoming, outgoing, next) => {
    if (incoming.url?.split('?')[0] !== '/api/chat') return next();
    try {
      const protocol = incoming.socket.encrypted ? 'https' : 'http';
      const url = new URL(incoming.url, `${protocol}://${incoming.headers.host || 'localhost'}`);
      const headers = new Headers();
      for (let i = 0; i < incoming.rawHeaders.length; i += 2) {
        headers.append(incoming.rawHeaders[i], incoming.rawHeaders[i + 1]);
      }
      const method = incoming.method || 'GET';
      const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(incoming);
      const request = new Request(url, { method, headers, body });
      const response = await handleChat(request, env, dependencies);
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      if (outgoing.destroyed) return;
      const status = [400, 408, 413].includes(error.status) ? error.status : 500;
      outgoing.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      outgoing.end(JSON.stringify({ error: status === 500 ? 'Could not send this message. Please try again.' : error.message }));
    }
  };
}
