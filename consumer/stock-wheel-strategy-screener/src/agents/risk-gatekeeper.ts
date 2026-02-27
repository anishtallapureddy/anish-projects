import {
  Opportunity, OrderDraft, BlockedOpportunity, AppConfig,
  MarketRegime, PortfolioSnapshot,
} from '../types';

export interface RiskGateInput {
  opportunities: Opportunity[];
  orderDrafts: OrderDraft[];
  regime: MarketRegime;
  portfolio: PortfolioSnapshot;
}

export interface RiskGateOutput {
  approved_opportunities: Opportunity[];
  blocked_opportunities: BlockedOpportunity[];
  order_drafts: OrderDraft[];
}

export function runRiskGatekeeperAgent(input: RiskGateInput, config: AppConfig): RiskGateOutput {
  const { opportunities, orderDrafts, regime, portfolio } = input;
  const limits = config.riskLimits;

  const approved: Opportunity[] = [];
  const blocked: BlockedOpportunity[] = [];
  const approvedIds = new Set<string>();

  let newTradesCount = portfolio.trades_today;

  // Build sector exposure map from existing positions
  const sectorExposure: Record<string, number> = {};
  for (const pos of portfolio.positions) {
    sectorExposure[pos.sector] = (sectorExposure[pos.sector] || 0) + pos.market_value;
  }

  // Track position sizes (including pending approvals)
  const positionValues: Record<string, number> = {};
  for (const pos of portfolio.positions) {
    positionValues[pos.symbol] = (positionValues[pos.symbol] || 0) + pos.market_value;
  }

  for (const opp of opportunities) {
    const reasons: string[] = [];

    // 1. Never-trade list
    if (limits.safety.never_trade_list.includes(opp.symbol)) {
      reasons.push(`${opp.symbol} is on the never-trade list`);
    }

    // 2. Max trades per day
    if (opp.category === 'CSP' || opp.category === 'CC') {
      if (newTradesCount >= limits.portfolio.max_new_trades_per_day) {
        reasons.push(`Max ${limits.portfolio.max_new_trades_per_day} new trades/day reached`);
      }
    }

    // 3. Disable CSP in Bear regime
    if (opp.category === 'CSP' && limits.wheel.disable_new_csp_when_regime.includes(regime.regime)) {
      reasons.push(`CSP disabled in ${regime.regime} regime`);
    }

    // 4. Max position %
    const currentPosValue = positionValues[opp.symbol] || 0;
    const posPct = currentPosValue / portfolio.total_value;
    if (posPct > limits.portfolio.max_position_pct) {
      reasons.push(`Position ${opp.symbol} at ${(posPct * 100).toFixed(1)}% exceeds max ${limits.portfolio.max_position_pct * 100}%`);
    }

    // 5. Max sector %
    const sector = config.universe.sectors[opp.symbol] || 'Unknown';
    const sectorValue = sectorExposure[sector] || 0;
    const sectorPct = sectorValue / portfolio.total_value;
    if (sectorPct > limits.portfolio.max_sector_pct) {
      reasons.push(`Sector ${sector} at ${(sectorPct * 100).toFixed(1)}% exceeds max ${limits.portfolio.max_sector_pct * 100}%`);
    }

    // 6. Min cash reserve (for CSP — need cash to cover)
    if (opp.category === 'CSP') {
      const cashPct = portfolio.cash / portfolio.total_value;
      if (cashPct < limits.portfolio.min_cash_reserve_pct) {
        reasons.push(`Cash reserve ${(cashPct * 100).toFixed(1)}% below minimum ${limits.portfolio.min_cash_reserve_pct * 100}%`);
      }
    }

    if (reasons.length > 0) {
      blocked.push({ opportunity: opp, reason: reasons.join('; ') });
    } else {
      approved.push(opp);
      approvedIds.add(opp.id);
      if (opp.category === 'CSP' || opp.category === 'CC') {
        newTradesCount++;
      }
    }
  }

  // Filter order drafts to only approved opportunities
  const approvedDrafts = orderDrafts.filter((d) => {
    const oppId = d.order_id.replace('ord-', '');
    return approvedIds.has(oppId);
  });

  return {
    approved_opportunities: approved,
    blocked_opportunities: blocked,
    order_drafts: approvedDrafts,
  };
}
