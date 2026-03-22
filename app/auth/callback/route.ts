import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/send-welcome-email';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
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
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
