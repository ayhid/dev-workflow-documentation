---
title: Configuration
description: Every key in .dev-workflow.json, grouped by block, with its default.
sidebar:
  order: 1
---

`dw init` or `/dev-init` writes `.dev-workflow.json` at the repo root. `.claude/dev-workflow.json` also works. Commands walk up from the current directory to find it.

The file holds no secret. `tokenOpRef` is a 1Password reference, not a credential. Commit it.

Objects merge with the defaults key by key. **Arrays replace the default outright**, so listing three commit types gives you exactly three.

## The minimum

**YouTrack**

```json
{
  "provider": "youtrack",
  "baseUrl": "https://acme.youtrack.cloud",
  "project": "ABC",
  "tokenOpRef": "op://Private/youtrack/credential",
  "states": { "start": "In Progress", "review": "In Review", "done": "Done" }
}
```

`baseUrl` and `project` are the only hard requirements. Without `tokenOpRef` the token comes from `YOUTRACK_TOKEN`.

**GitHub Issues**

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
    "start": "In Progress", "review": "In Review", "done": "Done"
  }
}
```

GitHub has no state field, so the ladder is modelled with labels and `done` also closes the issue. The label mapping and an explicit `ladder` are both required. The first rung is what an issue with no ladder label means.

## Top-level keys

| Key | Default | What it does |
| --- | --- | --- |
| `provider` | `youtrack` | `youtrack` or `github`. Decides the ID shape: `ABC-42` or `#42`. |
| `baseUrl` | none | YouTrack instance URL. Required for YouTrack. |
| `project` | none | YouTrack project key. Required for YouTrack. |
| `projectId` | none | YouTrack internal project id. The wizard fills it. |
| `tokenOpRef` | none | 1Password reference resolved with `op read` at run time. |
| `language` | `English` | The language ticket prose is written in. Identifiers, paths and error text stay verbatim. |
| `issueTypes` | `Bug, Feature, Task, Epic, Improvement` | Types `create` accepts. Each needs an entry in `branch.types`. |
| `priorities` | `Show-stopper … Minor` | Priorities `create` accepts. Ignored on GitHub. |
| `defaultPriority` | `Normal` | Used when `create` is given none. |
| `reviewer` | none | Requested on every pull request `land` opens. |
| `stage` | unset | `greenfield` or `brownfield`. Proposed by `assess`, settled by a person, never inferred. |
| `notesFile` | `.dev-workflow.notes.md` | Where `note` appends. |
| `notesMaxChars` | `4000` | How much of the notes file `config` prints before truncating. |
| `notes` | none | The older inline array of notes. Still read, never rewritten. |
| `metrics` | `true` | `false` turns the transition log off. |
| `metricsFile` | `.dev-workflow.metrics.jsonl` | Resolved against the main checkout, so worktrees share one log. |

## `github`

| Key | Default | What it does |
| --- | --- | --- |
| `repo` | none | `owner/name`. Required. |
| `issuesRepo` | `repo` | Which repository holds the issues, when several repos share a tracker. |
| `labels` | `{}` | Ladder state → label. Every rung after the first needs one. Labels must already exist. |

## `youtrack`

```json
"youtrack": { "subtaskLinkType": "Subtask", "stateField": "State", "assigneeField": "Assignee" }
```

| Key | Default | What it does |
| --- | --- | --- |
| `stateField` | `State` | The State field's display name on this instance. A localised instance calls it something else, such as `État`. |
| `assigneeField` | `Assignee` | The Assignee field's display name, such as `Responsable`. |
| `subtaskLinkType` | `Subtask` | The link type `split` uses to make a unit a subtask of its parent, and `build` follows back. |

The field is never selected by its type: a project can drive its ladder from an ordinary enum field, and a guess that is usually right is silently wrong where it is not. A blank name, or one name for both fields, is refused when the adapter is built. `Type` and `Priority` are still read by their English names. GitHub has no equivalent block: a sub-issue is a sub-issue.

