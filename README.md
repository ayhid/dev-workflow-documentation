# dev-workflow-documentation

The documentation site for [claude-dev-workflow](https://github.com/ayhid/claude-dev-workflow), published at <https://ayhid.github.io/dev-workflow-documentation/>.

Built with [Starlight](https://starlight.astro.build). The content is written from the tool's source and its own `README.md` and `docs/`, which stay the source of truth.

```bash
npm install
npm run dev       # local preview
npm run build     # dist/
```

Pages live under `src/content/docs/`: `quick-start.md`, then `use-cases/`, `recipes/` and `reference/`. Every push to `main` deploys through `.github/workflows/deploy.yml`.
