---
title: Hooks
description: The four hooks merged into .claude/settings.json, what each costs, and how to turn one off.
sidebar:
  order: 4
---

The installer merges four entries into `.claude/settings.json`, matched by command string so a re-run adds only what is missing and your own hooks survive. They run from the installed copy under `_dev-workflow/hooks/`.

| Hook | Event | Fires | Cost |
| --- | --- | --- | --- |
| `check-commit-ticket.sh` | `PreToolUse`, matcher `Bash` | every Bash tool call | about 3ms for anything that is not `git commit -m` |
| `check-adr-immutable.sh` | `PreToolUse`, matcher `Edit\|Write` | every file edit | one filename check, and a read only for ADR-shaped paths |
| `session-standup.mjs` | `SessionStart` | once per session | a `standup` run, bounded at 3s, plus its output in the session's context |
| `session-updatecheck.mjs` | `SessionStart` | once per session | a cache read; one registry lookup a day, bounded at 3s |

## The commit guard

Blocks a `git commit -m` whose subject is not a conventional commit carrying an issue ID in the configured position. It reads `commit.types`, `commit.scopes`, `commit.position` and `commit.noTicketEscape` from `.dev-workflow.json`, and the ID shape from `provider`.

It only sees inline `-m` messages issued through the agent. Editor commits, `-F` files and amends are deferred to the project's own commit hooks; pair it with commitlint under husky to cover those.

Without `jq` it cannot parse its payload. It allows the commit and prints that enforcement is off, rather than blocking every Bash call.

## The ADR guard

Blocks an `Edit` or `Write` to a decision record whose status is `accepted`, and names the supersede command instead. `dev.mjs adr` writes through Node's filesystem, so the supersede path itself is not blocked.

The known gap: an ADR rewritten through `sed -i` or a shell heredoc is not seen. Closing it would put a check on every Bash call, which the commit guard's 3ms budget exists to avoid. That trade is recorded rather than tolerated silently.

## The session standup

Prints `dev.mjs standup` when a session opens. It is on by default because a report nobody switches on reports nothing, but its output goes into the session's context and costs tokens every session. Past 3s it prints one line and gives up. It never fails or stalls a session, stays silent with no config, and does not re-fire on compaction.

## The update check

One line when a newer version is published, from the daily cached lookup:

```
An update is available: 1.18.4 → 1.20.1 — npx claude-dev-workflow@latest --update
```

It never updates. Running the command is your decision. It is a separate hook from the standup so that turning the standup off leaves the notice on.

## Turning one off

```json
{
  "hooks": {
    "sessionStart": true,
    "updateCheck": true,
    "commitTicket": true,
    "adrImmutable": true
  }
}
```

The hooks read this themselves. An opt-out that worked by deleting the settings entry would last until the next update re-added it. `commit.enforce: false` and `docs.enforce: false` are the older spellings for the last two and still work; the older key can only disable, never re-enable.

See [Turn a hook off](/dev-workflow-documentation/recipes/disable-a-hook/).
