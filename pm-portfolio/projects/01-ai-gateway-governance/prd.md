# Product Requirements Document: AI Gateway Governance in Foundry

**Author:** Anish  
**Status:** Draft  
**Last Updated:** 2025-01  
**Stakeholders:** APIM, Foundry Portal, AI Services, MCP Runtime, Security & Compliance

---

## 1. Problem Statement

Enterprises are rapidly adopting AI across their organizations — deploying language models, integrating tools via APIs and MCP servers, and building autonomous agents. However, the governance landscape is deeply fragmented:

| Challenge | Impact |
|-----------|--------|
| Models deployed across multiple providers with separate controls | Inconsistent quotas, auth, and content safety enforcement |
| Tools/APIs proliferate without centralized discovery or approval | Shadow AI tooling, security blind spots, compliance risk |
| Agents built across frameworks and clouds with no unified governance | No consistent guardrails, observability, or audit trail |
| Platform engineers lack a single control plane | Manual processes, duplicated effort, governance gaps |
| Developers navigate fragmented tooling per resource type | Slow onboarding, poor discoverability, wasted productivity |

**The core need:** A unified governance layer — embedded in the platform developers already use — that covers Models, Tools, and Agents with consistent policies, observability, and developer experience.

## 2. Target Users

### Platform Engineer / AI Platform Admin (Operate)

- Responsible for governance, security, and reliability of the organization's AI estate
- Needs to register, configure, and enforce policies across models, tools, and agents
- Operates through the **Operate tab** in Foundry portal
- Key concerns: compliance, cost control, availability, auditability

### Developer / Agent Builder (Build)

- Builds AI-powered applications, agents, and workflows
- Needs to discover, test, and integrate governed models, tools, and agents
- Operates through the **Build tab** in Foundry portal
- Key concerns: speed of integration, discoverability, playground testing, clear documentation

---

## 3. Scenarios by Pillar

### 3.1 Models Governance

#### Admin Scenarios (Operate)

| ID | Scenario | Description |
|----|----------|-------------|
| M-A1 | **Configure Quotas & Throttling** | Set per-model and per-consumer rate limits (RPM, TPM). Configure burst allowances and throttling behavior. |
| M-A2 | **Manage Virtual Keys** | Issue, rotate, and revoke virtual API keys for model access. Map virtual keys to backend credentials without exposing them to consumers. |
| M-A3 | **Configure RAI (Responsible AI) Policies** | Enable content safety filters, PII detection, and prompt injection guards per model or globally. |
| M-A4 | **Set Up High Availability & Failover** | Configure primary/fallback model deployments. Define failover triggers (latency, error rate, capacity). Set up round-robin or priority-based load balancing. |
| M-A5 | **Register Non-Foundry Models** | Onboard models hosted outside Foundry (e.g., self-hosted, third-party endpoints). Define endpoint, auth, and governance policies. |
| M-A6 | **Observe Model Usage** | View dashboards for model consumption (requests, tokens, latency, errors). Drill into per-consumer and per-model analytics. |
| M-A7 | **Configure Semantic Caching** | Enable response caching based on semantic similarity to reduce cost and latency for repeated queries. |

#### Developer Scenarios (Build)

| ID | Scenario | Description |
|----|----------|-------------|
| M-D1 | **Discover Available Models** | Browse a catalog of governed models with metadata (capabilities, quotas, pricing, SLAs). |
| M-D2 | **Get API Credentials** | Obtain virtual keys or connection strings for approved models through self-service. |
| M-D3 | **Test in Playground** | Send prompts to governed models in an interactive playground with real-time response and token usage. |
| M-D4 | **A/B Test Models** | Route a percentage of traffic to different model versions to compare quality and performance. |

### 3.2 Tools (MCP) Governance

#### Admin Scenarios (Operate)

