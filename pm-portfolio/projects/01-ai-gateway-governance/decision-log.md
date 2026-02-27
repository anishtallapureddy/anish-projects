# Decision Log: AI Gateway Governance

Each decision is documented as a lightweight Architecture Decision Record (ADR).

---

## ADR-001: Built-in to Foundry, Not Standalone APIM Product

**Date:** 2024-12  
**Status:** Accepted  
**Deciders:** PM (Anish), Foundry Portal Lead, APIM PM Lead

### Context
We had two paths: (a) build AI governance as a standalone APIM feature that customers configure separately, or (b) integrate governance directly into the Foundry portal as a built-in experience.

### Decision
Integrate as a built-in Foundry experience with APIM as the underlying engine.

### Rationale
- Target customers are Foundry-first; they expect governance where they build AI
- Standalone requires context-switching between portals, reducing adoption
- Foundry portal integration enables a unified "Operate + Build" UX
- APIM capabilities power the gateway without requiring customers to learn APIM

### Consequences
- (+) Seamless UX for Foundry customers
- (+) Higher projected adoption due to zero-friction enablement
- (−) Dependency on Foundry portal release cycle
- (−) APIM power users may want deeper APIM-native configuration (address via "advanced settings" escape hatch)

---

## ADR-002: MCP as the Tool Protocol

**Date:** 2024-12  
**Status:** Accepted  
**Deciders:** PM (Anish), Tools Runtime Lead, Developer Experience Lead

### Context
Tools could be governed via REST/OpenAPI natively, via MCP protocol, or via a custom abstraction. The AI ecosystem is converging on MCP (Model Context Protocol) as the standard for tool interaction.

### Decision
Adopt MCP as the primary tool protocol, with an API-to-MCP conversion layer for existing REST APIs.

### Rationale
- MCP is becoming the standard protocol for AI agent ↔ tool communication
- Major AI platforms (Anthropic, Google, Microsoft) are adopting MCP
- MCP provides a consistent tool schema (name, description, inputSchema) ideal for catalogs
- API-to-MCP conversion ensures backward compatibility with existing APIs

### Consequences
- (+) Aligned with industry direction; future-proof
- (+) Rich tool metadata enables better catalog and playground experiences
- (−) MCP spec is still evolving; may require adaptation
- (−) Developers unfamiliar with MCP need onboarding — mitigated by playground and docs

---

## ADR-003: Namespace-Based Tool Organization

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), UX Lead, Security Lead

### Context
Need a way to organize hundreds of tools for discovery and access control. Options: flat list with tags, hierarchical namespaces, or RBAC-only grouping.

### Decision
Namespace-based organization (e.g., `hr/`, `finance/`, `engineering/`) as the primary organizing mechanism.

### Rationale
- Namespaces map to business domains — intuitive for both admins and developers
- Enable namespace-level policies (rate limits, auth, approval) reducing per-tool config burden
- Clear URL-like naming (`hr/lookup_employee`) is self-documenting
- Simpler to implement than full RBAC in initial phases

### Consequences
- (+) Intuitive tool discovery by business domain
- (+) Namespace-level policy reduces admin burden
- (−) Coarser access control than per-tool RBAC (planned for Phase 3)
- (−) Namespace proliferation risk — mitigated by guidance and suggested limits

---

## ADR-004: Approval Workflow for Tool Onboarding

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), Security Lead, Enterprise Customer Advisory Board

### Context
When developers or external sources submit tools for the catalog, should they be immediately available or go through an approval process?

### Decision
Configurable approval workflow: auto-approve for trusted sources, manual review for external/unknown tools.

### Rationale
- Enterprise customers require governance over what tools agents can access
- Ungoverned tool access is a top-3 security concern from customer advisory board
- Auto-approve for trusted sources (e.g., Microsoft-published, internal namespaces) balances security with velocity
- Approval queue with SLA tracking ensures submissions don't languish

### Consequences
- (+) Enterprise security teams get the control they need
- (+) Trusted sources experience zero friction
- (−) Approval bottleneck risk for organizations with slow review processes — mitigated by SLA tracking and escalation
- (−) Additional UX complexity for the approval queue management

