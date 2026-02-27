import {
  StockQuote, OptionContract, Fundamentals, EtfData,
  PortfolioSnapshot, PortfolioPosition, EarningsEvent,
} from '../types';
import { format, addDays } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

// ── Stock Quotes ──

export function getMockQuotes(): StockQuote[] {
  return [
    // Technology
    { symbol: 'AAPL',  price: 189.84, change_pct: 0.42,  sma_200: 178.50, volume: 52_000_000 },
    { symbol: 'MSFT',  price: 420.21, change_pct: 0.68,  sma_200: 395.00, volume: 22_000_000 },
    { symbol: 'NVDA',  price: 875.28, change_pct: 2.15,  sma_200: 720.00, volume: 55_000_000 },
    { symbol: 'AVGO',  price: 168.50, change_pct: 0.95,  sma_200: 152.00, volume: 8_000_000 },
    { symbol: 'CRM',   price: 272.40, change_pct: -0.22, sma_200: 255.00, volume: 6_500_000 },
    { symbol: 'AMD',   price: 162.30, change_pct: 1.75,  sma_200: 148.00, volume: 42_000_000 },
    { symbol: 'ADBE',  price: 542.10, change_pct: 0.33,  sma_200: 510.00, volume: 3_200_000 },
    { symbol: 'INTC',  price: 42.85,  change_pct: -1.20, sma_200: 38.50,  volume: 35_000_000 },
    { symbol: 'CSCO',  price: 50.22,  change_pct: 0.15,  sma_200: 48.00,  volume: 18_000_000 },
    { symbol: 'ORCL',  price: 125.40, change_pct: 0.82,  sma_200: 115.00, volume: 9_000_000 },
    // Communication Services
    { symbol: 'GOOGL', price: 175.98, change_pct: -0.31, sma_200: 162.30, volume: 25_000_000 },
    { symbol: 'META',  price: 505.75, change_pct: 0.89,  sma_200: 460.00, volume: 18_000_000 },
    { symbol: 'NFLX',  price: 628.50, change_pct: 1.42,  sma_200: 570.00, volume: 5_800_000 },
    { symbol: 'DIS',   price: 112.30, change_pct: -0.65, sma_200: 105.00, volume: 10_500_000 },
    { symbol: 'CMCSA', price: 42.75,  change_pct: 0.28,  sma_200: 40.80,  volume: 16_000_000 },
    // Consumer Discretionary
    { symbol: 'AMZN',  price: 186.49, change_pct: 1.12,  sma_200: 170.80, volume: 45_000_000 },
    { symbol: 'TSLA',  price: 248.50, change_pct: 3.20,  sma_200: 225.00, volume: 95_000_000 },
    { symbol: 'HD',    price: 365.20, change_pct: -0.45, sma_200: 342.00, volume: 4_200_000 },
    { symbol: 'MCD',   price: 298.40, change_pct: 0.18,  sma_200: 285.00, volume: 3_500_000 },
    { symbol: 'NKE',   price: 98.50,  change_pct: -1.85, sma_200: 108.00, volume: 8_200_000 },
    { symbol: 'SBUX',  price: 92.30,  change_pct: 0.52,  sma_200: 88.00,  volume: 6_800_000 },
    { symbol: 'LOW',   price: 245.60, change_pct: -0.32, sma_200: 232.00, volume: 3_800_000 },
    // Financials
    { symbol: 'JPM',   price: 198.40, change_pct: 0.72,  sma_200: 185.00, volume: 9_500_000 },
    { symbol: 'V',     price: 282.30, change_pct: 0.35,  sma_200: 268.00, volume: 6_200_000 },
    { symbol: 'MA',    price: 468.20, change_pct: 0.48,  sma_200: 442.00, volume: 3_100_000 },
    { symbol: 'BAC',   price: 37.85,  change_pct: 0.92,  sma_200: 34.50,  volume: 32_000_000 },
    { symbol: 'GS',    price: 412.50, change_pct: 1.15,  sma_200: 385.00, volume: 2_800_000 },
    { symbol: 'MS',    price: 95.20,  change_pct: 0.65,  sma_200: 88.00,  volume: 7_500_000 },
    { symbol: 'BLK',   price: 810.40, change_pct: 0.38,  sma_200: 775.00, volume: 800_000 },
    { symbol: 'AXP',   price: 225.80, change_pct: 0.55,  sma_200: 210.00, volume: 3_200_000 },
    // Healthcare
    { symbol: 'UNH',   price: 528.30, change_pct: -0.42, sma_200: 510.00, volume: 3_500_000 },
    { symbol: 'JNJ',   price: 158.40, change_pct: 0.22,  sma_200: 155.00, volume: 7_200_000 },
    { symbol: 'LLY',   price: 782.50, change_pct: 1.85,  sma_200: 680.00, volume: 4_500_000 },
    { symbol: 'ABBV',  price: 172.30, change_pct: 0.62,  sma_200: 162.00, volume: 6_800_000 },
    { symbol: 'PFE',   price: 28.50,  change_pct: -0.88, sma_200: 30.20,  volume: 28_000_000 },
    { symbol: 'MRK',   price: 125.80, change_pct: 0.35,  sma_200: 118.00, volume: 8_500_000 },
    { symbol: 'TMO',   price: 582.40, change_pct: 0.48,  sma_200: 555.00, volume: 1_500_000 },
    // Industrials
    { symbol: 'CAT',   price: 312.50, change_pct: 0.85,  sma_200: 290.00, volume: 2_800_000 },
    { symbol: 'BA',    price: 218.30, change_pct: -1.20, sma_200: 225.00, volume: 5_500_000 },
    { symbol: 'UPS',   price: 148.20, change_pct: -0.55, sma_200: 155.00, volume: 3_200_000 },
    { symbol: 'HON',   price: 208.40, change_pct: 0.32,  sma_200: 198.00, volume: 2_500_000 },
    { symbol: 'GE',    price: 165.80, change_pct: 1.10,  sma_200: 148.00, volume: 6_200_000 },
    { symbol: 'RTX',   price: 98.50,  change_pct: 0.42,  sma_200: 92.00,  volume: 4_800_000 },
    // Energy
    { symbol: 'XOM',   price: 108.20, change_pct: -0.35, sma_200: 105.00, volume: 14_000_000 },
    { symbol: 'CVX',   price: 158.40, change_pct: -0.18, sma_200: 152.00, volume: 7_500_000 },
    { symbol: 'COP',   price: 118.30, change_pct: 0.72,  sma_200: 112.00, volume: 5_200_000 },
    // Consumer Staples
    { symbol: 'PG',    price: 168.50, change_pct: 0.15,  sma_200: 162.00, volume: 6_800_000 },
    { symbol: 'KO',    price: 62.40,  change_pct: 0.28,  sma_200: 59.50,  volume: 12_000_000 },
    { symbol: 'PEP',   price: 172.30, change_pct: -0.12, sma_200: 168.00, volume: 4_500_000 },
    { symbol: 'COST',  price: 742.80, change_pct: 0.65,  sma_200: 700.00, volume: 2_200_000 },
    { symbol: 'WMT',   price: 172.50, change_pct: 0.38,  sma_200: 165.00, volume: 7_800_000 },
    // Index
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
    // Technology
    { symbol: 'AAPL',  market_cap_b: 2950, roic: 0.56, rev_cagr_5y: 0.08, fcf_positive: true, net_debt_to_ebitda: 0.5, pe_ratio: 29.5, pe_5y_avg: 26.0, sector: 'Technology' , current_price: 189.84 },
    { symbol: 'MSFT',  market_cap_b: 3120, roic: 0.38, rev_cagr_5y: 0.14, fcf_positive: true, net_debt_to_ebitda: 0.3, pe_ratio: 35.2, pe_5y_avg: 32.0, sector: 'Technology' , current_price: 420.21 },
    { symbol: 'NVDA',  market_cap_b: 2150, roic: 0.72, rev_cagr_5y: 0.52, fcf_positive: true, net_debt_to_ebitda: -0.8, pe_ratio: 65.0, pe_5y_avg: 55.0, sector: 'Technology' , current_price: 875.28 },
    { symbol: 'INTC',  market_cap_b: 180,  roic: 0.04, rev_cagr_5y: -0.02, fcf_positive: false, net_debt_to_ebitda: 3.5, pe_ratio: 42.0, pe_5y_avg: 14.0, sector: 'Technology' , current_price: 42.85 },
    { symbol: 'CSCO',  market_cap_b: 210,  roic: 0.28, rev_cagr_5y: 0.05, fcf_positive: true, net_debt_to_ebitda: 0.8, pe_ratio: 15.2, pe_5y_avg: 18.0, sector: 'Technology' , current_price: 50.22 },
    { symbol: 'ADBE',  market_cap_b: 245,  roic: 0.35, rev_cagr_5y: 0.12, fcf_positive: true, net_debt_to_ebitda: 0.2, pe_ratio: 42.5, pe_5y_avg: 50.0, sector: 'Technology' , current_price: 542.10 },
    { symbol: 'CRM',   market_cap_b: 265,  roic: 0.18, rev_cagr_5y: 0.18, fcf_positive: true, net_debt_to_ebitda: 0.5, pe_ratio: 38.0, pe_5y_avg: 52.0, sector: 'Technology' , current_price: 272.40 },
    // Communication Services
    { symbol: 'GOOGL', market_cap_b: 2180, roic: 0.28, rev_cagr_5y: 0.18, fcf_positive: true, net_debt_to_ebitda: -0.5, pe_ratio: 24.1, pe_5y_avg: 28.5, sector: 'Communication Services' , current_price: 175.98 },
    { symbol: 'META',  market_cap_b: 1280, roic: 0.32, rev_cagr_5y: 0.16, fcf_positive: true, net_debt_to_ebitda: -1.2, pe_ratio: 26.8, pe_5y_avg: 30.0, sector: 'Communication Services' , current_price: 505.75 },
    { symbol: 'DIS',   market_cap_b: 205,  roic: 0.08, rev_cagr_5y: 0.04, fcf_positive: true, net_debt_to_ebitda: 2.8, pe_ratio: 38.5, pe_5y_avg: 48.0, sector: 'Communication Services' , current_price: 112.30 },
    { symbol: 'CMCSA', market_cap_b: 170,  roic: 0.15, rev_cagr_5y: 0.03, fcf_positive: true, net_debt_to_ebitda: 2.5, pe_ratio: 11.2, pe_5y_avg: 14.0, sector: 'Communication Services' , current_price: 42.75 },
    { symbol: 'NFLX',  market_cap_b: 270,  roic: 0.22, rev_cagr_5y: 0.15, fcf_positive: true, net_debt_to_ebitda: 1.2, pe_ratio: 45.0, pe_5y_avg: 55.0, sector: 'Communication Services' , current_price: 628.50 },
    // Consumer Discretionary
    { symbol: 'AMZN',  market_cap_b: 1950, roic: 0.16, rev_cagr_5y: 0.22, fcf_positive: true, net_debt_to_ebitda: 0.8, pe_ratio: 58.3, pe_5y_avg: 72.0, sector: 'Consumer Discretionary' , current_price: 186.49 },
    { symbol: 'NKE',   market_cap_b: 150,  roic: 0.32, rev_cagr_5y: 0.06, fcf_positive: true, net_debt_to_ebitda: 1.2, pe_ratio: 28.5, pe_5y_avg: 38.0, sector: 'Consumer Discretionary' , current_price: 98.50 },
    { symbol: 'HD',    market_cap_b: 365,  roic: 0.45, rev_cagr_5y: 0.08, fcf_positive: true, net_debt_to_ebitda: 1.8, pe_ratio: 24.0, pe_5y_avg: 22.5, sector: 'Consumer Discretionary' , current_price: 365.20 },
    { symbol: 'LOW',   market_cap_b: 142,  roic: 0.42, rev_cagr_5y: 0.07, fcf_positive: true, net_debt_to_ebitda: 2.2, pe_ratio: 18.5, pe_5y_avg: 22.0, sector: 'Consumer Discretionary' , current_price: 245.60 },
    // Financials
    { symbol: 'JPM',   market_cap_b: 580,  roic: 0.18, rev_cagr_5y: 0.10, fcf_positive: true, net_debt_to_ebitda: 1.0, pe_ratio: 12.5, pe_5y_avg: 11.0, sector: 'Financials' , current_price: 198.40 },
    { symbol: 'BAC',   market_cap_b: 305,  roic: 0.12, rev_cagr_5y: 0.08, fcf_positive: true, net_debt_to_ebitda: 1.5, pe_ratio: 12.0, pe_5y_avg: 14.5, sector: 'Financials' , current_price: 37.85 },
    { symbol: 'GS',    market_cap_b: 140,  roic: 0.15, rev_cagr_5y: 0.12, fcf_positive: true, net_debt_to_ebitda: 0.8, pe_ratio: 14.8, pe_5y_avg: 18.0, sector: 'Financials' , current_price: 412.50 },
    // Healthcare
    { symbol: 'JNJ',   market_cap_b: 385,  roic: 0.22, rev_cagr_5y: 0.04, fcf_positive: true, net_debt_to_ebitda: 1.5, pe_ratio: 16.5, pe_5y_avg: 18.0, sector: 'Healthcare' , current_price: 158.40 },
    { symbol: 'PFE',   market_cap_b: 162,  roic: 0.08, rev_cagr_5y: -0.05, fcf_positive: true, net_debt_to_ebitda: 2.8, pe_ratio: 25.0, pe_5y_avg: 14.0, sector: 'Healthcare' , current_price: 28.50 },
    { symbol: 'ABBV',  market_cap_b: 305,  roic: 0.25, rev_cagr_5y: 0.12, fcf_positive: true, net_debt_to_ebitda: 2.2, pe_ratio: 14.2, pe_5y_avg: 18.0, sector: 'Healthcare' , current_price: 172.30 },
    { symbol: 'MRK',   market_cap_b: 320,  roic: 0.28, rev_cagr_5y: 0.10, fcf_positive: true, net_debt_to_ebitda: 1.2, pe_ratio: 16.0, pe_5y_avg: 19.5, sector: 'Healthcare' , current_price: 125.80 },
    // Energy
    { symbol: 'XOM',   market_cap_b: 460,  roic: 0.18, rev_cagr_5y: 0.08, fcf_positive: true, net_debt_to_ebitda: 0.5, pe_ratio: 13.5, pe_5y_avg: 16.0, sector: 'Energy' , current_price: 108.20 },
    { symbol: 'CVX',   market_cap_b: 300,  roic: 0.16, rev_cagr_5y: 0.06, fcf_positive: true, net_debt_to_ebitda: 0.8, pe_ratio: 12.8, pe_5y_avg: 15.5, sector: 'Energy' , current_price: 158.40 },
    { symbol: 'COP',   market_cap_b: 142,  roic: 0.20, rev_cagr_5y: 0.15, fcf_positive: true, net_debt_to_ebitda: 0.6, pe_ratio: 11.5, pe_5y_avg: 14.0, sector: 'Energy' , current_price: 118.30 },
    // Consumer Staples
    { symbol: 'PG',    market_cap_b: 400,  roic: 0.22, rev_cagr_5y: 0.04, fcf_positive: true, net_debt_to_ebitda: 1.8, pe_ratio: 26.0, pe_5y_avg: 25.0, sector: 'Consumer Staples' , current_price: 168.50 },
    { symbol: 'KO',    market_cap_b: 270,  roic: 0.28, rev_cagr_5y: 0.06, fcf_positive: true, net_debt_to_ebitda: 2.5, pe_ratio: 24.5, pe_5y_avg: 26.0, sector: 'Consumer Staples' , current_price: 62.40 },
  ];
}

