# User Scenarios & Non-Goals

## User Scenarios

### S1: First-Time Property Investor
**As a** residential property investor who just purchased a $450K rental property,  
**I want to** generate a cost segregation report without hiring a $5K engineering firm,  
**So that** I can accelerate depreciation and reduce my Year 1 tax bill by $30K+.

**Flow:** Land on marketing page → Enter property details (type, sqft, year, purchase price) → Select features (hardwood floors, landscaping, specialty lighting) → Generate report → View 5/7/15/27.5-year asset breakdowns → Download PDF → Share with CPA.

---

### S2: CPA Running Client Reports
**As a** CPA managing 20+ rental property clients,  
**I want to** batch-generate cost segregation analyses with my firm's branding,  
**So that** I can offer this as a value-add service without outsourcing to engineering firms.

**Flow:** Log in → Dashboard shows all client properties → Add new property → Generate report → Review IRS-compliant classifications → Export white-labeled PDF → Email to client.

---

### S3: Real Estate Portfolio Manager
**As a** portfolio manager with 50+ residential units,  
**I want to** see aggregated tax savings across my entire portfolio with year-over-year projections,  
**So that** I can make informed decisions about bonus depreciation timing before the phase-down.

**Flow:** Dashboard → Portfolio view → See total accelerated depreciation by year → Drill into individual properties → Compare scenarios (with/without bonus depreciation) → Export portfolio summary.

---

### S4: Property Owner Evaluating a Purchase
**As a** prospective buyer considering a $600K property,  
**I want to** estimate potential tax savings from cost segregation before closing,  
**So that** I can factor accelerated depreciation into my investment analysis.

**Flow:** Use free tier → Enter estimated property details → Get preliminary savings estimate → See "Upgrade for full report" prompt → Decide whether the investment pencils out.

---

### S5: Tax Professional Auditing a Report
**As a** tax professional reviewing a cost segregation report for IRS compliance,  
**I want to** verify that asset classifications follow IRS Audit Technique Guide percentages,  
**So that** I can confidently sign off on the depreciation schedule.

**Flow:** Open report → Review classification methodology → Check 5/7/15/27.5-year allocations against IRS benchmarks → Verify MACRS rates → Confirm bonus depreciation phase-down is current-year accurate → Approve.

---

### S6: Renovation Cost Segregation
**As a** property owner who just completed a $120K renovation,  
**I want to** classify only the renovation components (not the original building),  
**So that** I can accelerate depreciation on the improvement costs separately.

**Flow:** Select "Renovation" property type → Enter renovation cost and completion date → Select renovation components (new HVAC, flooring, electrical) → Generate renovation-only segregation report.

---

## Non-Goals

| ID | Non-Goal | Rationale |
|----|----------|-----------|
| NG-1 | **Commercial property support** | Commercial properties require engineering studies and on-site inspections. Our IRS rule-based approach is only validated for residential (1-4 unit) and small multi-family. |
| NG-2 | **Replace engineering firms for $1M+ properties** | High-value properties benefit from detailed component-level analysis that requires physical inspection. We target properties where the cost of a traditional study exceeds the ROI. |
| NG-3 | **Tax filing integration** | We generate reports, not tax returns. CPA workflow integration (e.g., direct export to Drake, ProConnect) is a future consideration, not MVP. |
| NG-4 | **State-specific depreciation rules** | MVP uses federal MACRS only. State conformity varies significantly; adding state rules increases scope 3x with marginal user value. |
| NG-5 | **Real-time IRS rule updates** | IRS Audit Technique Guide benchmarks change infrequently. Manual annual review is sufficient for MVP; automated rule ingestion is over-engineering. |
| NG-6 | **Multi-user collaboration** | MVP supports single-user workflow. Team/firm features (shared portfolios, role-based access) deferred to Pro tier. |
| NG-7 | **Mobile-first design** | Cost segregation is a desktop workflow (spreadsheets, PDF exports, CPA review). Mobile responsive is nice-to-have, not a priority. |
