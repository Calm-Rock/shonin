import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export type LoginLinkResult = { ok: true } | { ok: false; message: string };

// Supabase's built-in email is free but capped per hour; when it is rate-limited, fall back to the capped Resend route.
export async function requestLoginLink(email: string): Promise<LoginLinkResult> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });

  if (!error) return { ok: true };

  const useFallback =
    error.status === 429 ||
    error.code === 'over_email_send_rate_limit' ||
    error.code === 'email_address_not_authorized';
  if (!useFallback) return { ok: false, message: error.message };

  const res = await fetch('/api/v1/auth/magic-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (res.ok) return { ok: true };

  const body = await res.json().catch(() => ({}));
  return { ok: false, message: body.error ?? 'Could not send a login link. Try again later.' };
}
