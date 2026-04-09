# PolitiLog

Public routes: `/politilog`, `/politilog/[id]`, `/politilog/my-ratings`.

| Path | Role |
| --- | --- |
| `components/` | Client UI (board, profile, modals, timeline pieces) |
| `lib/` | Data, timeline, local storage, stores |
| `hooks/` | e.g. `usePolitilogLocalContext` |

Shared Nigeria party enums live in `lib/nigeria-political-parties.ts` (platform).
