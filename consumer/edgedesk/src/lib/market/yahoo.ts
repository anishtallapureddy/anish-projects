import YahooFinance from 'yahoo-finance2';
import type { Candle, NewsItem, Quote } from '@/types';

const yahooFinance = new YahooFinance();

type YfQuote = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  longName?: string;
  shortName?: string;
  fullExchangeName?: string;
  exchange?: string;
  currency?: string;
};

// Silence the yahoo-finance2 survey notice in logs
(yahooFinance as any).suppressNotices?.(['yahooSurvey']);

const SYMBOL_RE = /^[A-Z][A-Z0-9.\-]{0,9}$/;

export function normalizeSymbol(input: string): string {
  return (input || '').trim().toUpperCase();
}

export function isValidSymbol(symbol: string): boolean {
  return SYMBOL_RE.test(symbol);
}

type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, { value, expires: Date.now() + ttlMs });
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 250): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const wait = baseMs * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

export async function getQuote(symbolRaw: string): Promise<Quote> {
  const symbol = normalizeSymbol(symbolRaw);
  if (!isValidSymbol(symbol)) throw new Error(`Invalid symbol: ${symbolRaw}`);
  const key = `quote:${symbol}`;
  const cached = cacheGet<Quote>(key);
  if (cached) return cached;

  const q = (await withRetry(() => yahooFinance.quote(symbol))) as YfQuote | undefined;
  if (!q || typeof q.regularMarketPrice !== 'number') {
    throw new Error(`No quote available for ${symbol}`);
  }
  const quote: Quote = {
    symbol: q.symbol ?? symbol,
    name: q.longName ?? q.shortName ?? null,
    price: q.regularMarketPrice,
    change: q.regularMarketChange ?? 0,
    changePercent: q.regularMarketChangePercent ?? 0,
    volume: q.regularMarketVolume ?? null,
    marketCap: q.marketCap ?? null,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
    currency: q.currency ?? null,
    exchange: q.fullExchangeName ?? q.exchange ?? null,
    asOf: new Date().toISOString(),
  };
  cacheSet(key, quote, 30_000);
  return quote;
}

type YfHistRow = {
  date: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export async function getHistory(symbolRaw: string, days = 180): Promise<Candle[]> {
  const symbol = normalizeSymbol(symbolRaw);
  if (!isValidSymbol(symbol)) throw new Error(`Invalid symbol: ${symbolRaw}`);
  const key = `hist:${symbol}:${days}`;
  const cached = cacheGet<Candle[]>(key);
  if (cached) return cached;

  const period2 = new Date();
  const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  // v3: chart() returns { quotes: [...] }
  const res = (await withRetry(() =>
    yahooFinance.chart(symbol, { period1, period2, interval: '1d' }),
  )) as { quotes?: YfHistRow[] } | undefined;
  const rows = res?.quotes ?? [];
  const candles: Candle[] = rows
    .filter(
      (r): r is YfHistRow & { open: number; high: number; low: number; close: number } =>
        typeof r.close === 'number' &&
        typeof r.open === 'number' &&
        typeof r.high === 'number' &&
        typeof r.low === 'number',
    )
    .map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: r.volume ?? null,
    }));
  cacheSet(key, candles, 5 * 60_000);
  return candles;
}

export async function getNews(symbolRaw: string, limit = 6): Promise<NewsItem[]> {
  const symbol = normalizeSymbol(symbolRaw);
  if (!isValidSymbol(symbol)) return [];
  const key = `news:${symbol}`;
  const cached = cacheGet<NewsItem[]>(key);
  if (cached) return cached;
  try {
    const res = await withRetry(() =>
      yahooFinance.search(symbol, { newsCount: limit, quotesCount: 0 }),
    );
    const items: NewsItem[] = ((res as any).news ?? [])
      .slice(0, limit)
      .map((n: any) => ({
        title: n.title,
        publisher: n.publisher ?? null,
        link: n.link,
        publishedAt: n.providerPublishTime
          ? new Date(n.providerPublishTime * 1000).toISOString()
          : null,
      }));
    cacheSet(key, items, 5 * 60_000);
    return items;
  } catch {
    return [];
  }
}

// Options chain integration is intentionally omitted from this MVP.
// Strikes are derived deterministically from spot + ATR in setup/generate.ts
// to avoid coupling to live IV/Greeks data and to keep network calls bounded.
