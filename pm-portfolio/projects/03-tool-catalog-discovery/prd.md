# PRD: Governed MCP Tool Catalog & Discovery

**Author:** Anish · **Last Updated:** 2025-01-15 · **Status:** In Review

---

## 1. Problem Statement

Enterprise organizations adopting agentic AI face a critical infrastructure gap: **there is no governed mechanism for AI agents to discover, evaluate, and safely connect to organizational tools.**

Today's reality:

- **Agent builders hard-code tool bindings.** Developers manually configure MCP server URIs, API endpoints, and authentication details. When a tool moves or rotates credentials, agents break silently.
- **Teams duplicate connector work.** Three separate teams in a large financial-services customer each built their own Jira connector for their agents because no one knew the others existed.
- **Security has no visibility.** Compliance teams cannot answer "which agents can invoke our PII-handling APIs?" There is no audit trail, no approval workflow, and no way to revoke tool access at the catalog level.
- **Tool quality is invisible.** Agent builders cannot distinguish between a well-maintained, SLA-backed production API and an experimental internal tool with no error handling.

The cost compounds as organizations scale from 2-3 pilot agents to 50+ production agents across business units.

### Why Now

- MCP adoption is inflecting — enterprises are standardizing on Model Context Protocol for tool integration.
- Azure AI Gateway already mediates agent-to-model traffic; extending to agent-to-tool traffic is a natural adjacency.
- Azure API Center provides existing API metadata infrastructure that can be extended for tool-catalog semantics.

---

## 2. Target Users

### Primary: Agent Builders

Software engineers and AI engineers who build, configure, and maintain AI agents. They need to find the right tool, understand its capabilities, and integrate it quickly.

- **Size:** ~500K developers building with Azure AI services (growing 3x YoY)
- **Key pain:** Spends 30-40% of agent-development time on tool discovery and integration plumbing

### Secondary: Platform Engineers

Infrastructure and DevOps engineers who manage the organizational tool landscape — registering APIs, configuring MCP servers, managing access policies.

- **Size:** ~50K platform teams on Azure
- **Key pain:** No single pane of glass for tool inventory; cannot enforce standards across teams

### Tertiary: Security & Compliance

Security architects and compliance officers responsible for governing what agents can access.

- **Size:** Embedded in every enterprise customer ≥500 employees
- **Key pain:** Cannot audit or restrict agent-to-tool bindings; violates SOC 2 and internal policies

---

## 3. Goals

| # | Goal | Measure |
|---|------|---------|
| G1 | Reduce time for agent builders to find and connect to an enterprise tool | Time-to-First-Tool-Connection < 10 min (from current ~4 hrs) |
| G2 | Eliminate duplicate connector work across teams | ≥80% of new agent-tool bindings use catalog-registered tools |
| G3 | Give security teams auditable control over agent-tool access | 100% of tool connections routed through governed catalog |
| G4 | Provide quality signals so builders can evaluate tools before binding | Tool detail pages with health, SLA, usage, and owner metadata |

### Non-Goals

- **Building connectors.** The catalog indexes and governs tools — it does not build or host MCP servers, API adapters, or data connectors.
- **Runtime traffic mediation.** Azure AI Gateway handles request routing and policy enforcement at runtime. The catalog is a discovery and governance layer, not a proxy.
- **Public marketplace.** V1 is scoped to organizational (tenant-scoped) tools. A cross-tenant marketplace is a future consideration, not a V1 deliverable.
- **Agent orchestration.** The catalog does not decide which tools an agent should use for a given task. Tool selection logic stays in the agent framework (Semantic Kernel, AutoGen, LangChain).
- **Replacing Azure API Center.** The catalog extends API Center with tool-specific metadata (MCP descriptors, agent-compatibility scores, governance policies). It does not fork or replace it.

---

## 4. User Scenarios

### S1: Discovering a Tool by Capability

> **As an** agent builder, **I want to** search for tools by what they do (e.g., "create a support ticket") rather than by API name, **so that** I can find the right tool even when I don't know which internal system provides that capability.

### S2: Evaluating Tool Quality Before Binding

> **As an** agent builder, **I want to** see a tool's health status, response latency (p50/p99), error rate, SLA tier, and last-updated date on a detail page, **so that** I can make an informed decision before binding my production agent to it.

### S3: Requesting Access to a Restricted Tool

> **As an** agent builder, **I want to** request access to a tool that requires approval (e.g., a PII-handling HR API), **so that** I can get my agent authorized without filing a separate ServiceNow ticket and waiting for manual provisioning.

### S4: Registering and Publishing a Tool

> **As a** platform engineer, **I want to** register an MCP server or API in the catalog with rich metadata (description, input/output schemas, authentication method, owning team), **so that** other teams can discover and reuse it instead of building their own.

### S5: Auditing Agent-Tool Bindings

> **As a** security engineer, **I want to** see which agents are bound to which tools, when access was granted, and by whom, **so that** I can audit compliance and revoke access if a tool is decommissioned or a policy changes.

### S6: Curating a Tool Collection for a Domain

