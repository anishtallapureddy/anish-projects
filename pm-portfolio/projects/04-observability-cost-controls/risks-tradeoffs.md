# Risks & Tradeoffs — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tadiparthi · PM, Azure API Management — AI Gateway
**Last Updated:** 2025-04-10

---

## Risks

### Risk 1: Attribution Accuracy Diverges from Azure Billing
**Likelihood:** Medium · **Impact:** High
Our cost estimates are based on token counts × published model pricing. Actual Azure billing includes reserved capacity discounts, commitment tiers, and regional pricing variations that we don't observe at the gateway layer. If our attribution numbers diverge >5% from the actual bill, FinOps teams will lose trust in the system.
**Mitigation:** Daily reconciliation job compares attributed costs against Azure Cost Management exports. Surface a "reconciliation confidence" indicator in the dashboard. Document known variance sources (discounts, free-tier credits) in the product.

### Risk 2: Alert Fatigue Undermines Anomaly Detection Value
**Likelihood:** Medium · **Impact:** High
If false positive rates exceed team tolerance, engineers will disable alerts or create email filters — rendering the system useless. Our experiment showed 2.8 false positives/week, but this was with 5 design partners who were highly engaged. At scale, noisy environments with volatile traffic patterns may produce significantly more false alerts.
**Mitigation:** Default sensitivity set to "medium" (3σ). Provide per-agent sensitivity tuning. Implement feedback loop: when users mark false positives, the model adjusts the agent's baseline. Add quiet hours and alert deduplication (suppress repeat alerts for the same anomaly within a 1-hour window).

### Risk 3: Auto-Throttle Causes Production Outages
**Likelihood:** Low · **Impact:** Critical
If auto-throttle engages on a business-critical agent during a legitimate traffic surge (flash sale, incident response), it could cause customer-facing failures. Our experiment surfaced one instance of this: a marketing campaign triggered a 3× traffic spike that was incorrectly throttled.
**Mitigation:** Auto-throttle is opt-in and off by default. Business-critical agents can be exempted. "Expected surge" scheduling (added to backlog from experiment findings). Throttle reduces to 10% of baseline rather than full block, preserving partial service. Override available via API and portal within <2 minutes.

### Risk 4: Data Retention Costs Exceed Customer Expectations
**Likelihood:** Medium · **Impact:** Medium
Storing per-request cost telemetry at scale is expensive. A customer processing 100M AI requests/month generates ~30GB of cost events monthly. At 13-month retention in Azure Data Explorer, storage costs could surprise customers who expected "free" cost management.
**Mitigation:** Tiered retention: 24 hours hot (Cosmos DB), 30 days warm (ADX), 13 months cold (ADX with compressed storage). Aggregate older data to hourly/daily granularity. Publish storage cost estimator in documentation. Offer configurable retention periods.

### Risk 5: Design Partner Results Don't Generalize
**Likelihood:** Medium · **Impact:** Medium
Our experiments ran with 5 hand-picked organizations with strong FinOps awareness. The 23% spend reduction and 91% anomaly detection rate may not replicate across the broader customer base, where FinOps maturity varies significantly.
**Mitigation:** Track metrics at GA with identical instrumentation. Plan a follow-up experiment at public preview scale (target 50+ orgs). Segment results by FinOps maturity level. Set conservative public targets (15% spend reduction, 80% detection rate) rather than quoting experiment peaks.

---

## Tradeoffs

### Tradeoff 1: Real-Time vs. Batch Cost Attribution

| Option | Latency | Cost | Complexity |
|--------|---------|------|-----------|
| **Real-time** (Stream Analytics) | <5 min | ~$2,400/month per APIM instance | High — requires Event Hub, Stream Analytics, Cosmos DB hot store |
| **Batch** (scheduled aggregation) | 1–4 hours | ~$400/month per APIM instance | Low — Azure Function on timer, direct to ADX |

**Decision: Real-time for the hot path, batch for historical.**
The experiment demonstrated that teams took action within the same day of seeing cost data (median: 3.2 hours from dashboard view to first optimization action). A 4-hour batch delay would have missed the "morning review" workflow observed in 4 of 5 design partners. However, historical trend analysis doesn't require sub-minute freshness. We implemented a dual pipeline: real-time stream for the last 24 hours, hourly batch aggregation for everything beyond.

### Tradeoff 2: Auto-Throttle vs. Alert-Only Default

| Option | Overrun Prevention | Risk | User Control |
|--------|-------------------|------|-------------|
| **Auto-throttle on by default** | High — stops runaway spend automatically | Production disruption if mis-triggered | Lower — requires opt-out |
| **Alert-only by default** | Lower — depends on human response time | No production risk from the system itself | Higher — requires opt-in to throttle |

**Decision: Alert-only by default, auto-throttle opt-in.**
Despite the experiment showing strong overrun prevention (91%), the one false throttle activation validated our concern about production safety. For a platform-level capability, the blast radius of a false positive is too high to make auto-throttle the default. Alert-only gives teams visibility and response time without risk. Teams that want automated enforcement can opt in per-agent after understanding their traffic patterns. The onboarding wizard recommends auto-throttle for non-production and lower-criticality agents.

### Tradeoff 3: Per-Request vs. Daily Aggregation for Showback

| Option | Granularity | Actionability | Data Volume |
|--------|------------|--------------|-------------|
| **Per-request** | Individual request cost | Can trace specific expensive requests | ~300 bytes/request × volume |
| **Daily aggregation** | Team/agent/model daily totals | Sufficient for budget tracking and trends | ~2KB/agent/day |

**Decision: Per-request in hot store (24h), daily aggregation for showback and long-term.**
FinOps teams told us they need daily granularity for showback reports — nobody reads a report with 10M line items. But debugging anomalies requires per-request drill-down to identify the root cause (which specific requests spiked? what were the prompts?). Our approach: retain per-request data for 24 hours in Cosmos DB for anomaly investigation, then aggregate to daily totals in ADX for showback and trend analysis. This balances investigative power with manageable data volumes and keeps storage costs within customer expectations.

---

## Decision Framework

For each tradeoff, the team used the following evaluation criteria (weighted by priority):

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Customer impact | 35% | Does this choice directly improve the target user's workflow? |
| Production safety | 30% | Does this choice minimize risk of customer-facing incidents? |
| Engineering cost | 20% | How much incremental engineering effort does this choice require? |
| Future flexibility | 15% | Does this choice preserve optionality for future improvements? |

Decisions were documented in real-time during design reviews and validated against experiment data when available. The auto-throttle default decision (Tradeoff 2) was revised after experiment results showed a false positive — an example of the experiment-driven iteration cycle directly improving product safety.
