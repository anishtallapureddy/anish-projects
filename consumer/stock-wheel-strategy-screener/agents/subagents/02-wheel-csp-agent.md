# Wheel CSP Agent (MVP)

## Purpose
Generate ranked cash-secured put (CSP) opportunities and corresponding draft orders.

## Inputs
- Wheel universe tickers
- Options chain data (puts)
- Strategy rules (DTE, delta range, premium thresholds)
- Earnings calendar (for blackout)
- Optional: IV rank

## Outputs (JSON)
- Opportunities: category=CSP
- Draft orders: type=CSP (requires_approval=true)

## Filters
- DTE within configured range
- Delta within configured range (or tightened by regime)
- Premium % >= min threshold
- Exclude earnings blackout window when enabled

## Scoring (MVP)
score = (annualized_yield * quality_weight) - risk_penalties
- Prefer higher annualized yield but penalize higher assignment likelihood if regime is Neutral/Bear.
