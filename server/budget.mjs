export const MAX_DAILY_CENTS = 500;
export const RESERVATION_CENTS = 2;
export const MAX_SESSION_REQUESTS = 10;
export const SESSION_COOLDOWN_MS = 1000;

export function budgetDay(now = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
}

export function dailyLimitCents(value) {
  const dollars = Number(value ?? 5);
  if (!Number.isFinite(dollars)) return 0;
  return Math.max(0, Math.min(MAX_DAILY_CENTS, Math.floor(dollars * 100)));
}

// Every paid request first claims a durable, atomic 2-cent allowance. Never
// refund ambiguous upstream failures: the provider may have processed them.
export async function reserveRequest(db, sessionId, now, limit = MAX_DAILY_CENTS) {
  if (!db) return { ok: false, reason: 'unavailable' };
  if (limit < RESERVATION_CENTS) return { ok: false, reason: 'budget' };
  const day = budgetDay(now);
  const sessionKey = `${day}:${sessionId}`;
  const session = await db.prepare(`
    INSERT INTO ai_demo_sessions (session_key, day, request_count, last_request_at)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(session_key) DO UPDATE SET
      request_count = ai_demo_sessions.request_count + 1,
      last_request_at = excluded.last_request_at
    WHERE ai_demo_sessions.request_count < ?
      AND ai_demo_sessions.last_request_at <= ?
    RETURNING request_count
  `).bind(sessionKey, day, now, MAX_SESSION_REQUESTS, now - SESSION_COOLDOWN_MS).first();
  if (!session) return { ok: false, reason: 'session' };
  const reservation = await db.prepare(`
    INSERT INTO ai_daily_budget (day, reserved_cents, request_count, updated_at)
    SELECT ?, ?, 1, ? WHERE ? >= ?
    ON CONFLICT(day) DO UPDATE SET
      reserved_cents = ai_daily_budget.reserved_cents + excluded.reserved_cents,
      request_count = ai_daily_budget.request_count + 1,
      updated_at = excluded.updated_at
    WHERE ai_daily_budget.reserved_cents + excluded.reserved_cents <= ?
    RETURNING reserved_cents
  `).bind(day, RESERVATION_CENTS, now, limit, RESERVATION_CENTS, limit).first();
  if (!reservation) return { ok: false, reason: 'budget' };
  return { ok: true, day, reservedCents: reservation.reserved_cents, sessionRequests: session.request_count };
}
