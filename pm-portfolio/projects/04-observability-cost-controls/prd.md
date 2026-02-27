# Product Requirements Document — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tallapureddy · Principal PM, Azure API Management — AI Gateway
**Status:** Approved · v2.1
**Last Updated:** 2025-03-18

---

## 1. Problem Statement

Azure API Management processes billions of AI inference requests monthly. As enterprises scale from pilot to production AI, three cost management failures emerge consistently:

**No cost attribution.** Platform teams route requests from dozens of internal teams through a shared AI Gateway. The Azure bill shows a single Cognitive Services line item. Nobody knows which team, agent, or model consumes what. A Fortune 500 customer told us: *"We have 47 agents running through APIM. I can tell you total spend is $380K/month. I cannot tell you which agent costs $200K and which costs $12."*

**No anomaly detection.** A misconfigured retry loop or a prompt injection attack can spike token consumption 50× in minutes. Teams discover this from the monthly bill — or from an angry finance email. One design partner had a runaway summarization agent consume $28K in tokens over a weekend before anyone noticed.

**No budget enforcement.** Even when teams set soft budgets, there's no mechanism to throttle or alert when spend approaches limits. FinOps teams build manual spreadsheets that lag by 2–3 weeks. By the time a budget overrun is identified, the damage is done.

**Business impact:** In customer interviews (n=23 platform engineering leads), 78% cited "AI cost visibility" as their top-3 blocker to scaling AI adoption. Estimated wasted spend across Azure AI Gateway customers: $4.2M/month.

## 2. Target Users

| Persona | Role | Primary Need |
|---------|------|-------------|
| **Platform Engineer** | Manages AI Gateway configuration and routing | Attribute costs per team/agent; set budget guardrails |
| **FinOps Analyst** | Tracks and optimizes cloud spend | Showback reports; trend analysis; anomaly investigation |
| **Engineering Manager** | Owns team's AI usage budget | See team's spend vs. budget; get alerts before overruns |
| **Security/Compliance Lead** | Monitors for abuse and policy violations | Detect anomalous usage patterns; audit cost events |

## 3. Goals and Non-Goals

### Goals
- G1: Enable per-team, per-agent, per-model cost attribution with <5 min latency
- G2: Detect cost anomalies and alert within 10 minutes of deviation onset
- G3: Enforce budget policies that prevent overruns without breaking critical workloads
- G4: Reduce time-to-insight for FinOps teams from weeks to minutes
- G5: Validate each capability through structured experiments before GA commitment

### Non-Goals
- Building a general-purpose FinOps platform (defer to Azure Cost Management integration)
- Real-time billing (we provide near-real-time usage attribution; billing reconciliation remains daily)
- Optimizing model selection for cost (future project — model routing intelligence)
- Supporting non-AI workloads through this pipeline (standard APIM analytics covers those)

## 4. User Scenarios

### Scenario 1: Daily Cost Attribution Review
Priya, a platform engineer at a financial services company, opens the AI Gateway cost dashboard at 9 AM. She sees that the "document-summarizer" agent consumed 4.2M tokens yesterday across GPT-4o, costing $52.80 — a 3× increase from the prior week. She drills into the per-model view and discovers the team switched from GPT-4o-mini to GPT-4o without updating their budget allocation. She Slack-messages the team lead with a screenshot.

### Scenario 2: Anomaly Alert and Auto-Throttle
At 2:17 AM, the "customer-support-bot" agent starts consuming tokens at 8× its normal rate due to a conversation loop bug. The anomaly detection system triggers an alert to PagerDuty within 6 minutes. Because the team enabled auto-throttle, the gateway reduces the agent's request rate to 10% of baseline, preventing an estimated $4,200 in excess spend. The on-call engineer investigates and deploys a fix by morning.

