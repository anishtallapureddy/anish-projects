# User Stories: AI Gateway Governance

**Organized by pillar and persona. Prioritized using MoSCoW method.**

---

## Models — Platform Engineer (Admin)

### Must Have

**US-M-A1: Configure Model Quotas**  
As a platform engineer, I want to set rate limits (RPM, TPM) per model and per consumer so that no single team can exhaust shared model capacity.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can set RPM and TPM limits at the model level
- [ ] Admin can set per-subscription (consumer) rate limits
- [ ] Rate limit violations return HTTP 429 with retry-after header
- [ ] Current usage is visible in real-time on the model dashboard
- [ ] Changes take effect within 60 seconds without downtime
</details>

**US-M-A2: Manage Virtual Keys**  
As a platform engineer, I want to issue virtual API keys that map to backend model credentials so that developers never see or manage raw provider keys.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can generate, rotate, and revoke virtual keys per consumer
- [ ] Virtual keys are scoped to specific models or model groups
- [ ] Key rotation does not disrupt active sessions (grace period)
- [ ] Audit log captures all key lifecycle events
- [ ] Backend credentials are never exposed in API responses or logs
</details>

**US-M-A3: Configure High Availability**  
As a platform engineer, I want to set up primary/fallback model deployments with automatic failover so that applications remain available during outages.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can define a primary and one or more fallback model endpoints
- [ ] Failover triggers are configurable (error rate threshold, latency threshold, capacity)
- [ ] Failover happens automatically with no developer action required
- [ ] Failover events are logged and visible in the monitoring dashboard
- [ ] Admin can configure load balancing mode (round-robin or priority)
</details>

**US-M-A4: Apply Responsible AI Policies**  
As a platform engineer, I want to enable content safety filters and prompt injection detection per model so that our AI usage complies with organizational policies.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can enable/disable content safety categories per model
- [ ] Blocked requests return informative error messages (not raw failures)
- [ ] Policy violations are logged with request context for audit
- [ ] Policies can be applied globally or per-model
</details>

### Should Have

**US-M-A5: Register External Models**  
As a platform engineer, I want to register models hosted outside of the platform so that I can apply consistent governance regardless of where a model is deployed.

**US-M-A6: Enable Semantic Caching**  
As a platform engineer, I want to enable semantic caching for model responses so that repeated similar queries are served faster and at lower cost.

**US-M-A7: View Model Analytics**  
As a platform engineer, I want to view model usage dashboards (requests, tokens, latency, errors by consumer) so that I can identify usage patterns and optimize capacity.

### Nice to Have

**US-M-A8: Set Cost Alerts**  
As a platform engineer, I want to configure cost threshold alerts per model so that I'm notified before budgets are exceeded.

---

## Models — Developer

### Must Have

**US-M-D1: Discover Available Models**  
As a developer, I want to browse a catalog of governed models with capabilities, quotas, and SLAs so that I can choose the right model for my application.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Catalog displays all models the developer has access to
- [ ] Each model shows: name, provider, capabilities, rate limits, pricing tier
- [ ] Search and filter by capability, provider, and availability
- [ ] Model detail page includes usage examples and connection instructions
</details>

**US-M-D2: Get API Credentials**  
As a developer, I want to obtain virtual keys for approved models through self-service so that I can start building without waiting for admin provisioning.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Developer can request and receive a virtual key within the portal
- [ ] Key is scoped to the models the developer is authorized to use
- [ ] Connection string / code snippet is provided for common languages
- [ ] Key usage is tracked and visible to the developer
</details>

**US-M-D3: Test Models in Playground**  
As a developer, I want to send prompts to governed models in an interactive playground so that I can evaluate model behavior before integrating.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Playground supports text input and displays model response
- [ ] Token usage and latency are shown per request
- [ ] Requests go through the gateway (governance policies apply)
- [ ] Conversation history is maintained within a session
</details>

### Should Have

**US-M-D4: A/B Test Model Versions**  
As a developer, I want to split traffic between model versions so that I can compare quality and performance in production.

---

## Tools (MCP) — Platform Engineer (Admin)

### Must Have

**US-T-A1: Register MCP Endpoints**  
As a platform engineer, I want to register MCP server endpoints with metadata so that tools are discoverable and governed through the gateway.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can register an MCP endpoint with URL, auth method, and description
- [ ] Registration validates endpoint connectivity and schema
- [ ] Registered tools appear in the developer catalog within 5 minutes
- [ ] Admin can update or deregister endpoints
</details>