## `states`

```json
"states": {
  "ladder": ["Backlog", "In Progress", "In Review", "Done"],
  "start": "In Progress",
  "review": "In Review",
  "done": "Done",
  "abandon": "Backlog"
}
```

| Key | Default | What it does |
| --- | --- | --- |
| `ladder` | derived from the three rungs | Every state the project has, in order. Stops a session inventing one. Required on GitHub. |
| `start` | `In Progress` | Where `start` moves a ticket. |
| `review` | `In Review` | Where `land` in `pr` mode moves it. |
| `done` | `Done` | Where `land` in `direct` mode, and `sync` after a merge, move it. |
| `abandon` | **none** | Where `abandon` walks a ticket back to. The one rung with no default: nothing else in the tool moves backwards, so nothing would notice a wrong guess. |

## `branch`

```json
"branch": {
  "pattern": "<type>/<ID>-<slug>",
  "base": "main",
  "mode": "worktree",
  "worktreeDir": ".worktrees",
  "types": { "Bug": "fix", "Feature": "feat", "Task": "chore", "Epic": "feat", "Improvement": "refactor" },
  "fallbackType": "chore"
}
```

| Key | Default | What it does |
| --- | --- | --- |
| `pattern` | `<type>/<ID>-<slug>` | Tokens are `<type>`, `<ID>`, `<slug>`. Keep `<ID>`: `land` and `sync` read the ticket back out of the branch. A GitHub `#42` becomes `42` in the ref. |
| `base` | `main` | The branch a ticket is forked **from**. |
| `mode` | `worktree` | `worktree` checks each ticket out under `worktreeDir`. `branch` switches this checkout in place and refuses when it is dirty. |
| `worktreeDir` | `.worktrees` | Add it to `.gitignore` yourself. |
| `types` | see above | Issue type → **commit** type. Every value must be in `commit.types`. |
| `fallbackType` | `chore` | For an issue with no type. |

## `commit`

```json
"commit": {
  "pattern": "type(scope): description (<ID>)",
  "position": "suffix",
  "noTicketEscape": "chore(no-ticket)",
  "types": ["feat", "fix", "docs", "style", "refactor", "test", "chore", "perf", "ci", "revert", "build"],
  "scopes": [],
  "enforce": true
}
```

| Key | Default | What it does |
| --- | --- | --- |
| `pattern` | see above | Shown to the model. The hook checks type, optional scope, and the ID. |
| `position` | `suffix` | `suffix`, `prefix` or `any`. With `suffix` a bare `ABC-1: …` is rejected. |
| `noTicketEscape` | `chore(no-ticket)` | The **scope** carries the meaning: any configured type with that scope passes, so ticketless work is not forced to be a non-releasing `chore`. |
| `types` | eleven conventional types | Copy from the project's commitlint config. The hook and the model both read it. |
| `scopes` | `[]` | Allowed scopes. Empty means any. |
| `enforce` | `true` | `false` disables the commit hook. `hooks.commitTicket` is the current spelling. |
| `requireType` | `true` | `false` keeps the issue-ID check and drops the conventional-commit one. |
| `idPattern` | by provider | Override the regex that recognises an ID. |

## `delivery`

```json
"delivery": { "mode": "pr", "base": null, "remote": "origin", "push": true, "cleanup": true }
```

| Key | Default | What it does |
| --- | --- | --- |
| `mode` | `pr` | `pr` opens a pull request and moves the ticket to review. `direct` rebases onto the target, fast-forwards it, pushes, removes the worktree, closes the ticket. |
| `base` | `null` | The branch work is delivered **onto**. `null` means the branch it forked from. Set it only when it differs from `branch.base`, as in fork from `main` and open PRs against `develop`. |
| `remote` | `origin` | Where the branch is pushed. |
| `push` | `true` | `false` lands locally and pushes nothing. |
| `cleanup` | `true` | `false` keeps the worktree and branch after landing. |

