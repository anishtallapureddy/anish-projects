import { format, subDays } from 'date-fns';
import {
  StockQuote, OptionContract, Fundamentals, EtfData,
  PortfolioSnapshot, EarningsEvent,
} from '../types';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// ── Cookie + Crumb management for Yahoo Finance v7/v8 APIs ──

let crumb: string | null = null;
let cookie: string | null = null;

async function ensureAuth(): Promise<void> {
  if (crumb && cookie) return;
  try {
    // Step 1: Get cookie from consent page
    const consentRes = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      redirect: 'manual',
    });
    cookie = consentRes.headers.get('set-cookie')?.split(';')[0] || '';

    // Step 2: Get crumb
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: cookie },
    });
    crumb = await crumbRes.text();
    if (!crumb || crumb.includes('<')) {
      // Fallback: try without crumb (some endpoints work without it)
      crumb = null;
      cookie = null;
    }
  } catch {
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

// ── Stock Quotes ──

export async function getLiveQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes: StockQuote[] = [];

  try {
    const symbolStr = symbols.join(',');
    const data = await yahooFetch(
      `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`
    );

    const results = data?.quoteResponse?.result || [];

    // Also fetch historical for SMA-200 calculation
    for (const q of results) {
      let sma200 = 0;
      try {
        const endTs = Math.floor(Date.now() / 1000);
        const startTs = Math.floor(subDays(new Date(), 250).getTime() / 1000);
        const histData = await yahooFetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${q.symbol}?period1=${startTs}&period2=${endTs}&interval=1d`
        );
        const closes: number[] = histData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(Boolean) || [];
        if (closes.length >= 200) {
          sma200 = closes.slice(-200).reduce((s: number, c: number) => s + c, 0) / 200;
        } else if (closes.length > 0) {
          sma200 = closes.reduce((s: number, c: number) => s + c, 0) / closes.length;
        }
      } catch {
        sma200 = q.regularMarketPrice * 0.95; // fallback
      }

      quotes.push({
        symbol: q.symbol,
        price: q.regularMarketPrice ?? 0,
        change_pct: q.regularMarketChangePercent ?? 0,
        sma_200: +sma200.toFixed(2),
        volume: q.regularMarketVolume ?? 0,
      });
    }
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch quotes: ${err.message}`);
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

    // Fetch 1-2 more expirations in the 25-50 day range
    for (const exp of expirations.slice(1, 4)) {
      const dte = Math.round((exp - now / 1) / 86400);
      if (dte < 20 || dte > 55) continue;
      try {
        const expData = await yahooFetch(
          `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?date=${exp}`
        );
        processExpiry(expData?.optionChain?.result?.[0]?.options?.[0], contracts, symbol);
      } catch { /* skip */ }
    }

    return contracts;
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch options for ${symbol}: ${err.message}`);
    return [];
  }
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

// ── Fundamentals ──

export async function getLiveFundamentals(symbols: string[]): Promise<Fundamentals[]> {
  const results: Fundamentals[] = [];

  // Use quote endpoint for basic fundamentals
  try {
    const symbolStr = symbols.join(',');
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
        roic: q.returnOnEquity ?? 0.15, // not in quote, use default
        rev_cagr_5y: q.revenueGrowth ?? 0.10,
        fcf_positive: true, // assume for mega-caps
        net_debt_to_ebitda: q.enterpriseToEbitda ?? 1.0,
        pe_ratio: pe,
        pe_5y_avg: forwardPe > 0 ? forwardPe * 1.1 : pe * 1.1,
        sector: q.sector ?? 'Unknown',
      });
    }
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch fundamentals: ${err.message}`);
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
        expense_ratio: 0.10, // not in quote API; use reasonable default
        aum_b: (q.marketCap ?? 0) / 1e9,
        ytd_return: (q.regularMarketPrice - (q.fiftyTwoWeekLow ?? q.regularMarketPrice)) / (q.fiftyTwoWeekLow || 1),
        div_yield: q.trailingAnnualDividendYield ?? 0,
      });
    }
  } catch (err: any) {
    console.warn(`  ⚠ Failed to fetch ETF data: ${err.message}`);
  }

  return results;
}

// ── Earnings Calendar ──

export async function getLiveEarnings(symbols: string[]): Promise<EarningsEvent[]> {
  // Yahoo quote endpoint includes earningsTimestamp
  const events: EarningsEvent[] = [];
  try {
    const symbolStr = symbols.join(',');
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

  return events;
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
