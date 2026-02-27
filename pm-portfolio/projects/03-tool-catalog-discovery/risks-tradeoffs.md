# Risks & Tradeoffs: Tool Catalog & Discovery

**Owner:** Anish · **Last Updated:** 2025-01-15

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | **Empty catalog at launch.** If fewer than 20 tools are registered at GA, builders won't adopt and the product dies on the vine. | High | High | Seed catalog with Azure-native tools (Cosmos DB, Blob Storage, Graph API). Build bulk-import from Azure API Center. Partner with 3 design-partner orgs to pre-register 50+ tools before GA. |
| R2 | **Platform teams don't register tools.** Registration adds overhead; if the value proposition isn't immediate, teams skip it. | Medium | High | Auto-detect tools from API Center subscriptions and offer one-click registration. Show platform teams a dashboard of "unregistered tools being called by agents" to create FOMO. |
| R3 | **Search quality is poor at launch.** Semantic search depends on high-quality tool descriptions. If metadata is sparse, search returns irrelevant results and builders lose trust. | Medium | High | Enforce minimum metadata at registration (description ≥50 chars, ≥3 tags, input schema). Augment sparse descriptions using GPT-4o to generate summaries from API specs. Monitor zero-result rate weekly. |
| R4 | **Approval workflows become bottlenecks.** If approvers are slow or unresponsive, the catalog becomes a gate that builders route around. | Medium | Medium | Set default SLAs (4 hours standard, 24 hours confidential). Auto-escalate to backup approver after SLA breach. Provide approver dashboards with pending-request counts. Allow auto-approval for low-sensitivity tools. |
| R5 | **MCP protocol changes break discovery endpoint.** MCP is pre-1.0; breaking changes could invalidate our discovery schema and client integrations. | Low | High | Abstract MCP wire format behind an internal adapter layer. Pin to a specific MCP spec version and maintain a compatibility matrix. Participate in MCP spec working group to influence stability. |
| R6 | **Security teams block rollout.** If the audit log doesn't meet SOC 2 evidence requirements, security may prohibit catalog use for regulated workloads. | Low | High | Co-design audit log schema with security design partners from day one. Map every log field to SOC 2 CC6.1 (logical access) and CC7.2 (system monitoring) criteria. Get pre-approval from 2 security teams before GA. |

---

## Key Tradeoffs

### Tradeoff 1: Curated Catalog vs. Open Registry

**Tension:** A curated catalog (only platform-team-approved tools) ensures quality but limits coverage. An open registry (anyone can publish) maximizes coverage but risks low-quality or abandoned tools cluttering search results.

| Option | Pros | Cons |
|--------|------|------|
| **A: Curated only** | High trust signal; clean search results; clear ownership | Slow to grow; bottleneck on platform teams; gaps in coverage |
| **B: Open registry** | Fast growth; low barrier to publish; captures long-tail tools | Quality varies wildly; search noise; governance burden shifts to consumers |
| **C: Open + quality tiers** | Balances growth with trust; platform teams curate "verified" tier; anyone can publish to "community" tier | More complex UX; requires clear tier labeling; risk of confusion |

**Decision:** Option C — Open registry with quality tiers.

**Rationale:** Research showed that builders value both breadth (Insight 2: they grep codebases to find tools) and curation (Insight 6: curated collections are more trusted). A tiered model lets us bootstrap quickly with community contributions while giving platform teams a curation mechanism. The "verified" badge creates an incentive for tool owners to invest in metadata quality. We'll default search ranking to boost verified tools.

---

### Tradeoff 2: MCP-First vs. Protocol-Agnostic

**Tension:** Building the catalog as MCP-native (tool descriptors, discovery endpoint, connection flow all use MCP) simplifies the experience for MCP users but potentially alienates teams using REST-only or GraphQL tools.

| Option | Pros | Cons |
|--------|------|------|
| **A: MCP-first** | Aligned with market momentum; simpler mental model; deeper integration with MCP runtimes | Excludes non-MCP tools; bets heavily on MCP adoption trajectory |
| **B: Protocol-agnostic** | Maximum flexibility; no bets on protocol winners | Lowest-common-denominator UX; MCP-specific features deferred; more complex schema |
| **C: MCP-first, protocol-extensible** | MCP is the golden path; REST/GraphQL supported via adapter descriptors; extensible schema allows future protocols | Slightly more schema complexity; adapter maintenance cost |

**Decision:** Option C — MCP-first, protocol-extensible.

**Rationale:** MCP adoption is inflecting in the enterprise (Insight 10: builders expect MCP-native discovery). Going MCP-first lets us ship a deeply integrated experience for the fastest-growing segment. But our research also showed that 40% of tools are REST-only APIs that won't adopt MCP soon — we can't ignore them. The adapter descriptor pattern (a thin MCP wrapper that describes a REST API's capabilities) lets us index REST tools without requiring tool owners to adopt MCP.

---

### Tradeoff 3: Centralized Catalog vs. Federated Discovery

**Tension:** A single centralized catalog is simpler to build and govern but requires all tool metadata to be synced to one location. Federated discovery lets each team maintain their own registry and queries them at search time.

| Option | Pros | Cons |
|--------|------|------|
| **A: Centralized** | Single source of truth; consistent governance; simpler search infrastructure | Sync overhead; single point of failure; org resistance to centralizing metadata |
| **B: Federated** | Teams keep autonomy; no sync needed; scales naturally with org structure | Complex query routing; inconsistent metadata quality; harder to enforce governance |
| **C: Centralized index, federated source** | Tools are registered from federated sources (API Center, GitHub, manual) but indexed centrally; source of truth stays with the team | Best of both: teams own their tools, catalog owns the index; requires robust sync |

**Decision:** Option C — Centralized index, federated source.

**Rationale:** Enterprise customers (especially those with ≥5,000 employees) have strong team autonomy norms — asking a team to "move" their API metadata to a central system is a nonstarter. But federated query-time discovery (Option B) makes governance nearly impossible and search quality unpredictable. The centralized-index pattern is proven (it's how Google indexes the web, and how Azure Resource Graph indexes ARM resources). We sync metadata from federated sources (API Center environments, GitHub MCP server configs, manual registration) into a central Azure AI Search index. Teams retain ownership of their tools; the catalog owns discoverability.

---

*Part of [Anish's PM Portfolio](../../README.md)*
