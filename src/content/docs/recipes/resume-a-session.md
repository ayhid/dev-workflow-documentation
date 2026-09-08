---
title: Pick up where a session stopped
description: Find unfinished work, put a missing worktree back, and continue instead of starting over.
sidebar:
  order: 7
---

A session ends mid-ticket, or its context is compacted, and the next one has no memory of what was left. Two commands answer it.

## What is in flight

```
$ node _dev-workflow/scripts/dev.mjs status --all
```

Every worktree, the ticket it carries, its state, whether a PR exists, and whether the tree is dirty. A ticket in progress with a dirty tree is someone's unfinished work, very possibly yours from before a compaction. Never start over on top of it.

## Resume it

```
$ node _dev-workflow/scripts/dev.mjs resume '#101'
issue:    #101 — init: triage an existing install (express / keep / replace)
repo:     . (/Users/you/project)
branch:   feat/101-init-triage-an-existing-install
commits:  5 not on main
          295f82e fix(install): the writer cleans its own temporary (#101)
          e1d4336 docs(install): init's triage and the undo journal (#101)
changes:  none — the tree is clean
state:    Done — already at Done
next:     dev.mjs fetch #101   — re-read the ticket and its acceptance criteria

cd /Users/you/project/.worktrees/feat-101-init-triage-an-existing-install
```

It puts the worktree back if it went missing, lists uncommitted files by name and commits not on the base, and moves the ticket to the start rung if it fell behind. `--print` reports and repairs nothing.

Read that listing before deciding anything: it is the context the previous session had and you do not. Then `cd` to the last line and continue from implementation, not from planning.

`/dev-task <ID>` does this for you: it runs `status --all` first and resumes rather than creating a second worktree for a ticket already checked out.
