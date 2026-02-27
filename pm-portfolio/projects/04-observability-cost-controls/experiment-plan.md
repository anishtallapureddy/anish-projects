# Experiment Plan — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tadiparthi · PM, Azure API Management — AI Gateway
**Status:** Executed · All three experiments completed
**Last Updated:** 2025-04-22

---

## Overview

This document defines three structured experiments to validate product hypotheses before committing to GA. Each hypothesis links a specific product capability to a measurable business outcome. Success criteria were pre-registered with the team before data collection began.

**Design partners:** 5 organizations (2 financial services, 1 healthcare, 1 e-commerce, 1 SaaS platform) representing 89 distinct AI agents and ~$420K/month in combined AI spend through Azure API Management.

---

## Hypothesis 1: Cost Visibility Drives Spend Reduction

> **"Teams that see per-agent cost breakdowns reduce AI spend by 15% within 30 days without degrading agent performance."**

### Rationale
Customer interviews revealed that most teams have never seen per-agent cost data. We hypothesize that visibility alone — without requiring any code changes — drives optimization behavior (model downgrades, prompt tightening, cache utilization).

### Metric to Measure
- **Primary**: Percentage change in AI spend per team, normalized by request volume (cost per 1K requests)
- **Secondary**: Agent success rate (to ensure cost reduction doesn't come from breaking things)
- **Guardrail**: P95 latency per agent (must not increase by >10%)

### Test Design: Staggered Rollout (Before/After with Control)
- **Treatment group** (3 orgs, 52 agents): Receive cost attribution dashboard with per-agent, per-model breakdowns and daily email digests
- **Control group** (2 orgs, 37 agents): Continue with standard Azure billing (no per-agent visibility) during the test period
- **Pre-period**: 4 weeks of baseline data collection before dashboard rollout
- **Treatment period**: 4 weeks with dashboard active

### Sample Size Justification
- Minimum detectable effect: 10% cost reduction
- Baseline cost variance: ~18% week-over-week (measured during pre-period)
- Required sample: ≥40 agents per group at α=0.05, power=0.80
- Actual sample: 52 treatment, 37 control — sufficient for primary metric

### Success Criteria (Pre-Registered)
- ✅ **Ship if**: Treatment group shows ≥15% cost-per-1K-request reduction vs. control, with P<0.05 and no degradation in agent success rate
- ⚠️ **Iterate if**: Reduction is 5–15% or P is between 0.05–0.10
- ❌ **Kill if**: Reduction <5% or agent success rate drops by >2%

### Instrumentation
- Cost attribution pipeline emitting per-request cost events to Azure Data Explorer
- Dashboard usage telemetry: page views, filter usage, export actions, time-on-page
- Agent performance metrics: success rate, P50/P95 latency, error codes

---

## Hypothesis 2: Anomaly Alerts + Auto-Throttle Prevent Budget Overruns

> **"Automated anomaly alerts with optional auto-throttle prevent 80% of budget overruns compared to manual monitoring."**

### Rationale
Design partners reported 3–5 budget overrun incidents per quarter, each costing $2K–$28K. Current detection method: manual log review, typically 1–3 days after the spike began.

### Metric to Measure
- **Primary**: Percentage of simulated and real anomalies detected before budget threshold breach
- **Secondary**: Time-to-detection (minutes from anomaly onset to alert)
- **Guardrail**: False positive rate (must be <5 alerts/week per org to avoid alert fatigue)

### Test Design: Controlled Injection + Natural Observation
We used a hybrid approach:
- **Synthetic injection** (weeks 1–2): Injected 20 controlled anomaly scenarios across treatment orgs (token spikes, cost surges, unusual model switches) without team knowledge. Measured detection rate and time.
- **Natural observation** (weeks 3–4): Monitored for organic anomalies across all orgs. Compared detection speed between treatment (automated alerts) and control (manual discovery).

### Anomaly Scenarios Injected
| Scenario | Description | Expected Cost Impact |
|----------|------------|---------------------|
| Retry storm | Agent retry loop consuming 12× normal tokens | $3,400/day |
| Model upgrade | Silent switch from GPT-4o-mini to GPT-4o | $1,800/day |
| Prompt bloat | New template doubling avg prompt tokens | $900/day |
| Traffic surge | 5× request volume from upstream service | $2,100/day |
| Conversation loop | Chat agent stuck in clarification cycle | $1,200/day |

### Sample Size and Duration
- 20 synthetic anomalies + estimated 8–12 natural anomalies over 4 weeks
- Treatment: 3 orgs with anomaly detection + auto-throttle enabled
- Control: 2 orgs with standard Azure Monitor alerts (CPU, latency) only

### Success Criteria (Pre-Registered)
- ✅ **Ship if**: ≥80% of anomalies detected before budget breach AND median time-to-detection <15 minutes AND false positive rate <5/week
- ⚠️ **Iterate if**: Detection rate 60–80% OR time-to-detection 15–30 min
- ❌ **Kill if**: Detection rate <60% OR false positive rate >10/week

### Instrumentation
- Anomaly detection service logging: detection timestamp, anomaly score, threshold, action taken
- Budget tracking: projected spend at time of detection vs. budget limit
- Alert delivery telemetry: channel, delivery latency, acknowledgment time
- False positive tracking: team-reported false alerts via feedback button in alert

---

## Hypothesis 3: Showback Reports Drive Governance Adoption

> **"Teams that receive automated showback reports adopt governance policies (budget limits, model restrictions) at 3× the rate of teams without showback."**

### Rationale
We observed that governance policy adoption is <8% among AI Gateway customers. Our theory: teams don't adopt policies because they don't see the cost data that would motivate governance. Showback creates the "aha moment" that drives policy creation.

### Metric to Measure
- **Primary**: Governance policy adoption rate (percentage of teams that create ≥1 budget policy within 30 days)
- **Secondary**: Number of policies created per team; policy strictness level (alert-only vs. throttle vs. block)
- **Guardrail**: Team satisfaction score (must remain ≥4.0/5.0 — governance shouldn't feel punitive)

### Test Design: A/B by Organization
- **Treatment group** (3 orgs): Receive weekly automated showback reports delivered to team leads and FinOps via email, with embedded "Set a budget" CTA linking to policy configuration
- **Control group** (2 orgs): Can access cost data in the dashboard (from H1) but receive no proactive showback reports
- Note: Both groups have access to the dashboard — this isolates the effect of proactive push vs. passive pull

### Sample Size and Duration
- Treatment: 3 orgs × ~8 team leads each = 24 team leads receiving reports
- Control: 2 orgs × ~7 team leads each = 14 team leads with dashboard access only
- Duration: 4 weeks of report delivery + 2 weeks observation for delayed policy creation
- Baseline adoption rate: 8% → target 24% (3×) in treatment group

### Success Criteria (Pre-Registered)
- ✅ **Ship if**: Treatment group policy adoption rate ≥3× control rate with P<0.05
- ⚠️ **Iterate if**: Adoption rate is 2–3× control OR P is between 0.05–0.10
- ❌ **Kill if**: Adoption rate <2× control

### Instrumentation
- Report delivery and engagement: open rate, click-through on CTA, time-to-first-policy
- Policy creation events: timestamp, policy type, granularity, thresholds configured
- Satisfaction survey: 5-question survey sent at end of experiment period

---

## Control Group Design

To minimize contamination between treatment and control:
- Organizations are the unit of randomization (not individual teams) to prevent within-org spillover
- Control orgs were told they are in a "phased rollout" and will receive features in the next wave
- No control org employees have access to treatment org dashboards or reports
- All orgs signed experiment participation agreements as part of their design partner onboarding

## Risks to Experiment Validity

| Risk | Mitigation |
|------|-----------|
| **Novelty effect**: Treatment teams optimize because the dashboard is new, not because it's useful | Extended 4-week treatment period; track week-over-week decay in dashboard engagement |
| **Hawthorne effect**: Teams change behavior because they know they're being observed | Both groups know they're design partners; only treatment group knows specific capability being tested |
| **Org-level confounders**: Treatment orgs may have stronger FinOps culture | Balanced assignment using pre-experiment FinOps maturity scores; control for baseline spend patterns |
| **Synthetic anomaly detection**: Injected anomalies may be easier to detect than real ones | Designed injection scenarios from actual customer incident reports; supplemented with natural observation |
| **Small sample size**: 5 orgs limits statistical power for org-level effects | Agent-level analysis as primary; org-level as sensitivity check; pre-registered minimum detectable effects |

## Timeline

| Week | Activity |
|------|----------|
| 1–2 | Instrumentation deployment; baseline data collection begins; experiment registration |
| 3–4 | Baseline period continues; anomaly detection calibration on historical data |
| 5 | Dashboard rollout to treatment group (H1); anomaly detection activation (H2) |
| 6 | Showback report delivery begins (H3); synthetic anomaly injection starts (H2) |
| 7–8 | Full experiment run; weekly data quality checks; mid-experiment review |
| 9–10 | Experiment run continues; begin qualitative interviews with treatment group |
| 11 | Experiment ends; data freeze; begin analysis |
| 12 | Results synthesis; ship/iterate/kill decisions; stakeholder readout |
