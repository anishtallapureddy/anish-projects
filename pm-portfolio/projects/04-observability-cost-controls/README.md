# 04 — AI Cost Attribution & Anomaly Detection

## Project Summary

| Attribute | Detail |
|-----------|--------|
| **Role** | Product Manager, Azure API Management — AI Gateway |
| **Timeline** | Q1–Q2 2025 (12 weeks) |
| **Team** | 2 backend engineers, 1 data engineer, 1 designer, 1 FinOps advisor |
| **Project Type** | Experiment-Driven Iteration |
| **Impact** | 23% average AI spend reduction across preview customers; 91% of budget overruns caught before breach |

---

## Problem Statement

Enterprise platform teams running AI workloads through Azure API Management have no way to attribute AI costs to individual teams, agents, or models. When a single GPT-4o agent racks up $14K overnight, leadership finds out from the Azure bill — not from an alert. FinOps teams manually scrape logs to build showback reports that arrive weeks late. Budget overruns are discovered, never prevented.

This project built cost attribution, anomaly detection, and budget policy enforcement into the AI Gateway — then validated each capability through structured experiments before committing to GA.

## Approach: Hypothesis → Experiment → Data → Decision

This project followed an experiment-driven iteration cycle:

1. **Hypothesis formation** — Defined three testable hypotheses linking product capabilities to measurable cost outcomes
2. **Experiment design** — Built A/B and before/after test plans with pre-registered success criteria
3. **Instrumentation** — Shipped minimal telemetry and dashboards to collect clean data
4. **Execution** — Ran experiments across 5 design partner organizations for 4 weeks
5. **Analysis & decision** — Used results to decide what to ship at GA, what to iterate, and what to cut

## Key Outcomes

- **Hypothesis 1 confirmed**: Per-agent cost breakdowns drove 23% spend reduction (target: 15%)
- **Hypothesis 2 confirmed**: Anomaly alerts + auto-throttle prevented 91% of budget overruns (target: 80%)
- **Hypothesis 3 partially confirmed**: Showback reports drove 2.1× governance adoption (target: 3×)
- Shipped cost dashboard and anomaly alerts to public preview; iterated on showback before GA
- Adopted as reference architecture for Azure FinOps toolkit for AI workloads

## What Makes This Project Different

This isn't a "build it and hope" feature launch. Every capability — cost dashboards, anomaly alerts, budget policies — was validated through pre-registered experiments with measurable success criteria before the team committed to GA. Two hypotheses were confirmed, one required iteration, and the data drove every ship/iterate/kill decision. The experiment plan and results documents are the signature artifacts of this project.

## Skills Demonstrated

- **Experiment design**: Pre-registered hypotheses with A/B and before/after test designs, statistical rigor, and pre-committed success criteria
- **Data-driven decisions**: Used experiment results to ship, iterate, or kill features — not intuition
- **Technical depth**: Designed the metrics pipeline architecture (Event Hub → Stream Analytics → ADX) and made tradeoff decisions on real-time vs. batch attribution
- **Platform thinking**: Built for Azure's enterprise ecosystem — native Monitor/Cost Management integration, governance-as-code via Azure Policy
- **Customer empathy**: Grounded every design decision in customer interview data (n=23) and design partner feedback

## Documentation

| Document | Description |
|----------|-------------|
| [PRD](prd.md) | Product requirements — problem, users, scenarios, solution design |
| [Experiment Plan](experiment-plan.md) | Three hypotheses with test designs, metrics, and success criteria |
| [Experiment Results](experiment-results.md) | Data tables, statistical analysis, and ship/iterate/kill decisions |
| [Metrics](metrics.md) | North star metric, OKRs, telemetry events, dashboard views |
| [Risks & Tradeoffs](risks-tradeoffs.md) | Key risks and architectural tradeoff decisions |
| [Decision Log](decision-log.md) | Architectural decision records for major choices |
| [Rollout Plan](rollout-plan.md) | Phased rollout from internal dogfood to GA |
