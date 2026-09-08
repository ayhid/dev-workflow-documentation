---
title: Record a decision
description: Write down an architecture decision while the rejected alternatives are still known, then freeze it.
sidebar:
  order: 6
---

An ADR is not a description of the system. `architecture.md` says what the shape is; a decision record says **which alternatives were rejected and on what grounds**. That section is the reason the format beats a commit message, and it is the one people skip, because at the moment of deciding the rejected options feel obvious.

## The format

MADR trimmed to three sections:

```markdown
# 0007. Worktrees by default

- Status: accepted
- Date: 2026-08-28
- Deciders: ayoub

## Context

What forced a decision. The constraint, not the history.

## Options considered

- **Branch switching** — disturbs uncommitted work in the main checkout.
- **Worktrees** **(chosen)** — starting a ticket never touches work in progress.

## Consequences

What this makes easy, what it makes expensive, what it forecloses.
```

## The flow

```
/dev-adr we are keeping sessions in memory rather than adding Redis
```

The skill draws the alternatives out of you before writing anything. An ADR whose options section lists one option is a commit message in a more expensive format.

```
$ node _dev-workflow/scripts/dev.mjs adr new "Publish the docs as a Starlight site"
created: docs/decisions/0004-publish-the-docs-as-a-starlight.md
status:  proposed — editable until 'dev.mjs adr accept 4'
index:   docs/decisions/README.md
```

| Command | What it does |
| --- | --- |
| `adr new "<title>"` | Scaffolds the next number as `proposed`. Editable. |
| `adr accept <N>` | Freezes it. From here the hook refuses edits. |
| `adr reject <N>` | Argued and turned down. The record stays. |
| `adr supersede <N> "<title>"` | A new record, linked in both directions. |
| `adr list` | Every record and its status. |
| `adr index` | Regenerates the index. Every write already does. |

`--dir PATH` overrides `docs.decisionsDir` for one run, for a monorepo keeping records per package.

## Three rules the tooling enforces

1. **A number is never reused.** `adr new` counts from the highest number ever seen, not the file count, so deleting `0003` does not hand `0003` to the next record.
2. **An accepted record is never edited.** It is superseded, and `check-adr-immutable.sh` blocks the edit and names the supersede command. An ADR rewritten through `sed -i` is not seen; that gap is recorded in the tool's own decision 0001 rather than tolerated silently.
3. **The index is generated.** Hand edits to it are overwritten.

## Cite it from the code

At the choke point the decision constrains:

```js
// see docs/decisions/0007 — worktrees, not branch switching
```

The place a reader needs the reasoning is the code, not the docs directory.

## Reading them in Obsidian

Obsidian is a lens over a folder of markdown and takes custody of nothing. Turn wikilinks off so records still render on GitHub, scope the vault to the docs directory, and gitignore `.obsidian/`. The workflow never writes `.obsidian/` itself. The full recipe is in the source repository's [decisions reference](https://github.com/ayhid/claude-dev-workflow/blob/main/docs/decisions.md#reading-them-in-obsidian).
