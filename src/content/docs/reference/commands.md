---
title: Commands
description: Every dev.mjs subcommand, what it needs, and what it prints.
sidebar:
  order: 2
---

Every command is `node _dev-workflow/scripts/dev.mjs <command>`, run anywhere inside the project. The skills call them; you can too. Nothing here has a dependency outside Node's standard library.

Nothing writes until asked. `land` and `sync` are dry runs without `--apply`, `start --print` and `resume --print` report without creating anything.

Outputs below were captured on the tool's own repository, a GitHub Issues project.

## Reading

### `config [--json]`

The effective config, with per-repo checks and the notes file.

```
$ dev.mjs config
config file: /Users/you/project/.dev-workflow.json
provider:    github
repo:        ayhid/claude-dev-workflow
language:    English
states:      start=In Progress  review=In Review  done=Done  abandon=Backlog
             ladder: Backlog → In Progress → In Review → Done
branch:      <type>/<ID>-<slug>  (base: main)
             mode: worktree (.worktrees/)
             types: Bug→fix  Feature→feat  Task→chore  Epic→feat  Improvement→refactor
delivery:    pull request
commit:      type(scope): description (<ID>)   escape: <type>(no-ticket): …
  types:     feat, fix, docs, style, refactor, test, chore, perf, ci, revert, build
reviewer:    (none configured)
metrics:     .dev-workflow.metrics.jsonl  (local, never sent anywhere)
tdd:         on — /dev-tdd drives one acceptance criterion at a time

repos:
  - .
      checks: npm test
```

### `fetch <ISSUE-ID>`

The issue as markdown, comments included.

```
$ dev.mjs fetch '#119'
# #119 — docs: a documentation site with a quick start, recipes and use cases

**State:** Backlog  |  **Assignee:** —

## Description

## Problem

The user-facing documentation is a 606-line README plus three reference files …
```

### `status [--all]`

This checkout, or every worktree in flight.

```
$ dev.mjs status
branch    main
issue     none — this branch carries no issue ID
pr        none yet
tree      26 uncommitted changes
```

### `standup [--since 1d] [--stale 7d] [--repo PATH]`

What merged, what is in flight, what is stale, what is open, and the one thing waiting on you. It never writes.

```
$ dev.mjs standup
standup   2026-09-08   since 2026-09-07 (1d)

merged since 2026-09-07
  #117  create: respect the repository's issue template, wi…   #36 Done
  #116  standup: PR column and merged section ignore delive…   #44 Done

in flight
  ISSUE    STATE         PR          TREE     AGE    BRANCH
  #36      Done          #117 merged 25 ahead today  feat/36-create-respects-the-issue-template
  -        -             #110 open   13 ahead 1d     fix/update-detects-newer-release

stale — no commit for 7d
  (nothing has been sitting that long)

open in the tracker
  #118     Backlog       youtrack: verify the configured field names against…

next
  nothing in flight is waiting on you — 1 open above, unstarted: dev.mjs start <ISSUE-ID>
```

### `sync [--apply] [--since 30d] [--deep] [--limit N]`

Where each ticket should be, given what has been pushed. Dry run without `--apply`.

```
$ dev.mjs sync
scanning . (ayhid/claude-dev-workflow) — PRs, and commits on origin/main

ISSUE        CURRENT          SHOULD BE        WHY
------------------------------------------------------------------------
#58          Done             -                already there or ahead
#12          Done             relabel          labelled "status: in review", but the issue is Done
```

`--deep` also reads the commit subjects of pull requests whose branch and title name no issue. Commits on the base branch are always read.

### `version [--json] [--offline] [--upgrade]`

Installed against latest, plus files you have edited. Exits 0 offline.

```
$ dev.mjs version --offline
installed  1.18.4  (installed 2026-08-31, updated 2026-09-07)
latest     not checked (offline)

1 file(s) differ from the manifest — an update will keep them:
  _dev-workflow/scripts/cmd/version.mjs
```

`--upgrade` runs the installer for you. It refuses while `_dev-workflow/`, `.claude/skills/` or `.claude/agents/` has uncommitted changes.

### `rules [--json]`

Which linters are configured, which languages nothing lints, and where conventions are only written down.

```
$ dev.mjs rules
repo:     . (/Users/you/project)

already enforced
  - commitlint     commit messages          commitlint.config.mjs

not linted at all
  - JavaScript     the standard one is eslint — installing it is a decision, not a proposal
  - Shell          the standard one is shellcheck — installing it is a decision, not a proposal

checks that run
  - npm test

conventions are stated in
  - CLAUDE.md                              rules stated to the agent — every imperative is a candidate
  - CONTRIBUTING.md                        rules stated to contributors, usually never enforced

intent claims in the ledger (0)
  - none — no documentation ledger, or nothing in it is a stated position
```

