import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { supabaseAdmin } from '@/lib/supabase';
import { sendApprovalEmail } from '@/lib/send-approval-email';

const bodySchema = z.object({
  action: z.string().min(1),
  approver_email: z.string().email(),
  context: z.string().optional(),
  webhook_url: z.string().url().optional(),
  expires_in_hours: z.number().positive().default(24),
});

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

async function validateApiKey(key: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('key', key)
    .maybeSingle();
  return !!data;
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const valid = await validateApiKey(apiKey);
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

  const { action, approver_email, context, webhook_url, expires_in_hours } = parsed.data;

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
    });
  } catch (emailErr) {
    console.error('Email send error:', emailErr);
    // Don't fail the request — approval is created, email can be retried
  }

  return NextResponse.json(data, { status: 201 });
}
