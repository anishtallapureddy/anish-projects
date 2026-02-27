"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Component {
  name: string;
  category: string;
  recoveryPeriod: string;
  cost: number;
  irsClass: string;
  description: string;
}

interface ScheduleRow {
  year: number;
  fiveYear: number;
  sevenYear: number;
  fifteenYear: number;
  twentySevenYear: number;
  totalAccelerated: number;
  totalStraightLine: number;
  annualSavings: number;
}

interface Report {
  id: string;
  property_id: string;
  address: string;
  purchase_price: number;
  classification: {
    property: string;
    components: Component[];
    summary: {
      fiveYear: number;
      sevenYear: number;
      fifteenYear: number;
      twentySevenYear: number;
      land: number;
      total: number;
      acceleratedPercent: number;
    };
  };
  depreciation: {
    schedule: ScheduleRow[];
    firstYearBonus: number;
    totalAcceleratedDeduction: number;
    totalStraightLineDeduction: number;
    fiveYearSavings: number;
    tenYearSavings: number;
    totalSavings: number;
    npvSavings: number;
    bonusDepreciationRate: number;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const categoryColor: Record<string, { bg: string; text: string; bar: string }> = {
  "5-year": { bg: "bg-green-100", text: "text-green-800", bar: "bg-green-500" },
  "7-year": { bg: "bg-blue-100", text: "text-blue-800", bar: "bg-blue-500" },
  "15-year": { bg: "bg-amber-100", text: "text-amber-800", bar: "bg-amber-500" },
  "27.5-year": { bg: "bg-gray-200", text: "text-gray-700", bar: "bg-gray-400" },
  land: { bg: "bg-orange-100", text: "text-orange-900", bar: "bg-orange-700" },
};

function CategoryBadge({ category }: { category: string }) {
  const key = category.toLowerCase();
  const colors = categoryColor[key] ?? { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}

function AllocationChart({ summary, total }: { summary: Report["classification"]["summary"]; total: number }) {
  const segments = [
    { label: "5-Year", value: summary.fiveYear, color: "bg-green-500" },
    { label: "7-Year", value: summary.sevenYear, color: "bg-blue-500" },
    { label: "15-Year", value: summary.fifteenYear, color: "bg-amber-500" },
    { label: "27.5-Year", value: summary.twentySevenYear, color: "bg-gray-400" },
    { label: "Land", value: summary.land, color: "bg-orange-700" },
  ];

  return (
    <div>
      <div className="flex h-8 rounded-lg overflow-hidden">
        {segments.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div key={s.label} className={`${s.color} relative group`} style={{ width: `${pct}%` }}>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${s.color}`} />
            <span className="text-gray-600">{s.label}:</span>
            <span className="font-medium">{fmt(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllYears, setShowAllYears] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const reports: Report[] = await res.json();
        const found = reports.find((r) => r.id === params.id);
        if (!found) throw new Error("Report not found");
        setReport(found);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [params.id]);

  if (loading) return <LoadingSkeleton />;

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800">{error ?? "Report not found"}</h2>
          <Link href="/dashboard" className="inline-block mt-2 text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { classification, depreciation } = report;
  const { summary, components } = classification;
  const schedule = depreciation.schedule;
  const visibleSchedule = showAllYears ? schedule : schedule.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700 tracking-tight">
            CostSeg Pro
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cost Segregation Report</h1>
            <p className="text-gray-500 mt-1">{report.address}</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/property"
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              New Analysis
            </Link>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Executive Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Property Address</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{report.address}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Purchase Price</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{fmt(report.purchase_price)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Accelerated Depreciation</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{summary.acceleratedPercent.toFixed(1)}%</p>
            </div>
          </div>

          {/* Allocation Chart */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Cost Allocation Breakdown</p>
            <AllocationChart summary={summary} total={summary.total} />
          </div>

          {/* Highlighted Savings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <p className="text-xs text-green-700 uppercase tracking-wide font-semibold">First-Year Tax Savings</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{fmt(depreciation.firstYearBonus)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <p className="text-xs text-blue-700 uppercase tracking-wide font-semibold">NPV of Total Tax Savings</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{fmt(depreciation.npvSavings)}</p>
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Component</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Recovery Period</th>
                  <th className="text-right py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IRS Class</th>
                </tr>
              </thead>
              <tbody>
                {components.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 px-3">
                      <CategoryBadge category={c.category} />
                    </td>
                    <td className="py-3 px-3 text-gray-600">{c.recoveryPeriod}</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-900">{fmtFull(c.cost)}</td>
                    <td className="py-3 px-3 text-gray-600">{c.irsClass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Savings Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Savings Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "First Year Bonus Depreciation", value: fmt(depreciation.firstYearBonus) },
              { label: "5-Year Cumulative Savings", value: fmt(depreciation.fiveYearSavings) },
              { label: "10-Year Cumulative Savings", value: fmt(depreciation.tenYearSavings) },
              { label: "Total Savings", value: fmt(depreciation.totalSavings) },
              { label: "NPV Savings", value: fmt(depreciation.npvSavings) },
              { label: "Bonus Depreciation Rate", value: `${(depreciation.bonusDepreciationRate * 100).toFixed(0)}%` },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Depreciation Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Depreciation Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">5-Year</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">7-Year</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">15-Year</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">27.5-Year</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Accelerated</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Straight-Line</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Annual Savings</th>
                </tr>
              </thead>
              <tbody>
                {visibleSchedule.map((row) => (
                  <tr key={row.year} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-2 font-medium text-gray-900">{row.year}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700">{fmtFull(row.fiveYear)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700">{fmtFull(row.sevenYear)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700">{fmtFull(row.fifteenYear)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700">{fmtFull(row.twentySevenYear)}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-gray-900">{fmtFull(row.totalAccelerated)}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-500">{fmtFull(row.totalStraightLine)}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-green-700">{fmtFull(row.annualSavings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {schedule.length > 10 && (
            <button
              onClick={() => setShowAllYears(!showAllYears)}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 print:hidden"
            >
              {showAllYears ? "Show First 10 Years" : `Show All ${schedule.length} Years`}
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-1">Disclaimer</p>
          <p>
            This report is generated using software estimation methods and should be reviewed by a qualified tax
            professional. It is not a substitute for an engineering-based cost segregation study.
          </p>
        </div>
      </div>
    </div>
  );
}
