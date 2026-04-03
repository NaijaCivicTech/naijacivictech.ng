# NaijaCivicTech — Platform Functional Requirements & System Specification

| Field | Value |
|--------|--------|
| **Version** | 0.1 |
| **Date** | 2026-04-03 |
| **Status** | Draft |
| **Related docs** | [VISION.MD](../VISION.MD), [PolitiLog FRD](./politilog-frd.md) |

---

## 1. Executive summary

NaijaCivicTech is a **single civic platform** (analogous in spirit to Stack Exchange: **one identity**, many purpose-built surfaces) where Nigerians access and contribute civic data. Tools such as **LightUp NG**, **PolitiLog NG**, and future modules share **authentication**, a **geopolitical reference layer** (state → LGA → ward), and **cross-cutting trust primitives** (verification, reputation, moderation). This document specifies how those shared pieces work together, what the platform must deliver in Phase 1, and what is explicitly deferred.

---

## 2. Goals & non-goals

### 2.1 Goals (platform)

- **G-P1** One account signs into all tools exposed from a **shared directory** or hub.
- **G-P2** All location-scoped civic data can be **joined** on stable **geo IDs** (not only display names).
- **G-P3** Reference geography is **versioned** and **importable** from a canonical seed (e.g. 37 state-level units including FCT, 774 LGAs, wards with optional centroids).
- **G-P4** Contribution and trust rules are **consistent** where they apply across tools (e.g. moderation visibility, audit concepts).
- **G-P5** Public data and APIs remain aligned with the **open data** direction in VISION.MD.

### 2.2 Non-goals (platform, for this phase)

- Replacing INEC or any government system of record.
- Final legal/compliance sign-off (policies referenced; legal review TBD).
- Mandating a specific deployment topology (monorepo vs multi-app) in this document; implementation may evolve.

---

## 3. Stakeholders & personas

| Persona | Needs |
|---------|--------|
| **Citizen** | Discover tools, set location context, contribute, see public outcomes. |
| **Contributor** | Submit data, track pending items, build reputation through verified contributions. |
| **Moderator** | Review queues, approve/reject, apply flags; see pre-public content. |
| **Admin** | Configure tools, users, roles, emergency takedowns, dataset versions. |
| **Researcher / journalist** | Export or query aggregated open data (Phase 2+ as APIs mature). |

---

## 4. System context

### 4.1 High-level architecture

```text
                    ┌─────────────────────────────────────┐
                    │     NaijaCivicTech (single product)   │
                    │  ┌─────────┐  ┌─────────┐  ┌────────┐ │
                    │  │ Tool A  │  │ Tool B  │  │  ...   │ │
                    │  │(e.g.    │  │(e.g.    │  │        │ │
                    │  │LightUp) │  │PolitiLog)│  │        │ │
                    │  └────┬────┘  └────┬────┘  └───┬────┘ │
                    │       │            │           │      │
                    │       └────────────┼───────────┘      │
                    │                    ▼                   │
                    │     Shared: Auth · Geo spine · Trust   │
                    └─────────────────────────────────────┘
                                      │
              External: INEC/geo sources, email/SMS, maps CDN, etc.
```

- **Tools** own **domain models** (outages, politicians, incidents).
- **Platform** owns **identity**, **geo reference**, and **shared policy hooks** (roles, reputation, moderation states where unified).

### 4.2 Geopolitical hierarchy (reference layer)

Mirrors Nigeria’s usual civic stack:

**National → geopolitical zone (derived) → state (incl. FCT) → LGA → ward.**

- Tools **attach** facts to one or more levels (e.g. ward for roads, LGA for fuel or power summaries).
- **Aggregation** for dashboards rolls up using parent relationships.

### 4.3 Reference data source (v1)

- Initial seed may be loaded from a structured file (e.g. **37** state-level rows, **774** LGAs, **~8,809** wards with optional lat/lng centroids).
- Production rule: store in the **database** with **platform-generated stable IDs**; keep **source + version** metadata for refresh and audit.

---

## 5. Glossary

| Term | Definition |
|------|------------|
| **Geo spine** | Canonical `state` / `lga` / `ward` entities and relationships. |
| **Tool** | A product surface (e.g. PolitiLog) with its own routes, UI, and domain tables. |
| **Verification** | Identity / account trust (e.g. verified contact), distinct from reputation. |
| **Reputation** | Score or tier derived from contribution quality and history (exact formula per tool + platform policy). |
| **Location context** | User’s primary LGA/ward (and state) used for defaults and eligibility rules. |

---

## 6. Functional requirements

