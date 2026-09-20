import { supabaseAdmin } from '@/lib/supabase';

export async function validateApiKey(
  key: string
): Promise<{ valid: boolean; unlimited: boolean; email: string | null }> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, unlimited, email')
    .eq('key', key)
    .maybeSingle();
  return { valid: !!data, unlimited: data?.unlimited ?? false, email: data?.email ?? null };
}