> **As a** platform engineer, **I want to** create a curated collection of tools for a business domain (e.g., "Customer Support Tools") with recommended defaults, **so that** agent builders in that domain have a vetted starting point.

---

## 5. Proposed Solution

### 5.1 Searchable Tool Catalog

A governed registry of enterprise tools — APIs, MCP servers, Azure Functions, data connectors — with rich metadata and semantic search.

**Core capabilities:**

- **Semantic search.** Natural-language queries matched against tool descriptions, capability tags, and input/output schemas using Azure AI Search with vector embeddings.
- **Faceted browse.** Filter by protocol (MCP, REST, GraphQL), domain, owning team, SLA tier, authentication method, approval status.
- **Tool detail page.** Description, schemas, health metrics, usage statistics, owner contact, version history, access requirements.
- **Collections.** Curated groups of tools for a domain or use case, maintained by platform teams.

### 5.2 Governance Layer

- **Approval workflows.** Tool owners define access policies (open, team-restricted, approval-required). Requests route to the designated approver with context about the requesting agent and use case.
- **Binding audit log.** Every agent-tool connection is logged with timestamp, identity, approval chain, and policy version. Queryable via Azure Monitor and exportable for SOC 2 evidence.
- **Policy enforcement.** Tools can be tagged with sensitivity labels (Public, Internal, Confidential, Highly Confidential) that map to Azure Purview sensitivity labels. Agents must meet the minimum classification to bind.

### 5.3 MCP-Native Discovery Endpoint

In addition to a REST API, the catalog exposes an MCP-native discovery endpoint so agents using MCP can query the catalog using the same protocol they use to invoke tools.

```
tools/search  — semantic search across registered tools
tools/get     — retrieve full tool metadata by ID
tools/request — initiate an access request for a restricted tool
```

---

## 6. Technical Approach

### 6.1 Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Agent / IDE  │────▶│  AI Gateway      │────▶│  Tool Catalog    │
│  (consumer)   │     │  (routing +      │     │  Service          │
│               │     │   policy)        │     │  ┌────────────┐  │
└──────────────┘     └──────────────────┘     │  │ API Center  │  │
                                               │  │ (metadata)  │  │
                                               │  ├────────────┤  │
                                               │  │ AI Search   │  │
                                               │  │ (semantic)  │  │
                                               │  ├────────────┤  │
                                               │  │ Entra ID    │  │
                                               │  │ (authz)     │  │
                                               │  └────────────┘  │
                                               └──────────────────┘
```

### 6.2 Key Integration Points

| Component | Role |
|-----------|------|
| **Azure API Center** | Source of truth for API/tool metadata, schemas, versions |
| **Azure AI Search** | Vector index for semantic tool discovery (text-embedding-ada-002) |
| **Microsoft Entra ID** | Authentication and RBAC for catalog access and approval workflows |
| **Azure Monitor** | Telemetry ingestion for tool health metrics and binding audit logs |
| **Azure API Management** | Policy enforcement at runtime (rate limits, auth, logging) |

### 6.3 Search Ranking

Tool search results are ranked by a weighted score:

1. **Semantic relevance** (0.40) — Cosine similarity between query embedding and tool description + schema embedding.
2. **Quality signal** (0.25) — Composite of uptime, p99 latency, error rate, and freshness.
3. **Organizational trust** (0.20) — Approval status, sensitivity label, owning-team reputation score.
4. **Usage popularity** (0.15) — Number of active agent bindings, weighted by recency.

### 6.4 Tool Schema Standard

Each registered tool exposes a standardized descriptor:

```json
{
  "id": "tool://contoso.com/support/create-ticket",
  "name": "Create Support Ticket",
  "description": "Creates a new support ticket in ServiceNow with priority, assignee, and description fields.",
  "protocol": "mcp",
  "version": "2.1.0",
  "inputSchema": { ... },
  "outputSchema": { ... },
  "auth": { "method": "managed-identity", "scopes": ["Tickets.Write"] },
  "owner": { "team": "IT Platform", "contact": "it-platform@contoso.com" },
  "sla": { "tier": "gold", "uptimeSla": 99.9, "p99LatencyMs": 450 },
  "sensitivity": "Internal",
  "tags": ["itsm", "support", "ticketing"]
}
```

---

## 7. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| Q1 | Should the catalog auto-ingest tools from API Center, or require explicit registration? | PM + Platform Eng | Exploring — leaning toward opt-in with bulk import |
| Q2 | How do we handle tool versioning when an MCP server updates its schema? | Engineering | Open — need to align with API Center versioning model |
| Q3 | What is the right approval SLA for restricted tools? | Security | Proposed: 4-hour SLA for standard, 24-hour for Highly Confidential |
| Q4 | Should collections support nesting (collections of collections)? | Design | Deferred to V2 — keep flat for V1 |
| Q5 | How do we bootstrap the catalog for day-one value? | PM + GTM | Exploring — considering pre-registering Azure-native tools (Cosmos DB, Blob Storage, Graph API) |

---

*Part of [Anish's PM Portfolio](../../README.md)*
