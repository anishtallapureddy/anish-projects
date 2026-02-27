# anish-projects

A monorepo of things I'm building — AI infrastructure, fintech tools, and the product thinking behind them.

I'm a Principal PM — Group Product Lead at Microsoft, working on Azure API Management and AI Gateway. This repo is where I prototype ideas, document product decisions, and ship side projects.

---

## 🔧 Live Projects

### [AI Gateway](./ai/ai-gateway/)
A working prototype of an AI governance gateway — rate limiting, content safety, semantic caching, PII detection, MCP tool routing, and load balancing across model deployments. Node.js + Express backend with a 23-page dashboard.

| Discover — Model & tool catalog | Operate — Governance dashboard |
|:---:|:---:|
| ![Discover](./ai/ai-gateway/screenshots/01-discover-dashboard.png) | ![Operate](./ai/ai-gateway/screenshots/02-operate-overview.png) |
| **Build — Agent management** | **Models — Catalog browse** |
| ![Build](./ai/ai-gateway/screenshots/03-build-playground.png) | ![Models](./ai/ai-gateway/screenshots/04-models-catalog.png) |

```bash
cd ai/ai-gateway && npm install && npm start
```

### [Cost Segregation](./consumer/cost-segregation/)
A fintech SaaS that generates IRS-compliant cost segregation reports for residential properties. Automates what CPAs charge $5K–$15K for. Next.js + TypeScript + SQLite.

```bash
cd consumer/cost-segregation && npm install && npm run dev
```

---

## 📋 Product Work

Each project has full PM documentation — PRDs, decision logs, metrics plans, rollout strategies. This is how I think through products, not just build them.

| Project | What it is | Docs |
|---------|-----------|------|
| **AI Gateway Governance** | System design for a unified AI governance layer — models, tools (MCP), and agents | [PRD](./pm-portfolio/projects/01-ai-gateway-governance/prd.md) · [Architecture](./pm-portfolio/projects/01-ai-gateway-governance/architecture.md) · [Decisions](./pm-portfolio/projects/01-ai-gateway-governance/decision-log.md) · [What I cut](./pm-portfolio/projects/01-ai-gateway-governance/kill-list.md) |
| **Cost Segregation SaaS** | 0→1 product spec for IRS-compliant tax automation | [PRD](./pm-portfolio/projects/02-cost-segregation-saas/README.md) · [Scenarios](./pm-portfolio/projects/02-cost-segregation-saas/user-scenarios.md) · [Rollout](./pm-portfolio/projects/02-cost-segregation-saas/rollout-plan.md) |
| **MCP Tool Catalog** | Customer discovery for enterprise AI tool governance | [Interviews](./pm-portfolio/projects/03-tool-catalog-discovery/interview-guide.md) · [Insights](./pm-portfolio/projects/03-tool-catalog-discovery/insights.md) · [PRD](./pm-portfolio/projects/03-tool-catalog-discovery/prd.md) |
| **AI Observability & Cost Controls** | Experiment-driven approach to AI cost attribution | [Experiment](./pm-portfolio/projects/04-observability-cost-controls/experiment-plan.md) · [Results](./pm-portfolio/projects/04-observability-cost-controls/experiment-results.md) |
| **Gateway Pricing Tiers** | Usage-based pricing model with competitive analysis | [Pricing Model](./pm-portfolio/projects/05-gateway-pricing-tiers/pricing-model.md) · [GTM Plan](./pm-portfolio/projects/05-gateway-pricing-tiers/gtm-plan.md) |

**More:** [3-Year Platform Vision](./pm-portfolio/vision.md) · [Stakeholder Alignment Case Study](./pm-portfolio/case-studies/ai-gateway-stakeholder-alignment.md) · [PM Templates](./pm-portfolio/templates/)

---

## 📁 Repo Structure

```
anish-projects/
├── ai/                            # AI & platform projects
│   └── ai-gateway/                # Live prototype — gateway + dashboard
├── consumer/                      # Consumer & fintech projects
│   └── cost-segregation/          # Live MVP — tax report generator
├── pm-portfolio/
│   ├── vision.md                  # 3-year strategy
│   ├── about/                     # Bio, resume, principles
│   ├── projects/                  # PM docs for each project
│   ├── case-studies/              # Cross-org alignment
│   └── templates/                 # Reusable PM frameworks
└── README.md
```

---

[GitHub](https://github.com/anishtallapureddy) · [LinkedIn](https://linkedin.com/in/anishtallapureddy)
