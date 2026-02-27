import { format } from 'date-fns';
import * as https from 'https';
import {
  StockQuote, OptionContract, Fundamentals, EtfData,
  PortfolioSnapshot, EarningsEvent, FundamentalProfile,
} from '../types';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// ── Cookie + Crumb management for Yahoo Finance v7/v8 APIs ──

let crumb: string | null = null;
let cookie: string | null = null;
let authExpiry = 0;

function httpGet(url: string, headers: Record<string, string> = {}): Promise<{ body: string; cookies: string[] }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': UA, ...headers },
    }, (res) => {
      // Collect raw set-cookie headers
      const rawCookies = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]);
      // Handle redirects manually
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
        resolve({ body: '', cookies: rawCookies });
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ body: data, cookies: rawCookies }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function ensureAuth(): Promise<void> {
  if (crumb && cookie && Date.now() < authExpiry) return;
  try {
    // Step 1: Get cookies from consent page (raw http to get set-cookie properly)
    const consentResult = await httpGet('https://fc.yahoo.com');
    const rawCookie = consentResult.cookies.join('; ');

    // Step 2: Get crumb using the cookie
    const crumbResult = await httpGet('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      Cookie: rawCookie,
    });

    if (crumbResult.body && !crumbResult.body.includes('<') && crumbResult.body.length > 3) {
      crumb = crumbResult.body.trim();
      cookie = rawCookie;
      authExpiry = Date.now() + 5 * 60 * 1000; // refresh every 5 minutes
      console.log('   🔑 Yahoo auth: crumb obtained');
    } else {
      console.warn('   ⚠ Yahoo auth: invalid crumb response');
      crumb = null;
      cookie = null;
    }
  } catch (err: any) {
    console.warn(`   ⚠ Yahoo auth failed: ${err.message}`);
    crumb = null;
    cookie = null;
  }
}

