---
title: Keep states honest from CI
description: Run sync on every merge and weekly, so a ticket never sits in review after its PR merged.
sidebar:
  order: 9
---

A PR merges on a Friday, nobody is in a session, and the ticket sits in review until someone notices. A webhook would fire once and be lost if the runner is down. `sync` reconciles instead: given what has been pushed right now, where should each ticket be?

| Evidence | Target |
| --- | --- |
| an open PR references the issue | `states.review` |
| a merged PR references the issue | `states.done` |
| a commit on the base branch references the issue | `states.done` |

It only moves forward along the ladder, never touches a state off it, and running it twice is a no-op. Missing a week costs latency, nothing else.

## The workflow

```yaml
name: reconcile
on:
  pull_request:
    types: [closed]
  schedule:
    - cron: '17 6 * * 1'
  workflow_dispatch:

permissions:
  contents: read
  issues: write
  pull-requests: read

jobs:
  reconcile:
    # closed fires on every close; only a merge is evidence that work landed
    if: github.event_name != 'pull_request' || github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      # no install step: _dev-workflow/ is committed and has no dependencies
      - env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node _dev-workflow/scripts/dev.mjs sync --apply --deep
```

Two lines are load-bearing. `fetch-depth: 0`, because the base-branch commit scan is the only evidence for a hotfix pushed straight to `main`, and at depth 1 that log is one commit long. `--deep`, because a hand-named branch carries no issue ID and the commit subjects are the only link.

For YouTrack add `YOUTRACK_TOKEN` as a secret and pass it in `env`. This is the workflow the tool's own repository runs; `sync` reconciles what a PR or a landed commit within `--since` references, 30 days by default, so a strand older than that needs one wider run by hand: `sync --apply --deep --since 1y`.

## Read the report

```
$ node _dev-workflow/scripts/dev.mjs sync
scanning . (ayhid/claude-dev-workflow) — PRs, and commits on origin/main

ISSUE        CURRENT          SHOULD BE        WHY
------------------------------------------------------------------------
#58          Done             -                already there or ahead
#12          Done             relabel          labelled "status: in review", but the issue is Done
```

Far fewer issues than you expect is a finding: work that names no issue in a branch, a title or a commit subject is invisible. The commit hook is what pulls the convention back.
