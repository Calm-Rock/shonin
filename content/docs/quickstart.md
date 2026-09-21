---
title: Quickstart
order: 2
description: Send your first approval request and read the result in three steps.
---
> [!NOTE]
> This quickstart uses the hosted demo, which is capped and meant for trying Shonin out. For real use, [self-host Shonin](https://github.com/Calm-Rock/shonin#self-hosting).

1. Sign in with your email at [/login](/login). Your API key is on your dashboard and is emailed to you.
2. Send an approval request. Use your own email as the approver: the hosted demo only sends to your account email.

   ```bash
   curl -X POST https://shonin.dev/api/v1/approvals \
     -H "Authorization: Bearer sk_your_api_key" \
     -H "Content-Type: application/json" \
     -d '{
       "action": "Deploy to production",
       "approver_email": "you@example.com"
     }'
   ```

3. Open the email and click Approve, then read the result with the `id` from the response:

   ```bash
   curl https://shonin.dev/api/v1/approvals/APPROVAL_ID \
     -H "Authorization: Bearer sk_your_api_key"
   ```

The `status` field changes from `pending` to `approved` or `rejected`.
