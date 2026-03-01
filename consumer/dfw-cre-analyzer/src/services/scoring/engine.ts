import { Property, ScoreResult, InvestmentFlag, Confidence } from '../../types';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Compute underpricing score for a property.
 * Algorithm from PRD v2 §5 — Scoring Engine:
 *   compGap (40%): how much cheaper per sqft vs comps
 *   zestimateGap (35%): how much below Zestimate
 *   rentYield (25%): annualized cap rate normalized (8% = 100)
 */
export function computeScore(property: Property): ScoreResult {
  const listingPrice = property.listingPrice;
  const listingPpsf = property.pricePerSqft || (property.sqft ? listingPrice / property.sqft : 0);

  // compGap: (compAvgPpsf - listingPpsf) / compAvgPpsf
  let compGap = 0;
  if (property.compAvgPpsf && property.compAvgPpsf > 0 && listingPpsf > 0) {
    const compGapRaw = (property.compAvgPpsf - listingPpsf) / property.compAvgPpsf;
    compGap = clamp(compGapRaw, 0, 1) * 100;
  }

  // zestimateGap: (zestimateValue - listingPrice) / zestimateValue
  let zestimateGap = 0;
  if (property.zestimateValue && property.zestimateValue > 0 && listingPrice > 0) {
    const zGapRaw = (property.zestimateValue - listingPrice) / property.zestimateValue;
    zestimateGap = clamp(zGapRaw, 0, 1) * 100;
  }

  // rentYield: capRate / 0.08 (8% = max score)
  let rentYield = 0;
  if (property.rentEstimate && property.rentEstimate > 0 && listingPrice > 0) {
    const capRate = (property.rentEstimate * 12) / listingPrice;
    rentYield = clamp(capRate / 0.08, 0, 1) * 100;
  }

  // Weighted total
  const total = Math.round((compGap * 0.40 + zestimateGap * 0.35 + rentYield * 0.25) * 10) / 10;

  // Confidence
  const compsCount = property.comps?.length || 0;
  const hasZestimate = !!property.zestimateValue;
  let confidence: Confidence = 'LOW';
  if (compsCount >= 5 && hasZestimate) confidence = 'HIGH';
  else if (compsCount >= 3 || hasZestimate) confidence = 'MEDIUM';

  return {
    total: Math.round(total * 10) / 10,
    compGap: Math.round(compGap * 10) / 10,
    zestimateGap: Math.round(zestimateGap * 10) / 10,
    rentYield: Math.round(rentYield * 10) / 10,
    confidence,
  };
}

/**
 * Assign investment flag based on score + confidence.
 * STRONG_BUY: score >= 75 AND confidence != LOW
 * BUY:        55–74
 * WATCH:      35–54
 * PASS:       < 35
 */
export function assignFlag(score: ScoreResult): InvestmentFlag {
  if (score.total >= 75 && score.confidence !== 'LOW') return 'STRONG_BUY';
  if (score.total >= 55) return 'BUY';
  if (score.total >= 35) return 'WATCH';
  return 'PASS';
}
