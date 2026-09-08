---
title: Skills and subagents
description: The fifteen skills installed under .claude/skills/dev-*, what each refuses to do, and the five subagents they dispatch.
sidebar:
  order: 3
---

Skills are installed per project under `.claude/skills/dev-*` and invoked by typing `/dev-<name>` in Claude Code. Each runs a `dev.mjs` command at its top and follows the config it prints, so no skill carries a convention over from another project.

## Skills

### `/dev-init`

Sets the workflow up: asks which tracker, probes the repo, confirms project, language, state ladder and check commands, writes `.dev-workflow.json`. The wizard `dw init` does the same from a terminal. Come here to amend an existing config or to answer in prose.

Argument: an optional tracker URL, repo slug or project key.

### `/dev-task`

The front door. Takes an issue ID **or a plain sentence** and routes to the step the work is at: `/dev-file` when there is no issue, `/dev-plan` when there is no plan, `/dev-split` when the plan has independent parts, `/dev-build` to build.

Argument: `ABC-42`, `#42`, or a sentence.

### `/dev-file`

Turns a sentence into a filed issue of any configured type. It orients in the code first, asks for what is genuinely missing in numbered rounds you can stop after any of, checks for duplicates, drafts in the project's language with falsifiable acceptance criteria, and files on approval. **Ends at the ID.** Writes no code, creates no branch, starts nothing.

Argument: a sentence, optionally ending in `as <Type>`.

### `/dev-plan`

Agrees what done means and how to get there: fetches the issue, restates its criteria against a stated bar, picks the target repo, proposes the approach with its independent parts named, and posts the approved plan **on the ticket**, where the next session reads it back. Edits no file, creates no branch, moves no ticket.

Argument: an issue ID.

### `/dev-split`

Turns a plan's independent parts into work units filed as **sub-issues** of the ticket, each with its own acceptance criteria and a `Depends on:` line, in the order they can be built. Shows the waves `split --print` computes and waits for approval. Starts nothing.

Argument: the parent issue ID.

### `/dev-build`

Builds a planned issue. The session is the orchestrator and never builds: it moves the ticket to the start rung, checks it out in a worktree, dispatches one `dev-builder` subagent **in the background**, collects its report, verifies with the checks and the audit lens, and delivers the way the project delivers. A split ticket has its ready units built **in parallel**, one builder per unit in its own worktree, landed a wave at a time. The closing comment on the ticket lists commits, tests added, criteria with evidence, what the builder noticed outside its unit, and anything blocked.

`/dev-build <ID> auto` chains every wave on one approval. It is refused under `pr` delivery, since a wave ends at open pull requests, and a hedged approval is not approval.

Refuses to touch a file before the plan is agreed, and never closes a ticket unasked.

Argument: an issue ID, optionally followed by `auto`.

### `/dev-tdd`

The loop `/dev-build` hands off to when `tdd` is on: one agreed criterion, a test confirmed to fail for the intended reason before any production code, the least code that passes it, a refactor while green. It never invents criteria; the list is the one `/dev-plan` agreed.

Argument: one criterion, or empty for the next unmet one.

### `/dev-bug`

The front door for something broken. Parses the symptom, investigates the likely code path with a bounded number of reads to a suspected area, then hands it to `/dev-file` to file as the project's defect type. **Never fixes**, edits a file or switches branch, because the session may be mid-task on something else.

Argument: a description of what broke.

### `/dev-done`

Closes out the current branch's issue: re-reads the ticket, verifies each criterion with evidence, runs the configured checks, shows the `land` dry run, and on confirmation lands the work the way `delivery.mode` says. Refuses to close a ticket whose criteria are unmet or whose checks fail.

Argument: an optional issue ID; otherwise inferred from the branch.

### `/dev-review`

Three adversarial passes over the branch diff, each a fresh subagent with a **different payload**: blind sees the diff only, edge sees the diff plus the full changed files, audit sees both plus the ticket. Findings come back sorted into fix-the-code, fix-the-spec and out-of-scope. Runs locally, posts nothing, edits nothing. Refuses past 800 changed lines and offers to split the branch.

Argument: `blind`, `edge`, `audit` or empty for all three, plus an optional `--base REF`.

### `/dev-standup`

Runs `dev.mjs standup` and reads it out: what merged, what is in flight, what is stale, what is open, the one thing waiting on you. Never writes, not even the `sync --apply` it may suggest.

Argument: an optional `--since 3d`.

### `/dev-ingest-docs`

For a brownfield project. Inventories the docs, dispatches one `dev-reader` subagent per document three at a time, records their claims, surfaces contradictions, asks you to arbitrate what evidence cannot settle, and emits a map. Then classifies each document, finds overlaps, and stages a reorganised draft under `_dev-workflow/artifacts/reorg/`. Runs in steps across sessions. **Never rewrites your docs.**

Argument: an optional topic to focus on.

### `/dev-docs-init`

For a greenfield project. Scaffolds the documentation set and fills it a claim at a time, each claim carrying the anchor or attribution that would show it false. Writes no prose of its own, and never overwrites a document it did not write.

Argument: an optional document key such as `architecture`.

### `/dev-lint-rules`

Turns conventions a project only states, in `CLAUDE.md`, `CONTRIBUTING.md` or the docs ledger, into rules its own linter can decide, each with the count of violations it would flag today. What no rule can decide is reported as a hook, an intent claim, or noise. Writes nothing without approval of the whole batch, and never invents a linter.

Argument: an optional surface such as `naming`, `imports` or `commits`.

### `/dev-adr`

Records an architecture decision while the rejected alternatives are still known, then freezes it. An accepted record is superseded, never edited, and a hook enforces that. An ADR whose options section lists one option is a commit message in a more expensive format, so the skill draws the alternatives out first.

Argument: a sentence, `list`, or a record number.

## Subagents

Installed as one file each under `.claude/agents/dev-*.md`. Each pins its model by what a wrong answer costs, so material read by a subagent never enters the main session and is never paid for again on later turns.

| Agent | Dispatched by | Reads | Model |
| --- | --- | --- | --- |
| `dev-reader` | `/dev-ingest-docs` | one document, verifies every observable claim against its anchor, returns claims, summary, keywords and headings as JSON | cheapest: find and report, with an output the tool can refuse |
| `dev-review-blind` | `/dev-review` | the diff, and nothing else | middle: judgement over bounded material |
| `dev-review-edge` | `/dev-review` | the diff plus the full source of the changed files | middle |
| `dev-review-audit` | `/dev-review` | the diff, the source and the ticket | middle |
| `dev-builder` | `/dev-build` | one work unit, in its own worktree: reads the config and the unit's ticket, drives each criterion through the TDD loop, stops the line on a red suite, reports `blocked` on an irreversible step, commits with the unit's ID, runs the checks once, returns one JSON report with what it noticed outside the unit | the session's own model: code that ships |

The blind lens must run outside the session that knows the intent. A reviewer who knows what a change is for reads the code as confirmation of it.

A builder works only in its own worktree: no push, no fetch, no stash, no rebase, no hook bypass, and no command that moves a ticket. The coordinating session lands each wave with `build --land` and reconciles once.
