# Rollout Plan: AI Gateway Governance

---

## Overview

The AI Gateway Governance feature follows a phased rollout strategy, incrementally expanding scope (Models → Tools → Agents) and audience (internal → design partners → public → GA) to manage risk and incorporate feedback at each stage.

```
Phase 0          Phase 1              Phase 2              Phase 3
Internal         Private Preview      Public Preview       General Availability
Dogfooding       (Models)             (+ Tools/MCP)        (+ Agents, Cross-Cloud)
                 
  ████             ████████             ████████████         ████████████████
  Q1 2025          Q1–Q2 2025           Q2–Q3 2025           Q3–Q4 2025
```

---

## Phase 0: Internal Dogfooding

**Duration:** 4 weeks  
**Audience:** Internal Microsoft teams (APIM, Gateway UX, AI Services)  
**Focus:** Validate prototype, gather early feedback, stress-test core architecture

### Scope

| Area | Included | Not Included |
|------|----------|-------------|
| Models | Register models, configure quotas, virtual keys, basic failover | Semantic caching, RAI policies |
| Tools | Register 2–3 MCP endpoints, namespace organization | Approval workflows, API-to-MCP conversion |
| Agents | Register 1–2 internal agents | Cross-cloud sync, guardrails |
| UX | Prototype dashboard (Node.js mock) | AI Gateway dashboard integration |
| Monitoring | Basic request logging | Full dashboards, alerting |

### Success Criteria

- [ ] 3+ internal teams complete end-to-end model governance flow
- [ ] Prototype demo delivered to 5+ stakeholder groups
- [ ] <20 critical bugs identified (and triaged)
- [ ] Architecture validated for AI Gateway dashboard integration path
- [ ] Internal NPS >20 (early signal)

### Go/No-Go Gates

| Gate | Criteria | Owner |
|------|----------|-------|
| Architecture Review | Architecture approved by APIM and gateway engineering leads | Engineering |
| Security Review | Threat model reviewed; no P0 security issues | Security |
| Prototype Feedback | ≥3 stakeholder groups confirm value proposition | PM |
| Performance Baseline | Gateway latency overhead <30ms at P99 (internal load) | Engineering |

### Rollback Plan

- Dogfooding uses isolated APIM instance; rollback = disable gateway routing
- No customer impact; internal teams revert to direct model/tool access
- Prototype is standalone; no dashboard dependencies to revert

---

## Phase 1: Private Preview — Models Governance

**Duration:** 8 weeks  
**Audience:** 5 design partners (enterprise customers)  
**Focus:** Models governance end-to-end in AI Gateway dashboard

### Scope

| Area | Included | Not Included |
|------|----------|-------------|
| Models — Admin | Register models (platform + external), quotas, virtual keys, RAI policies, failover, semantic caching, analytics | — |
| Models — Developer | Model catalog, playground, get credentials, A/B testing | — |
| Tools | Not in scope for Phase 1 | All tool governance |
| Agents | Not in scope for Phase 1 | All agent governance |
| UX | AI Gateway dashboard Operate + Build tabs (Models section) | Tools and Agents sections |
| Monitoring | Model usage dashboards, request logs, failover monitoring | Tool/agent dashboards |

### Design Partner Selection Criteria

- Enterprise customer with ≥3 AI model deployments
- Dedicated platform engineering team
- Willing to provide bi-weekly feedback
- Diverse industries (finance, healthcare, tech, retail, manufacturing)
- Has expressed governance/compliance needs in customer conversations

### Success Criteria

- [ ] 5/5 design partners actively using Models governance
- [ ] Each partner registers ≥3 models through gateway
- [ ] >80% of partner model requests routed through gateway
- [ ] Partner CSAT ≥4.0/5.0
- [ ] Zero P0 incidents; <3 P1 incidents
- [ ] Time to first governed API call <15 minutes (P75)
- [ ] Failover tested successfully by ≥3 partners
- [ ] Virtual key adoption >60%

### Go/No-Go Gates for Phase 2

| Gate | Criteria | Owner |
|------|----------|-------|
| Partner Satisfaction | CSAT ≥4.0/5.0 from ≥4 partners | PM |
| Reliability | Zero P0, <3 P1 during preview period | Engineering |
| Performance | P99 latency overhead <50ms under partner load | Engineering |
| Security | Security audit passed; no unresolved findings | Security |
| Feedback Incorporation | Top 5 partner feedback items addressed or triaged | PM + Eng |
| Scale Validation | Tested at 10x partner request volume | Engineering |

### Rollback Plan

- Per-partner feature flag controls gateway enablement
- Rollback = disable feature flag → partners revert to direct model access
- Data retention: all telemetry and configuration preserved for debugging
- Communication: pre-agreed rollback notification process with each partner
- RTO: <1 hour to disable gateway for a single partner; <4 hours for all partners

---

## Phase 2: Public Preview — Adding Tools (MCP) Governance

**Duration:** 10 weeks  
**Audience:** All AI Gateway customers (opt-in)  
**Focus:** Add Tools governance alongside Models; MCP-native experience

### Scope

| Area | Included | Not Included |
|------|----------|-------------|
| Models (carried from P1) | All Phase 1 Models capabilities (production-hardened) | — |
| Tools — Admin | Register MCP endpoints, API-to-MCP conversion, namespaces, approval workflows, runtime governance, observability | — |
| Tools — Developer | Tool catalog, toolbox building, tool playground, submit API | — |
| Agents | Not in scope for Phase 2 | All agent governance |
| UX | Full Operate + Build tabs for Models and Tools | Agents sections |
| Monitoring | Model + Tool dashboards, cross-pillar analytics | Agent dashboards |

