import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';
import type { FileChange, RiskLevel } from '@/lib/risk';

const RISK_COLORS: Record<RiskLevel, { bg: string; border: string; text: string; label: string }> = {
  DESTRUCTIVE: {
    bg: '#450a0a',
    border: '#b91c1c',
    text: '#fca5a5',
    label: 'DESTRUCTIVE · This action cannot be undone',
  },
  HIGH: {
    bg: '#451a03',
    border: '#b45309',
    text: '#fcd34d',
    label: 'HIGH RISK · Review carefully before approving',
  },
  LOW: {
    bg: '#052e16',
    border: '#166534',
    text: '#86efac',
    label: 'LOW RISK · Reversible action',
  },
};

const FILE_STATUS_COLORS: Record<string, string> = {
  modified: '#facc15',
  added: '#4ade80',
  deleted: '#f87171',
  renamed: '#60a5fa',
};

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: keyRow } = await supabaseAdmin
    .from('api_keys')
    .select('key')
    .eq('user_id', user.id)
    .maybeSingle();

  const apiKey = keyRow?.key ?? '';

  const { data: approval } = await supabaseAdmin
    .from('approvals')
    .select(
      'id, action, approver_email, context, status, created_at, decided_at, expires_at, command_type, risk_level, risk_bullets, files, diff'
    )
    .eq('id', id)
    .eq('account_id', apiKey)
    .maybeSingle();

  if (!approval) notFound();

  const riskLevel = (approval.risk_level as RiskLevel) ?? 'LOW';
  const riskColors = RISK_COLORS[riskLevel] ?? RISK_COLORS.LOW;
  const riskBullets: string[] = approval.risk_bullets ?? [];
  const files: FileChange[] = approval.files ?? [];

  const statusColor =
    approval.status === 'approved'
      ? 'text-green-400'
      : approval.status === 'rejected'
        ? 'text-red-400'
        : 'text-yellow-400';

  const createdAt = new Date(approval.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </Link>

        {/* Risk banner */}
        <div
          className="rounded-xl px-5 py-4 mb-6 border"
          style={{
            backgroundColor: riskColors.bg,
            borderColor: riskColors.border,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: riskColors.text }}>
            {riskColors.label}
          </p>
          {riskBullets.length > 0 && (
            <ul className="mt-2 space-y-1">
              {riskBullets.map((bullet) => (
                <li key={bullet} className="text-sm flex items-start gap-2" style={{ color: riskColors.text }}>
                  <span className="mt-0.5 shrink-0">•</span>
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{approval.action}</h1>
            <span className={`text-sm font-semibold capitalize ${statusColor}`}>
              {approval.status}
            </span>
          </div>
          <p className="text-sm text-[#555]">
            {createdAt} · {approval.approver_email}
          </p>
        </div>

        {/* Context */}
        {approval.context && (
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-2">
              Why the agent wants this
            </p>
            <p className="text-sm text-[#ccc] whitespace-pre-wrap leading-relaxed">
              {approval.context}
            </p>
          </div>
        )}

        {/* File manifest */}
        {files.length > 0 && (
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5 mb-6">
            <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-3">
              Files ({files.length})
            </p>
            <ul className="space-y-2">
              {files.map((f) => (
                <li key={f.path} className="flex items-center gap-2.5 text-sm">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: FILE_STATUS_COLORS[f.status] ?? '#888' }}
                    aria-label={f.status}
                  />
                  <span className="font-mono text-[#ccc]">{f.path}</span>
                  <span className="text-xs text-[#555] uppercase">{f.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full diff */}
        {approval.diff && (
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-5">
            <p className="text-xs font-semibold text-[#555] uppercase tracking-widest mb-3">
              Diff
            </p>
            <pre className="text-xs text-[#ccc] font-mono leading-relaxed overflow-x-auto whitespace-pre">
              {approval.diff}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
