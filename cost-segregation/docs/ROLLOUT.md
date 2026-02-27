# Rollout Plan & Risk Register

## Rollout Phases

---

### Phase 0: Internal Alpha (Week 1–2)

| Attribute | Detail |
|---|---|
| **Goal** | Validate core engine accuracy |
| **Scope** | Classification engine + depreciation calculator only |
| **Users** | Internal testing (3–5 test properties) |
| **Success Criteria** | Allocation percentages within 5% of benchmark studies |
| **Go/No-Go** | Manual comparison against 3 reference cost seg reports |

**Key Activities:**
- Run classification engine against known commercial properties with published cost segregation studies
- Compare 5-year, 7-year, 15-year, and 39-year allocations to benchmark percentages
- Validate depreciation schedule math against IRS Publication 946 tables
- Document any systematic biases and calibrate weights

---

### Phase 1: Private Beta (Week 3–4)

| Attribute | Detail |
|---|---|
| **Goal** | Validate end-to-end UX |
| **Scope** | Full app (input → report → dashboard), no auth, no payments |
| **Users** | 10–20 invited beta testers (real estate investors, CPAs) |
| **Success Criteria** | T2FR < 5 min, < 3 critical bugs, NPS > 30 |
| **Go/No-Go** | All critical bugs resolved, positive feedback from 5+ testers |
| **Channels** | Direct outreach, BiggerPockets forum post |

**Key Activities:**
- Recruit beta testers from personal network + BiggerPockets community
- Collect structured feedback via post-session survey (NPS + open-ended)
- Monitor analytics for drop-off points in the property input wizard
- Triage and resolve all P0/P1 bugs before proceeding
- Conduct 3–5 live user testing sessions (screen share)

---

### Phase 2: Public Launch — Free Tier (Week 5–6)

| Attribute | Detail |
|---|---|
| **Goal** | Acquire users, validate demand |
| **Scope** | Full app with authentication, free tier (1 analysis, no PDF download) |
| **Users** | Public — organic + content marketing |
| **Success Criteria** | 200 sign-ups, 100 free analyses, 10% 7-day return rate |
| **Go/No-Go** | Infrastructure stable under load, no data loss incidents |
| **Channels** | Product Hunt, BiggerPockets, Reddit r/realestateinvesting, SEO content |

**Key Activities:**
- Launch on Product Hunt (coordinate with community for upvotes)
- Publish 3 SEO blog posts: "What is Cost Segregation?", "DIY Cost Segregation Analysis", "Cost Segregation for Small Investors"
- Post in BiggerPockets forums and Reddit with value-first approach
- Set up monitoring alerts for errors, latency, and database load
- Implement rate limiting and abuse prevention

---

### Phase 3: Monetization (Week 7–8)

| Attribute | Detail |
|---|---|
| **Goal** | Validate willingness to pay |
| **Scope** | Stripe integration, paid reports ($149), Pro plan ($49/mo) |
| **Users** | Existing free users + new users |
| **Success Criteria** | 10 paid reports, 3 Pro subscriptions, < 5% refund rate |
| **Go/No-Go** | Payment flow tested end-to-end, refund policy published |
| **Channels** | Email to free users, retargeting ads |

**Key Activities:**
- Integrate Stripe Checkout and Customer Portal
- Send conversion email campaign to free users: "Your analysis is ready — unlock the full report"
- Implement upgrade prompts in-app (after free analysis, on PDF download attempt)
- Set up Stripe webhooks for subscription lifecycle events
- Publish pricing page with clear value comparison across tiers
- Configure refund flow and document refund policy

---

### Phase 4: Scale & CPA Channel (Week 9–12)

| Attribute | Detail |
|---|---|
| **Goal** | Build B2B channel |
| **Scope** | CPA plan ($99/mo), white-label reports, client management dashboard |
| **Users** | CPAs and tax preparers |
| **Success Criteria** | 5 CPA subscribers, 50 client reports generated |
| **Channels** | CPA partnerships, accounting conferences, LinkedIn outreach |

**Key Activities:**
- Build CPA-specific features: client management, white-label PDF, bulk analysis
- Create CPA onboarding flow with practice setup
- Develop "CPA Partner Program" landing page and collateral
- Outreach to 50 CPAs via LinkedIn and professional networks
- Attend 1–2 regional accounting / tax prep conferences
- Offer 30-day free trial for CPA plan

---

## Phase Transition Checklist

Before advancing to the next phase, confirm:

- [ ] All success criteria for current phase are met
- [ ] Go/No-Go decision documented with evidence
- [ ] Critical bugs from current phase resolved
- [ ] Monitoring and alerting in place for next phase's scope
- [ ] Rollback plan tested (can revert to previous phase within 1 hour)
- [ ] Team aligned on next phase timeline and responsibilities

---

## Risk Register

