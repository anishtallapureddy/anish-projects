'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Renovation {
  description: string;
  cost: number | '';
  date: string;
  category: string;
}

interface Features {
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
  hasDecorative: boolean;
  hasDedicatedElectrical: boolean;
  hasSpecialPlumbing: boolean;
  numberOfBedrooms: number | '';
  numberOfBathrooms: number | '';
  garageType: string;
}

interface FormData {
  address: string;
  purchasePrice: number | '';
  landValue: number | '';
  buildingType: string;
  yearBuilt: number | '';
  acquisitionDate: string;
  squareFootage: number | '';
  numberOfUnits: number;
  features: Features;
  renovations: Renovation[];
}

const BUILDING_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family_2_4', label: 'Multi-Family 2-4 Units' },
  { value: 'multi_family_5_plus', label: 'Multi-Family 5+ Units' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];

const RENOVATION_CATEGORIES = [
  'Kitchen',
  'Bathroom',
  'Flooring',
  'Exterior',
  'Landscaping',
  'Electrical',
  'Plumbing',
  'General',
];

const FEATURE_CHECKBOXES: { key: keyof Features; label: string }[] = [
  { key: 'hasPool', label: 'Has Pool' },
  { key: 'hasFencing', label: 'Has Fencing' },
  { key: 'hasLandscaping', label: 'Has Landscaping' },
  { key: 'hasDriveway', label: 'Has Driveway' },
  { key: 'hasSidewalk', label: 'Has Sidewalk' },
  { key: 'hasOutdoorLighting', label: 'Has Outdoor Lighting' },
  { key: 'hasSecuritySystem', label: 'Has Security System' },
  { key: 'hasCarpeting', label: 'Has Carpeting' },
  { key: 'hasAppliancesIncluded', label: 'Has Appliances Included' },
  { key: 'hasWindowTreatments', label: 'Has Window Treatments' },
  { key: 'hasCabinetry', label: 'Has Cabinetry' },
  { key: 'hasDecorative', label: 'Has Decorative (moldings, fixtures)' },
  { key: 'hasDedicatedElectrical', label: 'Has Dedicated Electrical' },
  { key: 'hasSpecialPlumbing', label: 'Has Special Plumbing' },
];

