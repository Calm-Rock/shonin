import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase';
import { StatusBadge } from '@/components/StatusBadge';

interface Approval {
  id: string;
  action: string;
  approver_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  decided_at: string | null;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (!key) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-2">Shonin Dashboard</p>
          <p className="text-[#6b7280] text-sm">
            Add your API key to the URL to view your approvals.
          </p>
          <code className="mt-4 inline-block bg-[#1a1a1a] text-[#a3a3a3] text-xs px-3 py-1.5 rounded-md border border-[#2a2a2a]">
            /dashboard?key=your-api-key
          </code>
        </div>
      </div>
    );
  }

  const { data: approvals, error } = await supabaseAdmin
    .from('approvals')
    .select('id, action, approver_email, status, created_at, decided_at')
    .eq('account_id', key)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <p className="text-red-400 text-sm">Failed to load approvals. Check your API key.</p>
      </div>
    );
  }

  const rows = (approvals ?? []) as Approval[];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <div className="border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Shonin" width={24} height={24} />
          <div>
            <p className="text-xs text-[#6b7280] font-mono mb-0.5">shonin</p>
            <h1 className="text-lg font-semibold text-white">Approvals</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b7280]">Key:</span>
          <code className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-[#a3a3a3] px-2 py-0.5 rounded">
            {key.length > 24 ? `${key.slice(0, 12)}…${key.slice(-8)}` : key}
          </code>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-[#4b4b4b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[#6b7280] text-sm">No approvals yet for this key.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#1f1f1f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1f1f1f] bg-[#111111]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Approver
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6b7280] uppercase tracking-wider">
                    Decided
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#111111] transition-colors">
                    <td className="px-4 py-3 text-white font-medium max-w-xs truncate">
                      {row.action}
                    </td>
                    <td className="px-4 py-3 text-[#a3a3a3]">{row.approver_email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">
                      {row.decided_at ? formatDate(row.decided_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-right text-xs text-[#3a3a3a]">
          {rows.length} approval{rows.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
