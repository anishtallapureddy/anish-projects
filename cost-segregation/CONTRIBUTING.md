# Contributing to CostSeg Pro

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
git clone https://github.com/anishtallapureddy/anish-projects.git
cd anish-projects/cost-segregation
npm install
npm run dev
```
Open http://localhost:3000

### Database
The SQLite database is created automatically on first API request. To reset:
```bash
rm costseg.db*
```

## Project Structure
```
cost-segregation/
├── docs/                    # Product & technical documentation
│   ├── PRD.md              # Product Requirements Document
│   ├── METRICS.md          # Success metrics & event schema
│   ├── ROLLOUT.md          # Rollout plan & risk register
│   └── DECISIONS.md        # Architecture decision log
├── public/                  # Static assets
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   │   ├── properties/ # Property CRUD
│   │   │   └── reports/    # Report generation
│   │   ├── dashboard/      # User dashboard
│   │   ├── property/       # Property input wizard
│   │   └── report/[id]/    # Report viewer
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── forms/         # Form components
│   │   └── report/        # Report display components
│   └── lib/               # Core business logic
│       ├── classification.ts   # IRS component classification engine
│       ├── depreciation.ts     # MACRS depreciation calculator
│       ├── db.ts               # Database connection
│       └── db-setup.js         # Database schema setup
├── CONTRIBUTING.md
├── CHANGELOG.md
├── package.json
└── tsconfig.json
```

## Development Workflow

### Branch Naming
- `feature/short-description` — new features
- `fix/short-description` — bug fixes
- `docs/short-description` — documentation
- `refactor/short-description` — code improvements

### Commit Messages
Follow conventional commits:
- `feat: add PDF export functionality`
- `fix: correct 15-year MACRS rate calculation`
- `docs: update PRD with v1.1 requirements`
- `refactor: extract form validation logic`

### Pull Requests
1. Create a feature branch from `main`
2. Make changes with clear, atomic commits
3. Ensure `npm run build` passes
4. Open PR with description of changes
5. Request review

## Code Style
- TypeScript strict mode
- Functional components with hooks
- Named exports for library functions
- Tailwind CSS for all styling (no inline styles or CSS modules)

## Key Technical Notes

### Classification Engine (`src/lib/classification.ts`)
- Base allocation percentages are configurable per building type
- Feature-based adjustments add to the base allocation
- Renovations are classified based on category
- Remaining value goes to 27.5-year structural
- All percentages based on IRS Audit Technique Guide benchmarks

### Depreciation Calculator (`src/lib/depreciation.ts`)
- MACRS half-year convention rates
- Bonus depreciation phase-down: 80% (2023), 60% (2024), 40% (2025), 20% (2026), 0% (2027+)
- NPV calculation at configurable discount rate (default 6%)
