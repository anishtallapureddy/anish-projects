# Technical Architecture: AI Gateway Governance

---

## 1. System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Foundry Portal                               │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐   │
│  │     Operate Tab      │    │          Build Tab               │   │
│  │  (Platform Engineers) │    │   (Developers / Agent Builders)  │   │
│  └──────────┬───────────┘    └──────────────┬───────────────────┘   │
└─────────────┼───────────────────────────────┼───────────────────────┘
              │ Management API                │ Data Plane API
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AI Gateway (Azure APIM)                          │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │   Rate     │ │  Semantic  │ │  Content  │ │  Load Balancing  │  │
│  │  Limiting  │ │  Caching   │ │  Safety   │ │  & Failover      │  │
│  └────────────┘ └────────────┘ └───────────┘ └──────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │  Virtual   │ │  Traffic   │ │    MCP    │ │   Observability  │  │
│  │   Keys     │ │  Splitting │ │  Runtime  │ │   & Telemetry    │  │
│  └────────────┘ └────────────┘ └───────────┘ └──────────────────┘  │
└──────────┬──────────────────┬──────────────────────┬────────────────┘
           │                  │                      │
           ▼                  ▼                      ▼
    ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐
    │    Models     │  │    Tools     │  │       Agents          │
    │              │  │   (MCP)      │  │                       │
    │ • Azure OAI  │  │ • MCP Servers│  │ • Foundry Agents      │
    │ • Third-party│  │ • REST APIs  │  │ • Custom Agents       │
    │ • Self-hosted│  │ • Functions  │  │ • Vertex AI Agents    │
    │ • Open-source│  │ • Connectors │  │ • Bedrock Agents      │
    └──────────────┘  └──────────────┘  └───────────────────────┘
```

## 2. Gateway Capabilities

### Core Capabilities Matrix

| Capability | Models | Tools (MCP) | Agents | Implementation |
|------------|--------|-------------|--------|----------------|
| **Rate Limiting** | RPM/TPM per model & consumer | RPS per tool & namespace | RPS per agent | APIM rate-limit policy |
| **Semantic Caching** | Cache similar prompts | Cache tool responses (optional) | — | APIM semantic-cache policy |
| **Content Safety** | Input/output filtering | Input validation | Input/output guardrails | Azure AI Content Safety |
| **Load Balancing** | Multi-deployment routing | Multi-instance tool routing | Multi-endpoint agent routing | APIM backend pool |
| **Failover** | Auto-switch on error/timeout | Circuit breaker per tool | Fallback agent routing | APIM circuit-breaker policy |
| **Virtual Keys** | Map to provider credentials | Map to tool auth tokens | Map to agent auth | APIM subscription keys |
| **Traffic Splitting** | A/B test model versions | Canary tool deployments | Agent version routing | APIM weighted backends |
| **MCP Runtime** | — | Protocol translation & routing | Agent-to-tool routing | Custom APIM policy + MCP proxy |
| **Observability** | Tokens, latency, errors | Invocations, success rate | Conversations, tool calls | Application Insights |

### Detailed Capability Descriptions

#### Rate Limiting & Quotas
- **Scope levels:** Global → Pillar → Resource → Consumer
- **Metrics:** Requests per minute (RPM), tokens per minute (TPM), requests per second (RPS)
- **Behavior on limit:** HTTP 429 with `Retry-After` header and remaining quota in response headers
- **Burst:** Configurable burst allowance above sustained rate

#### Semantic Caching
- **Similarity threshold:** Configurable (default 0.85 cosine similarity)
- **Cache TTL:** Per-model configuration (default 1 hour)
- **Cache scope:** Per-project or global (admin configurable)
- **Cache invalidation:** Manual purge, TTL expiry, or model version change

#### Load Balancing & Failover
- **Algorithms:** Round-robin (equal distribution) and Priority (preferred + fallback)
- **Health probes:** Periodic health checks against backend endpoints
- **Circuit breaker:** Opens after N consecutive failures, half-open retry after configurable interval
- **Failover trigger:** Error rate > threshold OR P99 latency > threshold OR capacity exhausted

#### Virtual Keys
- **Lifecycle:** Generate → Distribute → Rotate → Revoke
- **Mapping:** One virtual key → one or more backend credentials
- **Scoping:** Per model, per namespace, or per resource group
- **Audit:** All key operations logged with actor, timestamp, and action

---

## 3. Data Flow Diagrams

### 3.1 Model Request Flow

```
Developer App                Foundry Portal              AI Gateway (APIM)           Model Backend
     │                            │                            │                         │
     │  1. Send prompt            │                            │                         │
     │  (virtual key + payload)   │                            │                         │
     │ ──────────────────────────────────────────────────────> │                         │
     │                            │                            │                         │
     │                            │     2. Validate virtual key│                         │
     │                            │     3. Check rate limit    │                         │
     │                            │     4. Check semantic cache│                         │
     │                            │        ┌─── Cache HIT ───>│ Return cached response  │
     │                            │        │                   │                         │
     │                            │        └─── Cache MISS     │                         │
     │                            │     5. Apply content safety│                         │
     │                            │        (input filtering)   │                         │
     │                            │     6. Route to backend    │                         │
     │                            │        (load balance /     │                         │
     │                            │         failover)          │                         │
     │                            │                            │  7. Forward request     │
     │                            │                            │ ──────────────────────> │
     │                            │                            │                         │
     │                            │                            │  8. Model response      │
     │                            │                            │ <────────────────────── │
     │                            │     9. Apply content safety│                         │
     │                            │        (output filtering)  │                         │
     │                            │    10. Update cache        │                         │
     │                            │    11. Emit telemetry      │                         │
     │                            │                            │                         │
     │  12. Return response       │                            │                         │
     │ <────────────────────────────────────────────────────── │                         │
