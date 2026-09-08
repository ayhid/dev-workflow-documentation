---
title: Direct delivery instead of pull requests
description: Land finished work straight onto the base branch, for a solo project with nobody to review.
sidebar:
  order: 2
---

How work reaches the base branch is configuration, not a decision the model makes per session.

```json
"delivery": { "mode": "direct" }
```

| `mode` | What `land --apply` does | Ticket goes to |
| --- | --- | --- |
| `pr` (default) | pushes the branch, opens a pull request, requests `reviewer` | `states.review`, then `states.done` when `sync` sees the merge |
| `direct` | rebases onto the target, fast-forwards it, pushes, removes the worktree, deletes the branch | `states.done` |

A rebase conflict aborts and leaves the branch exactly as it was. It is never force-resolved: `-X theirs` discards someone's work silently. Resolve it on the branch and run `land` again.

## Land onto a different branch than you fork from

```json
"branch":   { "base": "main" },
"delivery": { "mode": "pr", "base": "develop" }
```

Each ticket forks from `main` and its PR opens against `develop`. `land` refuses a target that exists neither locally nor on the remote, before pushing anything.

## Per repository

```json
"repos": [
  { "path": "docs", "delivery": { "mode": "direct" } },
  { "path": "api",  "delivery": { "mode": "pr", "base": "develop" } }
]
```

## Keep it local

`"push": false` lands without pushing. `"cleanup": false` keeps the worktree and branch afterwards.

## A `direct` project still needs `sync`

Nothing goes through a PR, so PR evidence about the project does not exist. `sync` reads commit subjects on the base branch as well, so a ticket referenced from a landed commit is moved to done even when nobody ran `land`. See [Keep states honest from CI](/dev-workflow-documentation/recipes/reconcile-in-ci/).
