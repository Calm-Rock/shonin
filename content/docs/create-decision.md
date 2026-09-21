---
title: Create Decision
order: 7
badge: POST
endpoint: /v1/decisions
description: Ask a multiple-choice question instead of a yes or no.
---
Ask a multiple-choice question instead of a yes or no. The respondent gets an email with one button per option and picks one.

## Request body

| Name | Type | Required | Description |
|---|---|---|---|
| `question` | `string` | required | The question to ask. |
| `options` | `array` | required | 2 to 10 options, each `{ "key": "prod", "label": "Production" }`. A key is up to 16 characters and a label up to 200. |
| `respondent_email` | `string` | required | The email address of the person who will answer. |
| `context` | `string` | optional | Optional extra context shown in the email. |
| `webhook_url` | `string` | optional | Public https URL to POST the answer to. |
| `expires_in_hours` | `number` | optional | How many hours before the links expire. Defaults to 24. |

## Example request

```bash
curl -X POST https://shonin.dev/api/v1/decisions \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which environment should we deploy to?",
    "options": [
      { "key": "staging", "label": "Staging" },
      { "key": "prod", "label": "Production" }
    ],
    "respondent_email": "cto@company.com"
  }'
```

## Example response

Status `201 Created`:

```json
{
  "id": "e5f6a7b8-...",
  "status": "pending",
  "created_at": "2026-03-21T18:00:00Z",
  "expires_at": "2026-03-22T18:00:00Z"
}
```
