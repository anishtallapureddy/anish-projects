// ============================================================
// Cost Segregation — Component Classification Engine
// ============================================================
// Allocates property costs across IRS depreciation categories
// based on property type, age, features, and industry benchmarks.
// References: IRS Audit Technique Guide for Cost Segregation,
// Rev. Proc. 87-56, MACRS asset class lives.

export interface PropertyInput {
  purchasePrice: number;
  landValue: number | null; // if null, estimate at 20% of purchase price
  buildingType: 'single_family' | 'multi_family_2_4' | 'multi_family_5_plus' | 'condo' | 'townhouse';
  yearBuilt: number;
  acquisitionDate: string; // ISO date
  squareFootage: number;
  numberOfUnits: number;
  features: PropertyFeatures;
  renovations: Renovation[];
}

export interface PropertyFeatures {
  hasPool: boolean;
  hasFencing: boolean;
  hasLandscaping: boolean;
  hasDriveway: boolean;
  hasSidewalk: boolean;
  hasOutdoorLighting: boolean;
  hasSecuritySystem: boolean;
  hasCarpeting: boolean;
  hasAppliancesIncluded: boolean;
  hasWindowTreatments: boolean;
  hasCabinetry: boolean;
  hasDecorative: boolean; // decorative lighting, moldings, etc.
  hasDedicatedElectrical: boolean; // dedicated circuits for appliances
  hasSpecialPlumbing: boolean; // non-structural plumbing (disposals, ice makers)
  numberOfBathrooms: number;
  numberOfBedrooms: number;
  garageType: 'none' | 'attached' | 'detached';
}

export interface Renovation {
  description: string;
  cost: number;
  date: string;
  category: 'kitchen' | 'bathroom' | 'flooring' | 'exterior' | 'landscaping' | 'electrical' | 'plumbing' | 'general';
}

export interface ClassifiedComponent {
  name: string;
  category: '5-year' | '7-year' | '15-year' | '27.5-year' | 'land';
  recoveryPeriod: number; // years
  cost: number;
  irsClass: string;
  description: string;
}

export interface ClassificationResult {
  property: PropertyInput;
  components: ClassifiedComponent[];
  summary: {
    fiveYear: number;
    sevenYear: number;
    fifteenYear: number;
    twentySevenYear: number;
    land: number;
    total: number;
    acceleratedPercent: number; // % of building cost in 5/7/15-year
  };
}

// Base allocation percentages by building type (industry benchmarks)
// These represent typical % of building value (excluding land)
const BASE_ALLOCATIONS: Record<string, { fiveYear: number; sevenYear: number; fifteenYear: number }> = {
  single_family:     { fiveYear: 0.12, sevenYear: 0.02, fifteenYear: 0.08 },
  multi_family_2_4:  { fiveYear: 0.14, sevenYear: 0.02, fifteenYear: 0.09 },
  multi_family_5_plus: { fiveYear: 0.16, sevenYear: 0.03, fifteenYear: 0.10 },
  condo:             { fiveYear: 0.10, sevenYear: 0.01, fifteenYear: 0.04 },
  townhouse:         { fiveYear: 0.11, sevenYear: 0.02, fifteenYear: 0.06 },
};

