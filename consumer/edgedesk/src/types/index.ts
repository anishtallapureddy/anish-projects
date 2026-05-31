import { z } from 'zod';

export const TimeframeSchema = z.enum(['swing', 'momentum', 'positional']);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const StyleSchema = z.enum(['technical', 'earnings', 'breakout', 'contrarian']);
export type Style = z.infer<typeof StyleSchema>;

export const DirectionSchema = z.enum(['long', 'short', 'neutral']);
export type Direction = z.infer<typeof DirectionSchema>;

export const QuoteSchema = z.object({
  symbol: z.string(),
  name: z.string().nullable(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number().nullable(),
  marketCap: z.number().nullable(),
  fiftyTwoWeekLow: z.number().nullable(),
  fiftyTwoWeekHigh: z.number().nullable(),
  currency: z.string().nullable(),
  exchange: z.string().nullable(),
  asOf: z.string(),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const CandleSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().nullable(),
});
export type Candle = z.infer<typeof CandleSchema>;

export const IndicatorsSchema = z.object({
  rsi14: z.number().nullable(),
  macd: z
    .object({ macd: z.number(), signal: z.number(), histogram: z.number() })
    .nullable(),
  sma20: z.number().nullable(),
  sma50: z.number().nullable(),
  sma200: z.number().nullable(),
  atr14: z.number().nullable(),
  trend: z.enum(['up', 'down', 'sideways']),
  recentSwingHigh: z.number().nullable(),
  recentSwingLow: z.number().nullable(),
});
export type Indicators = z.infer<typeof IndicatorsSchema>;

export const NewsItemSchema = z.object({
  title: z.string(),
  publisher: z.string().nullable(),
  link: z.string(),
  publishedAt: z.string().nullable(),
});
export type NewsItem = z.infer<typeof NewsItemSchema>;

export const OptionsPlaySchema = z.object({
  label: z.string(), // "Primary" | "Aggressive"
  structure: z.string(), // e.g. "Long Call", "Bull Put Spread"
  strike: z.number(),
  longStrike: z.number().nullable(),
  shortStrike: z.number().nullable(),
  expiryHint: z.string(), // e.g. "30-45 DTE"
  rationale: z.string(),
  riskRating: z.enum(['low', 'medium', 'high']),
});
export type OptionsPlay = z.infer<typeof OptionsPlaySchema>;

export const TradeSetupSchema = z.object({
  symbol: z.string(),
  asOf: z.string(),
  timeframe: TimeframeSchema,
  style: StyleSchema,
  direction: DirectionSchema,
  conviction: z.number().min(1).max(10),
  entryLow: z.number(),
  entryHigh: z.number(),
  target1: z.number(),
  target2: z.number(),
  stop: z.number(),
  rr: z.number(),
  thesis: z.string(),
  riskNotes: z.string(),
  triggers: z.array(z.string()),
  optionsPlays: z.array(OptionsPlaySchema),
  degraded: z.boolean(),
  degradedReasons: z.array(z.string()),
});
export type TradeSetup = z.infer<typeof TradeSetupSchema>;

export const AnalyzeRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  timeframe: TimeframeSchema.default('swing'),
  style: StyleSchema.default('technical'),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const AnalyzeResponseSchema = z.object({
  quote: QuoteSchema,
  indicators: IndicatorsSchema,
  setup: TradeSetupSchema,
  news: z.array(NewsItemSchema),
  history: z.array(CandleSchema),
  llmProvider: z.string(),
});
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
