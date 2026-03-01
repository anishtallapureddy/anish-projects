import db from './database';
import { Property, Comp, PriceHistory, PropertyFilters, PaginatedResponse, MarketSummary, InvestmentFlag, QuotaStats } from '../types';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(8).toString('hex');

// ── Row → Property mapper ──
function rowToProperty(row: any): Property {
  return {
    id: row.id,
    zpid: row.zpid,
    mlsId: row.mls_id,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    lat: row.lat,
    lng: row.lng,
    propertyType: row.property_type,
    listingPrice: row.listing_price,
    sqft: row.sqft,
    yearBuilt: row.year_built,
    lotSize: row.lot_size,
    bedsCount: row.beds_count,
    bathsCount: row.baths_count,
    description: row.description,
    zestimateValue: row.zestimate_value,
    zestimateLow: row.zestimate_low,
    zestimateHigh: row.zestimate_high,
    rentEstimate: row.rent_estimate,
    pricePerSqft: row.price_per_sqft,
    compAvgPpsf: row.comp_avg_ppsf,
    zestimateConfidence: row.zestimate_confidence,
    underpricingScore: row.underpricing_score,
    compGapScore: row.comp_gap_score,
    zestimateGapScore: row.zestimate_gap_score,
    rentYieldScore: row.rent_yield_score,
    investmentFlag: row.investment_flag,
    scoreVersion: row.score_version,
    walkScore: row.walk_score,
    transitScore: row.transit_score,
    bikeScore: row.bike_score,
    listingStatus: row.listing_status,
    daysOnMarket: row.days_on_market,
    listedDate: row.listed_date,
    enrichmentStatus: row.enrichment_status,
    enrichmentError: row.enrichment_error,
    lastRefreshed: row.last_refreshed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToComp(row: any): Comp {
  return {
    id: row.id, propertyId: row.property_id, zpid: row.zpid,
    address: row.address, soldPrice: row.sold_price, soldDate: row.sold_date,
    sqft: row.sqft, pricePerSqft: row.price_per_sqft, distanceMiles: row.distance_miles,
  };
}

function rowToPriceHistory(row: any): PriceHistory {
  return {
    id: row.id, propertyId: row.property_id,
    date: row.date, price: row.price, event: row.event, source: row.source,
  };
}

// ── Property queries ──
export function upsertProperty(p: Partial<Property> & { zpid: string }): string {
  const id = p.id || uid();
  const existing = db.prepare('SELECT id FROM properties WHERE zpid = ?').get(p.zpid) as any;
  if (existing) {
    db.prepare(`UPDATE properties SET
      address=COALESCE(?,address), city=COALESCE(?,city), zip_code=COALESCE(?,zip_code),
      lat=COALESCE(?,lat), lng=COALESCE(?,lng), property_type=COALESCE(?,property_type),
      listing_price=COALESCE(?,listing_price), sqft=COALESCE(?,sqft), year_built=COALESCE(?,year_built),
      lot_size=COALESCE(?,lot_size), beds_count=COALESCE(?,beds_count), baths_count=COALESCE(?,baths_count),
      description=COALESCE(?,description), listing_status=COALESCE(?,listing_status),
      days_on_market=COALESCE(?,days_on_market), listed_date=COALESCE(?,listed_date),
      zestimate_value=COALESCE(?,zestimate_value), zestimate_low=COALESCE(?,zestimate_low),
      zestimate_high=COALESCE(?,zestimate_high), rent_estimate=COALESCE(?,rent_estimate),
      price_per_sqft=COALESCE(?,price_per_sqft), comp_avg_ppsf=COALESCE(?,comp_avg_ppsf),
      zestimate_confidence=COALESCE(?,zestimate_confidence),
      underpricing_score=COALESCE(?,underpricing_score), comp_gap_score=COALESCE(?,comp_gap_score),
      zestimate_gap_score=COALESCE(?,zestimate_gap_score), rent_yield_score=COALESCE(?,rent_yield_score),
      investment_flag=COALESCE(?,investment_flag), score_version=COALESCE(?,score_version),
      walk_score=COALESCE(?,walk_score), transit_score=COALESCE(?,transit_score), bike_score=COALESCE(?,bike_score),
      enrichment_status=COALESCE(?,enrichment_status), enrichment_error=COALESCE(?,enrichment_error),
      last_refreshed=datetime('now'), updated_at=datetime('now')
    WHERE zpid=?`).run(
      p.address, p.city, p.zipCode, p.lat, p.lng, p.propertyType,
      p.listingPrice, p.sqft, p.yearBuilt, p.lotSize, p.bedsCount, p.bathsCount,
      p.description, p.listingStatus, p.daysOnMarket, p.listedDate,
      p.zestimateValue, p.zestimateLow, p.zestimateHigh, p.rentEstimate,
      p.pricePerSqft, p.compAvgPpsf, p.zestimateConfidence,
      p.underpricingScore, p.compGapScore, p.zestimateGapScore, p.rentYieldScore,
      p.investmentFlag, p.scoreVersion,
      p.walkScore, p.transitScore, p.bikeScore,
      p.enrichmentStatus, p.enrichmentError,
      p.zpid
    );
    return existing.id;
  } else {
    db.prepare(`INSERT INTO properties (
      id, zpid, mls_id, address, city, state, zip_code, lat, lng, property_type,
      listing_price, sqft, year_built, lot_size, beds_count, baths_count, description,
      zestimate_value, zestimate_low, zestimate_high, rent_estimate,
      price_per_sqft, comp_avg_ppsf, zestimate_confidence,
      underpricing_score, comp_gap_score, zestimate_gap_score, rent_yield_score,
      investment_flag, score_version,
      walk_score, transit_score, bike_score,
      listing_status, days_on_market, listed_date,
      enrichment_status, enrichment_error
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, p.zpid, p.mlsId || null, p.address, p.city, p.state || 'TX', p.zipCode,
      p.lat, p.lng, p.propertyType, p.listingPrice,
      p.sqft || null, p.yearBuilt || null, p.lotSize || null, p.bedsCount || null, p.bathsCount || null,
      p.description || null,
      p.zestimateValue || null, p.zestimateLow || null, p.zestimateHigh || null, p.rentEstimate || null,
      p.pricePerSqft || null, p.compAvgPpsf || null, p.zestimateConfidence || null,
      p.underpricingScore || null, p.compGapScore || null, p.zestimateGapScore || null, p.rentYieldScore || null,
      p.investmentFlag || null, p.scoreVersion || 1,
      p.walkScore || null, p.transitScore || null, p.bikeScore || null,
      p.listingStatus || 'FOR_SALE', p.daysOnMarket || null, p.listedDate || null,
      p.enrichmentStatus || 'PENDING', p.enrichmentError || null
    );
    return id;
  }
}

export function findProperties(filters: PropertyFilters): PaginatedResponse<Property> {
  const conditions: string[] = ['1=1'];
  const params: any[] = [];

  if (filters.zipCodes?.length) {
    conditions.push(`zip_code IN (${filters.zipCodes.map(() => '?').join(',')})`);
    params.push(...filters.zipCodes);
  }
  if (filters.propertyTypes?.length) {
    conditions.push(`property_type IN (${filters.propertyTypes.map(() => '?').join(',')})`);
    params.push(...filters.propertyTypes);
  }
  if (filters.investmentFlags?.length) {
    conditions.push(`investment_flag IN (${filters.investmentFlags.map(() => '?').join(',')})`);
    params.push(...filters.investmentFlags);
  }
  if (filters.priceMin != null) { conditions.push('listing_price >= ?'); params.push(filters.priceMin); }
  if (filters.priceMax != null) { conditions.push('listing_price <= ?'); params.push(filters.priceMax); }
  if (filters.sqftMin != null) { conditions.push('sqft >= ?'); params.push(filters.sqftMin); }
  if (filters.underpricingMin != null) { conditions.push('underpricing_score >= ?'); params.push(filters.underpricingMin); }
  if (filters.daysOnMarketMax != null) { conditions.push('days_on_market <= ?'); params.push(filters.daysOnMarketMax); }

  const where = conditions.join(' AND ');
  const sortMap: Record<string, string> = {
    score: 'underpricing_score', price: 'listing_price', pricePerSqft: 'price_per_sqft',
    daysOnMarket: 'days_on_market', listedDate: 'listed_date',
  };
  const sortCol = sortMap[filters.sortBy || 'score'] || 'underpricing_score';
  const sortDir = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const page = filters.page || 1;
  const pageSize = Math.min(filters.pageSize || 25, 100);
  const offset = (page - 1) * pageSize;

  const total = (db.prepare(`SELECT COUNT(*) as c FROM properties WHERE ${where}`).get(...params) as any).c;
  const rows = db.prepare(`SELECT * FROM properties WHERE ${where} ORDER BY ${sortCol} ${sortDir} NULLS LAST LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  return { data: rows.map(rowToProperty), total, page, pageSize };
}

export function findPropertyById(id: string): Property | null {
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(id) as any;
  if (!row) return null;
  const property = rowToProperty(row);
  property.comps = (db.prepare('SELECT * FROM comps WHERE property_id = ? ORDER BY sold_date DESC').all(id) as any[]).map(rowToComp);
  property.priceHistory = (db.prepare('SELECT * FROM price_history WHERE property_id = ? ORDER BY date DESC').all(id) as any[]).map(rowToPriceHistory);
  return property;
}

export function upsertComps(propertyId: string, comps: Partial<Comp>[]): void {
  db.prepare('DELETE FROM comps WHERE property_id = ?').run(propertyId);
  const stmt = db.prepare('INSERT INTO comps (id, property_id, zpid, address, sold_price, sold_date, sqft, price_per_sqft, distance_miles) VALUES (?,?,?,?,?,?,?,?,?)');
  for (const c of comps) {
    stmt.run(uid(), propertyId, c.zpid || null, c.address, c.soldPrice, c.soldDate, c.sqft || null, c.pricePerSqft || null, c.distanceMiles || null);
  }
}

export function upsertPriceHistory(propertyId: string, events: Partial<PriceHistory>[]): void {
  const stmt = db.prepare('INSERT OR IGNORE INTO price_history (id, property_id, date, price, event, source) VALUES (?,?,?,?,?,?)');
  for (const e of events) {
    stmt.run(uid(), propertyId, e.date, e.price, e.event, e.source || 'ZILLOW');
  }
}

// ── Market summary ──
export function getMarketSummary(): MarketSummary {
  const totals = db.prepare(`SELECT
    COUNT(*) as total,
    AVG(listing_price) as avg_price,
    AVG(price_per_sqft) as avg_ppsf,
    AVG(underpricing_score) as avg_score
  FROM properties WHERE enrichment_status = 'COMPLETE'`).get() as any;

  const flags = db.prepare(`SELECT investment_flag, COUNT(*) as c FROM properties WHERE investment_flag IS NOT NULL GROUP BY investment_flag`).all() as any[];
  const flagCounts: Record<string, number> = { STRONG_BUY: 0, BUY: 0, WATCH: 0, PASS: 0 };
  flags.forEach(f => { flagCounts[f.investment_flag] = f.c; });

  const types = db.prepare('SELECT property_type, COUNT(*) as c FROM properties GROUP BY property_type').all() as any[];
  const typeCounts: Record<string, number> = {};
  types.forEach(t => { typeCounts[t.property_type] = t.c; });

  const topZips = db.prepare(`SELECT zip_code, COUNT(*) as count, AVG(underpricing_score) as avg_score
    FROM properties WHERE underpricing_score IS NOT NULL
    GROUP BY zip_code ORDER BY avg_score DESC LIMIT 10`).all() as any[];

  return {
    totalProperties: totals.total || 0,
    avgListingPrice: Math.round(totals.avg_price || 0),
    avgPricePerSqft: Math.round((totals.avg_ppsf || 0) * 100) / 100,
    avgUnderpricingScore: Math.round((totals.avg_score || 0) * 10) / 10,
    flagCounts: flagCounts as any,
    typeCounts,
    topZips: topZips.map(z => ({ zipCode: z.zip_code, count: z.count, avgScore: Math.round(z.avg_score * 10) / 10 })),
  };
}

// ── GeoJSON export ──
export function getPropertiesGeoJson(filters: PropertyFilters): any {
  const { data } = findProperties({ ...filters, page: 1, pageSize: 1000 });
  return {
    type: 'FeatureCollection',
    features: data.filter(p => p.lat && p.lng).map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id, address: p.address, listingPrice: p.listingPrice,
        underpricingScore: p.underpricingScore || 0,
        investmentFlag: p.investmentFlag || 'PASS',
        propertyType: p.propertyType,
        pricePerSqft: p.pricePerSqft || 0,
        city: p.city, zipCode: p.zipCode,
      },
    })),
  };
}

