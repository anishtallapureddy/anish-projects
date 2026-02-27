# 05 — Usage-Based Pricing Tiers for AI Gateway

| Field | Detail |
|-------|--------|
| **Role** | Product Manager, Azure API Management / AI Gateway |
| **Company** | Microsoft Azure |
| **Timeline** | 4-week sprint (pricing design through GTM readiness) |
| **Type** | Pricing / Packaging / GTM |
| **Impact** | Projected +38% net-new revenue from segmented tier adoption |

---

## Problem

Azure AI Gateway launched with a flat, consumption-only pricing model — customers pay per API call with no tier differentiation. This creates three problems:

1. **No segmentation lever.** A solo developer experimenting with one model and a Fortune 500 routing 50M tokens/day pay the same unit rate. There's no incentive structure to drive commitment or expansion.
2. **Revenue leakage at the top.** Enterprise customers with predictable, high-volume workloads would willingly commit to higher spend for SLA guarantees and priority support — but there's nothing to commit to.
3. **Adoption friction at the bottom.** Without a free or low-cost entry point, developers prototype on raw OpenAI endpoints or open-source proxies instead of adopting the gateway. We lose them before they ever reach production.

Competitors (AWS Bedrock, LiteLLM Cloud, Portkey) have already introduced tiered models. We're leaving revenue and market share on the table.

## Approach

1. **Competitive analysis** — Mapped pricing structures across 6 competitors to identify market norms and whitespace.
2. **Customer segmentation** — Analyzed usage telemetry from 2,400 preview customers to identify four natural clusters by request volume, token throughput, and feature utilization.
3. **Pricing model design** — Built a four-tier structure (Free → Starter → Pro → Enterprise) with usage-based dimensions that align price to value delivered.
4. **Revenue modeling** — Projected revenue across three adoption scenarios (10K / 50K / 100K customers) using segment distribution from telemetry.
5. **GTM planning** — Designed a phased launch: soft launch with design partners → PLG self-serve motion → enterprise sales enablement.

## Key Outcomes

- Four-tier pricing model with clear upgrade triggers at each boundary
- Revenue projection: **$14.2M ARR** at 50K customers (base case)
- GTM plan with 20-item launch checklist and 90-day execution roadmap
- Three architecture decision records documenting pricing rationale

## Documentation

| Document | Description |
|----------|-------------|
| [pricing-model.md](./pricing-model.md) | Tier definitions, pricing table, revenue modeling, competitive analysis |
| [gtm-plan.md](./gtm-plan.md) | Positioning, launch phases, channel strategy, 90-day plan |
| [risks-tradeoffs.md](./risks-tradeoffs.md) | Risk register and key tradeoff decisions |
| [decision-log.md](./decision-log.md) | Architecture decision records for pricing choices |
