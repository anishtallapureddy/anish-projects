# AI Gateway Governance for Microsoft Foundry

## Quick Summary

| Dimension | Detail |
|-----------|--------|
| **Role** | Product Manager — AI Platform Governance |
| **Timeline** | Q1–Q3 2025 (Prototype → Private Preview → GA) |
| **Team** | Cross-functional: APIM, Foundry Portal, AI Services, MCP Runtime |
| **Impact** | Unified governance layer for models, tools, and agents across Azure AI Foundry |
| **Prototype** | [Live demo](https://github.com/anishtallapureddy/anish-projects/tree/main/ai-gateway-foundry) (Node.js + Express + 23-page Foundry dashboard) |

---

## What Is This?

AI Gateway Governance is the integration of Azure API Management (APIM) as a **built-in AI gateway** within Microsoft Foundry (Azure AI Foundry). It provides enterprises with a single control plane to govern, observe, and secure their entire AI estate — spanning **Models**, **Tools (MCP)**, and **Agents**.

## The Problem

Enterprises adopting AI at scale face a fragmented governance landscape:

- **Models** are deployed across Azure OpenAI, third-party providers, and open-source endpoints — each with separate quota, auth, and safety controls.
- **Tools** (APIs, MCP servers, data connectors) proliferate without centralized discovery, approval, or runtime governance.
- **Agents** are built across multiple frameworks and clouds (Foundry, Vertex AI, Amazon Bedrock) with no unified observability or guardrail enforcement.

Platform engineers have no single pane of glass. Developers waste time navigating fragmented tooling. Security teams cannot enforce consistent policies.

## The Approach

Rather than building governance from scratch, we embed **APIM's proven gateway capabilities** directly into the Foundry portal experience:

1. **Operate Tab (Admin)** — Platform engineers register, configure, and govern models, tools, and agents through a unified admin experience.
2. **Build Tab (Developer)** — Developers and agent builders discover governed resources, build toolboxes, test in playgrounds, and connect via standardized APIs.
3. **Gateway Layer** — APIM provides the runtime enforcement: rate limiting, semantic caching, content safety, load balancing, failover, virtual keys, traffic splitting, and MCP routing.

## Key Outcomes

- **Unified governance** across all three AI pillars (Models, Tools, Agents) in one portal
- **Developer velocity** — catalog-driven discovery with one-click integration
- **Enterprise trust** — consistent policy enforcement, audit trails, and approval workflows
- **Multi-cloud reach** — register and govern non-Foundry models and agents (including cross-cloud sync)
- **Working prototype** that demonstrates the full end-to-end experience

## Working Prototype

A fully functional mock was built to demonstrate the vision and align stakeholders. The prototype is a Node.js + Express application with an HTML dashboard that simulates:

- The **Operate** experience (admin governance for models, tools, agents)
- The **Build** experience (developer discovery, toolbox building, playground testing)
- The **Monitor** experience (metrics dashboard, request logs, health indicators)

🔗 **Repository:** [github.com/anishtallapureddy/anish-projects/ai-gateway-foundry](https://github.com/anishtallapureddy/anish-projects/tree/main/ai-gateway-foundry)

## Documentation

| Document | Description |
|----------|-------------|
| [Product Requirements (PRD)](./prd.md) | Full product requirements across all pillars and personas |
| [User Stories](./user-stories.md) | Prioritized user stories with acceptance criteria |
| [Architecture](./architecture.md) | Technical architecture, data flows, and integration points |
| [Metrics](./metrics.md) | Success metrics, OKRs, and telemetry schema |
| [Rollout Plan](./rollout-plan.md) | Phased rollout from dogfooding to GA |
| [Risks & Tradeoffs](./risks-tradeoffs.md) | Risk register and key design tradeoff analysis |
| [Decision Log](./decision-log.md) | Architecture and product decision records |
| [Kill List](./kill-list.md) | Features deliberately killed and why — prioritization discipline |
| [Demo Script](./demo-script.md) | 5-minute demo walkthrough of the working prototype |

---

*This project is part of [Anish's PM Portfolio](../../README.md).*
