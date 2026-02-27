# Rollout Plan: [Feature / Project Name]

> *Copy this template for each phased launch. Define your rollout phases, risk mitigations, and rollback strategy before you ship.*

---

**Date:** *YYYY-MM-DD*
**Author:** *Your name*
**Status:** *Draft / Approved / In Progress / Complete*

---

## Rollout Phases

| Phase | Scope | Users | Duration | Success Criteria | Go / No-Go |
|---|---|---|---|---|---|
| *Phase 0 — Internal dogfood* | *Internal team only* | *~20 users* | *1 week* | *No P0/P1 bugs, core flow works end-to-end* | *PM + Eng lead sign-off* |
| *Phase 1 — Private preview* | *Invited beta customers* | *~200 users* | *2 weeks* | *Activation rate > 30%, error rate < 1%* | *PM + Eng + Design review* |
| *Phase 2 — Limited GA* | *10% of production traffic* | *~2,000 users* | *2 weeks* | *No regression in guardrail metrics, NPS ≥ 40* | *VP sign-off* |
| *Phase 3 — General Availability* | *100% of users* | *All users* | *Ongoing* | *Meets all KPI targets from metrics plan* | *Leadership review* |

### Phase Transition Criteria

*Before advancing to the next phase, all of the following must be true:*

- [ ] Success criteria for current phase are met
- [ ] No unresolved P0 or P1 bugs
- [ ] Go/No-Go approver has signed off
- [ ] On-call team is briefed on changes

## Risk Register

| ID | Risk | Category | Likelihood | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R1 | *e.g., API latency exceeds SLA under load* | *Technical* | *Medium* | *High* | *Load test at 2x expected traffic before Phase 2* | *Eng lead* | *Open* |
| R2 | *e.g., Partner integration not ready by Phase 1* | *Dependency* | *High* | *Medium* | *Build mock/stub for Phase 1; real integration for Phase 2* | *PM* | *Mitigated* |
| R3 | *e.g., Negative user sentiment from UX change* | *User experience* | *Low* | *High* | *A/B test in Phase 1 with rollback flag* | *Design* | *Open* |
| R4 | *e.g., Data migration causes downtime* | *Operational* | *Low* | *Critical* | *Run migration in maintenance window with dry-run first* | *Eng lead* | *Open* |

### Risk Categories

- **Technical** — performance, reliability, scalability
- **Dependency** — external teams, third-party services, approvals
- **User experience** — usability, adoption, sentiment
- **Operational** — deployment, migration, on-call
- **Compliance** — legal, security, privacy

## Rollback Plan

*Define exactly how to revert if something goes wrong at each phase.*

### Rollback Triggers

- *P0 bug affecting > 5% of users*
- *Error rate exceeds 2x baseline for > 15 minutes*
- *Data integrity issue detected*

### Rollback Steps

1. *Disable feature flag `feature_x_enabled` via [feature flag system]*
2. *Verify traffic is routed to previous version*
3. *Notify on-call and stakeholders in [Slack channel / Teams channel]*
4. *Run smoke tests against rollback state*
5. *Post-mortem within 48 hours*

### Rollback Owners

| Phase | Primary Owner | Backup Owner |
|---|---|---|
| *Phase 0–1* | *Eng lead* | *PM* |
| *Phase 2–3* | *On-call engineer* | *Eng lead* |

## Launch Checklist

### Pre-Launch

- [ ] All success criteria and KPIs defined (see metrics plan)
- [ ] Feature flag configured and tested (on/off/percentage)
- [ ] Load testing complete at target traffic levels
- [ ] Monitoring dashboards and alerts configured
- [ ] Runbook / on-call documentation updated
- [ ] Rollback procedure tested in staging
- [ ] Legal / compliance review complete (if applicable)
- [ ] Stakeholder communication sent

### Launch Day

- [ ] Feature flag enabled for target phase
- [ ] Real-time monitoring confirmed (dashboards, alerts)
- [ ] Smoke tests passing in production
- [ ] On-call engineer confirmed and available
- [ ] Customer support briefed on new feature

### Post-Launch

- [ ] Day 1 metrics reviewed — no anomalies
- [ ] Week 1 metrics reviewed — trending toward targets
- [ ] User feedback collected and triaged
- [ ] Bugs logged and prioritized
- [ ] Go/No-Go decision for next phase documented
- [ ] Retrospective scheduled (if applicable)
