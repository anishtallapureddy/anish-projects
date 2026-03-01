import axios, { AxiosInstance } from 'axios';
import { Property, PropertyType, Comp } from '../types';
import { computeScore, assignFlag } from '../services/scoring/engine';
import { upsertProperty, upsertComps, upsertPriceHistory, logApiCall } from '../db/queries';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(8).toString('hex');

// ── LoopNet RapidAPI Client ──
// All endpoints are under the /loopnet/ prefix
function createClient(): AxiosInstance {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error('RAPIDAPI_KEY environment variable is required for live mode');

  return axios.create({
    baseURL: 'https://loopnet-api.p.rapidapi.com/loopnet',
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
async function apiCall<T>(client: AxiosInstance, endpoint: string, data: any): Promise<T | null> {
  const start = Date.now();
  try {
    const res = await client.post(endpoint, data);
    logApiCall(`loopnet:${endpoint}`, true, Date.now() - start);
    return res.data;
  } catch (err: any) {
    logApiCall(`loopnet:${endpoint}`, false, Date.now() - start);
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message;
    if (status === 429) {
      console.warn(`   ⚠️  Rate limited on ${endpoint}`);
    } else {
      console.warn(`   ⚠️  LoopNet API error on ${endpoint}: ${status || ''} ${msg}`);
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
  const cleaned = raw.replace(/[^0-9.MmKkBb]/g, '');
  const num = parseFloat(cleaned);
  if (!isFinite(num)) return 0;
  if (/[Bb]/.test(raw)) return num * 1_000_000_000;
  if (/[Mm]/.test(raw)) return num * 1_000_000;
  if (/[Kk]/.test(raw)) return num * 1_000;
  return num;
}

// ── Parse sqft string ("97,083 SF" → 97083) ──
function parseSqft(raw: any): number | undefined {
  if (typeof raw === 'number') return raw > 0 ? raw : undefined;
  if (typeof raw !== 'string') return undefined;
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isFinite(num) && num > 0 ? num : undefined;
}

// ── Parse year from "1999/2014" or "2006" ──
function parseYear(raw: any): number | undefined {
  if (!raw) return undefined;
  const s = String(raw);
  const match = s.match(/\d{4}/);
  return match ? parseInt(match[0]) : undefined;
}

// ── DFW City IDs (discovered via /helper/findCity) ──
// Dallas cityId=55283 returns 500 listings covering the broader DFW metro
const DFW_CITY_ID = '55283';

// ── Search listings by city ──
async function searchByCity(client: AxiosInstance, cityId: string, page: number = 1): Promise<any[]> {
  const res = await apiCall<any>(client, '/sale/searchByCity', { cityId, page });
  return res?.data || [];
}

// ── Search by state (Texas=44) for broader coverage ──
async function searchByState(client: AxiosInstance, stateId: string, page: number = 1): Promise<any[]> {
  const res = await apiCall<any>(client, '/sale/searchByState', { stateId, page });
  return res?.data || [];
}

// ── Get sale details for a single listing ──
async function getSaleDetails(client: AxiosInstance, listingId: string): Promise<any | null> {
  const res = await apiCall<any>(client, '/property/SaleDetails', { listingId });
  return res?.data?.[0] || null;
}

// ── Parse subtitle for address info ──
// Format: "97,083 SF 59% Leased Office Building Online Auction Sale Dallas, TX 75234"
// Or: "18,121 SF Office Building Plano, TX 75075 $6,500,000 ($358.70/SF)"
function parseSubtitle(sub: string): { city?: string; zip?: string } {
  const cityState = sub.match(/([A-Z][a-zA-Z\s]+),\s*TX\s+(\d{5})/);
  if (cityState) return { city: cityState[1].trim(), zip: cityState[2] };
  const justCity = sub.match(/([A-Z][a-zA-Z\s]+),\s*TX/);
  if (justCity) return { city: justCity[1].trim() };
  return {};
}

// ── Check if coordinates are in DFW metro area ──
function isDFW(coords: number[]): boolean {
  if (!coords || coords.length < 2) return true; // Assume DFW if no coords
  const [lng, lat] = coords;
  // DFW bounding box: roughly 32.4-33.4 lat, -97.8 to -96.4 lng
  return lat >= 32.2 && lat <= 33.5 && lng >= -98.0 && lng <= -96.2;
}

// ── Full LoopNet Ingestion Pipeline ──
export async function runLoopNetIngestion(options?: {
  maxPages?: number;
  enrichCount?: number;
}): Promise<{ ingested: number; enriched: number; scored: number }> {
  const client = createClient();
  const maxPages = options?.maxPages || 3;
  const enrichCount = options?.enrichCount || 30;

  console.log(`\n🏢 LoopNet Live Mode: Searching DFW commercial properties...`);

  let totalIngested = 0;
  const propertyIds: { loopnetId: string; dbId: string; address: string }[] = [];
  const seen = new Set<string>();

  // Phase 1: Search Dallas city listings (500 per page, covers DFW metro)
  for (let page = 1; page <= maxPages; page++) {
    console.log(`   📍 Fetching page ${page}...`);
    const listings = await searchByCity(client, DFW_CITY_ID, page);
    console.log(`      → ${listings.length} listings returned`);
    if (listings.length === 0) break;

    for (const item of listings) {
      const lid = String(item.listingId);
      if (seen.has(lid)) continue;
      seen.add(lid);

      // Filter to DFW coordinates
      const coords = item.coordinations?.[0];
      if (!isDFW(coords || [])) continue;

      const lat = coords ? coords[1] : 32.78;
      const lng = coords ? coords[0] : -96.80;

      propertyIds.push({
        loopnetId: lid,
        dbId: '', // Will be set after upsert
        address: `Listing #${lid}`,
      });

      // Upsert with minimal data (will be enriched in Phase 2)
      const id = upsertProperty({
        zpid: `LN-${lid}`,
        address: `LoopNet #${lid}`,
        city: 'Dallas',
        state: 'TX',
        zipCode: '',
        lat,
        lng,
        propertyType: 'OTHER',
        listingPrice: 0,
        listingStatus: 'FOR_SALE',
        enrichmentStatus: 'PENDING',
      });

      propertyIds[propertyIds.length - 1].dbId = id;
      totalIngested++;
    }

    await sleep(500);
  }

  console.log(`   ✅ Found ${totalIngested} DFW listings`);

  // Phase 2: Enrich with full property details via SaleDetails
  let enriched = 0;
  const toEnrich = propertyIds.slice(0, enrichCount);
  console.log(`\n🔬 Enriching ${toEnrich.length} properties with SaleDetails...`);

  for (const entry of toEnrich) {
    const details = await getSaleDetails(client, entry.loopnetId);
    if (!details) {
      await sleep(300);
      continue;
    }

    try {
      const pf = details.propertyFacts || {};
      const title = Array.isArray(details.title) ? details.title[0] : (details.title || '');
      const subtitle = details.subTitle || '';
      const { city, zip } = parseSubtitle(subtitle);

      const price = parsePrice(details.price || pf.price || 0);
      const sqft = parseSqft(pf.buildingSize);
      const ppsf = (sqft && price > 0) ? Math.round(price / sqft * 100) / 100 : parseSqft(details.pricePerSquareFoot?.replace('$', ''));
      const yearBuilt = parseYear(pf.yearBuiltRenovated);

      // Parse lot size (e.g., "5.44 AC" → sqft)
      let lotSize: number | undefined;
      if (pf.landArea) {
        const acMatch = pf.landArea.match(/([\d.]+)\s*AC/i);
        if (acMatch) lotSize = Math.round(parseFloat(acMatch[1]) * 43560);
        else lotSize = parseSqft(pf.landArea);
      }

      // Category from details or propertyFacts
      const category = details.category || pf.propertyType || pf.PropertyType || '';
      const description = (details.highlights || []).join(' ').slice(0, 500);

      // Parse percent leased for occupancy
      const pctLeased = details.percentLeased ? parseFloat(details.percentLeased) : undefined;

      upsertProperty({
        zpid: `LN-${entry.loopnetId}`,
        address: title || entry.address,
        city: city || 'Dallas',
        state: 'TX',
        zipCode: zip || '',
        propertyType: mapPropertyType(category),
        listingPrice: price,
        sqft,
        yearBuilt,
        lotSize,
        description,
        pricePerSqft: ppsf,
        listingStatus: 'FOR_SALE',
        enrichmentStatus: price > 0 ? 'COMPLETE' : 'PARTIAL',
      } as any);

      entry.address = title || entry.address;
      if (price > 0) enriched++;
      console.log(`   ✅ ${entry.loopnetId}: ${title} — ${price > 0 ? '$' + price.toLocaleString() : 'Price TBD'} (${category})`);
    } catch (err: any) {
      console.warn(`   ⚠️ Parse error for ${entry.loopnetId}: ${err.message}`);
    }

    await sleep(400);
  }

  console.log(`   ✅ Enriched ${enriched} properties with pricing data`);

  // Phase 3: Score all properties with pricing data
  console.log(`\n📊 Scoring properties...`);
  const { findProperties } = await import('../db/queries');
  const { data: allProps } = findProperties({ sortBy: 'price', sortOrder: 'desc', pageSize: 500 });

  let scored = 0;
  for (const prop of allProps) {
    if (prop.listingPrice > 0 && (prop.compAvgPpsf || prop.rentEstimate || prop.zestimateValue || prop.pricePerSqft)) {
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
