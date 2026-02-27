# Risk Gatekeeper Agent (MVP)

## Purpose
Approve or block opportunities and draft orders based on portfolio and configured risk limits.

## Inputs
- All opportunities from CSP/CC/Value/ETF agents
- Draft orders
- Portfolio snapshot (positions, sector exposure, cash)
- Risk limits and safety rules
- Market regime

## Outputs (JSON)
- `approved_opportunities[]`
- `blocked_opportunities[]` with reason
- `order_drafts[]` (only for approved opportunities; others removed)

## Checks (MVP)
- Max position % per ticker
- Max sector exposure %
- Minimum cash reserve %
- Max new trades/day
- Never-trade list
- Earnings avoidance rules
- Disable CSP in Bear regime (if configured)
