# Metrics Framework: Tool Catalog & Discovery

**Owner:** Anish · **Last Updated:** 2025-01-15

---

## North Star Metric

**Time-to-First-Tool-Connection (TTFTC)**

The elapsed time from an agent builder's first catalog search to a successful tool invocation in their agent. Captures the full discovery-to-integration funnel.

- **Baseline (current state):** ~4 hours (estimated from interviews — includes Slack discovery, manual credential provisioning, integration debugging)
- **V1 Target:** < 10 minutes for auto-approved tools; < 4 hours for approval-required tools
- **Why this metric:** It's user-centric (measures what the builder experiences), actionable (we can instrument every step), and leading (correlates with adoption and retention)

---

## Category Metrics

### 1. Discovery

| Metric | Definition | Target |
|--------|-----------|--------|
| Search success rate | % of searches where user clicks a tool result within 30s | ≥ 70% |
| Zero-result rate | % of searches that return no results | ≤ 10% |
| Queries per session | Avg. search queries before selecting a tool | ≤ 2.5 |
| Catalog coverage | % of org tools registered in catalog (self-reported by platform teams) | ≥ 60% at 90 days |

### 2. Adoption

| Metric | Definition | Target |
|--------|-----------|--------|
| Monthly active builders (MAB) | Unique users performing ≥1 search/month | 500 at 90 days |
| Tool connection rate | % of tool-detail views that result in a binding | ≥ 30% |
| Repeat usage | % of builders who return within 14 days | ≥ 50% |
| Collection usage | % of tool bindings originating from curated collections | ≥ 20% |

### 3. Governance

| Metric | Definition | Target |
|--------|-----------|--------|
| Governed binding rate | % of agent-tool bindings created through catalog (vs. hard-coded) | ≥ 80% at 180 days |
| Approval cycle time | Median time from access request to approval/denial | < 4 hours |
| Audit query response time | Time for security to answer "which agents use tool X?" | < 5 minutes |
| Policy violation rate | % of tool bindings that bypass catalog governance | ≤ 5% |

### 4. Developer Experience

| Metric | Definition | Target |
|--------|-----------|--------|
| MCP discovery adoption | % of tool searches via MCP endpoint (vs. REST/UI) | ≥ 25% at 180 days |
| Schema preview usage | % of tool-detail views where schema tab is opened | ≥ 60% |
| Integration error rate | % of first-attempt tool connections that fail | ≤ 15% |
| NPS (tool discovery) | Net Promoter Score for the discovery experience | ≥ 40 |

---

## OKRs — Phase 1 (0–90 days)

**Objective 1: Agent builders can discover and connect to tools faster than any alternative.**

| Key Result | Target | Tracking |
|------------|--------|----------|
| KR1.1: TTFTC for auto-approved tools | < 10 min (p50) | Telemetry |
| KR1.2: Search success rate | ≥ 65% | Telemetry |
| KR1.3: MAB | ≥ 200 | Telemetry |

**Objective 2: Platform teams register and govern their tool inventory.**

| Key Result | Target | Tracking |
|------------|--------|----------|
| KR2.1: Tools registered in catalog | ≥ 100 across 5 orgs | Catalog DB |
| KR2.2: Curated collections created | ≥ 10 | Catalog DB |
| KR2.3: Governed binding rate | ≥ 40% | Telemetry |

**Objective 3: Security teams have auditable visibility into agent-tool bindings.**

| Key Result | Target | Tracking |
|------------|--------|----------|
| KR3.1: Audit query response time | < 5 min | Manual test |
| KR3.2: Approval workflow adoption | ≥ 3 orgs configuring approval policies | Catalog DB |
| KR3.3: Zero unresolved compliance escalations related to agent-tool access | 0 | Support tickets |

---

## Telemetry Schema

### Key Events

| Event | Properties | Purpose |
|-------|-----------|---------|
| `catalog.search` | `query`, `resultCount`, `latencyMs`, `source` (ui/rest/mcp), `userId`, `orgId` | Measure discovery effectiveness and search quality |
| `catalog.tool.view` | `toolId`, `source` (search/collection/deeplink), `tabsViewed[]`, `durationMs`, `userId` | Understand evaluation behavior — which metadata matters |
| `catalog.tool.connect` | `toolId`, `agentId`, `protocol`, `authMethod`, `durationMs`, `success`, `errorCode` | Measure end-to-end connection funnel and failure modes |
| `catalog.access.request` | `toolId`, `requesterId`, `approverIds[]`, `sensitivityLabel`, `justification`, `status` | Track approval workflow efficiency and bottlenecks |
| `catalog.tool.register` | `toolId`, `protocol`, `metadataCompleteness`, `registrarId`, `orgId`, `source` (manual/import) | Measure catalog growth and metadata quality |

### Instrumentation Notes

- All events include standard Azure telemetry envelope: `timestamp`, `correlationId`, `sessionId`, `sdkVersion`.
- Events are emitted to Azure Monitor Application Insights via the OpenTelemetry SDK.
- PII fields (`userId`, `requesterId`) are hashed before storage. Raw values are accessible only via Entra ID join for authorized analysts.

---

## Dashboard Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│  TOOL CATALOG — EXECUTIVE DASHBOARD                    [90 days]│
├──────────────────┬──────────────────┬───────────────────────────┤
│  TTFTC (p50)     │  Search Success  │  Monthly Active Builders  │
│  ██████░░ 8 min  │  ████████░ 72%   │  ██████░░░ 340            │
│  Target: 10 min  │  Target: 65%     │  Target: 200              │
├──────────────────┴──────────────────┴───────────────────────────┤
│                                                                  │
│  Tool Connections (last 30 days)          Governed Binding Rate   │
│  ┌─────────────────────────────┐         ┌────────────────────┐ │
│  │  ▄▄▆▆▇▇█████████████████   │         │  ████████░░ 62%    │ │
│  │  ─────────────────────────  │         │  Target: 40%       │ │
│  │  Week 1    Week 2   Week 4  │         └────────────────────┘ │
│  └─────────────────────────────┘                                 │
│                                                                  │
│  Top Searched (no results)     │  Approval Cycle Time (median)   │
│  1. "SAP inventory lookup"     │  ██████░░░░ 3.2 hrs             │
│  2. "translate document"       │  Target: 4 hrs                  │
│  3. "compliance check PII"     │                                 │
│  4. "azure devops work item"   │  Catalog Coverage               │
│  5. "customer 360 profile"     │  ██████████░ 47% (89/190 tools) │
├─────────────────────────────────┴────────────────────────────────┤
│  ALERTS: 3 tools with >10% error rate · 2 pending approvals >8h │
└──────────────────────────────────────────────────────────────────┘
```

---

*Part of [Anish's PM Portfolio](../../README.md)*
