---
title: Errors
order: 11
description: Error responses and status codes, including the limits that only apply to the hosted demo.
---
All errors return a JSON object with an `error` field containing a human-readable message.

```json
{ "error": "Invalid API key" }
```

## Error codes

| Status | Meaning | Common cause |
|---|---|---|
| 400 | Validation error | A required field is missing, a value has the wrong type, or `webhook_url` is not a public https address. |
| 401 | Invalid API key | Missing or incorrect Authorization header. |
| 404 | Not found | The ID does not exist or belongs to a different account. |

## Hosted demo only

The hosted demo is capped to protect a shared email allowance. Self-hosted instances do not apply these limits.

| Status | Meaning | Common cause |
|---|---|---|
| 403 | Recipient not allowed | `approver_email` or `respondent_email` is not the email on your account. |
| 429 | Daily limit reached | Your key has used its requests for the day. |
| 503 | Demo budget used | The shared email budget for today is used up. Try again tomorrow. |
