# NaijaCivicTech — Platform Functional Requirements & System Specification

| Field | Value |
|--------|--------|
| **Version** | 0.3 |
| **Date** | 2026-04-09 |
| **Status** | Draft |
| **Related docs** | [VISION.MD](../VISION.MD), [Architecture](./architecture.md), [feature-plan/](../feature-plan/) and per-module FRDs (e.g. [PolitiLog FRD](./politilog-frd.md) for one domain) |

---

## 1. Executive summary

NaijaCivicTech is a **single civic platform** (one product deployment, **one identity**, many **modules** or surfaces) where people discover civic work, authenticate once, and contribute through domain-specific experiences. This document defines **only what is shared**: how **identity**, **geography**, **discovery**, and **trust/moderation** relate, connect, and bind modules—**not** the behaviour of any individual module. Module-specific requirements live in **module FRDs** and `feature-plan/` specs.

---

## 2. Goals & non-goals

### 2.1 Goals (platform)

- **G-P1** One account accesses the **hub** (directory, pipeline, navigation) and all deployed modules without per-module registration.
- **G-P2** Location-scoped civic data across modules can be **joined** on **stable platform geo IDs** (not display names alone).
- **G-P3** **Reference geography** is owned by the platform (persistent store, stable IDs, parent/child relationships); refresh and provenance are operational concerns, not duplicated ad hoc per module.
- **G-P4** **Trust and moderation** use **consistent platform primitives** where the platform enforces them (roles, baseline content states, transparency defaults); modules **plug in** and extend only where documented.
- **G-P5** Public data and APIs stay aligned with the **open data** direction in VISION.MD.
- **G-P6** **Reputation** is a **single global score** per user on the platform; modules feed it through agreed signals and weights, not separate competing reputation totals at the platform layer.

---

## 3. Stakeholders & personas

| Persona | Needs (platform scope) |
|---------|-------------------------|
| **Citizen** | Discover what exists, set **location context**, understand how shared account and rules apply. |
| **Contributor** | One identity; submissions flow through module UIs with predictable **moderation visibility** where unified. |
| **Moderator** | Platform or module queues (as defined); roles and permissions scoped consistently. |
| **Admin** | User/role management, emergency actions, **reference geo** lifecycle where the platform owns it. |
| **Researcher / journalist** | Eventually export or query **aggregated** open data as APIs mature (later phase). |

---

## 4. System context

### 4.1 High-level architecture

```text
                    ┌─────────────────────────────────────┐
                    │     NaijaCivicTech (single product)   │
                    │  ┌──────────┐ ┌──────────┐ ┌────────┐ │
                    │  │ Module   │ │ Module   │ │  …     │ │
                    │  │ (domain  │ │ (domain  │ │        │ │
                    │  │  UI+data)│ │  UI+data)│ │        │ │
                    │  └────┬─────┘ └────┬─────┘ └───┬────┘ │
                    │       │            │           │      │
                    │       └────────────┼───────────┘      │
                    │                    ▼                   │
                    │   Shared: Auth · Geo spine · Trust /   │
                    │   moderation hooks · Hub / directory   │
                    └─────────────────────────────────────┘
                                      │
              External: identity providers, email/SMS, maps CDN, etc.
```

- **Modules** own **domain models** and UX for their problem space.
- **Platform** owns **identity**, **reference geography**, **hub discovery** surfaces, and **cross-cutting policy hooks** (roles, shared moderation vocabulary, audit/transparency defaults where unified).

### 4.2 How modules connect to the platform