```

### 3.2 Tool (MCP) Invocation Flow

```
Agent / App               AI Gateway (APIM)           MCP Runtime              Tool Backend
     │                          │                         │                         │
     │  1. MCP tool_call        │                         │                         │
     │  (tool_name, params,     │                         │                         │
     │   virtual_key)           │                         │                         │
     │ ───────────────────────> │                         │                         │
     │                          │                         │                         │
     │     2. Validate key      │                         │                         │
     │     3. Resolve namespace │                         │                         │
     │        & tool endpoint   │                         │                         │
     │     4. Check rate limit  │                         │                         │
     │     5. Validate input    │                         │                         │
     │        schema            │                         │                         │
     │                          │  6. Route to MCP server │                         │
     │                          │ ──────────────────────> │                         │
     │                          │                         │  7. Execute tool        │
     │                          │                         │ ───────────────────────>│
     │                          │                         │                         │
     │                          │                         │  8. Tool response       │
     │                          │                         │ <─────────────────────  │
     │                          │  9. Tool result         │                         │
     │                          │ <────────────────────── │                         │
     │                          │                         │                         │
     │    10. Validate output   │                         │                         │
     │    11. Emit telemetry    │                         │                         │
     │                          │                         │                         │
     │  12. Return tool_result  │                         │                         │
     │ <─────────────────────── │                         │                         │
```

### 3.3 Agent Routing Flow

```
Client / Orchestrator      AI Gateway (APIM)           Agent Registry          Agent Endpoint
     │                          │                         │                         │
     │  1. Agent invoke         │                         │                         │
     │  (agent_id, input,       │                         │                         │
     │   session_id)            │                         │                         │
     │ ───────────────────────> │                         │                         │
     │                          │                         │                         │
     │     2. Validate auth     │                         │                         │
     │     3. Resolve agent     │                         │                         │
     │        endpoint          │ ──────────────────────> │                         │
     │                          │  4. Return endpoint +   │                         │
     │                          │     config              │                         │
     │                          │ <────────────────────── │                         │
     │     5. Apply guardrails  │                         │                         │
     │        (input filtering) │                         │                         │
     │     6. Check rate limit  │                         │                         │
     │                          │                         │                         │
     │                          │  7. Forward to agent    │                         │
     │                          │ ──────────────────────────────────────────────── >│
     │                          │                         │                         │
     │                          │  8. Agent response      │                         │
     │                          │  (may include tool_calls│passing through gateway) │
     │                          │ <──────────────────────────────────────────────── │
     │                          │                         │                         │
     │     9. Apply guardrails  │                         │                         │
     │        (output filtering)│                         │                         │
     │    10. Emit telemetry    │                         │                         │
     │                          │                         │                         │
     │  11. Return response     │                         │                         │
     │ <─────────────────────── │                         │                         │
