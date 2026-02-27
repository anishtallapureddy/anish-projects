import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

import { loadConfig } from './config/loader';
import { DailyReport, Opportunity, OrderDraft, OptionContract, FundamentalProfile } from './types';

import { runMarketRegimeAgent } from './agents/market-regime';
import { runWheelCspAgent } from './agents/wheel-csp';
import { runCoveredCallAgent } from './agents/covered-call';
import { runValueAgent } from './agents/value';
import { runEtfAgent } from './agents/etf';
import { runRiskGatekeeperAgent } from './agents/risk-gatekeeper';
import { runReportAgent } from './agents/report-email';
import { runFundamentalsAgent } from './agents/fundamentals';

import {
  getMockQuotes, getMockVix, getMockOptionsChain,
  getMockFundamentals, getMockEtfData, getMockPortfolio, getMockEarnings,
} from './data/mock-provider';

import {
  getLiveQuotes, getLiveVix, getLiveOptionsChain,
  getLiveFundamentals, getLiveEtfData, getDefaultPortfolio,
  enrichPortfolioWithLivePrices, getLiveEarnings,
  preScreenWheelCandidates, getLiveBatchOptionsChains,
  getLiveRichFundamentals,
} from './data/live-provider';

export type DataMode = 'mock' | 'live';

