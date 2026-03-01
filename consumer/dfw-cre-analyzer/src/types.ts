// ── DFW CRE Analyzer — Type Definitions ──

export type PropertyType = 'MULTI_FAMILY' | 'RETAIL' | 'OFFICE' | 'INDUSTRIAL' | 'LAND' | 'MIXED_USE' | 'OTHER';
export type InvestmentFlag = 'STRONG_BUY' | 'BUY' | 'WATCH' | 'PASS';
export type EnrichmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED' | 'SKIPPED';
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Property {
  id: string;
  zpid: string;
  mlsId?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  propertyType: PropertyType;
  listingPrice: number;
  sqft?: number;
  yearBuilt?: number;
  lotSize?: number;
  bedsCount?: number;
  bathsCount?: number;
  description?: string;

  // Valuation
  zestimateValue?: number;
  zestimateLow?: number;
  zestimateHigh?: number;
  rentEstimate?: number;
  pricePerSqft?: number;
  compAvgPpsf?: number;
  zestimateConfidence?: string;

  // Scoring
  underpricingScore?: number;
  compGapScore?: number;
  zestimateGapScore?: number;
  rentYieldScore?: number;
  investmentFlag?: InvestmentFlag;
  scoreVersion: number;

  // Location
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;

  // Pipeline metadata
  listingStatus: string;
  daysOnMarket?: number;
  listedDate?: string;
  enrichmentStatus: EnrichmentStatus;
  enrichmentError?: string;
  lastRefreshed: string;
  createdAt: string;
  updatedAt: string;

  // Relations (populated on detail)
  comps?: Comp[];
  priceHistory?: PriceHistory[];
}

export interface Comp {
  id: string;
  propertyId: string;
  zpid?: string;
  address: string;
  soldPrice: number;
  soldDate: string;
  sqft?: number;
  pricePerSqft?: number;
  distanceMiles?: number;
}

export interface PriceHistory {
  id: string;
  propertyId: string;
  date: string;
  price: number;
  event: 'LISTED' | 'PRICE_REDUCTION' | 'PRICE_INCREASE' | 'SOLD' | 'TAX_ASSESSMENT' | 'RENT_ESTIMATE';
  source: string;
}

export interface ScoreResult {
  total: number;
  compGap: number;
  zestimateGap: number;
  rentYield: number;
  confidence: Confidence;
}

export interface MarketSummary {
  totalProperties: number;
  avgListingPrice: number;
  avgPricePerSqft: number;
  avgUnderpricingScore: number;
  flagCounts: Record<InvestmentFlag, number>;
  typeCounts: Record<string, number>;
  topZips: { zipCode: string; count: number; avgScore: number }[];
}

export interface PropertyFilters {
  zipCodes?: string[];
  propertyTypes?: PropertyType[];
  investmentFlags?: InvestmentFlag[];
  priceMin?: number;
  priceMax?: number;
  sqftMin?: number;
  underpricingMin?: number;
  daysOnMarketMax?: number;
  sortBy?: 'score' | 'price' | 'pricePerSqft' | 'daysOnMarket' | 'listedDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GeoJsonFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    address: string;
    listingPrice: number;
    underpricingScore: number;
    investmentFlag: InvestmentFlag;
    propertyType: PropertyType;
  };
}

export interface GeoJsonCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface QuotaStats {
  today: { total: number; byEndpoint: Record<string, number> };
  dailyLimit: number;
  remaining: number;
  last7Days: { date: string; total: number }[];
}
