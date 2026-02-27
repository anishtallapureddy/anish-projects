# CostSeg Pro — Product Requirements Document

> **Product Name:** CostSeg Pro
> **Version:** 1.0 (MVP)
> **Author:** Anish Tallapureddy
> **Last Updated:** February 2026
> **Status:** In Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Goals & Success Criteria](#4-goals--success-criteria)
5. [User Stories / Requirements](#5-user-stories--requirements)
6. [User Experience Flows](#6-user-experience-flows)
7. [Technical Architecture](#7-technical-architecture)
8. [Data Model](#8-data-model)
9. [IRS Compliance](#9-irs-compliance)
10. [Constraints & Assumptions](#10-constraints--assumptions)
11. [Open Questions](#11-open-questions)
12. [Appendix](#12-appendix)

---

## 1. Overview

**CostSeg Pro** is a self-service web application that enables real estate investors, CPAs, and property managers to generate IRS-compliant cost segregation analysis reports — instantly and affordably.

Cost segregation is one of the most powerful tax strategies available to real estate investors. By reclassifying building components into shorter depreciation schedules (5, 7, and 15 years instead of 27.5 or 39 years), property owners can accelerate depreciation deductions and unlock significant front-loaded tax savings.

CostSeg Pro democratizes access to this strategy by replacing the traditional $5K–$15K engineering study with an intelligent, software-driven estimation engine priced for individual investors and small firms.

---

## 2. Problem Statement

### The Gap

Traditional cost segregation studies are conducted by engineering firms and typically cost **$5,000–$15,000 per property**. This pricing model creates an accessibility gap:

| Segment | Properties | Study Cost | Potential Tax Savings | ROI Justified? |
|---|---|---|---|---|
| Large commercial ($5M+) | 1–5 | $10K–$15K | $100K–$500K+ | ✅ Yes |
| Mid-size residential ($500K–$2M) | 2–10 | $5K–$10K | $10K–$80K | ⚠️ Marginal |
| Small residential (<$500K) | 1–5 | $5K–$8K | $5K–$30K | ❌ Often not |

### The Opportunity

- **Millions of rental properties** in the US are eligible for cost segregation but never receive a study.
- Small and mid-size residential investors are leaving **$10K–$100K+** in cumulative tax savings on the table — per property.
- There is **no affordable, self-service tool** on the market that generates IRS-compliant cost segregation analysis reports for individual investors.

### What We're Solving

CostSeg Pro eliminates the cost and complexity barrier by providing:

1. **Instant analysis** — results in under 2 minutes, not 2–4 weeks.
2. **Affordable pricing** — free tier for basic analysis; paid reports starting at a fraction of traditional study costs.
3. **IRS-aligned methodology** — classification based on published IRS benchmarks, Rev. Proc. 87-56, and MACRS depreciation schedules.

---

## 3. Target Users & Personas

### 🏠 Solo Investor Sarah

| Attribute | Detail |
|---|---|
| **Profile** | Owns 2–5 rental properties, $200K–$800K each |
| **Tax Approach** | Files own taxes with TurboTax or uses a basic CPA |
| **Pain Point** | Knows cost segregation exists but can't justify $5K+ per property |
| **Need** | Simple, affordable, credible analysis she can hand to her CPA |
| **Willingness to Pay** | $99–$299 per property report |

### 📊 CPA Carlos

| Attribute | Detail |
|---|---|
| **Profile** | Tax professional serving 20+ real estate clients |
| **Pain Point** | Clients ask about cost segregation; referring to engineering firms loses the client relationship |
| **Need** | Scalable solution with white-label reports he can brand and deliver |
| **Willingness to Pay** | $49–$149 per report (volume pricing), or $199/mo subscription |

### 🏢 Syndicator Sam

| Attribute | Detail |
|---|---|
| **Profile** | Manages a multi-family real estate fund with 10+ properties |
| **Pain Point** | Needs portfolio-level depreciation analysis for investor K-1 reporting |
| **Need** | Batch analysis, portfolio dashboard, and investor-grade PDF reports |
| **Willingness to Pay** | $500–$2,000/yr for portfolio plan |

### 🔑 Property Manager Pat

| Attribute | Detail |
|---|---|
| **Profile** | Manages 50+ units across multiple owners |
| **Pain Point** | Owners want to optimize NOI and ask about accelerated depreciation |
| **Need** | Quick estimates to present to property owners as a value-add service |
| **Willingness to Pay** | Per-report or monthly subscription |

---

## 4. Goals & Success Criteria

### Product Goals

| Goal | Target | Timeframe |
|---|---|---|
| Launch MVP | Feature-complete, deployed to production | Q1 2026 |
| Free analyses completed | 100+ | First 30 days post-launch |
| Paid report conversion rate | ≥ 10% | First 60 days |
| Time-to-first-report | < 2 minutes from property input | At launch |
| Net Promoter Score (NPS) | > 40 | 90 days post-launch |

### Business Goals

- Validate product-market fit with real estate investor community.
- Establish recurring revenue model via subscriptions and per-report pricing.
- Build a foundation for CPA partnership and white-label distribution channels.
- Collect user feedback to inform v2 feature prioritization (commercial properties, AI photo analysis).

### Key Metrics

| Metric | Definition | Target |
|---|---|---|
| **Activation Rate** | % of signups who complete first analysis | > 60% |
| **Report Downloads** | # of PDF reports downloaded per month | 50+ (month 1) |
| **Conversion Rate** | Free → Paid report upgrade | ≥ 10% |
| **Retention** | % of users returning within 30 days | > 30% |
| **Accuracy Benchmark** | Variance vs. traditional study results | < 15% deviation |

---

## 5. User Stories / Requirements

### Must Have (P0) — MVP Launch

| ID | User Story | Acceptance Criteria |
|---|---|---|
| P0-1 | As a user, I can input property details (address, purchase price, property type, year built, square footage, key features) | Multi-step form with validation; supports SFR, duplex, triplex, quadplex, and small multi-family |
| P0-2 | As a user, I can see component classification across IRS asset categories (5-year, 7-year, 15-year, 27.5-year) | Classification breakdown displayed as table and visual chart; percentages based on property type benchmarks |
| P0-3 | As a user, I can view year-by-year depreciation schedules | Full depreciation table for years 1–27.5; includes both standard and accelerated (cost seg) scenarios |
| P0-4 | As a user, I can see total tax savings summary (NPV, 5-year cumulative, 10-year cumulative) | Savings calculated at user's marginal tax rate; NPV discounted at configurable rate |
| P0-5 | As a user, I can download a professional PDF report | Branded PDF with executive summary, classification detail, depreciation schedules, and disclaimers |
| P0-6 | As a user, I can save multiple properties to my dashboard | Dashboard displays all saved properties with status, date, and quick-access to reports |

### Should Have (P1) — Fast Follow

| ID | User Story | Acceptance Criteria |
|---|---|---|
| P1-1 | As a user, I can sign up and log in with email or Google OAuth | NextAuth.js integration; session persistence; password reset flow |
| P1-2 | As a user, I can pay for a premium report via Stripe | Stripe Checkout integration; webhook handling; receipt delivery |
| P1-3 | As a CPA, I can generate white-label reports with my firm branding | Custom logo upload, firm name, and contact info on PDF reports |
| P1-4 | As a user, I can receive my report via email | Automated email delivery with PDF attachment upon generation |
| P1-5 | As a user, I can auto-fill property data from address | Integration with Zillow/county records API to pre-populate property details |

### Nice to Have (P2) — Future Roadmap

| ID | User Story | Acceptance Criteria |
|---|---|---|
| P2-1 | As a user, I can upload property photos for AI-powered component identification | Computer vision model identifies fixtures, flooring, landscaping, etc. |
| P2-2 | As a user, I can export analysis to tax software (TurboTax, Drake) | Standard export format compatible with major tax prep platforms |
| P2-3 | As a user, I can model "what-if" scenarios with different purchase prices | Adjustable inputs with real-time recalculation of savings |
| P2-4 | As a user, I can see multi-year tax planning projections | Forward-looking depreciation impact on taxable income across years |
| P2-5 | As a developer, I can access CostSeg Pro via REST API | Documented API with authentication, rate limiting, and webhook support |

---

## 6. User Experience Flows

### Flow 1: New User → First Report

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Landing     │────▶│  Property Input   │────▶│  Step 2: Building │
│  Page        │     │  Step 1: Address  │     │  Details          │
│              │     │  & Purchase Price │     │  (type, sqft,     │
│  [Get Started]     │                  │     │   year built)     │
└─────────────┘     └──────────────────┘     └──────────────────┘
                                                       │
                    ┌──────────────────┐     ┌─────────▼────────┐
                    │  Report View     │◀────│  Step 3: Features │
                    │  • Summary       │     │  (renovations,    │
                    │  • Classification│     │   special items)  │
                    │  • Depreciation  │     └──────────────────┘
                    │  • Tax Savings   │
                    │                  │
                    │  [Download PDF]  │
                    │  [Save to Dash]  │
                    └──────────────────┘
```

**Key Design Principles:**
- Maximum 3 steps from landing to report.
- Progress indicator visible throughout input flow.
- Smart defaults reduce required inputs (e.g., auto-estimate land value at 20%).
- Report preview is free; premium PDF download is the paywall trigger.

### Flow 2: Returning User → Dashboard

```
┌─────────┐     ┌───────────────────────────────────────┐
│  Login   │────▶│  Dashboard                            │
│          │     │  ┌─────────────────────────────────┐  │
└─────────┘     │  │ 📍 123 Main St    | $450K | ✅   │  │
                │  │ 📍 456 Oak Ave    | $320K | ✅   │  │
                │  │ 📍 789 Pine Blvd  | $580K | 🔄   │  │
                │  │                                   │  │
                │  │ [+ Add New Property]              │  │
                │  └─────────────────────────────────┘  │
                └───────────────────────────────────────┘
                         │
                         ▼
                ┌───────────────────┐
                │  Property Detail   │
                │  • View Report     │
                │  • Regenerate      │
                │  • Edit Details    │
                │  • Download PDF    │
                └───────────────────┘
```

### Flow 3: CPA User → Client Report

```
┌─────────┐     ┌──────────────┐     ┌──────────────────┐
│  Login   │────▶│  CPA Dashboard│────▶│  Add Client      │
│  (CPA)   │     │  • Clients   │     │  Property         │
└─────────┘     │  • Reports   │     │  (same input flow)│
                │  • Branding  │     └──────────────────┘
                └──────────────┘              │
                                             ▼
                ┌──────────────────┐  ┌──────────────────┐
                │  Email to Client │◀─│  White-Label PDF  │
                │  (auto-send)     │  │  • CPA branding   │
                └──────────────────┘  │  • Firm logo       │
                                      │  • Custom footer   │
                                      └──────────────────┘
```

---

## 7. Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (React) + Tailwind CSS | Full-stack framework; SSR for SEO; rapid UI development |
| **Backend** | Next.js API Routes | Co-located with frontend; serverless-ready |
| **Database** | SQLite (MVP) → PostgreSQL (scale) | Zero-config for MVP; easy migration path |
| **ORM** | Prisma | Type-safe database access; migration management |
| **Auth** | NextAuth.js | Email + Google OAuth; session management |
| **Payments** | Stripe | Checkout, subscriptions, webhooks |
| **PDF Generation** | @react-pdf/renderer | React-based PDF creation; full style control |
| **Hosting** | Vercel | Zero-config Next.js deployment; edge functions |
| **Email** | Resend or SendGrid | Transactional email for report delivery |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│   Next.js App (React + Tailwind CSS)                    │
│   ┌─────────┐  ┌───────────┐  ┌──────────────────┐    │
│   │ Property │  │ Dashboard │  │ Report Viewer    │    │
│   │ Input    │  │           │  │ + PDF Download   │    │
│   └─────────┘  └───────────┘  └──────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │ API Calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js API Routes                     │
│   ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│   │ /api/property │  │ /api/report │  │ /api/payment │  │
│   └──────┬───────┘  └──────┬──────┘  └──────┬───────┘  │
│          │                 │                 │           │
│   ┌──────▼─────────────────▼─────────────────▼───────┐  │
│   │            Core Business Logic                    │  │
│   │  ┌─────────────────┐  ┌────────────────────────┐ │  │
│   │  │ Classification  │  │ Depreciation           │ │  │
│   │  │ Engine          │  │ Calculator             │ │  │
│   │  │ (IRS benchmarks)│  │ (MACRS + bonus)        │ │  │
│   │  └─────────────────┘  └────────────────────────┘ │  │
│   └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   SQLite / PostgreSQL │
              │   (Prisma ORM)       │
              └──────────────────────┘
```

### Classification Engine

The classification engine is the core IP of CostSeg Pro. It operates as follows:

1. **Input Normalization** — Standardize property data (type, age, features).
2. **Benchmark Lookup** — Match property profile against IRS industry benchmark data for component allocation percentages.
3. **Feature Adjustment** — Modify allocations based on user-reported features (e.g., pool, landscaping, specialty flooring).
4. **Output** — JSON object with dollar amounts allocated to each IRS asset class.

### Depreciation Calculator

- Implements **MACRS** (Modified Accelerated Cost Recovery System) half-year convention.
- Supports all relevant recovery periods: **5-year, 7-year, 15-year, and 27.5-year**.
- Applies **bonus depreciation** per current tax law:
  - 2023: 80%
  - 2024: 60%
  - 2025: 40%
  - 2026: 20%
  - 2027+: 0%
- Calculates both **with** and **without** cost segregation for comparison.

---

## 8. Data Model

### Entity-Relationship Overview

```
┌──────────┐       ┌──────────────┐       ┌──────────────┐
│  Users   │──1:N──│  Properties  │──1:N──│   Reports    │
└──────────┘       └──────────────┘       └──────────────┘
```

### Users

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `email` | String | Unique; login identifier |
| `name` | String | Display name |
| `plan` | Enum | `free`, `pro`, `cpa`, `enterprise` |
| `stripe_customer_id` | String | Nullable; Stripe reference |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last modification timestamp |

### Properties

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key → Users |
| `address` | String | Full property address |
| `city` | String | City |
| `state` | String | State (2-letter code) |
| `zip` | String | ZIP code |
| `purchase_price` | Decimal | Total acquisition cost |
| `land_value` | Decimal | Nullable; estimated if not provided |
| `building_value` | Decimal | Computed: purchase_price - land_value |
| `building_type` | Enum | `sfr`, `duplex`, `triplex`, `quadplex`, `multi_family` |
| `year_built` | Integer | Original construction year |
| `square_footage` | Integer | Total building square footage |
| `features` | JSON | Array of special features (pool, landscaping, etc.) |
| `renovations` | JSON | Array of renovation records with year and cost |
| `created_at` | DateTime | Record creation timestamp |
| `updated_at` | DateTime | Last modification timestamp |

### Reports

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `property_id` | UUID | Foreign key → Properties |
| `user_id` | UUID | Foreign key → Users |
| `classification_json` | JSON | Component breakdown by IRS asset class |
| `depreciation_json` | JSON | Year-by-year depreciation schedule |
| `tax_rate` | Decimal | Marginal tax rate used for savings calculation |
| `total_savings_5yr` | Decimal | Cumulative tax savings over 5 years |
| `total_savings_10yr` | Decimal | Cumulative tax savings over 10 years |
| `total_savings_npv` | Decimal | Net present value of accelerated depreciation benefit |
| `status` | Enum | `draft`, `generated`, `paid`, `delivered` |
| `pdf_url` | String | Nullable; path to generated PDF |
| `created_at` | DateTime | Report generation timestamp |
| `updated_at` | DateTime | Last modification timestamp |

### Sample `classification_json`

```json
{
  "property_type": "sfr",
  "purchase_price": 450000,
  "land_value": 90000,
  "building_value": 360000,
  "components": [
    {
      "category": "5-year property",
      "irs_class": "00.00 - Personal Property",
      "items": ["Carpeting", "Appliances", "Window treatments", "Certain electrical"],
      "percentage": 0.12,
      "amount": 43200
    },
    {
      "category": "7-year property",
      "irs_class": "00.00 - Personal Property",
      "items": ["Office furniture", "Specialty fixtures"],
      "percentage": 0.03,
      "amount": 10800
    },
    {
      "category": "15-year property",
      "irs_class": "00.3 - Land Improvements",
      "items": ["Landscaping", "Paving", "Fencing", "Outdoor lighting"],
      "percentage": 0.10,
      "amount": 36000
    },
    {
      "category": "27.5-year property",
      "irs_class": "Residential Rental Property",
      "items": ["Building structure", "Roof", "HVAC", "Plumbing (structural)"],
      "percentage": 0.75,
      "amount": 270000
    }
  ]
}
```

---

## 9. IRS Compliance

### Regulatory Framework

CostSeg Pro's methodology is grounded in the following IRS publications and guidelines:

| Reference | Description | Application |
|---|---|---|
| **Rev. Proc. 87-56** | Asset class life guidelines | Determines recovery periods for each component category |
| **IRS Publication 946** | How to Depreciate Property | MACRS depreciation rates and conventions |
| **Tax Cuts and Jobs Act (2017)** | 100% bonus depreciation (phasing down) | Applied to 5, 7, and 15-year property placed in service |
| **IRS Cost Segregation ATG** | Audit Technique Guide for Cost Segregation | Methodology alignment and classification standards |
| **IRC §1250 / §1245** | Depreciation recapture rules | Disclosed in reports for user awareness |

### Classification Methodology

- Component allocations are based on **published industry benchmark studies** and IRS audit data.
- Percentages are adjusted by **property type**, **age**, **size**, and **reported features**.
- The engine does **not** perform engineering-level analysis (no site visits, no physical inspection).
- All reports clearly state the methodology and its limitations.

### Bonus Depreciation Schedule

| Year Placed in Service | Bonus Depreciation Rate |
|---|---|
| 2022 and prior | 100% |
| 2023 | 80% |
| 2024 | 60% |
| 2025 | 40% |
| 2026 | 20% |
| 2027 and after | 0% |

*Note: Bonus depreciation applies to 5-year, 7-year, and 15-year property. It does not apply to 27.5-year residential rental property.*

### Required Disclaimers

Every report generated by CostSeg Pro must include the following:

> **DISCLAIMER:** This report is a software-generated estimation based on industry benchmark data and IRS-published guidelines. It is not a substitute for a formal cost segregation study conducted by a qualified engineer or tax professional. CostSeg Pro does not provide tax, legal, or accounting advice. Users should consult with a qualified tax professional before making tax elections based on this analysis. Results may vary from a traditional engineering-based study. CostSeg Pro assumes no liability for tax positions taken based on this report.

---

## 10. Constraints & Assumptions

### Constraints

| Constraint | Detail |
|---|---|
| **Residential only (MVP)** | v1.0 supports 27.5-year residential rental property only. Commercial properties (39-year class life) are deferred to v2. |
| **No engineering inspection** | All analysis is software-based using benchmark data. No physical site visits or engineering assessments. |
| **US tax law only** | MACRS depreciation and IRS asset classes are US-specific. International properties are not supported. |
| **Estimation accuracy** | Software-generated results will have variance from traditional engineering studies. Target: < 15% deviation. |
| **Single-user MVP** | v1.0 does not support team/organization accounts. CPA multi-user access is a P1 feature. |

### Assumptions

| Assumption | Rationale |
|---|---|
| **Land value = 20% of purchase price** | Industry standard default when user does not provide a specific land value. Adjustable by user. |
| **Standard half-year convention** | MACRS half-year convention applied unless mid-quarter convention is triggered (not implemented in MVP). |
| **No prior cost segregation** | System assumes property has not previously undergone a cost segregation study. |
| **Benchmark data is representative** | Classification percentages are derived from aggregated industry data and IRS published benchmarks. |
| **Users have basic tax knowledge** | UI provides tooltips and explanations, but assumes users understand concepts like depreciation and tax brackets. |

---

## 11. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should we pursue CPA partnerships for distribution? This could accelerate growth but adds complexity (multi-tenant, white-label, revenue sharing). | Product | 🟡 Under Discussion |
| 2 | What is the minimum viable accuracy threshold vs. traditional engineering studies? Need to benchmark against 5–10 real studies. | Engineering | 🔴 Needs Research |
| 3 | Do we need Errors & Omissions (E&O) insurance for tax-related software? What are the liability implications? | Legal | 🔴 Needs Research |
| 4 | What pricing model optimizes for conversion? Per-report vs. subscription vs. freemium? | Product | 🟡 Under Discussion |
| 5 | Should we integrate with county assessor databases for automated land value lookups? | Engineering | 🟢 Researching APIs |
| 6 | Is there a path to get the software methodology reviewed or endorsed by a CPA firm for credibility? | Business Dev | 🔴 Not Started |

---

## 12. Appendix

### A. IRS Asset Class Reference Table (Residential)

| Asset Class | Recovery Period | MACRS Method | Examples |
|---|---|---|---|
| **Personal Property (§1245)** | 5 years | 200% DB | Carpeting, appliances, window treatments, decorative lighting, certain electrical outlets |
| **Personal Property (§1245)** | 7 years | 200% DB | Office furniture, specialty fixtures, security systems, built-in shelving |
| **Land Improvements (§1250)** | 15 years | 150% DB | Landscaping, paving, driveways, fencing, retaining walls, outdoor lighting, irrigation |
| **Residential Rental (§1250)** | 27.5 years | Straight-Line | Building structure, roof, foundation, HVAC (structural), plumbing (structural), walls |

### B. MACRS Depreciation Rate Tables

#### 5-Year Property (200% Declining Balance, Half-Year Convention)

| Year | Rate |
|---|---|
| 1 | 20.00% |
| 2 | 32.00% |
| 3 | 19.20% |
| 4 | 11.52% |
| 5 | 11.52% |
| 6 | 5.76% |

#### 7-Year Property (200% Declining Balance, Half-Year Convention)

| Year | Rate |
|---|---|
| 1 | 14.29% |
| 2 | 24.49% |
| 3 | 17.49% |
| 4 | 12.49% |
| 5 | 8.93% |
| 6 | 8.92% |
| 7 | 8.93% |
| 8 | 4.46% |

#### 15-Year Property (150% Declining Balance, Half-Year Convention)

| Year | Rate |
|---|---|
| 1 | 5.00% |
| 2 | 9.50% |
| 3 | 8.55% |
| 4 | 7.70% |
| 5 | 6.93% |
| 6 | 6.23% |
| 7 | 5.90% |
| 8 | 5.90% |
| 9 | 5.91% |
| 10 | 5.90% |
| 11 | 5.91% |
| 12 | 5.90% |
| 13 | 5.91% |
| 14 | 5.90% |
| 15 | 5.91% |
| 16 | 2.95% |

#### 27.5-Year Residential Rental Property (Straight-Line, Mid-Month Convention)

| Year | Rate |
|---|---|
| 1 | 3.485% (if placed in service in January) |
| 2–27 | 3.636% |
| 28 | 1.970% |

*Note: Year 1 rate varies by month placed in service. See IRS Publication 946, Table A-6 for complete mid-month convention rates.*

### C. Bonus Depreciation Phase-Down Schedule

```
100% ████████████████████████████████████████  (2022 and prior)
 80% ████████████████████████████████          (2023)
 60% ████████████████████████                  (2024)
 40% ████████████████                          (2025)
 20% ████████                                  (2026)
  0%                                           (2027+)
```

Bonus depreciation applies to the **cost basis** of assets in the 5-year, 7-year, and 15-year recovery periods. The remaining basis (after bonus) is depreciated using standard MACRS rates over the asset's recovery period.

**Example:** A $50,000 component classified as 5-year property, placed in service in 2025 (40% bonus):
- Bonus depreciation: $50,000 × 40% = **$20,000** (Year 1)
- Remaining basis: $30,000 depreciated over 5 years using MACRS rates
- Year 1 total: $20,000 + ($30,000 × 20.00%) = **$26,000**

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | January 2026 | Anish Tallapureddy | Initial draft |
| 1.0 | February 2026 | Anish Tallapureddy | Complete MVP PRD — personas, architecture, data model, compliance |

---

*© 2026 CostSeg Pro. All rights reserved. This document is confidential and intended for internal stakeholders and potential investors.*