async function yahooFetch(url: string): Promise<any> {
  await ensureAuth();
  const fullUrl = crumb ? `${url}${url.includes('?') ? '&' : '?'}crumb=${crumb}` : url;
  const headers: Record<string, string> = { 'User-Agent': UA };
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(fullUrl, { headers });
  if (!res.ok) throw new Error(`Yahoo API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Batch helper: split array into chunks ──

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── Concurrency-limited parallel execution ──

async function parallelLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  for (const item of items) {
    const p = fn(item).then(r => { results.push(r); });
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
      // remove settled
      for (let i = executing.length - 1; i >= 0; i--) {
        const settled = await Promise.race([executing[i].then(() => true), Promise.resolve(false)]);
        if (settled) executing.splice(i, 1);
      }
    }
  }
  await Promise.all(executing);
  return results;
}

// ── Stock Quotes (batched — uses Yahoo's built-in twoHundredDayMovingAverage) ──

export async function getLiveQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];
  const batches = chunk(symbols, 100); // Yahoo supports ~100 symbols per call

  for (const batch of batches) {
    try {
      const symbolStr = batch.join(',');
      const data = await yahooFetch(
        `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`
      );
      const results = data?.quoteResponse?.result || [];

      for (const q of results) {
        // Use Yahoo's pre-computed SMA-200 (no separate historical API call needed)
        const sma200 = q.twoHundredDayAverage ?? q.regularMarketPrice * 0.95;
        quotes.push({
          symbol: q.symbol,
          price: q.regularMarketPrice ?? 0,
          change_pct: q.regularMarketChangePercent ?? 0,
          sma_200: +sma200.toFixed(2),
          volume: q.regularMarketVolume ?? 0,
        });
      }
    } catch (err: any) {
      console.warn(`  ⚠ Failed to fetch quote batch: ${err.message}`);
    }
  }

  return quotes;
}

export async function getLiveVix(): Promise<number> {
  try {
    const data = await yahooFetch(
      'https://query2.finance.yahoo.com/v7/finance/quote?symbols=%5EVIX'
    );
    return data?.quoteResponse?.result?.[0]?.regularMarketPrice ?? 16;
  } catch {
    console.warn('  ⚠ Failed to fetch VIX, using fallback');
    return 16;
  }
}

// ── Options Chains ──

export async function getLiveOptionsChain(symbol: string): Promise<OptionContract[]> {
  try {
    const data = await yahooFetch(
      `https://query2.finance.yahoo.com/v7/finance/options/${symbol}`
    );
    const contracts: OptionContract[] = [];
    const chain = data?.optionChain?.result?.[0];
    if (!chain) return [];

    const expirations: number[] = chain.expirationDates || [];
    const now = Date.now() / 1000;

    // Process first expiration (already included in response)
    processExpiry(chain.options?.[0], contracts, symbol);

    // Scan ALL expirations for ones in the target DTE range (skip first, already processed)
    let fetched = 0;
    for (const exp of expirations.slice(1)) {
      const dte = Math.round((exp - now) / 86400);
      if (dte < 15 || dte > 55) continue;
      if (fetched >= 3) break; // limit API calls per symbol
      try {
        const expData = await yahooFetch(
          `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?date=${exp}`
        );
        processExpiry(expData?.optionChain?.result?.[0]?.options?.[0], contracts, symbol);
        fetched++;
      } catch { /* skip */ }
    }

    return contracts;
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch options for ${symbol}: ${err.message}`);
    return [];
  }
}

// ── Batch Options: parallel fetch with concurrency limit ──

export async function getLiveBatchOptionsChains(
  symbols: string[],
  concurrency: number = 8,
): Promise<Record<string, OptionContract[]>> {
  const chains: Record<string, OptionContract[]> = {};
  let done = 0;
  const total = symbols.length;

  // Process symbols in parallel with concurrency limit
  const queue = [...symbols];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const sym = queue.shift()!;
        chains[sym] = await getLiveOptionsChain(sym);
        done++;
        if (done % 10 === 0 || done === total) {
          console.log(`   📡 Options: ${done}/${total} fetched...`);
        }
      }
    })());
  }

  await Promise.all(workers);
  return chains;
}

// ── Pre-screen: pick top N wheel candidates by IV / volume for options fetching ──

export interface QuoteScreenData {
  symbol: string;
  price: number;
  volume: number;
  impliedVolatility: number;
  marketCap: number;
  optionsAvailable: boolean;
}

export async function preScreenWheelCandidates(
  symbols: string[],
  maxCandidates: number = 80,
): Promise<{ candidates: string[]; screenData: QuoteScreenData[] }> {
  const screenData: QuoteScreenData[] = [];
  const batches = chunk(symbols, 100);

  for (const batch of batches) {
    try {
      const data = await yahooFetch(
        `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${batch.join(',')}`
      );
      for (const q of (data?.quoteResponse?.result || [])) {
        screenData.push({
          symbol: q.symbol,
          price: q.regularMarketPrice ?? 0,
          volume: q.regularMarketVolume ?? 0,
          impliedVolatility: q.regularMarketPrice > 0 ? 0.25 : 0, // base estimate
          marketCap: (q.marketCap ?? 0) / 1e9,
          optionsAvailable: q.quoteType === 'EQUITY' && (q.marketCap ?? 0) > 1e9,
        });
      }
    } catch (err: any) {
      console.warn(`  ⚠ Pre-screen batch failed: ${err.message}`);
    }
  }

  // Rank by liquidity (volume * market cap) — most liquid = best options
  screenData.sort((a, b) => (b.volume * b.marketCap) - (a.volume * a.marketCap));
  const candidates = screenData
    .filter(s => s.optionsAvailable && s.price > 5)
    .slice(0, maxCandidates)
    .map(s => s.symbol);

  console.log(`   🔍 Pre-screened ${symbols.length} stocks → top ${candidates.length} for options scan`);
  return { candidates, screenData };
}

function processExpiry(options: any, contracts: OptionContract[], symbol: string): void {
  if (!options) return;
  const now = Date.now() / 1000;

  for (const opt of (options.puts || [])) {
    const dte = Math.round((opt.expiration - now) / 86400);
    if (dte < 15 || dte > 60) continue;
    contracts.push({
      symbol,
      put_call: 'PUT',
      strike: opt.strike,
      expiry: format(new Date(opt.expiration * 1000), 'yyyy-MM-dd'),
      dte,
      delta: opt.impliedVolatility ? -Math.min(0.45, opt.impliedVolatility * 0.4) : -0.25,
      bid: opt.bid ?? 0,
      ask: opt.ask ?? 0,
      mid: +((opt.bid ?? 0) + (opt.ask ?? 0)) / 2 || opt.lastPrice || 0,
      iv: opt.impliedVolatility ?? 0.25,
      volume: opt.volume ?? 0,
      open_interest: opt.openInterest ?? 0,
    });
  }

  for (const opt of (options.calls || [])) {
    const dte = Math.round((opt.expiration - now) / 86400);
    if (dte < 15 || dte > 60) continue;
    contracts.push({
      symbol,
      put_call: 'CALL',
      strike: opt.strike,
      expiry: format(new Date(opt.expiration * 1000), 'yyyy-MM-dd'),
      dte,
      delta: opt.impliedVolatility ? Math.min(0.45, opt.impliedVolatility * 0.4) : 0.20,
      bid: opt.bid ?? 0,
      ask: opt.ask ?? 0,
      mid: +((opt.bid ?? 0) + (opt.ask ?? 0)) / 2 || opt.lastPrice || 0,
      iv: opt.impliedVolatility ?? 0.22,
      volume: opt.volume ?? 0,
      open_interest: opt.openInterest ?? 0,
    });
  }
}

// ── Fundamentals (batched) ──

export async function getLiveFundamentals(symbols: string[]): Promise<Fundamentals[]> {
  const results: Fundamentals[] = [];
  const batches = chunk(symbols, 100);

  for (const batch of batches) {
    try {
      const symbolStr = batch.join(',');
      const data = await yahooFetch(
        `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`
      );

      for (const q of (data?.quoteResponse?.result || [])) {
        const marketCap = (q.marketCap ?? 0) / 1e9;
        const pe = q.trailingPE ?? 0;
        const forwardPe = q.forwardPE ?? pe;

        results.push({
          symbol: q.symbol,
          market_cap_b: +marketCap.toFixed(1),
          roic: q.returnOnEquity ?? 0.15,
          rev_cagr_5y: q.revenueGrowth ?? 0.10,
          fcf_positive: true,
          net_debt_to_ebitda: q.enterpriseToEbitda ?? 1.0,
          pe_ratio: pe,
          pe_5y_avg: forwardPe > 0 ? forwardPe * 1.1 : pe * 1.1,
          sector: q.sector ?? 'Unknown',
          current_price: q.regularMarketPrice ?? 0,
        });
      }
    } catch (err: any) {
      console.warn(`  ⚠ Failed to fetch fundamentals batch: ${err.message}`);
    }
  }

  return results;
}

// ── ETF Data ──

export async function getLiveEtfData(symbols: string[]): Promise<EtfData[]> {
  const results: EtfData[] = [];

  try {
    const symbolStr = symbols.join(',');
    const data = await yahooFetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`
    );

    for (const q of (data?.quoteResponse?.result || [])) {
      results.push({
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        expense_ratio: 0.10,
        aum_b: (q.marketCap ?? 0) / 1e9,
        ytd_return: (q.regularMarketPrice - (q.fiftyTwoWeekLow ?? q.regularMarketPrice)) / (q.fiftyTwoWeekLow || 1),
        div_yield: q.trailingAnnualDividendYield ?? 0,
        current_price: q.regularMarketPrice ?? 0,
      });
    }
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch ETF data: ${err.message}`);
  }

  return results;
}

// ── Earnings Calendar (batched) ──

export async function getLiveEarnings(symbols: string[]): Promise<EarningsEvent[]> {
  const events: EarningsEvent[] = [];
  const batches = chunk(symbols, 100);

  for (const batch of batches) {
    try {
      const symbolStr = batch.join(',');
      const data = await yahooFetch(
        `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`
      );

      for (const q of (data?.quoteResponse?.result || [])) {
        if (q.earningsTimestamp) {
          events.push({
            symbol: q.symbol,
            date: format(new Date(q.earningsTimestamp * 1000), 'yyyy-MM-dd'),
          });
        }
      }
    } catch { /* ignore */ }
  }

  return events;
}

// ── Rich Fundamentals (quoteSummary API — financialData + defaultKeyStatistics) ──

interface RawFundamentals {
  symbol: string;
  roe: number;
  roa: number;
  profitMargin: number;
  grossMargin: number;
  operatingMargin: number;
  revenueGrowth: number;
  earningsGrowth: number;
  trailingPE: number;
  forwardPE: number;
  priceToBook: number;
  debtToEquity: number;
  currentRatio: number;
  freeCashflow: number;
  dividendYield: number;
  beta: number;
  marketCap: number;
  sector: string;
  currentPrice: number;
  analystRating: string;
  analystTarget: number;
  analystCount: number;
  earningsQuarterlyGrowth: number;
}

async function fetchQuoteSummary(symbol: string): Promise<RawFundamentals | null> {
  try {
    const data = await yahooFetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics`
    );
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const fd = result.financialData || {};
    const ks = result.defaultKeyStatistics || {};
    const raw = (obj: any) => obj?.raw ?? obj ?? 0;

    return {
      symbol,
      roe: raw(fd.returnOnEquity),
      roa: raw(fd.returnOnAssets),
      profitMargin: raw(fd.profitMargins ?? ks.profitMargins),
      grossMargin: raw(fd.grossMargins),
      operatingMargin: raw(fd.operatingMargins),
      revenueGrowth: raw(fd.revenueGrowth),
      earningsGrowth: raw(fd.earningsGrowth),
      trailingPE: raw(ks.trailingPE ?? fd.trailingPE),
      forwardPE: raw(ks.forwardPE ?? fd.forwardPE),
      priceToBook: raw(ks.priceToBook),
      debtToEquity: raw(fd.debtToEquity),
      currentRatio: raw(fd.currentRatio),
      freeCashflow: raw(fd.freeCashflow),
      dividendYield: raw(ks.dividendYield ?? fd.dividendYield),
      beta: raw(ks.beta),
      marketCap: raw(ks.enterpriseValue) || 0,
      sector: '',
      currentPrice: raw(fd.currentPrice),
      analystRating: fd.recommendationKey || 'none',
      analystTarget: raw(fd.targetMeanPrice),
      analystCount: raw(fd.numberOfAnalystOpinions),
      earningsQuarterlyGrowth: raw(ks.earningsQuarterlyGrowth),
    };
  } catch {
    return null;
  }
}

