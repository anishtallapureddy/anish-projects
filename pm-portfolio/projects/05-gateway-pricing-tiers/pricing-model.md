# Pricing Model — AI Gateway Usage-Based Tiers

## Current State Analysis

Azure AI Gateway (preview) charges a flat **$3.50 per 1M gateway requests** plus underlying model inference costs. There is no tier, no commitment discount, and no free tier.

**Pain points identified from customer interviews (n=32) and telemetry (2,400 preview accounts):**

| Problem | Evidence |
|---------|----------|
| Developers abandon during eval | 41% of preview accounts make <100 requests then churn — cost uncertainty cited in 18 of 32 interviews |
| No upgrade path from experimentation to production | Median time from first request to "production-like" traffic (>10K req/day) is 67 days — no pricing event marks this transition |
| Enterprise accounts under-monetized | Top 2% of accounts generate 34% of total requests but pay the same unit rate with no SLA commitment |
| Competitors offer free tiers | AWS Bedrock has no gateway surcharge; LiteLLM Cloud offers a free tier up to 100K requests; Portkey free up to 10K requests |

## Customer Segments

Analysis of preview telemetry reveals four natural usage clusters:

| Segment | % of Accounts | Monthly Requests | Monthly Tokens | Behavior |
|---------|--------------|-----------------|----------------|----------|
| **Hobbyist** | 52% | <10K | <1M | Experimenting, single model, no policies |
| **Startup** | 28% | 10K–500K | 1M–50M | 1-3 models, basic routing, cost tracking |
| **Growth** | 15% | 500K–5M | 50M–500M | Multi-model, load balancing, content safety policies |
| **Enterprise** | 5% | >5M | >500M | Full policy stack, custom plugins, SLA requirements |

## Tier Definitions

### Free — "Explore"
- **Price:** $0/month
- **Target:** Hobbyist developers, students, hackathon builders
- **Included:** 10,000 gateway requests/month, 1M tokens routed, 2 model endpoints, 1 workspace
- **Policies:** Rate limiting, basic request logging
- **Support:** Community forums, docs
- **Overage:** Hard cap — requests rejected after limit

### Starter — "$49/month"
- **Price:** $49/month (billed monthly) or $39/month (annual commitment)
- **Target:** Startups, indie developers shipping to production
- **Included:** 500,000 gateway requests/month, 50M tokens routed, 10 model endpoints, 3 workspaces
- **Policies:** All built-in policies (rate limiting, content safety, token tracking, retry/fallback)
- **Support:** Email support, 48-hour response SLA
- **Overage:** $2.80 per additional 1M requests, $0.05 per additional 1M tokens
- **Extras:** Cost dashboards, usage alerts, API key management

### Pro — "$349/month"
- **Price:** $349/month (billed monthly) or $279/month (annual commitment)
- **Target:** Growth-stage companies with multi-model production workloads
- **Included:** 5,000,000 gateway requests/month, 500M tokens routed, 50 model endpoints, 10 workspaces, 5 custom policies
- **Policies:** All Starter + semantic caching, load balancing, A/B routing, custom policy engine
- **Support:** Priority email, 12-hour response SLA, onboarding call
- **Overage:** $2.20 per additional 1M requests, $0.04 per additional 1M tokens
- **Extras:** SSO (SAML/OIDC), audit logs, RBAC, Terraform provider support

### Enterprise — "Custom"
- **Price:** Custom annual contract (floor: $3,000/month)
- **Target:** Large organizations, regulated industries, ISVs embedding AI Gateway
- **Included:** Unlimited gateway requests, unlimited tokens, unlimited endpoints/workspaces/policies
- **Policies:** All Pro + private endpoints, VNet injection, custom plugin SDK, dedicated gateway instances
- **Support:** Dedicated CSM, 1-hour response SLA (Sev1), quarterly business reviews
- **Overage:** N/A (committed spend model)
- **Extras:** HIPAA/SOC2 compliance attestation, custom SLAs (99.99%), volume discount on underlying model costs

## Pricing Table

| Dimension | Free | Starter ($49/mo) | Pro ($349/mo) | Enterprise (Custom) |
|-----------|------|-------------------|---------------|---------------------|
| Gateway requests/mo | 10K | 500K | 5M | Unlimited |
| Tokens routed/mo | 1M | 50M | 500M | Unlimited |
| Model endpoints | 2 | 10 | 50 | Unlimited |
| Workspaces | 1 | 3 | 10 | Unlimited |
| Custom policies | 0 | 0 | 5 | Unlimited |
| Semantic caching | ✗ | ✗ | ✓ | ✓ |
| Load balancing | ✗ | ✓ | ✓ | ✓ |
| Content safety | ✗ | ✓ | ✓ | ✓ |
| Custom plugin SDK | ✗ | ✗ | ✗ | ✓ |
| SSO / RBAC | ✗ | ✗ | ✓ | ✓ |
| SLA | None | 99.9% | 99.95% | 99.99% |
| Support | Community | Email (48hr) | Priority (12hr) | Dedicated CSM (1hr) |

