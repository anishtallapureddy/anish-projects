import axios, { AxiosInstance } from 'axios';
import { Property, Comp, PriceHistory, PropertyType } from '../types';
import { computeScore, assignFlag } from '../services/scoring/engine';
import { upsertProperty, upsertComps, upsertPriceHistory, logApiCall } from '../db/queries';
import { PRIORITY_ZIPS } from '../config/zips';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(8).toString('hex');

// ── Zillow RapidAPI Client ──
function createClient(): AxiosInstance {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY environment variable is required for live mode');

  return axios.create({
    baseURL: 'https://zillow-com1.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
    },
    timeout: 15000,
  });
}

// Safe number extraction
function n(v: any, fallback = 0): number {
  if (v == null) return fallback;
  const num = typeof v === 'object' && v.raw != null ? v.raw : Number(v);
  return isFinite(num) ? num : fallback;
}

// ── API Call Wrapper with logging ──
async function apiCall<T>(client: AxiosInstance, endpoint: string, params: Record<string, any>): Promise<T | null> {
  const start = Date.now();
  try {
    const res = await client.get(endpoint, { params });
    logApiCall(endpoint, true, Date.now() - start);
    return res.data;
  } catch (err: any) {
    logApiCall(endpoint, false, Date.now() - start);
    const status = err?.response?.status;
    if (status === 429) {
      console.warn(`   ⚠️  Rate limited on ${endpoint} — backing off`);
    } else {
      console.warn(`   ⚠️  API error on ${endpoint}: ${err.message}`);
    }
    return null;
  }
}

// ── Property Search by ZIP ──
interface ZillowSearchResult {
  props?: any[];
  totalResultCount?: number;
}

async function searchPropertiesByZip(client: AxiosInstance, zipCode: string): Promise<any[]> {
  const data = await apiCall<ZillowSearchResult>(client, '/propertyExtendedSearch', {
    location: zipCode,
    status_type: 'ForSale',
    home_type: 'Multi-family,Apartments,Commercial,Industrial',
    sort: 'Newest',
  });
  return data?.props || [];
}

// ── Enrich a single property ──
async function enrichProperty(
  client: AxiosInstance,
  zpid: string,
  address: string,
): Promise<{
  zestimate?: number; zestimateLow?: number; zestimateHigh?: number;
  rentEstimate?: number;
  comps: Partial<Comp>[];
  priceHistory: Partial<PriceHistory>[];
  walkScore?: number; transitScore?: number; bikeScore?: number;
}> {
  const result: any = {
    comps: [],
    priceHistory: [],
  };

  // 1) Zestimate
  const zest = await apiCall<any>(client, '/zestimate', { zpid });
  if (zest) {
    result.zestimate = n(zest.zestimate);
    result.zestimateLow = n(zest.zestimateLowPercent) > 0
      ? Math.round(result.zestimate * (1 - n(zest.zestimateLowPercent) / 100))
      : undefined;
    result.zestimateHigh = n(zest.zestimateHighPercent) > 0
      ? Math.round(result.zestimate * (1 + n(zest.zestimateHighPercent) / 100))
      : undefined;
  }

  // 2) Rent Estimate
  const rent = await apiCall<any>(client, '/rentEstimate', { address });
  if (rent) {
    result.rentEstimate = n(rent.rent);
  }

  // 3) Property Comps
  const compsData = await apiCall<any>(client, '/propertyComps', { zpid });
  if (compsData?.comps) {
    result.comps = compsData.comps.slice(0, 8).map((c: any) => ({
      zpid: c.zpid?.toString(),
      address: c.address || c.streetAddress || 'Unknown',
      soldPrice: n(c.price || c.lastSoldPrice),
      soldDate: c.lastSoldDate || c.dateSold || new Date().toISOString().slice(0, 10),
      sqft: n(c.livingArea),
      pricePerSqft: c.livingArea > 0 ? Math.round(n(c.price || c.lastSoldPrice) / n(c.livingArea) * 100) / 100 : undefined,
      distanceMiles: n(c.distance, undefined),
    }));
  }

  // 4) Price & Tax History
  const history = await apiCall<any>(client, '/priceAndTaxHistory', { zpid });
  if (history?.priceHistory) {
    result.priceHistory = history.priceHistory.slice(0, 20).map((h: any) => ({
      date: h.date || h.time,
      price: n(h.price),
      event: mapPriceEvent(h.event),
    }));
  }

  // 5) Walk & Transit Score
  const scores = await apiCall<any>(client, '/walkAndTransitScore', { zpid });
  if (scores) {
    result.walkScore = n(scores.walkScore, undefined);
    result.transitScore = n(scores.transitScore, undefined);
    result.bikeScore = n(scores.bikeScore, undefined);
  }

  return result;
}

function mapPriceEvent(event: string): string {
  const map: Record<string, string> = {
    'Listed for sale': 'LISTED',
    'Price change': 'PRICE_REDUCTION',
    'Listing removed': 'LISTED',
    'Sold': 'SOLD',
  };
  return map[event] || 'LISTED';
}