Priority: **P0** = required for foundation; **P1** = next slice / cross-tool polish.

| ID | Priority | Requirement |
|----|----------|----------------|
| **FR-P-001** | P0 | Users can authenticate once and access multiple tools from a **directory** or hub without re-registering per tool. |
| **FR-P-002** | P0 | Platform exposes **read APIs or data access** for geo hierarchy suitable for cascading selects and tool queries (exact transport TBD: REST/Server Actions). |
| **FR-P-003** | P0 | Geo entities use **stable internal IDs**; display names are not the sole join key. |
| **FR-P-004** | P0 | Reference geo dataset is **loadable** via seed/migration and records **dataset version** or effective date. |
| **FR-P-005** | P0 | User profile (or equivalent) can store **primary location context** (at least state + LGA; ward optional per product decision). |
| **FR-P-006** | P1 | Geopolitical **zone** derivable from state for national/regional views. |
| **FR-P-007** | P1 | **Materialized or cached aggregates** at LGA/state for cross-tool dashboards (VISION Phase 3; may stub in Phase 1). |
| **FR-P-008** | P1 | **Open export/API** for non-sensitive aggregates; scope and rate limits TBD. |

### 6.1 Acceptance notes (FR-P-002 / FR-P-003)

- Given a `ward_id`, the system can resolve `lga_id` and `state_id`.
- Given an `lga_id`, the system can list child wards and parent state.

---

## 7. User journeys (platform-level)

1. **Discover** — Land on hub; see listed tools (LightUp, PolitiLog, …).
2. **Authenticate** — Sign in; session valid across tools in the same deployment.
3. **Orient** — Set or confirm location context (onboarding or settings).
4. **Use a tool** — Navigate into a tool; tool reads geo + user context from platform.
5. **Contribute** — Tool-specific submission flows; shared moderation/reputation hooks where specified (see PolitiLog FRD for PolitiLog rules).

---

## 8. Conceptual data model (platform)

**Core reference (owned by platform)**

- `geo_state` — id, name, code (optional), zone_id (optional), dataset_version_id
- `geo_lga` — id, state_id, name, dataset_version_id
- `geo_ward` — id, lga_id, name, centroid_lat, centroid_lng (optional), dataset_version_id
- `geo_dataset_version` — id, source_label, imported_at, notes

**Identity (owned by platform)**

- `user` — auth provider ids, verification flags, reputation summary (optional aggregate), primary_lga_id / primary_ward_id (as decided)

**Tool domains**

- Separate collections/tables per tool, **foreign-keyed** to `user` and geo IDs as needed.

---

## 9. Trust, safety & transparency (cross-tool principles)

- **Roles**: at minimum `citizen`, `moderator`, `admin`; optional `curator` / high-rep endorser role flags.
- **Content states**: at minimum `draft`, `pending`, `public`, `rejected` / `withdrawn`; tool-specific substates allowed.
- **Transparency**: if content was **public** and later **rejected**, default policy is **remain visible with flag and public note**, excluded from active scores—subject to **legal/safety/PII** exceptions (redaction or removal of payload with retained audit metadata). Details per tool FRD.

---

## 10. Non-functional requirements

| ID | Area | Requirement |
|----|------|----------------|
| **NFR-P-001** | Security | Authn/authz on mutating APIs; least-privilege for moderator/admin. |
| **NFR-P-002** | Privacy | Minimize PII in logs; document retention for submissions TBD. |
| **NFR-P-003** | Reliability | Geo reference read path should tolerate caching; writes rare (admin import). |
| **NFR-P-004** | Accessibility | Hub and shared chrome target WCAG-minded patterns (specific level TBD). |

---

## 11. Phasing alignment (VISION.MD)

| VISION phase | Platform focus |
|--------------|----------------|
| **Phase 1 — Foundation** | Geo spine + auth + two tools (LightUp, PolitiLog) on shared IDs. |
| **Phase 2 — Expand** | Additional tools; harden APIs/exports. |
| **Phase 3 — Connect** | Cross-tool metrics and aggregated civic indices on shared geo keys. |

---

## 12. Traceability

| VISION.MD section | This doc |
|-------------------|----------|
| Platform tools | §4, §7 |
| Data strategy / open data | §2.1 G-P5, FR-P-007 / FR-P-008 |
| Phasing | §11 |

---

## 13. Open questions

- Cookie/session strategy if tools ever split across subdomains (`*.naijacivictech.ng`).
- Whether **reputation** is one global score or per-tool with a platform rollup.
- Constituency / senatorial district as first-class geo (post–Phase 1 for election-grade PolitiLog).

---

*End of document.*
