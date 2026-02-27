import {
  StockQuote, OptionContract, Fundamentals, EtfData,
  PortfolioSnapshot, PortfolioPosition, EarningsEvent,
} from '../types';
import { format, addDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

// ── Stock Quotes ──

export function getMockQuotes(): StockQuote[] {
  return [
    { symbol: 'AAPL',  price: 189.84, change_pct: 0.42,  sma_200: 178.50, volume: 52_000_000 },
    { symbol: 'MSFT',  price: 420.21, change_pct: 0.68,  sma_200: 395.00, volume: 22_000_000 },
    { symbol: 'GOOGL', price: 175.98, change_pct: -0.31, sma_200: 162.30, volume: 25_000_000 },
    { symbol: 'AMZN',  price: 186.49, change_pct: 1.12,  sma_200: 170.80, volume: 45_000_000 },
    { symbol: 'META',  price: 505.75, change_pct: 0.89,  sma_200: 460.00, volume: 18_000_000 },
    { symbol: 'NVDA',  price: 875.28, change_pct: 2.15,  sma_200: 720.00, volume: 55_000_000 },
    { symbol: 'SPY',   price: 525.40, change_pct: 0.55,  sma_200: 490.00, volume: 80_000_000 },
  ];
}

export function getMockVix(): number {
  return 16.8; // moderate volatility
}

// ── Options Chains ──

function generatePuts(symbol: string, price: number): OptionContract[] {
  const expiry30 = format(addDays(new Date(), 32), 'yyyy-MM-dd');
  const expiry45 = format(addDays(new Date(), 46), 'yyyy-MM-dd');

  const strikes = [
    Math.round(price * 0.85),
    Math.round(price * 0.90),
    Math.round(price * 0.92),
    Math.round(price * 0.95),
  ];

  const contracts: OptionContract[] = [];
  for (const expiry of [expiry30, expiry45]) {
    const dte = expiry === expiry30 ? 32 : 46;
    for (const strike of strikes) {
      const otm_pct = (price - strike) / price;
      const delta = -(0.50 - otm_pct * 3.5);  // rough approximation
      const mid = price * (0.008 + otm_pct * 0.15) * (dte / 30);
      contracts.push({
        symbol, put_call: 'PUT', strike, expiry, dte,
        delta: Math.max(-0.45, Math.min(-0.05, delta)),
        bid: +(mid * 0.95).toFixed(2),
        ask: +(mid * 1.05).toFixed(2),
        mid: +mid.toFixed(2),
        iv: +(0.25 + Math.random() * 0.15).toFixed(3),
        volume: Math.floor(500 + Math.random() * 5000),
        open_interest: Math.floor(2000 + Math.random() * 20000),
      });
    }
  }
  return contracts;
}

function generateCalls(symbol: string, price: number): OptionContract[] {
  const expiry30 = format(addDays(new Date(), 32), 'yyyy-MM-dd');
  const expiry45 = format(addDays(new Date(), 46), 'yyyy-MM-dd');

  const strikes = [
    Math.round(price * 1.03),
    Math.round(price * 1.05),
    Math.round(price * 1.08),
    Math.round(price * 1.10),
  ];

  const contracts: OptionContract[] = [];
  for (const expiry of [expiry30, expiry45]) {
    const dte = expiry === expiry30 ? 32 : 46;
    for (const strike of strikes) {
      const otm_pct = (strike - price) / price;
      const delta = 0.50 - otm_pct * 4.0;
      const mid = price * (0.006 + otm_pct * 0.10) * (dte / 30);
      contracts.push({
        symbol, put_call: 'CALL', strike, expiry, dte,
        delta: Math.max(0.05, Math.min(0.45, delta)),
        bid: +(mid * 0.95).toFixed(2),
        ask: +(mid * 1.05).toFixed(2),
        mid: +mid.toFixed(2),
        iv: +(0.22 + Math.random() * 0.12).toFixed(3),
        volume: Math.floor(300 + Math.random() * 4000),
        open_interest: Math.floor(1500 + Math.random() * 15000),
      });
    }
  }
  return contracts;
}

export function getMockOptionsChain(symbol: string): OptionContract[] {
  const quotes = getMockQuotes();
  const quote = quotes.find((q) => q.symbol === symbol);
  if (!quote) return [];
  return [...generatePuts(symbol, quote.price), ...generateCalls(symbol, quote.price)];
}

// ── Fundamentals ──

export function getMockFundamentals(): Fundamentals[] {
  return [
    { symbol: 'AAPL',  market_cap_b: 2950, roic: 0.56, rev_cagr_5y: 0.08, fcf_positive: true, net_debt_to_ebitda: 0.5, pe_ratio: 29.5, pe_5y_avg: 26.0, sector: 'Technology' },
    { symbol: 'MSFT',  market_cap_b: 3120, roic: 0.38, rev_cagr_5y: 0.14, fcf_positive: true, net_debt_to_ebitda: 0.3, pe_ratio: 35.2, pe_5y_avg: 32.0, sector: 'Technology' },
    { symbol: 'GOOGL', market_cap_b: 2180, roic: 0.28, rev_cagr_5y: 0.18, fcf_positive: true, net_debt_to_ebitda: -0.5, pe_ratio: 24.1, pe_5y_avg: 28.5, sector: 'Communication Services' },
    { symbol: 'AMZN',  market_cap_b: 1950, roic: 0.16, rev_cagr_5y: 0.22, fcf_positive: true, net_debt_to_ebitda: 0.8, pe_ratio: 58.3, pe_5y_avg: 72.0, sector: 'Consumer Discretionary' },
    { symbol: 'META',  market_cap_b: 1280, roic: 0.32, rev_cagr_5y: 0.16, fcf_positive: true, net_debt_to_ebitda: -1.2, pe_ratio: 26.8, pe_5y_avg: 30.0, sector: 'Communication Services' },
    { symbol: 'NVDA',  market_cap_b: 2150, roic: 0.72, rev_cagr_5y: 0.52, fcf_positive: true, net_debt_to_ebitda: -0.8, pe_ratio: 65.0, pe_5y_avg: 55.0, sector: 'Technology' },
  ];
}

// ── ETF Data ──

export function getMockEtfData(): EtfData[] {
  return [
    { symbol: 'VTI',  name: 'Vanguard Total Stock Market',     expense_ratio: 0.03, aum_b: 380, ytd_return: 0.12, div_yield: 0.013 },
    { symbol: 'QQQ',  name: 'Invesco QQQ Trust',                expense_ratio: 0.20, aum_b: 250, ytd_return: 0.18, div_yield: 0.005 },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity',        expense_ratio: 0.06, aum_b: 55,  ytd_return: 0.06, div_yield: 0.035 },
    { symbol: 'IEF',  name: 'iShares 7-10 Year Treasury',      expense_ratio: 0.15, aum_b: 28,  ytd_return: -0.02, div_yield: 0.038 },
    { symbol: 'GLD',  name: 'SPDR Gold Shares',                 expense_ratio: 0.40, aum_b: 62,  ytd_return: 0.08, div_yield: 0.0 },
  ];
}

// ── Portfolio Snapshot ──

export function getMockPortfolio(): PortfolioSnapshot {
  const positions: PortfolioPosition[] = [
    { symbol: 'AAPL',  shares: 200, cost_basis: 165.00, current_price: 189.84, market_value: 37_968, sector: 'Technology', type: 'stock' },
    { symbol: 'MSFT',  shares: 50,  cost_basis: 380.00, current_price: 420.21, market_value: 21_010, sector: 'Technology', type: 'stock' },
    { symbol: 'GOOGL', shares: 100, cost_basis: 140.00, current_price: 175.98, market_value: 17_598, sector: 'Communication Services', type: 'stock' },
    { symbol: 'VTI',   shares: 150, cost_basis: 220.00, current_price: 265.30, market_value: 39_795, sector: 'ETF', type: 'etf' },
    { symbol: 'QQQ',   shares: 40,  cost_basis: 380.00, current_price: 445.20, market_value: 17_808, sector: 'ETF', type: 'etf' },
    { symbol: 'SCHD',  shares: 100, cost_basis: 72.00,  current_price: 80.50,  market_value: 8_050,  sector: 'ETF', type: 'etf' },
  ];

  const invested = positions.reduce((s, p) => s + p.market_value, 0);
  const cash = 45_000;

  return {
    total_value: invested + cash,
    cash,
    positions,
    trades_today: 0,
  };
}

// ── Earnings Calendar ──

export function getMockEarnings(): EarningsEvent[] {
  return [
    { symbol: 'AAPL',  date: format(addDays(new Date(), 5), 'yyyy-MM-dd') },
    { symbol: 'NVDA',  date: format(addDays(new Date(), 25), 'yyyy-MM-dd') },
  ];
}
