import type { Indicators, Quote, Style, Timeframe } from '@/types';

export type LlmContext = {
  quote: Quote;
  indicators: Indicators;
  timeframe: Timeframe;
  style: Style;
  direction: 'long' | 'short' | 'neutral';
  entryLow: number;
  entryHigh: number;
  target1: number;
  target2: number;
  stop: number;
  rr: number;
  recentNewsTitles: string[];
};

export type LlmThesis = {
  thesis: string;
  riskNotes: string;
  triggers: string[];
  conviction: number; // 1-10
};

export interface LlmProvider {
  name: string;
  generateThesis(ctx: LlmContext): Promise<LlmThesis>;
}
