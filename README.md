# Naija Civic Tech

Open-source civic platform for Nigeria: multiple tools on one site, with a **shared geographic layer** (state → LGA → ward) and a bias toward **public, auditable data**, so civic work compounds instead of living in isolated apps.

**Why it exists:** Nigeria has many people building civic tech; this project is a **working platform** for coordination, discovery, and transparent civic information—not a manifesto.

For principles and framing, see the in-app [About](https://naijacivictech.ng/about) page (or `app/about/page.tsx` when running locally).

## How this works

| Area | What it does |
| --- | --- |
| **Features** | Each product is a vertical slice under `features/<name>/`, with thin routes in `app/<feature>/` (for example PolitiLog: offices, ratings, and related flows). New tools follow the same pattern. Planned slices and specs live in `feature-plan/` (for example Fuel Watch); see [features/README.md](./features/README.md). |
| **Directory and pipeline** | A **civic project directory** and **pipeline** on the home page and `/directory` / `/pipeline` help people discover existing tools and move ideas from suggestion toward live (`features/civic-projects`). |
| **Geo architecture and data exploration** | Nigeria **state → LGA → ward** is the shared geographic spine for place-based data and UI. **Exploration** and office-related surfaces live under `app/geo` and `features/geo`. The data model and how features attach to it are in [docs/architecture.md](./docs/architecture.md). |

## Architecture

Deeper notes on the geographic index, data layer, and scope levels: [docs/architecture.md](./docs/architecture.md).

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, MongoDB (Mongoose), NextAuth.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI hot-reloads as you edit files.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).