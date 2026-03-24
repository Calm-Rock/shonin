import { Resend } from 'resend';
import { DecisionEmail } from '@/emails/DecisionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export interface DecisionOption {
  key: string;
  label: string;
  token: string;
}

export interface SendDecisionEmailParams {
  to: string;
  question: string;
  context?: string;
  options: DecisionOption[];
  expiresAt: string;
  decisionId?: string;
}

export async function sendDecisionEmail({
  to,
  question,
  context,
  options,
  expiresAt,
  decisionId,
}: SendDecisionEmailParams) {
  return resend.emails.send({
    from: 'decisions@shonin.dev',
    to,
    subject: `Decision required: ${question}`,
    react: DecisionEmail({
      question,
      context,
      options,
      expiresAt,
      decisionId,
      appUrl: APP_URL,
    }),
  });
}
