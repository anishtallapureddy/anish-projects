import { Property, PropertyType, Comp, PriceHistory } from '../types';
import { computeScore, assignFlag } from '../services/scoring/engine';
import { upsertProperty, upsertComps, upsertPriceHistory, getPropertyCount } from '../db/queries';
import crypto from 'crypto';

const uid = () => crypto.randomBytes(4).toString('hex');

interface MockDef {
  address: string; city: string; zip: string; lat: number; lng: number;
  type: PropertyType; price: number; sqft: number; yearBuilt: number;
  zestimate: number; rentEst: number; compAvgPpsf: number;
  walkScore: number; transitScore: number; dom: number;
  compsCount: number;
}

const MOCK_PROPERTIES: MockDef[] = [
  // ── Dallas Core (Strong deals) ──
  { address: '1200 Main St', city: 'Dallas', zip: '75202', lat: 32.7815, lng: -96.7969, type: 'OFFICE', price: 4200000, sqft: 28000, yearBuilt: 1985, zestimate: 5100000, rentEst: 32000, compAvgPpsf: 185, walkScore: 92, transitScore: 68, dom: 45, compsCount: 6 },
  { address: '2800 Commerce St', city: 'Dallas', zip: '75201', lat: 32.7873, lng: -96.7982, type: 'MIXED_USE', price: 3100000, sqft: 18500, yearBuilt: 1972, zestimate: 3800000, rentEst: 24000, compAvgPpsf: 210, walkScore: 88, transitScore: 72, dom: 30, compsCount: 5 },
  { address: '500 S Ervay St', city: 'Dallas', zip: '75201', lat: 32.7788, lng: -96.7978, type: 'RETAIL', price: 1850000, sqft: 9200, yearBuilt: 1968, zestimate: 2400000, rentEst: 16000, compAvgPpsf: 240, walkScore: 95, transitScore: 74, dom: 12, compsCount: 7 },
  { address: '4500 Cedar Springs Rd', city: 'Dallas', zip: '75219', lat: 32.8083, lng: -96.8087, type: 'RETAIL', price: 2750000, sqft: 14000, yearBuilt: 1990, zestimate: 3200000, rentEst: 21000, compAvgPpsf: 225, walkScore: 82, transitScore: 55, dom: 22, compsCount: 4 },
  { address: '1717 McKinney Ave', city: 'Dallas', zip: '75202', lat: 32.7925, lng: -96.8015, type: 'MIXED_USE', price: 5800000, sqft: 32000, yearBuilt: 2005, zestimate: 6500000, rentEst: 42000, compAvgPpsf: 200, walkScore: 90, transitScore: 70, dom: 60, compsCount: 8 },
  { address: '3000 Elm St', city: 'Dallas', zip: '75204', lat: 32.7866, lng: -96.7825, type: 'MULTI_FAMILY', price: 6200000, sqft: 42000, yearBuilt: 1998, zestimate: 7100000, rentEst: 52000, compAvgPpsf: 165, walkScore: 78, transitScore: 62, dom: 88, compsCount: 6 },
  { address: '800 S Good Latimer Expy', city: 'Dallas', zip: '75226', lat: 32.7773, lng: -96.7838, type: 'INDUSTRIAL', price: 2100000, sqft: 25000, yearBuilt: 1965, zestimate: 2600000, rentEst: 15000, compAvgPpsf: 105, walkScore: 45, transitScore: 30, dom: 105, compsCount: 3 },
  { address: '6101 W Plano Pkwy', city: 'Plano', zip: '75093', lat: 33.0198, lng: -96.7506, type: 'OFFICE', price: 3800000, sqft: 22000, yearBuilt: 2001, zestimate: 4200000, rentEst: 28000, compAvgPpsf: 195, walkScore: 62, transitScore: 25, dom: 34, compsCount: 5 },
  { address: '2200 N Collins Blvd', city: 'Richardson', zip: '75080', lat: 32.9579, lng: -96.7299, type: 'OFFICE', price: 2900000, sqft: 19500, yearBuilt: 1995, zestimate: 3300000, rentEst: 22000, compAvgPpsf: 178, walkScore: 55, transitScore: 35, dom: 50, compsCount: 4 },
  { address: '15300 Midway Rd', city: 'Addison', zip: '75001', lat: 32.9539, lng: -96.8388, type: 'RETAIL', price: 4100000, sqft: 20000, yearBuilt: 2008, zestimate: 4500000, rentEst: 30000, compAvgPpsf: 230, walkScore: 70, transitScore: 40, dom: 18, compsCount: 6 },
  { address: '700 E 15th St', city: 'Plano', zip: '75074', lat: 33.0251, lng: -96.6847, type: 'MULTI_FAMILY', price: 7500000, sqft: 55000, yearBuilt: 2010, zestimate: 8200000, rentEst: 58000, compAvgPpsf: 148, walkScore: 50, transitScore: 28, dom: 42, compsCount: 7 },
  { address: '4600 N Josey Ln', city: 'Carrollton', zip: '75010', lat: 33.0061, lng: -96.8906, type: 'INDUSTRIAL', price: 3200000, sqft: 40000, yearBuilt: 1992, zestimate: 3600000, rentEst: 20000, compAvgPpsf: 92, walkScore: 30, transitScore: 15, dom: 72, compsCount: 4 },
  { address: '1100 Legacy Dr', city: 'Frisco', zip: '75034', lat: 33.1015, lng: -96.8207, type: 'OFFICE', price: 5600000, sqft: 30000, yearBuilt: 2015, zestimate: 6000000, rentEst: 38000, compAvgPpsf: 210, walkScore: 45, transitScore: 20, dom: 28, compsCount: 5 },
  { address: '8200 Greenville Ave', city: 'Dallas', zip: '75231', lat: 32.8676, lng: -96.7630, type: 'RETAIL', price: 1950000, sqft: 8500, yearBuilt: 1978, zestimate: 2300000, rentEst: 14500, compAvgPpsf: 260, walkScore: 80, transitScore: 50, dom: 15, compsCount: 5 },
  { address: '300 E Belt Line Rd', city: 'DeSoto', zip: '75115', lat: 32.5899, lng: -96.8570, type: 'RETAIL', price: 1200000, sqft: 8000, yearBuilt: 1988, zestimate: 1500000, rentEst: 10000, compAvgPpsf: 170, walkScore: 55, transitScore: 20, dom: 90, compsCount: 3 },
  { address: '500 Throckmorton St', city: 'Fort Worth', zip: '76102', lat: 32.7555, lng: -97.3308, type: 'OFFICE', price: 3500000, sqft: 24000, yearBuilt: 1980, zestimate: 4100000, rentEst: 26000, compAvgPpsf: 175, walkScore: 88, transitScore: 55, dom: 38, compsCount: 6 },
  { address: '2600 W 7th St', city: 'Fort Worth', zip: '76107', lat: 32.7519, lng: -97.3518, type: 'MIXED_USE', price: 4200000, sqft: 22000, yearBuilt: 2003, zestimate: 4800000, rentEst: 31000, compAvgPpsf: 220, walkScore: 82, transitScore: 42, dom: 25, compsCount: 5 },
  { address: '1200 S Main St', city: 'Fort Worth', zip: '76104', lat: 32.7420, lng: -97.3290, type: 'RETAIL', price: 1600000, sqft: 7500, yearBuilt: 1975, zestimate: 2000000, rentEst: 13000, compAvgPpsf: 240, walkScore: 75, transitScore: 45, dom: 55, compsCount: 4 },
  { address: '4800 Bryant Irvin Rd', city: 'Fort Worth', zip: '76109', lat: 32.6956, lng: -97.3920, type: 'RETAIL', price: 5200000, sqft: 28000, yearBuilt: 2012, zestimate: 5600000, rentEst: 38000, compAvgPpsf: 205, walkScore: 60, transitScore: 18, dom: 20, compsCount: 6 },
  { address: '100 NE Loop 820', city: 'Fort Worth', zip: '76131', lat: 32.8284, lng: -97.2810, type: 'INDUSTRIAL', price: 4800000, sqft: 60000, yearBuilt: 2000, zestimate: 5200000, rentEst: 30000, compAvgPpsf: 88, walkScore: 18, transitScore: 8, dom: 65, compsCount: 4 },
  { address: '6500 Camp Bowie Blvd', city: 'Fort Worth', zip: '76116', lat: 32.7411, lng: -97.3868, type: 'RETAIL', price: 2800000, sqft: 15000, yearBuilt: 1995, zestimate: 3100000, rentEst: 19500, compAvgPpsf: 210, walkScore: 72, transitScore: 30, dom: 32, compsCount: 5 },
  { address: '1000 N Collins St', city: 'Arlington', zip: '76011', lat: 32.7407, lng: -97.1086, type: 'OFFICE', price: 2600000, sqft: 18000, yearBuilt: 1998, zestimate: 3000000, rentEst: 19000, compAvgPpsf: 160, walkScore: 48, transitScore: 12, dom: 40, compsCount: 4 },
  { address: '2500 E Lamar Blvd', city: 'Arlington', zip: '76006', lat: 32.7602, lng: -97.0747, type: 'RETAIL', price: 3400000, sqft: 22000, yearBuilt: 2006, zestimate: 3800000, rentEst: 25000, compAvgPpsf: 180, walkScore: 55, transitScore: 15, dom: 28, compsCount: 5 },
  { address: '3200 S Cooper St', city: 'Arlington', zip: '76015', lat: 32.7030, lng: -97.1270, type: 'MULTI_FAMILY', price: 8900000, sqft: 65000, yearBuilt: 2014, zestimate: 9500000, rentEst: 68000, compAvgPpsf: 145, walkScore: 42, transitScore: 10, dom: 55, compsCount: 6 },
  { address: '10100 N Central Expy', city: 'Dallas', zip: '75231', lat: 32.8694, lng: -96.7566, type: 'OFFICE', price: 7200000, sqft: 45000, yearBuilt: 1988, zestimate: 8500000, rentEst: 50000, compAvgPpsf: 180, walkScore: 65, transitScore: 45, dom: 72, compsCount: 7 },
  { address: '2100 N Haskell Ave', city: 'Dallas', zip: '75204', lat: 32.7952, lng: -96.7880, type: 'MULTI_FAMILY', price: 4500000, sqft: 30000, yearBuilt: 2002, zestimate: 5200000, rentEst: 36000, compAvgPpsf: 170, walkScore: 85, transitScore: 60, dom: 35, compsCount: 5 },
  { address: '11600 Forest Central Dr', city: 'Dallas', zip: '75243', lat: 32.9137, lng: -96.7506, type: 'OFFICE', price: 5100000, sqft: 35000, yearBuilt: 1996, zestimate: 5500000, rentEst: 34000, compAvgPpsf: 162, walkScore: 40, transitScore: 20, dom: 85, compsCount: 4 },
  { address: '14700 Trinity Blvd', city: 'Fort Worth', zip: '76155', lat: 32.8168, lng: -97.0621, type: 'INDUSTRIAL', price: 6800000, sqft: 80000, yearBuilt: 2008, zestimate: 7200000, rentEst: 42000, compAvgPpsf: 95, walkScore: 12, transitScore: 5, dom: 50, compsCount: 5 },
  { address: '5000 Belt Line Rd', city: 'Dallas', zip: '75254', lat: 32.9342, lng: -96.8196, type: 'OFFICE', price: 4400000, sqft: 26000, yearBuilt: 2000, zestimate: 4900000, rentEst: 30000, compAvgPpsf: 190, walkScore: 50, transitScore: 25, dom: 42, compsCount: 6 },
  { address: '3600 W Northwest Hwy', city: 'Dallas', zip: '75220', lat: 32.8642, lng: -96.8720, type: 'RETAIL', price: 2200000, sqft: 12000, yearBuilt: 1982, zestimate: 2700000, rentEst: 17000, compAvgPpsf: 210, walkScore: 60, transitScore: 28, dom: 48, compsCount: 4 },
  // ── Strong underpriced gems (STRONG_BUY / BUY targets) ──
  { address: '901 W Vickery Blvd', city: 'Fort Worth', zip: '76104', lat: 32.7388, lng: -97.3370, type: 'MIXED_USE', price: 750000, sqft: 12000, yearBuilt: 1960, zestimate: 2100000, rentEst: 12000, compAvgPpsf: 160, walkScore: 70, transitScore: 40, dom: 120, compsCount: 5 },
  { address: '2200 Irving Blvd', city: 'Dallas', zip: '75207', lat: 32.7918, lng: -96.8289, type: 'INDUSTRIAL', price: 800000, sqft: 22000, yearBuilt: 1955, zestimate: 2800000, rentEst: 14000, compAvgPpsf: 115, walkScore: 35, transitScore: 22, dom: 145, compsCount: 5 },
  { address: '600 E Weatherford St', city: 'Fort Worth', zip: '76102', lat: 32.7585, lng: -97.3245, type: 'OFFICE', price: 1200000, sqft: 15000, yearBuilt: 1970, zestimate: 3000000, rentEst: 18000, compAvgPpsf: 185, walkScore: 85, transitScore: 52, dom: 95, compsCount: 6 },
  { address: '420 Singleton Blvd', city: 'Dallas', zip: '75212', lat: 32.7820, lng: -96.8350, type: 'INDUSTRIAL', price: 650000, sqft: 18000, yearBuilt: 1958, zestimate: 1900000, rentEst: 9500, compAvgPpsf: 100, walkScore: 30, transitScore: 15, dom: 180, compsCount: 5 },
  { address: '3200 E Lancaster Ave', city: 'Fort Worth', zip: '76103', lat: 32.7490, lng: -97.3050, type: 'RETAIL', price: 550000, sqft: 7500, yearBuilt: 1962, zestimate: 1500000, rentEst: 8000, compAvgPpsf: 180, walkScore: 65, transitScore: 38, dom: 200, compsCount: 5 },
  // ── Underpriced BUY tier ──
  { address: '1900 S Lamar St', city: 'Dallas', zip: '75215', lat: 32.7680, lng: -96.7990, type: 'MULTI_FAMILY', price: 2200000, sqft: 25000, yearBuilt: 1975, zestimate: 3800000, rentEst: 28000, compAvgPpsf: 155, walkScore: 55, transitScore: 30, dom: 65, compsCount: 5 },
  { address: '800 W Magnolia Ave', city: 'Fort Worth', zip: '76104', lat: 32.7350, lng: -97.3380, type: 'RETAIL', price: 1100000, sqft: 8500, yearBuilt: 1972, zestimate: 1900000, rentEst: 11000, compAvgPpsf: 200, walkScore: 78, transitScore: 42, dom: 75, compsCount: 5 },
  { address: '5800 E Grand Ave', city: 'Dallas', zip: '75223', lat: 32.7830, lng: -96.7530, type: 'MIXED_USE', price: 1500000, sqft: 14000, yearBuilt: 1968, zestimate: 2600000, rentEst: 16000, compAvgPpsf: 175, walkScore: 60, transitScore: 28, dom: 88, compsCount: 5 },
  { address: '2400 N Main St', city: 'Fort Worth', zip: '76106', lat: 32.7750, lng: -97.3350, type: 'OFFICE', price: 1800000, sqft: 16000, yearBuilt: 1980, zestimate: 2900000, rentEst: 17000, compAvgPpsf: 170, walkScore: 68, transitScore: 35, dom: 55, compsCount: 5 },
  { address: '4100 Maple Ave', city: 'Dallas', zip: '75219', lat: 32.8060, lng: -96.8130, type: 'RETAIL', price: 1300000, sqft: 9000, yearBuilt: 1985, zestimate: 2200000, rentEst: 13000, compAvgPpsf: 220, walkScore: 82, transitScore: 48, dom: 42, compsCount: 5 },
  { address: '7800 Marvin D Love Fwy', city: 'Dallas', zip: '75237', lat: 32.6745, lng: -96.8450, type: 'RETAIL', price: 950000, sqft: 6500, yearBuilt: 1985, zestimate: 980000, rentEst: 5500, compAvgPpsf: 155, walkScore: 35, transitScore: 15, dom: 160, compsCount: 2 },
  { address: '4200 S Buckner Blvd', city: 'Dallas', zip: '75227', lat: 32.7360, lng: -96.6750, type: 'MULTI_FAMILY', price: 3800000, sqft: 28000, yearBuilt: 1980, zestimate: 3900000, rentEst: 25000, compAvgPpsf: 140, walkScore: 40, transitScore: 18, dom: 110, compsCount: 3 },
  { address: '1500 8th Ave', city: 'Fort Worth', zip: '76104', lat: 32.7380, lng: -97.3220, type: 'LAND', price: 800000, sqft: 0, yearBuilt: 0, zestimate: 850000, rentEst: 0, compAvgPpsf: 0, walkScore: 60, transitScore: 35, dom: 200, compsCount: 1 },
  { address: '9000 Harry Hines Blvd', city: 'Dallas', zip: '75235', lat: 32.8470, lng: -96.8650, type: 'INDUSTRIAL', price: 5500000, sqft: 50000, yearBuilt: 1978, zestimate: 5300000, rentEst: 25000, compAvgPpsf: 108, walkScore: 25, transitScore: 10, dom: 180, compsCount: 3 },
  { address: '12500 Inwood Rd', city: 'Dallas', zip: '75244', lat: 32.9200, lng: -96.8407, type: 'OFFICE', price: 8500000, sqft: 48000, yearBuilt: 2010, zestimate: 8400000, rentEst: 45000, compAvgPpsf: 175, walkScore: 42, transitScore: 20, dom: 90, compsCount: 5 },
  { address: '200 W Abram St', city: 'Arlington', zip: '76010', lat: 32.7337, lng: -97.1110, type: 'OTHER', price: 1100000, sqft: 7000, yearBuilt: 1965, zestimate: 1050000, rentEst: 5000, compAvgPpsf: 160, walkScore: 55, transitScore: 12, dom: 250, compsCount: 2 },
  { address: '3100 Harwood St', city: 'Dallas', zip: '75201', lat: 32.7899, lng: -96.8001, type: 'OFFICE', price: 9200000, sqft: 52000, yearBuilt: 2018, zestimate: 10500000, rentEst: 65000, compAvgPpsf: 198, walkScore: 93, transitScore: 75, dom: 15, compsCount: 8 },
  { address: '2000 Lamar St', city: 'Dallas', zip: '75202', lat: 32.7830, lng: -96.7990, type: 'MULTI_FAMILY', price: 11500000, sqft: 75000, yearBuilt: 2016, zestimate: 12800000, rentEst: 85000, compAvgPpsf: 168, walkScore: 88, transitScore: 65, dom: 20, compsCount: 7 },
  { address: '4000 Maple Ave', city: 'Dallas', zip: '75219', lat: 32.8050, lng: -96.8120, type: 'RETAIL', price: 1700000, sqft: 8800, yearBuilt: 1990, zestimate: 2100000, rentEst: 14000, compAvgPpsf: 225, walkScore: 80, transitScore: 50, dom: 28, compsCount: 5 },
  { address: '7700 Windrose Ave', city: 'Plano', zip: '75024', lat: 33.0785, lng: -96.8285, type: 'MIXED_USE', price: 6800000, sqft: 38000, yearBuilt: 2019, zestimate: 7400000, rentEst: 46000, compAvgPpsf: 195, walkScore: 62, transitScore: 22, dom: 32, compsCount: 6 },
  { address: '1800 N Market St', city: 'Dallas', zip: '75202', lat: 32.7888, lng: -96.7965, type: 'OFFICE', price: 6500000, sqft: 38000, yearBuilt: 1995, zestimate: 7500000, rentEst: 44000, compAvgPpsf: 195, walkScore: 90, transitScore: 68, dom: 48, compsCount: 6 },
  { address: '5500 Greenville Ave', city: 'Dallas', zip: '75206', lat: 32.8352, lng: -96.7660, type: 'RETAIL', price: 2400000, sqft: 11000, yearBuilt: 2000, zestimate: 2800000, rentEst: 18000, compAvgPpsf: 245, walkScore: 85, transitScore: 48, dom: 18, compsCount: 6 },
  { address: '3800 Alliance Gateway Fwy', city: 'Fort Worth', zip: '76177', lat: 32.9665, lng: -97.3200, type: 'INDUSTRIAL', price: 9500000, sqft: 110000, yearBuilt: 2017, zestimate: 10200000, rentEst: 55000, compAvgPpsf: 95, walkScore: 10, transitScore: 3, dom: 40, compsCount: 5 },
  { address: '1600 Pacific Ave', city: 'Dallas', zip: '75201', lat: 32.7855, lng: -96.7962, type: 'MIXED_USE', price: 8800000, sqft: 48000, yearBuilt: 2012, zestimate: 10000000, rentEst: 62000, compAvgPpsf: 205, walkScore: 94, transitScore: 78, dom: 22, compsCount: 7 },
  { address: '2300 W Mockingbird Ln', city: 'Dallas', zip: '75235', lat: 32.8374, lng: -96.8580, type: 'RETAIL', price: 3100000, sqft: 16000, yearBuilt: 1992, zestimate: 3400000, rentEst: 22000, compAvgPpsf: 210, walkScore: 68, transitScore: 42, dom: 55, compsCount: 4 },
  { address: '9800 Hillcrest Rd', city: 'Dallas', zip: '75230', lat: 32.8880, lng: -96.7950, type: 'OFFICE', price: 4800000, sqft: 28000, yearBuilt: 2004, zestimate: 5200000, rentEst: 32000, compAvgPpsf: 188, walkScore: 55, transitScore: 25, dom: 62, compsCount: 5 },
  { address: '600 N Pearl St', city: 'Dallas', zip: '75201', lat: 32.7890, lng: -96.7980, type: 'OFFICE', price: 15000000, sqft: 85000, yearBuilt: 2020, zestimate: 16500000, rentEst: 105000, compAvgPpsf: 195, walkScore: 95, transitScore: 80, dom: 30, compsCount: 8 },
  { address: '1400 N Beckley Ave', city: 'Dallas', zip: '75203', lat: 32.7785, lng: -96.8210, type: 'MULTI_FAMILY', price: 2800000, sqft: 22000, yearBuilt: 1975, zestimate: 3400000, rentEst: 24000, compAvgPpsf: 145, walkScore: 60, transitScore: 35, dom: 78, compsCount: 4 },
  { address: '5200 S Hulen St', city: 'Fort Worth', zip: '76132', lat: 32.6780, lng: -97.3870, type: 'RETAIL', price: 3900000, sqft: 20000, yearBuilt: 2008, zestimate: 4200000, rentEst: 27000, compAvgPpsf: 215, walkScore: 55, transitScore: 15, dom: 35, compsCount: 5 },
  { address: '7000 Glenview Dr', city: 'Richland Hills', zip: '76118', lat: 32.8110, lng: -97.2280, type: 'INDUSTRIAL', price: 2400000, sqft: 30000, yearBuilt: 1990, zestimate: 2700000, rentEst: 15000, compAvgPpsf: 90, walkScore: 22, transitScore: 8, dom: 68, compsCount: 3 },
];

