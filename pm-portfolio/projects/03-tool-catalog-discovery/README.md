# 03 — Governed MCP Tool Catalog & Discovery

## Summary

| Attribute | Detail |
|-----------|--------|
| **Role** | Principal PM — Group Product Lead, Azure API Management / AI Gateway |
| **Timeline** | 8 weeks (discovery through spec) |
| **Team** | 1 PM, 1 Design Researcher, 2 Engineers (prototype) |
| **Impact** | Shaped the tool-discovery surface for Azure AI Gateway, influencing catalog architecture adopted by 3 internal agent platform teams |
| **Skills** | Customer discovery, user research synthesis, PRD authoring, metrics design |

## Problem

Enterprise teams building AI agents have no governed way to discover, evaluate, or connect to organizational tools — APIs, MCP servers, data connectors, and custom functions. Teams duplicate connector work, agents bind to hard-coded endpoints, and security has zero visibility into which tools agents actually invoke. As agentic AI adoption scales from pilot to production, the absence of a curated tool catalog creates compounding friction.

## Approach

1. **Customer Discovery** — Conducted 12 interviews across agent builders, platform engineers, and security/compliance stakeholders to map pain points and workflows.
2. **Insight Synthesis** — Identified 12 key insights organized around discovery friction, trust signals, governance gaps, and developer experience.
3. **PRD & Spec** — Authored a product requirements document for a searchable, governed tool catalog integrated with Azure API Center and exposed via both REST and MCP endpoints.
4. **Prototype Validation** — Built a lightweight prototype (semantic search + approval flow) to validate core interactions with 5 participants.

## Key Outcomes

- Validated that **tool discovery is the #1 friction point** for enterprise agent builders (cited by 11/12 participants).
- Defined a catalog architecture that bridges Azure API Center metadata with MCP-native tool descriptors.
- Established a metrics framework with a north-star metric (Time-to-First-Tool-Connection) adopted by the platform team.
- Influenced the decision to pursue an **MCP-first, protocol-extensible** catalog strategy.

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](prd.md) | Product requirements — problem, users, scenarios, solution, technical approach |
| [Interview Guide](interview-guide.md) | Research protocol — segments, questions, probes, artifacts |
| [Insights](insights.md) | Synthesized findings — 12 insights with evidence, quotes, opportunity tree |
| [Metrics](metrics.md) | Success metrics — north star, OKRs, telemetry schema, dashboard |
| [Risks & Tradeoffs](risks-tradeoffs.md) | Risk register and key architectural tradeoffs with decisions |
| [Decision Log](decision-log.md) | 5 ADRs covering catalog architecture, search, approvals, schema, MCP strategy |

## How to Read This Project

Start with the **PRD** for the full problem and solution framing. Read **Insights** to see how customer evidence shaped the spec. **Metrics** and **Risks & Tradeoffs** show how I think about measurability and hard choices. The **Decision Log** captures the key architectural bets and their rationale.

---

*Part of [Anish's PM Portfolio](../../README.md) · Targeting AI platform / infrastructure PM roles*
