---
title: Installer
description: dw init, update and version, what they write, and what they refuse.
sidebar:
  order: 5
---

`claude-dev-workflow`, or `dw`, is the global binary from Homebrew or npm. `npx claude-dev-workflow@latest` is the same installer with nothing installed. It always installs **into the project**, and a project commits what it installs.

```
$ dw help
  init                    the wizard: which tracker, which states, which branch pattern
  update                  express — refresh the files to this binary's version, keep every
                          value you answered; refuses to downgrade a project unless --force
  update --reconfigure    change config — refresh, then the wizard, current values as defaults
  update --print          show what would change, write nothing
  version                 this binary's version
  help                    this message
```

The flags `--update`, `--update --reconfigure`, `--dir <path>`, `--print` and `--force` spell the same commands, and every line reads as `npx claude-dev-workflow@latest <the same flags>`.

## What it writes

Exactly three roots, and one shared file it merges into:

- `_dev-workflow/` with `lib/`, `scripts/`, `hooks/` and `_config/manifest.json`, a sha256 per installed file
- `.claude/skills/dev-*/`
- `.claude/agents/dev-*.md`
- `.claude/settings.json`, merged: your hooks survive, ours are matched by command string

A planned write outside those roots is a hard error. It never touches `.gitignore`, and it never writes to your issue tracker: a GitHub label it needs is printed as the `gh label create` command.

`_dev-workflow/artifacts/` is the project's own generated data, written by `ingest`, `reorg` and `docs`. The installer never plans, hashes or deletes it.

## `init`

The wizard, in order:

1. Which tracker. GitHub Issues is proposed when `origin` points at github.com.
2. What that tracker needs, verified before anything is written: an instance URL and token for YouTrack, a repository `gh` can write to for GitHub.
3. The rest from the tracker itself: YouTrack's real State, Type and Priority values, or the labels the GitHub repository carries, mapped onto the ladder.
4. A scan of the tree for repos, package managers, test and lint scripts, commitlint types and scopes, runtime pins and remotes.
5. Where issue IDs go in a commit subject, inferred from the last 50 commits.
6. Write `.dev-workflow.json` and install the payload.

On a project that already has an install it triages first: express update, keep, or replace.

```bash
dw init --dir ../other-project   # target somewhere else
dw init --print                  # show the config, write nothing
dw init --force                  # overwrite files you have edited
```

## `update`

Express. Refreshes the payload to the binary's version and touches nothing you answered. It asks one kind of question only: a setting this version has that your config lacks. With no terminal it writes the default and prints which key it added. A complete config comes out byte-identical.

Files are compared against the manifest: untouched ones are replaced, edited ones reported and left alone, ones no longer shipped removed. `--force` overrides that.

It refuses to move a project backwards when the binary is older than the installed copy, and names the upgrade command for the binary. It asks the npm registry whether the binary itself is current and says "up to date" only on the registry's word.

`update --reconfigure` does the same refresh, then runs the whole wizard with current values as defaults.

## Always `@latest`

npx caches by the literal spec string, so a bare `npx claude-dev-workflow` re-runs whatever version it cached first, forever. `latest` is a dist-tag and is re-resolved. The `github:` form has no version to compare: bust it by changing the spec, `#v2.1.0` or a sha, not by clearing the cache.

`npx github:ayhid/claude-dev-workflow` installs from `main`, one release ahead of npm.

## From inside a project

```bash
node _dev-workflow/scripts/dev.mjs version              # installed vs latest, and files you edited
node _dev-workflow/scripts/dev.mjs version --upgrade    # runs the installer for you
```

`--upgrade` uses the global binary only when it already reports the latest release, and falls back to `npx …@latest` otherwise. It refuses while `_dev-workflow/`, `.claude/skills/` or `.claude/agents/` has uncommitted changes.
