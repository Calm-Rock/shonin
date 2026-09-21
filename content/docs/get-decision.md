---
title: Get Decision
order: 8
badge: GET
endpoint: /v1/decisions/:id
description: Read the current state of a decision and the option that was chosen.
---
Returns the current state of a decision. `status` is `pending` or `decided`, and `chosen_key` holds the key of the option that was picked.

```json
{
  "id": "e5f6a7b8-...",
  "status": "decided",
  "chosen_key": "prod",
  "decided_at": "2026-03-21T18:45:00Z",
  "expires_at": "2026-03-22T18:00:00Z",
  "created_at": "2026-03-21T18:00:00Z"
}
```
