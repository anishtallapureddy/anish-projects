# Risks & Tradeoffs: AI Gateway Governance

---

## Part 1: Risk Register

| # | Risk | Category | Likelihood | Impact | Mitigation | Status |
|---|------|----------|-----------|--------|------------|--------|
| R1 | **APIM roadmap dependency** — Key AI Gateway capabilities (semantic caching, MCP routing) depend on APIM team's delivery timeline | Technical | High | High | Embed PM in APIM planning; identify workarounds for delayed features; maintain shared roadmap with APIM | 🟡 Monitoring |
| R2 | **MCP specification instability** — MCP is evolving rapidly; breaking changes could require rework of tool governance | Technical | Medium | High | Abstract MCP protocol behind an adapter layer; version-pin during preview; participate in MCP spec working group | 🟡 Monitoring |
| R3 | **Latency overhead exceeds target** — Gateway adds >50ms P99 latency, degrading developer experience and model response times | Performance | Medium | High | Establish performance benchmarks early; optimize hot paths; implement bypass for latency-sensitive workloads; load test at each phase gate | 🟢 Mitigated (Phase 0 baseline <15ms) |
| R4 | **Design partner churn** — Partners drop out of private preview due to competing priorities or insufficient value | Business | Medium | Medium | Over-recruit (7 for 5 slots); assign dedicated partner success contact; bi-weekly check-ins; rapid feedback loops | 🟢 Mitigating |
| R5 | **Cross-cloud API instability** — Vertex AI and Bedrock APIs change, breaking agent sync | Technical | Medium | Medium | Adapter pattern with per-cloud versioning; sync service with graceful degradation; monitor cloud provider changelogs | 🔲 Not started (Phase 3) |
| R6 | **Security vulnerability in virtual key mapping** — Virtual key → backend credential mapping is compromised, exposing provider API keys | Security | Low | Critical | Keys encrypted at rest and in transit; credential store uses Azure Key Vault; penetration testing before each phase; no credentials in logs/responses | 🟡 Monitoring |
| R7 | **Portal performance degradation** — Gateway governance UX adds latency to Foundry portal page loads | UX | Medium | Medium | Lazy-load gateway components; set performance budget (<200ms additional); monitor portal RUM metrics; optimize API payloads | 🟢 Mitigating |
| R8 | **Pricing model rejection** — Customers resist APIM consumption-based pricing for AI Gateway | Business | Medium | High | Offer free tier during preview; gather willingness-to-pay data from partners; explore bundled pricing with Foundry; benchmark against competitor pricing | 🔲 Not started |
| R9 | **Namespace proliferation** — Organizations create too many namespaces, making tool discovery harder | UX | Low | Medium | Provide namespace best practices guidance; suggest namespace limits; implement namespace search and hierarchy | 🔲 Not started |
| R10 | **Approval workflow bottleneck** — Tool onboarding approval queues grow, frustrating developers and slowing adoption | Process | Medium | Medium | Auto-approve for trusted sources; SLA tracking for approvers; escalation policies; dashboard showing queue depth and aging | 🔲 Not started |
| R11 | **Backward compatibility break** — Existing Foundry projects break when gateway is enabled | Technical | Low | Critical | Gateway is opt-in for existing projects; extensive integration testing; phased rollout with feature flags; instant rollback capability | 🟢 Mitigated (opt-in design) |
| R12 | **Competing internal projects** — Other Microsoft teams build overlapping governance capabilities, fragmenting the experience | Organizational | Medium | Medium | Proactive stakeholder alignment; shared roadmap reviews; clear scope delineation document; executive sponsorship | 🟡 Monitoring |
| R13 | **Insufficient telemetry coverage** — Key scenarios lack instrumentation, making it hard to measure success or diagnose issues | Observability | Medium | Medium | Define telemetry schema upfront (see metrics.md); mandate telemetry in DoD for every feature; telemetry review in each sprint | 🟢 Mitigating |

### Risk Heat Map

```
            Low Likelihood    Medium Likelihood    High Likelihood
           ┌─────────────────┬────────────────────┬─────────────────┐
Critical   │ R6, R11         │                    │                 │
           ├─────────────────┼────────────────────┼─────────────────┤
High       │                 │ R2, R3, R8         │ R1              │
           ├─────────────────┼────────────────────┼─────────────────┤
Medium     │ R9              │ R4, R5, R7, R10,   │                 │
           │                 │ R12, R13           │                 │
           ├─────────────────┼────────────────────┼─────────────────┤
Low        │                 │                    │                 │
           └─────────────────┴────────────────────┴─────────────────┘
```

---

## Part 2: Key Tradeoffs

### Tradeoff 1: Built-in vs. Standalone Gateway

**Decision:** Built-in (integrated into Foundry portal)

