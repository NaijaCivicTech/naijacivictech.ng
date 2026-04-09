# Feature modules

Product features live here as **vertical slices** (UI, hooks, feature-specific lib). Shared platform code stays under `lib/`, `components/civic/` (site shell), and `data/`.

| Folder | Product |
| --- | --- |
| `civic-projects/` | Project directory + pipeline boards (shared listings domain) |
| `politilog/` | PolitiLog — officeholders, ratings, proposals |
| `fuel-watch/` | Fuel Watch — planned; see `feature-plan/fuel-watch.md` |

**Routing:** `app/<feature>/` stays thin and imports from `@/features/<feature>/…`.

**Assets:** use `public/<feature>/` for static URLs, or colocate under `features/<feature>/` when importing into components.
