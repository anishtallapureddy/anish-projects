# Market Regime Agent (MVP)

## Purpose
Classify market regime (Bull/Neutral/Bear) and risk posture (Risk-On/Balanced/Risk-Off) to guide downstream risk limits.

## Inputs
- Index trend signals (e.g., SPY vs 200DMA)
- Volatility proxy (e.g., VIX level / IV environment)
- Optional: breadth, sector rotation

## Outputs (JSON)
- `market_regime.regime`: Bull | Neutral | Bear
- `market_regime.risk_posture`: Risk-On | Balanced | Risk-Off
- `market_regime.notes`: short rationale + key risks

## MVP Logic (simple)
- Bull: SPY above 200DMA and rising; volatility moderate
- Bear: SPY below 200DMA; volatility elevated
- Neutral: otherwise
