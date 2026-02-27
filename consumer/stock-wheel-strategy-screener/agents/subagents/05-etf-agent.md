# ETF Allocation Agent (MVP)

## Purpose
Recommend ETF core holdings and rebalance suggestions based on target allocation and drift.

## Inputs
- Target allocation (wheel/value/etf_core)
- Current portfolio weights (ETF + stocks)
- ETF universe data: expense ratio, AUM, performance stats
- Market regime from Market Regime Agent

## Outputs (JSON)
- Opportunities: category=ETF
- Optional draft orders: BUY_ETF / REBALANCE (requires_approval=true)

## Logic (MVP)
- If drift exceeds rebalance threshold, recommend rebalancing.
- In Bear regime, favor defensive allocations (optional) and reduce risk-on suggestions.
