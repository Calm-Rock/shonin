import { describe, it, expect } from 'vitest';
import {
  checkDemoLimits,
  checkLoginEmailLimits,
  GLOBAL_DAILY_EMAIL_BUDGET,
  LOGIN_EMAIL_DAILY_LIMIT,
  LOGIN_EMAIL_PER_ADDRESS_DAILY_LIMIT,
  PER_KEY_DAILY_LIMIT,
} from './demo-limits';

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

describe('checkLoginEmailLimits', () => {
  const login = { loginSentToday: 0, sentToAddressToday: 0, sentTodayGlobal: 0 };

  it('allows a login email when nothing has been sent', () => {
    expect(checkLoginEmailLimits(login)).toEqual({ ok: true });
  });

  it('allows the last per-address send and blocks the next with 429', () => {
    expect(checkLoginEmailLimits({ ...login, sentToAddressToday: LOGIN_EMAIL_PER_ADDRESS_DAILY_LIMIT - 1 })).toEqual({ ok: true });
    expect(checkLoginEmailLimits({ ...login, sentToAddressToday: LOGIN_EMAIL_PER_ADDRESS_DAILY_LIMIT })).toMatchObject({
      ok: false,
      status: 429,
    });
  });

  it('caps login emails at 10 a day across everyone', () => {
    expect(LOGIN_EMAIL_DAILY_LIMIT).toBe(10);
    expect(checkLoginEmailLimits({ ...login, loginSentToday: LOGIN_EMAIL_DAILY_LIMIT - 1 })).toEqual({ ok: true });
    expect(checkLoginEmailLimits({ ...login, loginSentToday: LOGIN_EMAIL_DAILY_LIMIT })).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it('also stops when the shared 50-email budget is used', () => {
    expect(checkLoginEmailLimits({ ...login, sentTodayGlobal: GLOBAL_DAILY_EMAIL_BUDGET })).toMatchObject({
      ok: false,
      status: 503,
    });
  });

  it('treats failed counts (Infinity) as exhausted', () => {
    expect(
      checkLoginEmailLimits({
        loginSentToday: Number.POSITIVE_INFINITY,
        sentToAddressToday: Number.POSITIVE_INFINITY,
        sentTodayGlobal: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({ ok: false });
  });
});
