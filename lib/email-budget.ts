import { supabaseAdmin } from '@/lib/supabase';

const startOfUtcDay = () => new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();

const countSince = (table: string, column: string, since: string) =>
  supabaseAdmin.from(table).select('*', { count: 'exact', head: true }).gte(column, since);

// Every route that sends email draws from one shared Resend quota, so count them all together.
export async function emailsSentToday(): Promise<number> {
  const since = startOfUtcDay();

  const [approvals, decisions, keys, logins] = await Promise.all([
    countSince('approvals', 'created_at', since),
    countSince('decisions', 'created_at', since),
    // Welcome emails: new keys and key re-sends both bump updated_at.
    countSince('api_keys', 'updated_at', since),
    countSince('login_emails', 'created_at', since),
  ]);

  const failure = approvals.error ?? decisions.error ?? keys.error ?? logins.error;
  if (failure) {
    console.error('Email budget count failed:', failure);
    return Number.POSITIVE_INFINITY;
  }

  return (approvals.count ?? 0) + (decisions.count ?? 0) + (keys.count ?? 0) + (logins.count ?? 0);
}

export async function loginEmailsToday(email: string): Promise<{ total: number; forAddress: number }> {
  const since = startOfUtcDay();

  const [all, mine] = await Promise.all([
    countSince('login_emails', 'created_at', since),
    countSince('login_emails', 'created_at', since).eq('email', email),
  ]);

  if (all.error || mine.error) {
    console.error('Login email count failed:', all.error ?? mine.error);
    return { total: Number.POSITIVE_INFINITY, forAddress: Number.POSITIVE_INFINITY };
  }

  return { total: all.count ?? 0, forAddress: mine.count ?? 0 };
}
