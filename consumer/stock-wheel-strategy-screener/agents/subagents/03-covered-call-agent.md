# Covered Call Agent (MVP)

## Purpose
For assigned/share holdings, generate covered call opportunities and draft orders.

## Inputs
- Portfolio holdings (shares + cost basis)
- Options chain data (calls)
- Strategy rules (DTE, delta, premium thresholds)

## Outputs (JSON)
- Opportunities: category=CC
- Draft orders: type=CC (requires_approval=true)

## Filters
- Strike >= cost basis (default conservative)
- DTE within configured range
- Delta within configured range
- Premium % >= min threshold

## Scoring (MVP)
score = (call_premium_pct + if_called_return_pct) - risk_penalties