function generateComps(def: MockDef, count: number): Partial<Comp>[] {
  const comps: Partial<Comp>[] = [];
  const basePpsf = def.compAvgPpsf;
  for (let i = 0; i < count; i++) {
    const variation = 0.85 + Math.random() * 0.30;
    const ppsf = Math.round(basePpsf * variation * 100) / 100;
    const sqft = def.sqft ? Math.round(def.sqft * (0.7 + Math.random() * 0.6)) : undefined;
    const soldPrice = sqft ? Math.round(ppsf * sqft) : Math.round(def.price * variation);
    const daysAgo = 30 + Math.floor(Math.random() * 330);
    const soldDate = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
    const streetNum = 100 + Math.floor(Math.random() * 9000);
    const streets = ['Oak St','Elm Ave','Main Blvd','Commerce Dr','Industrial Way','Park Ln','Market St','Cedar Rd'];
    comps.push({
      address: `${streetNum} ${streets[i % streets.length]}, ${def.city}, TX`,
      soldPrice, soldDate, sqft, pricePerSqft: ppsf,
      distanceMiles: Math.round((0.2 + Math.random() * 4.8) * 10) / 10,
    });
  }
  return comps;
}

export function seedMockData(): { count: number } {
  const existing = getPropertyCount();
  if (existing > 0) return { count: existing };

  let count = 0;
  for (const def of MOCK_PROPERTIES) {
    const zpid = `MOCK-${uid()}`;
    const ppsf = def.sqft > 0 ? Math.round((def.price / def.sqft) * 100) / 100 : undefined;

    const partial: Partial<Property> & { zpid: string } = {
      zpid,
      address: def.address,
      city: def.city,
      state: 'TX',
      zipCode: def.zip,
      lat: def.lat,
      lng: def.lng,
      propertyType: def.type,
      listingPrice: def.price,
      sqft: def.sqft || undefined,
      yearBuilt: def.yearBuilt || undefined,
      pricePerSqft: ppsf,
      zestimateValue: def.zestimate,
      zestimateLow: Math.round(def.zestimate * 0.9),
      zestimateHigh: Math.round(def.zestimate * 1.1),
      rentEstimate: def.rentEst,
      compAvgPpsf: def.compAvgPpsf > 0 ? def.compAvgPpsf : undefined,
      zestimateConfidence: def.compsCount >= 5 ? 'HIGH' : def.compsCount >= 3 ? 'MEDIUM' : 'LOW',
      walkScore: def.walkScore,
      transitScore: def.transitScore,
      bikeScore: Math.round(def.walkScore * 0.6),
      listingStatus: 'FOR_SALE',
      daysOnMarket: def.dom,
      listedDate: new Date(Date.now() - def.dom * 86400000).toISOString().slice(0, 10),
      enrichmentStatus: 'COMPLETE',
      scoreVersion: 1,
    };

    const comps = generateComps(def, def.compsCount);
    const scoreInput = { ...partial, comps } as Property;
    const score = computeScore(scoreInput);
    const flag = assignFlag(score);

    partial.underpricingScore = score.total;
    partial.compGapScore = score.compGap;
    partial.zestimateGapScore = score.zestimateGap;
    partial.rentYieldScore = score.rentYield;
    partial.investmentFlag = flag;

    const id = upsertProperty(partial);
    upsertComps(id, comps);

    const history: Partial<PriceHistory>[] = [
      { date: partial.listedDate!, price: def.price, event: 'LISTED' },
    ];
    if (def.dom > 60) {
      history.push({ date: new Date(Date.now() - (def.dom - 30) * 86400000).toISOString().slice(0, 10), price: Math.round(def.price * 1.05), event: 'PRICE_REDUCTION' });
    }
    upsertPriceHistory(id, history);
    count++;
  }
  return { count };
}
