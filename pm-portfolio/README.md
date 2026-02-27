# PM Portfolio — Anish Tallapureddy

A portfolio of product management work spanning AI infrastructure, developer platforms, and SaaS products.

Each project folder contains the complete set of PM artifacts — PRDs, user stories, architecture docs, metrics plans, rollout strategies, decision logs, and demo scripts — that I produce as part of shipping product.

---

## 🎯 Strategic Vision

**[AI Governance Platform: 3-Year Strategy](./vision.md)** — Where the AI governance platform is going over three years, how these projects compound into a platform, investment thesis with headcount allocation, and quantified success criteria.

---

## 🗂️ Projects

| # | Project | Type | Domain | Key Artifacts | Status |
|---|---------|------|--------|---------------|--------|
| 01 | [AI Gateway Governance](./projects/01-ai-gateway-governance/) | System Design + Governance | AI Infrastructure · Azure | PRD · 32 user stories · architecture · 50+ metrics · rollout · 10 ADRs · demo script · [kill list](./projects/01-ai-gateway-governance/kill-list.md) | Prototype shipped |
| 02 | [Cost Segregation SaaS](./projects/02-cost-segregation-saas/) | 0→1 Product Spec | FinTech · Real Estate | PRD · 6 user scenarios · risks · rollout · metrics · 7 ADRs · [live MVP](../../cost-segregation/) | MVP shipped |
| 03 | [MCP Tool Catalog & Discovery](./projects/03-tool-catalog-discovery/) | Customer Discovery | AI Platform · Developer Tools | Interview guide · 12 insights · opportunity tree · PRD · metrics · 5 ADRs | Research complete |
| 04 | [AI Observability & Cost Controls](./projects/04-observability-cost-controls/) | Experiment-Driven Iteration | AI Platform · FinOps | 3 hypotheses · experiment plan · results · ship/iterate/kill decisions · PRD · rollout | Experiments run |
| 05 | [API Gateway Pricing Tiers](./projects/05-gateway-pricing-tiers/) | Pricing / GTM | API Platform · Business | Pricing model · competitive analysis · GTM plan · launch checklist · revenue model | Plan complete |

## 📁 Structure

```
pm-portfolio/
├── vision.md                           # 3-year AI governance platform strategy
├── about/                              # Bio, resume, PM principles
│   ├── resume-onepager.md
│   ├── bio.md
│   └── principles.md
├── projects/
│   ├── 01-ai-gateway-governance/       # System design + governance (10 docs)
│   ├── 02-cost-segregation-saas/       # 0→1 product spec (7 docs)
│   ├── 03-tool-catalog-discovery/      # Customer discovery (7 docs)
│   ├── 04-observability-cost-controls/ # Experiment-driven iteration (8 docs)
│   └── 05-gateway-pricing-tiers/       # Pricing/GTM fast win (5 docs)
├── case-studies/                       # Cross-org alignment case studies
├── templates/                          # Reusable PM frameworks (6 templates)
└── ops/                                # Style guide, glossary
```

## 📄 About Me

→ [Resume](./about/resume-onepager.md) · [Bio](./about/bio.md) · [Principles](./about/principles.md) · [3-Year Vision](./vision.md)

## 📊 Case Studies

| Case Study | Skill Demonstrated |
|---|---|
| [How I Aligned 5 Teams to Ship AI Gateway](./case-studies/ai-gateway-stakeholder-alignment.md) | Cross-org influence, prototype-driven alignment |

## 📋 Templates

Reusable PM frameworks — copy and customize for new projects:

| Template | Use For |
|---|---|
| [PRD Template](./templates/prd-template.md) | Full product requirements |
| [One-Pager](./templates/one-pager-template.md) | Quick project briefs |
| [Metrics Template](./templates/metrics-template.md) | KPIs, OKRs, event schemas |
| [Experiment Template](./templates/experiment-template.md) | A/B tests and experiments |
| [Decision Record](./templates/decision-record-template.md) | Architecture decisions |
| [Rollout Template](./templates/rollout-template.md) | Launch plans with risk registers |

## 🔧 Operations

→ [Style Guide](./ops/repo-style-guide.md) · [Glossary](./ops/glossary.md)
