import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/send-welcome-email';

const bodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;

  // Check for existing key with this email
  const { data: existing } = await supabaseAdmin
    .from('api_keys')
    .select('key, name, email')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    try {
      await sendWelcomeEmail({ to: existing.email, name: existing.name, apiKey: existing.key });
    } catch (emailErr) {
      console.error('Welcome email error:', emailErr);
    }
    return NextResponse.json(
      { success: true, email: existing.email, already_exists: true },
      { status: 200 }
    );
  }

  const key = `sk_live_${nanoid(24)}`;

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({ key, name, email })
    .select('key, name, email')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }

  try {
    await sendWelcomeEmail({ to: email, name, apiKey: key });
  } catch (emailErr) {
    console.error('Welcome email error:', emailErr);
  }

  return NextResponse.json({ success: true, email: data.email }, { status: 201 });
}
