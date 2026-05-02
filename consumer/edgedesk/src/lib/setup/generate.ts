import {
  AnalyzeResponseSchema,
  type AnalyzeRequest,
  type AnalyzeResponse,
  type Direction,
  type Indicators,
  type OptionsPlay,
  type Quote,
  type Style,
  type Timeframe,
  type TradeSetup,
} from '@/types';
import { computeIndicators } from '@/lib/indicators/compute';
import { getHistory, getNews, getQuote } from '@/lib/market/yahoo';
import { getLlmProvider } from '@/lib/llm';

function round(n: number, dp = 2): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}

function pickDirection(style: Style, ind: Indicators): Direction {
  if (style === 'contrarian') {
    if (ind.rsi14 != null && ind.rsi14 < 30) return 'long';
    if (ind.rsi14 != null && ind.rsi14 > 70) return 'short';
  }
  if (ind.trend === 'up') return 'long';
  if (ind.trend === 'down') return 'short';
  // sideways: bias by MACD histogram
  if (ind.macd && ind.macd.histogram > 0) return 'long';
  if (ind.macd && ind.macd.histogram < 0) return 'short';
  return 'neutral';
}

function tfMultipliers(tf: Timeframe): {
  entryAtr: number;
  stopAtr: number;
  t1Atr: number;
  t2Atr: number;
  expiry: string;
} {
  switch (tf) {
    case 'momentum':
      return { entryAtr: 0.25, stopAtr: 1.0, t1Atr: 1.5, t2Atr: 2.5, expiry: '14-30 DTE' };
    case 'positional':
      return { entryAtr: 0.5, stopAtr: 2.0, t1Atr: 3.5, t2Atr: 6.0, expiry: '60-90 DTE' };
    case 'swing':
    default:
      return { entryAtr: 0.35, stopAtr: 1.5, t1Atr: 2.5, t2Atr: 4.0, expiry: '30-45 DTE' };
  }
}

function buildLevels(
  quote: Quote,
  ind: Indicators,
  direction: Direction,
  tf: Timeframe,
): {
  entryLow: number;
  entryHigh: number;
  target1: number;
  target2: number;
  stop: number;
  rr: number;
  degraded: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const price = quote.price;
  const atr = ind.atr14 && ind.atr14 > 0 ? ind.atr14 : Math.max(price * 0.02, 0.5);
  if (!ind.atr14) reasons.push('ATR unavailable; using 2% of price as fallback.');

  const m = tfMultipliers(tf);
  const dir = direction === 'short' ? -1 : 1; // neutral treated as long bias for level math

  const entryMid = price;
  const entryLow = round(entryMid - (m.entryAtr * atr) / 2);
  const entryHigh = round(entryMid + (m.entryAtr * atr) / 2);

  // Stop = the TIGHTER (closer to entry) of ATR-based and recent swing structure.
  // Long: max of (entryLow - stopAtr*ATR, recentSwingLow); Short: min of analogous.
  const stopRaw =
    dir > 0
      ? Math.max(
          entryLow - m.stopAtr * atr,
          ind.recentSwingLow ?? Number.NEGATIVE_INFINITY,
        )
      : Math.min(
          entryHigh + m.stopAtr * atr,
          ind.recentSwingHigh ?? Number.POSITIVE_INFINITY,
        );
  const stop = round(stopRaw);

  const t1 = round(dir > 0 ? entryHigh + m.t1Atr * atr : entryLow - m.t1Atr * atr);
  const t2 = round(dir > 0 ? entryHigh + m.t2Atr * atr : entryLow - m.t2Atr * atr);

  // Sanity: ensure correct sides
  let degraded = false;
  if (dir > 0) {
    if (!(stop < entryLow && t1 > entryHigh && t2 > t1)) {
      degraded = true;
      reasons.push('Level sanity check failed; results may be unreliable.');
    }
  } else if (dir < 0) {
    if (!(stop > entryHigh && t1 < entryLow && t2 < t1)) {
      degraded = true;
      reasons.push('Level sanity check failed; results may be unreliable.');
    }
  }

  const risk = Math.abs(entryMid - stop);
  const reward = Math.abs(t1 - entryMid);
  const rr = round(risk > 0 ? reward / risk : 0, 2);

  return { entryLow, entryHigh, target1: t1, target2: t2, stop, rr, degraded, reasons };
}

