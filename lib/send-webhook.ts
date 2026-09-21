import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { checkWebhookUrl, isPrivateIp } from '@/lib/webhook-url';

const TIMEOUT_MS = 5000;

export async function postWebhook(rawUrl: string, payload: unknown): Promise<void> {
  const check = checkWebhookUrl(rawUrl);
  if (!check.ok) throw new Error(`Webhook blocked: ${check.reason}`);

  const url = new URL(rawUrl);
  const host = url.hostname.replace(/^\[|\]$/g, '');

  // A public-looking hostname can still resolve to a private address.
  if (process.env.ALLOW_PRIVATE_WEBHOOKS !== 'true' && !isIP(host)) {
    const addresses = await lookup(host, { all: true });
    if (addresses.some((a) => isPrivateIp(a.address))) {
      throw new Error('Webhook blocked: host resolves to a private address');
    }
  }

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'manual',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
