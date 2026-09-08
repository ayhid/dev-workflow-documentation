---
title: Ticket work on YouTrack
description: A ticket through a YouTrack state ladder, with real state names read off the API.
sidebar:
  order: 2
---

YouTrack owns its states, so the ladder is the project's real State values and nothing needs to be modelled. The wizard reads them off the API rather than proposing names your instance may not have.

## Setup

Create a token under *Profile → Account Security → Authentication → New token* with the `YouTrack` scope. Then either:

```bash
export YOUTRACK_TOKEN=perm:...
dw init
```

or give the wizard a 1Password reference, which the tool resolves with `op read` at run time. The token is never written to disk and never appears in a process listing.

```json
{
  "provider": "youtrack",
  "baseUrl": "https://acme.youtrack.cloud",
  "project": "ABC",
  "tokenOpRef": "op://Private/youtrack/credential",
  "language": "English",
  "states": {
    "ladder": ["Open", "In Progress", "In Review", "Done"],
    "start": "In Progress", "review": "In Review", "done": "Done", "abandon": "Open"
  }
}
```

Many YouTrack projects have no `Fixed` or `Closed`. Whatever your project calls finished goes in `done`; a project that closes on `Staging` sets `"done": "Staging"`.

## The flow

| Step | Skill or command | Ticket state |
| --- | --- | --- |
| Start from `ABC-42`, or from a sentence | `/dev-task` | Open |
| Plan approved, worktree created | `dev.mjs start ABC-42` | In Progress |
| Commits carry `(ABC-42)` | the commit hook | In Progress |
| Verified and landed as a PR | `/dev-done`, `dev.mjs land --apply` | In Review |
| PR merged | `dev.mjs sync --apply` | Done |

`/dev-task` with a sentence files the issue in the configured `language`, with the project's real Type and Priority values, and prints `Filed ABC-43 — <title>` before continuing.

## Two things the API does

Both are handled for you, and both are worth knowing.

**The commands API returns 200 for commands it did not apply.** Every write reads the state back and prints what it found. Trust that line, not the exit code.

**Braces delimit, they do not quote.** Instances disagree about the last value in a command, so `update` tries both spellings and keeps whichever moved the ticket. You do not need to know which kind yours is.

## Backend-native commands

```bash
node _dev-workflow/scripts/dev.mjs update ABC-42 raw "Type Bug Priority Major"
```

YouTrack only. A GitHub project gets a usable error.

## Environment overrides

`YOUTRACK_BASE_URL`, `YOUTRACK_PROJECT`, `YOUTRACK_PROJECT_ID`, `YOUTRACK_TOKEN`, `YOUTRACK_TOKEN_OP_REF` and `YOUTRACK_LANGUAGE` override the file, for one-off runs against another instance or for CI.

A localised instance that reports `État` instead of `State` works too. See [A localised YouTrack instance](/dev-workflow-documentation/recipes/localised-youtrack/).
