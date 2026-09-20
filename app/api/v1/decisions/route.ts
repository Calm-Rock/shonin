import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import { validateApiKey } from '@/lib/api-keys';
import { checkDemoLimits, PER_KEY_DAILY_LIMIT } from '@/lib/demo-limits';
import { emailsSentToday } from '@/lib/email-budget';
import { sendDecisionEmail } from '@/lib/send-decision-email';

const optionSchema = z.object({
  key: z.string().min(1).max(16),
  label: z.string().min(1).max(200),
});

const bodySchema = z.object({
  question: z.string().min(1),
  options: z.array(optionSchema).min(2).max(10),
  respondent_email: z.string().email(),
  context: z.string().optional(),
  webhook_url: z.string().url().optional(),
  expires_in_hours: z.number().positive().default(24),
});

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const { valid, unlimited, email: keyEmail } = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

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

  type ParsedBody = z.infer<typeof bodySchema>;
  const { question, options, respondent_email, context, webhook_url, expires_in_hours } =
    parsed.data as ParsedBody;

  let usedToday = 0;
  if (!unlimited) {
    const { count } = await supabaseAdmin
      .from('decisions')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', apiKey)
      .gte('created_at', new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString());

    usedToday = count ?? 0;

    const check = checkDemoLimits({
      keyEmail,
      recipientEmail: respondent_email,
      usedByKeyToday: usedToday,
      sentTodayGlobal: await emailsSentToday(),
    });
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
  }

  const expires_at = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString();

  // Attach a unique token to each option
  const optionsWithTokens = (options as Array<{ key: string; label: string }>).map((opt) => ({
    key: opt.key,
    label: opt.label,
    token: nanoid(32),
  }));

  const { data, error } = await supabaseAdmin
    .from('decisions')
    .insert({
      account_id: apiKey,
      question,
      options: optionsWithTokens,
      respondent_email,
      context,
      webhook_url,
      expires_at,
      token_used: false,
    })
    .select('id, status, created_at, expires_at')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to create decision' }, { status: 500 });
  }

  try {
    await sendDecisionEmail({
      to: respondent_email,
      question,
      context,
      options: optionsWithTokens,
      expiresAt: expires_at,
      decisionId: data.id,
    });
  } catch (emailErr) {
    console.error('Email send error:', emailErr);
  }

  const newTotal = usedToday + 1;
  return NextResponse.json(
    {
      ...data,
      usage: unlimited
        ? { unlimited: true }
        : { today: newTotal, daily_limit: PER_KEY_DAILY_LIMIT, remaining_today: PER_KEY_DAILY_LIMIT - newTotal },
    },
    { status: 201 }
  );
}
