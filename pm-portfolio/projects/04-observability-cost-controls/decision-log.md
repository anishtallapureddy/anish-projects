# Decision Log — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tallapureddy · Principal PM, Azure API Management — AI Gateway

---

## ADR-001: Cost Attribution Granularity

| Field | Value |
|-------|-------|
| **Date** | 2025-02-03 |
| **Status** | Accepted |
| **Deciders** | Anish Tallapureddy (PM), Kavitha Rao (Eng Lead), James Chen (Data Eng) |

**Context:**
We needed to decide the finest granularity for cost attribution. Options ranged from subscription-level (already available in Azure Cost Management) down to per-request level. Finer granularity means more telemetry, higher storage costs, and more complex pipelines — but also more actionable insights for platform teams.

**Decision:**
Attribute costs at the **per-request level** in the hot path, aggregated to **per-agent/per-model/per-team daily** for reporting. Attribution dimensions: Subscription → Resource Group → APIM Instance → Product → API → Operation → Agent ID (from custom header or policy-extracted metadata) → Model (from backend routing) → Team (from subscription key mapping or custom tag).

**Rationale:**
- Customer interviews (n=23) consistently asked for per-agent visibility — this was the #1 requested dimension
- Per-request data is essential for anomaly root-cause analysis (experiment H2 confirmed this)
- Daily aggregation sufficient for showback and governance (validated in experiment H3)
- Storage cost managed by tiered retention: 24h per-request, 13mo aggregated

**Consequences:**
- Gateway policy must extract agent ID and team metadata on every request — adds ~2ms P99 latency
- Requires customers to adopt agent ID tagging convention (onboarding friction)
- Storage costs scale linearly with request volume; documented in pricing calculator
- Enables future per-request cost optimization recommendations

---

## ADR-002: Anomaly Detection Algorithm

| Field | Value |
|-------|-------|
| **Date** | 2025-02-17 |
| **Status** | Accepted |
| **Deciders** | Anish Tallapureddy (PM), Kavitha Rao (Eng Lead), Priya Sharma (ML Eng) |

**Context:**
We evaluated three approaches for detecting cost anomalies: static thresholds, statistical process control (rolling z-score), and ML-based forecasting (Prophet/DeepAR). The algorithm must balance detection sensitivity with false positive rate across diverse traffic patterns — some agents have steady traffic, others are highly bursty.

**Decision:**
**Adaptive threshold using 7-day rolling baseline with seasonal decomposition.** Specifically: decompose each agent's cost time series into hourly-of-day and day-of-week seasonal components using STL decomposition. Compute residuals and flag anomalies when residuals exceed a configurable z-score threshold (default: 3σ). Warm-up period: 7 days of data before detection activates (use 4σ conservative threshold for agents with <7 days of history).

**Rationale:**
- Static thresholds rejected: too many false positives for bursty agents, too many missed detections for steady agents
- ML forecasting (Prophet) tested in prototype: marginally better detection (+4% rate) but 10× compute cost, 30-second scoring latency, and requires model retraining — operational complexity unjustified at this stage
- STL + z-score achieved 91% detection rate in experiment with 2.8 false positives/week — within our success criteria
- Simple enough for customers to understand and tune ("How many standard deviations?")

**Consequences:**
- Slow-ramp anomalies (gradual daily increases) are harder to detect — mitigated by adding a weekly cumulative deviation check
- New agents with volatile early traffic may generate false positives during warm-up — mitigated by conservative 4σ threshold
- Algorithm is interpretable and debuggable, which builds customer trust
- Future path to ML-based detection preserved as a "premium tier" option if demand emerges

---

## ADR-003: Budget Policy Enforcement Model

| Field | Value |
|-------|-------|
| **Date** | 2025-03-05 |
| **Status** | Accepted |
| **Deciders** | Anish Tallapureddy (PM), Kavitha Rao (Eng Lead), Sarah Kim (Security PM) |

**Context:**
Budget policies need an enforcement mechanism when spend exceeds limits. We debated three models: alert-only (no enforcement), gateway-level throttling (rate limit at the APIM policy layer), and backend-level blocking (reject requests before they reach the AI model). Each has different latency, reliability, and blast radius characteristics.

**Decision:**
**Gateway-level throttling with graduated response.** Three enforcement tiers:
1. **Alert** at configurable threshold (default 70%): notification only
2. **Throttle** at configurable threshold (default 95%): reduce agent's request rate to a configured percentage (default 10%) at the gateway policy layer
3. **Block** (optional, off by default): reject all requests for the agent with HTTP 429 and a descriptive error body

All tiers are opt-in. Alert-only is the default for all new policies. Business-critical agents can be permanently exempted from throttle and block.

**Rationale:**
- Alert-only as default aligns with experiment finding that teams want visibility first, enforcement second
- Gateway-level throttle is enforceable before cost is incurred (request never reaches the model)
- Graduated response gives teams proportional control — most will use alert + throttle, few will use block
- Backend blocking rejected: introduces coupling between cost system and model endpoints; harder to guarantee consistency

**Consequences:**
- Throttling at gateway means some in-flight requests may still complete during the enforcement transition (1–2 second window)
- Teams must configure exemptions proactively — a missed exemption on a critical agent could cause an incident
- Graduated model adds UX complexity to the policy configuration experience
- Gateway policy evaluation adds ~1ms latency for budget check on each request

---

## ADR-004: Dashboard Technology

| Field | Value |
|-------|-------|
| **Date** | 2025-03-12 |
| **Status** | Accepted |
| **Deciders** | Anish Tallapureddy (PM), James Chen (Data Eng), Li Wei (Frontend Lead) |

**Context:**
We needed to decide whether to build a custom dashboard experience in the Azure Portal, use Azure Monitor Workbooks, or integrate with Grafana. Each option has different development cost, customization flexibility, and alignment with existing customer tooling.

**Decision:**
**Azure Monitor Workbooks as the primary experience**, with a Grafana dashboard template as a secondary option. Workbooks are embedded in the APIM blade in Azure Portal, providing a native experience. A pre-built Grafana dashboard JSON is published for customers who use Grafana as their observability platform.

**Rationale:**
- Custom portal blade rejected: 6+ months of development, requires portal team dependency, maintenance burden
- Azure Monitor Workbooks: 4-week development, native Portal integration, parameterized queries against ADX, customer-customizable
- 62% of design partner respondents already use Azure Monitor; 28% use Grafana; 10% use other tools
- Workbooks support drill-down, time range selection, and export — sufficient for all five dashboard views in the metrics spec
- Grafana template addresses the second-largest tooling cohort with minimal incremental effort (1 week)

**Consequences:**
- Workbook performance depends on ADX query speed — complex queries over large datasets may have 5–10 second load times
- Limited UX customization compared to a custom blade (no custom interactive elements beyond Workbook primitives)
- Customers using Datadog, Splunk, or other platforms need to query the ADX data source directly (no pre-built templates for v1)
- Workbooks are version-controlled as ARM templates, enabling infrastructure-as-code deployment
