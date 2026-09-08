---
title: Ticket work on GitHub Issues
description: A ticket from Backlog to Done on a GitHub Issues project, with labels as the state ladder.
sidebar:
  order: 1
---

GitHub has no state field. The ladder is modelled with labels: each rung after the first maps to a label the repository already has, and the first rung is what an issue with no ladder label means. `done` also closes the issue.

## Setup

```bash
gh label create "status: in progress" --color 0E8A16
gh label create "status: review" --color FBCA04
gh label create "status: done" --color 5319E7
dw init
```

The wizard proposes the repository from `origin`, checks `gh` can write to it, and maps each rung onto a label. A missing label is printed as the command above, never created for you.

```json
{
  "provider": "github",
  "github": {
    "repo": "acme/api",
    "labels": {
      "In Progress": "status: in progress",
      "In Review": "status: review",
      "Done": "status: done"
    }
  },
  "states": {
    "ladder": ["Backlog", "In Progress", "In Review", "Done"],
    "start": "In Progress", "review": "In Review", "done": "Done", "abandon": "Backlog"
  }
}
```

Authentication is the GitHub CLI's own. There is no token to configure.

## The flow

| Step | Skill or command | Ticket state |
| --- | --- | --- |
| File it, or start from `#42` | `/dev-task` | Backlog |
| Plan approved, worktree created | `dev.mjs start '#42'` | In Progress, label added |
| Commits carry `(#42)` | the commit hook | In Progress |
| Verified and landed as a PR | `/dev-done`, `dev.mjs land --apply` | In Review, label swapped |
| PR merged | `dev.mjs sync --apply` | Done, label swapped, issue closed |

Commit subjects carry the ID as a reference, not a closing keyword:

```
fix(export): stream CSV rows (#42)
```

A PR body saying `Closes #42` makes GitHub close the issue at merge before anything relabels it. The issue then reads as done while still labelled `status: review`. `sync` reports and repairs that:

```
ISSUE        CURRENT          SHOULD BE        WHY
#42          Done             relabel          labelled "status: review", but the issue is Done
```

The repair rewrites labels only. It never opens or closes an issue.

## Reconcile from CI

Run `sync` on every merge and weekly so a Friday merge does not leave a ticket in review until Monday. See [Keep states honest from CI](/dev-workflow-documentation/recipes/reconcile-in-ci/).

## Several repositories, one issue list

`#42` is per repository. When several repos share a tracker, name it:

```json
"github": { "repo": "acme/api", "issuesRepo": "acme/planning" }
```

Closing an issue as *not planned* puts it off the ladder, so declined work is never reported as shipped.