| Dimension | Built-in (Chosen) | Standalone APIM Product |
|-----------|--------------------|------------------------|
| **User experience** | Seamless — admins and devs use one portal | Requires context-switching between Foundry and APIM portal |
| **Adoption** | Higher — zero friction to enable for Foundry users | Lower — requires separate provisioning and configuration |
| **Development cost** | Higher — deep portal integration work | Lower — leverage existing APIM portal |
| **Flexibility** | Lower — tied to Foundry's UX and release cycle | Higher — independent release and customization |
| **Time to market** | Longer — portal integration adds scope | Shorter — reuse existing APIM UX |
| **Target user** | Foundry-first customers | APIM-first customers who also use AI |

**Rationale:** The target user is a Foundry customer who wants governance embedded in their AI platform experience. Asking them to manage a separate APIM instance fragments the experience and reduces adoption. The built-in approach sacrifices flexibility for a dramatically better user experience.

**Risk accepted:** Dependency on Foundry portal release cycle and UX constraints.

---

### Tradeoff 2: MCP-Native vs. API-First

**Decision:** MCP-native (with API compatibility layer)

| Dimension | MCP-Native (Chosen) | API-First |
|-----------|---------------------|-----------|
| **Agent compatibility** | Native — agents speak MCP natively | Requires translation layer in every agent |
| **Tool ecosystem** | Aligned with emerging MCP ecosystem | Requires custom integration per API style |
| **Specification risk** | Higher — MCP is still evolving | Lower — REST/OpenAPI is stable and mature |
| **Existing API support** | Requires API-to-MCP conversion | Native support for existing APIs |
| **Developer familiarity** | Lower — MCP is newer | Higher — REST is universally known |
| **Future-proofing** | Strong — MCP is the direction for AI tool interop | Weaker — may need MCP support later anyway |

**Rationale:** The AI tool ecosystem is converging on MCP as the standard protocol for tool interaction. Building MCP-native positions the product for the future. The API-to-MCP conversion feature mitigates the risk of leaving existing REST APIs behind.

**Risk accepted:** MCP specification changes may require rework; mitigated by adapter layer abstraction.

---

### Tradeoff 3: Per-Project vs. Global Policies

**Decision:** Both — hierarchical policies with inheritance

| Dimension | Per-Project Only | Global Only | Hierarchical (Chosen) |
|-----------|-----------------|-------------|----------------------|
| **Flexibility** | Maximum per-team control | None — one-size-fits-all | Balanced — global defaults with per-project overrides |
| **Consistency** | Risk of inconsistent governance | Perfect consistency | Consistent baseline with flexibility |
| **Admin burden** | High — configure per project | Low — configure once | Medium — configure defaults + exceptions |
| **Complexity** | Low (simple model) | Low (simple model) | Higher — need conflict resolution rules |
| **Enterprise fit** | Poor for compliance teams | Good for compliance teams | Best — compliance baseline + team autonomy |

**Rationale:** Enterprises need organizational-level governance baselines (e.g., "all models must have content safety enabled") while allowing teams to customize within those bounds. Pure per-project policies create compliance gaps; pure global policies frustrate teams with legitimate exceptions.

**Policy resolution:** More restrictive policy wins. Project policies can tighten global policies but never loosen them.

**Risk accepted:** Increased complexity in policy evaluation; must clearly communicate inheritance behavior to admins.

---

### Tradeoff 4: Namespace-Based vs. RBAC-Based Tool Access Control

**Decision:** Namespace-based (with RBAC integration planned)

| Dimension | Namespace-Based (Chosen) | RBAC-Based |
|-----------|-------------------------|-----------|
| **Mental model** | Intuitive — tools organized by business domain | Familiar — roles and permissions | 
| **Setup complexity** | Low — create namespace, assign tools | Medium — define roles, assign permissions per tool |
| **Granularity** | Namespace-level (coarse) | Per-tool (fine-grained) |
| **Scalability** | Good for <100 namespaces | Better for large tool estates |
| **Entra ID integration** | Separate from Entra (initially) | Native Entra ID role assignments |
| **Admin experience** | Visual namespace management | Familiar Azure RBAC UX |

**Rationale:** For the initial release, namespaces provide an intuitive, low-friction way to organize and control tool access. Developers think about tools in business domain terms ("I need HR tools"), not permission terms. RBAC integration is planned for Phase 3 to provide fine-grained access control within namespaces for larger organizations.

**Risk accepted:** Coarse access control in early phases; some organizations may need per-tool access control before Phase 3.

---

### Tradeoff Summary

| Tradeoff | Decision | Key Reason | Risk Accepted |
|----------|----------|------------|---------------|
| Built-in vs. Standalone | Built-in | Better UX drives adoption | Portal dependency |
| MCP-Native vs. API-First | MCP-Native | Future-proofing for AI ecosystem | Spec instability |
| Per-Project vs. Global | Hierarchical | Enterprise compliance + team flexibility | Policy complexity |
| Namespace vs. RBAC | Namespace (initially) | Intuitive tool organization | Coarse granularity |

---

*Related: [Decision Log](./decision-log.md) · [Architecture](./architecture.md) · [PRD](./prd.md)*
