# Azure API Management — MCP Roadmap
### Executive Briefing | February 2026 | Confidential

---

## What is MCP in Azure API Management?

Azure API Management is the **enterprise control plane for MCP** — enabling AI agents and LLMs to securely access your APIs and data through the Model Context Protocol (MCP), with the governance, security, and observability your organization already relies on.

---

## Available Today

### 🔌 Connect & Expose
- Expose any **REST API as an MCP server** instantly — no rebuild required
- **Proxy and govern external MCP servers** (Azure Functions, Logic Apps, LangChain, custom runtimes)
- Supports **Streamable HTTP and SSE** transports

### 🔒 Security
- **OAuth 2.0 / OAuth 2.1** and **Microsoft Entra ID** (JWT) authentication
- **API key** auth, **IP filtering**, and **Credential Manager** for secure outbound token injection
- Security enforced independently on **inbound and outbound** connections

### ⚙️ Governance & Control
- **Rate limiting, quotas, caching**, request/response transformation
- Full **APIM policy engine** applied to MCP server endpoints

### 📊 Observability
- **Azure Monitor** and **Application Insights** integration
- End-to-end **correlation IDs** and request tracing

### 🔍 Discovery
- **Azure API Center** — centralized MCP server registry for the enterprise
- Private **self-serve portal** for governed discovery and access

### 🤖 Agent Compatibility
- Works with **GitHub Copilot, ChatGPT, Claude, Copilot Studio**, and any MCP-capable agent

### 🏷️ Availability
| Tier | Status |
|---|---|
| Classic (Developer / Basic / Standard / Premium) | Generally Available |
| v2 (Basic v2 / Standard v2 / Premium v2) | Public Preview |
| Self-hosted gateway | Supported |

---

## Coming — March 2025

| Capability | Value |
|---|---|
| **Tool-change notifications** | Agents stay in sync automatically when tools change |
| **Assign MCP servers to Products** | Govern MCP like APIs — grouped subscriptions, access control, quotas |
| **MCP server versioning** | Dev/test/prod tracks; parallel v1/v2 exposure for safe rollouts |
| **Dedicated MCP observability** | Native MCP metrics, logs, and traces |
| **REST API / CLI / Bicep automation** | Full IaC and CI/CD support for MCP server lifecycle management |
| **Consumption tier support** | MCP available in Consumption SKU |

---

## Coming — May 2026 (Build)

| Capability | Value |
|---|---|
| **Multiple APIs → single MCP endpoint** *(Preview)* | Unify multiple APIs behind one MCP surface — fewer endpoints, simpler agent integration |
| **MCP in Workspaces** | Team-scoped MCP governance in decentralized environments |

---

## Coming — End of FY26

| Capability | Value |
|---|---|
| **Tool-level policies** | Granular policy control at individual tool level — beyond server-wide rules |
| **OBO (On-Behalf-Of) authentication** | MCP server acts on behalf of the calling user for delegated access to downstream services |

---

## Coming — November 2026

| Capability | Value |
|---|---|
| **Non-REST → MCP conversion** | Expose SOAP, GraphQL, gRPC APIs as MCP servers |
| **MCP Elicitations** | Agents can request mid-task clarification from users |
| **MCP Prompts** | Reusable, parameterized prompt templates managed via MCP |
| **MCP Resources** | Expose structured data (files, records, etc.) via MCP |

---

## Roadmap Summary

```
NOW          ████████████████████████████  Core MCP GA (REST, Security, Governance, Observability)
Mar 2025     ████████████████             Versioning · Products · Notifications · Observability · Automation · Consumption
May 2026     ████████                     Multi-API composition · Workspaces · (Build 2026)
FY26 End     █████                        Tool-level policies · OBO Auth
Nov 2026     ████                         Non-REST APIs · Elicitations · Prompts · Resources
```

---

## Current Limitations

| Area | Status |
|---|---|
| MCP tools only — no resources, prompts, or elicitations yet | Planned Nov 2026 |
| Non-REST APIs not yet supported as MCP servers | Planned Nov 2026 |
| MCP not yet available in Workspaces | Planned May 2026 |
| MCP not yet available in Consumption tier | Planned March 2025 |

---

*For early access to upcoming features, enroll in the **AI Gateway release channel** via APIM service update settings.*

---
*Azure API Management Product Group · Internal Use & Customer Sharing*
