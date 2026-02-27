// ── Market Regime ──

export type Regime = 'Bull' | 'Neutral' | 'Bear';
export type RiskPosture = 'Risk-On' | 'Balanced' | 'Risk-Off';

export interface MarketRegime {
  regime: Regime;
  risk_posture: RiskPosture;
  notes: string;
}

// ── Opportunity ──

export type OpportunityCategory = 'CSP' | 'CC' | 'VALUE' | 'ETF';

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  symbol: string;
  score: number;
  rationale: string;
  risk_flags: string[];
  details?: Record<string, unknown>;
}

// ── Order Draft ──

export type OrderType = 'CSP' | 'CC' | 'BUY_STOCK' | 'BUY_ETF' | 'REBALANCE';
export type PriceType = 'LIMIT' | 'MARKET';

export interface OptionLeg {
  put_call: 'PUT' | 'CALL';
  strike: number;
  expiry: string; // YYYY-MM-DD
}

export interface OrderDraft {
  order_id: string;
  type: OrderType;
  symbol: string;
  quantity: number;
  option: OptionLeg | null;
  price_type: PriceType;
  limit_price: number | null;
  rationale: string;
  risk_flags: string[];
  requires_approval: true;
}

// ── Daily Report ──

export interface BlockedOpportunity {
  opportunity: Opportunity;
  reason: string;
}

export interface DailyReport {
  date: string; // YYYY-MM-DD
  timezone: string;
  market_regime: MarketRegime;
  approved_opportunities: Opportunity[];
  blocked_opportunities: BlockedOpportunity[];
  order_drafts: OrderDraft[];
  fundamental_profiles?: FundamentalProfile[];
}

// ── Feedback ──

export type FeedbackActionType = 'APPROVE' | 'REJECT' | 'SET_RULE' | 'ADD_TO_LIST' | 'REMOVE_FROM_LIST' | 'NOTE';

export interface FeedbackAction {
  type: FeedbackActionType;
  payload?: Record<string, unknown>;
}

export interface Feedback {
  date: string;
  actions: FeedbackAction[];
}

// ── Config types ──

export interface WheelStrategyConfig {
  dte_days: [number, number];
  csp_delta_range: [number, number];
  cc_delta_range: [number, number];
  min_csp_premium_pct_of_strike: number;
  min_cc_premium_pct_of_strike: number;
  earnings_blackout_days: number;
  allow_weeklies: boolean;
}

export interface ValueStrategyConfig {
  min_market_cap_b: number;
  min_roic: number;
  min_rev_cagr_5y: number;
  require_positive_fcf: boolean;
  valuation_discount_min: number;
  max_net_debt_to_ebitda: number;
}

export interface EtfStrategyConfig {
  max_expense_ratio: number;
  min_aum_b: number;
  rebalance_threshold_pct: number;
}

export interface StrategyRules {
  wheel: WheelStrategyConfig;
  value: ValueStrategyConfig;
  etf: EtfStrategyConfig;
}

export interface WheelRiskLimits {
  disable_new_csp_when_regime: Regime[];
  tighten_delta_when_regime: Record<string, [number, number]>;
}

export interface PortfolioRiskLimits {
  max_position_pct: number;
  max_sector_pct: number;
  min_cash_reserve_pct: number;
  max_new_trades_per_day: number;
}

export interface SafetyRules {
  avoid_earnings: boolean;
  avoid_high_iv_events: boolean;
  never_trade_list: string[];
}

export interface RiskLimits {
  portfolio: PortfolioRiskLimits;
  wheel: WheelRiskLimits;
  safety: SafetyRules;
}

export interface UniverseConfig {
  universes: {
    wheel_universe: string[];
    value_universe?: string[];
    etf_universe: string[];
  };
  sectors: Record<string, string>;
}

export interface UserPreferences {
  allocation_targets: {
    wheel_income: number;
    long_term_value: number;
    etf_core: number;
  };
  watchlists: {
    wheel_universe: string[];
    value_candidates: string[];
    etf_core: string[];
  };
  style: {
    wheel_mode: 'conservative' | 'balanced' | 'aggressive';
    value_mode: 'quality' | 'deep_value';
    email_tone: 'crisp' | 'detailed';
  };
}

export interface AppConfig {
  strategyRules: StrategyRules;
  riskLimits: RiskLimits;
  universe: UniverseConfig;
  userPreferences: UserPreferences;
}

// ── Market Data types (for agents) ──

export interface StockQuote {
  symbol: string;
  price: number;
  change_pct: number;
  sma_200: number;
  volume: number;
}

export interface OptionContract {
  symbol: string;
  put_call: 'PUT' | 'CALL';
  strike: number;
  expiry: string;
  dte: number;
  delta: number;
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  volume: number;
  open_interest: number;
}

export interface Fundamentals {
  symbol: string;
  market_cap_b: number;
  roic: number;
  rev_cagr_5y: number;
  fcf_positive: boolean;
  net_debt_to_ebitda: number;
  pe_ratio: number;
  pe_5y_avg: number;
  sector: string;
}

export interface EtfData {
  symbol: string;
  name: string;
  expense_ratio: number;
  aum_b: number;
  ytd_return: number;
  div_yield: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  cost_basis: number;
  current_price: number;
  market_value: number;
  sector: string;
  type: 'stock' | 'etf';
}

export interface PortfolioSnapshot {
  total_value: number;
  cash: number;
  positions: PortfolioPosition[];
  trades_today: number;
}

export interface EarningsEvent {
  symbol: string;
  date: string; // YYYY-MM-DD
}

// ── Fundamental Profile (rich quality analysis) ──

export interface FundamentalProfile {
  symbol: string;
  sector: string;
  market_cap_b: number;

  // Scores (0-100 each)
  quality_score: number;       // composite overall
  profitability_score: number;
  growth_score: number;
  valuation_score: number;
  balance_sheet_score: number;
  dividend_score: number;

  // Raw metrics
  roe: number;                 // return on equity
  roa: number;                 // return on assets
  profit_margin: number;       // net profit margin
  gross_margin: number;        // gross margin
  operating_margin: number;    // operating margin
  revenue_growth: number;      // YoY revenue growth
  earnings_growth: number;     // YoY earnings growth
  pe_ratio: number;            // trailing P/E
  forward_pe: number;          // forward P/E
  peg_ratio: number;           // P/E to growth
  price_to_book: number;       // P/B ratio
  debt_to_equity: number;      // total debt / equity
  current_ratio: number;       // current assets / current liabilities
  free_cash_flow_b: number;    // FCF in billions
  dividend_yield: number;      // trailing yield %
  beta: number;                // market beta

  // Analyst consensus
  analyst_rating: string;      // buy/hold/sell
  analyst_target: number;      // mean price target
  analyst_upside: number;      // % upside to target
  analyst_count: number;       // number of analysts

  // Grade (A/B/C/D/F)
  grade: string;
}
