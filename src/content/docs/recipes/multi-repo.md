---
title: Several repositories in one project
description: Route tickets to the right repo, run each repo's own checks, open PRs against the right upstream.
sidebar:
  order: 3
---

Sibling directories with their own `.git` are separate repositories. A branch lives in exactly one of them.

```json
"repos": [
  {
    "path": "frontend",
    "when": "UI, pages, forms, translations, Storybook, React",
    "checks": ["pnpm test:ci", "pnpm lint", "pnpm type-check"],
    "env": { "ASDF_NODEJS_VERSION": "22.22.0" },
    "remotes": ["origin", "upstream"],
    "scopes": ["feature", "bug", "components"],
    "github": "acme/frontend"
  },
  {
    "path": "backend",
    "when": "content types, Strapi APIs, plugins, admin behaviour",
    "checks": ["yarn test"],
    "github": "acme/cms"
  }
]
```

| Key | Used by |
| --- | --- |
| `when` | `/dev-task` picks the repo and says why. A ticket spanning both means a branch in each, landed in order. |
| `checks` | `/dev-done` runs them with the working directory set to that repo. |
| `env` | prepended to every command there, so a version manager resolves the right runtime. |
| `remotes` | everywhere the branch is pushed. |
| `scopes` | the commit scopes valid in that repo. |
| `github` | where pull requests open when branches push to a fork but PRs go to the parent. |

## `--repo`

Commands infer the repo from the directory they run in. A worktree sits under the repo it was cut from, so inference works there too. From outside every repo, pass `--repo frontend`. It accepts only the paths listed above, never the directory the branch is in.

## One issue list

On GitHub, `#42` is per repository. Name the one holding the issues:

```json
"github": { "repo": "acme/frontend", "issuesRepo": "acme/planning" }
```

## Notes that carry across sessions

Anything a session has to know that the code does not say goes in the notes file, shown on every `/dev-task`, `/dev-bug` and `/dev-done`:

```bash
node _dev-workflow/scripts/dev.mjs note "pnpm in frontend/, yarn in backend/, npm in neither"
node _dev-workflow/scripts/dev.mjs note "pnpm test is bare vitest in watch mode — use pnpm test:ci"
```