### Success Criteria

- [ ] >100 AI Gateway projects enable gateway (opt-in)
- [ ] >50 MCP tools registered across tenants
- [ ] Tool catalog used by >200 developers
- [ ] API-to-MCP conversion used for >20 APIs
- [ ] Approval workflow completes <24 hour SLA for >95% of submissions
- [ ] Tool invocation P99 latency overhead <50ms
- [ ] Zero P0 incidents; <5 P1 incidents
- [ ] Public preview NPS >30

### Go/No-Go Gates for Phase 3

| Gate | Criteria | Owner |
|------|----------|-------|
| Adoption | >100 projects enabled; >50 tools registered | PM |
| Quality | Zero P0, <5 P1 during preview | Engineering |
| Performance | P99 latency <50ms at public preview scale | Engineering |
| MCP Compatibility | Tested with ≥5 distinct MCP server implementations | Engineering |
| Security | Penetration test passed for tool invocation paths | Security |
| Compliance | SOC 2 and ISO 27001 audit prep complete | Compliance |
| Scale | Load tested at projected GA volume (100x preview) | Engineering |

### Rollback Plan

- Opt-in model: customers explicitly enable; rollback = disable per-project
- Tools governance is additive; disabling does not affect Models governance
- MCP endpoint registrations preserved in case of re-enablement
- Communication: in-portal banner + email notification for any service degradation
- RTO: <30 minutes to disable Tools governance globally; <5 minutes per project

---

## Phase 3: General Availability — Full Platform (Models + Tools + Agents)

**Duration:** Ongoing (GA launch + continuous improvement)  
**Audience:** All AI Gateway customers (enabled by default for new projects, opt-in for existing)  
**Focus:** Agents governance, cross-cloud sync, production-grade SLAs

### Scope

| Area | Included | Not Included |
|------|----------|-------------|
| Models (carried) | All Models capabilities, production SLA | — |
| Tools (carried) | All Tools capabilities, production SLA | — |
| Agents — Admin | Register external agents, cross-cloud sync (Vertex, Bedrock), guardrails, agent lifecycle management, observability | Custom agent orchestration |
| Agents — Developer | Agent catalog, agent playground, multi-agent composition | Agent training/fine-tuning |
| UX | Complete Operate + Build experience across all pillars | Custom policy authoring |
| Monitoring | Full cross-pillar dashboards, alerting, SLA tracking | — |
| Cross-Cloud | Agent sync from Vertex AI and Amazon Bedrock | Other cloud platforms |

### Success Criteria (6 months post-GA)

- [ ] >40% of AI Gateway projects with gateway enabled
- [ ] >500 models, >200 tools, >100 agents registered
- [ ] >10M monthly governed requests
- [ ] >2,000 active developer consumers
- [ ] Gateway uptime >99.95%
- [ ] P99 latency overhead <50ms
- [ ] Developer NPS >40
- [ ] Customer retention +5% for gateway-enabled customers
- [ ] Cross-cloud sync active for >10 customers

### GA Launch Checklist

| Item | Status | Owner |
|------|--------|-------|
| SLA published (99.95% uptime) | 🔲 | PM + Legal |
| Pricing model finalized and communicated | 🔲 | Business |
| Documentation complete (admin + developer guides) | 🔲 | Docs |
| Support runbook published | 🔲 | Support |
| On-call rotation established | 🔲 | Engineering |
| Compliance certifications obtained | 🔲 | Compliance |
| Marketing launch materials ready | 🔲 | Marketing |
| Partner migration from preview to GA | 🔲 | PM + Eng |
| Performance benchmarks published | 🔲 | Engineering |
| Breaking change communication (if any) | 🔲 | PM |

### Rollback Plan

- GA rollback is partial: per-pillar and per-project disable
- Cross-cloud sync can be independently disabled without affecting local governance
- Agent governance disable does not affect Models or Tools
- Incident response: follow Azure standard incident management process
- RTO: <15 minutes per project; <2 hours global

---

## Risk Mitigation Across Phases

| Risk | Mitigation | Phase |
|------|-----------|-------|
| Design partner churn | Over-recruit (7 partners for 5 slots); weekly check-ins | Phase 1 |
| MCP spec instability | Abstract MCP protocol layer; version-pin in preview | Phase 2 |
| Scale surprise at public preview | Load test at 10x projected before each phase gate | Phase 2–3 |
| Cross-cloud API breaking changes | Adapter pattern with per-cloud versioning | Phase 3 |
| Pricing pushback | Offer free tier during preview; gather willingness-to-pay data | Phase 1–2 |

---

## Timeline Summary

| Milestone | Target Date | Dependencies |
|-----------|------------|-------------|
| Phase 0 kickoff | Q1 2025 Week 1 | Prototype complete |
| Phase 0 → Phase 1 gate | Q1 2025 Week 5 | Internal validation |
| Phase 1 kickoff (Private Preview) | Q1 2025 Week 6 | Design partners confirmed |
| Phase 1 → Phase 2 gate | Q2 2025 Week 4 | Partner success criteria met |
| Phase 2 kickoff (Public Preview) | Q2 2025 Week 5 | MCP runtime ready |
| Phase 2 → Phase 3 gate | Q3 2025 Week 2 | Scale + compliance gates |
| Phase 3 GA launch | Q3 2025 Week 4 | All GA checklist items |
| 6-month GA review | Q4 2025 | Post-launch metrics |

---

*Related: [PRD](./prd.md) · [Metrics](./metrics.md) · [Risks & Tradeoffs](./risks-tradeoffs.md)*
