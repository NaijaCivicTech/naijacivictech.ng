# PolitiLog NG — Functional Requirements Document

| Field | Value |
|--------|--------|
| **Version** | 0.1 |
| **Date** | 2026-04-03 |
| **Status** | Draft |
| **Related docs** | [VISION.MD](../VISION.MD), [Platform FRD](./platform-frd.md) |

---

## 1. Executive summary

**PolitiLog NG** is the political ledger tool on NaijaCivicTech: a **living record** of Nigerian public figures from local to federal level, combining **structured career timelines**, **citizen feedback** (text, links, media), and **ratings**, grounded in the platform’s **geopolitical spine**. Content moves through a **trust pipeline**: verified users and **reputation-weighted** endorsements (and/or moderators) control what becomes **public**; transparency rules govern **post-public rejection**.

---

## 2. Goals & non-goals

### 2.1 Goals

- **G-PL1** Citizens can **browse** politicians and timelines scoped by **state / LGA** (and ward where applicable).
- **G-PL2** Every **political tenure segment** records **party affiliation** (party can change across the career timeline).
- **G-PL3** **Unified timeline** supports **non-political career** segments (e.g. employment before politics) via **typed segments**.
- **G-PL4** Submissions and sensitive updates are **not public** until promotion rules are met (high-authority endorsements and/or moderator approval).
- **G-PL5** **Verified** identity and **reputation** influence weight of ratings and endorsements (with caps/fairness rules).
- **G-PL6** If content was **public** and is later **rejected**, it **remains visible** with a **flag and public note**, and is **excluded from active aggregates**, except where **safety/legal/PII** policies require redaction or removal of payload.

### 2.2 Non-goals (initial phases)

- Official INEC results ingestion as sole source of truth (may be linked as evidence).
- Guaranteed judicial or legal standing of user claims.
- Real-time sync with every government portal.

---

## 3. Personas

Same as platform (citizen, contributor, moderator, admin). PolitiLog-specific emphasis:

- **Local citizen** — Checks representatives for **their LGA/state**.
- **High-reputation endorser** — Can advance pending factual content per policy.
- **Moderator** — Breaks ties, handles cold regions, abuse, and policy exceptions.

---

## 4. Product context

- User **signs in** on the shared platform, opens **PolitiLog** from the **tool directory**.
- PolitiLog reads **user id**, **verification/reputation** attributes, and **location context** from the platform.
- Politicians and timeline segments **reference** platform **geo IDs** for jurisdiction (state/LGA/ward as appropriate for office type).

---

## 5. Glossary

| Term | Definition |
|------|------------|
| **Politician (profile)** | Canonical person record (name, photo, aliases, merge rules). |
| **Timeline segment** | One row in the career timeline: type, dates, title, org, optional geo, optional political extensions. |
| **Political tenure** | Segment type covering elected or clearly political office; carries **jurisdiction** + **party_id** (required for this type). |
| **Party** | Row in reference table (`APC`, `PDP`, …, plus `Independent`, `Non-partisan (appointed)`, `Unknown (historical)` as needed). |
| **Feedback** | User-generated content attached to a segment or profile (text, links, pictures) subject to moderation. |
| **Endorsement** | Weighted signal from eligible users to promote **pending** content to **public**. |
| **Promotion rule** | Configurable threshold: weighted sum from users with `verified` + `rep ≥ R`, optional diversity of endorsers, moderator override. |

---

## 6. Functional requirements

### 6.1 Discovery & navigation

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-PL-001** | P0 | From the hub, user can open PolitiLog and see entry points to browse by **geo** (state → LGA, search TBD). |
| **FR-PL-002** | P0 | Politician list/card shows **photo**, **name**, and **primary public jurisdiction** or current role summary (UX detail). |
| **FR-PL-003** | P1 | Filter **“political only”** vs **“full career”** on profile timeline. |

### 6.2 Profiles & timelines

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-PL-010** | P0 | Profile displays a **chronological timeline** of **segments** sorted by start date (configurable tie-break). |
| **FR-PL-011** | P0 | Segment **types** include at least: `political_office`, `employment`, `education`, `business`, `civil_society`, `appointment`, `other` (extensible). |
| **FR-PL-012** | P0 | **Political** segments require **office/jurisdiction** mapped to platform geo where applicable, and **party_id** (required). |
| **FR-PL-013** | P0 | **Non-political** segments do **not** require party; optional organization and free-text title. |
| **FR-PL-014** | P1 | Support **mid-tenure party change** via split segment or `party_affiliation_interval` model (implementation choice documented in tech spec). |
| **FR-PL-015** | P1 | **Decamping** appears as **different `party_id` on different political segments** (or intervals), not a single static “current party” only. |

### 6.3 Feedback, ratings, aggregates

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-PL-020** | P0 | Users can attach **feedback** (text, links, media) to a **segment** or profile per UX rules. |
| **FR-PL-021** | P0 | **Ratings** can be **reputation-weighted** for displayed aggregates; raw counts may be shown where policy allows. |
| **FR-PL-022** | P0 | **Overall profile score** is derived from **segment-level** ratings (formula TBD: e.g. weighted by recency, volume caps). |
| **FR-PL-023** | P1 | Optionally restrict rating eligibility to users whose **location context** overlaps segment jurisdiction (product policy). |

