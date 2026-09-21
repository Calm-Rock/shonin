// The hosted demo caps usage (per-key daily limit, recipient locked to the key owner, shared email budgets).
// Self-hosted instances leave DEMO_MODE unset and run without those limits.
export const isDemoMode = () => process.env.DEMO_MODE === 'true';