// ── ETF Data ──

export function getMockEtfData(): EtfData[] {
  return [
    { symbol: 'VTI',  name: 'Vanguard Total Stock Market',     expense_ratio: 0.03, aum_b: 380, ytd_return: 0.12, div_yield: 0.013, current_price: 245.80 },
    { symbol: 'VOO',  name: 'Vanguard S&P 500',                expense_ratio: 0.03, aum_b: 420, ytd_return: 0.13, div_yield: 0.013, current_price: 510.25 },
    { symbol: 'QQQ',  name: 'Invesco QQQ Trust',                expense_ratio: 0.20, aum_b: 250, ytd_return: 0.18, div_yield: 0.005, current_price: 485.60 },
    { symbol: 'SCHD', name: 'Schwab US Dividend Equity',        expense_ratio: 0.06, aum_b: 55,  ytd_return: 0.06, div_yield: 0.035, current_price: 78.50 },
    { symbol: 'VYM',  name: 'Vanguard High Dividend Yield',     expense_ratio: 0.06, aum_b: 52,  ytd_return: 0.05, div_yield: 0.030, current_price: 118.20 },
    { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income',   expense_ratio: 0.35, aum_b: 32,  ytd_return: 0.04, div_yield: 0.075, current_price: 56.80 },
    { symbol: 'IEF',  name: 'iShares 7-10 Year Treasury',      expense_ratio: 0.15, aum_b: 28,  ytd_return: -0.02, div_yield: 0.038, current_price: 95.40 },
    { symbol: 'BND',  name: 'Vanguard Total Bond Market',       expense_ratio: 0.03, aum_b: 105, ytd_return: -0.01, div_yield: 0.035, current_price: 72.60 },
    { symbol: 'TLT',  name: 'iShares 20+ Year Treasury',       expense_ratio: 0.15, aum_b: 42,  ytd_return: -0.05, div_yield: 0.042, current_price: 88.30 },
    { symbol: 'GLD',  name: 'SPDR Gold Shares',                 expense_ratio: 0.40, aum_b: 62,  ytd_return: 0.08, div_yield: 0.0,   current_price: 195.50 },
    { symbol: 'IAU',  name: 'iShares Gold Trust',               expense_ratio: 0.25, aum_b: 28,  ytd_return: 0.08, div_yield: 0.0,   current_price: 44.20 },
    { symbol: 'VXUS', name: 'Vanguard Total International',     expense_ratio: 0.07, aum_b: 65,  ytd_return: 0.04, div_yield: 0.028, current_price: 58.90 },
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
    { symbol: 'MSFT',  date: format(addDays(new Date(), 35), 'yyyy-MM-dd') },
    { symbol: 'GOOGL', date: format(addDays(new Date(), 40), 'yyyy-MM-dd') },
    { symbol: 'TSLA',  date: format(addDays(new Date(), 3), 'yyyy-MM-dd') },
    { symbol: 'JPM',   date: format(addDays(new Date(), 18), 'yyyy-MM-dd') },
    { symbol: 'BA',    date: format(addDays(new Date(), 6), 'yyyy-MM-dd') },
  ];
}
