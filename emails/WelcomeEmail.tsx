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

interface WelcomeEmailProps {
  name: string;
  apiKey: string;
  dashboardUrl: string;
  docsUrl: string;
}

export function WelcomeEmail({ name, apiKey, dashboardUrl, docsUrl }: WelcomeEmailProps) {
  const firstName = name.split(' ')[0];

  return (
    <Html>
      <Head />
      <Preview>Your Shonin API key is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={logo}>shonin</Heading>

          <Text style={greeting}>Hey {firstName},</Text>
          <Text style={body}>
            Your API key is ready. Copy it now — for security reasons, we only send it once.
          </Text>

          {/* API Key block */}
          <Section style={keySection}>
            <Text style={keyLabel}>Your API Key</Text>
            <Text style={keyValue}>{apiKey}</Text>
          </Section>

          {/* Warning */}
          <Section style={warningSection}>
            <Text style={warningText}>
              ⚠️ Store this key safely. We won&apos;t show it again.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Quick start */}
          <Text style={sectionHeading}>Quick start</Text>
          <Text style={body}>Make your first approval request:</Text>
          <Section style={codeSection}>
            <Text style={codeText}>
              {`curl -X POST https://shonin.dev/api/v1/approvals \\`}
              {'\n'}
              {`  -H "Authorization: Bearer ${apiKey}" \\`}
              {'\n'}
              {`  -H "Content-Type: application/json" \\`}
              {'\n'}
              {`  -d '{"action":"My first approval","approver_email":"you@example.com"}'`}
            </Text>
          </Section>

          <Hr style={divider} />

          {/* CTAs */}
          <Section style={buttonRow}>
            <Button href={dashboardUrl} style={primaryButton}>
              View Dashboard
            </Button>
            <Button href={docsUrl} style={secondaryButton}>
              Read the Docs
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            You&apos;re receiving this because you signed up at shonin.dev.
            Questions? Reply to this email.
          </Text>
          <Text style={footerBrand}>Shonin · hello@shonin.dev</Text>
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

const logo: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 24px',
  letterSpacing: '-0.02em',
};

const greeting: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
};

const body: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 20px',
  lineHeight: '1.6',
};

const keySection: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '12px',
};

const keyLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 6px',
};

const keyValue: React.CSSProperties = {
  fontSize: '13px',
  fontFamily: '"SF Mono", "Fira Code", monospace',
  color: '#a3e635',
  margin: '0',
  wordBreak: 'break-all',
};

const warningSection: React.CSSProperties = {
  backgroundColor: '#fefce8',
  border: '1px solid #fde68a',
  borderRadius: '6px',
  padding: '10px 16px',
  marginBottom: '24px',
};

const warningText: React.CSSProperties = {
  fontSize: '13px',
  color: '#92400e',
  margin: '0',
};

const divider: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const sectionHeading: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 8px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const codeSection: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  borderRadius: '8px',
  padding: '16px 20px',
};

const codeText: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: '"SF Mono", "Fira Code", monospace',
  color: '#e5e7eb',
  margin: '0',
  whiteSpace: 'pre',
  lineHeight: '1.7',
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const primaryButton: React.CSSProperties = {
  backgroundColor: '#111827',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
  marginRight: '12px',
};

const secondaryButton: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  color: '#111827',
  padding: '12px 24px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 4px',
  lineHeight: '1.5',
};

const footerBrand: React.CSSProperties = {
  fontSize: '12px',
  color: '#d1d5db',
  margin: '0',
};
