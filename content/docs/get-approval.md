---
title: Get Approval
order: 5
badge: GET
endpoint: /v1/approvals/:id
description: Read the current state of an approval, for polling.
---
Returns the current state of an approval. Use this to poll for a decision if you are not using webhooks. Only approvals belonging to the authenticated account are returned.

## Example request

```bash
curl https://shonin.dev/api/v1/approvals/a1b2c3d4 \
  -H "Authorization: Bearer sk_your_api_key"
```

## Example response

Status `200 OK`:

```json
{
  "id": "a1b2c3d4-...",
  "action": "git push origin main --force",
  "context": "Remote diverged after a rebase",
  "approver_email": "cto@company.com",
  "status": "approved",
  "webhook_url": null,
  "command_type": "git_push_force",
  "risk_level": "DESTRUCTIVE",
  "risk_bullets": [
    "Will overwrite upstream commits",
    "Bypasses branch protection rules"
  ],
  "files": [{ "path": "app/route.ts", "status": "modified" }],
  "expires_at": "2026-03-22T18:00:00Z",
  "decided_at": "2026-03-21T18:45:00Z",
  "created_at": "2026-03-21T18:00:00Z"
}
```