**US-T-A2: Organize Tools in Namespaces**  
As a platform engineer, I want to group tools into namespaces (e.g., `hr/`, `finance/`) so that access control and discovery are organized by business domain.

**US-T-A3: Configure Approval Workflows**  
As a platform engineer, I want to define approval workflows for tool onboarding so that external or sensitive tools are reviewed before being made available.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Admin can configure auto-approve rules for trusted sources
- [ ] External tool submissions require at least one approval
- [ ] Approvers receive notifications with tool details and security assessment
- [ ] Approval/rejection is logged with justification
- [ ] Pending tools are not visible in the developer catalog
</details>

**US-T-A4: Govern Tool Runtime**  
As a platform engineer, I want to set rate limits, timeouts, and circuit breakers for tool invocations so that misbehaving tools don't impact the platform.

### Should Have

**US-T-A5: Convert APIs to MCP**  
As a platform engineer, I want to import an OpenAPI specification and auto-generate MCP tool definitions so that existing APIs can be governed as tools.

**US-T-A6: Secure Tool Access**  
As a platform engineer, I want to configure authentication and IP restrictions per tool or namespace so that tool access is properly secured.

**US-T-A7: Observe Tool Invocations**  
As a platform engineer, I want to view tool invocation metrics and trace individual requests so that I can diagnose failures and optimize performance.

### Nice to Have

**US-T-A8: Bulk Import Tools**  
As a platform engineer, I want to bulk import tool definitions from a configuration file so that I can onboard many tools efficiently.

---

## Tools (MCP) — Developer

### Must Have

**US-T-D1: Discover Tools in Catalog**  
As a developer, I want to browse and search a governed tool catalog so that I can find tools relevant to my agent or application.

<details>
<summary>Acceptance Criteria</summary>

- [ ] Catalog displays approved tools with name, description, namespace, and schema
- [ ] Search by keyword, namespace, and capability
- [ ] Each tool shows input/output schema and usage examples
- [ ] Tools are filterable by "added to my toolbox" status
</details>

**US-T-D2: Build Toolboxes**  
As a developer, I want to curate a toolbox by selecting tools from the catalog so that my agents have a defined set of capabilities.

**US-T-D3: Test Tools in Playground**  
As a developer, I want to invoke tools with sample inputs in an interactive playground so that I can verify behavior before using them in agents.

### Should Have

**US-T-D4: Submit API for Tool Conversion**  
As a developer, I want to submit an API specification for conversion to an MCP tool so that my team's APIs are available in the governed catalog.

**US-T-D5: View Tool Documentation**  
As a developer, I want to access auto-generated documentation for each tool so that I understand schemas and expected behavior.

---

## Agents — Platform Engineer (Admin)

### Must Have

**US-A-A1: Register External Agents**  
As a platform engineer, I want to register agents built outside the platform so that all agents are governed through a single control plane.

**US-A-A2: Observe Agent Behavior**  
As a platform engineer, I want to view agent-level metrics (invocations, tool calls, errors) so that I can monitor agent health and behavior.

### Should Have

**US-A-A3: Apply Agent Guardrails**  
As a platform engineer, I want to configure guardrails (input/output filters, tool restrictions, escalation policies) per agent so that agents operate within defined boundaries.

**US-A-A4: Sync Agents from Other Clouds**  
As a platform engineer, I want to synchronize agent registrations from Vertex AI and Bedrock so that our multi-cloud agent estate is visible in one place.

### Nice to Have

**US-A-A5: Manage Agent Lifecycle**  
As a platform engineer, I want to version agents and promote them between environments so that agent deployments follow our release process.

---

## Agents — Developer

### Must Have

**US-A-D1: Discover Available Agents**  
As a developer, I want to browse registered agents with capabilities and integration instructions so that I can compose agents into my workflows.

### Should Have

**US-A-D2: Test Agent Interactions**  
As a developer, I want to chat with governed agents in a playground so that I can evaluate behavior before production integration.

**US-A-D3: Compose Multi-Agent Workflows**  
As a developer, I want to wire multiple agents together with routing logic so that I can build complex multi-agent systems.

---

## Priority Summary

| Priority | Count | Examples |
|----------|-------|---------|
| **Must Have** | 16 | Quotas, virtual keys, failover, MCP registration, approval workflows, catalogs, playgrounds |
| **Should Have** | 12 | External model registration, API-to-MCP conversion, agent guardrails, cloud sync |
| **Nice to Have** | 4 | Cost alerts, bulk import, agent lifecycle, multi-agent composition |

---

*Related: [PRD](./prd.md) · [Architecture](./architecture.md) · [Metrics](./metrics.md)*
