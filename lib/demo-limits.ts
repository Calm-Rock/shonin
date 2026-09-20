export const PER_KEY_DAILY_LIMIT = 2;

// Resend's free plan allows 100 emails/day for the whole account; half is reserved for other projects.
export const GLOBAL_DAILY_EMAIL_BUDGET = 50;

export const BUDGET_EXHAUSTED_MESSAGE =
  'The demo has used its shared email budget for today. Try again tomorrow, or self-host shonin.';

export type DemoCheckInput = {
  keyEmail: string | null;
  recipientEmail: string;
  usedByKeyToday: number;
  sentTodayGlobal: number;
};

export type DemoCheck = { ok: true } | { ok: false; status: number; error: string };

export function checkDemoLimits(input: DemoCheckInput): DemoCheck {
  const keyEmail = input.keyEmail?.trim().toLowerCase();
  if (!keyEmail || keyEmail !== input.recipientEmail.trim().toLowerCase()) {
    return {
      ok: false,
      status: 403,
      error: 'On the free demo you can only send requests to your own account email. Self-host shonin to send to anyone.',
    };
  }

  if (input.usedByKeyToday >= PER_KEY_DAILY_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: `Daily limit reached. The free demo allows ${PER_KEY_DAILY_LIMIT} requests per day. Self-host shonin for no limits.`,
    };
  }

  if (input.sentTodayGlobal >= GLOBAL_DAILY_EMAIL_BUDGET) {
    return { ok: false, status: 503, error: BUDGET_EXHAUSTED_MESSAGE };
  }

  return { ok: true };
}
