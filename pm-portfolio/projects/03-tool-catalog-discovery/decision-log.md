# Decision Log: Tool Catalog & Discovery

Architectural Decision Records (ADRs) for key product and technical decisions.

---

## ADR-001: Catalog Architecture — Centralized Index, Federated Source

**Date:** 2024-11-20 · **Status:** Accepted

**Context:**
Enterprise organizations store tool metadata across multiple systems — Azure API Center, GitHub repositories, internal wikis, Confluence pages, and custom registries. We need to decide whether to centralize all metadata, federate discovery queries, or build a hybrid approach.

**Decision:**
Build a centralized search index (Azure AI Search) that syncs metadata from federated sources. Tool owners retain authority over their metadata in its source system. The catalog service runs periodic sync jobs (configurable: 5 min to 24 hrs) to pull updates into the index.

**Consequences:**
- **Positive:** Consistent search quality regardless of source system; governance policies applied uniformly; proven pattern (Azure Resource Graph uses the same approach).
- **Positive:** Low adoption barrier — teams don't have to move metadata, just grant read access to their source.
- **Negative:** Sync lag means the index can be briefly stale; need conflict resolution for metadata edited in both source and catalog.
- **Negative:** Must build and maintain connectors for each source system (API Center, GitHub, manual).

---

## ADR-002: Search Ranking — Weighted Multi-Signal

**Date:** 2024-12-02 · **Status:** Accepted

**Context:**
Tool search must return relevant results for natural-language queries ("create a support ticket") and structured queries ("MCP servers in the HR domain"). A single ranking signal (e.g., text match) is insufficient — we need to balance relevance, quality, trust, and popularity.

**Decision:**
Implement a weighted ranking model with four signals:
1. Semantic relevance (0.40) — cosine similarity via text-embedding-ada-002
2. Quality signal (0.25) — composite of uptime, latency, error rate, freshness
3. Organizational trust (0.20) — verification tier, sensitivity label, owner reputation
4. Usage popularity (0.15) — active agent bindings, recency-weighted

Weights are configurable per-tenant and will be tuned based on click-through rate and search success rate telemetry.

**Consequences:**
- **Positive:** Balances "what's relevant" with "what's reliable" — directly addresses Insight 4 (builders can't assess reliability).
- **Positive:** Configurable weights let platform teams adjust for their org's priorities (e.g., a security-conscious org can upweight trust signal).
- **Negative:** More complex to implement and explain than simple text search. Requires health-metrics pipeline to be operational before quality signal works.
- **Negative:** Cold-start problem for new tools with no usage or health data — mitigated by boosting verified-tier tools.

---

## ADR-003: Approval Model — Tiered by Sensitivity Label

**Date:** 2024-12-10 · **Status:** Accepted

**Context:**
Security teams want governance over agent-tool bindings, but builders want self-service speed. A one-size-fits-all approach (all tools require approval, or no tools require approval) doesn't work. Research (Insight 8) showed security teams prefer guardrails over gates.

**Decision:**
Implement a three-tier approval model mapped to Microsoft Purview sensitivity labels:
- **Auto-approved:** Tools labeled Public or Internal with no PII/financial data access. Agent builders get instant access.
- **Request-required:** Tools labeled Confidential. Requires owner approval with a 4-hour SLA. Auto-escalates to backup approver after SLA breach.
- **Restricted:** Tools labeled Highly Confidential. Requires owner + security-team approval with a 24-hour SLA. Includes justification field and periodic access review (90 days).

Tool owners can override the default tier to be more restrictive (but not less restrictive) than the sensitivity label implies.

**Consequences:**
- **Positive:** 70-80% of tools will be auto-approved (based on typical enterprise sensitivity distribution), preserving self-service speed.
- **Positive:** Security teams get explicit control over high-risk tools without being a bottleneck for low-risk ones.
- **Negative:** Requires Purview sensitivity labels to be assigned to tools — adds a registration step for tool owners.
- **Negative:** SLA enforcement requires an escalation mechanism and approver-availability tracking.

---

## ADR-004: Tool Schema Standard — Extended MCP Tool Descriptor

**Date:** 2024-12-18 · **Status:** Accepted

**Context:**
The catalog needs a standardized way to describe tools regardless of their underlying protocol. MCP defines a tool descriptor format, but it lacks fields for governance (sensitivity, SLA, owner), quality (health metrics), and enterprise metadata (authentication, versioning).

**Decision:**
Adopt the MCP tool descriptor as the base schema and extend it with enterprise fields:
- **Governance block:** `sensitivity`, `approvalTier`, `accessPolicy`, `auditRequirements`
- **Quality block:** `sla` (tier, uptimeSla, p99LatencyMs), `healthStatus`, `lastHealthCheck`
- **Ownership block:** `owner` (team, contact, escalation), `supportChannel`, `documentation`
- **Integration block:** `auth` (method, scopes, credentialProvider), `rateLimits`, `protocol`, `version`

Non-MCP tools (REST, GraphQL) are described using the same schema with a `protocol` field indicating the underlying protocol and an `adapterDescriptor` for protocol-specific connection details.

**Consequences:**
- **Positive:** Single schema for all tools — simplifies search indexing, display, and governance policy evaluation.
- **Positive:** MCP-native tools map naturally; non-MCP tools get the same rich metadata.
- **Negative:** Schema is opinionated — may not capture every edge case for legacy SOAP or gRPC tools. Addressed by an `extensions` field for arbitrary key-value metadata.
- **Negative:** Schema versioning adds complexity — mitigated by semantic versioning and a deprecation policy (N-1 supported).

---

## ADR-005: MCP-First Discovery Strategy

**Date:** 2025-01-08 · **Status:** Accepted

**Context:**
The catalog needs a programmatic discovery interface. We must decide whether to build REST-only, MCP-only, or dual endpoints. MCP adoption is growing rapidly in the enterprise agent ecosystem, but REST is the universal baseline.

**Decision:**
Ship both REST and MCP discovery endpoints, but invest disproportionately in the MCP experience:
- **MCP endpoint** (`tools/search`, `tools/get`, `tools/request`): First-class, deeply integrated with MCP runtimes. Supports streaming results, server-sent events for approval status, and native tool-descriptor responses.
- **REST endpoint** (`/api/v1/tools/search`, `/api/v1/tools/{id}`): Full-featured but positioned as the integration API for non-MCP clients (portals, CLI tools, CI/CD pipelines).
- **Portal UI** built on the REST API for browser-based discovery and administration.

Marketing and documentation lead with MCP. REST is documented but not promoted as the primary path.

**Consequences:**
- **Positive:** Aligns with market direction — MCP is becoming the standard for agent-tool interaction. Being MCP-native is a competitive differentiator vs. generic API catalogs.
- **Positive:** REST endpoint ensures we don't exclude non-MCP use cases (portal, CI/CD, Backstage integration).
- **Negative:** Maintaining two API surfaces increases engineering cost. Mitigated by sharing a common service layer — endpoints are thin adapters over the same business logic.
- **Negative:** Betting on MCP carries protocol-evolution risk (see Risk R5). Mitigated by the adapter pattern and spec-pinning strategy.

---

*Part of [Anish's PM Portfolio](../../README.md)*
