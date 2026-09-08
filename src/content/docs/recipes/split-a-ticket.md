---
title: Split a big ticket into units
description: File a plan's independent parts as sub-issues and build them in parallel, a wave at a time.
sidebar:
  order: 10
---

A ticket whose plan has parts that can be built apart is worth splitting: each unit gets its own branch, its own review-sized diff, and its own builder. A plan that is one long chain is not; the chain is what `/dev-build` runs anyway, and the split buys review size, not parallelism.

## 1. Plan, then split

```
/dev-plan #119
/dev-split #119
```

`/dev-split` reads the plan back off the ticket, proposes units with their own criteria and dependencies, and shows the waves before filing anything. Two units and a chain is a legitimate answer. So is "do not split".

## 2. The units file

One entry per unit, dependencies as 0-based indexes into the same file, because the IDs do not exist yet:

```json
[
  {
    "summary": "site: reference pages with real output per command",
    "description": "## Problem\n…\n\n## Acceptance criteria\n\n- [ ] AC5: every command has one real output example",
    "type": "Feature",
    "dependsOn": []
  },
  {
    "summary": "site: quick start page",
    "description": "## Problem\n…\n\n## Acceptance criteria\n\n- [ ] AC2: install to first landed ticket on one page",
    "type": "Feature",
    "dependsOn": [0]
  }
]
```

Each description carries the unit's own subset of the parent's criteria, verbatim and with their original IDs, so `/dev-done` on the parent can trace each one. A unit in a multi-repo project also names its `repo`.

```
$ node _dev-workflow/scripts/dev.mjs split '#119' @units.json --print
parent:   #119 — docs: a documentation site with a quick start, recipes and use cases
filed:    0 new   (--print: nothing was filed)
wave 1
  unit 1   site: reference pages with real output per command
wave 2
  unit 2   site: quick start page   depends on unit 1
```

Without `--print` the units are filed in wave order and linked under the parent. On YouTrack the link type is `youtrack.subtaskLinkType`; on GitHub a sub-issue is a sub-issue.

## 3. Build a wave at a time

```
/dev-build #119
```

Every ready unit gets its own `dev-builder` subagent in its own worktree, on the session's own model. A builder never pushes, fetches, rebases or moves a ticket. When the wave's units are verified, the session lands them together:

```bash
node _dev-workflow/scripts/dev.mjs build '#119'                  # the board
node _dev-workflow/scripts/dev.mjs build '#119' --start          # mount worktrees for the ready units
node _dev-workflow/scripts/dev.mjs build '#119' --land --apply   # land the finished wave
```

Under `pr` delivery a wave ends at open pull requests, and the next wave starts after they merge.
