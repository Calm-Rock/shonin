import { Resend } from 'resend';
import { fromAddress } from '@/lib/email-from';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginEmail({ to, loginUrl }: { to: string; loginUrl: string }) {
  return resend.emails.send({
    from: fromAddress('login'),
    to,
    subject: 'Your Shonin login link',
    html: `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
  <h2 style="margin:0 0 12px">Sign in to Shonin</h2>
  <p style="margin:0 0 20px;color:#444">Click the button to log in. The link works once and expires in an hour.</p>
  <a href="${loginUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600">Log in</a>
  <p style="margin:20px 0 0;color:#888;font-size:12px">If you didn't ask for this, you can ignore this email.</p>
</div>`,
  });
}