```

---

## 4. Integration Points

### 4.1 Foundry Portal ↔ AI Gateway

| Integration | Direction | Protocol | Purpose |
|-------------|-----------|----------|---------|
| Resource Configuration | Portal → APIM | APIM Management REST API | Create/update gateway policies, backends, subscriptions |
| Telemetry Query | APIM → App Insights → Portal | Kusto (KQL) | Dashboard data for usage, health, and analytics |
| Catalog Sync | APIM → Portal | Event-driven (webhook/polling) | Keep portal catalog in sync with registered resources |
| Auth Flow | Portal → Entra ID → APIM | OAuth 2.0 / OIDC | Authenticate admin and developer access |

### 4.2 AI Gateway ↔ Model Providers

| Provider | Connection Method | Auth | Notes |
|----------|-------------------|------|-------|
| Azure OpenAI | REST API | Entra ID / API Key | Native integration; supports all AOAI features |
| OpenAI | REST API | API Key | Compatible endpoint; virtual key mapping |
| Self-hosted (Ollama, vLLM) | REST API | API Key / None | Admin registers endpoint manually |
| Hugging Face Inference | REST API | Bearer Token | Model Hub endpoints |
| Third-party (Anthropic, Cohere) | REST API | API Key | Endpoint + auth configured at registration |

### 4.3 AI Gateway ↔ Tool Backends

| Tool Type | Connection | Protocol | Gateway Role |
|-----------|------------|----------|-------------|
| MCP Server (remote) | HTTPS | MCP (JSON-RPC over SSE/HTTP) | Route, govern, observe |
| REST API (converted) | HTTPS | REST → MCP translation | Protocol translation + governance |
| Azure Function | HTTPS | HTTP trigger | Route as MCP tool |
| Azure Logic App | HTTPS | HTTP trigger | Route as MCP tool |

### 4.4 Cross-Cloud Agent Sync

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Vertex AI   │     │   AI Gateway     │     │    Foundry       │
│  Agent Hub   │────>│  Sync Service    │────>│  Agent Registry  │
└──────────────┘     │                  │     └──────────────────┘
                     │  • Poll APIs     │
┌──────────────┐     │  • Map metadata  │
│   Amazon     │────>│  • Register in   │
│   Bedrock    │     │    gateway       │
└──────────────┘     └──────────────────┘
```

- **Sync frequency:** Configurable (default: every 15 minutes)
- **Metadata mapping:** Cloud-specific agent metadata → Foundry agent schema
- **Conflict resolution:** Last-write-wins with manual override capability

---

## 5. Non-Foundry Model Registration Flow

```
Admin                    Foundry Portal            AI Gateway (APIM)         External Model
  │                           │                          │                        │
  │  1. Click "Register       │                          │                        │
  │     External Model"       │                          │                        │
  │ ────────────────────────> │                          │                        │
  │                           │                          │                        │
  │  2. Enter endpoint URL,   │                          │                        │
  │     auth method, metadata │                          │                        │
  │ ────────────────────────> │                          │                        │
  │                           │  3. Validate endpoint    │                        │
  │                           │ ────────────────────────────────────────────────> │
  │                           │                          │  4. Health check OK    │
  │                           │ <──────────────────────────────────────────────── │
  │                           │                          │                        │
  │                           │  5. Create APIM backend  │                        │
  │                           │ ───────────────────────> │                        │
  │                           │  6. Create APIM API +    │                        │
  │                           │     policies             │                        │
  │                           │ ───────────────────────> │                        │
  │                           │                          │                        │
  │  7. Model registered      │                          │                        │
  │     (appears in catalog)  │                          │                        │
  │ <──────────────────────── │                          │                        │
```

