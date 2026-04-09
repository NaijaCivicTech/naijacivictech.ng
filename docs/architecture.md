# Architecture

## Geography as the shared spine

Naija Civic Tech treats **Nigeria state → LGA → ward** as the **common geographic index** across products (PolitiLog, Fuel Watch, future NEPA Watch, and other civic surfaces).

**Goals:**

- A resident can focus on **what matters near them** (ward, LGA, or state) while still being able to zoom out to **national** views.
- New features should **attach to this hierarchy** where the subject is place-based (prices, outages, local politics, etc.), using consistent IDs and filters.
- **Users** link to places through **`user_residences`** (history + `isCurrent`), not duplicate ad-hoc location strings—so defaults and personalization stay aligned with the same tree.

**Scope levels (typical):**

| Level | Use case |
| --- | --- |
| **National** | Country-wide aggregates, federal roles, cross-state compare |
| **State** | State capitals, governors, statewide signals |
| **LGA** | Local council–scale data (e.g. fuel clusters, many civic submissions) |
| **Ward** | Finest electoral / neighbourhood granularity when the feature needs it |

Not every feature must require all four; some may only use **state + LGA**. Optional geo on cross-cutting features (e.g. project directory) is fine until product needs filters.

## Data and code

| Piece | Location |
| --- | --- |
| Canonical geo seed | `seeds/full.json` |
| Mongo models | `NigeriaState`, `NigeriaLga`, `NigeriaWard` in `lib/models/` |
| DB seed script | `pnpm run db:seed:geo` → `scripts/seed-nigeria-geo.ts` |
| Read-only app meta from JSON | `data/nigeria-state-meta.ts` (imports seed JSON; prefer DB/API when wired) |
| User ↔ place history | `UserResidence` (`user_residences`), `User.profileVisibility` for what others may see |

## Feature modules

Vertical slices live under `features/` (see `features/README.md`). Each feature should document how it maps to **national / state / LGA / ward** in its own spec under `feature-plan/` when relevant.