function buildOptionsPlays(
  quote: Quote,
  ind: Indicators,
  direction: Direction,
  expiry: string,
): OptionsPlay[] {
  const price = quote.price;
  const atr = ind.atr14 && ind.atr14 > 0 ? ind.atr14 : price * 0.02;
  const round05 = (n: number) => round(Math.round(n * 2) / 2, 2);

  if (direction === 'short') {
    return [
      {
        label: 'Primary',
        structure: 'Long Put',
        strike: round05(price),
        longStrike: round05(price),
        shortStrike: null,
        expiryHint: expiry,
        rationale: 'ATM put aligns with bearish bias; cleanest delta exposure.',
        riskRating: 'medium',
      },
      {
        label: 'Aggressive',
        structure: 'Bear Call Spread',
        strike: round05(price + atr),
        longStrike: round05(price + 2 * atr),
        shortStrike: round05(price + atr),
        expiryHint: expiry,
        rationale: 'Short call ~1 ATR OTM, long call ~2 ATR OTM for defined-risk credit.',
        riskRating: 'high',
      },
    ];
  }

  // Long or neutral defaults to bullish structures
  return [
    {
      label: 'Primary',
      structure: 'Long Call',
      strike: round05(price),
      longStrike: round05(price),
      shortStrike: null,
      expiryHint: expiry,
      rationale: 'ATM call aligns with bullish bias; cleanest delta exposure.',
      riskRating: 'medium',
    },
    {
      label: 'Aggressive',
      structure: 'Bull Put Spread',
      strike: round05(price - atr),
      longStrike: round05(price - 2 * atr),
      shortStrike: round05(price - atr),
      expiryHint: expiry,
      rationale: 'Short put ~1 ATR OTM, long put ~2 ATR OTM for defined-risk credit.',
      riskRating: 'high',
    },
  ];
}

export async function generateAnalysis(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const symbol = req.symbol.toUpperCase();
  const [quote, history, news] = await Promise.all([
    getQuote(symbol),
    getHistory(symbol, 420),
    getNews(symbol, 6),
  ]);

  const indicators = computeIndicators(history);
  const direction = pickDirection(req.style, indicators);
  const m = tfMultipliers(req.timeframe);
  const lv = buildLevels(quote, indicators, direction, req.timeframe);

  const llm = getLlmProvider();
  const llmOut = await llm.generateThesis({
    quote,
    indicators,
    timeframe: req.timeframe,
    style: req.style,
    direction,
    entryLow: lv.entryLow,
    entryHigh: lv.entryHigh,
    target1: lv.target1,
    target2: lv.target2,
    stop: lv.stop,
    rr: lv.rr,
    recentNewsTitles: news.map((n) => n.title),
  });

  const optionsPlays = buildOptionsPlays(quote, indicators, direction, m.expiry);

  const setup: TradeSetup = {
    symbol,
    asOf: new Date().toISOString(),
    timeframe: req.timeframe,
    style: req.style,
    direction,
    conviction: Math.max(1, Math.min(10, Math.round(llmOut.conviction))),
    entryLow: lv.entryLow,
    entryHigh: lv.entryHigh,
    target1: lv.target1,
    target2: lv.target2,
    stop: lv.stop,
    rr: lv.rr,
    thesis: llmOut.thesis,
    riskNotes: llmOut.riskNotes,
    triggers: llmOut.triggers,
    optionsPlays,
    degraded: lv.degraded,
    degradedReasons: lv.reasons,
  };

  const response: AnalyzeResponse = {
    quote,
    indicators,
    setup,
    news,
    history: history.slice(-90),
    llmProvider: llm.name,
  };
  return AnalyzeResponseSchema.parse(response);
}
