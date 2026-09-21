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

// Login links go through Supabase's free built-in email first; only the overflow is sent via Resend, under these caps.
export const LOGIN_EMAIL_DAILY_LIMIT = 10;
export const LOGIN_EMAIL_PER_ADDRESS_DAILY_LIMIT = 2;

export type LoginEmailCheckInput = {
  loginSentToday: number;
  sentToAddressToday: number;
  sentTodayGlobal: number;
};

export function checkLoginEmailLimits(input: LoginEmailCheckInput): DemoCheck {
  if (input.sentToAddressToday >= LOGIN_EMAIL_PER_ADDRESS_DAILY_LIMIT) {
    return {
      ok: false,
      status: 429,
      error: 'A login link was already sent to this address twice today. Check your inbox and spam folder, or try again tomorrow.',
    };
  }

  if (input.loginSentToday >= LOGIN_EMAIL_DAILY_LIMIT) {
    return {
      ok: false,
      status: 503,
      error: "Today's login emails are used up. Try again tomorrow, or self-host shonin.",
    };
  }

  if (input.sentTodayGlobal >= GLOBAL_DAILY_EMAIL_BUDGET) {
    return { ok: false, status: 503, error: BUDGET_EXHAUSTED_MESSAGE };
  }

  return { ok: true };
}