## Usage-Based Dimensions

Five dimensions drive tier boundaries and overage pricing:

1. **Gateway requests/month** — Primary volume metric. Correlates directly with value (each request = one AI call routed, logged, and policy-evaluated).
2. **Tokens routed/month** — Secondary volume metric. Captures workload intensity — a customer making fewer but larger requests (long-context RAG) should pay proportionally.
3. **Model endpoints connected** — Proxy for architectural complexity. More endpoints = more routing value delivered.
4. **Workspaces** — Organizational unit for teams/projects. Drives multi-team adoption within an org.
5. **Custom policies** — Proxy for platform depth. Customers writing custom policies are deeply embedded and derive significant value.

## Competitive Analysis

| Provider | Free Tier | Entry Paid | Mid Tier | Enterprise | Pricing Model |
|----------|-----------|------------|----------|------------|---------------|
| **Azure AI Gateway (proposed)** | 10K req/mo | $49/mo | $349/mo | Custom | Usage-based + tier |
| AWS Bedrock (Guardrails) | No surcharge | Per-policy pricing | Per-policy pricing | EDP discount | Pure consumption |
| Google Vertex AI (Model Garden) | $300 credit | Consumption only | Consumption only | Committed use | Pure consumption |
| LiteLLM Cloud | 100K req/mo | $25/mo | $100/mo | Custom | Tier + consumption |
| Portkey | 10K req/mo | $49/mo | $249/mo | Custom | Tier + consumption |
| Helicone | 10K req/mo | $30/mo | $150/mo | Custom | Tier + consumption |

**Positioning insight:** AWS and GCP don't charge a gateway surcharge — they monetize via model consumption lock-in. Third-party gateways (LiteLLM, Portkey, Helicone) all use tiered models. Our pricing should match third-party gateways on structure while leveraging Azure's integrated ecosystem as the differentiator.

## Revenue Modeling

**Conversion assumptions:** The segment distribution above (§Customer Segments) represents usage patterns observed in preview telemetry, not tier adoption rates. Not every startup-pattern user converts to Starter — many stay on Free until they hit limits. Conversion modeling uses: ~25% of startup-pattern → Starter, ~17% of growth-pattern → Pro, ~52% of enterprise-pattern → Enterprise. Remaining users stay on Free. 8% annual churn on paid tiers, 15% annual expansion rate.

| Scenario | Total Accounts | Free | Starter | Pro | Enterprise | Effective MRR | ARR |
|----------|---------------|------|---------|-----|------------|---------------|-----|
| Conservative | 10K | 8,870 | 700 | 250 | 130 | $236K | $2.8M |
| Base case | 50K | 44,600 | 3,500 | 1,250 | 650 | $1.18M | $14.2M |
| Aggressive | 100K | 89,200 | 7,000 | 2,500 | 1,300 | $2.36M | $28.3M |

**Revenue breakdown (base case, monthly):**
- Free: $0 (funnel investment — 89% of total accounts, drives awareness and upgrade pipeline)
- Starter: 3,500 customers × $44 blended ARPU = **$154K** (mix of $49/mo monthly + $39/mo annual; ~35% annual adoption)
- Pro: 1,250 customers × $328 blended ARPU = **$410K** (mix of $349/mo monthly + $279/mo annual; ~30% annual adoption)
- Enterprise: 650 custom contracts × $895 blended effective = **$582K** (avg deal $3,000/mo floor; 60% on annual commits with ~15% volume discount; Y1 ramp factor — not all contracts at full capacity from day one)
- **Overage:** ~$34K/month (12% of Starter/Pro customers exceeding tier limits at overage rates)
- **Effective MRR:** ~$1.18M | **Effective ARR:** ~$14.2M

Note: Revenue excludes underlying Azure OpenAI/model inference charges, which are billed separately and represent ~4x gateway revenue.

## Pricing Psychology

**Anchoring:** The Enterprise tier has no listed price — "Contact Sales" anchors the Pro tier at $349 as the visible ceiling, making it feel reasonable relative to an implied $3K+ enterprise deal.

**Decoy effect:** The Starter tier at $49 for 500K requests ($0.098/1K) vs. Pro at $349 for 5M requests ($0.070/1K) makes Pro the obviously better per-unit value for anyone near the Starter ceiling. This is intentional — we want growth-stage customers to self-select into Pro.

**Loss aversion on free tier:** Hard cap (requests rejected) rather than soft cap (overage charges) on the Free tier. This creates a moment of friction that forces a conscious upgrade decision, which converts better than silent overage billing for this segment.

**Round-number pricing:** $49 and $349 rather than $47 or $329. Enterprise SaaS buyers are not influenced by charm pricing — round-adjacent numbers signal transparency.
