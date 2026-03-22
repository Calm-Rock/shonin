import { supabaseAdmin } from '@/lib/supabase';
import type { RiskLevel } from '@/lib/risk';
import ConfirmClient from './ConfirmClient';

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#f6f9fc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e6ebf1',
          borderRadius: '12px',
          padding: '48px 40px',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '48px', margin: '0 0 16px' }}>⚠️</p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{title}</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{message}</p>
      </div>
    </div>
  );
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorPage title="Invalid Link" message="No approval token provided." />;
  }

  const { data: approval } = await supabaseAdmin
    .from('approvals')
    .select('id, action, status, expires_at, token_used, risk_level, risk_bullets, reject_token')
    .eq('approve_token', token)
    .maybeSingle();

  if (!approval) {
    return <ErrorPage title="Invalid Link" message="This approval link is invalid or does not exist." />;
  }

  if (approval.token_used) {
    return <ErrorPage title="Already Decided" message="This approval has already been decided." />;
  }

  if (new Date(approval.expires_at) < new Date()) {
    return <ErrorPage title="Link Expired" message="This approval link has expired and can no longer be used." />;
  }

  return (
    <ConfirmClient
      action={approval.action}
      riskLevel={(approval.risk_level as RiskLevel) ?? 'LOW'}
      riskBullets={approval.risk_bullets ?? []}
      approveToken={token}
      rejectToken={approval.reject_token}
    />
  );
}
