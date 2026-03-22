# TODOS

Tracked deferred work. Ordered by priority.

---

## P2 — Post-enriched-email launch

### Approval accuracy / outcome tracking
**What:** Add an `outcome` field to approvals. After an action is approved, the user can mark it "incident" or "no-issue." Show aggregate stats in the dashboard: "You've approved 47 actions. 2 were later marked as incidents."
**Why:** Rubber-stamping is partly a stakes problem, not just an information problem. Accuracy tracking makes the human accountable over time — not just informed in the moment.
**Pros:** Creates a feedback loop. Makes approval history meaningful. Unlocks a compelling dashboard story.
**Cons:** Requires manual input (no automated incident detection). Friction. Only useful after many approvals.
**Context:** The Thoughtful Review Layer (enriched email) is the prerequisite — ship that first, prove the email is read, then add accountability tracking.
**Effort:** S (human: 1 day / CC: ~10 min)
**Depends on:** Thoughtful Review Layer shipped

---

### Per-tier rate limits
**What:** Make the daily approval limit configurable per account tier (e.g., free=50, pro=unlimited, enterprise=configurable). Currently hardcoded as `DAILY_LIMIT = 50` in the approvals route.
**Why:** The `unlimited` flag on api_keys already handles the test key case. Per-tier limits unlock a monetization path: charge for higher limits.
**Pros:** Clean monetization lever. Low implementation effort (one config lookup per request).
**Cons:** Requires a "tier" concept on accounts/api_keys that doesn't exist yet.
**Context:** One user right now. No paying customers. `unlimited` flag covers testing. Add tiers when the first customer needs them.
**Effort:** S (human: 4h / CC: ~5 min)
**Depends on:** First paying customer

---

### Integration tests for Thoughtful Review Layer
**What:** Integration tests covering: POST /v1/approvals enrichment path (classification stored correctly), confirm page flow (token_used atomic guard), detail page auth scoping (user can't read other users' approvals).
**Why:** Unit tests cover `lib/risk.ts` but the confirm page countdown, double-approval prevention, and detail page access control are untested until manually verified.
**Pros:** Catches regressions in the approval flow. First integration tests establish the pattern for future features.
**Cons:** Requires Supabase local dev or test database setup — non-trivial to scaffold from zero.
**Context:** Unit tests for `lib/risk.ts` are added in the Thoughtful Review Layer PR. Integration tests deferred pending test environment setup.
**Effort:** M (human: 1 day / CC: ~20 min)
**Depends on:** Thoughtful Review Layer shipped; Supabase local dev configured

---

### Create DESIGN.md design system
**What:** Capture the design tokens defined during the Thoughtful Review Layer design review into a `DESIGN.md` file: risk level color tokens (DESTRUCTIVE/HIGH/LOW in both email and dashboard contexts), file status dot colors, code block treatment, typography scale, and component pattern vocabulary.
**Why:** Without DESIGN.md, every future design review must infer the system from code. With it, reviewers have a ground truth to compare against — and new components stay consistent without guesswork.
**Pros:** Makes future design reviews 8x faster. Single source of truth for color tokens. Prevents future divergence (e.g., a new HIGH-severity UI using orange instead of amber).
**Cons:** Minor overhead to maintain as the design evolves.
**Context:** From the Thoughtful Review Layer design review (2026-03-23). Key tokens: email DESTRUCTIVE `bg=#fef2f2 border=#fecaca text=#b91c1c`; HIGH `bg=#fffbeb border=#fde68a text=#b45309`; LOW `bg=#f0fdf4 border=#bbf7d0 text=#15803d`. Dashboard dark variants also defined. File dots: MODIFIED=#facc15, ADDED=#4ade80, DELETED=#f87171, RENAMED=#60a5fa. See CEO plan for full spec.
**Effort:** XS (human: 1h / CC: ~5 min)
**Depends on:** Thoughtful Review Layer shipped (so tokens are proven in production)

---

## P3 — Code hygiene (from system audit)

### Remove orphaned /api/v1/signup route
**What:** `app/api/v1/signup/route.ts` is no longer called by the signup page (which now uses Supabase magic link directly). The route still accepts POST requests and will respond to bots/crawlers.
**Why:** Dead code creates confusion and a potential unintended attack surface.
**Pros:** Cleaner codebase. No risk of bot signups via old route.
**Cons:** None — it's truly orphaned.
**Context:** The new magic link signup flow (`/signup/page.tsx`) calls `supabase.auth.signInWithOtp` directly. The old route was used by the previous signup form.
**Effort:** XS (human: 30 min / CC: ~2 min)
**Depends on:** Nothing

---

### Fix key rotation: old approvals should stay linked after rotation
**What:** When a user rotates their API key, the `rotateKey` server action generates a new `sk_live_*` key. Approvals are fetched by `account_id` (the key string). After rotation, old approvals no longer appear in the dashboard.
**Why:** The approval history is the product's audit trail. Losing it on key rotation is a data integrity issue.
**Pros:** Preserves audit trail through key rotation.
**Cons:** Requires either linking approvals to `user_id` instead of `account_id`, or maintaining a key history table.
**Context:** `account_id` is the raw API key string. `user_id` column was added in migration 004 to api_keys. Approvals still use `account_id` (string). Migration to `user_id` requires: add `user_id` to approvals table, backfill, change fetch queries.
**Effort:** M (human: half-day / CC: ~15 min)
**Depends on:** Nothing blocking, but low urgency while there's one user
