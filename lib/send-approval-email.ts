import { Resend } from 'resend';
import { ApprovalEmail } from '@/emails/ApprovalEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

interface SendApprovalEmailParams {
  to: string;
  action: string;
  context?: string;
  approveToken: string;
  rejectToken: string;
  expiresAt: string;
}

export async function sendApprovalEmail({
  to,
  action,
  context,
  approveToken,
  rejectToken,
  expiresAt,
}: SendApprovalEmailParams) {
  const approveUrl = `${APP_URL}/api/v1/decide/${approveToken}`;
  const rejectUrl = `${APP_URL}/api/v1/decide/${rejectToken}`;

  return resend.emails.send({
    from: 'approvals@shonin.dev',
    to,
    subject: `Action required: ${action}`,
    react: ApprovalEmail({ action, context, approveUrl, rejectUrl, expiresAt }),
  });
}