| ID | Scenario | Description |
|----|----------|-------------|
| T-A1 | **Register MCP Endpoints** | Onboard MCP server endpoints with metadata (description, capabilities, auth requirements). |
| T-A2 | **Convert APIs to MCP** | Import OpenAPI/REST specifications and auto-generate MCP-compatible tool definitions. |
| T-A3 | **Organize with Namespaces** | Group tools into namespaces (e.g., `hr/`, `finance/`, `engineering/`) for organizational clarity and access control. |
| T-A4 | **Configure Approval Workflows** | Define approval chains for tool onboarding (auto-approve trusted sources, require review for external tools). |
| T-A5 | **Secure Tool Access** | Apply authentication (API key, OAuth, managed identity), IP restrictions, and CORS policies per tool or namespace. |
| T-A6 | **Govern Tool Runtime** | Set rate limits, timeout policies, payload size limits, and circuit breakers for tool invocations. |
| T-A7 | **Observe & Diagnose Tools** | View tool invocation metrics (success rate, latency, error breakdown). Trace individual requests through the gateway. |

#### Developer Scenarios (Build)

| ID | Scenario | Description |
|----|----------|-------------|
| T-D1 | **Discover Tools in Catalog** | Browse and search a governed tool catalog with descriptions, schemas, and usage examples. |
| T-D2 | **Build Toolboxes** | Curate a personal or team toolbox by selecting tools from the catalog for use in agents. |
| T-D3 | **Test Tools in Playground** | Invoke individual tools with sample inputs and inspect outputs in an interactive environment. |
| T-D4 | **Connect APIs as Tools** | Submit an API for conversion to MCP and inclusion in the governed catalog (triggers approval workflow). |
| T-D5 | **View Tool Documentation** | Access auto-generated and curated documentation for each tool, including schemas and examples. |

### 3.3 Agents Governance

#### Admin Scenarios (Operate)

| ID | Scenario | Description |
|----|----------|-------------|
| A-A1 | **Register Non-Foundry Agents** | Onboard agents built outside Foundry (custom frameworks, LangChain, AutoGen, etc.) with endpoint and metadata. |
| A-A2 | **Sync from Other Clouds** | Synchronize agent registrations from Google Vertex AI, Amazon Bedrock, or other cloud platforms. |
| A-A3 | **Observe Agent Behavior** | View agent-level metrics (invocations, tool calls, model usage, error rates, conversation turns). |
| A-A4 | **Apply Guardrails** | Configure input/output guardrails, tool access restrictions, and escalation policies per agent. |
| A-A5 | **Manage Agent Lifecycle** | Version agents, promote between environments (dev/staging/prod), and manage deprecation. |

#### Developer Scenarios (Build)

| ID | Scenario | Description |
|----|----------|-------------|
| A-D1 | **Discover Available Agents** | Browse registered agents with capabilities, SLAs, and integration instructions. |
| A-D2 | **Test Agent Interactions** | Chat with governed agents in a playground to evaluate behavior before integration. |
| A-D3 | **Compose Multi-Agent Workflows** | Wire multiple agents together with routing logic and observe end-to-end behavior. |

---

## 4. UX Design

### Foundry Portal Integration

The gateway governance experience is embedded directly in Foundry portal through two primary surfaces:

#### Operate Tab (Platform Engineers)

```
Operate
├── Models
│   ├── Registered Models (list, register, configure)
│   ├── Policies (quotas, RAI, caching)
│   ├── High Availability (failover, load balancing)
│   └── Analytics (usage dashboards)
├── Tools
│   ├── MCP Endpoints (register, convert, manage)
│   ├── Namespaces (organize, access control)
│   ├── Approval Queue (review, approve/reject)
│   └── Analytics (invocation dashboards)
├── Agents
│   ├── Registered Agents (list, register, sync)
│   ├── Guardrails (configure per-agent policies)
│   └── Analytics (behavior dashboards)
└── Gateway Settings
    ├── Global Policies
    ├── Virtual Keys
    └── Audit Log
```

