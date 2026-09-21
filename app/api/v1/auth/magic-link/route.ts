import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { checkLoginEmailLimits } from '@/lib/demo-limits';
import { loginEmailsToday } from '@/lib/email-budget';
import { sendLoginEmail } from '@/lib/send-login-email';

const bodySchema = z.object({ email: z.string().email() });

// Fallback for when Supabase's built-in email is rate-limited: we generate the link and send it through Resend, under a daily cap.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  const logins = await loginEmailsToday(email);
  const check = checkLoginEmailLimits({
    loginSentToday: logins.total,
    sentToAddressToday: logins.forAddress,
  });
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (linkError || !link.properties?.hashed_token) {
    console.error('generateLink failed:', linkError);
    return NextResponse.json({ error: 'Could not create a login link. Try again later.' }, { status: 500 });
  }

  const loginUrl = `${appUrl}/auth/callback?token_hash=${encodeURIComponent(link.properties.hashed_token)}`;

  const { data: counted } = await supabaseAdmin.from('login_emails').insert({ email }).select('id').single();

  const { error: sendError } = await sendLoginEmail({ to: email, loginUrl });
  if (sendError) {
    console.error('Login email send error:', sendError);
    if (counted) await supabaseAdmin.from('login_emails').delete().eq('id', counted.id);
    return NextResponse.json({ error: 'Could not send the login email. Try again later.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