| Connection | Responsibility |
|------------|------------------|
| **Authentication** | Modules assume a **platform session** (or equivalent); user id is the join key for attribution and eligibility. |
| **Geo spine** | Modules **read** hierarchy and attach facts using **platform geo IDs** at the granularity the domain needs (state only, LGA, ward, etc.). |
| **Location context** | **User location context** (defaults, “near me”) comes from the platform’s **residence** model (current + history), not parallel string stores. |
| **Moderation & trust** | Modules implement **flows**; the platform defines **baseline roles**, **content-state vocabulary**, **transparency rules**, and the **global reputation score** where policy is unified (Section 9). Module FRDs define substates, queues, and how domain actions **feed** that score. |
| **Directory / pipeline** | Cross-module **discovery** and **staging of ideas** may list external or internal work; optional geo on listings is a platform concern until filters demand it. |

### 4.3 Geopolitical hierarchy (reference layer)

Mirrors Nigeria’s usual civic stack:

**National → geopolitical zone (derived from state) → state (incl. FCT) → LGA → ward.**

- Modules **attach** facts to one or more levels, as appropriate to the domain.
- **Aggregation** for cross-cutting dashboards rolls up using parent relationships.

### 4.4 Reference geography (platform store)

- Lives in the **database** with **platform-generated stable IDs** and explicit relationships (state → LGA → ward; zone linked to state where used).
- **Operational refresh** (imports, corrections) is platform/admin concern; modules consume the **current** reference via APIs or server-side reads.

---

## 5. Glossary

| Term | Definition |
|------|------------|
| **Geo spine** | Canonical state / LGA / ward entities and relationships the platform maintains. |
| **Module** | A domain surface (routes, UI, own persistence) that **depends on** platform identity and geo; specified outside this document. |
| **Hub** | Shared entry and discovery (e.g. directory, pipeline, global nav)—not a module’s private UX. |
| **Verification** | Account / identity trust signals, distinct from contribution reputation. |
| **Reputation** | A **single global platform score** per user, derived from activity across modules; how each module **feeds** the score is specified in module FRDs and platform integration rules. |
| **Location context** | User’s **current** (and historical) link to state / LGA / ward for defaults and rules. |

---

## 6. Functional requirements

Priority: **P0** = foundation; **P1** = next cross-platform slice.

| ID | Priority | Requirement |
|----|----------|-------------|
| **FR-P-001** | P0 | Users authenticate **once** and move between hub and modules **without re-registering** per module. |
| **FR-P-002** | P0 | Platform exposes **read access** to the geo hierarchy suitable for cascading selects and module queries (transport as implemented: HTTP routes, server actions, etc.). |
| **FR-P-003** | P0 | Geo entities use **stable internal IDs**; display names are not the sole join key. |
| **FR-P-004** | P0 | Reference geography is **durable** in the platform store with stable IDs; **change history / provenance** may be added for audit and refresh (design TBD). |
| **FR-P-005** | P0 | Users can maintain **location context** via platform **residence** records (at least state + LGA; ward as supported), including a **current** residence for defaults. |
| **FR-P-006** | P1 | Geopolitical **zone** is derivable from state for regional/national views. |
| **FR-P-007** | P1 | **Materialized or cached aggregates** at LGA/state for cross-module views (may stub early). |
| **FR-P-008** | P1 | **Open export/API** for non-sensitive aggregates; scope and rate limits TBD. |

### 6.1 Acceptance notes (FR-P-002 / FR-P-003)

- Given a ward id, the system can resolve LGA and state.
- Given an LGA id, the system can list child wards and parent state.

---

## 7. User journeys (platform-level)

1. **Discover** — Land on the hub; browse directory/pipeline or navigation to find modules and external civic work.
2. **Authenticate** — Sign in; session valid across hub and modules in the same deployment.
3. **Orient** — Set or confirm **location context** (onboarding or settings) via platform residence.
4. **Enter a module** — Module reads **user** and **geo** context from the platform; domain rules apply per module FRD.
5. **Contribute** — Submissions use module-specific flows; **moderation and visibility** follow platform baselines (Section 9) plus module extensions documented in the module FRD.

---

## 8. Conceptual data model (platform-owned vs module-owned)

**Platform — reference geography**

