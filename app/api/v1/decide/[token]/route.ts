import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function htmlPage(title: string, emoji: string, message: string, color: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Shonin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f6f9fc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border: 1px solid #e6ebf1;
      border-radius: 12px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .emoji { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; color: ${color}; margin-bottom: 12px; }
    p { font-size: 15px; color: #6b7280; line-height: 1.6; }
    .brand { margin-top: 32px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p class="brand">Powered by Shonin</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // Find approval by approve_token or reject_token
  const { data: byApprove } = await supabaseAdmin
    .from('approvals')
    .select('*')
    .eq('approve_token', token)
    .maybeSingle();

  const { data: byReject } = byApprove
    ? { data: null }
    : await supabaseAdmin
        .from('approvals')
        .select('*')
        .eq('reject_token', token)
        .maybeSingle();

  const approval = byApprove ?? byReject;
  const decision: 'approved' | 'rejected' = byApprove ? 'approved' : 'rejected';

  if (!approval) {
    return htmlPage(
      'Invalid Link',
      '❌',
      'This approval link is invalid or does not exist.',
      '#dc2626'
    );
  }

  if (approval.status !== 'pending') {
    const label = approval.status === 'approved' ? 'Approved' : 'Rejected';
    const emoji = approval.status === 'approved' ? '✅' : '🚫';
    const color = approval.status === 'approved' ? '#16a34a' : '#dc2626';
    return htmlPage(
      `Already ${label}`,
      emoji,
      `This request was already ${approval.status}. No further action is needed.`,
      color
    );
  }

  if (new Date(approval.expires_at) < new Date()) {
    return htmlPage(
      'Link Expired',
      '⏰',
      'This approval link has expired and can no longer be used.',
      '#d97706'
    );
  }

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('approvals')
    .update({ status: decision, decided_at: now })
    .eq('id', approval.id);

  if (error) {
    console.error('Supabase update error:', error);
    return htmlPage(
      'Something Went Wrong',
      '⚠️',
      'We could not record your decision. Please try again.',
      '#dc2626'
    );
  }

  // Fire webhook if present
  if (approval.webhook_url) {
    try {
      await fetch(approval.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approval.id, status: decision, decided_at: now }),
      });
    } catch (webhookErr) {
      console.error('Webhook error:', webhookErr);
    }
  }

  if (decision === 'approved') {
    return htmlPage(
      'Approved',
      '✅',
      `You approved: <strong>${approval.action}</strong>. The automation has been given the green light.`,
      '#16a34a'
    );
  } else {
    return htmlPage(
      'Rejected',
      '🚫',
      `You rejected: <strong>${approval.action}</strong>. The automation has been stopped.`,
      '#dc2626'
    );
  }
}
