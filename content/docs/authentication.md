---
title: Authentication
order: 3
description: How to authenticate requests with your API key.
---
Pass your API key as a Bearer token in the `Authorization` header on every request. Sign in at [/login](/login) to see your key.

```bash
curl -H "Authorization: Bearer sk_your_api_key" \
  https://shonin.dev/api/v1/approvals/APPROVAL_ID
```

> [!WARNING]
> Keep your API key secret. Do not expose it in client-side code or public repositories.