export async function getLiveRichFundamentals(
  symbols: string[],
  sectorMap: Record<string, string>,
  concurrency: number = 6,
): Promise<FundamentalProfile[]> {
  const profiles: FundamentalProfile[] = [];
  let done = 0;
  const total = symbols.length;
  const queue = [...symbols];
  const workers: Promise<void>[] = [];

  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const sym = queue.shift()!;
        const raw = await fetchQuoteSummary(sym);
        done++;
        if (done % 20 === 0 || done === total) {
          console.log(`   📊 Fundamentals: ${done}/${total} fetched...`);
        }
        if (!raw) continue;

        // Compute sub-scores using the fundamentals agent logic (inline for provider)
        // Safe number helper — Yahoo Finance fields can be undefined/null/NaN/{raw,fmt}
        const n = (v: any, scale = 1, decimals = 1): number => {
          if (v == null) return 0;
          const num = typeof v === 'object' && v.raw != null ? v.raw : Number(v);
          return isFinite(num) ? +((num * scale).toFixed(decimals)) : 0;
        };

        const sector = sectorMap[sym] || raw.sector || 'Unknown';
        const mcapB = raw.marketCap / 1e9;
        const fcfB = (raw.freeCashflow || 0) / 1e9;
        const upside = raw.currentPrice > 0
          ? ((raw.analystTarget - raw.currentPrice) / raw.currentPrice) * 100
          : 0;

        profiles.push({
          symbol: sym,
          sector,
          market_cap_b: n(mcapB),
          quality_score: 0, // computed by fundamentals agent
          profitability_score: 0,
          growth_score: 0,
          valuation_score: 0,
          balance_sheet_score: 0,
          dividend_score: 0,
          roe: n(raw.roe, 100),
          roa: n(raw.roa, 100),
          profit_margin: n(raw.profitMargin, 100),
          gross_margin: n(raw.grossMargin, 100),
          operating_margin: n(raw.operatingMargin, 100),
          revenue_growth: n(raw.revenueGrowth, 100),
          earnings_growth: n(raw.earningsGrowth, 100),
          pe_ratio: n(raw.trailingPE),
          forward_pe: n(raw.forwardPE),
          peg_ratio: raw.earningsGrowth > 0 && raw.trailingPE > 0
            ? n(raw.trailingPE / (raw.earningsGrowth * 100), 1, 2)
            : 0,
          price_to_book: n(raw.priceToBook),
          debt_to_equity: n(raw.debtToEquity),
          current_ratio: n(raw.currentRatio, 1, 2),
          free_cash_flow_b: n(fcfB),
          dividend_yield: n(raw.dividendYield, 100, 2),
          beta: n(raw.beta, 1, 2),
          analyst_rating: raw.analystRating || '',
          analyst_target: n(raw.analystTarget, 1, 2),
          analyst_upside: n(upside),
          analyst_count: raw.analystCount || 0,
          grade: '', // computed by fundamentals agent
        });
      }
    })());
  }

  await Promise.all(workers);
  return profiles;
}

