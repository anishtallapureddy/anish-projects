# Go-to-Market Plan — AI Gateway Pricing Tiers

## Positioning Statements

**Hobbyist / Free tier:**
"Start building AI-powered apps with a production-grade gateway — routing, logging, and rate limiting included. No credit card, no time limit, no catch."

**Startup / Starter tier:**
"Ship AI features to production with confidence. Content safety, fallback routing, and cost tracking for less than your team's coffee budget."

**Growth / Pro tier:**
"Scale multi-model AI workloads without building infrastructure. Semantic caching, load balancing, and A/B routing — managed, monitored, and secured."

**Enterprise / Custom tier:**
"Run mission-critical AI at scale with dedicated instances, compliance guarantees, and a team that knows your architecture."

---

## Launch Phases

### Phase 1 — Soft Launch (Weeks 1-3)
- Roll out tier structure to 50 design partner accounts (mix of segments)
- Collect structured feedback via 30-min interviews at day 7 and day 21
- Monitor upgrade/downgrade behavior, overage frequency, support ticket volume
- Gate: >70% of design partners rate tier structure as "clear" or "very clear" in survey

### Phase 2 — PLG Self-Serve (Weeks 4-8)
- Enable public sign-up for Free and Starter tiers via Azure Portal
- Launch pricing page on azure.microsoft.com/en-us/pricing/details/ai-gateway/
- Activate in-product upgrade prompts when users approach tier limits (80% threshold)
- Run $50K LinkedIn + dev community ad campaign targeting AI/ML developers
- Gate: 2,000 Free sign-ups and 200 Starter conversions in first 30 days

### Phase 3 — Enterprise Sales (Weeks 6-12)
- Enable Pro tier for self-serve purchase
- Arm enterprise sales team with battle cards, ROI calculator, and competitive tear sheets
- Launch partner program: SI partners (Accenture, Deloitte) and ISV embed partners
- Activate outbound motion targeting existing Azure OpenAI Service customers with >$5K/month model spend
- Gate: 15 enterprise pipeline deals, 5 closed within 90 days

---

## Launch Checklist

| # | Item | Owner | Phase | Status |
|---|------|-------|-------|--------|
| 1 | Pricing page copy and design | PMM | Phase 2 | Not started |
| 2 | Tier enforcement in gateway control plane | Engineering | Phase 1 | In progress |
| 3 | Usage metering and billing integration | Engineering | Phase 1 | In progress |
| 4 | In-product upgrade prompts (80% limit) | Engineering | Phase 2 | Not started |
| 5 | Free tier sign-up flow (no credit card) | Engineering | Phase 2 | Not started |
| 6 | Documentation: pricing FAQ | Docs | Phase 2 | Not started |
| 7 | Documentation: tier comparison guide | Docs | Phase 2 | Not started |
| 8 | Documentation: migration guide (preview → GA tiers) | Docs | Phase 1 | Not started |
| 9 | Blog post: "Introducing AI Gateway Pricing" | PMM | Phase 2 | Not started |
| 10 | Blog post: "Building AI Apps for Free on Azure" (dev audience) | DevRel | Phase 2 | Not started |
| 11 | Sales battle card: AI Gateway vs. LiteLLM/Portkey | PMM | Phase 3 | Not started |
| 12 | Sales battle card: AI Gateway vs. raw Azure OpenAI | PMM | Phase 3 | Not started |
| 13 | ROI calculator (spreadsheet + web tool) | PMM | Phase 3 | Not started |
| 14 | Partner enablement deck | Partnerships | Phase 3 | Not started |
| 15 | Billing alert emails (50%, 80%, 100% of limits) | Engineering | Phase 2 | Not started |
| 16 | Cost dashboard in Azure Portal | Engineering | Phase 2 | Not started |
| 17 | Internal training: CSM team on tier structure | PM | Phase 1 | Not started |
| 18 | Internal training: Support team on billing escalations | PM | Phase 1 | Not started |
| 19 | Legal review: terms of service update for tiers | Legal | Phase 1 | Not started |
| 20 | Finance review: revenue recognition for annual commits | Finance | Phase 1 | Not started |

---

## Channel Strategy

### Self-Serve (Free + Starter + Pro)
- **Acquisition:** Azure Portal sign-up, GitHub integration prompts, VS Code extension marketplace
- **Conversion:** In-product nudges at limit thresholds, email drip (day 1, 7, 14, 30 post-signup)
- **Expansion:** Usage analytics showing cost savings vs. direct model calls, feature gating that unlocks with tier upgrade
- **Target:** 85% of Free-to-Starter conversions, 60% of Starter-to-Pro conversions handled fully self-serve

### Partner Channel
- **SI Partners:** Accenture, Deloitte, Wipro — building enterprise AI solutions on Azure. Provide AI Gateway as the managed routing layer in their reference architectures.
- **ISV Embed:** SaaS companies embedding AI features can use AI Gateway as infrastructure. Offer volume discounts and co-marketing.
- **Target:** 20% of Enterprise deals sourced through partners by end of Year 1

### Direct Sales (Enterprise)
- **Trigger:** Any self-serve account exceeding $500/month gateway spend for 2+ consecutive months gets assigned a CSM
- **Motion:** Land with Pro self-serve → expand to Enterprise via CSM-led QBR showing cost optimization on annual commit
- **Target:** Average Enterprise ACV of $36K, 12-month contract, net retention rate >120%

---

## Success Metrics

| Metric | Target (90 days) | Measurement |
|--------|-------------------|-------------|
| Free tier sign-ups | 5,000 | Portal telemetry |
| Free → Starter conversion rate | 8% | Billing events |
| Starter → Pro conversion rate | 12% | Billing events |
| Enterprise pipeline deals | 15 | CRM (Dynamics) |
| Enterprise closed deals | 5 | CRM (Dynamics) |
| Monthly recurring revenue (gateway) | $180K | Finance dashboard |
| Time to first request (Free tier) | <5 minutes | Portal telemetry |
| NPS (paid tier customers) | >45 | In-product survey |
| Support ticket volume (billing) | <50/week | ServiceNow |
| Pricing page → sign-up conversion | >15% | Web analytics |

---

## First 90 Days Plan

**Days 1-30: Foundation**
- Ship tier enforcement and billing integration to production
- Complete design partner soft launch (50 accounts)
- Publish pricing page, FAQ, and migration guide
- Train CSM and support teams
- Baseline: Measure current preview-to-paid conversion rate as control

**Days 31-60: Acceleration**
- Open Free and Starter tiers to public self-serve sign-up
- Launch blog posts and LinkedIn ad campaign
- Activate in-product upgrade prompts and billing alerts
- Begin enterprise outbound targeting Azure OpenAI customers with >$5K model spend
- Weekly review: sign-up volume, conversion rates, support ticket themes

**Days 61-90: Optimization**
- Enable Pro tier for self-serve
- Deliver sales battle cards and ROI calculator
- Launch partner enablement program
- Run pricing sensitivity analysis: test $39 vs. $49 Starter via A/B on pricing page
- Publish first cohort analysis: retention curves by segment, upgrade triggers, overage patterns
- Decision point: Adjust tier limits or pricing based on data (pre-committed to review, not pre-committed to change)
