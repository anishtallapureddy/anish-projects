import Link from "next/link";

const steps = [
  {
    icon: "🏠",
    title: "Enter Property Details",
    description:
      "Provide basic information about your commercial or residential rental property — address, type, cost basis, and year placed in service.",
  },
  {
    icon: "⚙️",
    title: "AI Analyzes Components",
    description:
      "Our engine breaks down your property into IRS-recognized asset classes — land improvements, personal property, and building components.",
  },
  {
    icon: "📋",
    title: "Download Your Report",
    description:
      "Receive a professional, IRS-compliant cost segregation report with detailed depreciation schedules ready for your CPA.",
  },
];

const benefits = [
  {
    icon: "💰",
    title: "Save $10K–$100K+ in Taxes",
    description:
      "Accelerate depreciation deductions in the early years of property ownership and dramatically reduce your federal tax liability.",
  },
  {
    icon: "📉",
    title: "80% Less Than Traditional Studies",
    description:
      "Traditional engineering-based studies cost $5,000–$15,000+. CostSeg Pro delivers comparable results starting at just $149 per report.",
  },
  {
    icon: "✅",
    title: "IRS-Compliant Methodology",
    description:
      "Our reports follow IRS Audit Techniques Guidelines and use accepted cost segregation methodologies recognized by tax professionals.",
  },
  {
    icon: "📊",
    title: "Professional PDF Reports",
    description:
      "Download beautifully formatted reports with asset breakdowns, depreciation schedules, and supporting documentation your CPA will love.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it out with a quick estimate",
    features: [
      "1 property estimate",
      "Basic component analysis",
      "Summary depreciation preview",
      "No PDF download",
    ],
    cta: "Start Free",
    href: "/property",
    highlighted: false,
  },
  {
    name: "Per Report",
    price: "$149",
    period: "one-time",
    description: "Full report for a single property",
    features: [
      "Complete PDF report",
      "All IRS asset classes",
      "Detailed depreciation schedules",
      "CPA-ready documentation",
      "Email support",
    ],
    cta: "Generate Report",
    href: "/property",
    highlighted: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For CPAs and portfolio owners",
    features: [
      "Unlimited reports",
      "Portfolio dashboard",
      "White-label option",
      "Bulk property upload",
      "Priority support",
      "API access",
    ],
    cta: "Go Pro",
    href: "/property",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What is a cost segregation study?",
    answer:
      "A cost segregation study is an IRS-approved tax strategy that reclassifies components of a building into shorter depreciation categories (5, 7, or 15 years) instead of the standard 27.5 or 39 years. This accelerates your depreciation deductions and can significantly reduce your taxes in the early years of ownership.",
  },
  {
    question: "Who benefits from cost segregation?",
    answer:
      "Any owner of commercial property or residential rental property with a cost basis of $500,000 or more is a strong candidate. This includes office buildings, retail centers, apartments, warehouses, restaurants, and more. It's also valuable for properties that have been recently purchased, constructed, or renovated.",
  },
  {
    question: "Is this report accepted by the IRS?",
    answer:
      "Our reports follow IRS Audit Techniques Guidelines for cost segregation studies and use accepted engineering-based and residual estimation methodologies. We recommend having your CPA or tax advisor review the report before filing, as they can tailor it to your specific tax situation.",
  },
  {
    question: "How is this different from a traditional cost segregation study?",
    answer:
      "Traditional studies require an on-site engineering inspection and can cost $5,000–$15,000+. CostSeg Pro uses AI-powered analysis combined with industry cost data to produce comparable results at a fraction of the price, delivered in minutes instead of weeks.",
  },
  {
    question: "Can I use this for a property I purchased years ago?",
    answer:
      "Yes. The IRS allows you to perform a cost segregation study on properties purchased in prior years and claim the missed depreciation through a \"catch-up\" deduction (Form 3115) — no need to amend prior returns.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-blue-700">
            📊 CostSeg Pro
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-700">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-700">
              Pricing
            </a>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-700">
              Dashboard
            </Link>
            <Link
              href="/property"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
            🏠 AI-Powered Cost Segregation
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Maximize Your Property{" "}
            <span className="text-blue-600">Tax Savings</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Generate IRS-compliant cost segregation reports in minutes — not
            weeks. Accelerate depreciation, reduce your tax bill by tens of
            thousands, and keep more of your rental income.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/property"
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700"
            >
              Get Started Free →
            </Link>
            <a
              href="#how-it-works"
              className="text-base font-semibold text-blue-700 hover:text-blue-800"
            >
              See How It Works ↓
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required · First estimate is free
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
            Three simple steps to unlock thousands in tax savings.
          </p>
          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
                  {step.icon}
                </div>
                <p className="mt-2 text-sm font-bold text-blue-600">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Benefits ── */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Why Property Owners Choose CostSeg Pro
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <span className="text-3xl">{b.icon}</span>
                <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-gray-500">
            No hidden fees. Pay only for what you need.
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  tier.highlighted
                    ? "border-blue-600 shadow-lg ring-1 ring-blue-600"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tier.description}
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="ml-1 text-sm text-gray-500">
                      {tier.period}
                    </span>
                  )}
                </p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-600">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-blue-600">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block rounded-lg py-3 text-center text-sm font-semibold ${
                    tier.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-16 space-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
                <dt className="text-base font-semibold leading-7">
                  {faq.question}
                </dt>
                <dd className="mt-3 text-sm leading-6 text-gray-500">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-lg font-bold text-blue-700">📊 CostSeg Pro</p>
          <p className="mt-4 text-xs leading-5 text-gray-400">
            Disclaimer: CostSeg Pro provides estimates for informational
            purposes only and does not constitute tax, legal, or financial
            advice. Consult a qualified tax professional or CPA before making
            any tax-related decisions. Results may vary based on individual
            property characteristics and applicable tax law.
          </p>
          <p className="mt-6 text-xs text-gray-300">
            © {new Date().getFullYear()} CostSeg Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
