---
title: Drop a ticket
description: Record why, walk the ticket back, and remove the branch, without losing work by accident.
sidebar:
  order: 8
---

Only when a person says to stop: a wrong approach, a ticket overtaken by another. Never because something turned out to be hard.

```bash
node _dev-workflow/scripts/dev.mjs abandon '#42' "superseded by #57"
```

In order: the reason is recorded on the ticket, the ticket moves to `states.abandon`, the worktree is removed, the branch deleted. The tracker is written before anything is destroyed, because the reason is the only thing abandoning produces.

## It refuses while there is something to lose

Uncommitted changes, or commits the base branch has not seen, stop it before the first write, and it lists each one. `--force` is the only thing that discards them, and nothing recovers them afterwards. Look at the list first.

It also refuses from inside the worktree it would remove:

```
dev abandon: you are inside /Users/you/project/.worktrees/fix-42-csv, which is the worktree this would remove.
cd /Users/you/project and run it again.
```

## `states.abandon` has no default

Everything else in the tool moves a ticket forward, so nothing would notice a wrong guess here. Leave it unset and `abandon` says which key to add; every other command is unaffected.

```json
"states": { "abandon": "Backlog" }
```

## Close the PR too

`sync` pulls any ticket with an open PR forward to the review rung. Abandon does not touch pull requests, so close the PR or the walk-back does not stick.
