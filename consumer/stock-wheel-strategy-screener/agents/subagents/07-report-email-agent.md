# Report/Email Agent (MVP)

## Purpose
Render the final daily report JSON into an email-ready markdown message.

## Inputs
- `daily_report.json`

## Outputs
- `daily_email.md`

## Email format
Subject: WheelAlpha Daily — CSP/CC + Value + ETF (YYYY-MM-DD)

1) Market regime + posture
2) Top CSP candidates (approved)
3) Covered call candidates (approved)
4) Long-term value picks
5) ETF allocation + rebalance suggestions
6) Draft orders (NOT submitted) + explicit "reply format" for feedback
