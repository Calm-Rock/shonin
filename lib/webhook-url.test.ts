import { describe, it, expect, afterEach } from 'vitest';
import { checkWebhookUrl, isPrivateIp } from './webhook-url';

describe('checkWebhookUrl', () => {
  it('accepts a public https URL', () => {
    expect(checkWebhookUrl('https://example.com/hooks/shonin')).toEqual({ ok: true });
  });

  it.each([
    ['http (not https)', 'http://example.com/hook'],
    ['localhost', 'https://localhost/hook'],
    ['a .localhost name', 'https://app.localhost/hook'],
    ['a .internal name', 'https://db.internal/hook'],
    ['a .local name', 'https://printer.local/hook'],
    ['loopback IPv4', 'https://127.0.0.1/hook'],
    ['cloud metadata address', 'https://169.254.169.254/latest/meta-data'],
    ['10.x network', 'https://10.0.0.5/hook'],
    ['192.168.x network', 'https://192.168.1.10/hook'],
    ['172.16.x network', 'https://172.16.0.1/hook'],
    ['decimal-encoded loopback', 'https://2130706433/hook'],
    ['hex-encoded loopback', 'https://0x7f000001/hook'],
    ['IPv6 loopback', 'https://[::1]/hook'],
    ['IPv4-mapped IPv6 loopback', 'https://[::ffff:127.0.0.1]/hook'],
    ['embedded credentials', 'https://user:pass@example.com/hook'],
    ['not a URL', 'not a url'],
  ])('rejects %s', (_name, url) => {
    expect(checkWebhookUrl(url)).toMatchObject({ ok: false });
  });

  it('accepts public addresses near private ranges', () => {
    expect(checkWebhookUrl('https://172.32.0.1/hook')).toEqual({ ok: true });
    expect(checkWebhookUrl('https://8.8.8.8/hook')).toEqual({ ok: true });
  });

  describe('self-hosting override', () => {
    afterEach(() => {
      delete process.env.ALLOW_PRIVATE_WEBHOOKS;
    });

    it('allows private http webhooks when ALLOW_PRIVATE_WEBHOOKS is true', () => {
      process.env.ALLOW_PRIVATE_WEBHOOKS = 'true';
      expect(checkWebhookUrl('http://10.0.0.5:8080/hook')).toEqual({ ok: true });
    });
  });
});

describe('isPrivateIp', () => {
  it('flags private and reserved IPv4 ranges', () => {
    for (const ip of ['0.0.0.0', '10.1.2.3', '100.64.0.1', '127.0.0.1', '169.254.1.1', '172.20.0.1', '192.168.0.1', '224.0.0.1']) {
      expect(isPrivateIp(ip)).toBe(true);
    }
  });

  it('flags private and reserved IPv6 ranges, including mapped IPv4', () => {
    for (const ip of ['::', '::1', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '::ffff:10.0.0.1', '::ffff:7f00:1']) {
      expect(isPrivateIp(ip)).toBe(true);
    }
  });

  it('lets public addresses through', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '172.32.0.1', '2606:4700:4700::1111']) {
      expect(isPrivateIp(ip)).toBe(false);
    }
  });
});
