# Risks & Tradeoffs

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **IRS classification accuracy** — Rule-based approach may misclassify components, exposing users to audit risk | Medium | High | Validate against 50+ real cost seg studies. Include disclaimer: "This report is for estimation purposes. Consult a qualified tax professional." Display confidence scores per classification. |
| R2 | **Bonus depreciation phase-down confusion** — Users may not understand that bonus depreciation decreases each year (100%→80%→60%→40%→20%→0%) | Medium | Medium | Auto-detect the applicable rate based on property placed-in-service date. Show clear year-by-year phase-down table in every report. Add educational tooltips. |
| R3 | **CPA trust gap** — Tax professionals may not trust automated classification without seeing the methodology | High | High | Publish classification methodology transparently. Show IRS Audit Technique Guide references for each allocation. Allow CPAs to override individual classifications. |
| R4 | **Free tier abuse** — Users generate unlimited free reports without converting to paid | Medium | Medium | Free tier shows savings estimate only (not full classification breakdown). Full asset-level detail requires Pro upgrade. Rate limit to 3 free reports/month. |
| R5 | **Competitive response** — Established cost seg firms (CSSI, Cost Seg Authority) launch their own SaaS tools | Low | High | Move fast on CPA partnership channel. Build switching costs through portfolio management features. Our price point ($99 vs. $5K+) serves a different segment they can't profitably serve. |
| R6 | **Regulatory change** — IRS modifies depreciation rules or cost seg guidelines | Low | Medium | Abstract classification rules into configurable engine. Annual rule review process. Subscribe to IRS bulletin updates. |

## Key Tradeoffs

### T1: Rule-Based vs. ML-Based Classification

| Option | Pros | Cons |
|--------|------|------|
| **Rule-based (chosen)** | Explainable, auditable, deterministic, matches IRS ATG benchmarks exactly | Less precise for edge cases, requires manual rule updates |
| ML-based | Could improve accuracy on edge cases, learns from real studies | Black box (can't explain to IRS), needs training data we don't have, regulatory risk |

**Decision:** Rule-based. IRS auditors need to see deterministic logic, not model weights. Explainability is a feature, not a limitation, in tax compliance software.

---

### T2: Freemium vs. Free Trial

| Option | Pros | Cons |
|--------|------|------|
| **Freemium (chosen)** | Lower friction, users see value before paying, viral potential ("I saved $X"), CPA referral loop | Risk of free tier being "good enough", harder to monetize |
| 14-day free trial | Clear conversion timeline, full feature access during trial | Higher friction, users who forget to cancel churn, no ongoing free usage for word-of-mouth |

**Decision:** Freemium with gated depth. Free tier shows the headline savings number (high-signal hook). Detailed asset-by-asset breakdown, PDF export, and portfolio features require Pro. This gives CPAs a reason to try it with clients and self-upgrade.

---

### T3: SQLite vs. PostgreSQL for MVP

| Option | Pros | Cons |
|--------|------|------|
| **SQLite (chosen)** | Zero setup, embedded, perfect for single-server MVP, fast reads | Single-writer limitation, no built-in replication, migration needed at scale |
| PostgreSQL | Production-ready, concurrent writes, managed options (Azure, Supabase) | Over-engineering for MVP, adds deployment complexity, $$ for managed service |

**Decision:** SQLite for MVP. Our write pattern is low (one report generation per user session). SQLite handles thousands of concurrent reads. Migrate to PostgreSQL when we hit multi-server or >10K active users — a good problem to have.