| ID | Risk | Category | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R01 | **IRS compliance challenge** — Classification percentages may not match engineering-based studies, leading to IRS scrutiny or user liability | Legal | Medium | High | Clear disclaimers on all reports ("estimate only, not a substitute for engineering-based study"). Use conservative allocation percentages. Peer review methodology with 2+ CPAs. Cite IRS guidelines and court rulings supporting software-assisted analysis. | Product / Legal | Open |
| R02 | **Low free-to-paid conversion** — Users extract enough value from the free tier and never convert to paid | Business | Medium | Medium | Gate PDF download behind payment. Limit free tier to 1 property analysis. Show teaser of full report with blurred sections. Implement email nurture sequence highlighting paid benefits. | Product | Open |
| R03 | **Accuracy complaints** — Users compare software-generated reports to traditional engineering studies and find discrepancies | Business | Medium | High | Display allocation ranges (e.g., "22–28%") instead of point estimates. Include methodology explanation page in every report. Add professional disclaimer: "This analysis provides estimates based on building characteristics and IRS guidelines." Collect accuracy feedback and iterate. | Engineering | Open |
| R04 | **Tax law changes** — Bonus depreciation phase-down (from 60% in 2026 to 40% in 2027), potential new legislation affecting cost segregation | Legal | Medium | Medium | Make bonus depreciation rates configurable in the engine (not hardcoded). Monitor IRS updates and congressional tax proposals quarterly. Version all reports with the tax law snapshot date. Notify users if their report's assumptions change. | Product | Open |
| R05 | **Data security breach** — Property financial data (cost basis, renovation costs) is sensitive and a breach would destroy trust | Technical | Low | High | Encrypt all data at rest (AES-256) and in transit (TLS 1.3). Implement SOC 2 Type I compliance roadmap. Minimize data collection — don't store unnecessary PII. Regular dependency audits. Implement access logging and anomaly detection. | Engineering | Open |
| R06 | **Scaling SQLite** — SQLite cannot handle concurrent writes from multiple users under load | Technical | Low | Low | Acceptable for MVP (< 100 concurrent users). Use WAL mode for better read concurrency. Document PostgreSQL migration path in architecture docs. Monitor write contention metrics. Plan migration trigger: > 50 concurrent users or > 500ms p95 write latency. | Engineering | Open |
| R07 | **CPA liability concerns** — CPAs reluctant to recommend or rely on software-generated reports due to professional liability risks | Business | Medium | Medium | Position reports as "supporting analysis" rather than replacement for engineering studies. Explore Errors & Omissions (E&O) insurance options. Provide CPAs with methodology documentation they can review. Include "Prepared with [Tool Name] — reviewed by [CPA Name]" on white-label reports. | Product / Sales | Open |
| R08 | **SEO competition** — Established cost segregation firms (CSSI, Cost Seg Authority) dominate search rankings for primary keywords | Business | High | Medium | Target long-tail keywords: "cost segregation calculator", "DIY cost segregation", "cost segregation for small buildings", "cost segregation estimate". Publish educational content (blog, calculator tools, guides). Build community presence on BiggerPockets and Reddit. Leverage Product Hunt and Hacker News for initial backlinks. | Marketing | Open |
| R09 | **Stripe payment friction** — Users abandon the checkout flow, reducing conversion from intent to purchase | Business | Medium | Medium | Use Stripe Checkout (hosted, optimized) rather than custom payment forms. Support guest checkout (no account required for one-time purchase). Display clear pricing with no hidden fees. Offer a 30-day money-back guarantee. Add trust signals (SSL badge, Stripe branding, testimonials) on payment page. | Engineering | Open |
| R10 | **Feature creep** — Expanding scope (e.g., adding multi-entity support, cost basis allocation, integration with tax software) delays launch | Operational | High | High | Maintain strict P0/P1/P2 prioritization — only P0 items block launch. Time-box each phase to 2 weeks maximum. Defer all "nice to have" features to post-launch backlog. Weekly scope review with explicit "cut or keep" decisions. Single decision-maker for scope changes. | Product | Open |

---

## Risk Heat Map

```
                    ┌─────────────┬─────────────┬─────────────┐
                    │  Low Impact  │  Med Impact  │ High Impact  │
   ┌────────────────┼─────────────┼─────────────┼─────────────┤
   │ High           │             │ R08          │ R10          │
   │ Likelihood     │             │              │              │
   ├────────────────┼─────────────┼─────────────┼─────────────┤
   │ Medium         │             │ R02, R04     │ R01, R03     │
   │ Likelihood     │             │ R07, R09     │              │
   ├────────────────┼─────────────┼─────────────┼─────────────┤
   │ Low            │ R06         │              │ R05          │
   │ Likelihood     │             │              │              │
   └────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## Rollback Plan

If a phase fails its Go/No-Go criteria:

| Scenario | Action | Timeline |
|---|---|---|
| Engine accuracy off by > 10% | Halt Phase 1 launch, recalibrate classification weights, re-run benchmarks | 1–2 weeks |
| Critical security vulnerability | Immediately disable public access, patch, security audit before re-launch | 1–3 days |
| Payment processing failures > 2% | Disable payment flow, revert to free-only, debug Stripe integration | 1–2 days |
| Infrastructure overload | Enable maintenance mode, scale resources, add caching layer | Hours |
| Negative NPS (< 0) in beta | Pause public launch, conduct user interviews, redesign problematic flows | 2–4 weeks |

---

## Launch Readiness Checklist

### Technical Readiness
- [ ] All P0 features implemented and tested
- [ ] Load testing completed (target: 100 concurrent users)
- [ ] Error monitoring configured (Sentry / equivalent)
- [ ] Database backups automated (daily)
- [ ] SSL/TLS configured and verified
- [ ] Rate limiting enabled
- [ ] CORS and security headers configured

### Business Readiness
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Professional disclaimers reviewed by legal counsel
- [ ] Refund policy documented
- [ ] Support email / channel set up
- [ ] Pricing page live

### Marketing Readiness
- [ ] Landing page live with SEO metadata
- [ ] Product Hunt launch scheduled
- [ ] 3 blog posts drafted and scheduled
- [ ] Social media accounts created
- [ ] Beta tester testimonials collected
- [ ] Email templates ready (welcome, report ready, upgrade prompt)

### Analytics Readiness
- [ ] All analytics events from METRICS.md implemented
- [ ] Conversion funnels configured in analytics dashboard
- [ ] KPI dashboard created
- [ ] Weekly reporting cadence established
