# Long-Term Value Agent (MVP)

## Purpose
Identify long-term hold stocks with strong fundamentals that appear undervalued/mispriced.

## Inputs
- Candidate universe (watchlist or broad screen)
- Fundamentals: revenue CAGR, ROIC, margins, FCF, leverage
- Valuation: current multiples vs historical averages; optional DCF proxy
- Optional: sector medians

## Outputs (JSON)
- Opportunities: category=VALUE (no orders required in MVP unless user wants draft buys)

## Filters (MVP)
- Market cap >= threshold
- ROIC >= threshold
- Revenue CAGR >= threshold
- Positive FCF required
- Net debt/EBITDA <= threshold
- Valuation discount >= threshold

## Scoring (MVP)
score = (valuation_discount * 100) + (quality_score) - (leverage_penalty)