// Feature-based adjustments (additional % of building value)
const FEATURE_ADJUSTMENTS: Record<string, { category: '5-year' | '7-year' | '15-year'; percent: number; name: string; irsClass: string }> = {
  hasPool:               { category: '15-year', percent: 0.04, name: 'Swimming Pool', irsClass: '00.3 Land Improvements' },
  hasFencing:            { category: '15-year', percent: 0.015, name: 'Fencing', irsClass: '00.3 Land Improvements' },
  hasLandscaping:        { category: '15-year', percent: 0.02, name: 'Landscaping & Irrigation', irsClass: '00.3 Land Improvements' },
  hasDriveway:           { category: '15-year', percent: 0.02, name: 'Driveway & Parking', irsClass: '00.3 Land Improvements' },
  hasSidewalk:           { category: '15-year', percent: 0.01, name: 'Sidewalks & Paths', irsClass: '00.3 Land Improvements' },
  hasOutdoorLighting:    { category: '15-year', percent: 0.008, name: 'Outdoor Lighting', irsClass: '00.3 Land Improvements' },
  hasSecuritySystem:     { category: '5-year', percent: 0.01, name: 'Security System', irsClass: '57.0 Distributive Trades' },
  hasCarpeting:          { category: '5-year', percent: 0.03, name: 'Carpeting & Padding', irsClass: '57.0 Distributive Trades' },
  hasAppliancesIncluded: { category: '5-year', percent: 0.025, name: 'Appliances (Fridge, Stove, Dishwasher, Washer/Dryer)', irsClass: '57.0 Distributive Trades' },
  hasWindowTreatments:   { category: '5-year', percent: 0.01, name: 'Window Treatments (Blinds, Curtain Rods)', irsClass: '57.0 Distributive Trades' },
  hasCabinetry:          { category: '5-year', percent: 0.02, name: 'Removable Cabinetry & Countertops', irsClass: '57.0 Distributive Trades' },
  hasDecorative:         { category: '5-year', percent: 0.012, name: 'Decorative Lighting & Moldings', irsClass: '57.0 Distributive Trades' },
  hasDedicatedElectrical:{ category: '5-year', percent: 0.015, name: 'Dedicated Electrical Circuits', irsClass: '57.0 Distributive Trades' },
  hasSpecialPlumbing:    { category: '5-year', percent: 0.008, name: 'Special-Purpose Plumbing', irsClass: '57.0 Distributive Trades' },
};

// Renovation category to depreciation class mapping
const RENOVATION_CLASSIFICATION: Record<string, { category: '5-year' | '15-year' | '27.5-year'; irsClass: string }> = {
  kitchen:     { category: '5-year', irsClass: '57.0 — Appliances, cabinetry, countertops' },
  bathroom:    { category: '27.5-year', irsClass: '00.11 — Structural improvements' },
  flooring:    { category: '5-year', irsClass: '57.0 — Floor coverings' },
  exterior:    { category: '27.5-year', irsClass: '00.11 — Structural' },
  landscaping: { category: '15-year', irsClass: '00.3 — Land improvements' },
  electrical:  { category: '5-year', irsClass: '57.0 — Dedicated electrical' },
  plumbing:    { category: '27.5-year', irsClass: '00.11 — Structural plumbing' },
  general:     { category: '27.5-year', irsClass: '00.11 — General building' },
};

