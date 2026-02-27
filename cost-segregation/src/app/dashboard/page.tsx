"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Property {
  id: string;
  address: string;
  purchase_price: number;
  building_type: string;
  created_at: string;
}

interface Report {
  id: string;
  property_id: string;
  depreciation: {
    totalSavings: number;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propsRes, reportsRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/reports"),
        ]);
        if (propsRes.ok) setProperties(await propsRes.json());
        if (reportsRes.ok) setReports(await reportsRes.json());
      } catch {
        // Silently handle fetch errors; data stays empty
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getReportForProperty = (propertyId: string) =>
    reports.find((r) => r.property_id === propertyId);

  const totalSavings = reports.reduce((sum, r) => sum + (r.depreciation?.totalSavings ?? 0), 0);

  const handleGenerateReport = async (propertyId: string) => {
    setGenerating(propertyId);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (!res.ok) throw new Error("Failed to generate report");
      const data = await res.json();
      router.push(`/report/${data.id}`);
    } catch {
      setGenerating(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-700 tracking-tight">
            CostSeg Pro
          </Link>
          <Link
            href="/property"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            New Property
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your cost segregation analyses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Properties</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{properties.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reports.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Total Savings</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{fmt(totalSavings)}</p>
          </div>
        </div>

        {/* Properties */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <Link
            href="/property"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Property
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-800">No properties yet</h3>
            <p className="text-gray-500 mt-1 mb-6">
              Add your first property to get started with cost segregation analysis.
            </p>
            <Link
              href="/property"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => {
              const existingReport = getReportForProperty(prop.id);
              const isGenerating = generating === prop.id;

              return (
                <div
                  key={prop.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col"
                >
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {prop.address}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-600 flex-1">
                    <p>
                      <span className="text-gray-400">Purchase Price:</span>{" "}
                      <span className="font-medium text-gray-900">{fmt(prop.purchase_price)}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Building Type:</span>{" "}
                      <span className="font-medium text-gray-900 capitalize">{prop.building_type}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Added:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {new Date(prop.created_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {existingReport ? (
                      <Link
                        href={`/report/${existingReport.id}`}
                        className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        View Report
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleGenerateReport(prop.id)}
                        disabled={isGenerating}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isGenerating ? "Generating…" : "Generate Report"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
