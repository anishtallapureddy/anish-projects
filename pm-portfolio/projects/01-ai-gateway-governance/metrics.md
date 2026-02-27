# Success Metrics: AI Gateway Governance

---

## 1. Metrics Framework

### 1.1 Adoption Metrics

| Metric | Definition | Target (6 mo post-GA) | Measurement |
|--------|------------|----------------------|-------------|
| **Gateway Activation Rate** | % of AI Gateway projects with AI Gateway enabled | >40% | AI Gateway telemetry |
| **Models Registered** | Total models registered through gateway (platform + external) | >500 across all tenants | APIM backend count |
| **Tools Registered** | Total MCP tools registered and governed | >200 across all tenants | Gateway tool registry |
| **Agents Registered** | Total agents registered (platform + external + cross-cloud) | >100 across all tenants | Agent registry |
| **Active Consumers** | Unique developer subscriptions making ≥1 request/week | >2,000 | APIM subscription analytics |
| **Monthly Governed Requests** | Total requests routed through gateway per month | >10M | APIM request metrics |
| **Non-Platform Registration Rate** | % of registered resources that are external (external models, agents) | >15% | Registry metadata |

### 1.2 Governance Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **Policy Coverage** | % of AI requests passing through ≥1 gateway policy | >90% for enabled projects | Policy execution telemetry |
| **Blocked Request Rate** | % of requests blocked by governance policies (rate limit, content safety) | 2–8% (healthy range) | APIM policy logs |
| **Content Safety Block Rate** | % of requests blocked specifically by RAI/content safety | <5% (indicates good developer behavior) | Content Safety telemetry |
| **Rate Limit Hit Rate** | % of requests receiving HTTP 429 | <3% (indicates proper quota sizing) | APIM rate-limit logs |
| **Approval Queue SLA** | % of tool onboarding requests reviewed within 24 hours | >95% | Approval workflow telemetry |
| **Virtual Key Coverage** | % of developer access using virtual keys (vs. raw credentials) | >80% | APIM auth telemetry |
| **Namespace Adoption** | % of tools organized into namespaces | >70% | Tool registry metadata |

### 1.3 Developer Experience Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **Time to First API Call** | Minutes from project creation to first governed API call | <10 min | End-to-end telemetry |
| **Tool Discovery → Usage** | % of developers who browse catalog and then invoke a tool within 7 days | >30% | Funnel analysis |
| **Playground Usage** | Monthly active playground users (model + tool + agent) | >500 | Dashboard telemetry |
| **Toolbox Creation Rate** | % of developers who create ≥1 toolbox | >25% | Dashboard telemetry |
| **Catalog Search Success** | % of catalog searches resulting in a resource click within session | >60% | Dashboard analytics |
| **Developer NPS** | Net Promoter Score from developer surveys | >40 | Quarterly survey |
| **Documentation Engagement** | % of developers visiting docs within first session | >50% | Dashboard analytics |

### 1.4 Reliability Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **Gateway Uptime** | % of time gateway is available and processing requests | >99.95% | APIM health monitoring |
| **P50 Latency Overhead** | Median additional latency introduced by gateway | <15ms | APIM request telemetry |
| **P99 Latency Overhead** | 99th percentile additional latency introduced by gateway | <50ms | APIM request telemetry |
| **Failover Success Rate** | % of failover events that successfully route to fallback | >99% | Failover telemetry |
| **Failover Detection Time** | Time from backend failure to failover trigger | <5 seconds | Circuit breaker telemetry |
| **Cache Hit Rate** | % of model requests served from semantic cache | 10–30% (depends on workload) | Cache telemetry |
| **MCP Tool Availability** | % of registered MCP tools passing health checks | >98% | Health probe telemetry |

### 1.5 Business Metrics

| Metric | Definition | Target | Measurement |
|--------|------------|--------|-------------|
| **APIM Consumption Revenue** | Incremental APIM consumption revenue from AI Gateway usage | Track quarterly (no target in Y1) | Azure billing |
| **Customer Retention Impact** | Retention rate for AI Gateway customers with gateway vs. without | +5% higher retention | Cohort analysis |
| **Design Partner Satisfaction** | CSAT from private preview design partners | >4.2/5.0 | Partner surveys |
| **Enterprise Deal Influence** | # of enterprise deals where AI Gateway is a stated factor | Track quarterly | Sales CRM |
| **Cost Savings (Caching)** | Estimated token cost savings from semantic caching | Report per-customer | Cache + pricing data |

---

## 2. OKRs — Launch Quarter (Phase 1: Private Preview)

### Objective 1: Validate product-market fit with design partners

| Key Result | Target | Status |
|------------|--------|--------|
| KR1: Onboard 5 design partners with Models governance enabled | 5/5 partners active | 🔲 Not started |
| KR2: Each partner registers ≥3 models through gateway | 15+ models total | 🔲 Not started |
| KR3: Design partner CSAT ≥4.0/5.0 | ≥4.0 | 🔲 Not started |
| KR4: Zero P0/P1 reliability incidents during preview | 0 incidents | 🔲 Not started |

### Objective 2: Prove governance value through measurable policy enforcement

