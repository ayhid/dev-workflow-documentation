---
title: Join a brownfield codebase
description: Read years of existing documentation into a map a session can trust, then stage a reorganised draft.
sidebar:
  order: 3
---

Most projects are not new. There are years of decisions in them, some written down, some written down and no longer true. The expensive failure is a session that reads a stale document and confidently reimplements something that already exists.

`/dev-ingest-docs` reads the existing documentation into **claims**, each carrying its evidence, and puts to you only what evidence cannot settle. It never rewrites your docs.

## 1. Confirm the stage

```
$ node _dev-workflow/scripts/dev.mjs assess
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
```

Source files and documentation decide; history only corroborates. `git init` on an old codebase gives one commit and an age of zero, and a verdict weighting those would call four hundred files greenfield. `/dev-init` records your answer as `stage`.

## 2. Run the skill

```
/dev-ingest-docs
```

It runs in steps, and every step persists to a ledger under `_dev-workflow/artifacts/documentation/`. Stop after ten minutes and pick it up next week.

| Step | Command | What happens |
| --- | --- | --- |
| Inventory | `ingest scan` | Every tracked document hashed into the ledger. Re-runnable: a changed document comes back as pending with its old claims marked stale. |
| Read | `ingest next --all` | One `dev-reader` subagent per document, three at a time, on the cheapest model. Each verifies every observable claim against its anchor before returning. |
| Record | `ingest record @claims.json` | A batch with one bad claim is refused whole. |
| Arbitrate | `ingest answer <id> "<decision>"` | Only the questions evidence cannot settle reach you. |
| Emit | `ingest emit` | The map: every claim by topic, contradictions and open questions beside them. |

```
$ node _dev-workflow/scripts/dev.mjs ingest
started:  2026-09-08
sources:  33 (0 read, 33 pending, 0 generated, 0 gone, 0 excluded)
claims:   0 (0 observable, 0 intent, 0 stale)
questions:0 (0 open, 0 answered)

next:     [extract] read .claude/agents/dev-reader.md and record what it claims
```

A bare `ingest` always says where it stands and what comes next.

## What a claim is

| Field | What it is |
| --- | --- |
| `text` | one statement, not a paragraph |
| `kind` | `observable`: checkable against the tree. `intent`: why something is the way it is. |
| `anchor` | `file:line` or the command that shows it. Required for `observable`. |
| `source` | the document it came from, or `derived` |
| `topic` | the heading it belongs under |

An `observable` claim with no anchor is refused. An anchor naming a file not in the repo is refused. An unanchored claim is a guess in the voice of a fact, and a map of those reads exactly like one that was checked.

## 3. Reorganise

Once the ledger is read, `reorg` takes it from a map to a staged draft:

| Step | Command | What happens |
| --- | --- | --- |
| Lifecycle | `reorg triage` | Rule-based verdicts: keep, merge, archive, delete. |
| Relevance | `reorg classify @file` | Your classification per document, with a justification. |
| Overlap | `reorg shortlist`, `reorg detect @file` | Pairs whose keywords overlap, then which duplicate, overlap or contradict. |
| Settle | `reorg resolve <id> <kind> "<note>"` | `prefer:<path>`, `rewrite` or `dismiss`. |
| Map | `reorg map --architecture <file>` | Where each document goes in the target set. Writes `migration-plan.md`. |
| Stage | `reorg rewrite [--dry-run]` | `docs-reorganized/` and `migration-report.md` under `_dev-workflow/artifacts/reorg/`. |
| Decisions | `reorg adrs` | `intent` claims rendered as proposed ADRs. |

Applying the staged tree to your own `docs/` is ordinary work you approve file by file. A staged file you edited by hand is refused, not overwritten.
