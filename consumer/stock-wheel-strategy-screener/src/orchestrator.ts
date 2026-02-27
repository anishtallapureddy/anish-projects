import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

import { loadConfig } from './config/loader';
import { DailyReport, Opportunity, OrderDraft } from './types';

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

export async function runDailyPipeline(): Promise<{ report: DailyReport; email: string }> {
  const config = loadConfig();
  const today = format(new Date(), 'yyyy-MM-dd');
  const outDir = path.resolve(__dirname, `../agents/out/${today}`);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n🚀 WheelAlpha Daily Pipeline — ${today}`);
  console.log('='.repeat(50));

  // ── Step 1: Market Regime ──
  console.log('\n📊 [1/7] Market Regime Agent...');
  const quotes = getMockQuotes();
  const spyQuote = quotes.find((q) => q.symbol === 'SPY')!;
  const vix = getMockVix();
  const regime = runMarketRegimeAgent({ spyQuote, vix }, config);
  console.log(`   → ${regime.regime} (${regime.risk_posture})`);

  // ── Step 2: Wheel CSP Agent ──
  console.log('\n💰 [2/7] Wheel CSP Agent...');
  const wheelTickers = config.universe.universes.wheel_universe;
  const optionsChains: Record<string, import('./types').OptionContract[]> = {};
  for (const t of wheelTickers) {
    optionsChains[t] = getMockOptionsChain(t);
  }
  const cspResult = runWheelCspAgent({
    tickers: wheelTickers,
    optionsChains,
    regime,
    earnings: getMockEarnings(),
  }, config);
  console.log(`   → ${cspResult.opportunities.length} opportunities, ${cspResult.orderDrafts.length} draft orders`);

  // ── Step 3: Covered Call Agent ──
  console.log('\n📈 [3/7] Covered Call Agent...');
  const portfolio = getMockPortfolio();
  const ccResult = runCoveredCallAgent({
    holdings: portfolio.positions,
    optionsChains,
  }, config);
  console.log(`   → ${ccResult.opportunities.length} opportunities, ${ccResult.orderDrafts.length} draft orders`);

  // ── Step 4: Value Agent ──
  console.log('\n🏦 [4/7] Value Agent...');
  const fundamentals = getMockFundamentals();
  const valueCandidates = fundamentals.filter((f) =>
    config.userPreferences.watchlists.value_candidates.includes(f.symbol)
  );
  const valueResult = runValueAgent({ candidates: valueCandidates }, config);
  console.log(`   → ${valueResult.opportunities.length} value picks`);

  // ── Step 5: ETF Agent ──
  console.log('\n🌐 [5/7] ETF Agent...');
  const etfResult = runEtfAgent({
    etfData: getMockEtfData(),
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

  console.log(`\n✅ Pipeline complete. Outputs saved to agents/out/${today}/`);
  console.log(`   • daily_report.json (${gateResult.approved_opportunities.length} approved opps)`);
  console.log(`   • daily_email.md`);
  console.log(`   • order_drafts.json (${gateResult.order_drafts.length} drafts)`);

  return { report: dailyReport, email: emailMarkdown };
}
