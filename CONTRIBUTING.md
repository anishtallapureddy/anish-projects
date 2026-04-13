# Contributing

Thanks for your interest in contributing to **anish-projects**.

## Repo Structure

| Project | Path | Stack |
|---------|------|-------|
| AI Gateway | `ai/ai-gateway/` | Node.js + Express |
| Cost Segregation | `consumer/cost-segregation/` | Next.js + TypeScript |
| DFW CRE Analyzer | `consumer/dfw-cre-analyzer/` | Node.js |
| WheelAlpha | `consumer/stock-wheel-strategy-screener/` | Node.js |

## Prerequisites

- **Node.js 20+**
- **npm 9+**

## Local Setup

Each project is independent. From the repo root:

```bash
# AI Gateway
cd ai/ai-gateway && npm install && npm start

# Cost Segregation
cd consumer/cost-segregation && npm install && npm run dev

# DFW CRE Analyzer
cd consumer/dfw-cre-analyzer && npm install && npm start

# WheelAlpha
cd consumer/stock-wheel-strategy-screener && npm install && npm start
```

## Branch Naming

Use prefixed branches off `main`:

- `feat/<topic>` — new features
- `fix/<topic>` — bug fixes
- `docs/<topic>` — documentation changes

## Pull Request Process

1. Create a branch following the naming convention above.
2. Make your changes and ensure CI passes (`npm test` / `npm run build` / `npm run lint` as applicable).
3. Open a PR against `main` with a clear description of what changed and why.
4. Each project has a path-scoped CI workflow — only the affected project's checks will run.
5. Wait for review before merging.

## Code Style

- Follow existing patterns in each project.
- Run the project's linter if one is configured (`npm run lint`).
- Keep commits focused — one logical change per commit.
