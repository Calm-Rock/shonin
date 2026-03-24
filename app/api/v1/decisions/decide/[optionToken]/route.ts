import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function htmlPage(title: string, emoji: string, message: string, color: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} · Shonin</title>
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
    h1 { font-size: 24px; font-weight: 700; color: ${escapeHtml(color)}; margin-bottom: 12px; }
    p { font-size: 15px; color: #6b7280; line-height: 1.6; }
    .brand { margin-top: 32px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">${emoji}</div>
    <h1>${escapeHtml(title)}</h1>
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

type DecisionOption = { key: string; label: string; token: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ optionToken: string }> }
) {
  const { optionToken } = await params;

  // Find a decision whose options JSONB array contains an element with this token
  const { data: decision, error: fetchError } = await supabaseAdmin
    .from('decisions')
    .select('*')
    .filter('options', 'cs', JSON.stringify([{ token: optionToken }]))
    .maybeSingle();

  if (fetchError) {
    console.error('Supabase fetch error:', fetchError);
    return htmlPage(
      'Something Went Wrong',
      '⚠️',
      'We could not record your answer. Please try again.',
      '#dc2626'
    );
  }

  if (!decision) {
    return htmlPage(
      'Invalid Link',
      '❌',
      'This decision link is invalid or does not exist.',
      '#dc2626'
    );
  }

  if (decision.token_used) {
    const chosenKey = decision.chosen_key as string | null;
    return htmlPage(
      'Already Answered',
      '✅',
      `This question has already been answered${chosenKey ? ` — you chose "${escapeHtml(chosenKey)}"` : ''}. No further action needed.`,
      '#16a34a'
    );
  }

  if (new Date(decision.expires_at as string) < new Date()) {
    return htmlPage(
      'Link Expired',
      '⏰',
      'This decision link has expired and can no longer be used.',
      '#d97706'
    );
  }

  // Find the matching option
  const options = (decision.options as DecisionOption[]) ?? [];
  const chosen = options.find((o) => o.token === optionToken);

  if (!chosen) {
    return htmlPage('Invalid Link', '❌', 'This decision link is invalid or does not exist.', '#dc2626');
  }

  const now = new Date().toISOString();

  // Atomic update: only succeeds if token_used is still false (prevents double-record)
  const { data: updated, error } = await supabaseAdmin
    .from('decisions')
    .update({ status: 'decided', chosen_key: chosen.key, decided_at: now, token_used: true })
    .eq('id', decision.id as string)
    .eq('token_used', false)
    .select('id');

  if (error) {
    console.error('Supabase update error:', error);
    return htmlPage(
      'Something Went Wrong',
      '⚠️',
      'We could not record your answer. Please try again.',
      '#dc2626'
    );
  }

  if (!updated || updated.length === 0) {
    // Race condition: another request got there first
    return new NextResponse(null, { status: 410 });
  }

  // Fire webhook if present
  if (decision.webhook_url) {
    try {
      await fetch(decision.webhook_url as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: decision.id,
          status: 'decided',
          chosen_key: chosen.key,
          decided_at: now,
        }),
      });
    } catch (webhookErr) {
      console.error('Webhook error:', webhookErr);
    }
  }

  return htmlPage(
    `Answered: ${chosen.label}`,
    '✅',
    `You chose <strong>${escapeHtml(chosen.label)}</strong>. Your answer has been recorded. You can close this tab.`,
    '#16a34a'
  );
}
