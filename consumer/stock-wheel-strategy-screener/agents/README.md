# WheelAlpha Agents (MVP)

WheelAlpha Agents generate a daily investing insights report and **draft orders** (non-executing) for:
- Wheel strategy income (cash-secured puts + covered calls)
- Long-term undervalued stocks
- ETF core allocation + rebalancing notes

## MVP Outcomes
- Daily report generation (email-ready markdown)
- Ranked opportunities with rationale
- Risk gating / guardrails
- Draft orders saved as JSON (not submitted)
- Optional feedback ingestion to refine future outputs

## Non-Goals (MVP)
- Broker integrations
- Order submission / execution
- Automated rebalancing

## Outputs (per run)
- `agents/out/YYYY-MM-DD/daily_report.json`
- `agents/out/YYYY-MM-DD/daily_email.md`
- `agents/out/YYYY-MM-DD/order_drafts.json`

## Design Principles
- Human-in-the-loop: all orders are drafts and require approval.
- Config-driven: rules and limits live in `agents/configs/`.
- Schema-first: agent outputs conform to JSON schemas in `agents/schemas/`.