// ── Portfolio (still user-provided) ──

export function getDefaultPortfolio(): PortfolioSnapshot {
  return {
    total_value: 187_229,
    cash: 45_000,
    positions: [
      { symbol: 'AAPL',  shares: 200, cost_basis: 165.00, current_price: 0, market_value: 0, sector: 'Technology', type: 'stock' },
      { symbol: 'MSFT',  shares: 50,  cost_basis: 380.00, current_price: 0, market_value: 0, sector: 'Technology', type: 'stock' },
      { symbol: 'GOOGL', shares: 100, cost_basis: 140.00, current_price: 0, market_value: 0, sector: 'Communication Services', type: 'stock' },
      { symbol: 'VTI',   shares: 150, cost_basis: 220.00, current_price: 0, market_value: 0, sector: 'ETF', type: 'etf' },
      { symbol: 'QQQ',   shares: 40,  cost_basis: 380.00, current_price: 0, market_value: 0, sector: 'ETF', type: 'etf' },
      { symbol: 'SCHD',  shares: 100, cost_basis: 72.00,  current_price: 0, market_value: 0, sector: 'ETF', type: 'etf' },
    ],
    trades_today: 0,
  };
}

export async function enrichPortfolioWithLivePrices(portfolio: PortfolioSnapshot): Promise<PortfolioSnapshot> {
  const symbols = portfolio.positions.map(p => p.symbol);
  const quotes = await getLiveQuotes(symbols);
  const quoteMap = new Map(quotes.map(q => [q.symbol, q]));

  let totalInvested = 0;
  for (const pos of portfolio.positions) {
    const q = quoteMap.get(pos.symbol);
    if (q) {
      pos.current_price = q.price;
      pos.market_value = +(pos.shares * q.price).toFixed(2);
    } else {
      pos.market_value = pos.shares * pos.cost_basis;
      pos.current_price = pos.cost_basis;
    }
    totalInvested += pos.market_value;
  }
  portfolio.total_value = totalInvested + portfolio.cash;
  return portfolio;
}