export function classifyProperty(input: PropertyInput): ClassificationResult {
  const landValue = input.landValue ?? Math.round(input.purchasePrice * 0.20);
  const buildingValue = input.purchasePrice - landValue;
  const components: ClassifiedComponent[] = [];
  const base = BASE_ALLOCATIONS[input.buildingType] || BASE_ALLOCATIONS.single_family;

  let fiveYearTotal = 0;
  let sevenYearTotal = 0;
  let fifteenYearTotal = 0;

  // 1. Base allocations
  const baseFiveYear = Math.round(buildingValue * base.fiveYear);
  const baseSevenYear = Math.round(buildingValue * base.sevenYear);
  const baseFifteenYear = Math.round(buildingValue * base.fifteenYear);

  components.push({
    name: 'Personal Property — Base Allocation',
    category: '5-year',
    recoveryPeriod: 5,
    cost: baseFiveYear,
    irsClass: '57.0 Distributive Trades & Services',
    description: 'Standard personal property components: electrical fixtures, plumbing fixtures, floor coverings, built-in appliances',
  });
  fiveYearTotal += baseFiveYear;

  if (baseSevenYear > 0) {
    components.push({
      name: 'Furniture & Equipment — Base Allocation',
      category: '7-year',
      recoveryPeriod: 7,
      cost: baseSevenYear,
      irsClass: '00.11 Office Furniture & Equipment',
      description: 'Movable furnishings, office equipment, specialized fixtures',
    });
    sevenYearTotal += baseSevenYear;
  }

  components.push({
    name: 'Land Improvements — Base Allocation',
    category: '15-year',
    recoveryPeriod: 15,
    cost: baseFifteenYear,
    irsClass: '00.3 Land Improvements',
    description: 'Paving, curbing, basic landscaping, utility connections, drainage',
  });
  fifteenYearTotal += baseFifteenYear;

  // 2. Feature-based adjustments
  for (const [featureKey, adjustment] of Object.entries(FEATURE_ADJUSTMENTS)) {
    const featureValue = input.features[featureKey as keyof PropertyFeatures];
    if (featureValue === true) {
      const cost = Math.round(buildingValue * adjustment.percent);
      components.push({
        name: adjustment.name,
        category: adjustment.category,
        recoveryPeriod: adjustment.category === '5-year' ? 5 : adjustment.category === '7-year' ? 7 : 15,
        cost,
        irsClass: adjustment.irsClass,
        description: `${adjustment.name} — identified as ${adjustment.category} property per IRS guidelines`,
      });
      if (adjustment.category === '5-year') fiveYearTotal += cost;
      else if (adjustment.category === '7-year') sevenYearTotal += cost;
      else fifteenYearTotal += cost;
    }
  }

  // 3. Multi-unit adjustment (more units = more personal property)
  if (input.numberOfUnits > 1) {
    const multiUnitBonus = Math.round(buildingValue * 0.01 * Math.min(input.numberOfUnits - 1, 10));
    components.push({
      name: `Multi-Unit Adjustment (${input.numberOfUnits} units)`,
      category: '5-year',
      recoveryPeriod: 5,
      cost: multiUnitBonus,
      irsClass: '57.0 Distributive Trades',
      description: 'Additional personal property per unit (fixtures, appliances, coverings)',
    });
    fiveYearTotal += multiUnitBonus;
  }

  // 4. Bathroom adjustment
  if (input.features.numberOfBathrooms > 1) {
    const bathroomExtra = Math.round(buildingValue * 0.005 * (input.features.numberOfBathrooms - 1));
    components.push({
      name: `Bathroom Fixtures (${input.features.numberOfBathrooms} bathrooms)`,
      category: '5-year',
      recoveryPeriod: 5,
      cost: bathroomExtra,
      irsClass: '57.0 — Plumbing fixtures, vanities, mirrors',
      description: 'Non-structural bathroom components: vanities, mirrors, faucets, towel bars',
    });
    fiveYearTotal += bathroomExtra;
  }

  // 5. Renovations
  for (const reno of input.renovations) {
    const classification = RENOVATION_CLASSIFICATION[reno.category] || RENOVATION_CLASSIFICATION.general;
    components.push({
      name: `Renovation: ${reno.description}`,
      category: classification.category,
      recoveryPeriod: classification.category === '5-year' ? 5 : classification.category === '15-year' ? 15 : 27.5,
      cost: reno.cost,
      irsClass: classification.irsClass,
      description: `${reno.description} (${reno.date})`,
    });
    if (classification.category === '5-year') fiveYearTotal += reno.cost;
    else if (classification.category === '15-year') fifteenYearTotal += reno.cost;
  }

  // 6. Remaining goes to 27.5-year structural
  const renovationStructural = input.renovations
    .filter(r => {
      const c = RENOVATION_CLASSIFICATION[r.category] || RENOVATION_CLASSIFICATION.general;
      return c.category === '27.5-year';
    })
    .reduce((sum, r) => sum + r.cost, 0);

  const structuralValue = buildingValue - fiveYearTotal - sevenYearTotal - fifteenYearTotal;

  components.push({
    name: 'Building / Structural Components',
    category: '27.5-year',
    recoveryPeriod: 27.5,
    cost: Math.max(structuralValue, 0),
    irsClass: '00.11 Residential Rental Property',
    description: 'Structural components: foundation, framing, roof, HVAC (central), main plumbing, main electrical, walls, windows, doors',
  });

  // 7. Land
  components.push({
    name: 'Land',
    category: 'land',
    recoveryPeriod: 0,
    cost: landValue,
    irsClass: 'N/A — Non-depreciable',
    description: 'Land value — not subject to depreciation',
  });

  const totalAccelerated = fiveYearTotal + sevenYearTotal + fifteenYearTotal;
  const acceleratedPercent = buildingValue > 0 ? Math.round((totalAccelerated / buildingValue) * 100) : 0;

  return {
    property: input,
    components,
    summary: {
      fiveYear: fiveYearTotal,
      sevenYear: sevenYearTotal,
      fifteenYear: fifteenYearTotal,
      twentySevenYear: Math.max(structuralValue, 0),
      land: landValue,
      total: input.purchasePrice + input.renovations.reduce((s, r) => s + r.cost, 0),
      acceleratedPercent,
    },
  };
}
