# Project Milestones & Issues

Create these in GitHub → Issues → Milestones, then add issues under each.

---

## Milestone 1: AI Gateway v0.2 — Auth & MCP Improvements

**Description:** Add tool authentication (client + backend), MCP server groups, and governance policies to the gateway prototype.

### Issues

| Title | Labels | Description |
|---|---|---|
| Add client auth layer (API Key + JWT validation) | `enhancement`, `ai-gateway` | Validate inbound tool calls with API key or JWT token before forwarding to backend |
| Add backend auth injection (API Key + Managed Identity) | `enhancement`, `ai-gateway` | Gateway injects credentials when calling upstream MCP tool servers |
| Add MCP server groups (single endpoint, N servers) | `enhancement`, `ai-gateway` | Developer connects to one URL, authenticates once, gets tools from multiple MCP servers |
| Add governance policies UI (token rate limit, content safety) | `enhancement`, `ai-gateway` | Admin configures rate limits and content safety from a guided form — no policy XML |
| Add auth status badges to tool catalog | `enhancement`, `ai-gateway` | Show green/muted badges per tool on the dashboard for auth posture visibility |

---

## Milestone 2: Cost Segregation MVP — Report Generation

**Description:** Complete the core report generation flow from property input to PDF output with IRS-compliant depreciation schedules.

### Issues

| Title | Labels | Description |
|---|---|---|
| Add PDF report generation with depreciation schedules | `enhancement`, `cost-segregation` | Generate IRS-compliant PDF from property input data |
| Add property comparison view | `enhancement`, `cost-segregation` | Side-by-side comparison of depreciation outcomes for multiple properties |
| Add input validation and error handling | `bug`, `cost-segregation` | Validate all property input fields with clear error messages |
| Add unit tests for depreciation calculations | `testing`, `cost-segregation` | Cover 5-year, 7-year, 15-year, and 39-year depreciation classes |

---

## Milestone 3: WheelAlpha v1.0 — Production Readiness

**Description:** Harden the multi-agent investing tool for daily use — reliable data, risk guardrails, and audit trail.

### Issues

| Title | Labels | Description |
|---|---|---|
| Add retry logic for Yahoo Finance API failures | `bug`, `wheelalpha` | Handle rate limits and timeouts gracefully with exponential backoff |
| Add daily run summary with P&L tracking | `enhancement`, `wheelalpha` | After each daily run, produce a summary of recommendations, draft orders, and cumulative P&L |
| Add position size limits per agent config | `enhancement`, `wheelalpha` | Enforce max allocation per position from risk_limits.yaml |
| Add integration tests for agent orchestrator | `testing`, `wheelalpha` | Test full pipeline: data fetch → agent analysis → draft order generation |
| Document agent architecture in README | `documentation`, `wheelalpha` | Add architecture diagram and agent descriptions to the project README |

---

## Milestone 4: DFW CRE Analyzer — Data Pipeline

**Description:** Improve data freshness and scoring accuracy for commercial real estate deal ranking.

### Issues

| Title | Labels | Description |
|---|---|---|
| Add scheduled data refresh (daily LoopNet sync) | `enhancement`, `dfw-cre` | Automate property data updates instead of manual re-runs |
| Add cap rate trend analysis | `enhancement`, `dfw-cre` | Show 30/60/90 day cap rate trends per submarket |
| Improve underpricing score algorithm | `enhancement`, `dfw-cre` | Weight cap rate, price/sqft, and days-on-market more accurately |
| Add property detail page with full metrics | `enhancement`, `dfw-cre` | Click a deal to see all metrics, comps, and map location |
