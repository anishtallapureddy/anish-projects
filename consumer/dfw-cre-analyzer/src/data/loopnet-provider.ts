import axios, { AxiosInstance } from 'axios';
import { Property, PropertyType, Comp } from '../types';
import { computeScore, assignFlag } from '../services/scoring/engine';
import { upsertProperty, upsertComps, upsertPriceHistory, logApiCall } from '../db/queries';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(8).toString('hex');

// ── LoopNet RapidAPI Client ──
function createClient(): AxiosInstance {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY environment variable is required for live mode');

  return axios.create({
    baseURL: 'https://loopnet-api.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': 'loopnet-api.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
}

function n(v: any, fallback?: number): number | undefined {
  if (v == null) return fallback;
  const num = Number(v);
  return isFinite(num) ? num : fallback;
}

// ── API Call Wrapper with logging ──
async function apiCall<T>(client: AxiosInstance, method: 'get' | 'post', endpoint: string, data?: any): Promise<T | null> {
  const start = Date.now();
  try {
    const res = method === 'post'
      ? await client.post(endpoint, data)
      : await client.get(endpoint, { params: data });
    logApiCall(`loopnet:${endpoint}`, true, Date.now() - start);
    return res.data;
  } catch (err: any) {
    logApiCall(`loopnet:${endpoint}`, false, Date.now() - start);
    const status = err?.response?.status;
    if (status === 429) {
      console.warn(`   ⚠️  Rate limited on ${endpoint}`);
    } else {
      console.warn(`   ⚠️  LoopNet API error on ${endpoint}: ${status || err.message}`);
    }
    return null;
  }
}

// ── Property type mapping ──
function mapPropertyType(raw: string): PropertyType {
  const lower = (raw || '').toLowerCase();
  if (lower.includes('office')) return 'OFFICE';
  if (lower.includes('retail') || lower.includes('restaurant') || lower.includes('shopping')) return 'RETAIL';
  if (lower.includes('industrial') || lower.includes('warehouse') || lower.includes('flex')) return 'INDUSTRIAL';
  if (lower.includes('multi') || lower.includes('apartment')) return 'MULTI_FAMILY';
  if (lower.includes('land') || lower.includes('lot')) return 'LAND';
  if (lower.includes('mixed')) return 'MIXED_USE';
  return 'OTHER';
}

// ── Parse price string ──
function parsePrice(raw: any): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  // Handle "$1,200,000", "$1.2M", etc.
  const cleaned = raw.replace(/[^0-9.MmKk]/g, '');
  const num = parseFloat(cleaned);
  if (!isFinite(num)) return 0;
  if (/[Mm]/.test(raw)) return num * 1_000_000;
  if (/[Kk]/.test(raw)) return num * 1_000;
  return num;
}

// ── Parse sqft string ──
function parseSqft(raw: any): number | undefined {
  if (typeof raw === 'number') return raw > 0 ? raw : undefined;
  if (typeof raw !== 'string') return undefined;
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isFinite(num) && num > 0 ? num : undefined;
}

// ── DFW Search locations ──
const DFW_SEARCHES = [
  'Dallas, TX',
  'Fort Worth, TX',
  'Arlington, TX',
  'Plano, TX',
  'Frisco, TX',
  'Irving, TX',
  'McKinney, TX',
  'Richardson, TX',
  'Carrollton, TX',
  'Denton, TX',
];

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Mixed Use'];

// ── Search listings ──
async function searchListings(client: AxiosInstance, location: string, propertyType?: string): Promise<any[]> {
  const body: any = {
    location,
    transactionType: 'sale',
    page: 1,
    resultsPerPage: 25,
  };
  if (propertyType) body.propertyType = propertyType;

  const data = await apiCall<any>(client, 'post', '/SearchListings', body);
  if (!data) return [];

  // The response structure may vary; handle both array and object forms
  if (Array.isArray(data)) return data;
  if (data.listings && Array.isArray(data.listings)) return data.listings;
  if (data.results && Array.isArray(data.results)) return data.results;
  if (data.data && Array.isArray(data.data)) return data.data;

  return [];
}

// ── Get property details ──
async function getPropertyDetails(client: AxiosInstance, listingId: string): Promise<any | null> {
  return apiCall<any>(client, 'get', '/GetPropertyDetails', { id: listingId });
}

// ── Full LoopNet Ingestion Pipeline ──
export async function runLoopNetIngestion(options?: {
  maxLocations?: number;
  enrichDetails?: boolean;
}): Promise<{ ingested: number; enriched: number; scored: number }> {
  const client = createClient();
  const maxLocs = options?.maxLocations || 5;
  const enrichDetails = options?.enrichDetails !== false;

  console.log(`\n🏢 LoopNet Live Mode: Scanning ${maxLocs} DFW locations...`);

  let totalIngested = 0;
  const propertyIds: { loopnetId: string; dbId: string; address: string }[] = [];

  // Phase 1: Search across locations
  for (let i = 0; i < Math.min(maxLocs, DFW_SEARCHES.length); i++) {
    const location = DFW_SEARCHES[i];
    console.log(`   📍 Searching: ${location}...`);

    const listings = await searchListings(client, location);
    console.log(`      → ${listings.length} listings found`);

    for (const raw of listings) {
      try {
        const zpid = `LN-${raw.id || raw.listingId || raw.propertyId || uid()}`;
        const address = raw.address || raw.streetAddress || raw.name || 'Unknown';
        const city = raw.city || location.split(',')[0].trim();
        const price = parsePrice(raw.price || raw.listingPrice || raw.askingPrice);
        if (price <= 0) continue; // Skip listings without price

        const sqft = parseSqft(raw.sqft || raw.size || raw.buildingSize || raw.lotSize);
        const ppsf = sqft && sqft > 0 ? Math.round(price / sqft * 100) / 100 : undefined;
        const lat = n(raw.latitude || raw.lat, 32.78)!;
        const lng = n(raw.longitude || raw.lng || raw.lon, -96.80)!;
        const zip = raw.zipCode || raw.zip || raw.postalCode || '';

        const id = upsertProperty({
          zpid,
          address,
          city,
          state: 'TX',
          zipCode: zip,
          lat,
          lng,
          propertyType: mapPropertyType(raw.propertyType || raw.type || raw.category || ''),
          listingPrice: price,
          sqft,
          yearBuilt: n(raw.yearBuilt),
          lotSize: parseSqft(raw.lotSize),
          description: (raw.description || raw.highlights || '').slice(0, 500),
          pricePerSqft: ppsf,
          listingStatus: 'FOR_SALE',
          daysOnMarket: n(raw.daysOnMarket || raw.dom),
          enrichmentStatus: 'PENDING',
        });

        propertyIds.push({ loopnetId: raw.id || raw.listingId || '', dbId: id, address });
        totalIngested++;
      } catch (err: any) {
        console.warn(`      ⚠️ Parse error: ${err.message}`);
      }
    }

    await sleep(500); // Rate limit
  }

  console.log(`   ✅ Ingested ${totalIngested} properties`);

  // Phase 2: Enrich with property details (if available)
  let enriched = 0;
  if (enrichDetails && propertyIds.length > 0) {
    const toEnrich = propertyIds.slice(0, 20);
    console.log(`\n🔬 Enriching ${toEnrich.length} properties with details...`);

    for (const { loopnetId, dbId, address } of toEnrich) {
      if (!loopnetId) continue;

      const details = await getPropertyDetails(client, loopnetId);
      if (details) {
        // Extract enrichment fields from detail response
        const capRate = parseFloat(String(details.capRate || details.cap_rate || '0').replace('%', ''));
        const rentEst = capRate > 0 && details.price
          ? Math.round(parsePrice(details.price) * (capRate / 100) / 12)
          : n(details.rentEstimate || details.noi);

        // Comps from similar listings if available
        const comps: Partial<Comp>[] = [];
        const similarProps = details.comparables || details.similarProperties || details.comps || [];
        if (Array.isArray(similarProps)) {
          for (const c of similarProps.slice(0, 8)) {
            const compPrice = parsePrice(c.price || c.soldPrice);
            const compSqft = parseSqft(c.sqft || c.size);
            if (compPrice > 0) {
              comps.push({
                address: c.address || 'Comparable Property',
                soldPrice: compPrice,
                soldDate: c.soldDate || c.date || new Date().toISOString().slice(0, 10),
                sqft: compSqft,
                pricePerSqft: compSqft ? Math.round(compPrice / compSqft * 100) / 100 : undefined,
                distanceMiles: n(c.distance),
              });
            }
          }
        }

        const compAvgPpsf = comps.length > 0
          ? Math.round(comps.filter(c => c.pricePerSqft).reduce((s, c) => s + (c.pricePerSqft || 0), 0) / comps.filter(c => c.pricePerSqft).length * 100) / 100
          : undefined;

        upsertProperty({
          zpid: `LN-${loopnetId}`,
          rentEstimate: rentEst,
          compAvgPpsf,
          zestimateConfidence: comps.length >= 5 ? 'HIGH' : comps.length >= 3 ? 'MEDIUM' : 'LOW',
          walkScore: n(details.walkScore),
          transitScore: n(details.transitScore),
          enrichmentStatus: 'COMPLETE',
        } as any);

        if (comps.length > 0) upsertComps(dbId, comps);
        enriched++;
      }
      await sleep(300);
    }
    console.log(`   ✅ Enriched ${enriched} properties`);
  }

  // Phase 3: Score all properties (including un-enriched ones with basic data)
  console.log(`\n📊 Scoring properties...`);
  const { findProperties } = await import('../db/queries');
  const { data: allProps } = findProperties({ sortBy: 'price', sortOrder: 'desc', pageSize: 500 });

  let scored = 0;
  for (const prop of allProps) {
    // Score if we have any valuation data
    if (!prop.underpricingScore && (prop.compAvgPpsf || prop.rentEstimate || prop.zestimateValue)) {
      const score = computeScore(prop);
      const flag = assignFlag(score);
      upsertProperty({
        zpid: prop.zpid,
        underpricingScore: score.total,
        compGapScore: score.compGap,
        zestimateGapScore: score.zestimateGap,
        rentYieldScore: score.rentYield,
        investmentFlag: flag,
        enrichmentStatus: 'COMPLETE',
      } as any);
      scored++;
    }
  }

  console.log(`   ✅ Scored ${scored} properties\n`);
  return { ingested: totalIngested, enriched, scored };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
