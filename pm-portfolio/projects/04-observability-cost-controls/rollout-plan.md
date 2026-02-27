# Rollout Plan — AI Cost Attribution & Anomaly Detection

**Author:** Anish Tallapureddy · Principal PM, Azure API Management — AI Gateway
**Last Updated:** 2025-05-15

---

## Rollout Phases

### Phase 1: Internal Dogfooding (Weeks 1–3)

**Scope:** Deploy cost attribution and anomaly detection for the APIM team's own AI workloads — internal Copilot integrations, test automation agents, and internal tooling that routes through the APIM dev/staging gateway instances.

**Activities:**
- Enable cost attribution pipeline on APIM team's 8 internal AI agents
- Configure anomaly detection with default sensitivity
- Set budget policies on non-production agents to validate throttle behavior
- Engineering team uses the Workbook dashboard daily; files bugs and UX feedback

**Go/No-Go Criteria for Phase 2:**
| Criterion | Threshold |
|-----------|-----------|
| Attribution coverage | >90% of internal AI requests attributed |
| Dashboard uptime | >99.5% over 2-week observation period |
| Attribution latency P95 | <5 minutes |
| Anomaly detection uptime | >99.5% |
| Blocking bugs | Zero P0/P1 bugs open |
| Team confidence | Eng lead and PM sign off on readiness |

---

### Phase 2: Private Preview — Design Partners (Weeks 4–10)

**Scope:** Onboard 5 design partner organizations from the experiment cohort. These teams already have baseline data and understand the system from the experiment phase.

**Activities:**
- Provision production-grade pipeline for each design partner
- Guided onboarding: 1:1 setup sessions, agent tagging configuration, alert channel integration
- Weekly check-in calls to collect structured feedback (satisfaction, feature requests, bugs)
- Run experiment H3v2 (redesigned showback reports) with 3 of 5 partners
- Monitor attribution accuracy against Azure billing reconciliation
- Collect case studies and testimonials for public preview launch

**Go/No-Go Criteria for Phase 3:**
| Criterion | Threshold |
|-----------|-----------|
| Attribution accuracy | <3% variance vs. Azure bill across all partners |
| Anomaly detection rate | >85% of real anomalies detected |
| False positive rate | <5 alerts/week/org (median across partners) |
| Customer satisfaction (CSAT) | >4.0/5.0 from post-preview survey |
| Data pipeline reliability | <2 data gaps >5 min in any 7-day period |
| Onboarding time | <4 hours from start to first dashboard view |
| P0/P1 bugs | Zero open; all resolved within SLA |

---

### Phase 3: Public Preview (Weeks 11–18)

**Scope:** Open cost controls to all Azure API Management customers with AI Gateway enabled. Feature is free during preview; usage-based pricing introduced at GA.

**Activities:**
- Self-service onboarding: documentation, quick-start guide, ARM/Bicep templates for pipeline provisioning
- In-product discovery: banner in APIM portal blade, Azure Advisor recommendation for high-spend customers
- Scale testing: validate pipeline performance at 100× design partner volume
- Feedback collection: in-product survey (NPS), UserVoice channel, monthly community call
- Monitor adoption funnel: feature discovery → activation → first dashboard view → first policy created → retained at 30 days
- Run public preview bug bash with CSE (Customer Success Engineering) team

**Go/No-Go Criteria for Phase 4 (GA):**
| Criterion | Threshold |
|-----------|-----------|
| Preview adoption | >100 customers activated |
| Attribution accuracy | <2% variance (improved from 3% private preview bar) |
| Pipeline reliability | 99.9% uptime over 4 consecutive weeks |
| P95 attribution latency | <5 minutes at scale |
| Anomaly detection rate | >88% (validated at public preview scale) |
| False positive rate | <4/week/org (improved target) |
| NPS | >35 |
| P0/P1 bugs | Zero open |
| Security review | Completed and approved by Azure security team |
| Compliance review | SOC2 and GDPR data handling requirements met |
| Pricing validation | Usage-based pricing tested with 10 preview customers; no billing disputes |
| Documentation | Complete API reference, troubleshooting guide, and 3 tutorial scenarios published |

---

### Phase 4: GA (Week 19+)

**Scope:** General Availability release. Feature included in AI Gateway SKU with usage-based pricing for telemetry storage.

**Activities:**
- GA announcement at Ignite / Build (depending on timing) with customer case study
- Enable by default for new AI Gateway instances (opt-out for cost attribution; opt-in for anomaly detection)
- Publish Azure Well-Architected Framework guidance for AI cost management
- Integrate with Azure FinOps toolkit and Azure Advisor AI recommendations
- Transition from preview support (direct engineering) to standard Azure support channels
- Launch partner ecosystem: publish ADX schema for third-party dashboard integrations (Datadog, Splunk)

**Post-GA Success Metrics (90-day window):**
| Metric | Target |
|--------|--------|
| GA customers activated | >500 |
| Average cost-per-invocation reduction | >15% for active users |
| Anomaly detection preventing >$1M aggregate overruns | Tracked via telemetry |
| Budget policy adoption | >30% of active customers |
| Support ticket volume for cost controls | <50 tickets/month |
| Revenue from telemetry storage | On track to plan |

---

## Rollback Plan

Each phase has a rollback path:
- **Phase 1–2**: Disable pipeline via feature flag; no customer data loss (telemetry stops, historical data retained in ADX)
- **Phase 3**: Disable self-service onboarding; notify activated preview customers with 14-day wind-down notice
- **Phase 4**: GA features cannot be fully rolled back; critical issues trigger hotfix within 24-hour SLA

## Risk Escalation
- Any P0 bug in anomaly detection (false throttle on production traffic) triggers immediate pause on new activations and 48-hour war room
- Attribution accuracy >5% variance triggers pipeline audit and temporary "estimates may vary" banner in dashboard
- False positive rate >8/week across >20% of customers triggers sensitivity recalibration and customer communication
