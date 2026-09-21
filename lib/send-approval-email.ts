import { Resend } from 'resend';
import { ApprovalEmail } from '@/emails/ApprovalEmail';
import { fromAddress } from '@/lib/email-from';
import type { FileChange, RiskLevel } from '@/lib/risk';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export interface SendApprovalEmailParams {
  to: string;
  action: string;
  context?: string;
  approveToken: string;
  rejectToken: string;
  expiresAt: string;
  approvalId?: string;
  commandType?: string;
  riskLevel?: RiskLevel;
  riskBullets?: string[];
  files?: FileChange[];
  diff?: string;
}

function emailSubject(riskLevel: RiskLevel | undefined, action: string): string {
  if (riskLevel === 'DESTRUCTIVE') return `⚠️ DESTRUCTIVE — ${action}`;
  if (riskLevel === 'HIGH') return `Review required: ${action}`;
  return `Action required: ${action}`;
}

export async function sendApprovalEmail({
  to,
  action,
  context,
  approveToken,
  rejectToken,
  expiresAt,
  approvalId,
  commandType: _commandType,
  riskLevel,
  riskBullets,
  files,
  diff,
}: SendApprovalEmailParams) {
  const approveUrl = `${APP_URL}/approve/confirm?token=${approveToken}`;
  const rejectUrl = `${APP_URL}/api/v1/decide/${rejectToken}`;

  return resend.emails.send({
    from: fromAddress('approvals'),
    to,
    subject: emailSubject(riskLevel, action),
    react: ApprovalEmail({
      action,
      context,
      approveUrl,
      rejectUrl,
      expiresAt,
      approvalId,
      appUrl: APP_URL,
      riskLevel,
      riskBullets,
      files,
      diff,
    }),
  });
}
