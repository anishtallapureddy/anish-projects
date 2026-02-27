# Execution Agent (Planned — Not in MVP)

## Purpose
Submit approved orders to a broker after explicit approval and safety checks.

## MVP status
Not implemented. Only define interfaces and guardrails.

## Planned Interfaces
- BrokerAdapter.preview_order(order) -> preview details + estimated fees
- BrokerAdapter.submit_order(order) -> broker order id
- ApprovalGate.require_approval(order_set_hash) -> true/false
- KillSwitch.pause_all_trading() -> stop submissions

## Planned Guardrails (must-have)
- Notional/day caps and position caps
- Quote staleness checks (reject if quotes older than N seconds)
- Duplicate order detection
- Market-hours validation
- Two-step approval (preview then approve)
- Audit logging for every action

## Non-goals
- Fully autonomous trading without approvals
