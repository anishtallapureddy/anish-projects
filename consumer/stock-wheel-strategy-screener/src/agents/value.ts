import { shortId } from '../utils/id';
import { Opportunity, Fundamentals, AppConfig } from '../types';

export interface ValueInput {
  candidates: Fundamentals[];
}

export interface ValueOutput {
  opportunities: Opportunity[];
}

export function runValueAgent(input: ValueInput, config: AppConfig): ValueOutput {
  const { candidates } = input;
  const rules = config.strategyRules.value;
  const opportunities: Opportunity[] = [];

  for (const stock of candidates) {
    // Apply filters
    if (stock.market_cap_b < rules.min_market_cap_b) continue;
    if (stock.roic < rules.min_roic) continue;
    if (stock.rev_cagr_5y < rules.min_rev_cagr_5y) continue;
    if (rules.require_positive_fcf && !stock.fcf_positive) continue;
    if (stock.net_debt_to_ebitda > rules.max_net_debt_to_ebitda) continue;

    // Valuation discount: compare current P/E to 5-year average
    const valuationDiscount = (stock.pe_5y_avg - stock.pe_ratio) / stock.pe_5y_avg;
    if (valuationDiscount < rules.valuation_discount_min) continue;

    // Score
    const qualityScore = (stock.roic * 30) + (stock.rev_cagr_5y * 20);
    const leveragePenalty = Math.max(0, stock.net_debt_to_ebitda) * 5;
    const score = +((valuationDiscount * 100) + qualityScore - leveragePenalty).toFixed(2);

    const riskFlags: string[] = [];
    if (stock.net_debt_to_ebitda > 2) riskFlags.push('moderate-leverage');
    if (stock.pe_ratio > 50) riskFlags.push('high-absolute-pe');

    opportunities.push({
      id: `val-${shortId()}`,
      category: 'VALUE',
      symbol: stock.symbol,
      score,
      rationale: `${stock.symbol}: P/E ${stock.pe_ratio.toFixed(1)} vs 5yr avg ${stock.pe_5y_avg.toFixed(1)} (${(valuationDiscount * 100).toFixed(0)}% discount). ROIC ${(stock.roic * 100).toFixed(0)}%, 5yr rev CAGR ${(stock.rev_cagr_5y * 100).toFixed(0)}%. Market cap $${stock.market_cap_b}B.`,
      risk_flags: riskFlags,
      details: {
        pe_ratio: stock.pe_ratio,
        pe_5y_avg: stock.pe_5y_avg,
        valuation_discount: +(valuationDiscount * 100).toFixed(1),
        roic: +(stock.roic * 100).toFixed(1),
        rev_cagr_5y: +(stock.rev_cagr_5y * 100).toFixed(1),
        net_debt_to_ebitda: stock.net_debt_to_ebitda,
      },
    });
  }

  opportunities.sort((a, b) => b.score - a.score);
  return { opportunities: opportunities.slice(0, 30) };
}
