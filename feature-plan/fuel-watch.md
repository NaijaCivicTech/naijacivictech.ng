# Fuel Watch

## Goal

**Fuel Watch** is a civic feature for **transparent fuel pricing** along the supply chain: from **refinery / wholesale reference** context down to **pump prices** at filling stations, including **informal (black market)** sales where relevant. Citizens submit structured logs with **evidence**; **admins approve** entries before they appear publicly.

## Non-goals (first slice)

- Instant publication without moderation.
- Treating black market entries as licensed retail or verified “companies” in the legal sense.
- Implying a simple formula (e.g. refinery price + margin = pump price)—logistics, taxes, forex, and product mix break that narrative.

## User stories

- As a citizen, I log a purchase: **product**, **price** (and/or amount paid), **where** (filling station or informal context), **state + LGA**, and at least **one proof** (receipt, pump display photo, price board photo, or “other” during cold start).
- As a citizen, I can attach **multiple proofs** for one entry.
- As an admin, I **review** pending entries, **reject** or **approve**, and during confirmation I can **create or link** canonical **filling station companies**, **brands/subsidiaries**, and **stations** when the submitter used free text during cold start.
- As a visitor, I see only **approved** data, clearly labeled by **channel** (licensed station vs black market vs curated refinery reference).

## Product taxonomy

- **Category:** `fuel` (umbrella for this feature; leaves room for other energy products later).
- **Product type (required on each log):** e.g. **petrol / PMS**, **diesel**, **kerosene** (one canonical enum in code; UI may show “Gasoline / Petrol”).

## Proof

- **Minimum:** at least **one** proof per entry.
- **Allowed types:** payment receipt, photo of pump reader, photo of station price list/board, **multiple types** optional.
- **Cold start:** allow proof type **`other`** when the above do not apply; admin judges plausibility.
- **Privacy:** receipts may contain card/phone data—product copy should encourage **cropping**; future processing may blur sensitive fields.

## Data model (conceptual)

- **Filling station marketer / company** → **subsidiary or operating brand** (optional) → **station** (concrete place: name, address or coordinates, LGA, state).
- **Submission** links to a **station** when known, or carries **provisional** `stationName` + **state** + **LGA** until admin attaches a canonical **station** (and parent entities) on approve.
- **Black market:** treat as a **synthetic parent** in the same picker (e.g. company = “Black market” / “Informal sale”) **or** model as **`channel: black_market`** with no real marketer—document the choice in implementation. Subsidiaries may be unused; granularity is often **LGA** + optional landmark text (**not** promoted as a verified station).
- **Refinery / ex-refinery layer (separate stream, same product umbrella):** curated rows with **source attribution** (official notice, published template, vetted link), **product**, **effective date**, and clear **price definition** (ex-refinery vs depot vs other). Stricter sourcing than citizen pump logs; optional citizen uploads only with very strict proof rules.

## Moderation

- States: e.g. `pending` → `approved` | `rejected` (optional `needs_info`).
- Rejection should support a **short reason** to improve resubmissions.
- On approve: **deduplicate** against existing brands/stations in the same LGA where possible before creating new records.

## Dependencies

- Auth and roles (admin vs citizen)—see [authentication-nextauth.md](./authentication-nextauth.md).
- Persistent storage and file uploads for proofs—see [database-mongodb.md](./database-mongodb.md).

## Definition of done (MVP spec)

- [ ] Written spec (this doc) accepted; implementation plan can reference it.
- [ ] Implementation tickets split: **(1)** station logs + proof + admin queue, **(2)** refinery reference module, **(3)** black market channel UX and labels.

## Definition of done (product MVP—when built)

- [ ] Citizen can submit fuel log with required fields, product type, and ≥1 proof; optional multiple proofs.
- [ ] Admin can approve/reject and attach/create company → station hierarchy from provisional submissions.
- [ ] Public views show only approved data; black market and refinery rows are **clearly labeled** and not conflated with licensed retail.
- [ ] Privacy guidance for receipt uploads is visible in the submission flow.
