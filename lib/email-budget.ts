import { supabaseAdmin } from '@/lib/supabase';

// Every route that sends email draws from one shared Resend quota, so count them all together.
export async function emailsSentToday(): Promise<number> {
  const since = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
  const countSince = (table: string, column: string) =>
    supabaseAdmin.from(table).select('*', { count: 'exact', head: true }).gte(column, since);

  const [approvals, decisions, keys] = await Promise.all([
    countSince('approvals', 'created_at'),
    countSince('decisions', 'created_at'),
    // Welcome emails: new keys and key re-sends both bump updated_at.
    countSince('api_keys', 'updated_at'),
  ]);

  if (approvals.error || decisions.error || keys.error) {
    console.error('Email budget count failed:', approvals.error ?? decisions.error ?? keys.error);
    return Number.POSITIVE_INFINITY;
  }

  return (approvals.count ?? 0) + (decisions.count ?? 0) + (keys.count ?? 0);
}
