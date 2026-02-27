# Experiment Results — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tadiparthi · PM, Azure API Management — AI Gateway
**Status:** Final
**Analysis Date:** 2025-05-09

---

## Executive Summary

Two of three hypotheses were confirmed. One was partially confirmed. These results directly informed the GA roadmap: cost dashboards and anomaly detection ship as-is; showback reports require iteration on report content and CTA design before GA.

| Hypothesis | Target | Result | Verdict |
|-----------|--------|--------|---------|
| H1: Cost visibility → spend reduction | ≥15% reduction | **23.1% reduction** | ✅ Confirmed |
| H2: Anomaly alerts → overrun prevention | ≥80% prevented | **91% prevented** | ✅ Confirmed |
| H3: Showback → governance adoption | ≥3× adoption | **2.1× adoption** | ⚠️ Partially confirmed |

---

## Hypothesis 1 Results: Cost Visibility Drives Spend Reduction

### Data: Cost per 1K Requests (Normalized)

| Group | Baseline (Weeks 1–4) | Treatment (Weeks 5–8) | % Change |
|-------|----------------------|----------------------|----------|
| Treatment (52 agents) | $4.82 | $3.71 | **−23.1%** |
| Control (37 agents) | $5.14 | $4.97 | −3.3% |

**Difference-in-differences: −19.8 percentage points (P=0.003, 95% CI: [−28.4%, −11.2%])**

### Agent Performance Guardrails

| Metric | Treatment Δ | Control Δ | Guardrail |
|--------|------------|----------|-----------|
| Agent success rate | −0.4% | −0.2% | ✅ Within ±2% |
| P95 latency | +2.1% | +1.8% | ✅ Within ±10% |

### How Teams Reduced Costs
Post-experiment interviews revealed the mechanisms:
- **Model downgrades** (41% of savings): 14 agents switched from GPT-4o to GPT-4o-mini after teams saw per-model cost breakdowns and realized task complexity didn't require GPT-4o
- **Prompt optimization** (33% of savings): 8 teams shortened system prompts after seeing per-request token counts for the first time
- **Cache utilization** (18% of savings): 5 teams enabled semantic caching after the dashboard showed high cache-miss rates for repetitive queries
- **Request deduplication** (8% of savings): 3 teams fixed application-level retry logic surfaced by per-agent request volume views

### Dashboard Engagement
- Average daily active users: 3.2 per org (week 1) → 2.8 per org (week 4) — modest 12% decay
- Most-used views: Per-agent breakdown (89% of sessions), per-model comparison (67%), daily trend (54%)
- Export actions: 34 CSV exports across all treatment orgs (strong signal for downstream workflow integration)

**Decision: ✅ Ship cost attribution dashboard at public preview. No design changes needed.**

---

## Hypothesis 2 Results: Anomaly Alerts + Auto-Throttle

### Anomaly Detection Performance

| Metric | Synthetic (n=20) | Natural (n=11) | Combined |
|--------|-----------------|----------------|----------|
| Detection rate | 95% (19/20) | 82% (9/11) | **91% (28/31)** |
| Median time-to-detection | 4.2 min | 7.8 min | 5.6 min |
| P95 time-to-detection | 11.3 min | 18.1 min | 14.2 min |
| False positive rate | — | 2.8/week/org | ✅ Below 5/week |

### Budget Overrun Prevention

| Scenario | Without System (Control) | With System (Treatment) |
|----------|------------------------|------------------------|
| Anomalies escalating to overrun | 7/11 (64%) | 1/11 (9%) |
| Estimated excess spend | $18,400 | $1,200 |
| Mean time-to-human-response | 14.3 hours | 22 minutes |

### Missed Detections (3 of 31)
1. **Synthetic #14**: Slow-ramp cost increase (+8% daily for 5 days) — below daily threshold, detected on day 6 when cumulative deviation crossed weekly threshold
2. **Natural #4**: Model pricing change created a step function in cost that the seasonal model interpreted as a new baseline after 48 hours
3. **Natural #9**: Multi-model agent shifted traffic between models; total cost stayed similar but per-model patterns diverged — no net cost anomaly triggered

### Auto-Throttle Behavior
- Auto-throttle activated 8 times across treatment orgs during the experiment
- 7 of 8 activations were appropriate (true anomalies)
- 1 false activation: legitimate 3× traffic spike from a marketing campaign — team had not configured exemption. Resolution: added "expected surge" scheduling feature to backlog
- Mean time from throttle activation to manual override: 18 minutes
- Zero reports of auto-throttle causing customer-facing outages (business-critical agents were pre-exempted)

**Decision: ✅ Ship anomaly detection + auto-throttle at public preview. Add slow-ramp detection and expected-surge scheduling before GA.**

---

## Hypothesis 3 Results: Showback → Governance Adoption

### Policy Adoption Rates

| Group | Teams | Teams Adopting ≥1 Policy | Adoption Rate |
|-------|-------|-------------------------|---------------|
| Treatment (showback reports) | 24 | 8 | **33.3%** |
| Control (dashboard only) | 14 | 2 | **14.3%** |

**Rate ratio: 2.1× (95% CI: [0.8×, 5.4×], P=0.11)**

The 2.1× lift was below our 3× target, and the P-value of 0.11 did not meet the pre-registered α=0.05 threshold. Small sample sizes at the team-lead level limited statistical power.

### Qualitative Findings
In post-experiment interviews, we identified why showback underperformed:
- **Report timing**: Weekly reports arrived on Monday mornings and were buried in email. 4 team leads said they "skimmed and archived" them
- **CTA friction**: The "Set a budget" button linked to the Azure Portal, requiring 6 clicks to configure a policy. 3 team leads started but abandoned the flow
- **Missing context**: Reports showed spend but not *benchmarks* — team leads didn't know if their spend was high or low relative to peers
- **Attribution to dashboard**: 5 of 8 adopters in the treatment group said they created policies *because of the dashboard*, not the email report

### Iteration Plan
Based on findings, the showback report will be redesigned before GA:
- Deliver reports in Teams channels (not email) on Wednesday mornings
- Add peer benchmarking ("Your team spends 2.3× the median for similar agent types")
- Embed one-click policy creation directly in the report (no portal redirect)
- Test inline Adaptive Card with pre-configured budget suggestion

**Decision: ⚠️ Iterate on showback reports. Do not ship current version at GA. Run follow-up experiment in Q3.**

---

## Unexpected Findings

1. **Cache awareness effect**: Treatment orgs increased semantic cache hit rate from 12% to 31% — not a target metric, but the dashboard made cache-miss costs visible and teams optimized unprompted
2. **Cross-team competition**: Two treatment orgs reported informal "cost efficiency leaderboards" emerging among teams — competitive dynamics amplified the cost reduction effect
3. **Anomaly detection as debugging tool**: 3 engineering teams used anomaly alerts to detect application bugs (conversation loops, retry storms) faster than their existing APM tools — positioning opportunity for developer experience

## Next Experiment Ideas

1. **Showback v2 A/B**: Test redesigned Teams-based showback with peer benchmarks against current email version
2. **Predictive budget alerts**: "At current trajectory, you will exceed budget in 4 days" — test if forward-looking alerts drive faster action than threshold alerts
3. **Model recommendation engine**: When an agent's cost-per-request suggests over-provisioned model capability, suggest a cheaper model — measure adoption and satisfaction
4. **Chargeback vs. showback**: Test whether actual cost allocation (chargeback) drives stronger optimization than visibility-only (showback)