### 6.4 Moderation, visibility, transparency

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-PL-030** | P0 | New/changed sensitive content starts in **`pending`** (or `draft` → `pending`): **visible** to **submitter**, **moderators**, **admins**; **not** on public surfaces. |
| **FR-PL-031** | P0 | Content becomes **`public`** when **promotion rule** passes **or** **moderator/admin** approves. |
| **FR-PL-032** | P0 | **Bootstrap**: if insufficient endorsers exist in an area, **moderator path** must still allow publication (cold-start). |
| **FR-PL-033** | P0 | **Post-public rejection**: item stays **visible** with **flag + public note**; **excluded** from active score calculations; **audit** of transition stored. |
| **FR-PL-034** | P0 | **Exceptions**: for safety/legal/PII, system supports **redaction** or **payload removal** while retaining **metadata + reason** (admin workflow). |
| **FR-PL-035** | P1 | **Appeals** update status/note without pretending the public period never existed. |

### 6.5 Submissions & contributions

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-PL-040** | P0 | User can **propose** new politician, new segment, or new feedback when data is missing; receives **status** in their dashboard. |
| **FR-PL-041** | P1 | **Sources** (URLs, citations) encouraged or required for factual segments (policy per segment type). |

---

## 7. Workflows

### 7.1 AOC journey (citizen)

| Phase | Steps |
|--------|--------|
| **Awareness (A)** | Sign in → open PolitiLog from directory → browse politicians / geo. |
| **Orientation (O)** | Understand local scope; see trust cues (verified, rep); read segment types and party per tenure. |
| **Contribution (C)** | Submit segment/feedback → **pending** (visible to self + mod/admin) → endorsements and/or mod approval → **public**; possible later rejection with transparency banner. |

### 7.2 State machine (conceptual)

```text
draft → pending → public
                    ↘ rejected_visible (flagged, excluded from scores)
pending → rejected (never public) — optional path for never-published items
```

Exact states and transitions should be enumerated in implementation; **rejected_visible** applies only if item was **previously public** (FR-PL-033).

### 7.3 Visibility matrix

| Role / state | draft | pending | public | rejected_visible |
|--------------|-------|---------|--------|------------------|
| Public visitor | no | no | yes | yes (with flag) |
| Submitter | yes | yes | yes | yes |
| Moderator / admin | yes | yes | yes | yes (+ internal notes) |

---

## 8. Conceptual data model (PolitiLog)

**Reference**

- `party` — id, name, short_code, active_flag

**Core**

- `politician` — id, display_name, slug, photo_url, aliases[], merged_into_id (nullable), created_at
- `timeline_segment` — id, politician_id, segment_type, title, organization, start_date, end_date (nullable), state_id (optional), lga_id (optional), ward_id (optional), office_metadata (JSON or FKs), party_id (**required if** segment_type = political_office), submission_status, public_after (nullable), dataset refs
- `segment_feedback` — id, segment_id (or politician_id), author_id, body, attachments[], status, created_at
- `segment_rating` — id, segment_id, rater_id, value, weight_applied, created_at
- `endorsement` — id, target_type, target_id, endorser_id, weight, created_at
- `moderation_event` — id, target_type, target_id, actor_id, from_status, to_status, public_note, internal_note, created_at

Relationships and normal forms are left to engineering; this FRD defines **required concepts** and **rules**.

---

## 9. Non-functional requirements

| ID | Area | Requirement |
|----|------|----------------|
| **NFR-PL-001** | Abuse | Rate limits on submissions and endorsements; diversity rules for endorsers TBD. |
| **NFR-PL-002** | Audit | All moderation and promotion transitions logged. |
| **NFR-PL-003** | Performance | Profile read path paginates long timelines. |

---

## 10. Acceptance criteria (samples)

1. **Party per tenure** — Given two political segments for the same politician with non-overlapping dates, system stores **different** `party_id` values; UI shows party on each segment.
2. **Non-political segment** — Given segment_type `employment`, system does **not** require `party_id`; timeline still displays chronologically with political segments.
3. **Pending visibility** — Given a pending segment, anonymous user cannot see it; submitter and moderator can.
4. **Post-public rejection** — Given a public segment that is rejected, anonymous user still sees it with **flag and note**; aggregate rating excludes it from **current** score.
5. **Cold start** — Given zero eligible endorsers in LGA, moderator can still promote to public.

---

## 11. Traceability (VISION.MD)

| VISION.MD (PolitiLog) | This doc |
|------------------------|----------|
| Tenure history, promises, bills, attendance, ratings | §6.2–6.3 (timeline + ratings; bills/attendance as P1 extensions) |
| Community maintained, verified sources | §6.5 FR-PL-041, §5 Glossary sources |

---

## 12. Open questions

- Exact **promotion formula** (thresholds, caps, diversity).
- Whether **promises / bills / attendance** are **first-class segment types** or linked **metric** tables (VISION implies yes; schema phase TBD).
- Constituency and senatorial **district** as geo FKs vs free text until geo layer extends.

---

*End of document.*
