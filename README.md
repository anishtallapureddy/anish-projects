# Anish Projects

A collection of product-focused software projects built by [Anish Tallapureddy](https://github.com/anishtallapureddy).

## Projects

| Project | Description | Status | Stack |
|---|---|---|---|
| [**AI Gateway Foundry**](./ai-gateway-foundry/) | Azure AI Foundry experience with live AI Gateway backend — rate limiting, content safety, semantic caching, PII masking, tool governance. 23-page interactive dashboard with Discover/Build/Operate tabs. | 🟢 Live | Express · Vanilla JS · CSS |
| [**CostSeg Pro**](./cost-segregation/) | Cost segregation analysis report generator for residential properties. Generates IRS-compliant reports that help property owners save $10K–$100K+ in taxes through accelerated depreciation. | 🟢 MVP | Next.js · TypeScript · Tailwind · SQLite |

## Getting Started

Each project lives in its own directory with independent dependencies:

```bash
# AI Gateway Foundry
cd ai-gateway-foundry
npm install && npm start        # → http://localhost:4000

# CostSeg Pro
cd cost-segregation
npm install && npm run dev      # → http://localhost:3000
```

## Repository Structure

```
anish-projects/
├── ai-gateway-foundry/     # Azure AI Foundry + AI Gateway mock
│   ├── server.js           # Express backend with gateway proxy
│   ├── api-client.js       # Client-side API wiring
│   ├── index.html          # 23-page Foundry dashboard
│   ├── styles.css          # Dark theme styling
│   └── slide-deck.html     # Presentation deck
├── cost-segregation/       # CostSeg Pro — cost segregation report generator
│   ├── docs/               # PRD, metrics, rollout plan, decision log
│   ├── src/                # Application source code
│   └── README.md           # Project documentation
├── pm-portfolio/           # PM portfolio with project docs & templates
├── LICENSE
└── README.md               # ← You are here
```

## License

See [LICENSE](./LICENSE) for details.