export default function PropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    address: '',
    purchasePrice: '',
    landValue: '',
    buildingType: 'single_family',
    yearBuilt: '',
    acquisitionDate: '',
    squareFootage: '',
    numberOfUnits: 1,
    features: {
      hasPool: false,
      hasFencing: false,
      hasLandscaping: false,
      hasDriveway: false,
      hasSidewalk: false,
      hasOutdoorLighting: false,
      hasSecuritySystem: false,
      hasCarpeting: false,
      hasAppliancesIncluded: false,
      hasWindowTreatments: false,
      hasCabinetry: false,
      hasDecorative: false,
      hasDedicatedElectrical: false,
      hasSpecialPlumbing: false,
      numberOfBedrooms: '',
      numberOfBathrooms: '',
      garageType: 'none',
    },
    renovations: [],
  });

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateFeature<K extends keyof Features>(key: K, value: Features[K]) {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }));
  }

  function addRenovation() {
    setFormData((prev) => ({
      ...prev,
      renovations: [
        ...prev.renovations,
        { description: '', cost: '', date: '', category: 'General' },
      ],
    }));
  }

  function updateRenovation(index: number, field: keyof Renovation, value: string | number) {
    setFormData((prev) => {
      const updated = [...prev.renovations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, renovations: updated };
    });
  }

  function removeRenovation(index: number) {
    setFormData((prev) => ({
      ...prev,
      renovations: prev.renovations.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError('');

    try {
      const propertyPayload = {
        address: formData.address,
        purchasePrice: Number(formData.purchasePrice),
        landValue: formData.landValue !== '' ? Number(formData.landValue) : undefined,
        buildingType: formData.buildingType,
        yearBuilt: formData.yearBuilt !== '' ? Number(formData.yearBuilt) : undefined,
        acquisitionDate: formData.acquisitionDate,
        squareFootage: formData.squareFootage !== '' ? Number(formData.squareFootage) : undefined,
        numberOfUnits: Number(formData.numberOfUnits),
        features: {
          ...formData.features,
          numberOfBedrooms:
            formData.features.numberOfBedrooms !== ''
              ? Number(formData.features.numberOfBedrooms)
              : undefined,
          numberOfBathrooms:
            formData.features.numberOfBathrooms !== ''
              ? Number(formData.features.numberOfBathrooms)
              : undefined,
        },
        renovations: formData.renovations.map((r) => ({
          description: r.description,
          cost: Number(r.cost),
          date: r.date,
          category: r.category,
        })),
      };

      const propRes = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyPayload),
      });

      if (!propRes.ok) {
        throw new Error('Failed to save property');
      }

      const property = await propRes.json();

      const reportRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      });

      if (!reportRes.ok) {
        throw new Error('Failed to generate report');
      }

      const report = await reportRes.json();
      router.push(`/report/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  }

  const stepLabels = ['Property Details', 'Property Features', 'Renovations'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CostSeg Pro
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={label} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <span
                    className={`mt-1 text-xs ${isActive || isCompleted ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-2">
            {stepLabels.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded ${step > i ? 'bg-blue-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8">
          {/* Step 1: Property Details */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        updateField('purchasePrice', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Land Value
                    </label>
                    <input
                      type="number"
                      value={formData.landValue}
                      onChange={(e) =>
                        updateField('landValue', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="100000"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank to estimate at 20% of purchase price
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Building Type
                    </label>
                    <select
                      value={formData.buildingType}
                      onChange={(e) => updateField('buildingType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {BUILDING_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) =>
                        updateField('yearBuilt', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="2005"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acquisition Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.acquisitionDate}
                      onChange={(e) => updateField('acquisitionDate', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={formData.squareFootage}
                      onChange={(e) =>
                        updateField('squareFootage', e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Units
                    </label>
                    <input
                      type="number"
                      value={formData.numberOfUnits}
                      onChange={(e) =>
                        updateField('numberOfUnits', e.target.value === '' ? 1 : Number(e.target.value))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Features */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {FEATURE_CHECKBOXES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features[key] as boolean}
                      onChange={(e) => updateFeature(key, e.target.checked as never)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Bedrooms
                    </label>
                    <input
                      type="number"
                      value={formData.features.numberOfBedrooms}
                      onChange={(e) =>
                        updateFeature(
                          'numberOfBedrooms',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Bathrooms
                    </label>
                    <input
                      type="number"
                      value={formData.features.numberOfBathrooms}
                      onChange={(e) =>
                        updateFeature(
                          'numberOfBathrooms',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Garage Type
                    </label>
                    <select
                      value={formData.features.garageType}
                      onChange={(e) => updateFeature('garageType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="none">None</option>
                      <option value="attached">Attached</option>
                      <option value="detached">Detached</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Renovations */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Renovations</h2>
                <button
                  type="button"
                  onClick={addRenovation}
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  + Add Renovation
                </button>
              </div>

              {formData.renovations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No renovations added. This step is optional — click &quot;Add Renovation&quot; to
                  include any property improvements.
                </p>
              )}

              <div className="space-y-4">
                {formData.renovations.map((renovation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeRenovation(index)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-sm"
                      aria-label="Remove renovation"
                    >
                      ✕
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={renovation.description}
                          onChange={(e) =>
                            updateRenovation(index, 'description', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="e.g. Kitchen remodel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cost
                        </label>
                        <input
                          type="number"
                          value={renovation.cost}
                          onChange={(e) =>
                            updateRenovation(
                              index,
                              'cost',
                              e.target.value === '' ? '' : Number(e.target.value)
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          placeholder="25000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={renovation.date}
                          onChange={(e) => updateRenovation(index, 'date', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={renovation.category}
                          onChange={(e) => updateRenovation(index, 'category', e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          {RENOVATION_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {isSubmitting ? 'Generating…' : 'Generate Report'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
