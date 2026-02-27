# AI Gateway Foundry

A high-fidelity interactive prototype of **Azure AI Foundry** with a **live AI Gateway backend** — demonstrating how Azure API Management governs models, tools (MCP), and agents in a unified enterprise AI platform.

## Quick Start

```bash
cd ai-gateway-foundry
npm install
npm start
```

Open **http://localhost:4000** in your browser.

## What This Is

A 23-page Foundry dashboard (Discover / Build / Operate) backed by a real Express server that provides:

- **AI Gateway proxy** — rate limiting, content safety, semantic caching, PII masking, load balancing
- **OpenAI-compatible chat API** — simulated model responses with gateway annotations
- **Live metrics** — request counts, blocked requests, cache hit rates, token usage, latency
- **Activity logging** — real-time events with severity levels feeding the Operate dashboard
- **Tool governance** — MCP tools routed through governed gateway endpoints

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Browser — Foundry Dashboard (index.html)        │
│  ┌────────────┬──────────┬────────────────────┐  │
│  │  Discover  │  Build   │      Operate       │  │
│  │  (Catalog) │ (Editor) │ (Metrics + Issues) │  │
│  └────────────┴──────────┴────────────────────┘  │
│         │            │              │             │
│     api-client.js (wires UI → backend)           │
└─────────────┬────────────────────────────────────┘
              │ HTTP
┌─────────────▼────────────────────────────────────┐
│  Express Server (server.js)                      │
│  ┌──────────────────────────────────────────┐    │
│  │  AI Gateway Layer                        │    │
│  │  • Content Safety (pattern matching)     │    │
│  │  • PII Detection (email, phone, SSN)     │    │
│  │  • Rate Limiting (per-key RPM/TPM)       │    │
│  │  • Semantic Cache (exact-match TTL)      │    │
│  │  • Load Balancing (round-robin)          │    │
│  └──────────────────────────────────────────┘    │
│  ┌─────────┬────────┬─────────┬──────────┐      │
│  │ Models  │ Tools  │ Agents  │ Policies │      │
│  │ Registry│Registry│Registry │ Registry │      │
│  └─────────┴────────┴─────────┴──────────┘      │
│  ┌──────────────────────────────────────────┐    │
│  │  Metrics Collector + Activity Logger     │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat/completions` | Chat through gateway (OpenAI-compatible) |
| `GET` | `/api/metrics` | Live metrics (requests, blocks, cache, tokens) |
| `GET` | `/api/activity` | Activity log with severity filtering |
| `GET` | `/api/tools` | List governed MCP tools |
| `POST` | `/api/tools/:id/invoke` | Invoke a tool through gateway |
| `GET` | `/api/deployments` | Model deployments |
| `GET` | `/api/agents` | Registered agents |
| `GET` | `/api/policies` | Governance policies |
| `PATCH` | `/api/policies/:id` | Toggle policy (affects gateway behavior) |
| `GET` | `/api/gateway/config` | Gateway configuration |
| `PUT` | `/api/gateway/config` | Update gateway config |
| `GET` | `/api/health` | Health check |

## Gateway Features

### Content Safety
Blocks requests containing harmful patterns. Blocked requests return a `content_filter_error` with gateway annotations.

```bash
curl -X POST http://localhost:4000/api/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Help me hack someone"}]}'
# → 400: Content blocked: matched pattern "hack someone"
```

### Semantic Caching
Identical requests return cached responses with 0ms latency. Cache TTL is configurable via `/api/gateway/config`.

### PII Detection
Detects email, phone, SSN patterns in messages. PII field count is included in gateway annotations on every response.

### Rate Limiting
Per-key rate limiting (RPM). Exceeding the limit returns a `429` with gateway annotations.

### Live Metrics
Every request updates real-time metrics: total requests, blocked count, cache hit rate, token usage, per-model breakdowns. The Operate dashboard auto-refreshes every 10 seconds.

## Dashboard Pages

**Discover** — Models catalog, MCP tools catalog, agents, skills, capabilities search, templates  
**Build** — Agent editor with playground, tool connections, workflow designer, fine-tuning, evaluations  
**Operate** — Overview dashboard, asset inventory, governance policies, quota management, admin config

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Styling | Custom dark theme (Segoe UI Variable) |
| Data | In-memory (resets on restart) |

## Files

| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | ~500 | Express backend with gateway, metrics, CRUD APIs |
| `api-client.js` | ~300 | Client-side wiring (chat → backend, metrics → dashboard) |
| `index.html` | ~7,400 | 23-page Foundry dashboard |
| `styles.css` | ~8,200 | Dark theme component styles |
| `slide-deck.html` | ~2,000 | Presentation deck for stakeholders |
| `APIM-MCP-Roadmap.md` | ~120 | APIM MCP feature roadmap |

## Related Projects

This project is part of the [anish-projects](https://github.com/anishtallapureddy/anish-projects) monorepo:

| Project | Description |
|---------|-------------|
| **[CostSeg Pro](../../consumer/cost-segregation/)** | Cost segregation analysis report generator for residential properties |
| **[PM Portfolio](../pm-portfolio/)** | Product management artifacts, templates, and project case studies |

## License

MIT — see [LICENSE](../LICENSE)