export async function runDailyPipeline(mode: DataMode = 'mock'): Promise<{ report: DailyReport; email: string }> {
  const config = loadConfig();
  const today = format(new Date(), 'yyyy-MM-dd');
  const outDir = path.resolve(__dirname, `../agents/out/${today}`);
  fs.mkdirSync(outDir, { recursive: true });

  const label = mode === 'live' ? '🔴 LIVE' : '🟡 MOCK';
  console.log(`\n🚀 WheelAlpha Daily Pipeline — ${today} [${label}]`);
  console.log('='.repeat(50));

  // ── Step 1: Market Regime ──
  console.log('\n📊 [1/8] Market Regime Agent...');
  let spyQuote, vix;
  if (mode === 'live') {
    const quotes = await getLiveQuotes(['SPY']);
    spyQuote = quotes.find((q) => q.symbol === 'SPY')!;
    vix = await getLiveVix();
  } else {
    const quotes = getMockQuotes();
    spyQuote = quotes.find((q) => q.symbol === 'SPY')!;
    vix = getMockVix();
  }
  const regime = runMarketRegimeAgent({ spyQuote, vix }, config);
  console.log(`   → ${regime.regime} (${regime.risk_posture})`);

  const wheelTickers = config.universe.universes.wheel_universe;

  // ── Step 1.5: Fundamentals Agent ──
  console.log('\n📊 [1.5/8] Fundamentals Agent...');
  let fundamentalProfiles: FundamentalProfile[] = [];
  const qualityScores = new Map<string, number>();
  if (mode === 'live') {
    console.log(`   Fetching rich fundamentals for ${wheelTickers.length} stocks (6 parallel)...`);
    const rawProfiles = await getLiveRichFundamentals(wheelTickers, config.universe.sectors, 6);
    fundamentalProfiles = runFundamentalsAgent(rawProfiles);
    for (const p of fundamentalProfiles) {
      qualityScores.set(p.symbol, p.quality_score);
    }
    const gradeCount: Record<string, number> = {};
    for (const p of fundamentalProfiles) gradeCount[p.grade] = (gradeCount[p.grade] || 0) + 1;
    const gradeSummary = Object.entries(gradeCount).sort().map(([g, c]) => `${g}:${c}`).join(' ');
    console.log(`   → ${fundamentalProfiles.length} profiles scored [${gradeSummary}]`);
  } else {
    // Generate basic mock profiles for mock mode
    for (const sym of wheelTickers.slice(0, 50)) {
      const mockScore = 40 + Math.random() * 50;
      qualityScores.set(sym, +mockScore.toFixed(1));
      fundamentalProfiles.push({
        symbol: sym, sector: config.universe.sectors[sym] || 'Unknown',
        market_cap_b: 50 + Math.random() * 200,
        quality_score: +mockScore.toFixed(1),
        profitability_score: +(30 + Math.random() * 60).toFixed(1),
        growth_score: +(20 + Math.random() * 60).toFixed(1),
        valuation_score: +(30 + Math.random() * 50).toFixed(1),
        balance_sheet_score: +(40 + Math.random() * 50).toFixed(1),
        dividend_score: +(20 + Math.random() * 60).toFixed(1),
        roe: +(5 + Math.random() * 30).toFixed(1) as unknown as number,
        roa: +(3 + Math.random() * 20).toFixed(1) as unknown as number,
        profit_margin: +(5 + Math.random() * 25).toFixed(1) as unknown as number,
        gross_margin: +(30 + Math.random() * 40).toFixed(1) as unknown as number,
        operating_margin: +(10 + Math.random() * 25).toFixed(1) as unknown as number,
        revenue_growth: +(-5 + Math.random() * 35).toFixed(1) as unknown as number,
        earnings_growth: +(-10 + Math.random() * 50).toFixed(1) as unknown as number,
        pe_ratio: +(10 + Math.random() * 30).toFixed(1) as unknown as number,
        forward_pe: +(8 + Math.random() * 25).toFixed(1) as unknown as number,
        peg_ratio: +(0.5 + Math.random() * 2.5).toFixed(2) as unknown as number,
        price_to_book: +(1 + Math.random() * 15).toFixed(1) as unknown as number,
        debt_to_equity: +(10 + Math.random() * 100).toFixed(1) as unknown as number,
        current_ratio: +(0.8 + Math.random() * 2).toFixed(2) as unknown as number,
        free_cash_flow_b: +(1 + Math.random() * 20).toFixed(1) as unknown as number,
        dividend_yield: +(Math.random() * 4).toFixed(2) as unknown as number,
        beta: +(0.5 + Math.random() * 1.5).toFixed(2) as unknown as number,
        analyst_rating: ['buy', 'hold', 'sell'][Math.floor(Math.random() * 2)] as string,
        analyst_target: 0, analyst_upside: 0, analyst_count: 0,
        grade: mockScore >= 85 ? 'A' : mockScore >= 70 ? 'B' : mockScore >= 55 ? 'C' : mockScore >= 40 ? 'D' : 'F',
      });
    }
    console.log(`   → ${fundamentalProfiles.length} mock profiles generated`);
  }

  // ── Step 2: Wheel CSP Agent ──
  console.log('\n💰 [2/8] Wheel CSP Agent...');
  const optionsChains: Record<string, OptionContract[]> = {};
  if (mode === 'live') {
    // Phase 1: pre-screen all S&P 500 tickers by liquidity
    console.log(`   Scanning ${wheelTickers.length} S&P 500 stocks...`);
    const { candidates } = await preScreenWheelCandidates(wheelTickers, 80);

    // Phase 2: fetch options chains in parallel for top candidates
    console.log(`   Fetching options for ${candidates.length} top candidates (8 parallel)...`);
    const batchChains = await getLiveBatchOptionsChains(candidates, 8);
    Object.assign(optionsChains, batchChains);
  } else {
    for (const t of wheelTickers) {
      optionsChains[t] = getMockOptionsChain(t);
    }
  }

  const earnings = mode === 'live'
    ? await getLiveEarnings(wheelTickers)
    : getMockEarnings();

  const cspResult = runWheelCspAgent({
    tickers: wheelTickers,
    optionsChains,
    regime,
    earnings,
    qualityScores,
  }, config);
  console.log(`   → ${cspResult.opportunities.length} opportunities, ${cspResult.orderDrafts.length} draft orders`);

  // ── Step 3: Covered Call Agent ──
  console.log('\n📈 [3/8] Covered Call Agent...');
  let portfolio;
  if (mode === 'live') {
    portfolio = await enrichPortfolioWithLivePrices(getDefaultPortfolio());
  } else {
    portfolio = getMockPortfolio();
  }
  const ccResult = runCoveredCallAgent({
    holdings: portfolio.positions,
    optionsChains,
  }, config);
  console.log(`   → ${ccResult.opportunities.length} opportunities, ${ccResult.orderDrafts.length} draft orders`);

  // ── Step 4: Value Agent ──
  console.log('\n🏦 [4/8] Value Agent...');
  // Use value_universe from config, falling back to value_candidates watchlist
  const valueSymbols = config.universe.universes.value_universe
    || config.userPreferences.watchlists.value_candidates;
  let fundamentals;
  if (mode === 'live') {
    fundamentals = await getLiveFundamentals(valueSymbols);
  } else {
    const allFundamentals = getMockFundamentals();
    fundamentals = allFundamentals.filter((f) => valueSymbols.includes(f.symbol));
  }
  const valueResult = runValueAgent({ candidates: fundamentals }, config);
  console.log(`   → ${valueResult.opportunities.length} value picks`);

  // ── Step 5: ETF Agent ──
  console.log('\n🌐 [5/8] ETF Agent...');
  const etfSymbols = config.universe.universes.etf_universe;
  const etfData = mode === 'live'
    ? await getLiveEtfData(etfSymbols)
    : getMockEtfData();

  const etfResult = runEtfAgent({
    etfData,
    portfolio,
    regime,
  }, config);
  console.log(`   → ${etfResult.opportunities.length} ETF insights, ${etfResult.orderDrafts.length} draft orders`);

  // ── Step 6: Risk Gatekeeper ──
  console.log('\n🛡️  [6/8] Risk Gatekeeper Agent...');
  const allOpportunities: Opportunity[] = [
    ...cspResult.opportunities,
    ...ccResult.opportunities,
    ...valueResult.opportunities,
    ...etfResult.opportunities,
  ];
  const allDrafts: OrderDraft[] = [
    ...cspResult.orderDrafts,
    ...ccResult.orderDrafts,
    ...etfResult.orderDrafts,
  ];
  const gateResult = runRiskGatekeeperAgent({
    opportunities: allOpportunities,
    orderDrafts: allDrafts,
    regime,
    portfolio,
  }, config);
  console.log(`   → ${gateResult.approved_opportunities.length} approved, ${gateResult.blocked_opportunities.length} blocked`);

  // ── Build Daily Report ──
  const dailyReport: DailyReport = {
    date: today,
    timezone: 'America/Chicago',
    market_regime: regime,
    approved_opportunities: gateResult.approved_opportunities,
    blocked_opportunities: gateResult.blocked_opportunities,
    order_drafts: gateResult.order_drafts,
    fundamental_profiles: fundamentalProfiles,
  };

  // ── Step 8: Report Agent ──
  console.log('\n📧 [8/8] Report/Email Agent...');
  const emailMarkdown = runReportAgent(dailyReport);

  // ── Save outputs ──
  fs.writeFileSync(
    path.join(outDir, 'daily_report.json'),
    JSON.stringify(dailyReport, null, 2)
  );
  fs.writeFileSync(path.join(outDir, 'daily_email.md'), emailMarkdown);
  fs.writeFileSync(
    path.join(outDir, 'order_drafts.json'),
    JSON.stringify(gateResult.order_drafts, null, 2)
  );

  console.log(`\n✅ Pipeline complete [${label}]. Outputs saved to agents/out/${today}/`);
  console.log(`   • daily_report.json (${gateResult.approved_opportunities.length} approved opps)`);
  console.log(`   • daily_email.md`);
  console.log(`   • order_drafts.json (${gateResult.order_drafts.length} drafts)`);

  return { report: dailyReport, email: emailMarkdown };
}
