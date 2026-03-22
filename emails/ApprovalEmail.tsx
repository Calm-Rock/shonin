import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { parseDiffPreview } from '@/lib/risk';
import type { FileChange, RiskLevel } from '@/lib/risk';

interface ApprovalEmailProps {
  action: string;
  context?: string;
  approveUrl: string;
  rejectUrl: string;
  expiresAt: string;
  approvalId?: string;
  appUrl?: string;
  // enrichment
  riskLevel?: RiskLevel;
  riskBullets?: string[];
  files?: FileChange[];
  diff?: string;
}

const RISK_STYLES: Record<RiskLevel, { bg: string; border: string; color: string; label: string }> = {
  DESTRUCTIVE: {
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#b91c1c',
    label: 'DESTRUCTIVE · This action cannot be undone',
  },
  HIGH: {
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#b45309',
    label: 'HIGH RISK · Review carefully before approving',
  },
  LOW: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    color: '#15803d',
    label: 'LOW RISK · Reversible action',
  },
};

const FILE_STATUS_COLORS: Record<string, string> = {
  modified: '#b45309',
  added: '#15803d',
  deleted: '#b91c1c',
  renamed: '#1d4ed8',
};

const FILE_STATUS_LABELS: Record<string, string> = {
  modified: 'MODIFIED',
  added: 'NEW',
  deleted: 'DELETED',
  renamed: 'RENAMED',
};

export function ApprovalEmail({
  action,
  context,
  approveUrl,
  rejectUrl,
  expiresAt,
  approvalId,
  appUrl,
  riskLevel = 'LOW',
  riskBullets = [],
  files,
  diff,
}: ApprovalEmailProps) {
  const risk = RISK_STYLES[riskLevel] ?? RISK_STYLES.LOW;

  const expiryDate = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const diffPreview = diff ? parseDiffPreview(diff) : null;
  const detailUrl = approvalId && appUrl ? `${appUrl}/dashboard/approvals/${approvalId}` : null;

  return (
    <Html>
      <Head />
      <Preview>{action}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Risk banner */}
          <Section style={{ ...riskBanner, backgroundColor: risk.bg, borderColor: risk.border }}>
            <Text style={{ ...riskLabel, color: risk.color }}>{risk.label}</Text>
            {riskBullets.length > 0 && (
              <ul style={bulletList}>
                {riskBullets.map((bullet) => (
                  <li key={bullet} style={{ ...bulletItem, color: risk.color }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Action command */}
          <Section style={commandSection}>
            <Text style={commandLabel}>Command</Text>
            <Text style={commandText}>{action}</Text>
          </Section>

          {/* Why Claude wants this */}
          {context && (
            <Section style={contextSection}>
              <Text style={sectionLabel}>Why Claude wants this</Text>
              <Text style={contextText}>{context}</Text>
            </Section>
          )}

          {/* File manifest */}
          {files && files.length > 0 && (
            <Section style={filesSection}>
              <Text style={sectionLabel}>Files ({files.length})</Text>
              {files.map((f) => (
                <Section key={f.path} style={fileRow}>
                  <Text style={fileName}>{f.path}</Text>
                  <Text style={{ ...fileStatus, color: FILE_STATUS_COLORS[f.status] ?? '#666' }}>
                    {FILE_STATUS_LABELS[f.status] ?? f.status.toUpperCase()}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {/* Diff preview */}
          {diffPreview && (
            <Section style={diffSection}>
              <Text style={sectionLabel}>
                Diff preview
                {diffPreview.hasMore && detailUrl && (
                  <>
                    {' '}
                    —{' '}
                    <Link href={detailUrl} style={viewFullLink}>
                      View full diff →
                    </Link>
                  </>
                )}
              </Text>
              <Text style={diffText}>{diffPreview.preview}</Text>
            </Section>
          )}

          <Hr style={divider} />

          {/* Buttons */}
          <Section style={buttonSection}>
            <Button href={approveUrl} style={approveButton}>
              Approve
            </Button>
            <Link href={rejectUrl} style={rejectLink}>
              Reject
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This approval link expires on {expiryDate}. Each button can only be used once.
          </Text>
          <Text style={footerBrand}>Sent by Shonin · approvals@shonin.dev</Text>
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

const riskBanner: React.CSSProperties = {
  padding: '16px 24px',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  margin: '0',
};

const riskLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '0.01em',
};

const bulletList: React.CSSProperties = {
  margin: '6px 0 0',
  paddingLeft: '16px',
};

const bulletItem: React.CSSProperties = {
  fontSize: '12px',
  margin: '2px 0',
};

const commandSection: React.CSSProperties = {
  padding: '24px 24px 0',
};

const commandLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 6px',
};

const commandText: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 20px',
  lineHeight: '1.3',
};

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 8px',
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

const filesSection: React.CSSProperties = {
  padding: '0 24px 16px',
};

const fileRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
};

const fileName: React.CSSProperties = {
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#374151',
  margin: '0',
  flex: '1',
};

const fileStatus: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '0.05em',
  margin: '0',
};

const diffSection: React.CSSProperties = {
  padding: '0 24px 16px',
};

const diffText: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#e5e7eb',
  fontFamily: 'monospace',
  fontSize: '11px',
  lineHeight: '1.6',
  padding: '12px 14px',
  borderRadius: '6px',
  whiteSpace: 'pre',
  overflow: 'hidden',
  margin: '0',
};

const viewFullLink: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '11px',
  textDecoration: 'underline',
};

const divider: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '0 24px 20px',
};

const buttonSection: React.CSSProperties = {
  padding: '0 24px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const approveButton: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
  marginRight: '12px',
};

const rejectLink: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'underline',
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
