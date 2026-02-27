# 02 — CostSeg Pro: Cost Segregation SaaS

## Quick Summary

| | |
|---|---|
| **Role** | Product Manager / Founder |
| **Domain** | FinTech · Real Estate · Tax Optimization |
| **Timeline** | February 2026 → ongoing |
| **Status** | MVP shipped |
| **Stack** | Next.js 14 · TypeScript · SQLite · Tailwind CSS |
| **Repo** | [anishtallapureddy/anish-projects/cost-segregation](https://github.com/anishtallapureddy/anish-projects/tree/main/cost-segregation) |

## Problem

Cost segregation studies help property owners save $10K–$100K+ in taxes by reclassifying building components into shorter IRS depreciation schedules (5, 7, 15 years vs. 27.5 years). But traditional engineering-based studies cost **$5,000–$15,000 per property**, pricing out small and mid-size investors.

## Solution

A self-service SaaS tool that generates IRS-compliant cost segregation analysis reports using rule-based classification and industry benchmark data — delivering **97% cost reduction** ($149 vs. $5,000+) with results in minutes, not months.

## What I Shipped (MVP)

1. **Classification engine** — allocates property costs across 5 IRS asset classes using benchmark data, feature detection (14 property features), and renovation categorization
2. **Depreciation calculator** — MACRS schedules, bonus depreciation phase-down (2023-2026), Section 179, NPV analysis
3. **3-step property input wizard** — details → features → renovations
4. **Interactive report viewer** — executive summary, component breakdown, year-by-year depreciation schedules
5. **Portfolio dashboard** — multi-property management
6. **Marketing landing page** — pricing tiers, feature showcase

## Key Product Decisions

| Decision | Why |
|---|---|
| Rule-based classification over ML | Deterministic + explainable — critical for tax software. No training data available for ML approach. |
| Freemium pricing ($0 / $149 / $49mo) | Free tier drives adoption; per-report serves casual users; subscription for power users & CPAs |
| SQLite for MVP | Zero-config embedded DB. Migration path to PostgreSQL planned. |
| Demo user instead of auth for MVP | Validate core value prop first. Auth doesn't prove PMF. |

## Validated Results

For a $500K single-family home with typical features:
- **47% of building value** reclassified to accelerated depreciation
- **$74,800** first-year bonus depreciation
- **$45,136** in 5-year cumulative tax savings
- **13 classified components** identified

## Documentation

| Document | Description |
|---|---|
| [PRD](./prd.md) | Product requirements with personas, user stories, architecture |
| [Metrics](./metrics.md) | KPIs, OKRs, analytics event schema |
| [Decision Log](./decision-log.md) | Architecture decision records |

## Next Steps

- [ ] Authentication (NextAuth.js)
- [ ] PDF report download
- [ ] Stripe payment integration
- [ ] CPA white-label plan
- [ ] Property data auto-fill from address
- [ ] Commercial property support (39-year)
