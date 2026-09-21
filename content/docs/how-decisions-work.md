---
title: How Decisions Work
order: 10
description: How approval links work and why the requesting code cannot approve its own request.
---
You never call the decide endpoint yourself. It sits behind the links in the email, and it is built so the code that asks for approval cannot give it.

- The approve and reject links exist only in the email to the approver. The API never returns them, so your code cannot approve its own request.
- Opening a link never decides. It leads to a confirm page, and the decision is recorded only when the approver confirms, which sends a POST. Mail scanners and link previews that open every link cannot decide.
- Links are single-use and expire after 24 hours unless you set `expires_in_hours`.