---

## ADR-005: Round-Robin + Priority for Load Balancing (Not Weighted)

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), APIM Engineering Lead, Reliability Lead

### Context
For model high availability, we need a load balancing strategy across multiple deployments. Options: round-robin, weighted, priority-based, latency-based, or combinations.

### Decision
Support two modes: **Round-Robin** (equal distribution) and **Priority** (preferred primary + fallback). Weighted and latency-based deferred to post-GA.

### Rationale
- Round-robin covers the common case of distributing load across equivalent deployments
- Priority covers the critical case of failover (primary + backup)
- Weighted adds complexity (what weight? how to tune?) with marginal benefit in V1
- Latency-based requires real-time health metrics infrastructure not yet available
- Two simple modes are easier to explain, configure, and debug

### Consequences
- (+) Simple mental model for admins: "spread evenly" or "prefer this one, fail over to that one"
- (+) Covers 90%+ of customer scenarios in V1
- (−) Power users wanting weighted routing must wait for post-GA
- (−) Latency-optimized routing deferred — may matter for global deployments

---

## ADR-006: Virtual Keys Over Entra-Only Auth

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), Security Lead, Developer Experience Lead

### Context
How should developers authenticate to governed models and tools? Options: Entra ID (Azure AD) only, virtual API keys only, or both.

### Decision
Support **both** virtual keys and Entra ID authentication, with virtual keys as the primary developer experience.

### Rationale
- Virtual keys abstract backend credentials — developers never see provider API keys
- Virtual keys are simpler for quick prototyping and playground usage
- Entra ID is required for production workloads and enterprise compliance
- Many third-party model providers only support API key auth — virtual keys bridge this gap
- APIM natively supports subscription keys (virtual keys) with rich lifecycle management

### Consequences
- (+) Low barrier to entry for developers (copy virtual key, start building)
- (+) Enterprise-grade auth available via Entra ID for production
- (+) Backend credential rotation transparent to consumers
- (−) Virtual keys require secure storage and lifecycle management
- (−) Two auth paths increase testing and documentation surface

---

## ADR-007: Phased Rollout (Models → Tools → Agents)

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), Engineering Lead, Product Leadership

### Context
The full vision spans three pillars. We could launch all three simultaneously or phase the rollout.

### Decision
Phase incrementally: Models (Phase 1) → Tools/MCP (Phase 2) → Agents (Phase 3).

### Rationale
- **Models are the most mature** — APIM AI Gateway already has model governance capabilities; fastest path to customer value
- **Tools/MCP is the most novel** — MCP runtime needs validation; Phase 2 allows focused investment
- **Agents governance has most unknowns** — cross-cloud sync, guardrails, and multi-agent governance need the most design iteration
- Phasing allows us to incorporate Phase N feedback into Phase N+1
- Reduces risk: if Phase 1 reveals fundamental issues, we can course-correct before expanding

### Consequences
- (+) Faster time-to-value for model governance (most-requested capability)
- (+) Each phase builds on validated foundations
- (+) Resource allocation focused on one pillar at a time
- (−) Customers wanting tool or agent governance must wait
- (−) Integration testing across pillars deferred to later phases

---

## ADR-008: Prototype-First Approach to Stakeholder Alignment

**Date:** 2024-12  
**Status:** Accepted  
**Deciders:** PM (Anish)

### Context
The AI Gateway Governance vision spans multiple teams (APIM, Foundry Portal, AI Services, MCP Runtime). Aligning stakeholders on an abstract spec is difficult. Options: detailed spec document, prototype/mock, or design mockups (Figma).

### Decision
Build a working prototype (Node.js + Express + HTML dashboard) that demonstrates the full end-to-end experience before writing detailed specs.

### Rationale
- "Show, don't tell" — a clickable prototype communicates 10x more effectively than a spec doc
- Prototype surfaces UX questions and technical challenges early
- Stakeholders can provide concrete feedback on an experience, not an abstract concept
- Prototype serves as a demo artifact for design partner recruitment
- Node.js + Express + HTML chosen for speed of iteration (built in days, not weeks)

