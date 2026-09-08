---
title: Upgrade a project
description: Bring the installed runtime and skills up to the latest release without re-answering the wizard.
sidebar:
  order: 5
---

A session tells you when there is something to upgrade to:

```
An update is available: 1.18.4 → 1.20.1 — npx claude-dev-workflow@latest --update
```

That line never updates anything. Running the command is your decision.

## Express

```bash
dw update                                   # global binary
npx claude-dev-workflow@latest --update     # nothing installed
node _dev-workflow/scripts/dev.mjs version --upgrade   # from inside the project
```

It refreshes `_dev-workflow/`, `.claude/skills/dev-*`, `.claude/agents/dev-*.md` and the hook entries in `.claude/settings.json`, and leaves every value you answered exactly as it is. It asks one kind of question only: a setting this version has that your config lacks. With no terminal it writes the default and prints which key it added.

`version --upgrade` refuses while those directories have uncommitted changes, because an update rewrites them and you need the diff to be legible. Commit first.

## Check before you run it

```
$ dw update --print
$ node _dev-workflow/scripts/dev.mjs version
installed  1.18.4  (installed 2026-08-31, updated 2026-09-07)
latest     1.20.1

1 file(s) differ from the manifest — an update will keep them:
  _dev-workflow/scripts/cmd/version.mjs
```

A file you edited under `_dev-workflow/` is reported and left alone. `--force` overwrites it. Editing the runtime is how a project ends up pinned to a change that is not in any release, so prefer opening an issue.

## Change config at the same time

```bash
dw update --reconfigure
```

The same refresh, then the whole wizard with your current values as the default answer to every question.

## A stale global binary

A global binary installs *its own* version. `update` asks the registry whether it is current and warns when it is not:

```bash
brew upgrade claude-dev-workflow      # or: npm update -g claude-dev-workflow
```

It refuses to move a project backwards when the binary is older than the project's copy. `--force` downgrades anyway.

## Commit the result

`git diff _dev-workflow/` after an update is the whole change. Commit it so teammates get the same version by pulling.
