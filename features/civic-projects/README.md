# Civic projects (directory + pipeline)

Listed civic tech projects: **directory** (approved listings) and **pipeline** (idea → live stages). Both use the same `Project` model and `/api/projects` with different `scope` values.

| Path | Role |
| --- | --- |
| `components/DirectoryBoard.tsx` | `/directory` and home preview |
| `components/PipelineBoard.tsx` | `/pipeline` and home preview |

Shared API, hooks (`use-civic-feeds`, `use-civic-vote`), models, and modals stay under `lib/` and `components/civic/`.