| Key Result | Target | Status |
|------------|--------|--------|
| KR1: >80% of partner requests routed through ≥1 policy | >80% | 🔲 Not started |
| KR2: Partners configure ≥2 governance policies per model (avg) | ≥2 avg | 🔲 Not started |
| KR3: Failover successfully tested by ≥3 partners | 3+ partners | 🔲 Not started |
| KR4: Virtual key adoption >60% across partners | >60% | 🔲 Not started |

### Objective 3: Deliver developer experience that accelerates AI adoption

| Key Result | Target | Status |
|------------|--------|--------|
| KR1: Time to first governed API call <15 min for new developers | <15 min P75 | 🔲 Not started |
| KR2: Playground used by >50% of developers in partner orgs | >50% | 🔲 Not started |
| KR3: Developer NPS >30 (early signal) | >30 | 🔲 Not started |

---

## 3. Telemetry Event Schema

### Core Events

#### `aigateway.request`
Primary event emitted for every request through the gateway.

```json
{
  "eventName": "aigateway.request",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "pillar": "model | tool | agent",
    "resource_id": "gpt-4o-deployment-1",
    "resource_name": "GPT-4o",
    "consumer_id": "sub-abc123",
    "project_id": "proj-xyz",
    "workspace_id": "ws-456",
    "request_id": "req-789",
    "status_code": 200,
    "latency_ms": 1250,
    "gateway_latency_ms": 12,
    "cache_hit": false,
    "policies_applied": ["rate-limit", "content-safety", "semantic-cache"],
    "policies_blocked": [],
    "backend_id": "backend-aoai-eastus",
    "failover_occurred": false
  },
  "measurements": {
    "tokens_in": 150,
    "tokens_out": 500,
    "total_tokens": 650
  }
}
```

#### `aigateway.policy.evaluation`
Emitted for each policy evaluation (pass or block).

```json
{
  "eventName": "aigateway.policy.evaluation",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "request_id": "req-789",
    "policy_type": "rate-limit | content-safety | input-validation | guardrail",
    "policy_id": "policy-rl-001",
    "resource_id": "gpt-4o-deployment-1",
    "consumer_id": "sub-abc123",
    "result": "pass | block",
    "block_reason": null,
    "evaluation_latency_ms": 3
  }
}
```

#### `aigateway.failover`
Emitted when a failover event occurs.

```json
{
  "eventName": "aigateway.failover",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "resource_id": "gpt-4o-deployment-1",
    "from_backend": "backend-aoai-eastus",
    "to_backend": "backend-aoai-westus",
    "trigger": "error_rate | latency | capacity",
    "trigger_threshold": "error_rate > 0.1",
    "trigger_value": 0.15,
    "detection_time_ms": 2500,
    "consumer_id": "sub-abc123",
    "request_id": "req-789"
  }
}
```

#### `aigateway.tool.invocation`
Emitted for MCP tool invocations.

```json
{
  "eventName": "aigateway.tool.invocation",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "tool_name": "hr/lookup_employee",
    "namespace": "hr",
    "mcp_server_id": "mcp-hr-prod",
    "consumer_id": "sub-abc123",
    "agent_id": "agent-hr-assistant",
    "request_id": "req-789",
    "status": "success | error | timeout",
    "latency_ms": 340,
    "input_size_bytes": 256,
    "output_size_bytes": 1024
  }
}
```

#### `aigateway.agent.session`
Emitted per agent conversation turn.

```json
{
  "eventName": "aigateway.agent.session",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "agent_id": "agent-hr-assistant",
    "session_id": "session-abc",
    "consumer_id": "sub-abc123",
    "turn_number": 3,
    "tool_calls_in_turn": 2,
    "model_calls_in_turn": 1,
    "total_latency_ms": 2100,
    "status": "success | error | guardrail_blocked"
  }
}
```

#### `aigateway.registration`
Emitted when a resource is registered or updated.

```json
{
  "eventName": "aigateway.registration",
  "timestamp": "2025-01-15T10:30:00Z",
  "properties": {
    "pillar": "model | tool | agent",
    "resource_id": "ext-model-claude-3",
    "action": "register | update | deregister",
    "source": "platform | external | cross_cloud_sync",
    "cloud_source": "vertex_ai | bedrock | null",
    "admin_id": "admin-user-1",
    "namespace": "engineering"
  }
}
```

---

## 4. Dashboard Views

### Admin Dashboard (Operate)

| Panel | Metrics Shown | Refresh |
|-------|--------------|---------|
| **Overview** | Total requests (24h), active models/tools/agents, blocked %, error rate | Real-time |
| **Models** | Requests by model, token usage, latency P50/P99, cache hit rate, failover events | 1 min |
| **Tools** | Invocations by tool/namespace, success rate, latency, circuit breaker status | 1 min |
| **Agents** | Sessions by agent, tool call distribution, guardrail blocks, conversation depth | 5 min |
| **Governance** | Policy evaluations, block rate by policy type, approval queue depth | 5 min |
| **Health** | Backend health status, gateway uptime, latency overhead trend | Real-time |

### Developer Dashboard (Build)

| Panel | Metrics Shown | Refresh |
|-------|--------------|---------|
| **My Usage** | Requests by resource, token consumption, remaining quota | Real-time |
| **Request Log** | Recent requests with status, latency, and policy results | Real-time |
| **Playground History** | Past playground sessions with inputs/outputs | On-demand |

---

*Related: [PRD](./prd.md) · [Architecture](./architecture.md) · [Rollout Plan](./rollout-plan.md)*
