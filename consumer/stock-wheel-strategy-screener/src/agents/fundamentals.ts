import { FundamentalProfile } from '../types';

/**
 * Fundamentals Agent — computes composite quality scores for each stock.
 *
 * Scoring dimensions (0-100 each, weighted into composite):
 *   Profitability (30%): ROE, profit margin, gross margin, operating margin
 *   Growth       (25%): revenue growth, earnings growth
 *   Valuation    (20%): P/E vs sector norms, forward P/E improvement, PEG
 *   Balance Sheet(15%): debt/equity, current ratio, FCF
 *   Dividend     (10%): yield, presence
 */

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function scoreRange(val: number, low: number, high: number): number {
  if (val <= low) return 0;
  if (val >= high) return 100;
  return ((val - low) / (high - low)) * 100;
}

function scoreProfitability(p: FundamentalProfile): number {
  const roeScore = scoreRange(p.roe, 0, 40);           // 0-40% ROE → 0-100
  const marginScore = scoreRange(p.profit_margin, 0, 30); // 0-30% margin → 0-100
  const grossScore = scoreRange(p.gross_margin, 20, 70);  // 20-70% gross → 0-100
  const opScore = scoreRange(p.operating_margin, 0, 35);   // 0-35% op margin → 0-100
  return (roeScore * 0.35 + marginScore * 0.25 + grossScore * 0.2 + opScore * 0.2);
}

function scoreGrowth(p: FundamentalProfile): number {
  const revScore = scoreRange(p.revenue_growth, -5, 30);   // -5% to 30% → 0-100
  const earnScore = scoreRange(p.earnings_growth, -10, 40); // -10% to 40% → 0-100
  return (revScore * 0.5 + earnScore * 0.5);
}

function scoreValuation(p: FundamentalProfile): number {
  // Lower P/E is better (within reason)
  const peScore = p.pe_ratio > 0
    ? clamp(100 - ((p.pe_ratio - 10) / 40) * 100, 0, 100)
    : 50; // no earnings = neutral
  // Forward P/E improvement (lower forward = earnings growing)
  const fwdImprovement = p.pe_ratio > 0 && p.forward_pe > 0
    ? clamp(((p.pe_ratio - p.forward_pe) / p.pe_ratio) * 200, 0, 100)
    : 50;
  // PEG < 1 is great, > 3 is expensive
  const pegScore = p.peg_ratio > 0
    ? clamp(100 - ((p.peg_ratio - 0.5) / 2.5) * 100, 0, 100)
    : 50;
  // Analyst upside
  const upsideScore = scoreRange(p.analyst_upside, -10, 30);
  return (peScore * 0.3 + fwdImprovement * 0.25 + pegScore * 0.25 + upsideScore * 0.2);
}

function scoreBalanceSheet(p: FundamentalProfile): number {
  // Lower debt/equity is better
  const debtScore = p.debt_to_equity >= 0
    ? clamp(100 - (p.debt_to_equity / 200) * 100, 0, 100)
    : 50; // negative equity
  // Current ratio: 1.0-2.5 is healthy
  const crScore = scoreRange(p.current_ratio, 0.5, 2.5);
  // Positive FCF is important
  const fcfScore = p.free_cash_flow_b > 0 ? clamp(50 + p.free_cash_flow_b * 5, 50, 100) : 20;
  return (debtScore * 0.4 + crScore * 0.3 + fcfScore * 0.3);
}

function scoreDividend(p: FundamentalProfile): number {
  if (p.dividend_yield <= 0) return 30; // no dividend isn't terrible for growth
  // Sweet spot: 1-5% yield
  return scoreRange(p.dividend_yield, 0, 5);
}

function computeGrade(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function runFundamentalsAgent(profiles: FundamentalProfile[]): FundamentalProfile[] {
  for (const p of profiles) {
    p.profitability_score = +scoreProfitability(p).toFixed(1);
    p.growth_score = +scoreGrowth(p).toFixed(1);
    p.valuation_score = +scoreValuation(p).toFixed(1);
    p.balance_sheet_score = +scoreBalanceSheet(p).toFixed(1);
    p.dividend_score = +scoreDividend(p).toFixed(1);

    // Weighted composite
    p.quality_score = +(
      p.profitability_score * 0.30 +
      p.growth_score * 0.25 +
      p.valuation_score * 0.20 +
      p.balance_sheet_score * 0.15 +
      p.dividend_score * 0.10
    ).toFixed(1);

    p.grade = computeGrade(p.quality_score);
  }

  // Sort by quality score descending
  profiles.sort((a, b) => b.quality_score - a.quality_score);
  return profiles;
}
