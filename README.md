# Shonin

**Human-in-the-loop approval API for AI agents and automations.**

Shonin lets you add human checkpoints to any automation or AI agent with a single API call. Send an approval request to any email address — the approver clicks a button, you get a decision. No account required for approvers.

---

## How It Works

1. **Call the API** — POST to `/api/v1/approvals` with an action description and approver email
2. **Email is sent** — Approver receives a clean email with Approve / Reject buttons
3. **Poll or webhook** — Check status via GET, or receive the decision at your webhook URL

```typescript
// Request approval
const res = await fetch("https://shonin.dev/api/v1/approvals", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    action: "Transfer $4,200 to vendor account ending in 9021",
    approver_email: "finance@yourcompany.com",
    context: "Quarterly software license renewal — see invoice #INV-2024-441",
    webhook_url: "https://yourapp.com/webhooks/shonin",
  }),
});

const { id } = await res.json();

// Poll for decision
const status = await fetch(`https://shonin.dev/api/v1/approvals/${id}`, {
  headers: { Authorization: "Bearer YOUR_API_KEY" },
}).then((r) => r.json());

console.log(status.status); // "pending" | "approved" | "rejected"
```

---

## API Reference

Base URL: `https://shonin.dev/api/v1`

All endpoints (except `GET /decide/:token`) require a Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

### POST /approvals

Create an approval request and send the email.

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Description of what needs approval |
| `approver_email` | string | Yes | Who receives the approval email |
| `context` | string | No | Extra context shown in the email |
| `webhook_url` | string | No | URL to POST decision to when resolved |
| `expires_in_hours` | number | No | Link expiry window (default: 24) |

**Response (201):**

```json
{
  "id": "uuid",
  "status": "pending",
  "approve_token": "...",
  "reject_token": "...",
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-01-02T00:00:00Z"
}
```

### GET /approvals/:id

Get the current status of an approval.

**Response (200):**

```json
{
  "id": "uuid",
  "action": "Transfer $4,200...",
  "approver_email": "finance@yourcompany.com",
  "status": "approved",
  "decided_at": "2024-01-01T10:23:00Z",
  "expires_at": "2024-01-02T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /decide/:token

Public endpoint — no auth required. Called when an approver clicks Approve or Reject in their email. Returns an HTML confirmation page.

**Webhook payload** (if `webhook_url` was set):

```json
{
  "id": "uuid",
  "status": "approved",
  "action": "Transfer $4,200...",
  "decided_at": "2024-01-01T10:23:00Z"
}
```

**Error codes:**

| Status | Meaning |
|---|---|
| 401 | Missing or invalid API key |
| 400 | Validation error in request body |
| 404 | Approval not found |
| 409 | Decision already recorded |
| 410 | Approval link has expired |

Full interactive docs at [shonin.dev/docs](https://shonin.dev/docs).

---

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Email:** Resend + React Email templates
- **Validation:** Zod
- **Styling:** Tailwind CSS v4

---

## Self-Hosting

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/Calm-Rock/shonin.git
cd shonin
npm install
```

2. Copy the environment file and fill in your values:

```bash
cp .env.example .env.local
```

```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the database schema:

In the Supabase dashboard, open the SQL editor and run `supabase/schema.sql`.

4. Insert an API key (run in Supabase SQL editor):

```sql
INSERT INTO api_keys (key, name) VALUES ('shonin_test_yourkey', 'My key');
```

5. Start the dev server:

```bash
npm run dev
```

App is available at `http://localhost:3000`.

### Database Schema

```sql
-- approvals: one row per approval request
create table approvals (
  id              uuid primary key default gen_random_uuid(),
  account_id      text not null,          -- maps to api_keys.key
  action          text not null,
  context         text,
  approver_email  text not null,
  status          text not null default 'pending',
  approve_token   text unique not null,
  reject_token    text unique not null,
  webhook_url     text,
  expires_at      timestamptz not null,
  decided_at      timestamptz,
  created_at      timestamptz not null default now()
);

-- api_keys: simple key store
create table api_keys (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  name       text,
  created_at timestamptz not null default now()
);
```

---

## Dashboard

View your approval history at `/dashboard?key=YOUR_API_KEY`. Shows status badges (pending / approved / rejected), timestamps, and approver emails for all requests associated with your key.

---

## Pricing

| Plan | Price | Approvals/month |
|---|---|---|
| Free | $0 | 50 |
| Pro | $29/mo | 2,000 |
| Team | $99/mo | Unlimited |

Currently in beta — all features available on the free tier.

---

## License

MIT
