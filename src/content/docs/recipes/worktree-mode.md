---
title: Worktree mode
description: One directory per ticket, so starting work never disturbs what is already in the tree.
sidebar:
  order: 1
---

The default. Each ticket is checked out under `.worktrees/` in its own directory, and the main checkout stays on the base branch with whatever you had in progress.

```json
"branch": { "mode": "worktree", "worktreeDir": ".worktrees" }
```

Add the directory to `.gitignore`. The installer never touches that file.

```text
.worktrees/
```

## The one thing to get right

`start` changes the working directory, and its last line says where:

```
$ node _dev-workflow/scripts/dev.mjs start '#42'
…
mode:     worktree → /Users/you/project/.worktrees/fix-42-csv-export
state:    In Progress

cd /Users/you/project/.worktrees/fix-42-csv-export
```

Everything after that runs there. A command run at the repo root edits the wrong checkout, reports a clean tree, and reads as "nothing was done". Use `git -C <path>` and run the project's checks with that working directory.

## Switch to branch mode

```json
"branch": { "mode": "branch" }
```

`start` then switches this checkout in place and refuses when the tree is dirty. Commit or stash first.

`start --mode branch` overrides for one ticket.

## Teardown

`land` in `direct` mode and `abandon` remove the worktree. If a process the session left running keeps recreating a file in it, the removal falls back to a forced remove, then a confined delete that refuses any path outside `worktreeDir`.

`delivery.cleanup: false` keeps the worktree after landing.
