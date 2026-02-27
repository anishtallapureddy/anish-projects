# Risks & Tradeoffs — AI Gateway Pricing Tiers

## Risks

### Risk 1: Starter/Pro pricing too high relative to open-source alternatives
**Likelihood:** Medium | **Impact:** High
LiteLLM Proxy is free and self-hosted. Developers comfortable with ops may choose to run their own gateway rather than pay $49-$349/month. This is most acute for the Starter segment where $49/month is material.
**Mitigation:** Free tier removes the "I'll just self-host" objection during experimentation. Starter value prop must emphasize operational cost saved (no infra management, built-in monitoring, Azure SLA) — frame $49 as cheaper than 2 hours of engineer time per month managing a self-hosted proxy.

### Risk 2: Free tier cannibalizes Starter revenue
**Likelihood:** Medium | **Impact:** Medium
If the Free tier is too generous (10K requests/month), many real workloads may never hit the ceiling. Preview telemetry shows 41% of accounts use <10K requests — some of these are production workloads, not just experiments.
**Mitigation:** Free tier is hard-capped (not soft-degraded), which creates a clear forcing function. Feature gating (no content safety, no load balancing on Free) provides upgrade motivation independent of volume. Monitor Free-tier accounts with production-like traffic patterns (consistent daily volume, low error rates) and target them with upgrade campaigns.

### Risk 3: Competitor price response undercuts positioning
**Likelihood:** Low | **Impact:** Medium
If Portkey or LiteLLM Cloud drop prices aggressively after our launch, our Starter tier could appear overpriced in comparison tables. AWS/GCP could also introduce gateway-specific pricing that bundles at $0 surcharge.
**Mitigation:** Our differentiation is Azure ecosystem integration (VNet, Entra ID, Azure Monitor, compliance), not price. Price-sensitive customers are not our target for paid tiers. If competitors drop aggressively, we increase Free tier limits rather than cut paid pricing — protect revenue per paid customer, compete on acquisition cost.

### Risk 4: Usage metering accuracy at scale
**Likelihood:** Medium | **Impact:** High
Billing customers based on gateway requests and tokens requires metering infrastructure with <0.1% error rate. Any overcount erodes trust; any undercount leaks revenue. Metering must handle retries, cached responses, and partial failures consistently.
**Mitigation:** Metering system uses Azure Event Hubs with exactly-once processing semantics. Billing reconciliation runs nightly with automated anomaly detection. Customers get real-time usage dashboards so discrepancies surface early. Plan for a 60-day billing grace period at launch where overages are flagged but not charged, building confidence in metering accuracy.

---

## Tradeoffs

### Tradeoff 1: Usage-based pricing vs. seat-based pricing

| Factor | Usage-based (chosen) | Seat-based (rejected) |
|--------|---------------------|-----------------------|
| Alignment with value | High — price scales with AI calls processed | Low — number of humans doesn't correlate with gateway value |
| Predictability for customer | Medium — usage can spike | High — flat per-seat cost |
| Revenue upside | High — grows with workload | Capped — grows only with headcount |
| Competitive norm | Standard in API/infra | Standard in SaaS collaboration tools |

**Decision:** Usage-based. AI Gateway is infrastructure, not a collaboration tool. A 5-person startup routing 2M requests/month should pay more than a 50-person company routing 10K requests/month. Seat-based would misprice both.

### Tradeoff 2: Free tier (permanent) vs. time-limited trial

| Factor | Free tier (chosen) | Trial (rejected) |
|--------|--------------------|--------------------|
| Adoption friction | Very low — no expiry anxiety | Medium — clock ticking creates urgency but also abandonment |
| PLG motion | Strong — developers build on it long-term | Weak — trial expiry breaks integrations, developers leave |
| Cost to serve | ~$0.04/month per free account (metering + storage) | Lower — accounts auto-expire |
| Conversion rate | Lower (4-8% typical) | Higher (15-20% typical) but from smaller pool |
| Developer perception | Positive — "developer-friendly" | Neutral to negative — "trying to trick me into paying" |

**Decision:** Permanent free tier. The PLG motion depends on developers integrating AI Gateway into their stack and then growing into paid tiers organically. A trial creates a cliff that breaks this flywheel. At $0.04/month per free account, supporting 50K free accounts costs $24K/year — trivial relative to the acquisition value of the funnel.

---

## Decision Rationale Summary

The core pricing philosophy is: **price on value delivered, compete on ecosystem, acquire on friction removal.** Usage-based tiers with a permanent free tier optimize for long-term market capture in a nascent category where adoption velocity matters more than short-term revenue extraction.
