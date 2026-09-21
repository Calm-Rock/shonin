---
title: Webhooks
order: 9
description: The JSON payloads Shonin sends when a decision is recorded, and the rules for webhook URLs.
---
Set `webhook_url` on an approval or a decision and Shonin sends a POST with a JSON body once the decision is recorded.

## Approval payload

```json
{
  "id": "a1b2c3d4-...",
  "status": "approved",
  "decided_at": "2026-03-21T18:45:00Z"
}
```

## Decision payload

```json
{
  "id": "e5f6a7b8-...",
  "status": "decided",
  "chosen_key": "prod",
  "decided_at": "2026-03-21T18:45:00Z"
}
```

## Rules

- The URL must be a public https address. Private and reserved addresses are rejected with a 400 when you create the request.
- Shonin waits 5 seconds for a response, does not follow redirects, and sends each webhook once with no retries.

> [!WARNING]
> Webhook payloads are not signed. Treat one as a signal and confirm the result with a GET request before you act on it.
