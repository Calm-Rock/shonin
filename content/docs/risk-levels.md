---
title: Risk Levels
order: 6
description: How command types map to the risk banner shown in the approval email.
---
When an approval has a `command_type`, the email opens with a risk banner so the approver can see how reversible the action is. If you leave `command_type` out, Shonin infers it from `action` when it recognizes commands such as `git push --force`, `git reset --hard`, `rm`, `drop table` or a migration.

| command_type | Level | Shown to the approver |
|---|---|---|
| `git_push_force` | DESTRUCTIVE | Will overwrite upstream commits. Bypasses branch protection rules. |
| `git_reset_hard` | DESTRUCTIVE | Local changes will be permanently lost. |
| `rm` | DESTRUCTIVE | Files cannot be recovered from trash. |
| `sql_drop` | DESTRUCTIVE | Table data is permanently deleted. |
| `sql_migration` | HIGH | Schema changes may be irreversible. |
| `git_push` | LOW | Reversible via git revert. |
| `git_commit` | LOW | Reversible via git reset. |
| anything else | LOW | No banner text. |

> [!NOTE]
> DESTRUCTIVE approvals add a 3 second countdown on the confirm page before the Approve button unlocks.
