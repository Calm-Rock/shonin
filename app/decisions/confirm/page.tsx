import { supabaseAdmin } from '@/lib/supabase';

type DecisionOption = { key: string; label: string; token: string };

const page = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  background: '#f6f9fc',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
} as const;

const card = {
  background: '#fff',
  border: '1px solid #e6ebf1',
  borderRadius: '12px',
  padding: '48px 40px',
  maxWidth: '480px',
  width: '100%',
  textAlign: 'center',
} as const;

function Card({ title, message, children }: { title: string; message: string; children?: React.ReactNode }) {
  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{title}</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{message}</p>
        {children}
      </div>
    </div>
  );
}

export default async function DecisionConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Card title="Invalid Link" message="No answer token provided." />;
  }

  const { data: decision } = await supabaseAdmin
    .from('decisions')
    .select('question, options, token_used, expires_at')
    .filter('options', 'cs', JSON.stringify([{ token }]))
    .maybeSingle();

  if (!decision) {
    return <Card title="Invalid Link" message="This decision link is invalid or does not exist." />;
  }

  if (decision.token_used) {
    return <Card title="Already Answered" message="This question has already been answered." />;
  }

  if (new Date(decision.expires_at as string) < new Date()) {
    return <Card title="Link Expired" message="This decision link has expired and can no longer be used." />;
  }

  const chosen = ((decision.options as DecisionOption[]) ?? []).find((o) => o.token === token);
  if (!chosen) {
    return <Card title="Invalid Link" message="This decision link is invalid or does not exist." />;
  }

  return (
    <Card title={decision.question as string} message="You are about to answer with:">
      <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '16px 0 24px' }}>{chosen.label}</p>
      <form method="POST" action={`/api/v1/decisions/decide/${encodeURIComponent(token)}`}>
        <button
          type="submit"
          style={{
            background: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 28px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Confirm answer
        </button>
      </form>
      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '20px 0 0' }}>
        Wrong answer? Go back to the email and pick a different option.
      </p>
    </Card>
  );
}