- State, LGA, ward entities with stable ids and parent links; geopolitical zone associated to state where required.
- (Optional future) Dataset or import metadata for refresh audit—when introduced, remains platform-owned.

**Platform — identity & residence**

- **User** — authentication identifiers, profile fields, admin/moderator flags as implemented.
- **Reputation (aggregate)** — one **global** platform score per user; modules contribute via agreed signals or events (weights and aggregation logic are platform-owned; module FRDs define domain-specific inputs).
- **Residence history** — links user to state / LGA / ward with at most one **current** residence for platform defaults; visibility of residence to others is a platform policy field.

**Platform — hub / cross-cutting listings** (as applicable)

- Directory and pipeline entities that **describe** tools and ideas; may reference users and optional geo without duplicating module domain tables.

**Modules**

- **Separate** persistence per domain, **foreign-keyed** to platform `user` id and geo ids as needed. Schema and moderation tables are **not** specified here.

---

## 9. Trust, safety & transparency (cross-module)

This section is the **contract** between platform and modules. Module FRDs may add substates, queues, and scoring **without** contradicting these defaults unless an explicit exception is approved.

### 9.1 Roles (baseline)

- At minimum: **citizen** (authenticated user), **moderator**, **admin**.
- Optional: **curator** / high-trust flags; exact matrix and assignment live in implementation and module specs.

### 9.2 Content states (vocabulary)

- Baseline lifecycle concepts: **draft**, **pending** (awaiting review), **public**, **rejected** / **withdrawn**.
- Modules may define **substates** (e.g. “needs evidence”) but should map to this vocabulary for cross-cutting reporting and admin tooling where feasible.

### 9.3 Moderation flow relationship

- **Platform** defines who may **see** pre-public content at a high level (role gates).
- **Modules** own **what** is submitted, **which** queue it enters, and **domain-specific** rejection reasons.
- **Escalation**: severe cases (legal, safety) follow admin paths on the platform; modules surface **flags** into that path as required by policy.

### 9.4 Transparency default

- If content was **public** and later **rejected**, default policy is **remain visible with flag and public note**, excluded from active aggregates—subject to **legal, safety, and PII** exceptions (redaction or payload removal with **retained audit metadata**). Module FRDs detail exceptions for their domains.

### 9.5 Verification vs reputation

- **Verification** (account/contact) is a platform-level concept modules may read.
- **Reputation** is a **single global score** on the platform per user. Modules do not own separate competing reputation totals for the same user at the platform layer; they define **what contributions count** and **how strongly** they influence the global score in their FRDs, subject to platform aggregation rules.

---

## 10. Non-functional requirements

| ID | Area | Requirement |
|----|------|-------------|
| **NFR-P-001** | Security | Authn/authz on mutating APIs; least-privilege for moderator/admin. |
| **NFR-P-002** | Privacy | Minimize PII in logs; retention policies for submissions documented per module where data is collected. |
| **NFR-P-003** | Reliability | Geo reference **read** path should tolerate caching; writes are infrequent and controlled. |
| **NFR-P-004** | Accessibility | Hub and shared chrome target WCAG-minded patterns (specific level TBD). |

---

## 11. Phasing alignment (VISION.MD)

Phases describe **platform capability**, not named products.

| VISION phase | Platform focus |
|--------------|----------------|
| **Phase 1 — Foundation** | Geo spine, auth, hub discovery, first modules on shared user + geo ids; baseline moderation vocabulary. |
| **Phase 2 — Expand** | More modules; harden read APIs and exports. |
| **Phase 3 — Connect** | Cross-module metrics and aggregated civic indices on shared geo keys. |

---

## 12. Traceability

| Source | This doc |
|--------|----------|
| VISION.MD — platform / data / phasing | Sections 2.1, 4, 6, 11 |
| VISION.MD — open data | G-P5, FR-P-007 / FR-P-008 |
| Implementation geography | [architecture.md](./architecture.md) |

Per-module requirements are **not** traced here; see each module FRD.

---

*End of document.*