### Scenario 3: Monthly Showback Report
Marcus, a FinOps analyst, generates the monthly AI cost showback report. The report breaks down the $127K total spend across 12 teams, 34 agents, and 4 models. He filters to the top-5 cost drivers, compares month-over-month trends, and attaches the report to the executive cost review meeting invite. Two teams are flagged as exceeding their quarterly allocation by >20%.

### Scenario 4: Budget Policy Configuration
Raj, an engineering manager, sets a monthly budget of $15,000 for his team's AI workloads. He configures three thresholds: warning alert at 70% ($10,500), critical alert at 90% ($13,500), and auto-throttle at 100% ($15,000). He excludes the "fraud-detection" agent from throttling because it's business-critical and marks it as "alert-only."

### Scenario 5: Executive Cost Governance
Sarah, VP of Engineering, wants to understand AI cost trends before the board meeting. She opens the governance dashboard showing total AI spend, spend-per-business-unit, cost efficiency (cost per successful agent invocation), and quarter-over-quarter trends. She sees that cost-per-invocation dropped 18% due to model optimization, even as total usage grew 45%.

### Scenario 6: Anomaly Investigation
A FinOps analyst receives an anomaly alert for the "code-review" agent. She opens the investigation view showing the anomaly timeline, affected model (GPT-4-turbo), token consumption spike pattern, and correlated events. She identifies that a new prompt template deployed at 3:42 PM doubled average token usage per request. She creates a JIRA ticket for the team.

## 5. Solution Design

### 5.1 Cost Attribution Dashboard
- **Attribution dimensions**: Subscription → Resource Group → APIM Instance → Product → API → Operation → Agent ID → Model → Team (custom tag)
- **Token-level tracking**: Prompt tokens, completion tokens, total tokens per request, mapped to model pricing
- **Near-real-time**: Metrics available within 5 minutes of request completion
- **Views**: Hourly/daily/weekly/monthly aggregation; drill-down from org to individual agent

### 5.2 Anomaly Detection Engine
- **Algorithm**: Adaptive threshold using 7-day rolling baseline with seasonal decomposition (hourly, daily, weekly patterns)
- **Detection targets**: Token consumption rate, cost rate, error rate spike, latency degradation
- **Alert channels**: Azure Monitor alerts, PagerDuty, Slack, email, webhook
- **Sensitivity**: Configurable per-agent (low/medium/high) with default "medium" detecting >3σ deviations

### 5.3 Budget Policy Engine
- **Policy types**: Soft limit (alert only), hard limit (throttle to N%), kill switch (block all requests)
- **Granularity**: Per-team, per-agent, per-model, or any combination
- **Exemptions**: Mark agents as "business-critical" to exempt from hard limits
- **Reset periods**: Daily, weekly, monthly, or custom billing cycle alignment

### 5.4 Showback & Governance Reports
- **Automated reports**: Scheduled daily/weekly/monthly delivery via email
- **Export formats**: CSV, PDF, Azure Cost Management integration
- **Governance view**: Policy compliance rates, budget utilization, optimization recommendations

## 6. Technical Approach

### 6.1 Metrics Pipeline
```
Request → APIM Gateway Policy (extract metadata) → Event Hub → Stream Analytics → Cosmos DB (hot store) → Azure Data Explorer (analytics store)
                                                                        ↓
                                                              Anomaly Detection Service
                                                                        ↓
                                                              Azure Monitor → Alerts
```

### 6.2 Key Technical Decisions
- **Gateway policy** emits structured cost events with agent ID, model, token counts, and team tags
- **Event Hub** provides the durable, ordered event stream for downstream processing
- **Stream Analytics** handles real-time aggregation and anomaly scoring
- **Cosmos DB** stores the last 24 hours for dashboard queries with <100ms P99 latency
- **Azure Data Explorer** stores 13 months of history for trend analysis and showback

### 6.3 Integration Points
- **Azure Monitor**: Native integration for alerting, workbooks, and Grafana dashboards
- **Azure Cost Management**: Daily export reconciliation to match usage attribution with actual billing
- **Azure Policy**: Budget policies expressed as Azure Policy definitions for governance-as-code

