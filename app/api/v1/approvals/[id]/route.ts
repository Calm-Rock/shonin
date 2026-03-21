import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
  }

  const valid = await validateApiKey(apiKey);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from('approvals')
    .select('*')
    .eq('id', id)
    .eq('account_id', apiKey)
    .maybeSingle();

  if (error) {
    console.error('Supabase query error:', error);
    return NextResponse.json({ error: 'Failed to fetch approval' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