### `assess [--json]`

Greenfield or brownfield, proposed from what is in the tree. Never written; `/dev-init` records the answer as `stage`.

```
$ dev.mjs assess
repo:     . (/Users/you/project)
stage:    brownfield   (there is already a codebase here — 115 source files)

  is there a system here
    B  source files   115 tracked source files (brownfield at 25+)
    B  source size    1235kB of source (brownfield at 98kB+)
    B  documentation  271kB of documentation (brownfield at 20kB+)
  has it been worked on
    B  commits        209 commits (established at 50+)
    G  age            first commit 24 days ago (established at 180+)
    B  contributors   7 authors (established at 3+)

This is a proposal, not a finding — confirm it before anything is written.

33 documents to read: dev.mjs ingest scan
```

## Tickets

### `create <SUMMARY> <DESCRIPTION|@FILE> [TYPE] [PRIORITY] [--allow-duplicate] [--template NAME]`

Files an issue. stdout is the new ID alone, so it can be captured. Write the body to a file; multiline markdown does not survive argv.

```
$ dev.mjs create "docs: a documentation site" @body.md Task Normal
dev create: github has no priorities — ignoring "Normal"
dev create: no GitHub label mapped for type "Task" — created without it
#119
```

Before filing it scans open issues for the summary's keywords. A match prints the candidates, exits 2 and files nothing; `--allow-duplicate` files anyway and says what it matched.

The body must satisfy the repository's issue template under `.github/ISSUE_TEMPLATE/`, or the shipped default for the type when the repository has none. The shipped defaults require only a non-empty `## Acceptance criteria`. With several repo templates, `--template <name>` picks one; it is never inferred from the type.

### `create --dup-check <KEYWORDS>`

Open issues matching the keywords, report only.

```
$ dev.mjs create --dup-check "documentation site quick start"
no open issues matched
```

### `create --templates`, `create --template <NAME|TYPE>`

The repository's issue templates, or one template verbatim.

```
$ dev.mjs create --templates
no repository issue templates — shipped defaults apply, by type: Bug, Feature

$ dev.mjs create --template Bug
dev create: template: shipped default for Bug
## Symptom

## Steps to reproduce

## Expected vs actual

## Environment

## Suspected area

## Acceptance criteria
- [ ] AC1:

## Session context
```

### `update <ISSUE-ID> state <start|review|done|abandon|"<ladder state>"> [COMMENT|@FILE] [--criteria first-pass|reworked]`

Moves a ticket by **rung**, so the same line works whether the backend moves a State field or swaps a label. A ladder state is accepted too, and rejected before anything is sent if it is not on the ladder. The state printed is the one read back afterwards, never the one requested.

```
$ dev.mjs update
dev update: usage: dev.mjs update <ISSUE-ID> <VERB> [ARGS]

  state <start|review|done|abandon|"<ladder state>"> [COMMENT|@FILE] [--criteria first-pass|reworked]
  comment <TEXT|@FILE>
```

### `update <ISSUE-ID> comment <TEXT|@FILE>`

A comment only.

### `update <ISSUE-ID> raw "<command>"`

A backend-native command. YouTrack only; a GitHub project gets a usable error.

### `split <PARENT-ID> @units.json [--print]`

Files a plan's independent parts as sub-issues of the parent, in dependency order, so every `Depends on:` line names an ID that exists. Dependencies in the file are 0-based indexes into the same file. Each unit's description must carry a `## Acceptance criteria` section, and its type must be one of `issueTypes`.

```
$ dev.mjs split '#119' @units.json --print
parent:   #119 — docs: a documentation site with a quick start, recipes and use cases
filed:    0 new   (--print: nothing was filed)
wave 1
  unit 1   site: reference pages with real output per command
wave 2
  unit 2   site: quick start page   depends on unit 1
```

A failure part way through prints what was filed. Rerun the same command and the filed units are skipped by title.

### `build <PARENT-ID> [--start] [--land [--apply]] [--repo PATH]`

The units' board: which are ready, in progress, landed. `--start` mounts a worktree for each ready unit; `--land` lands the finished wave. A ticket that was not split is built as one unit.

