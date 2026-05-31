import { ATR, EMA, MACD, RSI, SMA } from 'technicalindicators';
import type { Candle, Indicators } from '@/types';

function last<T>(arr: T[]): T | undefined {
  return arr.length ? arr[arr.length - 1] : undefined;
}

function classifyTrend(
  closes: number[],
  sma50: number | null,
  sma200: number | null,
): Indicators['trend'] {
  if (closes.length < 20) return 'sideways';
  const recent = closes.slice(-20);
  const slope = recent[recent.length - 1] - recent[0];
  const pct = slope / recent[0];
  if (sma50 && sma200 && sma50 > sma200 * 1.02 && pct > 0.01) return 'up';
  if (sma50 && sma200 && sma50 < sma200 * 0.98 && pct < -0.01) return 'down';
  if (pct > 0.04) return 'up';
  if (pct < -0.04) return 'down';
  return 'sideways';
}

export function computeIndicators(candles: Candle[]): Indicators {
  const closes = candles.map((c) => c.close);
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  const rsi = RSI.calculate({ values: closes, period: 14 });
  const macdSeries = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  const sma20 = SMA.calculate({ values: closes, period: 20 });
  const sma50 = SMA.calculate({ values: closes, period: 50 });
  const sma200 = SMA.calculate({ values: closes, period: 200 });
  // EMA reserved for future use
  void EMA;
  const atr = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });

  const lastMacd = last(macdSeries);
  const lookback = candles.slice(-20);
  const recentSwingHigh = lookback.length ? Math.max(...lookback.map((c) => c.high)) : null;
  const recentSwingLow = lookback.length ? Math.min(...lookback.map((c) => c.low)) : null;

  const sma50v = last(sma50) ?? null;
  const sma200v = last(sma200) ?? null;

  return {
    rsi14: last(rsi) ?? null,
    macd:
      lastMacd && typeof lastMacd.MACD === 'number' && typeof lastMacd.signal === 'number'
        ? {
            macd: lastMacd.MACD,
            signal: lastMacd.signal,
            histogram: lastMacd.histogram ?? lastMacd.MACD - lastMacd.signal,
          }
        : null,
    sma20: last(sma20) ?? null,
    sma50: sma50v,
    sma200: sma200v,
    atr14: last(atr) ?? null,
    trend: classifyTrend(closes, sma50v, sma200v),
    recentSwingHigh,
    recentSwingLow,
  };
}
