---
title: Quick start
description: From nothing installed to a first ticket landed as a pull request.
sidebar:
  order: 1
---

Node 22 or newer, `jq` for the commit hook, and the [GitHub CLI](https://cli.github.com) authenticated. GitHub Issues needs nothing else. YouTrack needs a token, covered in step 2.

## 1. Install the tool

Pick one. All three run the same installer.

```bash
brew tap ayhid/claude-dev-workflow https://github.com/ayhid/claude-dev-workflow
brew trust --formula ayhid/claude-dev-workflow/claude-dev-workflow
brew install claude-dev-workflow
```

```bash
npm install -g claude-dev-workflow
```

```bash
npx claude-dev-workflow@latest        # nothing installed; always spell @latest
```

The global binary is `claude-dev-workflow`, or `dw` for short.

## 2. Initialise the project

```bash
cd your-project
dw init
```

The wizard asks which tracker first, and everything after follows from that answer.

- **GitHub Issues**: it proposes the repository from your `origin` remote, checks `gh` can write to it, and maps each rung of your state ladder onto a label the repository already has. A missing label is printed as the `gh label create` command to run. It never creates one itself.
- **YouTrack**: it asks for the instance URL and a token. Create one under *Profile → Account Security → Authentication → New token* with the `YouTrack` scope, then export it as `YOUTRACK_TOKEN` or give the wizard a 1Password reference such as `op://Private/youtrack/credential`. It then reads the project's real State, Type and Priority values off the API.

It writes `.dev-workflow.json` and installs the workflow into the project:

```
your-project/
  .dev-workflow.json              # your config, edit this, commit it
  _dev-workflow/                  # runtime; commit it, never edit it
  .claude/
    skills/dev-*                  # the fifteen skills
    agents/dev-*.md               # the subagents the skills dispatch
    settings.json                 # four hooks merged in beside your own
```

Commit all of it. That is how a teammate gets the same workflow without installing anything.

Add two lines to `.gitignore`. The installer never touches that file.

```text
.worktrees/
_dev-workflow/_config/updatecheck.json
```

## 3. Start a ticket

In Claude Code, in the project:

```
/dev-task #42
/dev-task the CSV export times out on big accounts     # no issue yet: it files one first
```

`/dev-task` is the front door. It routes to the step the work is at: `/dev-file` when there is no issue yet, `/dev-plan` when there is no plan, `/dev-build` to build. The plan restates the acceptance criteria as a checklist, proposes an approach, and is posted on the ticket once you approve it. **Nothing is edited until then.** Then `/dev-build` runs one command:

```
$ node _dev-workflow/scripts/dev.mjs start '#42'
issue:    #42 — csv export: stream rows instead of buffering the whole account
repo:     . (/Users/you/your-project)
branch:   fix/42-csv-export-stream-rows   (base: main, type: fix)
mode:     worktree → /Users/you/your-project/.worktrees/fix-42-csv-export-stream-rows
state:    In Progress

cd /Users/you/your-project/.worktrees/fix-42-csv-export-stream-rows
```

The ticket is now in progress and checked out in its own directory. Your main checkout is untouched.

## 4. Implement

Commits carry the issue ID in the configured pattern, and a hook blocks any that do not:

```
feat(export): stream CSV rows (#42)
```

With `tdd` on, the default, each criterion goes through `/dev-tdd`: a failing test first, the least code that passes it, a refactor while green.

## 5. Land it

```
/dev-done
```

It re-reads the ticket, walks every criterion with evidence, runs the project's checks, and shows a dry run of how the work would land:

```
$ node _dev-workflow/scripts/dev.mjs land
issue:    #42 — csv export: stream rows instead of buffering the whole account
repo:     . (/Users/you/your-project/.worktrees/fix-42-csv-export-stream-rows)
checkout: worktree; base lives in /Users/you/your-project
branch:   fix/42-csv-export-stream-rows → main
delivery: pr   (dry run — pass --apply)
action:   open a pull request fix/42-csv-export-stream-rows → main
reviewer: (none configured)
then:     dev.mjs sync --apply moves the ticket to the review state
```

On your confirmation it runs `land --apply`: the branch is pushed, the pull request opened, the ticket moved to the review state. Once the PR merges, `dev.mjs sync --apply` moves the ticket to done. A solo project sets `delivery.mode` to `direct` once and skips the pull request entirely.

## Where next

- [How a ticket flows on GitHub Issues](/dev-workflow-documentation/use-cases/github-issues/) or [on YouTrack](/dev-workflow-documentation/use-cases/youtrack/)
- [Direct delivery instead of pull requests](/dev-workflow-documentation/recipes/delivery-direct-vs-pr/)
- [Every configuration key](/dev-workflow-documentation/reference/configuration/)
