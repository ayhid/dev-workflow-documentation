---
title: Turn conventions into lint rules
description: Take every guideline a project only states and make its own linter decide it.
sidebar:
  order: 5
---

A coding guideline is one of two things. Deterministic, like "no `console.log` in `src/`", in which case a linter can decide it and a document restating it is a weaker second copy. Or not deterministic, like "keep functions small", in which case nobody can be shown to have violated it, so nobody is.

Both point away from a document. `/dev-lint-rules` fills the hole that leaves: it reads the conventions a project already states and turns each into a rule its own linter can decide, with the count of violations it would flag today.

## 1. See what is already enforced

```
$ node _dev-workflow/scripts/dev.mjs rules
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

Two lines change what happens next. **Not linted at all** means a language nothing covers: the skill names the standard tool and stops, because installing a linter is your decision. **Conventions are stated in** is the material: every imperative in those files is a candidate rule.

`--json` returns the same as data, with a count recipe per linter.

## 2. Run the skill

```
/dev-lint-rules
/dev-lint-rules imports      # one surface only
```

For each stated convention it produces one of four outcomes:

| Outcome | Meaning |
| --- | --- |
| a rule | the linter can decide it; presented with the count it would flag today |
| a hook | deterministic but outside the linter's reach, such as a commit message shape |
| an `intent` claim | a stated position with a reason, recorded in the docs ledger |
| noise | restated in review for years and undecidable; delete it |

Nothing is written without approval of the whole batch. The skill never invents a linter: a rule that will never run looks like coverage and is worse than none.

## Why the count matters

A rule presented with "would flag 340 lines today" is a different decision from one that flags none. The first is a migration; the second is free. Seeing the number before enabling the rule is what stops a convention from being switched on and immediately disabled.
