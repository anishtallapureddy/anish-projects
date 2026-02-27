# Changelog

All notable changes to CostSeg Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-02-27

### Added
- **Classification Engine**: IRS-compliant component classification across 5-year, 7-year, 15-year, 27.5-year, and land categories
- **Depreciation Calculator**: MACRS accelerated depreciation with bonus depreciation phase-down (2023-2026)
- **Property Input Wizard**: 3-step form for property details, features, and renovation history
- **Report Viewer**: Interactive report with executive summary, component breakdown, tax savings, and depreciation schedule
- **Dashboard**: Property portfolio management with report history
- **Landing Page**: Marketing page with pricing tiers and feature highlights
- **API Routes**: RESTful endpoints for properties and reports
- **SQLite Database**: Embedded database with auto-setup
- Feature-based classification adjustments (pool, fencing, landscaping, appliances, etc.)
- Multi-unit property support with per-unit allocation adjustments
- Renovation classification by category (kitchen, bathroom, flooring, etc.)
- NPV tax savings analysis at configurable discount rates
- Support for 5 residential building types

### Technical
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS styling
- better-sqlite3 database
- Zero external service dependencies for MVP