// ── Full Live Ingestion Pipeline ──
export async function runLiveIngestion(options?: {
  maxZips?: number;
  enrichTop?: number;
}): Promise<{ ingested: number; enriched: number; scored: number }> {
  const client = createClient();
  const maxZips = options?.maxZips || 5;
  const enrichTop = options?.enrichTop || 15;

  console.log(`\n🌐 Live Mode: Scanning ${maxZips} priority ZIP codes...`);

  // Phase 1: Ingest properties from priority ZIPs
  let totalIngested = 0;
  const zpidsToEnrich: { zpid: string; id: string; address: string }[] = [];

  for (let i = 0; i < Math.min(maxZips, PRIORITY_ZIPS.length); i++) {
    const zip = PRIORITY_ZIPS[i];
    console.log(`   📍 Searching ZIP ${zip}...`);

    const props = await searchPropertiesByZip(client, zip);
    for (const raw of props) {
      const zpid = raw.zpid?.toString();
      if (!zpid) continue;

      const address = raw.address || raw.streetAddress || `${raw.streetNumber || ''} ${raw.streetName || ''}`.trim();
      const ppsf = raw.livingArea > 0 ? Math.round(raw.price / raw.livingArea * 100) / 100 : undefined;

      const id = upsertProperty({
        zpid,
        mlsId: raw.mlsid || undefined,
        address: address || 'Unknown',
        city: raw.city || 'DFW',
        state: 'TX',
        zipCode: raw.zipcode || zip,
        lat: n(raw.latitude, 32.78),
        lng: n(raw.longitude, -96.80),
        propertyType: mapPropertyType(raw.propertyType || raw.homeType),
        listingPrice: n(raw.price),
        sqft: n(raw.livingArea, undefined),
        yearBuilt: n(raw.yearBuilt, undefined),
        lotSize: n(raw.lotAreaValue, undefined),
        bedsCount: n(raw.bedrooms, undefined),
        bathsCount: n(raw.bathrooms, undefined),
        description: raw.description?.slice(0, 500),
        pricePerSqft: ppsf,
        listingStatus: raw.listingStatus || 'FOR_SALE',
        daysOnMarket: n(raw.daysOnZillow, undefined),
        listedDate: raw.datePosted || undefined,
        enrichmentStatus: 'PENDING',
      });

      zpidsToEnrich.push({ zpid, id, address: address || 'Unknown' });
      totalIngested++;
    }

    // Respect rate limits
    await sleep(500);
  }

  console.log(`   ✅ Ingested ${totalIngested} properties from ${maxZips} ZIPs`);

  // Phase 2: Enrich top properties (by listing price for commercial relevance)
  const toEnrich = zpidsToEnrich.slice(0, enrichTop);
  console.log(`\n🔬 Enriching top ${toEnrich.length} properties...`);

  let enriched = 0;
  for (const { zpid, id, address } of toEnrich) {
    console.log(`   🔍 Enriching: ${address}...`);
    try {
      const data = await enrichProperty(client, zpid, address);

      // Update property with enrichment data
      upsertProperty({
        zpid,
        zestimateValue: data.zestimate,
        zestimateLow: data.zestimateLow,
        zestimateHigh: data.zestimateHigh,
        rentEstimate: data.rentEstimate,
        walkScore: data.walkScore,
        transitScore: data.transitScore,
        bikeScore: data.bikeScore,
        zestimateConfidence: data.comps.length >= 5 ? 'HIGH' : data.comps.length >= 3 ? 'MEDIUM' : 'LOW',
        compAvgPpsf: data.comps.length > 0
          ? Math.round(data.comps.reduce((s, c) => s + (c.pricePerSqft || 0), 0) / data.comps.filter(c => c.pricePerSqft).length * 100) / 100
          : undefined,
        enrichmentStatus: 'COMPLETE',
      } as any);

      // Store comps and price history
      if (data.comps.length > 0) upsertComps(id, data.comps);
      if (data.priceHistory.length > 0) upsertPriceHistory(id, data.priceHistory);

      enriched++;
      await sleep(300);
    } catch (err: any) {
      console.warn(`   ⚠️  Enrichment failed for ${address}: ${err.message}`);
      upsertProperty({ zpid, enrichmentStatus: 'FAILED', enrichmentError: err.message } as any);
    }
  }

  console.log(`   ✅ Enriched ${enriched}/${toEnrich.length} properties`);

  // Phase 3: Score all enriched properties
  console.log(`\n📊 Scoring enriched properties...`);
  const { findProperties } = await import('../db/queries');
  const { data: allProps } = findProperties({ sortBy: 'price', sortOrder: 'desc', pageSize: 500 });

  let scored = 0;
  for (const prop of allProps) {
    if (prop.enrichmentStatus !== 'COMPLETE') continue;
    if (!prop.zestimateValue && !prop.compAvgPpsf && !prop.rentEstimate) continue;

    const score = computeScore(prop);
    const flag = assignFlag(score);

    upsertProperty({
      zpid: prop.zpid,
      underpricingScore: score.total,
      compGapScore: score.compGap,
      zestimateGapScore: score.zestimateGap,
      rentYieldScore: score.rentYield,
      investmentFlag: flag,
    } as any);
    scored++;
  }

  console.log(`   ✅ Scored ${scored} properties\n`);
  return { ingested: totalIngested, enriched, scored };
}

function mapPropertyType(raw: string): PropertyType {
  const map: Record<string, PropertyType> = {
    'MULTI_FAMILY': 'MULTI_FAMILY', 'MultiFamily': 'MULTI_FAMILY', 'Apartment': 'MULTI_FAMILY',
    'COMMERCIAL': 'RETAIL', 'Commercial': 'RETAIL',
    'INDUSTRIAL': 'INDUSTRIAL', 'Industrial': 'INDUSTRIAL',
    'OFFICE': 'OFFICE', 'Office': 'OFFICE',
    'LAND': 'LAND', 'Lot': 'LAND', 'VacantLand': 'LAND',
    'MIXED_USE': 'MIXED_USE',
  };
  return map[raw] || 'OTHER';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
