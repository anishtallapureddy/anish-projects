# Metrics & Measurement Plan

> *Copy this template into your project folder. Define how you will measure success before you build.*

---

## KPIs

*Identify the key performance indicators for this project. Each KPI should be specific, measurable, and tied to a business or user outcome.*

| Metric | Definition | Target | Data Source | Frequency |
|---|---|---|---|---|
| *e.g., Activation Rate* | *% of new users who complete core action within 7 days* | *> 40%* | *Product analytics* | *Weekly* |
| *e.g., T2FR* | *Median time from sign-up to first report generated* | *< 5 min* | *Event logs* | *Weekly* |
| *e.g., Error Rate* | *% of API requests returning 5xx* | *< 0.5%* | *APM / App Insights* | *Daily* |
| | | | | |

## OKRs

*Map project metrics to broader team or company objectives.*

### Objective 1: *e.g., Make onboarding effortless*

| Key Result | Metric | Baseline | Target | Status |
|---|---|---|---|---|
| *KR1: Reduce time to first value* | *T2FR* | *12 min* | *5 min* | *On track / At risk / Met* |
| *KR2: Increase 7-day retention* | *D7 retention* | *30%* | *50%* | |
| | | | | |

### Objective 2: *e.g., [Your objective]*

| Key Result | Metric | Baseline | Target | Status |
|---|---|---|---|---|
| | | | | |

## Event Schema

*Define the analytics events you need to instrument. This is the contract between product and engineering.*

| Event Name | Trigger | Properties | Category |
|---|---|---|---|
| *e.g., `user_signed_up`* | *User completes registration* | *`method` (email/sso), `referrer`* | *Acquisition* |
| *e.g., `report_generated`* | *User clicks "Generate Report"* | *`report_type`, `duration_ms`* | *Activation* |
| *e.g., `feature_used`* | *User interacts with key feature* | *`feature_name`, `session_id`* | *Engagement* |
| | | | |

## Measurement Plan

*How will each KPI actually be tracked? This ensures nothing falls through the cracks.*

| KPI | Data Source | Method | Frequency | Owner |
|---|---|---|---|---|
| *Activation Rate* | *Mixpanel / App Insights* | *Funnel analysis: sign-up → core action* | *Weekly* | *PM* |
| *Revenue Impact* | *Billing system* | *Cohort comparison: pre/post launch* | *Monthly* | *Finance + PM* |
| *User Satisfaction* | *In-app survey* | *NPS survey triggered at day 14* | *Monthly* | *UXR* |
| | | | | |

## Notes

*Add any additional context: known data gaps, instrumentation dependencies, or metrics you intentionally chose not to track and why.*

- *e.g., We are not tracking X because...*
- *e.g., Data pipeline latency means daily metrics may lag by ~2 hours*
