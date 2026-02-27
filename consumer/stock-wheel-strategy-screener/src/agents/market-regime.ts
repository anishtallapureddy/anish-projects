import { MarketRegime, StockQuote, AppConfig } from '../types';

export interface MarketRegimeInput {
  spyQuote: StockQuote;
  vix: number;
}

export function runMarketRegimeAgent(input: MarketRegimeInput, _config: AppConfig): MarketRegime {
  const { spyQuote, vix } = input;
  const aboveSma = spyQuote.price > spyQuote.sma_200;
  const smaGap = (spyQuote.price - spyQuote.sma_200) / spyQuote.sma_200;
  const rising = spyQuote.change_pct > 0;

  let regime: MarketRegime['regime'];
  let risk_posture: MarketRegime['risk_posture'];
  let notes: string;

  if (aboveSma && vix < 20) {
    regime = 'Bull';
    risk_posture = rising ? 'Risk-On' : 'Balanced';
    notes = `SPY at $${spyQuote.price} is ${(smaGap * 100).toFixed(1)}% above 200DMA ($${spyQuote.sma_200}). VIX at ${vix} indicates moderate volatility. Trend is constructive.`;
  } else if (!aboveSma && vix > 25) {
    regime = 'Bear';
    risk_posture = 'Risk-Off';
    notes = `SPY at $${spyQuote.price} is ${(Math.abs(smaGap) * 100).toFixed(1)}% below 200DMA ($${spyQuote.sma_200}). VIX elevated at ${vix}. Defensive posture recommended.`;
  } else {
    regime = 'Neutral';
    risk_posture = 'Balanced';
    const trend = aboveSma ? 'above' : 'below';
    notes = `SPY at $${spyQuote.price} is ${trend} 200DMA ($${spyQuote.sma_200}). VIX at ${vix}. Mixed signals — maintaining balanced posture.`;
  }

  return { regime, risk_posture, notes };
}
