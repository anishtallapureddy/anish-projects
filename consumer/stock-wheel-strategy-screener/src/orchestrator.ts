import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

import { loadConfig } from './config/loader';
import { DailyReport, Opportunity, OrderDraft, OptionContract } from './types';

import { runMarketRegimeAgent } from './agents/market-regime';
import { runWheelCspAgent } from './agents/wheel-csp';
import { runCoveredCallAgent } from './agents/covered-call';
import { runValueAgent } from './agents/value';
import { runEtfAgent } from './agents/etf';
import { runRiskGatekeeperAgent } from './agents/risk-gatekeeper';
import { runReportAgent } from './agents/report-email';

import {
  getMockQuotes, getMockVix, getMockOptionsChain,
  getMockFundamentals, getMockEtfData, getMockPortfolio, getMockEarnings,
} from './data/mock-provider';

import {
  getLiveQuotes, getLiveVix, getLiveOptionsChain,
  getLiveFundamentals, getLiveEtfData, getDefaultPortfolio,
  enrichPortfolioWithLivePrices, getLiveEarnings,
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
  console.log('\n📊 [1/7] Market Regime Agent...');
  let spyQuote, vix;
  if (mode === 'live') {
    const allSymbols = [...config.universe.universes.wheel_universe, 'SPY'];
    const quotes = await getLiveQuotes(allSymbols);
    spyQuote = quotes.find((q) => q.symbol === 'SPY')!;
    vix = await getLiveVix();
  } else {
    const quotes = getMockQuotes();
    spyQuote = quotes.find((q) => q.symbol === 'SPY')!;
    vix = getMockVix();
  }
  const regime = runMarketRegimeAgent({ spyQuote, vix }, config);
  console.log(`   → ${regime.regime} (${regime.risk_posture})`);

  // ── Step 2: Wheel CSP Agent ──
  console.log('\n💰 [2/7] Wheel CSP Agent...');
  const wheelTickers = config.universe.universes.wheel_universe;
  const optionsChains: Record<string, OptionContract[]> = {};
  if (mode === 'live') {
    for (const t of wheelTickers) {
      console.log(`   Fetching options for ${t}...`);
      optionsChains[t] = await getLiveOptionsChain(t);
    }
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
  }, config);
  console.log(`   → ${cspResult.opportunities.length} opportunities, ${cspResult.orderDrafts.length} draft orders`);

  // ── Step 3: Covered Call Agent ──
  console.log('\n📈 [3/7] Covered Call Agent...');
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
  console.log('\n🏦 [4/7] Value Agent...');
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
  console.log('\n🌐 [5/7] ETF Agent...');
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
  console.log('\n🛡️  [6/7] Risk Gatekeeper Agent...');
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
  };

  // ── Step 7: Report Agent ──
  console.log('\n📧 [7/7] Report/Email Agent...');
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
