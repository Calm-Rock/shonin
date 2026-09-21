import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/send-welcome-email';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');

  const supabase = await createSupabaseServerClient();
  let user: User | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) user = data.user;
  } else if (tokenHash) {
    // Links sent by /api/v1/auth/magic-link (the Resend fallback) carry a token hash instead of a PKCE code.
    // First-time users get a signup-style token and returning users a magiclink one; type 'email' accepts both.
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
    if (!error) user = data.user;
  }

  if (user) {
    const { data: existing } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      const key = `sk_live_${nanoid(24)}`;
      await supabaseAdmin
        .from('api_keys')
        .insert({ key, name: user.email ?? 'User', email: user.email ?? '', user_id: user.id });

      try {
        await sendWelcomeEmail({ to: user.email!, name: user.email!, apiKey: key });
      } catch (emailErr) {
        console.error('Welcome email error:', emailErr);
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
