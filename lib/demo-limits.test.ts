import { describe, it, expect } from 'vitest';
import { checkDemoLimits, GLOBAL_DAILY_EMAIL_BUDGET, PER_KEY_DAILY_LIMIT } from './demo-limits';

const base = {
  keyEmail: 'me@example.com',
  recipientEmail: 'me@example.com',
  usedByKeyToday: 0,
  sentTodayGlobal: 0,
};

describe('checkDemoLimits', () => {
  it('allows a request to the key owner within both limits', () => {
    expect(checkDemoLimits(base)).toEqual({ ok: true });
  });

  it('matches the recipient case-insensitively and ignores surrounding spaces', () => {
    expect(checkDemoLimits({ ...base, recipientEmail: '  ME@Example.com ' })).toEqual({ ok: true });
  });

  it('rejects a recipient that is not the key owner with 403', () => {
    const r = checkDemoLimits({ ...base, recipientEmail: 'someone-else@example.com' });
    expect(r).toMatchObject({ ok: false, status: 403 });
  });

  it('rejects when the key has no email on file', () => {
    expect(checkDemoLimits({ ...base, keyEmail: null })).toMatchObject({ ok: false, status: 403 });
  });

  it('allows the last request under the per-key limit and blocks the next with 429', () => {
    expect(checkDemoLimits({ ...base, usedByKeyToday: PER_KEY_DAILY_LIMIT - 1 })).toEqual({ ok: true });
    expect(checkDemoLimits({ ...base, usedByKeyToday: PER_KEY_DAILY_LIMIT })).toMatchObject({
      ok: false,
      status: 429,
    });
  });

  it('blocks with 503 once the shared daily email budget is used', () => {
    expect(checkDemoLimits({ ...base, sentTodayGlobal: GLOBAL_DAILY_EMAIL_BUDGET - 1 })).toEqual({ ok: true });
    expect(checkDemoLimits({ ...base, sentTodayGlobal: GLOBAL_DAILY_EMAIL_BUDGET })).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it('treats a failed budget count (Infinity) as exhausted', () => {
    expect(checkDemoLimits({ ...base, sentTodayGlobal: Number.POSITIVE_INFINITY })).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it('checks the recipient before the limits', () => {
    const r = checkDemoLimits({
      ...base,
      recipientEmail: 'other@example.com',
      usedByKeyToday: PER_KEY_DAILY_LIMIT,
      sentTodayGlobal: GLOBAL_DAILY_EMAIL_BUDGET,
    });
    expect(r).toMatchObject({ ok: false, status: 403 });
  });
});
