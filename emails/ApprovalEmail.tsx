import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ApprovalEmailProps {
  action: string;
  context?: string;
  approveUrl: string;
  rejectUrl: string;
  expiresAt: string;
}

export function ApprovalEmail({
  action,
  context,
  approveUrl,
  rejectUrl,
  expiresAt,
}: ApprovalEmailProps) {
  const expiryDate = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>Action required: {action}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Action Required</Heading>
          <Text style={actionText}>{action}</Text>

          {context && (
            <Section style={contextSection}>
              <Text style={contextLabel}>Context</Text>
              <Text style={contextText}>{context}</Text>
            </Section>
          )}

          <Hr style={divider} />

          <Section style={buttonSection}>
            <Button href={approveUrl} style={approveButton}>
              Approve
            </Button>
            <Button href={rejectUrl} style={rejectButton}>
              Reject
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This approval link expires on {expiryDate}. Each button can only be
            clicked once.
          </Text>
          <Text style={footerBrand}>Sent by Shonin · approvals@shonin.dev</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '560px',
  border: '1px solid #e6ebf1',
};

const heading: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 16px',
};

const actionText: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 24px',
  lineHeight: '1.3',
};

const contextSection: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
};

const contextLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 6px',
};

const contextText: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  whiteSpace: 'pre-wrap',
};

const divider: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const buttonSection: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const approveButton: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
  marginRight: '12px',
};

const rejectButton: React.CSSProperties = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
};

const footer: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const footerBrand: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};