```
$ dev.mjs build '#119'
parent:   #119 — docs: a documentation site with a quick start, recipes and use cases
children: none — this ticket was not split, so it is built as one unit: dev.mjs start #119
```

## Branches and worktrees

### `start <ISSUE-ID> [--type T] [--mode worktree|branch] [--repo PATH] [--print]`

Renders the branch from `branch.pattern`, fetches the base and forks from `origin/<base>` so the ticket starts on what has actually landed, creates the worktree or branch, and moves the ticket to the start rung. The local base branch is never moved. The last line is the directory to work in.

```
$ dev.mjs start '#119' --print
issue:    #119 — docs: a documentation site with a quick start, recipes and use cases
repo:     . (/Users/you/project)
branch:   chore/119-docs-a-documentation-site   (base: main, type: chore)
mode:     worktree → /Users/you/project/.worktrees/chore-119-docs-a-documentation-site

(--print: nothing was created)
```

Without `--print`, two more lines follow. `forked:` names the fork point: `origin/main` after a fetch, or the local branch with the reason when there is no remote or the fetch failed, as in `forked:   main — could not fetch origin/main: Could not resolve host`. `state:` holds the state read back; `NOT MOVED` means the checkout exists and the transition failed, so retry the transition alone.

```
$ dev.mjs start '#122'
issue:    #122 — start: fork from origin/<base> after a fetch
repo:     . (/Users/you/project)
branch:   fix/122-start-fork-from-origin-base   (base: main, type: fix)
mode:     worktree → /Users/you/project/.worktrees/fix-122-start-fork-from-origin-base
forked:   origin/main
created:  new branch
state:    In Progress

cd /Users/you/project/.worktrees/fix-122-start-fork-from-origin-base
```

### `resume [ISSUE-ID] [--repo PATH] [--print]`

Puts a missing worktree back, lists uncommitted files and commits not on the base, and catches the ticket up to the start rung if it is behind.

```
$ dev.mjs resume '#101' --print
issue:    #101 — init: triage an existing install (express / keep / replace)
repo:     . (/Users/you/project)
branch:   feat/101-init-triage-an-existing-install
commits:  5 not on main
          295f82e fix(install): the writer cleans its own temporary (#101)
          e1d4336 docs(install): init's triage and the undo journal (#101)
          3783d70 feat(install): a failed payload write undoes itself (#101)
changes:  none — the tree is clean
state:    Done — already at Done
next:     dev.mjs fetch #101   — re-read the ticket and its acceptance criteria

cd /Users/you/project/.worktrees/feat-101-init-triage-an-existing-install
```

### `land [ISSUE-ID] [--apply] [--repo PATH] [--criteria first-pass|reworked]`

Infers the issue from the branch and follows `delivery.mode`. Dry run without `--apply`.

```
$ dev.mjs land
issue:    #101 — init: triage an existing install (express / keep / replace)
repo:     . (/Users/you/project/.worktrees/feat-101-init-triage-an-existing-install)
checkout: worktree; base lives in /Users/you/project
branch:   feat/101-init-triage-an-existing-install → main
delivery: pr   (dry run — pass --apply)
action:   open a pull request feat/101-init-triage-an-existing-install → main
reviewer: (none configured)
then:     dev.mjs sync --apply moves the ticket to the review state
```

Run from a branch with no ID it says so rather than guessing:

```
$ dev.mjs land
dev land: could not read an issue ID out of the branch "main" — pass one: dev.mjs land <ISSUE-ID>
```

A rebase conflict aborts and leaves the branch as it was. It is never force-resolved.

### `abandon <ISSUE-ID> <REASON|@FILE> [--force] [--repo PATH]`

Records the reason on the ticket, moves it to `states.abandon`, removes the worktree and deletes the branch. It refuses before writing anything while the branch holds uncommitted changes or commits the base has not seen, and lists them. `--force` is the only thing that discards them.

```
$ dev.mjs abandon '#119' "superseded by #120"
dev abandon: you are inside /Users/you/project/.worktrees/chore-119-docs, which is the worktree this would remove.
cd /Users/you/project and run it again.
```

## Documentation

### `docs [init|record|render|check]`

The documentation set for a greenfield project. See [Scaffold docs for a new project](/dev-workflow-documentation/use-cases/greenfield-docs/).

