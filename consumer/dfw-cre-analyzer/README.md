# DFW Commercial Real Estate Investment Analyzer

A data-driven dashboard that surfaces underpriced commercial real estate opportunities across the Dallas–Fort Worth metro area.

## What it Does

- **Ingests** commercial property listings across 180+ DFW ZIP codes
- **Scores** each property using a weighted underpricing algorithm (comp gap, Zestimate gap, cap rate yield)
- **Flags** investment signals: STRONG_BUY / BUY / WATCH / PASS
- **Surfaces** top deals through an interactive dashboard with map, filters, and property detail drill-down

## Scoring Algorithm

```
compGap    = (compAvgPpsf - listingPpsf) / compAvgPpsf     × 40%
zestGap    = (zestimate - listingPrice)  / zestimate        × 35%
rentYield  = (rentEstimate × 12 / listingPrice) / 0.08      × 25%
```

| Flag | Score | Confidence |
|------|-------|------------|
| STRONG_BUY | ≥75 | Not LOW |
| BUY | 55–74 | Any |
| WATCH | 35–54 | Any |
| PASS | <35 | Any |

## Quick Start

```bash
cd consumer/dfw-cre-analyzer
npm install
npm start
```

Dashboard: http://localhost:4002

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (better-sqlite3) |
| Frontend | Vanilla HTML/CSS/JS + Leaflet.js maps |
| Data | 60 realistic mock properties (Zillow API integration planned) |

## Dashboard Features

- **🔥 Top Deals** — Ranked STRONG_BUY and BUY opportunities
- **📋 All Listings** — Filterable, paginated table with 7 filter dimensions
- **🗺️ Map** — Interactive Leaflet map with color-coded markers by investment flag
- **📊 Market** — Flag distribution, property type breakdown, top ZIP codes by score
- **⚙️ Admin** — API quota tracking and usage monitoring
- **Property Detail** — Click any row for full score breakdown, comps table, price history

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/properties` | Filtered, paginated property list |
| `GET /api/v1/properties/:id` | Property detail with comps + history |
| `GET /api/v1/properties/map` | GeoJSON for map rendering |
| `GET /api/v1/properties/export` | CSV download |
| `GET /api/v1/market/summary` | KPI aggregates |
| `GET /api/v1/admin/quota` | API quota stats |

## Architecture

```
┌─────────────────────────────────────────────┐
│              Express Server (:4002)          │
├──────────┬──────────┬───────────────────────┤
│  Routes  │  Scoring │  Data Provider        │
│  (REST)  │  Engine  │  (Mock / Zillow API)  │
├──────────┴──────────┴───────────────────────┤
│              SQLite Database                 │
│  properties │ comps │ price_history │ quota  │
└─────────────────────────────────────────────┘
```