#### Build Tab (Developers)

```
Build
├── Model Catalog
│   ├── Browse & Search
│   ├── Model Playground
│   └── Get Credentials
├── Tool Catalog
│   ├── Browse & Search
│   ├── Tool Playground
│   ├── My Toolbox
│   └── Submit API
├── Agent Catalog
│   ├── Browse & Search
│   ├── Agent Playground
│   └── Compose Workflows
└── Documentation
    ├── Getting Started
    ├── API Reference
    └── Best Practices
```

## 5. Technical Approach

### APIM as the Gateway Layer

Azure API Management provides the runtime foundation:

| Capability | APIM Feature |
|------------|-------------|
| Rate limiting & quotas | Subscription-level and API-level rate limiting policies |
| Semantic caching | AI Gateway semantic cache policy |
| Content safety | Azure AI Content Safety integration |
| Load balancing | Backend pool with round-robin/priority routing |
| Failover | Circuit breaker + automatic fallback routing |
| Virtual keys | Subscription keys mapped to backend credentials |
| Traffic splitting | Weighted backend routing for A/B testing |
| MCP routing | Custom policy + MCP server backend configuration |
| Observability | Application Insights + custom metrics emission |

### Integration with Foundry

- **Control Plane:** Foundry portal calls APIM management APIs to configure gateway resources
- **Data Plane:** All model/tool/agent requests route through APIM gateway for policy enforcement
- **Identity:** Entra ID for admin auth; virtual keys + Entra for developer auth
- **Telemetry:** APIM emits structured telemetry to Application Insights; Foundry portal queries for dashboards

## 6. Success Metrics

| Category | Metric | Target |
|----------|--------|--------|
| Adoption | % of Foundry projects with gateway enabled | >40% within 6 months of GA |
| Governance | % of AI requests routed through gateway | >80% for enabled projects |
| Developer Experience | Time from project creation to first governed API call | <10 minutes |
| Reliability | Gateway P99 latency overhead | <50ms |
| Business | APIM consumption revenue from AI Gateway | Track and report quarterly |

See [metrics.md](./metrics.md) for the full metrics framework.

## 7. Non-Goals

- **Replacing APIM:** This is not a new gateway product — it leverages existing APIM infrastructure.
- **Model Training/Fine-Tuning:** Gateway governance covers inference and invocation, not training pipelines.
- **Agent Orchestration:** The gateway governs agent access, not agent internal logic or orchestration.
- **Real-Time Model Evaluation:** Quality evaluation (evals) is a separate Foundry capability; the gateway provides observability data that feeds into eval workflows.
- **Custom Policy Authoring in V1:** Initial release uses pre-built policy templates; custom policy XML authoring is deferred.

## 8. Constraints

- **APIM Dependency:** Feature availability is gated by APIM team's roadmap for AI Gateway capabilities.
- **MCP Specification:** MCP is an evolving standard; tool governance must be resilient to spec changes.
- **Cross-Cloud Sync:** Agent sync from Vertex/Bedrock depends on those platforms' API stability and access.
- **Portal Performance:** Governance UX must not degrade Foundry portal load times (target: <200ms additional latency for page loads).
- **Backward Compatibility:** Existing Foundry projects without gateway must continue to function without changes.

## 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should virtual keys be project-scoped or workspace-scoped? | PM | Under discussion |
| 2 | What is the SLA for cross-cloud agent sync freshness? | Engineering | Researching |
| 3 | How do we handle MCP spec breaking changes post-GA? | PM + Eng | To be discussed |
| 4 | Should tool approval workflows integrate with existing IT ticketing systems? | PM | Proposed for Phase 2 |
| 5 | What is the pricing model for gateway consumption? | Business | Under review |

---

*Related documents: [User Stories](./user-stories.md) · [Architecture](./architecture.md) · [Metrics](./metrics.md) · [Rollout Plan](./rollout-plan.md)*
