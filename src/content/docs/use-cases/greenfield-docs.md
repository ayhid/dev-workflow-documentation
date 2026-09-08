---
title: Scaffold docs for a new project
description: Give a greenfield project the eight documents it does not have yet, filled one claim at a time.
sidebar:
  order: 4
---

"Read the repo and write the docs" produces prose nobody can falsify. Six months later no one can tell which sentences are still true. So `/dev-docs-init` writes no prose: you record **claims**, each carrying the evidence that would show it false, and a renderer turns them into documents.

## The set

The same eight documents in every project, defined once and configured with `docs.set`, which may only subset them.

| key | file | holds |
| --- | --- | --- |
| `context` | `docs/context.md` | why this exists, who it is for, what it deliberately does not do |
| `architecture` | `docs/architecture.md` | components, boundaries, data flow |
| `domain` | `docs/domain.md` | the glossary: terms, and what they mean here |
| `api` | `docs/api.md` | the external contract: what callers may depend on |
| `ux` | `docs/ux.md` | flows, screens, states, and their rules |
| `operations` | `docs/operations.md` | run it, deploy it, what breaks |
| `testing` | `docs/testing.md` | what is tested, how to run it, what deliberately is not |
| `security` | `docs/security-model.md` | trust boundaries, secrets, what is assumed |

`decisions` is in the set as a pointer to `docs.decisionsDir`. Records are `/dev-adr`'s job.

There is no `conventions.md`. A deterministic guideline belongs in the linter, and a non-deterministic one is unfalsifiable. See [Turn conventions into lint rules](/dev-workflow-documentation/use-cases/lint-rules/).

## The flow

```
/dev-docs-init
```

1. **Stage.** `docs init` refuses on a brownfield project and refuses with no `stage` set. `dev.mjs assess` proposes, `/dev-init` records.
2. **Scaffold.** `docs init [--only KEY,...]` writes the missing documents as stubs and registers each in the ledger with its hash. Idempotent.
3. **Record.** Claims go in as JSON, each naming its `target` document.

```json
{
  "claims": [
    { "text": "The HTTP entry point is src/server.ts", "kind": "observable",
      "anchor": "src/server.ts:12", "target": "architecture", "topic": "shape" },
    { "text": "Sessions are in memory because the service is single-instance for now",
      "kind": "intent", "source": "ayoub", "target": "architecture", "topic": "storage" }
  ]
}
```

```bash
node _dev-workflow/scripts/dev.mjs docs record @claims.json
node _dev-workflow/scripts/dev.mjs docs render architecture
```

4. **Check.** `docs check` exits 1 for a document that is missing, still a stub, or no longer matches the ledger. Run it in CI once the documents are real.

```
$ node _dev-workflow/scripts/dev.mjs docs
DOCUMENT      CLAIMS  STATE       PATH
------------------------------------------------------------------------
context       0       missing     docs/context.md
architecture  0       missing     docs/architecture.md
…
decisions     -       pointer     docs/decisions   → dev.mjs adr new "<title>"
```

## On a young project, most claims are `intent`

A two-week-old codebase yields a handful of anchored `observable` claims and a lot of attributed `intent` ones. That is the correct output. Six months later a reader can tell which sentences were ever checkable and which were one person's belief on a Tuesday.

## Hand edits survive

A generated document is registered with its hash. Edit one by hand and `docs render` refuses to overwrite it, `docs check` names it as hand-edited, and the next `ingest scan` puts it back in the extraction queue so the edit is absorbed as claims. The edit is never lost.
