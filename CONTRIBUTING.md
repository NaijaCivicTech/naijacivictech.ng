# Contributing to Naija Civic Tech

Thanks for helping. This project grows through small, reviewable changes that match how the codebase is already structured.

## Before you code

- Read [docs/architecture.md](./docs/architecture.md) so place-based work aligns with the **state → LGA → ward** model.
- Feature code belongs in **`features/<name>/`**; keep `app/<route>/` routes thin and import from there. See [features/README.md](./features/README.md).
- This repo uses a **non-stock Next.js** major version. If you touch framework APIs, check the in-tree docs under `node_modules/next/dist/docs/` and heed deprecations. Contributors using automation should also see [AGENTS.md](./AGENTS.md).

## Local development

```bash
npm install
npm run dev
```

Configure environment variables as needed for auth and database (see `.env.example` if present, or ask in your PR/issue). Do not commit secrets.

## Pull requests

- Keep the diff **focused** on one concern (feature, fix, or doc update).
- Match existing **naming, imports, and patterns** in the files you touch.
- Run **`npm run lint`** before opening a PR and fix any new issues you introduce.

## Questions

Open an issue for design or scope questions, or note them in your PR description so reviewers have context.