```
$ dev.mjs docs
DOCUMENT      CLAIMS  STATE       PATH
------------------------------------------------------------------------
context       0       missing     docs/context.md
architecture  0       missing     docs/architecture.md
domain        0       missing     docs/domain.md
api           0       missing     docs/api.md
ux            0       missing     docs/ux.md
operations    0       missing     docs/operations.md
testing       0       missing     docs/testing.md
security      0       missing     docs/security-model.md
decisions     -       pointer     docs/decisions   → dev.mjs adr new "<title>"   (or the /dev-adr skill)
```

`docs init` refuses without a settled `stage`:

```
$ dev.mjs docs init
dev docs: no "stage" is set in .dev-workflow.json, and it is not inferred from here.
Run "dev.mjs assess" to see the signals, then /dev-init to settle it — a wrong stage
sends this down the wrong branch and nothing downstream would notice.
```

`docs check` exits 1 for a missing, stub or hand-edited document and names the fix for each:

```
$ dev.mjs docs check
dev docs: 8 problem(s)
  docs/context.md — has never been scaffolded; record claims against "context", then run: dev.mjs docs render context
  docs/architecture.md — has never been scaffolded; record claims against "architecture", then run: dev.mjs docs render architecture
  …
```

### `ingest [scan|next|read|enrich|record|answer|emit]`

Absorbs existing documentation into a ledger of claims, one step at a time, across sessions. See [Join a brownfield codebase](/dev-workflow-documentation/use-cases/brownfield/).

```
$ dev.mjs ingest scan
repo:     . (/Users/you/project)
documents: 33
new:      33

next:     read .claude/agents/dev-reader.md and record what it claims

$ dev.mjs ingest
started:  2026-09-08
sources:  33 (0 read, 33 pending, 0 generated, 0 gone, 0 excluded)
claims:   0 (0 observable, 0 intent, 0 stale)
questions:0 (0 open, 0 answered)

next:     [extract] read .claude/agents/dev-reader.md and record what it claims
```

### `reorg [classify|shortlist|detect|resolve|map|rewrite|triage|adrs]`

From the ingest ledger to a staged, reorganised draft under `_dev-workflow/artifacts/reorg/`. Never touches the project's own docs.

```
$ dev.mjs reorg
verdicts:
  keep: 0
  merge: 0
  archive: 0
  delete: 0
  33 unclassified
pairs:    0 (0 duplicate, 0 overlaps, 0 contradicts)
inconsistencies: 0 (0 open, 0 resolved)
```

### `adr [new|accept|reject|supersede|list|index] [--dir PATH]`

Architecture decision records. See [Record a decision](/dev-workflow-documentation/use-cases/decisions/).

```
$ dev.mjs adr list
#     STATUS                      DATE        TITLE
------------------------------------------------------------------------------
0001  accepted                    2026-08-28  A PreToolUse hook enforces ADR immutability
0002  accepted                    2026-08-30  Retire the CI-posted adversarial reviewer; keep the lenses local
0003  accepted                    2026-09-03  Ship subagent definitions as a third owned root, with a model per task class

$ dev.mjs adr new "Publish the docs as a Starlight site"
created: docs/decisions/0004-publish-the-docs-as-a-starlight.md
status:  proposed — editable until 'dev.mjs adr accept 4'
index:   docs/decisions/README.md
```

### `note ["<text>" | @FILE]`

Appends to the notes file, tagged with the date and the current ticket. With no argument, reports where notes live.

```
$ dev.mjs note "the reorg shortlist default is 0.85 and unmeasured"
dev note: appended to .dev-workflow.notes.md under #119

$ dev.mjs note
file:    /Users/you/project/.dev-workflow.notes.md
entries: 3
latest:  2026-09-08 #119
```

## Review

### `review [--base REF] [--out DIR] [--no-intent]`

Builds the three payloads `/dev-review` hands to its subagents. Writes files rather than printing the diff, so the diff never enters the session.

```
$ dev.mjs review
branch:   chore/119-x
base:     main
files:    1
lines:    1

payloads:
  /tmp/dev-review-voJYhm/change.diff
  /tmp/dev-review-voJYhm/context.txt
  /tmp/dev-review-voJYhm/intent.md
```

`review --render FINDINGS.json` renders the lenses' output into the report.

## What each command needs

| Needs | Commands |
| --- | --- |
| nothing | `rules`, `note`, `docs`, `ingest`, `reorg`, `adr` |
| the tracker | `config`, `fetch`, `update`, `create`, `split`, `version` |
| the tracker and git | `start`, `resume`, `abandon`, `build`, `assess`, `review` |
| the tracker, git and the GitHub CLI | `land`, `standup`, `sync`, `status` |

`standup` degrades to the git half when the GitHub CLI is missing rather than refusing.
