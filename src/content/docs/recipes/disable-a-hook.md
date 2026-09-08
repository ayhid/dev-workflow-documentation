---
title: Turn a hook off
description: Switch off the standup, the update notice, the commit guard or the ADR guard, in a way that survives updates.
sidebar:
  order: 4
---

Four hooks are installed and on by default. One key each turns one off, in `.dev-workflow.json`:

```json
{
  "hooks": {
    "sessionStart": false,
    "updateCheck": true,
    "commitTicket": true,
    "adrImmutable": true
  }
}
```

| Key | Hook | Turn it off when |
| --- | --- | --- |
| `sessionStart` | the standup printed when a session opens | the report is long enough that its tokens stop paying for themselves. Run `/dev-standup` when you want it. |
| `updateCheck` | the one-line "an update is available" notice | you pin versions elsewhere. |
| `commitTicket` | the guard on `git commit -m` subjects | the project does not use conventional commits, or commitlint already covers everything. |
| `adrImmutable` | the guard on editing accepted decision records | you keep records elsewhere. |

The hooks read this themselves. Deleting the entry from `.claude/settings.json` instead would last until the next update re-added it.

## Keep the ID check, drop the type check

For a project without conventional commits:

```json
"commit": { "requireType": false }
```

The hook still requires an issue ID in the subject.

## The older spellings

`commit.enforce: false` and `docs.enforce: false` still work for the last two. Either place set to `false` disables; the older key can never re-enable, so there is no precedence to get wrong.

## Silence the banner without touching the config

`DEV_WORKFLOW_NO_BANNER=1` in the shell silences the daily update line on `config`, `status` and `standup`. `DEV_WORKFLOW_NO_NETWORK=1` skips the lookup entirely.
