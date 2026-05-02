import type { LlmContext, LlmProvider, LlmThesis } from './types';

export const mockProvider: LlmProvider = {
  name: 'mock',
  async generateThesis(ctx: LlmContext): Promise<LlmThesis> {
    const { quote, indicators, direction, entryLow, entryHigh, target1, stop, rr, style } = ctx;
    const trend = indicators.trend;
    const rsi = indicators.rsi14 != null ? indicators.rsi14.toFixed(1) : 'n/a';
    const macdH =
      indicators.macd != null ? indicators.macd.histogram.toFixed(3) : 'n/a';

    const directionWord = direction === 'long' ? 'bullish' : direction === 'short' ? 'bearish' : 'neutral';
    const styleWord =
      style === 'breakout'
        ? 'breakout continuation'
        : style === 'earnings'
        ? 'earnings catalyst'
        : style === 'contrarian'
        ? 'mean-reversion'
        : 'technical trend-following';

    const thesis =
      `${quote.symbol} is in a ${trend} regime trading near $${quote.price.toFixed(2)}. ` +
      `Setup is a ${directionWord} ${styleWord} idea: enter $${entryLow.toFixed(2)}–$${entryHigh.toFixed(2)}, ` +
      `target $${target1.toFixed(2)}, stop $${stop.toFixed(2)} for ~${rr.toFixed(2)}R. ` +
      `RSI(14)=${rsi}, MACD hist=${macdH}. ` +
      `Trade plan is grounded in ATR-based risk and recent swing structure rather than narrative.`;

    const riskNotes =
      `Risk-on if price loses ${stop.toFixed(2)}; cut quickly. ` +
      `Beware gap risk around earnings and macro prints. Position size to 0.5–1R per idea.`;

    const triggers = [
      `Daily close ${direction === 'short' ? 'below' : 'above'} ${entryHigh.toFixed(2)}`,
      `Volume > 1.5× 20-day average on entry bar`,
      `Higher-timeframe (weekly) trend remains ${trend}`,
    ];

    // Deterministic conviction from indicator alignment
    let conviction = 5;
    if (trend !== 'sideways') conviction += 1;
    if (indicators.rsi14 != null) {
      if (direction === 'long' && indicators.rsi14 > 50 && indicators.rsi14 < 70) conviction += 1;
      if (direction === 'short' && indicators.rsi14 < 50 && indicators.rsi14 > 30) conviction += 1;
    }
    if (
      indicators.macd &&
      ((direction === 'long' && indicators.macd.histogram > 0) ||
        (direction === 'short' && indicators.macd.histogram < 0))
    ) {
      conviction += 1;
    }
    if (indicators.sma50 && indicators.sma200) {
      if (direction === 'long' && indicators.sma50 > indicators.sma200) conviction += 1;
      if (direction === 'short' && indicators.sma50 < indicators.sma200) conviction += 1;
    }
    conviction = Math.max(1, Math.min(10, conviction));

    return { thesis, riskNotes, triggers, conviction };
  },
};
