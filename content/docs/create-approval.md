---
title: Create Approval
order: 4
badge: POST
endpoint: /v1/approvals
description: Create an approval request and email the approver Approve and Reject buttons.
---
Creates a new approval request and sends an email to the approver with Approve and Reject buttons. Returns immediately. The approval stays `pending` until the approver decides.

## Request body

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | `string` | required | A short description of what needs approval. Shown prominently in the email. |
| `approver_email` | `string` | required | The email address of the person who will approve or reject. |
| `context` | `string` | optional | Optional extra context displayed in the email below the action. |
| `webhook_url` | `string` | optional | Public https URL to POST the decision to when the approver clicks Approve or Reject. Private and reserved addresses are rejected with a 400. |
| `expires_in_hours` | `number` | optional | How many hours before the approval link expires. Defaults to 24. |
| `command_type` | `string` | optional | What kind of action this is, for example `git_push_force` or `sql_drop`. Drives the risk banner in the email. Inferred from `action` when omitted. See [Risk Levels](#risk-levels). |
| `files` | `array` | optional | Files the action touches, for example `[{ "path": "app/route.ts", "status": "modified" }]`. Status is `modified`, `added`, `deleted` or `renamed`. |
| `diff` | `string` | optional | A diff to show the approver. Truncated at 50KB. |

## Example request

```bash
curl -X POST https://shonin.dev/api/v1/approvals \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "Deploy to production",
    "approver_email": "cto@company.com",
    "context": "PR #247 merged, 3 files changed",
    "webhook_url": "https://yourapp.com/webhooks/shonin"
  }'
```

## Example response

Status `201 Created`:

```json
{
  "id": "a1b2c3d4-...",
  "status": "pending",
  "created_at": "2026-03-21T18:00:00Z",
  "expires_at": "2026-03-22T18:00:00Z"
}
```
