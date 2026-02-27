# Architecture Decision Log

A record of key technical and product decisions made during development. Uses a lightweight ADR (Architecture Decision Record) format.

---

## ADR-001: Next.js 14 as Full-Stack Framework

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need a framework for both frontend UI and backend API routes with good DX and deployment options.
- **Decision**: Use Next.js 14 with App Router.
- **Rationale**: Unified React frontend + API routes in one codebase. Excellent Vercel deployment story. Large ecosystem. Server Components reduce client JS bundle. TypeScript first-class support.
- **Alternatives Considered**: Express + React SPA (more ops overhead), Remix (smaller ecosystem), Django (team expertise is JS/TS), Rails (same).
- **Consequences**: Tied to Vercel for optimal deployment. Server Components learning curve. Limited to Node.js runtime for API routes.

---

## ADR-002: SQLite for MVP Database

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need persistent storage for users, properties, and reports. MVP scope doesn't require multi-server.
- **Decision**: Use SQLite via better-sqlite3.
- **Rationale**: Zero-config, embedded, fast reads, no separate database server. Perfect for single-server MVP. Easy migration path to PostgreSQL.
- **Alternatives Considered**: PostgreSQL (overkill for MVP), Prisma + SQLite (ORM overhead), Supabase (external dependency).
- **Consequences**: Limited to single server. No concurrent write scaling. Must migrate before horizontal scaling.

---

## ADR-003: Rule-Based Classification Over ML

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need to classify property components into IRS depreciation categories.
- **Decision**: Use rule-based allocation percentages derived from IRS benchmarks and industry data.
- **Rationale**: Deterministic, explainable, auditable — critical for tax-related software. ML would require large training dataset we don't have. Rules can be validated by CPAs. No inference cost.
- **Alternatives Considered**: ML model trained on existing cost seg studies (insufficient data), LLM-based classification (non-deterministic, liability risk), hybrid approach (premature).
- **Consequences**: Less granular than engineering-based study. May need property-specific adjustments. Clear path to ML enhancement in v2 with data from v1 usage.

---

## ADR-004: Tailwind CSS for Styling

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need a styling approach that's fast to develop and produces professional results.
- **Decision**: Tailwind CSS utility-first framework.
- **Rationale**: Rapid prototyping, consistent design tokens, no CSS file management, great for component-based React. Widely adopted.
- **Alternatives Considered**: CSS Modules (more boilerplate), Chakra UI (opinionated components), shadcn/ui (could layer on top later).

---

## ADR-005: Client-Side Report Rendering Over Server-Side PDF

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need to display and optionally download cost segregation reports.
- **Decision**: Render reports as interactive HTML pages with window.print() for PDF. Migrate to @react-pdf/renderer for production PDFs.
- **Rationale**: Faster iteration on report layout. Interactive features (expand/collapse, tooltips) in HTML. Print-to-PDF is good enough for MVP. react-pdf for polished v2 PDFs.
- **Alternatives Considered**: Puppeteer server-side PDF (heavy dependency), wkhtmltopdf (legacy), LaTeX (overkill).

---

## ADR-006: Freemium Pricing Model

- **Date**: February 2026
- **Status**: Accepted
- **Context**: Need a monetization strategy that drives adoption while generating revenue.
- **Decision**: Free tier (1 analysis, no PDF) + per-report ($149) + Pro subscription ($49/mo) + CPA plan ($99/mo).
- **Rationale**: Free tier reduces friction and enables viral growth. Per-report serves occasional users. Subscription serves power users. CPA plan opens B2B channel. $149/report is 97% cheaper than traditional $5K+ studies.
- **Alternatives Considered**: Subscription-only (higher barrier), free forever with ads (wrong audience), enterprise-only (limits market).

---

## ADR-007: Demo User for MVP Authentication

- **Date**: February 2026
- **Status**: Accepted (Temporary)
- **Context**: Need authentication but it's not MVP-critical for validating core value prop.
- **Decision**: Use a hardcoded demo user for MVP. Implement NextAuth.js in next iteration.
- **Rationale**: Authentication adds complexity without validating the core hypothesis (will people use software-generated cost seg reports?). Demo user enables full UX testing.
- **Consequences**: No multi-tenancy in MVP. Must add auth before any public deployment with real user data.
