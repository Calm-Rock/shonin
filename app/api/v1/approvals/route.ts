import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/send-approval-email';
import { classifyRisk, inferCommandType } from '@/lib/risk';
import type { FileChange } from '@/lib/risk';

const fileChangeSchema = z.object({
  path: z.string(),
  status: z.enum(['modified', 'added', 'deleted', 'renamed']),
});

const bodySchema = z.object({
  action: z.string().min(1),
  approver_email: z.string().email(),
  context: z.string().optional(),
  webhook_url: z.string().url().optional(),
  expires_in_hours: z.number().positive().default(24),
  command_type: z.string().optional(),
  files: z.array(fileChangeSchema).optional(),
  diff: z.string().optional(),
});

const DAILY_LIMIT = 50;
const DIFF_MAX_BYTES = 50 * 1024; // 50KB

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

async function validateApiKey(key: string): Promise<{ valid: boolean; unlimited: boolean }> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, unlimited')
    .eq('key', key)
    .maybeSingle();
  return { valid: !!data, unlimited: data?.unlimited ?? false };
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const { valid, unlimited } = await validateApiKey(apiKey);
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

  const { action, approver_email, context, webhook_url, expires_in_hours, files } = parsed.data;
  let { command_type, diff } = parsed.data;

  // Infer command_type from action string if not provided
  if (!command_type) {
    command_type = inferCommandType(action) ?? undefined;
  }

  // Truncate diff at 50KB
  if (diff && Buffer.byteLength(diff, 'utf8') > DIFF_MAX_BYTES) {
    diff = Buffer.from(diff, 'utf8').slice(0, DIFF_MAX_BYTES).toString('utf8') + '\n[truncated]';
  }

  const { risk_level, risk_bullets } = classifyRisk(command_type);

  let usedToday = 0;
  if (!unlimited) {
    const { count } = await supabaseAdmin
      .from('approvals')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', apiKey)
      .gte('created_at', new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString());

    usedToday = count ?? 0;

    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Daily limit reached. You can send ${DAILY_LIMIT} approvals per day on the free plan.` },
        { status: 429 }
      );
    }
  }

  const approve_token = nanoid(32);
  const reject_token = nanoid(32);
  const expires_at = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('approvals')
    .insert({
      account_id: apiKey,
      action,
      approver_email,
      context,
      webhook_url,
      approve_token,
      reject_token,
      expires_at,
      command_type: command_type ?? null,
      diff: diff ?? null,
      files: (files as FileChange[]) ?? null,
      risk_level,
      risk_bullets,
      token_used: false,
    })
    .select('id, status, approve_token, reject_token, created_at, expires_at')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }

  try {
    await sendApprovalEmail({
      to: approver_email,
      action,
      context,
      approveToken: approve_token,
      rejectToken: reject_token,
      expiresAt: expires_at,
      approvalId: data.id,
      commandType: command_type,
      riskLevel: risk_level,
      riskBullets: risk_bullets,
      files: files as FileChange[],
      diff,
    });
  } catch (emailErr) {
    console.error('Email send error:', emailErr);
    // Don't fail the request — approval is created, email can be retried
  }

  const newTotal = usedToday + 1;
  return NextResponse.json(
    {
      ...data,
      usage: unlimited
        ? { unlimited: true }
        : { today: newTotal, daily_limit: DAILY_LIMIT, remaining_today: DAILY_LIMIT - newTotal },
    },
    { status: 201 }
  );
}
