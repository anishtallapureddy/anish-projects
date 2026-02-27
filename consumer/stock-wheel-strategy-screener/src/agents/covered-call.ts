import { shortId } from '../utils/id';
import {
  Opportunity, OrderDraft, OptionContract, AppConfig,
  PortfolioPosition,
} from '../types';

export interface CoveredCallInput {
  holdings: PortfolioPosition[];
  optionsChains: Record<string, OptionContract[]>;
}

export interface CoveredCallOutput {
  opportunities: Opportunity[];
  orderDrafts: OrderDraft[];
}

export function runCoveredCallAgent(input: CoveredCallInput, config: AppConfig): CoveredCallOutput {
  const { holdings, optionsChains } = input;
  const rules = config.strategyRules.wheel;

  const opportunities: Opportunity[] = [];
  const orderDrafts: OrderDraft[] = [];

  for (const position of holdings) {
    if (position.type !== 'stock' || position.shares < 100) continue;

    const chain = (optionsChains[position.symbol] || []).filter((c) => c.put_call === 'CALL');
    if (!chain.length) continue;

    const contracts = Math.floor(position.shares / 100);

    const candidates = chain.filter((c) => {
      const dteOk = c.dte >= rules.dte_days[0] && c.dte <= rules.dte_days[1];
      const deltaOk = c.delta >= rules.cc_delta_range[0] && c.delta <= rules.cc_delta_range[1];
      const premiumPct = c.mid / c.strike;
      const premiumOk = premiumPct >= rules.min_cc_premium_pct_of_strike;
      const aboveCost = c.strike >= position.cost_basis;
      return dteOk && deltaOk && premiumOk && aboveCost;
    });

    for (const contract of candidates) {
      const premiumPct = contract.mid / contract.strike;
      const ifCalledReturn = (contract.strike - position.cost_basis) / position.cost_basis;
      const totalReturn = ifCalledReturn + premiumPct;
      const annualized = (totalReturn / contract.dte) * 365;
      const score = +(annualized * 100).toFixed(2);

      const riskFlags: string[] = [];
      if (contract.strike < position.cost_basis * 1.02) riskFlags.push('near-cost-basis');

      const oppId = shortId();

      opportunities.push({
        id: `cc-${oppId}`,
        category: 'CC',
        symbol: position.symbol,
        score,
        rationale: `Sell ${contracts}x ${position.symbol} $${contract.strike}C exp ${contract.expiry} (${contract.dte}d). Premium $${contract.mid.toFixed(2)}/share. If called: ${(ifCalledReturn * 100).toFixed(1)}% gain + premium.`,
        risk_flags: riskFlags,
        details: {
          strike: contract.strike,
          expiry: contract.expiry,
          dte: contract.dte,
          delta: contract.delta,
          premium: contract.mid,
          cost_basis: position.cost_basis,
          if_called_return_pct: +(ifCalledReturn * 100).toFixed(1),
        },
      });

      orderDrafts.push({
        order_id: `ord-cc-${oppId}`,
        type: 'CC',
        symbol: position.symbol,
        quantity: contracts,
        option: { put_call: 'CALL', strike: contract.strike, expiry: contract.expiry },
        price_type: 'LIMIT',
        limit_price: +contract.mid.toFixed(2),
        rationale: `CC: ${position.symbol} $${contract.strike}C × ${contracts} @ $${contract.mid.toFixed(2)}`,
        risk_flags: riskFlags,
        requires_approval: true,
      });
    }
  }

  opportunities.sort((a, b) => b.score - a.score);
  return {
    opportunities: opportunities.slice(0, 15),
    orderDrafts: orderDrafts.slice(0, 8),
  };
}
