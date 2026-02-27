# Metrics Framework — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tadiparthi · PM, Azure API Management — AI Gateway
**Last Updated:** 2025-05-12

---

## North Star Metric

**Cost per successful agent invocation** — measures the unit economics of AI workloads flowing through the gateway. A decreasing trend signals that teams are optimizing (better models, tighter prompts, effective caching) without sacrificing reliability.

**Formula**: Total attributed AI cost ÷ Total successful agent invocations (HTTP 2xx responses)

**Current baseline**: $0.0087/invocation → **Target**: $0.0062/invocation (−29%) within 6 months of GA

---

## Category Metrics

### Cost Attribution
| Metric | Definition | Target |
|--------|-----------|--------|
| Attribution coverage | % of AI requests with complete team/agent/model attribution | >95% |
| Attribution latency | Time from request completion to cost data available in dashboard | <5 min (P95) |
| Attribution accuracy | Variance between attributed cost and reconciled Azure bill | <2% monthly |
| Dashboard MAU | Monthly active users of cost attribution dashboard | >60% of APIM admins |

### Anomaly Detection
| Metric | Definition | Target |
|--------|-----------|--------|
| Detection rate | % of true cost anomalies detected before budget breach | >90% |
| Time-to-detection | Minutes from anomaly onset to alert delivery | <10 min (median) |
| False positive rate | Erroneous alerts per org per week | <5/week |
| Auto-throttle accuracy | % of auto-throttle activations that were true positives | >90% |
| MTTR | Mean time from alert to resolution | <45 min |

### Budget Compliance
| Metric | Definition | Target |
|--------|-----------|--------|
| Budget adoption rate | % of teams with ≥1 active budget policy | >40% within 90 days of onboarding |
| Overrun prevention rate | % of potential budget overruns prevented by policies | >85% |
| Policy coverage | % of total AI spend covered by at least one budget policy | >70% |
| Budget utilization efficiency | Actual spend ÷ allocated budget (too low = waste, too high = risk) | 60–85% sweet spot |

### Platform Adoption
| Metric | Definition | Target |
|--------|-----------|--------|
| Feature activation rate | % of AI Gateway customers enabling cost controls | >30% within 6 months of GA |
| Time-to-value | Days from feature activation to first cost optimization action | <7 days |
| Retention | % of activated customers still using cost features after 90 days | >75% |
| NPS | Net Promoter Score for cost management capabilities | >40 |

---

## OKRs (Q3 2025 — Post-GA Launch)

### Objective 1: Establish AI cost visibility as a core AI Gateway capability
- **KR1**: 200+ AI Gateway customers activate cost attribution (from 5 preview)
- **KR2**: Attribution coverage >95% across activated customers
- **KR3**: Customer NPS for cost features >40

### Objective 2: Prove anomaly detection prevents real financial damage
- **KR1**: Detect and alert on >90% of cost anomalies within 10 minutes
- **KR2**: Prevent >$500K in aggregate excess spend across customer base
- **KR3**: False positive rate <3/week/org (improved from <5 target)

### Objective 3: Drive measurable cost optimization behavior
- **KR1**: Activated customers reduce cost-per-invocation by >20% within 60 days
- **KR2**: >40% of teams adopt budget policies within 90 days
- **KR3**: Showback v2 drives 3× governance adoption (re-test H3)

---

## Telemetry Events

| Event Name | Trigger | Key Properties |
|------------|---------|---------------|
| `ai.cost.request_attributed` | Each AI request processed with cost attribution | agentId, modelId, teamId, promptTokens, completionTokens, estimatedCost, cacheHit |
| `ai.cost.dashboard_viewed` | User opens cost attribution dashboard | userId, orgId, viewType, filterApplied, timeRange |
| `ai.cost.export_generated` | User exports cost data | format (CSV/PDF), dateRange, dimensions |
| `ai.anomaly.detected` | Anomaly detection engine flags a deviation | agentId, anomalyType, severity, score, baseline, actual, detectionLatencyMs |
| `ai.anomaly.alert_sent` | Alert delivered to configured channel | channel, deliveryLatencyMs, acknowledged |
| `ai.anomaly.false_positive` | User marks alert as false positive | alertId, reason |
| `ai.throttle.activated` | Auto-throttle engaged for an agent | agentId, throttlePercent, triggerReason, budgetUtilization |
| `ai.throttle.overridden` | User manually overrides auto-throttle | agentId, overrideReason, userId |
| `ai.budget.policy_created` | New budget policy configured | policyType, granularity, threshold, enforcementAction |
| `ai.budget.threshold_crossed` | Spend crosses a budget threshold level | policyId, thresholdPercent, currentSpend, budgetLimit |
| `ai.showback.report_delivered` | Showback report sent to recipient | recipientRole, reportType, openedWithin24h |
| `ai.showback.cta_clicked` | User clicks action link in showback report | ctaType, destination |

---

## Dashboard Views

### 1. Cost Overview (Default Landing Page)
- Total AI spend (current period vs. previous)
- Spend by team (horizontal bar chart, sorted descending)
- Spend by model (donut chart)
- Cost trend (line chart, daily granularity, 30-day window)

### 2. Agent Deep Dive
- Per-agent cost breakdown with token-level detail
- Cost efficiency: cost per successful invocation per agent
- Cache hit rate and estimated savings from caching
- Model usage distribution per agent

### 3. Anomaly Timeline
- Chronological view of detected anomalies with severity indicators
- Drill-down: anomaly details, affected agent, detection-to-resolution timeline
- False positive rate trend (weekly rolling)

### 4. Budget Compliance
- Budget utilization gauges per team/agent
- Projected end-of-period spend (linear and trend-based projection)
- Policy violation log with enforcement actions taken

### 5. Executive Summary
- North star metric trend (cost per successful invocation)
- Total spend vs. total budget (org-wide)
- Top cost optimization opportunities (automated recommendations)
- Quarter-over-quarter efficiency gains
