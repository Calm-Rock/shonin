---
title: Overview
order: 1
description: What Shonin is and where the API lives.
---
Shonin is an open source, human-in-the-loop approval API. Send an approval request to any email address and wait for a human decision before your automation continues. Approvers need no account: they just click a link.

> [!NOTE]
> **Base URL** `https://shonin.dev/api/v1`

All requests must include an `Authorization: Bearer <api_key>` header, except the `/v1/decide/:token` links in approval emails, which approvers open and which need no key.

Shonin is MIT licensed. Try the hosted demo at shonin.dev, or [self-host it](#self-hosting).
