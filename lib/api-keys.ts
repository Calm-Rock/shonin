import { supabaseAdmin } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demo-mode';

// Outside demo mode every key is treated as unlimited.
export async function validateApiKey(
  key: string
): Promise<{ valid: boolean; unlimited: boolean; email: string | null }> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, unlimited, email')
    .eq('key', key)
    .maybeSingle();
  return {
    valid: !!data,
    unlimited: !isDemoMode() || (data?.unlimited ?? false),
    email: data?.email ?? null,
  };
}