// ── Quota logging ──
export function logApiCall(endpoint: string, success: boolean, latencyMs?: number): void {
  db.prepare('INSERT INTO api_quota_log (id, endpoint, success, latency_ms) VALUES (?,?,?,?)').run(uid(), endpoint, success ? 1 : 0, latencyMs || null);
}

export function getQuotaStats(): QuotaStats {
  const today = new Date().toISOString().slice(0, 10);
  const todayRows = db.prepare("SELECT endpoint, COUNT(*) as c FROM api_quota_log WHERE date = ? GROUP BY endpoint").all(today) as any[];
  const byEndpoint: Record<string, number> = {};
  let total = 0;
  todayRows.forEach(r => { byEndpoint[r.endpoint] = r.c; total += r.c; });

  const dailyLimit = parseInt(process.env.MAX_DAILY_REQUESTS || '45');

  const last7 = db.prepare("SELECT date, COUNT(*) as c FROM api_quota_log WHERE date >= date('now', '-7 days') GROUP BY date ORDER BY date").all() as any[];

  return {
    today: { total, byEndpoint },
    dailyLimit,
    remaining: Math.max(0, dailyLimit - total),
    last7Days: last7.map(d => ({ date: d.date, total: d.c })),
  };
}

// ── Bulk count ──
export function getPropertyCount(): number {
  return (db.prepare('SELECT COUNT(*) as c FROM properties').get() as any).c;
}
