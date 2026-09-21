import { isIP } from 'node:net';

export type WebhookCheck = { ok: true } | { ok: false; reason: string };

function ipv4Octets(ip: string): number[] | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
  return octets.every((o) => o >= 0 && o <= 255) ? octets : null;
}

function isPrivateIpv4(ip: string): boolean {
  const o = ipv4Octets(ip);
  if (!o) return true;
  const [a, b] = o;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function ipv6Bytes(ip: string): number[] | null {
  let text = ip.toLowerCase();
  const tail = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const o = ipv4Octets(tail[1]);
    if (!o) return null;
    text = text.slice(0, -tail[1].length) + ((o[0] << 8) | o[1]).toString(16) + ':' + ((o[2] << 8) | o[3]).toString(16);
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? head.length !== 8 : missing < 0) return null;
  const groups = halves.length === 1 ? head : [...head, ...Array(missing).fill('0'), ...rest];
  const bytes: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    const v = parseInt(g, 16);
    bytes.push(v >> 8, v & 0xff);
  }
  return bytes;
}

export function isPrivateIp(ip: string): boolean {
  const host = ip.replace(/^\[|\]$/g, '');
  const family = isIP(host);
  if (family === 4) return isPrivateIpv4(host);
  if (family !== 6) return true;

  const b = ipv6Bytes(host);
  if (!b) return true;
  if (b.every((x) => x === 0)) return true;
  if (b.slice(0, 15).every((x) => x === 0) && b[15] === 1) return true;
  if ((b[0] & 0xfe) === 0xfc) return true;
  if (b[0] === 0xfe && (b[1] & 0xc0) === 0x80) return true;
  if (b[0] === 0xff) return true;
  const mapped = b.slice(0, 10).every((x) => x === 0) && b[10] === 0xff && b[11] === 0xff;
  const nat64 = b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && b.slice(4, 12).every((x) => x === 0);
  if (mapped || nat64) return isPrivateIpv4(b.slice(12).join('.'));
  return false;
}

// Self-hosters may need to call webhooks on their own network.
const allowPrivate = () => process.env.ALLOW_PRIVATE_WEBHOOKS === 'true';

export function checkWebhookUrl(raw: string): WebhookCheck {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'not a valid URL' };
  }

  if (allowPrivate()) return { ok: true };

  if (url.protocol !== 'https:') return { ok: false, reason: 'must use https' };
  if (url.username || url.password) return { ok: false, reason: 'must not contain credentials' };

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return { ok: false, reason: 'must be a public host' };
  }
  if (isIP(host) && isPrivateIp(host)) return { ok: false, reason: 'must not be a private or reserved address' };

  return { ok: true };
}
