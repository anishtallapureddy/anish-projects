# CostSeg Pro

**Generate professional cost segregation analysis reports for residential properties in minutes — not months.**

Cost segregation is a tax strategy that reclassifies building components into shorter-life IRS asset categories, accelerating depreciation deductions and generating significant upfront tax savings. Traditional engineering-based studies cost $5,000–$15,000. CostSeg Pro delivers comparable analysis for a fraction of the cost.

[![Status](https://img.shields.io/badge/status-MVP-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## ✨ Features

### Classification Engine
Automatically allocates property costs across IRS depreciation categories using industry benchmark data:

| Category | Recovery Period | Examples |
|---|---|---|
| Personal Property (§1245) | **5-year** | Carpeting, appliances, window treatments, dedicated electrical |
| Personal Property (§1245) | **7-year** | Office furniture, specialized equipment |
| Land Improvements (§1250) | **15-year** | Landscaping, driveways, fencing, outdoor lighting |
| Building / Structural (§1250) | **27.5-year** | Walls, roof, foundation, HVAC, main plumbing |
| Land | **Non-depreciable** | Land value |

### Depreciation Calculator
- MACRS accelerated depreciation schedules
- Bonus depreciation with phase-down (80% → 60% → 40% → 20% → 0%)
- Year-by-year depreciation tables
- NPV tax savings analysis
- Comparison: accelerated vs. straight-line depreciation

### Property Input Wizard
3-step guided form:
1. **Property Details** — Address, price, type, year built, acquisition date
2. **Features** — 14 component checkboxes (pool, fencing, appliances, etc.)
3. **Renovations** — Dynamic list with cost, date, and category

### Report Viewer
- Executive summary with total tax savings
- Color-coded component breakdown by asset class
- Interactive depreciation schedule (expandable)
- Print-ready layout

### Dashboard
- Multi-property portfolio management
- Report history with regeneration
- Quick-access stats

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/anishtallapureddy/anish-projects.git
cd anish-projects/consumer/cost-segregation

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📊 Example Output

For a **$500,000 single-family home** (2005 build, pool, fencing, landscaping, appliances, carpeting, 3 bath, $35K kitchen reno):

```
Classification Summary
──────────────────────────────────
  5-year property:     $109,000
  7-year property:       $8,000
  15-year property:     $70,000
  27.5-year structural: $213,000
  Land:                $100,000
──────────────────────────────────
  Accelerated:    47% of building value
  1st Year Bonus: $74,800
  5-Year Savings: $45,136
  NPV Savings:    $24,883
  Components:     13 classified
```

---

## 🏗️ Architecture

```
src/
├── app/                         # Next.js App Router
│   ├── page.tsx                 # Marketing landing page
│   ├── property/page.tsx        # Property input wizard
│   ├── dashboard/page.tsx       # Portfolio dashboard
│   ├── report/[id]/page.tsx     # Report viewer
│   └── api/
│       ├── properties/route.ts  # Property CRUD
│       └── reports/route.ts     # Report generation
├── lib/
│   ├── classification.ts        # Component classification engine
│   ├── depreciation.ts          # MACRS depreciation calculator
│   ├── db.ts                    # Database connection (SQLite)
│   └── db-setup.js              # Schema initialization
└── components/                  # React components (UI, forms, report)
```

### Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Unified frontend + API, server components |
| Language | TypeScript | Type safety for financial calculations |
| Styling | Tailwind CSS | Rapid UI development, consistent design |
| Database | SQLite (better-sqlite3) | Zero-config, embedded, perfect for MVP |
| PDF | @react-pdf/renderer | Professional report generation |

---

## 📡 API Reference

### Properties

```
GET  /api/properties          # List all properties
POST /api/properties          # Create a property
```

**Create Property** — `POST /api/properties`
```json
{
  "purchasePrice": 500000,
  "buildingType": "single_family",
  "acquisitionDate": "2025-01-15",
  "yearBuilt": 2005,
  "squareFootage": 2400,
  "numberOfUnits": 1,
  "features": {
    "hasPool": true,
    "hasCarpeting": true,
    "hasAppliancesIncluded": true,
    "numberOfBathrooms": 3,
    "numberOfBedrooms": 4,
    "garageType": "attached"
  },
  "renovations": [
    { "description": "Kitchen remodel", "cost": 35000, "date": "2024-06-01", "category": "kitchen" }
  ]
}
```

### Reports

```
GET  /api/reports             # List all reports
POST /api/reports             # Generate a report
```

**Generate Report** — `POST /api/reports`
```json
{
  "propertyId": "<uuid>",
  "taxRate": 0.37,
  "discountRate": 0.06
}
```

---

## 📋 Documentation

| Document | Description |
|---|---|
| [PRD](./docs/PRD.md) | Product Requirements Document |
| [Metrics](./docs/METRICS.md) | Success metrics & analytics event schema |
| [Rollout Plan](./docs/ROLLOUT.md) | Phased rollout plan & risk register |
| [Decision Log](./docs/DECISIONS.md) | Architecture decision records |
| [Contributing](./CONTRIBUTING.md) | Development setup & guidelines |
| [Changelog](./CHANGELOG.md) | Version history |

---

## 📜 IRS Compliance

- Asset classification per **Rev. Proc. 87-56** asset class life guidelines
- MACRS rates per **IRS Publication 946**
- Bonus depreciation per **Tax Cuts and Jobs Act** (§168(k)), phasing down 2023–2026
- Based on **IRS Audit Technique Guide for Cost Segregation**

> **Disclaimer**: Reports generated by CostSeg Pro are software-based estimations and should be reviewed by a qualified tax professional. This tool is not a substitute for an engineering-based cost segregation study.

---

## 🗺️ Roadmap

- [x] Classification engine with IRS benchmark allocations
- [x] MACRS depreciation + bonus depreciation calculator
- [x] Property input wizard (3-step)
- [x] Interactive report viewer
- [x] Portfolio dashboard
- [x] Marketing landing page
- [ ] Authentication (NextAuth.js)
- [ ] PDF report download (@react-pdf/renderer)
- [ ] Stripe payment integration
- [ ] White-label reports for CPAs
- [ ] Property data auto-fill from address
- [ ] Commercial property support (39-year class life)
- [ ] AI-powered component identification from photos

---

## 📄 License

MIT — see [LICENSE](../LICENSE)

---

## 🔗 Related Projects

This project is part of the [anish-projects](https://github.com/anishtallapureddy/anish-projects) monorepo:

| Project | Description |
|---------|-------------|
| **[AI Gateway Foundry](../../ai/ai-gateway-foundry/)** | Azure AI Foundry experience with live AI Gateway backend — rate limiting, content safety, semantic caching, tool governance |
| **[PM Portfolio](../pm-portfolio/)** | Product management artifacts, templates, and project case studies |