---

## 6. MCP Server Hosting & Routing Architecture

### MCP Request Routing

```
┌──────────────────────────────────────────────────────────┐
│                    AI Gateway (APIM)                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │              MCP Routing Policy                   │    │
│  │                                                   │    │
│  │  1. Parse MCP request (method, tool_name)        │    │
│  │  2. Resolve namespace: tool_name → namespace     │    │
│  │  3. Lookup backend: namespace → MCP server URL   │    │
│  │  4. Apply namespace policies (rate limit, auth)  │    │
│  │  5. Forward to resolved MCP server               │    │
│  └──────────────────────────────────────────────────┘    │
│                          │                               │
│            ┌─────────────┼─────────────┐                 │
│            ▼             ▼             ▼                  │
│   ┌──────────────┐ ┌──────────┐ ┌──────────────┐        │
│   │ hr/ namespace│ │ finance/ │ │ engineering/ │        │
│   │              │ │namespace │ │  namespace   │        │
│   └──────┬───────┘ └────┬─────┘ └──────┬───────┘        │
└──────────┼──────────────┼──────────────┼─────────────────┘
           ▼              ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │  HR MCP      │ │ Finance  │ │ Eng MCP      │
    │  Server      │ │ MCP      │ │ Server       │
    │              │ │ Server   │ │              │
    │ • lookup_emp │ │ • budget │ │ • create_pr  │
    │ • org_chart  │ │ • invoice│ │ • run_ci     │
    │ • benefits   │ │ • expense│ │ • deploy     │
    └──────────────┘ └──────────┘ └──────────────┘
```

### API-to-MCP Conversion

```
OpenAPI Spec             Conversion Engine            MCP Tool Definition
┌──────────────┐        ┌──────────────────┐        ┌──────────────────┐
│ paths:       │        │                  │        │ tools:           │
│  /users:     │ ─────> │  1. Parse paths  │ ─────> │  - name: getUser │
│    get:      │        │  2. Map params   │        │    description:  │
│      params: │        │  3. Generate     │        │    inputSchema:  │
│        - id  │        │     schemas      │        │      type: object│
│      resp:   │        │  4. Create tool  │        │      properties: │
│        200:  │        │     definitions  │        │        id:       │
│          ... │        │                  │        │          type:   │
└──────────────┘        └──────────────────┘        └──────────────────┘
```

---

## 7. Telemetry & Observability Architecture

```
AI Gateway (APIM)
     │
     │  Structured telemetry events
     │  (request, response, policy, error)
     ▼
┌──────────────────┐
│  Application     │
│  Insights        │
│                  │
│  • Custom events │───────> ┌──────────────────┐
│  • Dependencies  │         │  Foundry Portal  │
│  • Requests      │         │  Dashboards      │
│  • Exceptions    │         │                  │
└──────────────────┘         │  • Model usage   │
                             │  • Tool health   │
                             │  • Agent behavior│
                             │  • Request logs  │
                             └──────────────────┘
```

### Key Telemetry Events

| Event | Fields | Purpose |
|-------|--------|---------|
| `gateway.model.request` | model_id, consumer_id, tokens_in, tokens_out, latency_ms, status, cache_hit | Model usage analytics |
| `gateway.model.failover` | model_id, from_backend, to_backend, trigger_reason | Failover monitoring |
| `gateway.tool.invocation` | tool_name, namespace, consumer_id, latency_ms, status | Tool usage analytics |
| `gateway.tool.circuit_open` | tool_name, namespace, failure_count, recovery_time | Tool reliability |
| `gateway.agent.invoke` | agent_id, consumer_id, tool_calls_count, turns, latency_ms | Agent behavior |
| `gateway.policy.violation` | policy_type, resource_id, consumer_id, violation_detail | Governance enforcement |

---

*Related: [PRD](./prd.md) · [Metrics](./metrics.md) · [Decision Log](./decision-log.md)*
