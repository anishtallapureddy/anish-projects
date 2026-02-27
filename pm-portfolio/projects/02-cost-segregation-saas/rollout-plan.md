# Rollout Plan

## Overview

CostSeg Pro follows a 4-phase rollout, starting with internal validation and expanding through design partners to public launch. Each phase has explicit go/no-go criteria.

---

## Phase 1: Internal Validation (Weeks 1–2)

**Goal:** Verify classification accuracy and report quality against known benchmarks.

| Activity | Owner | Deliverable |
|----------|-------|-------------|
| Run 20 test properties through the engine | PM + Eng | Accuracy report vs. IRS ATG benchmarks |
| Compare output against 5 real cost seg studies | PM | Variance analysis document |
| CPA review of 3 sample reports | PM (external CPA) | Signed-off methodology validation |
| Performance testing (100 concurrent reports) | Eng | Latency report (<2s per generation) |

**Go/No-Go Criteria:**
- ✅ Classification variance < 5% vs. IRS ATG benchmarks
- ✅ CPA confirms report format is usable for tax filing support
- ✅ Report generation < 2 seconds for 95th percentile

---

## Phase 2: Design Partner Preview (Weeks 3–6)

**Goal:** Validate product-market fit with real users generating real reports.

**Participants:** 10 design partners
- 5 individual property investors (sourced from BiggerPockets, real estate forums)
- 3 CPAs with 10+ rental property clients
- 2 property managers with 20+ unit portfolios

| Activity | Owner | Deliverable |
|----------|-------|-------------|
| Onboard design partners with guided walkthrough | PM | Onboarding completion rate |
| Collect NPS and usability feedback weekly | PM | Weekly feedback synthesis |
| Track report generation → PDF download funnel | Eng | Conversion funnel metrics |
| Iterate on classification engine based on edge cases | Eng | Updated classification rules |

**Go/No-Go Criteria:**
- ✅ 7/10 design partners generate and download at least one report
- ✅ NPS ≥ 40
- ✅ Zero critical classification errors reported
- ✅ 3+ CPAs confirm they would recommend to clients

**Rollback Plan:** If NPS < 20 or critical classification errors found, pause and fix before expanding.

---

## Phase 3: Public Beta (Weeks 7–12)

**Goal:** Validate acquisition channels and conversion to Pro tier.

| Activity | Owner | Deliverable |
|----------|-------|-------------|
| Launch marketing landing page with SEO content | Marketing/PM | Organic traffic baseline |
| Enable free tier sign-up (email-gated) | Eng | Sign-up funnel metrics |
| Launch Pro tier ($99/report or $49/mo subscription) | PM + Eng | Revenue metrics |
| CPA partnership program (white-label, rev share) | PM + Biz Dev | 5 CPA firm sign-ups |
| Content marketing: "How Cost Segregation Works" guides | PM | 3 published articles |

**Go/No-Go Criteria:**
- ✅ 500+ free reports generated
- ✅ 5%+ free-to-Pro conversion rate
- ✅ <2% report error rate (user-reported)
- ✅ $5K+ MRR from Pro subscriptions

**Rollback Plan:** If conversion < 2%, revisit free tier value proposition (may be giving away too much).

---

## Phase 4: General Availability (Weeks 13+)

**Goal:** Scale acquisition and expand feature set.

| Activity | Owner | Deliverable |
|----------|-------|-------------|
| Launch paid acquisition (Google Ads: "cost segregation calculator") | Marketing | CAC < $50 |
| Add portfolio dashboard for multi-property users | Eng | Feature launch |
| Integrate CPA white-label (firm branding on reports) | Eng | 10 CPA firms onboarded |
| Add multi-family property support (5-20 units) | Eng | Expanded property types |
| SOC 2 Type I compliance (for enterprise CPAs) | Eng + Legal | Compliance certification |

**Go/No-Go Criteria:**
- ✅ $20K+ MRR
- ✅ 50+ monthly active Pro users
- ✅ CPA NPS ≥ 50

---

## Risk Mitigation During Rollout

| Risk | Phase | Mitigation |
|------|-------|------------|
| Classification inaccuracy | 1-2 | CPA validation + variance analysis before any external user sees output |
| Low conversion | 3 | A/B test free tier scope (savings-only vs. partial breakdown) |
| CPA trust gap | 2-3 | Publish methodology, show IRS ATG references, enable CPA overrides |
| Competitor launch | 3-4 | Accelerate CPA partnership channel to build switching costs |
