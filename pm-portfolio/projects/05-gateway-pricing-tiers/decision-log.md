# Decision Log — AI Gateway Pricing Tiers

## ADR-001: Usage-Based Pricing as Primary Model

| Field | Detail |
|-------|--------|
| **Date** | 2025-01-14 |
| **Status** | Accepted |
| **Deciders** | PM (Anish), Finance Lead, Engineering Lead |

**Context:**
AI Gateway needed a pricing model for GA launch. Three options were evaluated: pure consumption (pay-per-request, no tiers), seat-based (per-developer), and usage-based tiers (tiered bundles with overage). Preview telemetry from 2,400 accounts showed usage clustering into four natural segments with 10x volume gaps between clusters. Competitors in the API gateway space (Portkey, LiteLLM Cloud, Helicone) universally use tiered models. Seat-based pricing was rejected early — gateway value correlates with request volume, not headcount.

**Decision:**
Adopt a four-tier usage-based model (Free / Starter $49 / Pro $349 / Enterprise custom) with five metered dimensions: requests, tokens, endpoints, workspaces, and custom policies. Overage pricing applies at reduced per-unit rates on Starter and Pro. Enterprise uses committed annual spend.

**Consequences:**
- Requires investment in usage metering infrastructure (Event Hubs pipeline, billing reconciliation)
- Tier boundaries become a product surface — enforcement logic, upgrade prompts, and billing alerts are new features to build and maintain
- Revenue becomes partially predictable (base tier fees) and partially variable (overage), complicating financial forecasting
- Enables PLG motion that pure consumption pricing cannot support (no "free tier" concept in pure consumption)

---

## ADR-002: Permanent Free Tier Inclusion

| Field | Detail |
|-------|--------|
| **Date** | 2025-01-21 |
| **Status** | Accepted |
| **Deciders** | PM (Anish), PMM Lead, VP Product |

**Context:**
The team debated whether to offer a permanent free tier or a 30-day trial. Marketing favored a trial for higher conversion rates (industry benchmarks: 15-20% trial vs. 4-8% freemium). Engineering raised concerns about cost-to-serve for free accounts. Product and DevRel argued that the developer ecosystem play requires a frictionless entry point — developers evaluate tools by building with them, not by reading datasheets, and a trial clock creates artificial urgency that leads to abandonment rather than conversion.

**Decision:**
Include a permanent free tier: 10K requests/month, 1M tokens, 2 endpoints, 1 workspace. Hard cap on limits (requests rejected, not degraded). No credit card required for sign-up.

**Consequences:**
- Estimated cost to serve: $0.04/month per free account ($24K/year at 50K free accounts)
- Creates a large top-of-funnel for PLG conversion, but conversion rate will be lower than trial model
- Risk of abuse (crypto miners, bot traffic) mitigated by hard caps and rate limiting on Free tier
- Sets developer-friendly market positioning that differentiates from AWS (no free gateway layer) and GCP (credit-based, expires)

---

## ADR-003: Enterprise Custom Pricing with $3K/month Floor

| Field | Detail |
|-------|--------|
| **Date** | 2025-01-28 |
| **Status** | Accepted |
| **Deciders** | PM (Anish), Finance Lead, Enterprise Sales Lead |

**Context:**
Enterprise customers require features not in self-serve tiers: dedicated gateway instances, VNet injection, custom plugin SDK, HIPAA/SOC2 attestation, and 99.99% SLA. The question was whether to create a fixed Enterprise tier ($999/month or similar) or allow fully custom pricing. Sales strongly preferred custom pricing for deal flexibility. Finance wanted a floor price to prevent deep discounting that undermines unit economics.

**Decision:**
Enterprise tier is custom-priced via annual contract with a $3,000/month floor ($36K ACV minimum). Sales has latitude to structure deals around committed request volume, token throughput, or flat platform fees. Discounts beyond 20% off list equivalent require VP approval.

**Consequences:**
- Sales can tailor contracts to customer needs (volume commits, multi-year discounts, bundled model inference)
- $3K floor ensures every enterprise deal covers dedicated support and infrastructure costs
- Custom pricing makes revenue forecasting less precise — mitigated by requiring annual commits with quarterly true-ups
- "Contact Sales" on pricing page creates friction for self-serve buyers who want Enterprise features — accepted tradeoff; these customers have procurement processes regardless
