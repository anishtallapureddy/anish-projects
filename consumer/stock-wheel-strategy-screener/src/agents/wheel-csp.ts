import {
  Opportunity, OrderDraft, OptionContract, AppConfig,
  MarketRegime, EarningsEvent,
} from '../types';
import { shortId } from '../utils/id';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export interface CspInput {
  tickers: string[];
  optionsChains: Record<string, OptionContract[]>;
  regime: MarketRegime;
  earnings: EarningsEvent[];
}

export interface CspOutput {
  opportunities: Opportunity[];
  orderDrafts: OrderDraft[];
}

export function runWheelCspAgent(input: CspInput, config: AppConfig): CspOutput {
  const { tickers, optionsChains, regime, earnings } = input;
  const rules = config.strategyRules.wheel;
  const riskLimits = config.riskLimits.wheel;

  // Determine effective delta range based on regime
  const deltaRange = riskLimits.tighten_delta_when_regime[regime.regime]
    || rules.csp_delta_range;

  const today = new Date();
  const opportunities: Opportunity[] = [];
  const orderDrafts: OrderDraft[] = [];

  for (const symbol of tickers) {
    const chain = (optionsChains[symbol] || []).filter((c) => c.put_call === 'PUT');
    if (!chain.length) continue;

    // Check earnings blackout
    const earningsDate = earnings.find((e) => e.symbol === symbol);
    if (earningsDate && rules.earnings_blackout_days > 0) {
      const daysUntilEarnings = differenceInCalendarDays(parseISO(earningsDate.date), today);
      if (daysUntilEarnings >= 0 && daysUntilEarnings <= rules.earnings_blackout_days) {
        continue; // skip — within blackout
      }
    }

    // Filter contracts
    const candidates = chain.filter((c) => {
      const absDelta = Math.abs(c.delta);
      const dteOk = c.dte >= rules.dte_days[0] && c.dte <= rules.dte_days[1];
      const deltaOk = absDelta >= deltaRange[0] && absDelta <= deltaRange[1];
      const premiumPct = c.mid / c.strike;
      const premiumOk = premiumPct >= rules.min_csp_premium_pct_of_strike;
      return dteOk && deltaOk && premiumOk;
    });

    // Score and rank
    for (const contract of candidates) {
      const premiumPct = contract.mid / contract.strike;
      const annualizedYield = (premiumPct / contract.dte) * 365;
      const absDelta = Math.abs(contract.delta);
      const regimePenalty = regime.regime === 'Bear' ? 0.3 : regime.regime === 'Neutral' ? 0.1 : 0;
      const score = +(annualizedYield * 100 - absDelta * 50 - regimePenalty * 20).toFixed(2);

      const riskFlags: string[] = [];
      if (absDelta > 0.28) riskFlags.push('high-delta');
      if (contract.iv > 0.35) riskFlags.push('elevated-iv');

      const oppId = shortId();

      opportunities.push({
        id: `csp-${oppId}`,
        category: 'CSP',
        symbol,
        score,
        rationale: `Sell ${symbol} $${contract.strike}P exp ${contract.expiry} (${contract.dte}d). Premium $${contract.mid.toFixed(2)} (${(premiumPct * 100).toFixed(2)}% of strike). Annualized yield ${(annualizedYield * 100).toFixed(1)}%. Delta ${contract.delta.toFixed(2)}.`,
        risk_flags: riskFlags,
        details: {
          strike: contract.strike,
          expiry: contract.expiry,
          dte: contract.dte,
          delta: contract.delta,
          premium: contract.mid,
          annualized_yield: +(annualizedYield * 100).toFixed(1),
        },
      });

      orderDrafts.push({
        order_id: `ord-csp-${oppId}`,
        type: 'CSP',
        symbol,
        quantity: 1, // 1 contract = 100 shares
        option: { put_call: 'PUT', strike: contract.strike, expiry: contract.expiry },
        price_type: 'LIMIT',
        limit_price: +contract.mid.toFixed(2),
        rationale: `CSP: ${symbol} $${contract.strike}P @ $${contract.mid.toFixed(2)} — ${(annualizedYield * 100).toFixed(1)}% annualized`,
        risk_flags: riskFlags,
        requires_approval: true,
      });
    }
  }

  // Sort by score descending, take top opportunities
  opportunities.sort((a, b) => b.score - a.score);
  const topIds = new Set(opportunities.slice(0, 25).map((o) => o.id));
  const filteredDrafts = orderDrafts.filter((d) => topIds.has(d.order_id.replace('ord-', '')));

  return {
    opportunities: opportunities.slice(0, 25),
    orderDrafts: filteredDrafts.slice(0, 10),
  };
}