## `repos`

Omit for a single repository at the root.

```json
"repos": [
  {
    "path": "frontend",
    "when": "UI, pages, forms, components",
    "checks": ["pnpm test:ci", "pnpm lint"],
    "env": { "ASDF_NODEJS_VERSION": "22.22.0" },
    "remotes": ["origin", "upstream"],
    "scopes": ["feature", "bug", "components"],
    "github": "acme/frontend",
    "delivery": { "mode": "direct" }
  }
]
```

| Key | What it does |
| --- | --- |
| `path` | Relative to the project root. `.` for the root itself. |
| `when` | How `/dev-task` routes a ticket to this repo. |
| `checks` | What `/dev-done` runs here. |
| `env` | Prepended to every command run in this repo. |
| `remotes` | Everywhere branches are pushed. |
| `scopes` | Commit scopes valid here. |
| `github` | The `owner/name` pull requests are opened against, when it differs from `origin`. |
| `delivery` | Overrides the top-level block for this repo. |

## `hooks`

```json
"hooks": { "sessionStart": true, "updateCheck": true, "commitTicket": true, "adrImmutable": true }
```

| Key | Hook |
| --- | --- |
| `sessionStart` | the standup printed when a session opens |
| `updateCheck` | the one-line update notice when a session opens |
| `commitTicket` | the guard on `git commit -m` subjects |
| `adrImmutable` | the guard on editing accepted decision records |

The hooks read this themselves, which is what makes an opt-out survive an update. `commit.enforce` and `docs.enforce` are older spellings for the last two and can only disable, never re-enable. See [Hooks](/dev-workflow-documentation/reference/hooks/).

## `tdd`

```json
"tdd": { "enabled": true }
```

Absent means on. `false` makes `/dev-task` implement directly instead of handing each criterion to `/dev-tdd`. Criteria are still verified with evidence either way.

## `docs`

```json
"docs": {
  "dir": "docs",
  "set": ["context", "architecture", "domain", "api", "ux", "operations", "testing", "security"],
  "decisionsDir": "docs/decisions",
  "enforce": true
}
```

| Key | Default | What it does |
| --- | --- | --- |
| `dir` | `docs` | Where the documentation set lives. |
| `set` | all eight | Which documents the set has. May only subset the eight known keys; a key outside them is an error. |
| `decisionsDir` | `docs/decisions` | Where ADRs live. `--dir` overrides for one run. |
| `enforce` | `true` | `false` disables the ADR immutability hook. `hooks.adrImmutable` is the current spelling. |

The eight keys and their files: `context` → `context.md`, `architecture` → `architecture.md`, `domain` → `domain.md`, `api` → `api.md`, `ux` → `ux.md`, `operations` → `operations.md`, `testing` → `testing.md`, `security` → `security-model.md`. `decisions` is a pointer to `decisionsDir`, and `docs init` writes nothing there.

## `sync`

```json
"sync": { "comment": "PR {url} — {state}" }
```

The comment `sync --apply` leaves on a ticket it moves. `{url}` and `{state}` are substituted.

## Environment overrides

YouTrack only: `YOUTRACK_BASE_URL`, `YOUTRACK_PROJECT`, `YOUTRACK_PROJECT_ID`, `YOUTRACK_TOKEN`, `YOUTRACK_TOKEN_OP_REF`, `YOUTRACK_LANGUAGE`, `YOUTRACK_CONFIG_DIR` each override the file.

Any provider: `DEV_WORKFLOW_NO_NETWORK` skips the daily version lookup, `DEV_WORKFLOW_NO_BANNER` silences the update line on `config`, `status` and `standup`.

## Worked examples

Three complete configs ship in the source repository under [`examples/`](https://github.com/ayhid/claude-dev-workflow/tree/main/examples): a solo GitHub project with direct delivery, a single-repo YouTrack project, and a two-repo YouTrack project with a seven-state ladder, French tickets and per-repo toolchains.
