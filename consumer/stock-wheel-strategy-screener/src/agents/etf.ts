import { shortId } from '../utils/id';
import {
  Opportunity, OrderDraft, EtfData, AppConfig,
  PortfolioSnapshot, MarketRegime,
} from '../types';

export interface EtfInput {
  etfData: EtfData[];
  portfolio: PortfolioSnapshot;
  regime: MarketRegime;
}

export interface EtfOutput {
  opportunities: Opportunity[];
  orderDrafts: OrderDraft[];
}

export function runEtfAgent(input: EtfInput, config: AppConfig): EtfOutput {
  const { etfData, portfolio, regime } = input;
  const rules = config.strategyRules.etf;
  const targets = config.userPreferences.allocation_targets;
  const coreList = config.userPreferences.watchlists.etf_core;

  const opportunities: Opportunity[] = [];
  const orderDrafts: OrderDraft[] = [];

  // Calculate current ETF allocation
  const etfPositions = portfolio.positions.filter((p) => p.type === 'etf');
  const etfValue = etfPositions.reduce((s, p) => s + p.market_value, 0);
  const currentEtfPct = etfValue / portfolio.total_value;
  const targetEtfPct = targets.etf_core;
  const drift = currentEtfPct - targetEtfPct;

  // Check individual ETF data quality
  const eligible = etfData.filter((e) =>
    e.expense_ratio <= rules.max_expense_ratio && e.aum_b >= rules.min_aum_b
  );

  // Generate rebalance suggestion if drift exceeds threshold
  if (Math.abs(drift) > rules.rebalance_threshold_pct) {
    const direction = drift > 0 ? 'overweight' : 'underweight';
    const adjustmentDollars = Math.abs(drift) * portfolio.total_value;

    opportunities.push({
      id: `etf-rebal-${shortId()}`,
      category: 'ETF',
      symbol: 'ETF_CORE',
      score: +(Math.abs(drift) * 100).toFixed(2),
      rationale: `ETF core is ${direction} by ${(Math.abs(drift) * 100).toFixed(1)}% (current ${(currentEtfPct * 100).toFixed(1)}% vs target ${(targetEtfPct * 100).toFixed(1)}%). Suggested adjustment: $${adjustmentDollars.toFixed(0)}.`,
      risk_flags: drift > 0.10 ? ['significant-drift'] : [],
      details: {
        current_pct: +(currentEtfPct * 100).toFixed(1),
        target_pct: +(targetEtfPct * 100).toFixed(1),
        drift_pct: +(drift * 100).toFixed(1),
        adjustment_dollars: +adjustmentDollars.toFixed(0),
      },
    });
  }

  // Recommend individual ETFs from core list
  for (const etf of eligible) {
    if (!coreList.includes(etf.symbol)) continue;

    const held = etfPositions.find((p) => p.symbol === etf.symbol);
    const currentWeight = held ? held.market_value / portfolio.total_value : 0;

    const riskFlags: string[] = [];
    if (regime.regime === 'Bear' && etf.ytd_return < 0) riskFlags.push('negative-ytd-in-bear');

    const score = +(etf.ytd_return * 50 + etf.div_yield * 200 - etf.expense_ratio * 100).toFixed(2);

    opportunities.push({
      id: `etf-${shortId()}`,
      category: 'ETF',
      symbol: etf.symbol,
      score,
      rationale: `${etf.name} (${etf.symbol}): ER ${(etf.expense_ratio * 100).toFixed(2)}%, AUM $${etf.aum_b}B, YTD ${(etf.ytd_return * 100).toFixed(1)}%, Yield ${(etf.div_yield * 100).toFixed(1)}%. Current weight: ${(currentWeight * 100).toFixed(1)}%.`,
      risk_flags: riskFlags,
      details: {
        expense_ratio: etf.expense_ratio,
        aum_b: etf.aum_b,
        ytd_return: +(etf.ytd_return * 100).toFixed(1),
        div_yield: +(etf.div_yield * 100).toFixed(1),
        current_weight_pct: +(currentWeight * 100).toFixed(1),
        current_price: etf.current_price ?? 0,
        action: `BUY ${etf.symbol} shares at ~$${(etf.current_price ?? 0).toFixed(2)}`,
      },
    });

    // Draft buy order if underweight
    if (drift < -rules.rebalance_threshold_pct && (!held || currentWeight < targetEtfPct / coreList.length)) {
      const buyAmount = Math.round(portfolio.total_value * 0.02); // ~2% position
      const shares = Math.floor(buyAmount / (held?.current_price || 100));
      if (shares > 0) {
        orderDrafts.push({
          order_id: `ord-etf-${shortId()}`,
          type: 'BUY_ETF',
          symbol: etf.symbol,
          quantity: shares,
          option: null,
          price_type: 'MARKET',
          limit_price: null,
          rationale: `Buy ${shares} shares ${etf.symbol} to increase ETF core allocation`,
          risk_flags: riskFlags,
          requires_approval: true,
        });
      }
    }
  }

  opportunities.sort((a, b) => b.score - a.score);
  return { opportunities, orderDrafts };
}