### Consequences
- (+) Rapid stakeholder alignment — 5 stakeholder groups aligned in 2 weeks
- (+) Design partner interest generated from prototype demos
- (+) Prototype code informs implementation architecture
- (+) Reusable as demo/training artifact
- (−) Prototype is throwaway — not production code
- (−) Risk of stakeholders confusing prototype fidelity with production readiness — mitigated by clear "prototype" labeling

### Artifacts
- **Repository:** [github.com/anishtallapureddy/anish-projects/ai/ai-gateway-foundry](https://github.com/anishtallapureddy/anish-projects/tree/main/ai/ai-gateway-foundry)
- **Tech stack:** Node.js, Express, vanilla HTML/CSS/JS dashboard
- **Covers:** Operate tab (Models, Tools, Agents), Build tab (Catalog, Toolbox, Playground), Monitor tab (Metrics, Logs)

---

## ADR-009: Semantic Caching at Gateway Layer (Not Client-Side)

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), APIM Engineering Lead, AI Services Lead

### Context
Semantic caching can be implemented at the client SDK level, the gateway level, or the model provider level. Where should it live?

### Decision
Implement semantic caching at the gateway layer (APIM policy).

### Rationale
- Gateway-level caching benefits all consumers without SDK changes
- Centralized cache improves hit rate (shared across consumers for same model)
- Admin controls cache behavior (TTL, similarity threshold, scope) without developer involvement
- APIM already has semantic cache policy — low implementation cost
- Client-side caching fragments cache and requires SDK updates

### Consequences
- (+) Zero developer effort to benefit from caching
- (+) Centralized cache management and observability
- (+) Cache hit rate visible in admin dashboard
- (−) Gateway cache may not capture client-specific context for similarity
- (−) Cache storage costs at gateway level (monitor and optimize)

---

## ADR-010: Event-Driven Telemetry Over Polling-Based Metrics

**Date:** 2025-01  
**Status:** Accepted  
**Deciders:** PM (Anish), Observability Lead, Foundry Portal Lead

### Context
Dashboard data can be powered by polling backend APIs for current state or by structured telemetry events that flow into Application Insights and are queried via KQL.

### Decision
Event-driven telemetry with Application Insights as the analytics backend.

### Rationale
- Event-driven approach provides richer data (every request, every policy evaluation)
- KQL enables flexible, ad-hoc analytics beyond pre-built dashboards
- Application Insights is the standard Azure observability platform
- Polling-based metrics are limited to current state — no historical trend analysis
- Event schema (see metrics.md) can evolve without backend API changes

### Consequences
- (+) Rich historical analytics and trend analysis
- (+) Flexible KQL queries for custom dashboards and alerts
- (+) Standard Azure tooling — familiar to Azure customers
- (−) Telemetry volume may be high — need sampling strategy for high-volume tenants
- (−) Dashboard latency depends on App Insights ingestion pipeline (~2–5 min)

---

## Decision Summary

| ADR | Decision | Key Driver |
|-----|----------|-----------|
| ADR-001 | Built-in to Foundry | UX seamlessness drives adoption |
| ADR-002 | MCP as tool protocol | Industry convergence on MCP |
| ADR-003 | Namespace-based tool organization | Intuitive domain-based discovery |
| ADR-004 | Approval workflow for tools | Enterprise security requirement |
| ADR-005 | Round-robin + priority LB | Simplicity covers 90%+ of cases |
| ADR-006 | Virtual keys + Entra ID | Developer speed + enterprise compliance |
| ADR-007 | Phased rollout | Risk reduction + incremental value |
| ADR-008 | Prototype-first alignment | Show don't tell; rapid stakeholder buy-in |
| ADR-009 | Gateway-level semantic caching | Centralized benefit, zero developer effort |
| ADR-010 | Event-driven telemetry | Rich analytics via standard Azure tooling |

---

*Related: [Risks & Tradeoffs](./risks-tradeoffs.md) · [Architecture](./architecture.md) · [PRD](./prd.md)*
