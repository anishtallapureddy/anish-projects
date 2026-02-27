# Orchestrator (MVP) — System Design + Runbook

## Overview
The orchestrator runs a daily pipeline that produces:
1) Market regime assessment
2) Opportunities: Wheel CSP, Covered Calls, Long-term Value, ETF allocation
3) Risk gating / approvals
4) Daily report JSON + email markdown render
5) Draft orders JSON (non-executing)

## Inputs
- `agents/configs/strategy_rules.yaml`
- `agents/configs/risk_limits.yaml`
- `agents/configs/universe.yaml`
- `agents/configs/user_preferences.yaml`

## Outputs
- `agents/out/YYYY-MM-DD/daily_report.json` (schema: `daily_report.schema.json`)
- `agents/out/YYYY-MM-DD/daily_email.md` (rendered view)
- `agents/out/YYYY-MM-DD/order_drafts.json` (schema: `order_draft.schema.json`)

## Data Flow
Each sub-agent produces JSON conforming to schema:
- Market regime → regime block
- Strategy agents → opportunity lists + draft orders
- Risk gatekeeper → approved + blocked with reasons
- Report agent → email markdown

## Scheduling
- Intended schedule: daily at 10:00 AM America/Chicago
- (In MVP, you may run manually or via cron/GitHub Actions later.)

## Failure Handling
- If options chain unavailable: omit CSP/CC drafts but still send regime/value/ETF insights.
- If regime agent fails: default to Neutral and tighten deltas/limits (fallback posture).

## Guardrails (MVP must enforce)
- No execution; only draft orders.
- Position limits and sector exposure limits must be applied.
- Earnings blackout must be applied when enabled.
- Maximum new trades/day must be enforced.

## Post-MVP (planned)
- Execution Agent with broker integration
- Explicit approval gate and kill switch
- Quote staleness checks, duplicate detection, notional/day caps
