// ============================================================
// Cost Segregation — Depreciation Calculator
// ============================================================
// Computes MACRS depreciation schedules, bonus depreciation,
// and NPV tax savings for cost segregation analysis.

import { ClassificationResult, ClassifiedComponent } from './classification';

export interface DepreciationSchedule {
  year: number;
  fiveYear: number;
  sevenYear: number;
  fifteenYear: number;
  twentySevenYear: number;
  totalAccelerated: number;
  totalStraightLine: number;
  annualSavings: number; // difference in depreciation
}

export interface TaxSavingsResult {
  schedule: DepreciationSchedule[];
  firstYearBonus: number;
  totalAcceleratedDeduction: number;
  totalStraightLineDeduction: number;
  fiveYearSavings: number;
  tenYearSavings: number;
  totalSavings: number;
  npvSavings: number; // at assumed discount rate
  bonusDepreciationRate: number;
}

// MACRS Half-Year Convention rates
const MACRS_5_YEAR = [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576];
const MACRS_7_YEAR = [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446];
const MACRS_15_YEAR = [0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623, 0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0295];

// Straight-line rate for 27.5-year residential
const SL_27_5_RATE = 1 / 27.5;

// Bonus depreciation phase-down schedule
function getBonusRate(acquisitionYear: number): number {
  if (acquisitionYear <= 2022) return 1.00;
  if (acquisitionYear === 2023) return 0.80;
  if (acquisitionYear === 2024) return 0.60;
  if (acquisitionYear === 2025) return 0.40;
  if (acquisitionYear === 2026) return 0.20;
  return 0.00; // 2027+
}

export function calculateDepreciation(
  classification: ClassificationResult,
  taxRate: number = 0.37, // top marginal rate
  discountRate: number = 0.06 // for NPV
): TaxSavingsResult {
  const acquisitionYear = new Date(classification.property.acquisitionDate).getFullYear();
  const bonusRate = getBonusRate(acquisitionYear);

  const { fiveYear, sevenYear, fifteenYear, twentySevenYear } = classification.summary;
  const totalBuilding = fiveYear + sevenYear + fifteenYear + twentySevenYear;

  // Calculate bonus depreciation (applies to 5, 7, and 15-year property)
  const bonusEligible = fiveYear + sevenYear + fifteenYear;
  const firstYearBonus = Math.round(bonusEligible * bonusRate);
  const remainingAfterBonus5 = fiveYear - Math.round(fiveYear * bonusRate);
  const remainingAfterBonus7 = sevenYear - Math.round(sevenYear * bonusRate);
  const remainingAfterBonus15 = fifteenYear - Math.round(fifteenYear * bonusRate);

  // Build year-by-year schedule (28 years to cover full 27.5-year)
  const schedule: DepreciationSchedule[] = [];

  // Straight-line comparison: everything at 27.5 years
  const straightLineAnnual = Math.round(totalBuilding * SL_27_5_RATE);

  for (let year = 1; year <= 28; year++) {
    const yr5 = year <= MACRS_5_YEAR.length
      ? Math.round(remainingAfterBonus5 * MACRS_5_YEAR[year - 1])
      : 0;
    const yr7 = year <= MACRS_7_YEAR.length
      ? Math.round(remainingAfterBonus7 * MACRS_7_YEAR[year - 1])
      : 0;
    const yr15 = year <= MACRS_15_YEAR.length
      ? Math.round(remainingAfterBonus15 * MACRS_15_YEAR[year - 1])
      : 0;
    const yr27 = year <= 27
      ? Math.round(twentySevenYear * SL_27_5_RATE)
      : year === 28
      ? Math.round(twentySevenYear * (SL_27_5_RATE * 0.5)) // half-year in final year
      : 0;

    const bonus = year === 1 ? firstYearBonus : 0;
    const totalAccelerated = yr5 + yr7 + yr15 + yr27 + bonus;
    const totalStraightLine = year <= 27
      ? straightLineAnnual
      : year === 28
      ? Math.round(straightLineAnnual * 0.5)
      : 0;
    const annualSavings = Math.round((totalAccelerated - totalStraightLine) * taxRate);

    schedule.push({
      year,
      fiveYear: yr5 + (year === 1 ? Math.round(fiveYear * bonusRate) : 0),
      sevenYear: yr7 + (year === 1 ? Math.round(sevenYear * bonusRate) : 0),
      fifteenYear: yr15 + (year === 1 ? Math.round(fifteenYear * bonusRate) : 0),
      twentySevenYear: yr27,
      totalAccelerated,
      totalStraightLine,
      annualSavings,
    });
  }

  // Aggregate savings
  const totalAcceleratedDeduction = schedule.reduce((s, r) => s + r.totalAccelerated, 0);
  const totalStraightLineDeduction = schedule.reduce((s, r) => s + r.totalStraightLine, 0);
  const fiveYearSavings = schedule.slice(0, 5).reduce((s, r) => s + r.annualSavings, 0);
  const tenYearSavings = schedule.slice(0, 10).reduce((s, r) => s + r.annualSavings, 0);
  const totalSavings = schedule.reduce((s, r) => s + r.annualSavings, 0);

  // NPV of tax savings
  const npvSavings = schedule.reduce((npv, row) => {
    return npv + row.annualSavings / Math.pow(1 + discountRate, row.year);
  }, 0);

  return {
    schedule,
    firstYearBonus,
    totalAcceleratedDeduction,
    totalStraightLineDeduction,
    fiveYearSavings,
    tenYearSavings,
    totalSavings,
    npvSavings: Math.round(npvSavings),
    bonusDepreciationRate: bonusRate,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
