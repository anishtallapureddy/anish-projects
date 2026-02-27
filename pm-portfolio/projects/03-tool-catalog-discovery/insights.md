# Research Insights: Tool Catalog Discovery

**Participants:** 12 across 3 segments · **Duration:** 3 weeks · **Method:** Semi-structured interviews (45 min)

---

## Research Summary

| Segment | Participants | Industries |
|---------|-------------|------------|
| Agent Builders | 5 (A1–A5) | Financial services, healthcare, retail, manufacturing, SaaS |
| Platform Engineers | 4 (B1–B4) | Financial services, insurance, energy, tech |
| Security & Compliance | 3 (C1–C3) | Financial services, healthcare, government |

All participants were at organizations with ≥1,000 employees. 10 of 12 had agents in production; the remaining 2 were in late-stage pilot. All used Azure as a primary or secondary cloud.

---

## Synthesized Insights

### Theme 1: Discovery Friction

**Insight 1: Slack is the discovery layer — and it doesn't scale.**
11 of 12 participants said their primary method for finding internal tools is asking in Slack or Teams channels. This works at ≤50 tools but breaks above that threshold.
**Evidence: Strong** (11/12)

> *"I posted in #platform-help asking if we had a Salesforce connector. Got three different answers pointing to three different endpoints, two of which were deprecated."* — A2, Financial Services

**Insight 2: Agent builders discover tools through source code, not documentation.**
When Slack fails, builders reverse-engineer tool endpoints from other teams' agent code in GitHub. 4 of 5 builders reported reading other agents' configuration files as a discovery method.
**Evidence: Strong** (9/12 — all builders, most platform engineers)

> *"I literally grep our monorepo for 'mcp' or 'base_url' to find tools. It's embarrassing but it works."* — A4, Retail

**Insight 3: Tool duplication is endemic and invisible.**
Every platform engineer reported discovering duplicate connectors after the fact. One participant (B2) found four separate Jira connectors built by four teams, each with subtly different schemas.
**Evidence: Strong** (8/12)

### Theme 2: Trust & Evaluation

**Insight 4: Builders cannot assess tool reliability before binding.**
There is no standard way to see uptime, latency, error rate, or SLA tier for internal tools. Builders rely on anecdotal reputation ("ask someone who's used it").
**Evidence: Strong** (10/12)

> *"I connected my agent to an internal pricing API that turned out to have 15% error rates on weekends. I only found out when customers complained about broken quotes."* — A1, Insurance

**Insight 5: Tool ownership is the most-wanted metadata.**
When asked "what single piece of information would help most?", 8 of 12 participants said "who owns this tool and how to reach them." Ownership is often unclear, especially for legacy APIs.
**Evidence: Strong** (8/12)

**Insight 6: Curated collections are more trusted than raw search results.**
Participants responded strongly to the concept of platform-team-curated tool collections. The curation signal ("my platform team vetted this") was valued more than usage popularity.
**Evidence: Moderate** (5/12 — concept-tested, not observed)

> *"If my platform team says 'use these five tools for customer-support agents,' I'm going to use those five tools. I don't want to evaluate 30 options."* — A3, Healthcare

### Theme 3: Governance Gaps

**Insight 7: No organization could audit agent-tool bindings.**
0 of 12 participants could answer "which agents are connected to your PII-handling APIs?" within a business day. Most estimated it would take "a week and several meetings."
**Evidence: Strong** (12/12)

**Insight 8: Security teams want guardrails, not gates.**
Contrary to our hypothesis that security teams would demand strict approval for all tools, 3 of 3 security participants preferred a tiered model: auto-approve low-risk tools, require approval only for sensitive ones.
**Evidence: Moderate** (3/3 in security segment)

> *"I don't want to be a bottleneck. Give me auto-approval for read-only tools and alert me when someone requests write access to anything with PII."* — C1, Financial Services

**Insight 9: Credential provisioning is the hidden tax.**
Even after discovering and getting approval for a tool, agent builders spend 2–5 days waiting for credential provisioning through ServiceNow or manual processes.
**Evidence: Moderate** (5/12 — mainly builders)

### Theme 4: Developer Experience

**Insight 10: MCP-native discovery is expected but doesn't exist.**
Builders using MCP expected to be able to ask their MCP runtime "what tools are available?" and get a searchable response. The gap between expectation and reality was consistently surprising.
**Evidence: Moderate** (4/5 builders using MCP)

> *"I just assumed there'd be a tools/list that returned everything I'm allowed to use. When I realized I had to manually configure every URI, I thought I was doing it wrong."* — A5, SaaS

**Insight 11: Schema-first evaluation saves integration time.**
Builders who could see input/output schemas before connecting reported 3-5x faster integration. The ability to "try before you buy" — seeing the schema, testing with sample data — was a top request.
**Evidence: Moderate** (5/12)

**Insight 12: Catalog adoption depends on day-one content.**
Platform engineers warned that an empty catalog is a dead catalog. The biggest risk to adoption is launching without enough registered tools to make search useful.
**Evidence: Emerging** (3/12 — platform engineers only)

> *"We've launched three internal developer portals. The ones that died had fewer than 20 entries at launch. You need critical mass."* — B3, Energy

---

## Opportunity Tree

```
Root: Agent builders can't efficiently and safely connect to enterprise tools
│
├── Discovery Friction
│   ├── No searchable tool registry → Build catalog with semantic search
│   ├── Tribal knowledge in Slack → Formalize tool metadata standard
│   └── Duplicate connectors → Surface existing tools before creation
│
├── Trust & Evaluation
│   ├── No quality signals → Tool health dashboard on detail page
│   ├── Ownership unclear → Mandatory owner field with contact info
│   └── Curation missing → Platform-curated collections feature
│
├── Governance Gaps
│   ├── No binding audit → Audit log with agent-tool binding events
│   ├── Blunt access control → Tiered approval (auto / request / restricted)
│   └── Slow credentialing → Managed-identity integration for auto-provisioning
│
└── Developer Experience
    ├── No MCP-native discovery → MCP discovery endpoint (tools/search)
    ├── Schema not visible pre-bind → Schema preview + test sandbox
    └── Empty catalog risk → Bootstrap with Azure-native tools + bulk import
```

---

## Prioritized Opportunities (RICE)

| Rank | Opportunity | Reach | Impact | Confidence | Effort | RICE Score |
|------|-------------|-------|--------|------------|--------|------------|
| 1 | Semantic search catalog with tool metadata | 5 | 5 | 5 | 3 | 41.7 |
| 2 | Tiered approval workflow | 4 | 5 | 4 | 2 | 40.0 |
| 3 | Tool detail page with health + owner | 5 | 4 | 5 | 2 | 50.0 |
| 4 | MCP-native discovery endpoint | 3 | 5 | 4 | 2 | 30.0 |
| 5 | Platform-curated collections | 3 | 4 | 3 | 2 | 18.0 |
| 6 | Binding audit log | 4 | 4 | 5 | 3 | 26.7 |
| 7 | Bootstrap with Azure-native tools | 5 | 3 | 3 | 1 | 45.0 |

---

*Part of [Anish's PM Portfolio](../../README.md)*
