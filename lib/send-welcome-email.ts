import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

interface SendWelcomeEmailParams {
  to: string;
  name: string;
  apiKey: string;
}

export async function sendWelcomeEmail({ to, name, apiKey }: SendWelcomeEmailParams) {
  return resend.emails.send({
    from: 'hello@shonin.dev',
    to,
    subject: 'Your Shonin API key',
    react: WelcomeEmail({
      name,
      apiKey,
      dashboardUrl: `${APP_URL}/dashboard`,
      docsUrl: `${APP_URL}/docs`,
    }),
  });
}
