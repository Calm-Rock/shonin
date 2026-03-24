import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface DecisionOption {
  key: string;
  label: string;
  token: string;
}

interface DecisionEmailProps {
  question: string;
  context?: string;
  options: DecisionOption[];
  expiresAt: string;
  decisionId?: string;
  appUrl?: string;
}

const OPTION_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

export function DecisionEmail({
  question,
  context,
  options,
  expiresAt,
  appUrl,
}: DecisionEmailProps) {
  const expiryDate = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const APP_URL = appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? '';

  return (
    <Html>
      <Head />
      <Preview>{question}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header banner */}
          <Section style={header}>
            <Text style={headerLabel}>DECISION REQUIRED</Text>
          </Section>

          {/* Question */}
          <Section style={questionSection}>
            <Text style={questionLabel}>Question</Text>
            <Text style={questionText}>{question}</Text>
          </Section>

          {/* Context */}
          {context && (
            <Section style={contextSection}>
              <Text style={sectionLabel}>Context</Text>
              <Text style={contextText}>{context}</Text>
            </Section>
          )}

          <Hr style={divider} />

          {/* Option buttons */}
          <Section style={optionsSection}>
            <Text style={sectionLabel}>Choose your answer</Text>
            {options.map((opt, i) => (
              <Button
                key={opt.key}
                href={`${APP_URL}/api/v1/decisions/decide/${opt.token}`}
                style={{ ...optionButton, backgroundColor: OPTION_COLORS[i % OPTION_COLORS.length] }}
              >
                {opt.label}
              </Button>
            ))}
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This decision link expires on {expiryDate}. Each button can only be used once.
          </Text>
          <Text style={footerBrand}>Sent by Shonin · decisions@shonin.dev</Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0',
  borderRadius: '8px',
  maxWidth: '560px',
  border: '1px solid #e6ebf1',
  overflow: 'hidden',
};

const header: React.CSSProperties = {
  backgroundColor: '#1e3a5f',
  padding: '16px 24px',
  margin: '0',
};

const headerLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '700',
  color: '#93c5fd',
  margin: '0',
  letterSpacing: '0.05em',
};

const questionSection: React.CSSProperties = {
  padding: '24px 24px 0',
};

const questionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 6px',
};

const questionText: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 20px',
  lineHeight: '1.4',
};

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 10px',
};

const contextSection: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '14px 16px',
  margin: '0 24px 16px',
};

const contextText: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.5',
};

const optionsSection: React.CSSProperties = {
  padding: '0 24px 20px',
};

const optionButton: React.CSSProperties = {
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '10px',
  textAlign: 'center',
};

const divider: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '0 24px 20px',
};

const footer: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 24px 8px',
};

const footerBrand: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 24px 24px',
};
