<p align="center">
  <img src="public/logo.png" alt="Shonin logo" width="96" />
</p>

<h1 align="center">Shonin</h1>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://resend.com"><img src="https://img.shields.io/badge/Resend-000000?style=for-the-badge&logo=resend&logoColor=white" alt="Resend" /></a>
</p>

**Human-in-the-loop approval API for AI agents and automations.**

Add a human checkpoint to any automation or AI agent with one API call. Shonin emails the approver an Approve and Reject choice, and you get the decision back by polling or by webhook. Approvers need no account.

Try the hosted demo at **[shonin.dev](https://shonin.dev)**, or self-host it (see below).

---

## How it works

1. **Call the API.** POST to `/api/v1/approvals` with an action and the approver's email.
2. **Email is sent.** The approver gets a clear email with a risk summary and Approve / Reject buttons.
3. **Poll or webhook.** Check the status with GET, or receive the decision at your webhook URL.

```typescript
const res = await fetch("https://shonin.dev/api/v1/approvals", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    action: "Transfer $4,200 to vendor account ending in 9021",
    approver_email: "finance@yourcompany.com",
    context: "Quarterly software license renewal, invoice #INV-2024-441",
    webhook_url: "https://yourapp.com/webhooks/shonin",
  }),
});

const { id } = await res.json();

const approval = await fetch(`https://shonin.dev/api/v1/approvals/${id}`, {
  headers: { Authorization: "Bearer YOUR_API_KEY" },
}).then((r) => r.json());

console.log(approval.status); // "pending" | "approved" | "rejected"
```

The API never returns the approve or reject tokens, so the agent that asks for approval cannot approve its own request. Only the person who receives the email can decide. Opening a link in an email never decides anything either: it leads to a confirm page, and the decision is a POST from that page.

---

## API reference

Base URL: `https://shonin.dev/api/v1`

Every endpoint except the email links needs a Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

### POST /approvals

Create an approval request and send the email.

| Field | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | What needs approval |
| `approver_email` | string | Yes | Who receives the email |
| `context` | string | No | Extra context shown in the email |
| `webhook_url` | string | No | Public https URL that receives the decision |
| `expires_in_hours` | number | No | Link expiry, default 24 |
| `command_type` | string | No | For example `git_push_force`, `rm`, `sql_drop`. Inferred from `action` if omitted |
| `files` | array | No | `[{ "path": "...", "status": "modified" \| "added" \| "deleted" \| "renamed" }]` |
| `diff` | string | No | A diff to show the approver, truncated at 50KB |

Response `201`:

```json
{
  "id": "uuid",
  "status": "pending",
  "created_at": "2026-01-01T00:00:00Z",
  "expires_at": "2026-01-02T00:00:00Z",
  "usage": { "unlimited": true }
}
```

### GET /approvals/:id

Returns `id`, `action`, `context`, `approver_email`, `status`, `webhook_url`, `expires_at`, `decided_at`, `created_at`, `command_type`, `files`, `diff`, `risk_level` and `risk_bullets`. You can only read approvals created with your own key.

### POST /decisions

Ask a multiple-choice question instead of a yes or no.

| Field | Type | Required | Description |
|---|---|---|---|
| `question` | string | Yes | The question |
| `options` | array | Yes | 2 to 10 items: `{ "key": "a", "label": "Ship it" }` |
| `respondent_email` | string | Yes | Who receives the email |
| `context` | string | No | Extra context |
| `webhook_url` | string | No | Public https URL that receives the answer |
| `expires_in_hours` | number | No | Default 24 |

Response `201`: `id`, `status`, `created_at`, `expires_at`.

### GET /decisions/:id

Returns `id`, `status` (`pending` or `decided`), `chosen_key`, `decided_at`, `expires_at` and `created_at`.

### Webhooks

When set, the server POSTs JSON to `webhook_url` once the decision is made:

```json
{ "id": "uuid", "status": "approved", "decided_at": "2026-01-01T10:23:00Z" }
```

For decisions the payload is `{ "id", "status": "decided", "chosen_key", "decided_at" }`.

Webhook URLs must be public `https` URLs. The server refuses private and reserved addresses, does not follow redirects, and gives up after 5 seconds.

### Errors

| Status | Meaning |
|---|---|
| 400 | Validation error in the request body, or a webhook URL that is not allowed |
| 401 | Missing or invalid API key |
| 403 | Demo only: the recipient is not your account email |
| 404 | Not found, or not yours |
| 429 | Demo only: daily request limit reached |
| 503 | Demo only: the shared email budget for today is used up |

---

## Self-hosting

You need Node.js 20+, a [Supabase](https://supabase.com) project and a [Resend](https://resend.com) account with a verified domain.

1. Clone and install:

```bash
git clone https://github.com/Calm-Rock/shonin.git
cd shonin
npm install
```

2. Copy the environment file and fill it in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your Resend API key |
| `EMAIL_FROM_DOMAIN` | Your verified Resend domain. Emails go out as `approvals@`, `decisions@`, `login@` and `hello@` that domain |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The project's public (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | The service-role key. Keep it secret; it is only used on the server |
| `NEXT_PUBLIC_APP_URL` | Where the app is served, for example `http://localhost:3000` |
| `DEMO_MODE` | Leave empty. Set to `true` only for a public demo: it caps each key at 2 requests per day, limits recipients to the key owner, and applies shared daily email budgets |
| `ALLOW_PRIVATE_WEBHOOKS` | Set to `true` to allow `http` and private-network webhooks, for example behind a firewall |

3. Create the database: open the Supabase SQL editor and run `supabase/schema.sql`. It creates every table and turns on row-level security.

4. Set up login: in Supabase go to Authentication, URL Configuration, set the Site URL to your `NEXT_PUBLIC_APP_URL` and add `<your app URL>/**` as a redirect URL.

5. Create your first API key in the SQL editor:

```sql
insert into api_keys (key, name, email)
values ('sk_live_' || encode(gen_random_bytes(18), 'hex'), 'my key', 'you@example.com')
returning key;
```

6. Start the app:

```bash
npm run dev
```

Run the tests with `npm test`.

---

## License

[MIT](LICENSE)
