# Feedback Agent (MVP)

## Purpose
Parse user feedback into structured changes to configs and approvals.

## Inputs
- User feedback text (email reply or chat)
- Prior day's report (optional)

## Outputs (JSON)
- `feedback.json` conforming to `feedback.schema.json`

## Supported commands (MVP)
- APPROVE: <order_id1>,<order_id2>
- REJECT: <order_id...>
- SET_RULE: <path>=<value>
  - example: SET_RULE wheel.csp_delta_range=[0.18,0.25]
- ADD_TO_LIST: watchlists.wheel_universe+=TSM
- REMOVE_FROM_LIST: watchlists.wheel_universe-=NVDA
- NOTE: freeform note
