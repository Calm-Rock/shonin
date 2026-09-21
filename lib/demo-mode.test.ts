import { describe, it, expect, afterEach } from 'vitest';
import { isDemoMode } from './demo-mode';

describe('isDemoMode', () => {
  afterEach(() => {
    delete process.env.DEMO_MODE;
  });

  it('is off by default so self-hosted instances run without limits', () => {
    expect(isDemoMode()).toBe(false);
  });

  it('is on only when DEMO_MODE is exactly "true"', () => {
    process.env.DEMO_MODE = 'true';
    expect(isDemoMode()).toBe(true);
    for (const value of ['1', 'TRUE', 'yes', 'false', '']) {
      process.env.DEMO_MODE = value;
      expect(isDemoMode()).toBe(false);
    }
  });
});