### 6.4 Data Model

The core cost event schema emitted by the gateway policy:

```json
{
  "timestamp": "2025-03-15T14:22:03.847Z",
  "subscriptionId": "a1b2c3d4-...",
  "apimInstanceId": "contoso-apim-prod",
  "agentId": "document-summarizer",
  "teamId": "platform-eng",
  "modelId": "gpt-4o",
  "promptTokens": 1847,
  "completionTokens": 423,
  "totalTokens": 2270,
  "estimatedCostUsd": 0.0284,
  "cacheHit": false,
  "responseStatus": 200,
  "latencyMs": 1842,
  "correlationId": "req-7f3a9b..."
}
```

This schema supports all attribution dimensions, anomaly detection inputs, and budget tracking calculations. The `estimatedCostUsd` field is computed at the gateway using the model pricing table (updated weekly from Azure pricing API).

### 6.5 Performance Requirements
- Gateway policy overhead: <3ms P99 added latency per request
- Event Hub ingestion: sustain 50K events/second per APIM instance
- Dashboard query latency: <2 seconds for 30-day time range; <5 seconds for 90-day
- Anomaly scoring: <30 seconds from event ingestion to anomaly score computation
- Alert delivery: <60 seconds from anomaly score exceeding threshold to alert in channel

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cost attribution coverage | >95% of AI requests attributed to a team/agent | Telemetry audit |
| Time-to-detect anomaly | <10 minutes from deviation onset | End-to-end latency measurement |
| Budget overrun prevention | >80% of potential overruns caught | Before/after comparison |
| AI spend reduction (attributed teams) | >15% within 30 days of onboarding | Experiment cohort analysis |
| FinOps report generation time | <2 minutes (down from ~4 hours manual) | User timing study |

## 8. Competitive Landscape

| Competitor | Strengths | Gaps Our Solution Addresses |
|------------|-----------|---------------------------|
| **Datadog LLM Observability** | Strong APM integration; prompt-level tracing | No native Azure billing reconciliation; no budget enforcement; requires separate Datadog subscription |
| **Helicone** | Developer-friendly; fast setup; prompt analytics | No gateway-level enforcement; no auto-throttle; limited to OpenAI-compatible APIs |
| **Langfuse** | Open-source; flexible tracing; cost tracking | No anomaly detection; no budget policies; requires self-hosted infrastructure at scale |
| **Native Azure Cost Management** | Billing-accurate; enterprise trust | No per-agent attribution; no AI-specific anomaly detection; daily granularity only |

Our differentiation: **gateway-native enforcement** (throttle before cost is incurred), **Azure billing reconciliation** (accuracy customers trust), and **experiment-validated outcomes** (proven 23% spend reduction, 91% anomaly prevention).

## 9. Privacy and Compliance

- Cost telemetry contains metadata only (agent ID, model, token counts, team tags). No prompt content, completion content, or PII is stored in the cost pipeline.
- All data stored in customer's own Azure subscription (Cosmos DB, ADX). No data leaves the customer's tenant.
- Data retention configurable per customer. Default: 24h per-request, 13mo aggregated.
- GDPR: No personal data processing. Team tags are organizational identifiers, not individual user data.
- SOC2: Pipeline infrastructure follows Azure's standard SOC2 controls. Audit logs for policy changes and alert configurations.

## 10. Open Questions

1. Should anomaly detection run on raw token counts or estimated cost? (Decision: cost — see decision-log.md)
2. How do we handle shared agents used by multiple teams? (Decision: proportional split by request count)
3. What's the right default anomaly sensitivity for new agents with no baseline? (Decision: conservative 4σ for first 7 days, then drop to 3σ)
4. Should we support chargeback (actual cost allocation to team budgets) in v1 or defer? (Decision: defer — showback first, validate demand for chargeback in H3v2 experiment)
5. How do we price the telemetry storage component at GA? (Open — pricing team evaluating consumption-based vs. included-in-SKU models)
